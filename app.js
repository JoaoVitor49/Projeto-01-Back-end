const express = require('express');
const app = express();
const swaggerUi = require('swagger-ui-express')
const swaggerFile = require('./swagger_doc.json')
require('dotenv').config();
app.use(express.json());

const userRoutes = require('./routes/userRoutes');

app.use('/users', userRoutes);
app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.listen(process.env.PORT, () => {
    console.log('Sistema rodando...');
});
