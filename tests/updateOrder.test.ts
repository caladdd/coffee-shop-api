import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../src/lambdas/updateOrder';

const ddbMock = mockClient(DynamoDBDocumentClient);

describe('updateOrder', () => {
    const makeEvent: any = (id?: string, body?: any): any => ({
        pathParameters: id ? { id } : undefined,
        body: JSON.stringify(body)
    });
    const context: any = {};
    const callbackFunction = jest.fn();
    beforeEach(() => {
        ddbMock.reset();
        jest.restoreAllMocks();
    });

    it('returns 400 when id path param is missing', async () => {
        const event = makeEvent(undefined, {});

        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);        

        expect((res as any).statusCode).toBe(400);
        expect(body.message).toBe('id path param required');
    });

    it('returns 400 when no updatable fields provided', async () => {
        const event = makeEvent('order-123', { foo: 'bar' });

        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);
        
        expect((res as any).statusCode).toBe(400);
        expect(body.message).toBe('No updatable fields provided');
    });

    it('returns 200 when updates allowed fields', async () => {
        const attrs = { orderId: 'order-123', customerName: 'Juan', updatedAt: 'now' };
        ddbMock.on(UpdateCommand).resolves({ Attributes: attrs } as any);
        const event = makeEvent('order-123', { customerName: 'Juan' });

        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(200);
        expect(body.customerName).toBe('Juan');
        expect(ddbMock.commandCalls(UpdateCommand).length).toBe(1);
    });

    it('returns 404 when item was not found', async () => {
        ddbMock.on(UpdateCommand).resolves({} as any);
        const event = makeEvent('missing', { status: 'CANCELLED' });

        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(404);
        expect(body.message).toBe('Order not found');
    });

    it('returns 500 and logs on unknown/internal errors', async () => {
        const err = new Error('DB down');
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        ddbMock.on(UpdateCommand).rejects(err);
        const event = makeEvent('order-123', { status: 'CANCELLED' });

        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(500);
        expect(body.message).toBe('Internal Server Error');
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith('updateOrder error:', err);
    });
});