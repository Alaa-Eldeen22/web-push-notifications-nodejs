const { Sequelize } = require('sequelize');

// Configure Sequelize
const sequelize = new Sequelize({
	dialect: 'sqlite',
	storage: '../data/database.sqlite',
});

module.exports = sequelize;
