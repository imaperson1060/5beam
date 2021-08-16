module.exports = (app, database, ejs, fetch, formidable, iconv, linebyline) => {
    app.post("/upload", (req, res) => {
        var levelpack = new formidable.IncomingForm();

        levelpack.parse(req, function (err, fields, files) {
            if (files.uploadfile.size > 500000) {
                ejs.renderFile("views/main/error.ejs", {error: "toobig", size:files.uploadfile.size}, null, function(err, str) {
                    res.send(str);
                });
                return;
            }

            var file = linebyline(files.uploadfile.path, {retainBuffer: true});
            var fileContents = "";
            file.on("line", (line, lineCount, byteCount) => {
                fileContents += iconv.decode(line, "win1251") + "\r\n";
                if (files.uploadfile.size == byteCount) {
                    database.query("SELECT * FROM `5beam`", function (err, result) {
                        var mod = "vanilla";
                        if (fields.guysmod == "on") mod = "guysmod";

                        database.query("INSERT INTO `5beam`(`id`, `name`, `author`, `description`, `difficulty`, `modname`, `levelpack`, `timestamp`, `uploader`) VALUES (?,?,?,?,?,?,?,?,?)", [result.length + 1, fields.name, fields.author, fields.description, fields.difficulty, mod, encodeURIComponent(fileContents), Math.round(new Date().getTime() / 1000), req.user.id], function (e) {
                            fetch(`https://discord.com/api/webhooks/873310477722189844/${process.env.WEBHOOK}`, { method: "POST", body: `content=New level: ***${fields.name}** by **${fields.author}***!${"\n"}https://5beam.5blevels.com/level/${result.length + 1}/` });

                            res.redirect("/level/" + (result.length + 1));
                        });
                    });
                }
            });
        });
    });

    app.post("/upload-cli", (req, res) => {
        if (req.body.uploadfile.size > 500000) {
            res.json([{ success: false, message: `Sorry, but this file is too big (${req.body.uploadfile.length / 1000} kilobytes).` }]);
            return;
        }

        database.query(`SELECT * FROM \`5beam\``, function (err, result) {
            var mod = "vanilla";
            if (req.body.guysmod == "true") mod = "guysmod";
        
            database.query("INSERT INTO `5beam`(`id`, `name`, `author`, `description`, `difficulty`, `modname`, `levelpack`, `timestamp`, `uploader`) VALUES (?,?,?,?,?,?,?,?,?)", [(result.length + 1), req.body.name, req.body.author, req.body.description, req.body.difficulty, mod, encodeURIComponent(req.body.uploadfile), Math.round(new Date().getTime() / 1000), "Guest"], function (err) {
                fetch(`https://discord.com/api/webhooks/873310477722189844/${process.env.WEBHOOK}`, { method: "POST", body: `content=New level: ***${req.body.name}** by **${req.body.author}***!${"\n"}https://5beam.5blevels.com/level/${result.length + 1}/` });
            
                res.json([{ success: true, message: (result.length + 1) }]);
            });
        });
    });
}