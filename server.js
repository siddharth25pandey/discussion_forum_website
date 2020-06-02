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
const bcrypt =require('bcryptjs')
const mongoose = require('mongoose');
const {ensureAuth} =require('./config/auth');

const app=express()

//user model
const User=require("./model/Users.js")

//passport config
require('./config/passport')(passport);

//DB config
const db=require('./config/keys').MongoURI;

//Connnect Mongo
mongoose.connect(db,{useNewUrlParser:true,useUnifiedTopology:true})
  .then(()=>console.log("db connected"))
  .catch(err=>console.log(err))

  //EJS

app.set("view engine","ejs");

//Bodyparser
app.use(bodyParser.urlencoded({extended:true}));
app.use( express.static( __dirname + '/public' ));

//express session
app.use(
  session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
  })
);

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

//connect flash
app.use(flash());

//global vars
app.use((req,res,next)=>{
  res.locals.success_msg=req.flash('success_msg')
  res.locals.error_msg=req.flash('error_msg')
  res.locals.error=req.flash('error')
  next();
})

//-------ROUTES--------------

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

app.get("/userprofile",ensureAuth,(req,res)=>{
  res.render("user_profile",{
    name:req.user.name
  });
})


app.get( '/register', function( req, res ){
    res.render("register");
  });

  
app.post('/register',(req,res)=>{
  
  const {name,email,password,passwordrepeat}=req.body
  let errors=[];

  //check required fields
  if(!name||!email||!password||!passwordrepeat){
      errors.push({msg:"Please fill in all fields"})
  }
  //check password match
  if(password!==passwordrepeat){
      errors.push({msg:"passwords do not match"})
  }
  //check pass length
  if(password.length<6){
      errors.push({msg:"password short"})

  }
  if(errors.length>0){
      res.render('register',{
          errors,
          name,
          email,
          password,
          passwordrepeat
      })
  }else{
    //Validation passed
    User.findOne({email:email})
     .then(user=>{
         if(user){
             //User exists
             errors.push({msg:"Email is already register"})
             res.render('register',{
                errors,
                name,
                email,
                password,
                passwordrepeat
            })

         }else{
             const newUser=new User({
                 name,
                 email,
                 password
                 
             })
           
             //hash password
             bcrypt.genSalt(10,(err,salt)=>
              bcrypt.hash(newUser.password,salt,(err,hash)=>{
                if(err) throw err;
                //set password to hashed
                newUser.password=hash;
                //Save user
                newUser.save()
                 .then(user=>{
                    
                     req.flash('success_msg',"you are now registered")
                     res.redirect('/login');
                 })
                 .catch(err=>console.log(err))
             }))
         }
     }) 
   

  }



})

app.get('/login',  (req, res) => {
  res.render('login.ejs')
})
//Login handle
app.post('/login',(req,res,next)=>{
  passport.authenticate('local',{
      successRedirect:'/userprofile',
      failureRedirect:'/login',
      failureFlash:true
      
  })(req,res,next);
 })

 //Logout handle
app.get('/logout',(req,res)=>{
  req.logout();
  req.flash('success_msg',"you are logged out")
  res.redirect('/login');
})


app.listen(3000, console.log("server is running"))