const { DataTypes } = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Balance = sequelize.define('Balance', {
    currBalance: {type: DataTypes.FLOAT, defaultValue: 0},
    username: {type: DataTypes.STRING}
});

Balance.belongsTo(User);
module.exports = Balance;