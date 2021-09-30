const express = require("express");
const app = express();
const http = require("http");
const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const bodyParser = require("body-parser");
const cors = require("cors");
const crypto = require("crypto");
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
var database = mysql.createPool(mysqlLogin);

app.use(bodyParser.text());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static("public"));
app.use(express.static("files"));

require("./api")(app, cors, database, ejs, io);
require("./discord.js")(app, DiscordStrategy, passport, session);
require("./static.js")(app, database, ejs);
require("./upload.js")(app, database, ejs, fetch, formidable, iconv, linebyline);


app.post("/restart/", (req, res) => {
    const expectedSignature = "sha1=" +
        crypto.createHmac("sha1", process.env.PASSWORD)
            .update(JSON.stringify(req.body))
            .digest("hex");

    const signature = req.headers["x-hub-signature"];
    if (signature == expectedSignature) {
        res.sendStatus(200);
        process.exit();
    }
});

server.listen(process.env.PORT, () => {
    console.log(`5beam API ready!`);
});