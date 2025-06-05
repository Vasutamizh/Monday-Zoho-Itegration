require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const routes = require('./routes');
const path = require("path");
const cors = require('cors');

const { PORT: port } = process.env;
const app = express();

app.use(express.static(path.join(__dirname, 'client')));
app.use(cors())
app.use(bodyParser.json());
app.use(routes);

app.listen(port, () => {
  console.log(`Transform text integration listening on port ${port}`)
});

module.exports = app;

