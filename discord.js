module.exports = (app, DiscordStrategy, passport, session) => {
    app.use(session({
        secret: JSON.parse(process.env.AUTH).cookie,
        resave: false,
        saveUninitialized: false
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user);
    });
    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    passport.use(new DiscordStrategy({
        clientID: JSON.parse(process.env.AUTH).id,
        clientSecret: JSON.parse(process.env.AUTH).secret,
        callbackURL: "/login",
        scope: ["identify"]
    },
    function(accessToken, refreshToken, profile, done) {
        process.nextTick(() => { return done(null, profile); });
    }));
        
    app.get("/login", passport.authenticate("discord", { failureRedirect: "/" }), function(req, res) {
        res.redirect("/");
    });
}