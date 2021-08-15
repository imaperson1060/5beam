module.exports = (app, cors, database, ejs, io) => {
    app.get("/api", cors(), (req, res) => {
        database.query("SELECT * FROM `5beam`", function (error, result, fields) {
            result.forEach(x => {
                delete x.levelpack;
                x.likedby = JSON.parse(x.likedby);
            });
            res.json(result);
        });
    });

    app.get("/download/:id", cors(), (req, res) => {
        if (isNaN(req.params.id)) {
            ejs.renderFile("views/404.ejs", {}, null, function (err, str) {
                res.send(str);
            });
            return;
        }

        database.query(`SELECT * FROM \`5beam\` WHERE \`id\`=?`, [req.params.id], function (error, result, fields) {
            if (!result[0]) return res.sendStatus(404);

            var views = result[0].views;
            database.query("UPDATE `5beam` SET `views`=?", [views + 1]);
            
            res.status(200)
                .attachment("levels.txt")
                .send(decodeURIComponent(result[0].levelpack))
        });
    });

    app.get("/:id", (req, res, next) => {
        if (isNaN(req.params.id)) return next();

        database.query("SELECT * FROM `5beam` WHERE `id`=?", [req.params.id], function (error, result, fields) {
            if (!result[0]) return res.sendStatus(404);

            var views = result[0].views;
            database.query("UPDATE `5beam` SET `views`=?", [views + 1]);

            res.setHeader("content-type", "text/plain");
            res.send(decodeURIComponent(result[0].levelpack));
        });
    });
    
    io.on("connection", (socket) => {
        socket.on("getLikeStatus", (id, user) => {
            database.query("SELECT * FROM `5beam` WHERE `id`=?", [id], function (error, result, fields) {
                if (JSON.parse(result[0].likedby).includes(user)) {
                    socket.emit("likeStatus", true);
                } else {
                    socket.emit("likeStatus", false);
                }
            });
        });

        socket.on("like", (id, user) => {
            database.query("SELECT * FROM `5beam` WHERE `id`=?", [id], function (error, result, fields) {
                if (JSON.parse(result[0].likedby).includes(user)) return;

                var likedby = JSON.parse(result[0].likedby);
                likedby.push(user);
                likedby = JSON.stringify(likedby);

                database.query("UPDATE `5beam` SET `likes`=?, `likedby`=? WHERE `id`=?", [(result[0].likes + 1), likedby, id]);
            });
        });
        socket.on("unlike", (id, user) => {
            database.query("SELECT * FROM `5beam` WHERE `id`=?", [id], function (error, result, fields) {
                if (!JSON.parse(result[0].likedby).includes(user)) return;

                var likedby = JSON.parse(result[0].likedby);
                var index = likedby.indexOf(user.id);
                likedby.splice(index, 1);
                likedby = JSON.stringify(likedby);

                database.query("UPDATE `5beam` SET `likes`=?, `likedby`=? WHERE `id`=?", [(result[0].likes - 1), likedby, id]);
            });
        });
    });
}