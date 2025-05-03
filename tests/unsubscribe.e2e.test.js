const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../tests/.env.test') });

const request = require('supertest');
const express = require('express');
const bodyParser = require('express').json;
const notificationRoutes = require('../routes/notification.routes');
const Subscription = require('../models/Subscription.model');

// Set up express app with the routes
const app = express();
app.use(bodyParser());
app.use('/notifications', notificationRoutes);

/**
 * Mock the Subscription model and all operations on it.
 * We do this to save database calls which may affect the time of the tests.
 */
jest.mock('../models/Subscription.model');

describe('POST /notifications/unsubscribe', () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    /**
     * In this scenario, we send an empty request body which will return message that endpoint is required.
     */
    it('Should return message with "Endpoint is required to unsubscribe" with 400 status code', async () =>
    {
        const notValidRequestBody = {};
        const res = await request(app)
            .post('/notifications/unsubscribe')
            .send(notValidRequestBody)
            .expect(400);

        expect(res.body).toEqual({ message: 'Endpoint is required to unsubscribe.' });
    });

    /**
     * Happy scenario when the client send valid request body and the endpoint in it matches a row in our DB.
     */
    it('Should return OK with 200 status code as unsubscription is done successfully.', async () =>
    {
        Subscription.findOne = jest.fn().mockResolvedValueOnce({
            endpoint: "https://example.com",
            p256dh: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            auth: 'abcdefghijklmnopqrstuvwxyz',
            destroy: jest.fn().mockResolvedValue(),
        });

        const validRequestBody = {
            endpoint: "https://example.com"
        };

        const res = await request(app)
            .post('/notifications/unsubscribe')
            .send(validRequestBody)
            .expect(200);

        expect(res.body).toEqual({ message: 'Unsubscribed successfully.' });
    });

    /**
     * In this scenario, the client send a not valid endpoint in the request body that doesn't match
     * the endpoint of any records in our DB.
     */
    it('Should not found the subscription as the request body contains a not exist endpoint.', async () =>
    {
        Subscription.findOne = jest.fn().mockResolvedValueOnce(null);

        const validRequestBody = {
            endpoint: "https://example.com"
        };
        const res = await request(app)
            .post('/notifications/unsubscribe')
            .send(validRequestBody)
            .expect(404);

        expect(res.body).toEqual({ message: 'Subscription not found.' });
    });
});