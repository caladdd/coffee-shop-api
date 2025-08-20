import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../src/lambdas/listOrders';

const ddbMock = mockClient(DynamoDBDocumentClient);
describe('listOrders', () => {
    const event: any = {};
    const context: any = {};
    const callbackFunction = jest.fn();
    beforeEach(() => {
        ddbMock.reset();
        jest.restoreAllMocks();
    });

    it('returns 200 and items from DynamoDB', async () => {
        const items = [{ id: '1' }, { id: '2' }];
        ddbMock.on(ScanCommand).resolves({ Items: items });

        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(200);
        expect(body).toEqual(items);
        expect(ddbMock.commandCalls(ScanCommand)).toHaveLength(1);
    });

    it('returns 200 and empty array when no items are found', async () => {
        ddbMock.on(ScanCommand).resolves({});

        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(200);
        expect(body).toEqual([]);
        expect(ddbMock.commandCalls(ScanCommand)).toHaveLength(1);
    });

    it('returns 500 and logs on unknown/internal errors', async () => {
        const err = new Error('DB down');
        const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        ddbMock.on(ScanCommand).rejects(err);

        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(500);
        expect(body).toEqual({ message: 'Internal Server Error' });
        expect(errorSpy).toHaveBeenCalledTimes(1);
        expect(errorSpy).toHaveBeenCalledWith('listOrders error:', err);
    });
});