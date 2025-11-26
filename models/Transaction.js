const { DataTypes} = require('sequelize');
const sequelize = require('../db');
const User = require('./User');

const Transaction = sequelize.define('Transaction', {
    amount: {type: DataTypes.FLOAT, allowNull: false},
    service: {type: DataTypes.STRING},
    trxDate: {type: DataTypes.DATE}
});

Transaction.belongsTo(User);
module.exports = Transaction;