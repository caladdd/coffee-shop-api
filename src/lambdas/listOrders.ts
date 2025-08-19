import { APIGatewayProxyHandlerV2 } from 'aws-lambda';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
  try {
    return { statusCode: 200, body: JSON.stringify({ }) };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ message: 'Internal Server Error' }) };
  }
};