import { APIGatewayProxyResultV2 } from 'aws-lambda';

const JSON_HEADERS = {
    'Content-Type': 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': 'true',
};

export const respond = (statusCode: number, body: unknown): APIGatewayProxyResultV2 => ({
    statusCode,
    headers: JSON_HEADERS,
    body: JSON.stringify(body),
});