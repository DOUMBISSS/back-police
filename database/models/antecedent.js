import mongoose from "mongoose";


let anteSchema = new mongoose.Schema({
    person_id:{type : mongoose.Types.ObjectId , ref: "Person"},
    date_crimes:Array,
    observations:{type:String},
    nature__crimes:Array,
    date__precis:Array,
    date__condamnation:Array,
})

export default mongoose.model('Antecedent',anteSchema)