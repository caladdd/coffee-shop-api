import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb';
import { handler } from '../src/lambdas/createOrder';

const ddbMock = mockClient(DynamoDBDocumentClient as any);
describe('createOrder', () => {
    const makeEvent: any = (body: any): any => ({ body: JSON.stringify(body) });
    const context: any = {};
    const callbackFunction = jest.fn();

    beforeEach(() => {
        ddbMock.reset();
    });

    test('returns 400 when both customerName and coffeeType are missing', async () => {
        const event = makeEvent({});
        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);
        
        expect((res as any).statusCode).toBe(400);
        expect(body.message).toBe('customerName and coffeeType are required');
        expect(ddbMock.commandCalls(PutCommand).length).toBe(0);
    });

    test('returns 400 when customerName is missing', async () => {
        const event = makeEvent({ coffeeType: 'Americano' });
        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);
        
        expect((res as any).statusCode).toBe(400);
        expect(body.message).toBe('customerName and coffeeType are required');
        expect(ddbMock.commandCalls(PutCommand).length).toBe(0);
    });

    test('returns 400 when coffeeType is missing', async () => {
        const event = makeEvent({ customerName: 'Juan' });
        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);
        
        expect((res as any).statusCode).toBe(400);
        expect(body.message).toBe('customerName and coffeeType are required');
        expect(ddbMock.commandCalls(PutCommand).length).toBe(0);
    });

    test('returns 400 when input is only whitespace', async () => {
        const event = makeEvent({ customerName: '   ', coffeeType: '   ' });
        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);
        
        expect((res as any).statusCode).toBe(400);
        expect(body.message).toBe('customerName and coffeeType are required');
        expect(ddbMock.commandCalls(PutCommand).length).toBe(0);
    });

    test('returns 201 when valid trimmed input', async () => {
        ddbMock.on(PutCommand).resolves({} as any);
        const event = makeEvent({ customerName: '  Juan  ', coffeeType: '  Americano ' });
        const res = await handler(event, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(201);
        expect(body.order).toHaveProperty('orderId');
        expect(body.order.customerName).toBe('Juan');
        expect(body.order.coffeeType).toBe('Americano');
        expect(body.order.status).toBe('PENDING');
        expect(ddbMock.commandCalls(PutCommand).length).toBe(1);
    });

    test('returns 400 when body is missing', async () => {
        const res = await handler({ requestContext: { http: { method: 'POST' } } } as any, context, callbackFunction);
        const body = JSON.parse((res as any).body);

        expect((res as any).statusCode).toBe(400);
        expect(body.message).toBe('customerName and coffeeType are required');
        expect(ddbMock.commandCalls(PutCommand).length).toBe(0);
    });
});