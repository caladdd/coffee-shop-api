import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { GetCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, ORDERS_TABLE } from '../lib/dynamo';
import { respond } from '../utils/utils';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        const id = event.pathParameters?.id;
        if (!id) return respond(400, { message: 'id path param required' });

        const res = await dynamoDB.send(
            new GetCommand({
                TableName: ORDERS_TABLE,
                Key: { orderId: id },
            }),
        );

        if (!res.Item) return respond(404, { message: 'Order not found' });
        return respond(200, res.Item);
    } catch (err) {
        const status = (err as any)?.statusCode ?? 500;
        if (status === 500) {
            console.error('getOrder error:', err);
            return respond(500, { message: 'Internal Server Error' });
        }
        return respond(status, { message: (err as Error).message });
    }
};