const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const bodyParser = require("body-parser");
const cors = require("cors");
const ejs = require("ejs");
const fetch = require("node-fetch");
const formidable = require("formidable");
const iconv = require("iconv-lite");
const linebyline = require("linebyline");
const mysql = require("mysql");

const DiscordStrategy = require("passport-discord").Strategy;
const passport = require("passport");
const session = require("express-session");

require("dotenv").config();

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

require("./api")(app, cors, database, ejs, io);
require("./discord.js")(app, DiscordStrategy, passport, session);
require("./static.js")(app, database, ejs);
require("./upload.js")(app, database, ejs, fetch, formidable, iconv, linebyline);

server.listen(process.env.PORT, () => {
    console.log(`5beam API ready!`);
});