import {
  APIGatewayProxyEvent,
  Context,
  APIGatewayProxyResult,
} from "aws-lambda";

export const handler = async (
  e: APIGatewayProxyEvent,
  c: Context
): Promise<APIGatewayProxyResult> => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      service: "service_1",
      route: e.path,
      scope: process.env.CDK_SCOPE,
    }),
  };
};
