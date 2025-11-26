const express = require('express');
const router = require('./routes/api');
const sequelize = require('./db');
const bodyParser = require('body-parser');

const app = express();
app.use(bodyParser.json());
app.use('/api', router);

sequelize.sync({alter: true}).then(() => {
   console.log('Database synced');
   app.listen(3000, () => console.log('Server is running on port 3000'));
});