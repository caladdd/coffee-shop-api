import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

const ddb = new DynamoDBClient({});
export const dynamoDB = DynamoDBDocumentClient.from(ddb, {
  marshallOptions: { removeUndefinedValues: true }
});

export const ORDERS_TABLE = process.env.ORDERS_TABLE!;