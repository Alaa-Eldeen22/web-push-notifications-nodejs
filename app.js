const express = require('express');
const sequelize = require('./models/index');
require('dotenv').config();
const notificationRoutes = require('./routes/notification.routes');

const app = express();

app.use(express.json());

// Enable CORS for cross-origin requests (good for development; restrict in production)
const cors = require('cors');
app.use(cors()); // WARNING: configure properly for production

app.use('/notifications', notificationRoutes);

sequelize
	.sync() // Creates tables if they don't exist
	.then(async () => {
		console.log('Database synchronized');

		app.listen(process.env.PORT, () => {
			console.log(`Server is running on port: ${process.env.PORT}`);
		});
	})
	.catch((error) => {
		console.error('Error during database synchronization:', error);
	});
