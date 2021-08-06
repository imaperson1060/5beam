module.exports = (app, cors, database, ejs) => {
    app.get("/api", cors(), (req, res) => {
        database.query("SELECT * FROM `5beam`", function (error, result, fields) {
            result.forEach(x => {
                delete x.levelpack;
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

    app.get("/:id", (req, res) => {
        if (isNaN(req.params.id)) {
            ejs.renderFile("views/404.ejs", {}, null, function (err, str) {
                res.send(str);
            });
            return;
        }

        database.query("SELECT * FROM `5beam` WHERE `id`=?", [req.params.id], function (error, result, fields) {
            if (!result[0]) return res.sendStatus(404);

            var views = result[0].views;
            database.query("UPDATE `5beam` SET `views`=?", [views + 1]);

            res.setHeader("content-type", "text/plain");
            res.send(decodeURIComponent(result[0].levelpack));
        });
    });
}