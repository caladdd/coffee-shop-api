import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, ORDERS_TABLE } from '../lib/dynamo';
import { respond } from '../utils/utils';

type UpdatableField = 'customerName' | 'coffeeType' | 'status';
const ALLOWED_FIELDS: readonly UpdatableField[] = ['customerName', 'coffeeType', 'status'] as const;

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    const id = event.pathParameters?.id;
    if (!id) return respond(400, { message: 'id path param required' });

    const body = event.body ? JSON.parse(event.body) : {};
    const fields = (Object.keys(body) as UpdatableField[]).filter((k) => ALLOWED_FIELDS.includes(k));
    if (fields.length === 0) return respond(400, { message: 'No updatable fields provided' });

    const now = new Date().toISOString();

    const exprAttrNames: Record<string, string> = { '#updatedAt': 'updatedAt' };
    const exprAttrValues: Record<string, unknown> = { ':updatedAt': now };
    const sets: string[] = [];

    for (const f of fields) {
        const nameKey = `#${f}`;
        const valueKey = `:${f}`;
        exprAttrNames[nameKey] = f;
        exprAttrValues[valueKey] = body[f];
        sets.push(`${nameKey} = ${valueKey}`);
    }
    sets.push('#updatedAt = :updatedAt');

    try {
        const res = await dynamoDB.send(new UpdateCommand({
            TableName: ORDERS_TABLE,
            Key: { orderId: id },
            UpdateExpression: `SET ${sets.join(', ')}`,
            ExpressionAttributeNames: exprAttrNames,
            ExpressionAttributeValues: exprAttrValues,
            ReturnValues: 'ALL_NEW',
        }));

        if (!res.Attributes) return respond(404, { message: 'Order not found' });
        return respond(200, { ...res.Attributes });
    } catch (err: any) {
        const status = (err as any)?.statusCode ?? 500;
        if (status === 500) {
            console.error('updateOrder error:', err);
            return respond(500, { message: 'Internal Server Error' });
        }
        return respond(status, { message: (err as Error).message });
    }
};