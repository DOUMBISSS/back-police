import express from 'express';
import bodyParser from 'body-parser';
// import {routes} from "./routes/routes.js";
import cors from "cors";
import dotenv from 'dotenv'
import Database from './database/db.js';
import Person from './database/models/person.js';
import Info from './database/models/informations.js';
import User from './database/models/user.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import jwt from "jsonwebtoken";

const app = express();
const port = process.env.PORT;
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

app.use(bodyParser.json());
app.use(cors())

// app.use("/images", express.static(path.join(__dirname,"/images")))
// app.use(routes);
const database = new Database();
Database .connect();

// User.create([
//     {
//         idUser:"123456789",
//         fullname:"Doumbia Fode",
//         password:"1234"

//     },
    
// ])

let auth =(req,res,next)=>{
    let token =req.cookies.auth;
    User.findByToken(token,(err,user)=>{
        if(err) throw err;
        if(!user) return res.json({
            error :true
        });
        req.token= token;
        req.user=user;
        next();
    })
  }
  
  
  app.post('/register',function(req,res){
    const newUser=new User(req.body);
    
   if(!newUser.password)
      return res.status(400).json({message: "password not match"});
    
    User.findOne({idUser:newUser.idUser},function(err,user){
        if(user) 
          return res.status(400).json({ auth : false, message :"email exits"});
  
        newUser.save((err,doc)=>{
          if(err) {console.log(err);
          return res.status(400).json({ success : false});  }
          res.json(doc);
      });
  
    });
  });
  
  app.post('/login', function(req,res){
              User.findOne({idUser:req.body.idUser},function(err,user){
                  if(!user) return res.json({isAuth : false, message : 'Auth failed ,ID not found'});
          
                  user.comparepassword(req.body.password,(err,isMatch)=>{
                      if(!isMatch) return res.json({ isAuth : false,message : "password doesn't match"});
          
                  user.generateToken((err,user)=>{
                      if(err) return res.status(400).send(err);
                      res.json({
                          isAuth : true,
                          token : user.token,
                          id : user._id,
                          idUser : user.idUser,
                          name: user.name
                      });
                  });    
              });
            });
         // }
      });
  
  
  function authenticateToken(req, res, next) {
      const authHeader = req.headers['authorization']
      const token = authHeader && authHeader.split(' ')[1]
    
      if (token == null) return res.sendStatus(401)
    
      jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
          return res.sendStatus(401)
        }
        req.user = user;
        next();
      });
    }
    
    app.get('/api/me', authenticateToken, (req, res) => {
      res.send(req.user);
    });
  
  app.get('/profile',auth,function(req,res){
    res.json({
        isAuth: true,
        id: req.user._id,
        email: req.user.email,
        name: req.user.name
        
    })
  });
  
  //logout user
  app.get('/logout',auth,function(req,res){
    req.user.deleteToken(req.token,(err,user)=>{
        if(err) return res.status(400).send(err);
        res.sendStatus(200);
    });
  });
  
  app.get('/users',function(req,res){
                          User.find({})
                          .then((doc)=>{res.send(doc)})
                          .catch(err => {console.log(err);      
                              })
  
  })
app.get('/persons',function(req,res){
    Person.find({}).populate("information_id")
    .then((doc)=>{res.send(doc)})
    .catch(err => {console.log(err);      
    })
})

app.post('/persons',function(req,res){
    const newPerson=new Person(req.body)
    newPerson.save((err,doc)=>{
        if(err) {console.log(err);
            return res.status(400).json({ success : false});}
        res.status(200).json({
            succes:true,
            message : "Person added with success",
            data : doc
        });
    });
})

app.get('/persons/:id',(req,res) => { 
    Person.findById((req.params.id),(req.body)).populate("information_id")
    .then((doc)=>{res.send(doc)})
    .catch(err => {console.log(err);      
})
})

app.put('/person/:id',(req,res) => { 
    Person.findByIdAndUpdate((req.params.id),(req.body))
    .then((doc)=>{res.send(doc)})
    .catch(err => {console.log(err);      
    })
})

app.get('/infos',function(req,res){
    Person.find({})
    .then((doc)=>{res.send(doc)})
    .catch(err => {console.log(err);      
})
})

app.post('/infos',function(req,res){
    const newInfo = new Info(req.body)
    newInfo.save((err,doc)=>{
        if(err) {console.log(err);
            return res.status(400).json({ success : false});}
            Person.updateOne({"_id" : doc.person_id},{$push : {information_id : doc._id}})
        res.status(200).json({
            succes:true,
            message : "Info added with success",
            data : doc
        });
    });
})

app.listen(port , ()=> {
    console.log('Server running at 127.0.0.1:' + port)
})
