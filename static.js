module.exports = (app, database, ejs) => {
    app.get("/", (req, res) => {
        ejs.renderFile("views/main/index.ejs", { login: false }, null, function(err, str) {
            res.send(str);
        });
    });

    app.get("/browse/", (req, res) => {
        database.query("SELECT * FROM `5beam`", function (error, result, fields){
            result.forEach(x => {
                var timestamp = new Date(x.timestamp * 1000),
                    days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
                    months = ["January","February","March","April","May","June","July","August","September","October","November","December"];
                            
                function checkHour() {
                    if (timestamp.getHours() > 12) {
                        return (timestamp.getHours() - 12) + ":" + timestamp.getMinutes() + " " + "PM";
                    } else {
                        return timestamp.getHours() + ":" + timestamp.getMinutes() + " " + "AM";
                    }
                }

                x.timestamp = days[timestamp.getDay()] + ", " + months[timestamp.getMonth()] + " " + timestamp.getDate() + ", " + timestamp.getFullYear() + " - " + checkHour();
            })

            ejs.renderFile("views/main/browselevels.ejs", {info: result}, null, function(err, str) {
                res.send(str);
            });
        });
    });

    app.get("/level/:id", (req, res) => {
        database.query("SELECT * FROM `5beam` WHERE `id`=?", [req.params.id], function (error, result, fields) {
            if ((!result) || (!result[0])) {
                ejs.renderFile("views/404.ejs", {}, null, function (err, str) {
                    res.send(str);
                });
                return;
            }
            
            ejs.renderFile("views/main/level.ejs", { info: result[0], id: req.params.id }, null, function (err, str) {
                res.send(str);
            });
        });
    });

    app.get("/version", (req, res) => {
        res.json([{ version: "5" }]);
    });
}