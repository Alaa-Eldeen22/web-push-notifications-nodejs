const { DataTypes } = require('sequelize');
const sequelize = require('./index');

// Define a Subscription model to store push subscription details
const Subscription = sequelize.define('Subscription', {
	endpoint: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	p256dh: {
		type: DataTypes.STRING,
		allowNull: false,
	},
	auth: {
		type: DataTypes.STRING,
		allowNull: false,
	},
});

module.exports = Subscription;
