import { APIGatewayProxyHandlerV2 } from 'aws-lambda';
import { PutCommand } from '@aws-sdk/lib-dynamodb';
import { dynamoDB, ORDERS_TABLE } from '../lib/dynamo';
import { respond } from '../utils/utils';
import { v4 as uuidv4 } from 'uuid';
import { Order } from '../types';

type CreateOrderInput = {
    customerName: string;
    coffeeType: string;
};

const validateInput = (input: unknown): CreateOrderInput => {
    let body: any = input;

    const customerName =
        typeof body?.customerName === 'string' ? body.customerName.trim() : '';
    const coffeeType =
        typeof body?.coffeeType === 'string' ? body.coffeeType.trim() : '';

    if (!customerName || !coffeeType) {
        const e = new Error('customerName and coffeeType are required');
        (e as any).statusCode = 400;
        throw e;
    }

    return { customerName, coffeeType };
};

export const handler: APIGatewayProxyHandlerV2 = async (event) => {
    try {
        if (event.requestContext.http.method !== 'POST') {
            return respond(405, { message: 'Method Not Allowed' });
        }

        const payload = event.body ?? '{}';
        const { customerName, coffeeType } = validateInput(payload);

        const now = new Date().toISOString();
        const order: Order = {
            orderId: uuidv4(),
            customerName,
            coffeeType,
            status: 'PENDING',
            createdAt: now,
            updatedAt: now,
        };

        // Ensure we never overwrite if the key somehow exists (defensive).
        await dynamoDB.send(
            new PutCommand({
                TableName: ORDERS_TABLE,
                Item: order,
                ConditionExpression: 'attribute_not_exists(orderId)',
            })
        );

        return respond(201, { order });
    } catch (err) {
        const status = (err as any)?.statusCode ?? 500;
        if (status === 500) {
            console.error('createOrder error:', err);
            return respond(500, { message: 'Internal Server Error' });
        }
        return respond(status, { message: (err as Error).message });
    }
};