import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../src/lambdas/getOrder';

const ddbMock = mockClient(DynamoDBDocumentClient);
describe('getOrder', () => {
    const event: any = {};
    const context: any = {};
    const callbackFunction = jest.fn();
    beforeEach(() => {
        ddbMock.reset();
    });

    it('returns 400 when id path param is missing', async () => {
        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(400);
        expect(body).toEqual({ message: 'id path param required' });
        expect(ddbMock.commandCalls(GetCommand).length).toBe(0);        
    });

    it('returns 404 when order is not found', async () => {
        ddbMock.on(GetCommand).resolves({});

        const res = await handler({ pathParameters: { id: 'order-1' } } as any, context, callbackFunction);
        const body = JSON.parse((res as any).body);
        
        expect((res as any).statusCode).toBe(404);
        expect(body).toEqual({ message: 'Order not found' });
        expect(ddbMock.commandCalls(GetCommand).length).toBe(1);
    });

    it('returns 200 with the order item when found', async () => {
        const item = { orderId: 'order-2', status: 'PENDING' };
        ddbMock.on(GetCommand).resolves({ Item: item });

        const res = await handler({ pathParameters: { id: 'order-2' } } as any, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(200);
        expect(body).toEqual(item);
        expect(ddbMock.commandCalls(GetCommand).length).toBe(1);
    });

    it('returns 500 and logs on unknown/internal errors', async () => {
        const err = new Error('DB down');
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        ddbMock.on(GetCommand).rejects(err);

        const res = await handler({ pathParameters: { id: 'order-4' } } as any, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(500);
        expect(body).toEqual({ message: 'Internal Server Error' });
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith('getOrder error:', err);
    });
});