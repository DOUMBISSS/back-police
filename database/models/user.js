import mongoose from 'mongoose';
import validator from 'validator';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import {config} from '../../config.js'


const salt=10;

let userSchema = new mongoose.Schema({
      idUser:{type: String,required: true,unique: true},
      fullname:{type: String},
      password: {type: String,required: true},
      token:{type: String}
  });

  userSchema.pre('save',function(next){
    var user=this;
    
    if(user.isModified('password')){
        bcrypt.genSalt(salt,function(err,salt){
            if(err)return next(err);

            bcrypt.hash(user.password,salt,function(err,hash){
                if(err) return next(err);
                user.password=hash;
                user.password2=hash;
                next();
            })

        })
    }
    else{
        next();
    }
});

// function is for comparing the user password when user tries to login
userSchema.methods.comparepassword=function(password,cb){
  bcrypt.compare(password,this.password,function(err,isMatch){
      if(err) return cb(next);
      cb(null,isMatch);
  });
}

//Next function is for generating a token when user logged in.
userSchema.methods.generateToken=function(cb){
  var user =this;
  var token=jwt.sign(user._id.toHexString(),config.SECRET);

  user.token=token;
  user.save(function(err,user){
      if(err) return cb(err);
      cb(null,user);
  })
}

// find by token
userSchema.statics.findByToken=function(token,cb){
  var user=this;

  jwt.verify(token,confiq.SECRET,function(err,decode){
      user.findOne({"_id": decode, "token":token},function(err,user){
          if(err) return cb(err);
          cb(null,user);
      })
  })
};

//delete token
userSchema.methods.deleteToken=function(token,cb){
  var user=this;

  user.update({$unset : {token :1}},function(err,user){
      if(err) return cb(err);
      cb(null,user);
  })
}


  export default mongoose.model('User', userSchema)