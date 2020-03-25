require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser")
const ejs = require("ejs")
const mongoose = require("mongoose")
const session = require('express-session')
const passport = require("passport")
const passportLocalMongoose = require("passport-local-mongoose")


const app = express();

app.use(express.static("public"))
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}));

app.use(session({
    secret: "L3emator53@$ciq",
    resave: false,
    saveUninitialized: false
}));

app.use(passport.initialize());

app.use(passport.session());


mongoose.connect("mongodb://localhost:27017/parotta", { useNewUrlParser: true });
mongoose.set("useCreateIndex", true);


const userSchema = new mongoose.Schema({
    email: String,
    password: String,
    secret: String
});

const itemsSchema = {
    UID: String,
    name: String
}

const Item = mongoose.model("Item", itemsSchema)

const item1 = new Item({
    name: "Welcome to your todolist"
})

const item2 = new Item({
    name: "Hit the + button to add!"
})

const item3 = new Item({
    name: "<-- Hit this to delete!"
})

const defaultItems = [item1, item2, item3]


userSchema.plugin(passportLocalMongoose);

const secret = process.env.SECRET

const User = new mongoose.model("User", userSchema)

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/", function (req, res) {
    res.render("index")
})

app.get("/login", function (req, res) {
    res.render("login")
})

app.get("/register", function (req, res) {
    res.render("register")
})

app.get("/dashboard", function (req, res) {
    if (req.isAuthenticated()) {
        Item.find({}, function (err, foundItems) {
            if (foundItems.length === 0) {

                Item.insertMany(defaultItems, function (err) {
                    if (err) {
                        console.log(err)
                    } else {
                        console.log("Success!")
                    }
                })
                res.redirect("/dashboard")
            } else {
                res.render("dashboard", { listTitle: "Today", newListItems: foundItems })
            }

        })
    } else {
        res.redirect("/login")
    }
});

app.post("/submit", function (req, res) {
    const itemName = req.body.newItem;

    const item = new Item({
        name: itemName
    });

    item.save();

})

app.post("/register", function (req, res) {
    User.register({ username: req.body.username }, req.body.password, function (err, user) {
        if (err) {
            console.log(err);
            red.redirect("/register")
        } else {
            passport.authenticate("local")(req, res, function () {
                res.redirect("/dashboard")
            })
        }
    })
});

app.post('/login',
    passport.authenticate('local', {
        successRedirect: '/dashboard',
        failureRedirect: '/login',
    })
);
app.get("/logout", function (req, res) {
    req.logout();
    res.redirect("/");
});

















app.listen(3000, function () {
    console.log("Server started on port 3000")
})