const webpush = require('web-push');

// Set VAPID keys for push notification authentication
webpush.setVapidDetails(
	'mailto:email@domain.com', // Contact email (can be fake for testing)
	process.env.VAPID_PUBLIC_KEY, // Public key (used by client)
	process.env.VAPID_PRIVATE_KEY // Private key (kept secret)
);

module.exports = webpush;
