import mongoose from './index.js'

let CandidateSchema = new mongoose.Schema({
    candidate_id:{
        type:Number,
        required:[true,'Candidate ID is required']
    },
    
    candidate_name:{
        type:String,
        required:[true,"Candidate Name is required"]
    },
    District:{
        type:String,
        required:[true,"District name is required"]
    }
},{
    collection:'candidate',
    versionKey:false
})


//create model
const CandidateModel = mongoose.model('candidate',CandidateSchema)

export default CandidateModel