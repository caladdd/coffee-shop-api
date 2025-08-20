import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../src/lambdas/deleteOrder';

const ddbMock = mockClient(DynamoDBDocumentClient);
describe('deleteOrder', () => {
    const event: any = {};
    const context: any = {};
    const callbackFunction = jest.fn();
    beforeEach(() => {
        ddbMock.reset();
        jest.restoreAllMocks();
    });

    it('returns 400 when id path param is missing', async () => {
        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(400);
        expect(body).toEqual({ message: 'id path param required' });
        expect(ddbMock.commandCalls(DeleteCommand).length).toBe(0);
    });

    it('returns 204 when deletes an order', async () => {
        ddbMock.on(DeleteCommand).resolves({} as any);

        const res = await handler({ pathParameters: { id: 'order-123' } } as any, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(204);
        expect(body).toEqual({ message: 'Order deleted successfully' });
        expect(ddbMock.commandCalls(DeleteCommand).length).toBe(1);
    });

    it('returns 500 and logs on unknown/internal errors', async () => {
        const err = new Error('DB down');
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        ddbMock.on(DeleteCommand).rejects(err);

        const res = await handler({ pathParameters: { id: 'order-123' } } as any, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(500);
        expect(body).toEqual({ message: 'Internal Server Error' });
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith('deleteOrder error:', err);
    });
});