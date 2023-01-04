import { join as joinPath } from "node:path";
import { Stack, StackProps } from "aws-cdk-lib";
import { NodejsFunction } from "aws-cdk-lib/aws-lambda-nodejs";
import * as lambda from "aws-cdk-lib/aws-lambda";
import { Construct } from "constructs";
import * as apiGateway from "aws-cdk-lib/aws-apigateway";
import * as cdk from "aws-cdk-lib";
import * as cognito from "aws-cdk-lib/aws-cognito";
import * as ssm from "aws-cdk-lib/aws-ssm";

export type RoutesStackProps = StackProps & {
  scope: string;
};

export class RoutesStack extends Stack {
  constructor(scope?: Construct, id?: string, props?: RoutesStackProps) {
    super(scope, id, props);

    const lambdaFunction = new NodejsFunction(this, "fn1", {
      runtime: lambda.Runtime.NODEJS_16_X,
      entry: joinPath(__dirname, "../src/index.ts"),
      handler: "handler",
      bundling: {
        externalModules: ["aws-sdk"],
      },

      environment: {
        CDK_SCOPE: props!.scope,
      },
    });

    const restApiId = ssm.StringParameter.valueForStringParameter(
      this,
      `/jobi/${props!.scope}/api_gateway_id`
    );
    const rootResourceId = ssm.StringParameter.valueForStringParameter(
      this,
      `/jobi/${props!.scope}/api_gateway_root_resource_id`
    );
    const v1ResourceId = ssm.StringParameter.valueForStringParameter(
      this,
      `/jobi/${props!.scope}/api_gateway_v1_resource`
    );

    const restApi = apiGateway.RestApi.fromRestApiAttributes(this, "restApi", {
      restApiId,
      rootResourceId,
    });

    const stage = apiGateway.Stage.fromStageAttributes(this, "prodStage", {
      restApi,
      stageName: "prod",
    });

    const v1Resource = apiGateway.Resource.fromResourceAttributes(
      this,
      "v1Resource",
      {
        restApi: stage.restApi,
        resourceId: v1ResourceId,
        path: "/v1",
      }
    );

    const service1Resource = v1Resource.addResource("service-1");

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

    const feature1Resource = service1Resource.addResource("feature-1");

    feature1Resource.addMethod(
      "GET",
      new apiGateway.LambdaIntegration(lambdaFunction),
      {
        authorizationType: apiGateway.AuthorizationType.COGNITO,
        authorizer: publicApiCognitoAuthorizer,
      }
    );

    const feature2Resource = service1Resource.addResource("feature-2");

    feature2Resource.addMethod(
      "GET",
      new apiGateway.LambdaIntegration(lambdaFunction),
      {
        authorizationType: apiGateway.AuthorizationType.COGNITO,
        authorizer: publicApiCognitoAuthorizer,
      }
    );

    const feature3Resource = service1Resource.addResource("feature-3");

    feature3Resource.addMethod(
      "GET",
      new apiGateway.LambdaIntegration(lambdaFunction),
      {
        authorizationType: apiGateway.AuthorizationType.COGNITO,
        authorizer: publicApiCognitoAuthorizer,
      }
    );
  }
}
