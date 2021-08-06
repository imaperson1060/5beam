const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const cors = require("cors");
const ejs = require("ejs");
const formidable = require("formidable");
const fs = require("fs");
const iconv = require("iconv-lite");
const linebyline = require("linebyline");
const mysql = require("mysql");
const request = require("request");

const mysqlLogin = JSON.parse(process.env.MYSQL);
var database = mysql.createPool({
    host     : mysqlLogin.server,
    user     : mysqlLogin.username,
    password : mysqlLogin.password,
    database : mysqlLogin.database
});

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));
app.use(express.static("files"));

require("./static.js")(app, database, ejs);
require("./api")(app, cors, database, ejs);
require("./upload.js")(app, cors, database, ejs, formidable, fs, iconv, linebyline, request);

app.listen(process.env.PORT, () => {
    console.log(`5beam API ready!`);
});