import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import {FunctionUrlAuthType, Runtime} from "aws-cdk-lib/aws-lambda";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as path from 'path';


// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DemoService1Stack extends cdk.Stack {

  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // BotToken / SigningSecret is what I defined in secrets manager
    const lambdaFunction = new NodejsFunction(this, "demo-service-1", {
      runtime: Runtime.NODEJS_16_X,
      entry: path.join(__dirname, "../src/index.ts"),
      handler: 'handler', // this string should match the exports in lambda
      bundling: {
        externalModules: ['aws-sdk']
      },
      
      environment: {
       CDK_SCOPE: process.env.CDK_SCOPE!,
      }
    });


    // https://stackoverflow.com/questions/65706835/how-to-use-aws-cdk-to-look-up-existing-apigateway
    // export comes from the demo-api-gateway-stack
    const v1RestApi = apigateway.RestApi.fromRestApiAttributes(this, "v1-demo-api", {
      restApiId: cdk.Fn.importValue('demo-api-id'),
      rootResourceId: cdk.Fn.importValue('demo-api-v1-resource-id'),
    });

    const service1ntegration = new apigateway.LambdaIntegration(lambdaFunction);

    const service1Resource = new apigateway.Resource(this, "service1Resource", {
      parent: v1RestApi.root,
      pathPart: "service1",
    });

    service1Resource.addMethod('ANY', service1ntegration);

    // fromRestApiAttributes does not automatically deploy API stage:
    // https://github.com/aws/aws-cdk/issues/13526
    // deploy against exsiting stage:
    // https://stackoverflow.com/questions/63950199/how-to-use-an-existing-stage-in-api-gateway-deployments-in-aws-cdk

    const deployment = new apigateway.Deployment(this, 'APIGatewayDeployment', {
      api: apigateway.RestApi.fromRestApiId(this, 'RestApi', cdk.Fn.importValue('demo-api-id')),
      description: 'This service serves multiple services'
    });
    
    (deployment as any).resource.stageName = 'prod';



    // Testing 1: Function url uses ABI Gateway's Lambda Payload format 2.0, which is not compatiable with REST API:
    // https://medium.com/@lancers/aws-lambda-function-urls-another-way-to-create-http-endpoint-for-a-lambda-function-e991185aa488
    // const fnUrl = lambdaFunction.addFunctionUrl({
    //     authType: FunctionUrlAuthType.NONE
    // })

    // new cdk.CfnOutput(this, 'Service1LambaFunctionUrl ', {
    //     value: fnUrl.url
    // })

    // Testing 2: service1 as mock integration
    // const mockIntegration = new apigateway.MockIntegration();
    // const v1Resource = new apigateway.Resource(this, "service1", {
    //   parent: v1RestApi.root,
    //   pathPart: "service1",
    //   defaultIntegration: mockIntegration,
    // });
    // v1Resource.addMethod("OPTIONS", mockIntegration);
    
    
  }
}
