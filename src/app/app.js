const config = require("../config");
const express = require('express');
const morgan = require('morgan');
const app = express();

var createError = require('http-errors');
const cors = require('cors');
var path = require('path');
/////////7

const routerArchivos =require("../router/RouterArchivo");
///////////
app.use(morgan("dev"));
app.get('/', (req, res) => {
    res.send('express');
});
app.use(express.json());
app.use('/MEDIA', express.static(path.join(__dirname, 'MEDIA')));
app.use(cors(config.application.cors.server));


app.use("/api/v1",routerArchivos);





module.exports = app;
