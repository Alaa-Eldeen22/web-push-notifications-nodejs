const Subscription = require('../models/Subscription.model');
const webpush = require('./webpush.service');

// Save a new push subscription in the database
exports.subscribe = async (subscription) => {
	const subscriptionRecord = await Subscription.findOne({ where: { endpoint: subscription.endpoint } });

	if (!subscriptionRecord){
		await Subscription.create({
			endpoint: subscription.endpoint,
			p256dh: subscription.keys.p256dh,
			auth: subscription.keys.auth,
		});
		return true;
	}

	return false;
};

// Remove a subscription based on the endpoint
exports.unsubscribe = async (endpoint) => {
	const subscription = await Subscription.findOne({ where: { endpoint } });

	if (subscription) {
		await subscription.destroy();
		return true;
	}

	return false;
};

// Send a push notification to all saved subscriptions
exports.sendNotification = async (payload) => {
	try {
		// Get all saved subscriptions
		const subscriptions = await Subscription.findAll();

		// Loop through each and send a push message
		const sendPromises = subscriptions.map((sub) => {
			return webpush
				.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: {
							p256dh: sub.p256dh,
							auth: sub.auth,
						},
					},
					JSON.stringify(payload) // Payload must be a string
				)
				.catch((error) => {
					console.error('Failed to send notification', error);

					// If the subscription is no longer valid (e.g., revoked or expired), remove it
					if (error.statusCode === 410 || error.statusCode === 404) {
						return Subscription.destroy({ where: { endpoint: sub.endpoint } });
					}
				});
		});

		await Promise.all(sendPromises);
	} catch (error) {
		console.error('Error sending notifications', error);
	}
};
