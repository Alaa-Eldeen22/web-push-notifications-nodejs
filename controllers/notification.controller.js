const notificationService = require('../services/notification.service');

/**
 * @function subscribe
 * @description Handles a request to subscribe a client to push notifications.
 * Expects a subscription object in the request body, with `endpoint` and `keys` (p256dh and auth).
 *
 * @route POST /notifications/subscribe
 * @param {Object} req - Express request object
 * @param {Object} req.body - The subscription data from the client
 * @param {Object} res - Express response object
 * @returns {Response} 201 if successful, 400 for invalid data, 500 for server error
 */
exports.subscribe = async (req, res) => {
	try {
		const subscription = req.body;

		if (!subscription || !subscription.endpoint || !subscription.keys) {
			return res.status(400).json({ message: 'Invalid subscription data.' });
		}

		const subscribed = await notificationService.subscribe(subscription);

		return subscribed ? res.status(201).json({ message: 'Subscription successful.' }) : res.status(200).json({ message: 'Subscription already exists.' }) ;
	} catch (error) {
		console.error('Subscribe error:', error);
		return res.status(500).json({ message: 'Failed to subscribe.' });
	}
};

/**
 * @function unsubscribe
 * @description Handles a request to unsubscribe a client from push notifications.
 * Requires the `endpoint` of the subscription to remove it from the database.
 *
 * @route POST /notifications/unsubscribe
 * @param {Object} req - Express request object
 * @param {string} req.body.endpoint - The endpoint of the subscription to remove
 * @param {Object} res - Express response object
 * @returns {Response} 200 if successful, 400 if endpoint is missing, 500 for server error
 */
exports.unsubscribe = async (req, res) => {
	try {
		const { endpoint } = req.body;

		if (!endpoint) {
			return res
				.status(400)
				.json({ message: 'Endpoint is required to unsubscribe.' });
		}

		const unsubscribed = await notificationService.unsubscribe(endpoint);

		return unsubscribed ? res.status(200).json({ message: 'Unsubscribed successfully.' }) : res.status(404).json({ message: 'Subscription not found.' });
	} catch (error) {
		console.error('Unsubscribe error:', error);
		return res.status(500).json({ message: 'Failed to unsubscribe.' });
	}
};

/**
 * @function sendNotification
 * @description Sends a push notification to all currently subscribed clients.
 * Currently uses a hardcoded payload, but can be adapted to accept custom payloads from the client.
 *
 * @route POST /notifications/send
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @returns {Response} 200 if notifications sent, 500 for server error
 */
exports.sendNotification = async (req, res) => {
	try {
		// Example static payload; you could replace this with req.body.payload in the future
		const payload = {
			title: 'Notification',
			content: 'This is a push notification',
		};

		await notificationService.sendNotification(payload);

		return res.status(200).json({ message: 'Notifications sent.' });
	} catch (error) {
		console.error('Send notification error:', error);
		return res.status(500).json({ message: 'Failed to send notifications.' });
	}
};
