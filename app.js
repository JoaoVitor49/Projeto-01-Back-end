const express = require('express');
const app = express();
require('dotenv').config();
app.use(express.json());

const userRoutes = require('./routes/userRoutes');

app.use('/users', userRoutes);

app.listen(process.env.PORT, () => {
    console.log('Sistema rodando...');
});
