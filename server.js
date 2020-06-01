if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

const express = require('express')
const passport = require('passport')
var bodyParser = require("body-parser")
const path = require("path")
const flash = require('express-flash')
const session = require('express-session')
const methodOverride = require('method-override')

const initializePassport = require('./passport-config')
initializePassport(
    passport,
    email => users.find(user => user.email === email),
    id => users.find(user => user.id === id)
)

const users = []


const app = express()
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(__dirname + '/public'));

app.use(flash())
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize())
app.use(passport.session())
app.use(methodOverride('_method'))


app.get("/", (req, res) => {
    res.render("home_page");
})

app.get("/about", (req, res) => {
    res.render("about");
})

app.get("/contact_us", (req, res) => {
    res.render("contact_us");
})

app.get("/login", (req, res) => {
    res.render("login");
})

app.get("/userprofile", (req, res) => {
    res.render("user_profile");
})

app.get('/login', checkNotAuthenticated, (req, res) => {
    res.render('login.ejs')
})
app.post('/login', checkNotAuthenticated, passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: true
}))

app.get('/register', checkNotAuthenticated, function(req, res) {
    res.render("register");
});


app.post('/register', checkNotAuthenticated, (req, res) => {
    // console.log(req.body.psw)
    // console.log(req.body.pswrepeat)
    if (req.body.passwordrepeat === req.body.password) {
        users.push({
            id: Date.now().toString(),
            email: req.body.email,
            gender: req.body.gender,
            name: req.body.name,
            email: req.body.email,
            password: req.body.password
        })
        res.redirect("/userprofile")
        console.log(users)
    } else {
        res.redirect("/register")
    }

})

function checkAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return next()
    }

    res.redirect('/login')
}

function checkNotAuthenticated(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect('/')
    }
    next()
}

app.listen(3000, console.log("server is running"))