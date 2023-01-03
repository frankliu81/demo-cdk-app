import { Duration, Stack, StackProps } from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as logs from "aws-cdk-lib/aws-logs";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as ssm from "aws-cdk-lib/aws-ssm";
import { Construct } from "constructs";
import {
  API_GATEWAY_CORS_HEADERS,
  ORIGINS,
  METHODS,
  PUBLIC_API_ALLOWED_CORS_HEADERS_CORS,
} from "./http";

export type JobiApiGatewayStackProps = StackProps & {
  scope: string;
};

export class JobiApiGateway extends Stack {
  constructor(
    scope?: Construct,
    id?: string,
    props?: JobiApiGatewayStackProps
  ) {
    super(scope, id, props);

    const logGroup = new logs.LogGroup(this, "logGroup", {
      retention: logs.RetentionDays.SIX_MONTHS,
    });

    const restApi = new apiGateway.RestApi(this, "restApi", {
      restApiName: `jobi-${scope}`,
      description: `Testing dynamic route adding to the API gateway (${scope})`,

      defaultMethodOptions: {
        authorizationType: apiGateway.AuthorizationType.NONE,
      },

      defaultCorsPreflightOptions: {
        allowOrigins: [...ORIGINS],
        allowMethods: [...METHODS],
        allowHeaders: [...PUBLIC_API_ALLOWED_CORS_HEADERS_CORS],
        allowCredentials: true,
        maxAge: Duration.hours(1),
      },

      deployOptions: {
        /* Naming */
        description: "Main Stage",

        /* Logging */
        loggingLevel: apiGateway.MethodLoggingLevel.INFO,
        accessLogDestination: new apiGateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apiGateway.AccessLogFormat.jsonWithStandardFields({
          caller: false,

          httpMethod: true,
          ip: true,
          // DM: HTTPs is enforced
          protocol: false,
          requestTime: true,
          resourcePath: true,
          responseLength: true,
          status: true,
          user: true,
        }),
        metricsEnabled: true,
        tracingEnabled: true,
        dataTraceEnabled: true,
      },

      cloudWatchRole: true,
      // only on production
      retainDeployments: true,
    });

    /* ********************************* */
    /* Map default API gateway responses */
    /* ********************************* */
    (
      [
        apiGateway.ResponseType.UNAUTHORIZED,
        apiGateway.ResponseType.DEFAULT_5XX,
        apiGateway.ResponseType.DEFAULT_4XX,
      ] as Array<apiGateway.ResponseType>
    ).forEach((type) => {
      let statusCode: string | undefined = undefined;

      switch (type) {
        case apiGateway.ResponseType.UNAUTHORIZED:
        case apiGateway.ResponseType.DEFAULT_4XX:
        case apiGateway.ResponseType.DEFAULT_5XX: {
          statusCode = undefined; // DO NOT CHANGE DEFAULT STATUS CODE
          break;
        }

        default: {
          throw new Error(
            `No status code found for response type '${type.responseType}'`
          );
        }
      }

      restApi.addGatewayResponse(`restApiGatewayResponse${type.responseType}`, {
        statusCode,
        type,

        responseHeaders: {
          ...API_GATEWAY_CORS_HEADERS,
        },
      });
    });

    new ssm.StringParameter(this, "restApiId", {
      parameterName: `/jobi/${props!.scope}/api_gateway_id`,
      stringValue: restApi.restApiId,
    });

    // DN: We can't load/lookup authorizer by its id or ARN so we don't need to save it
    const publicApiCognitoAuthorizer =
      new apiGateway.CognitoUserPoolsAuthorizer(
        this,
        "publicApiCognitoAuthorizer",
        {
          cognitoUserPools: [
            cognito.UserPool.fromUserPoolId(
              this,
              "publicApiCognitoAuthorizerUserPool1",
              this.node.tryGetContext("cognitoUserPoolId")
            ),
          ],
        }
      );

    // DM: We need to have authorizer bound to one method at least
    //     and since in deployment time of this stack, no route is added yet,
    //     we add this dummy route which always respond 204 (without content)
    //     to any authorized requests.
    restApi.root.addMethod(
      "GET",
      new apiGateway.MockIntegration({
        integrationResponses: [
          {
            statusCode: "200",
          },
        ],
        passthroughBehavior: apiGateway.PassthroughBehavior.NEVER,
        requestTemplates: {
          "application/json": '{ "statusCode": 200 }',
        },
      }),
      {
        methodResponses: [{ statusCode: "200" }],
        authorizationType: apiGateway.AuthorizationType.COGNITO,
        authorizer: publicApiCognitoAuthorizer,
      }
    );

    // DM: We can lookup with pathPart property, so don't need to be saved.
    new apiGateway.Resource(this, "apiGatewayV1Resource", {
      parent: restApi.root,
      pathPart: "v1",
    });
  }
}
