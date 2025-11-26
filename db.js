const { Sequelize } = require("sequelize");

const sequelize = new Sequelize ('payment_api', 'postgres', 'burgerkill288',{
    host: 'localhost',
    dialect: 'postgres'
});

module.exports = sequelize;