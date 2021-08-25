
require('dotenv').config();
const express = require("express");
const ejs = require("ejs");
const bodyparser = require("body-parser");
//const { static } = require("express");
const mongoose = require("mongoose");
//const encrypt = require("mongoose-encryption");
//const md5 = require("md5");
//const bcrypt = require("bcrypt");
const passport = require("passport");
const session = require("express-session");
const passportLocalMongoose = require("passport-local-mongoose");
const saltRounds = 10;

const app = express();



app.use(express.static("public"));
app.set('view engine','ejs');

app.use(bodyparser.urlencoded({extended:true}));

app.use(session({
    secret:"Our little secret.",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());


mongoose.connect("mongodb+srv://admin-ganesh:#@cluster0.ah7zk.mongodb.net/userDB",{useNewUrlParser:true,useUnifiedTopology:true});
mongoose.set('useCreateIndex',true);
const userSchema = new mongoose.Schema({
    email:String,
    password:String,
    secret:String
});

userSchema.plugin(passportLocalMongoose);
//const secret = "THisIsOurLittleSecrret.";
//userSchema.plugin(encrypt,{secret:process.env.SECRET,encryptedFields:["password"]});

const User =  mongoose.model("user",userSchema);

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


app.get("/",function(req,res){
    res.render("home");
})


app.get("/login",function(req,res){
    res.render("login");
})


app.get("/register",function(req,res){
    res.render("register");
})

app.get("/secrets",function(req,res){
   User.find({"secret":{$ne:null}},function(err,foundUsers){
       if(err){
           console.log(err);
       }else{
           if(foundUsers){
               res.render("secrets",{usersWithSecrets:foundUsers});
           }
       }

   })



})

app.get("/logout",function(req,res){
    req.logout();
    res.redirect("/");
})

app.get("/submit",function(req,res){
    if(req.isAuthenticated()){
        res.render("submit");
    }else{
        res.redirect("/login");
    }
})

app.post("/submit",function(req,res){
    const submittedSecret = req.body.secret;
    User.findById(req.user.id,function(err,foundUser){
        if(err){
            console.log(err);

        }else{
            if(foundUser){
                foundUser.secret = submittedSecret;
                foundUser.save(function(){
                    res.redirect("/secrets");
                })
            }
        }
    })
})
app.post("/register",function(req,res){

User.register({username:req.body.username},req.body.password,function(err,user){
    if(err){
        console.log(err);
        res.redirect("/register");
    }else{
        passport.authenticate("local")(req,res,function(){
            res.redirect("/secrets");
        })
    }
})
    
})


app.post("/login",function(req,res){

    const user = new User({
        username :req.body.username,
        password : req.body.password

    })
    
    
    req.login(user,function(err){
        if(err){
            console.log(err);
        }else{
            passport.authenticate("local")(req,res,function(){
                res.redirect("/secrets");
            })
        }
    })

    
})












let port = process.env.PORT;

if(port==null||port==""){
    port = 3000;
}


app.listen(port,function(){
    console.log("Server started running on port 3000");
})



