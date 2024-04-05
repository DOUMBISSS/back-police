import mongoose from "mongoose";

let personSchema = new mongoose.Schema({
        img:{type:String},
        fullname:{type:String},
        date_naissance:{type:String},
        lieu:{type:String},
        nationality:{type:String},
        size:{type:String},
        situation:{type:String},
        sexe:{type:String},
        tel:{type:String},
        profession:{type:String},
        addresse:{type:String},
        email:{type:String},
        cni:{type:String,required: true,unique: true},
        passeport:{type:String,required: true,unique: true},
        ps_conduite:{type:String,required: true,unique: true},
        current_status:{type:String},
        token:{type: String},
        information_id:[{type : mongoose.Types.ObjectId , ref: "Info"}],
})


export default mongoose.model('Person', personSchema)