import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, ORDERS_TABLE } from '../lib/dynamo';
import { respond } from '../utils/utils';

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        const id = event.pathParameters?.id;
        if (!id) return respond(400, { message: 'id path param required' });

        await dynamoDB.send(
            new DeleteCommand({
                TableName: ORDERS_TABLE,
                Key: { orderId: id }
            })
        );

        return respond(204, { message: 'Order deleted successfully' });
    } catch (err) {
        const status = (err as any)?.statusCode ?? 500;
        if (status === 500) {
            console.error('deleteOrder error:', err);
            return respond(500, { message: 'Internal Server Error' });
        }
        return respond(status, { message: (err as Error).message });
    }
};