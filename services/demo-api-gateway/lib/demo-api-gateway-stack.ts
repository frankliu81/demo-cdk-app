import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
// import * as sqs from 'aws-cdk-lib/aws-sqs';

export class DemoApiGatewayStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const restApi = new apigateway.RestApi(this, "demo-api", {
      restApiName: "Demo API",
      description: "This service serves multiple services"
    });
    
    const mockIntegration = new apigateway.MockIntegration();
    const v1Resource = new apigateway.Resource(this, "v1Resource", {
      parent: restApi.root,
      pathPart: "v1",
      defaultIntegration: mockIntegration,
    });
    v1Resource.addMethod("OPTIONS", mockIntegration);

    // https://stackoverflow.com/questions/65706835/how-to-use-aws-cdk-to-look-up-existing-apigateway
    new cdk.CfnOutput(this, 'demo-api-export', {
      exportName: 'demo-api-id',
      value: restApi.restApiId,
    });
    
    new cdk.CfnOutput(this, 'demo-api-v1-resource-export', {
      exportName: 'demo-api-v1-resource-id',
      value: v1Resource.resourceId,
    });

    new cdk.CfnOutput(this, 'demo-api-root-resource-export', {
      exportName: 'demo-api-root-resource-id',
      value: restApi.root.resourceId,
    });

  }
}
