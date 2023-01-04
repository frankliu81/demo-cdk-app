# demo-cdk-app

Microservices demo in AWS CDK

## How to deploy the changes on API gateway

```sh
# Create a deployment and you'll get a
aws-vault exec spg-energy-playground -- aws apigateway create-deployment --rest-api-id <your-rest-api-id> --region <ca-central-1></ca-central-1>

# You'll get the deployment
createdDate: '2023-01-03T14:02:09-08:00'
id: <deployment-id>

# Update the stage (use the generated deployment from the previous command)
aws-vault exec spg-energy-playground -- aws apigateway update-stage --region ca-central-1 --rest-api-id <your-rest-api-id> --stage-name <stage-name> --patch-operations op='replace',path='/deploymentId',value=<deployment-id>
```
