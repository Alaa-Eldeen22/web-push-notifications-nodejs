const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../tests/.env.test') });

const request = require('supertest');
const express = require('express');
const bodyParser = require('express').json;
const notificationRoutes = require('../routes/notification.routes');
const Subscription = require('../models/Subscription.model');
const webpush = require('web-push');

// Set up express app with the routes
const app = express();
app.use(bodyParser());
app.use('/notifications', notificationRoutes);

// For testing this endpoing, we'll mock the DB calls & web-push service.
jest.mock('../models/Subscription.model');
jest.mock('web-push');

describe('POST /notifications/send', () =>
{
    beforeEach(() =>
    {
        jest.clearAllMocks();
    });

    /**
     * Should return OK when notifications are sent successfully.
     */
    it('Should return message with "Notifications sent." with 200 status code', async () =>
    {
        Subscription.findAll = jest.fn().mockResolvedValueOnce([
            {
                endpoint: 'https://example.com/1',
                p256dh: 'KEY1',
                auth: 'AUTH1'
            },
            {
                endpoint: 'https://example.com/2',
                p256dh: 'KEY2',
                auth: 'AUTH2'
            }
        ]);

        // Mock webpush sending notifications.
        webpush.sendNotification = jest.fn().mockResolvedValue();

        const res = await request(app)
            .post('/notifications/send')
            .expect(200);

        expect(res.body).toEqual({ message: 'Notifications sent.' });
        expect(webpush.sendNotification).toHaveBeenCalledTimes(2);
    });

    /**
     * It should still return OK when some subscriptions are expired and deleted.
     * In this scenario, the web-push service return 410 but still our notification
     * service returns 200 OK status code (as the implementation).
     */
    it('Should delete invalid subscriptions and return 200', async () =>
    {
        Subscription.findAll = jest.fn().mockResolvedValueOnce([
            {
                endpoint: 'https://expired.com',
                p256dh: 'EXPIREDKEY',
                auth: 'EXPIREDAUTH'
            }
        ]);

        // Mock web-push to return 410 status code as the subscription expired.
        webpush.sendNotification = jest.fn().mockRejectedValueOnce({
            statusCode: 410
        });

        Subscription.destroy = jest.fn().mockResolvedValue();

        const res = await request(app)
            .post('/notifications/send')
            .expect(200);

        expect(res.body).toEqual({ message: 'Notifications sent.' });
        expect(Subscription.destroy).toHaveBeenCalledWith({ where: { endpoint: 'https://expired.com' } });
    });
});
