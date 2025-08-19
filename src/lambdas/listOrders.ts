import type { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { ScanCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, ORDERS_TABLE } from '../lib/dynamo';
import { respond } from '../utils/utils';

export const handler: APIGatewayProxyHandlerV2 = async () => {
    try {
        const { Items } = await dynamoDB.send(
            new ScanCommand({ TableName: ORDERS_TABLE })
        );
        return respond(200, Items ?? []);
    } catch (err) {
        const status = (err as any)?.statusCode ?? 500;
        if (status === 500) {
            console.error('listOrders error:', err);
            return respond(500, { message: 'Internal Server Error' });
        }
        return respond(status, { message: (err as Error).message });
    }
};