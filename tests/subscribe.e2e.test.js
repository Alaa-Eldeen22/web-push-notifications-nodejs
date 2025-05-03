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
 * Mock the Subscription model and all DB operations on it.
 * We do this to save database calls which may affect the time of our tests.
 */
jest.mock('../models/Subscription.model');

describe('POST /notifications/subscribe', () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    /**
     * In this scenario, we send an empty request body which will return message with is invalid.
     */
    it('Should return message with \"Invalid Subscription Data\" with 400 status code', async () =>
    {
        const notValidSubscription = null;

        const res = await request(app)
            .post('/notifications/subscribe')
            .send(notValidSubscription)
            .expect(400);

        expect(res.body).toEqual({ message: 'Invalid subscription data.' });
    });

    /**
     * In this scenario, we send the subscription object without endpoint which is invalid.
     */
    it('Should return message with \"Invalid Subscription Data\" with 400 status code', async () =>
    {
        const notValidSubscription = {
            keys: {
                p256dh: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                auth: 'abcdefghijklmnopqrstuvwxyz'
            }
        };

        const res = await request(app)
            .post('/notifications/subscribe')
            .send(notValidSubscription)
            .expect(400);

        expect(res.body).toEqual({ message: 'Invalid subscription data.' });
    });

    /**
     * In this scenario, we send the subscription object without keys which is invalid.
     */
    it('Should return message with \"Invalid Subscription Data\" with 400 status code', async () =>
    {
        const notValidSubscription = {
            endpoint: "http://example.com",
        };

        const res = await request(app)
            .post('/notifications/subscribe')
            .send(notValidSubscription)
            .expect(400);

        expect(res.body).toEqual({ message: 'Invalid subscription data.' });
    });

    /**
     * Happy scenario when the user send valid data and subscription created & saved to DB successfully.
     */
    it('Should save a valid subscription and return 201', async () =>
    {
        // This mocks the creation of the new Subscription.
        Subscription.create.mockResolvedValueOnce({});

        const validSubscription = {
            endpoint: 'https://example.com',
            keys: {
                p256dh: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                auth: 'abcdefghijklmnopqrstuvwxyz'
            }
        };

        const res = await request(app)
            .post('/notifications/subscribe')
            .send(validSubscription)
            .expect(201);

        expect(Subscription.create).toHaveBeenCalledWith({
            endpoint: validSubscription.endpoint,
            p256dh: validSubscription.keys.p256dh,
            auth: validSubscription.keys.auth,
        });

        expect(res.body).toEqual({ message: 'Subscription successful.' });
    });

    /**
     * In this scenario, we hit our API with endpoint already exist in the DB so it doesn't create new subscription.
     */
    it('Should not save a new subscription and return 200 with \"Subscription already exists\" message', async () =>
    {
        // Mock the findOne() db call to get the same endpoint sent within the request body.
        Subscription.findOne = jest.fn().mockResolvedValueOnce({
            endpoint: 'https://duplicateURL.com',
            p256dh: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
            auth: 'abcdefghijklmnopqrstuvwxyz'
        });

        const validSubscription = {
            endpoint: 'https://duplicateURL.com',
            keys: {
                p256dh: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
                auth: 'abcdefghijklmnopqrstuvwxyz'
            }
        };

        const res = await request(app)
            .post('/notifications/subscribe')
            .send(validSubscription)
            .expect(200);

        expect(res.body).toEqual({ message: 'Subscription already exists.' });
    });
});
