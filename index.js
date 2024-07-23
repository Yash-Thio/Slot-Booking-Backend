const express = require('express');
const rootRouter = require('./Routes/index');
const bodyParser = require('body-parser');
const cors = require('cors')

const app = express();

app.use(bodyParser.json());
app.use(cors());
app.use('/api/v1', rootRouter);

app.listen(5000);
console.log("hi");