import mongoose from './index.js'

const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

//create schema
let userSchema = new mongoose.Schema({
    Voter_id:{
        type:String,
        required:[true,'Voter ID is required']
    },
    email:{
        type:String,
        required:[true,'Email is required'],
        validate:{
            validator: (value)=>validateEmail(value)
        }
    },
    Etherium_Address:{
        type:String,
        required:[true,"Etherium_Wallet_Address is required"]
    },
    District:{
        type:String,
        required:[true,"District name is required"]
    },
    
    password:{
        type:String,
        required:[true,'Password is required'],
    },
    gender:{
        type:String,
        required:[true,'Gender is required']  
    },
    voting_state:{
        type:Boolean,  //voting state of the user (false=not voted , true=voted)
        default: false
    },
    role:{
        type:String,
        default:'user'
    },
    createdAt:{
        type:Date,
        default:Date.now()
    }
},{
    collection:'users',
    versionKey:false
})


//create model
const UserModel = mongoose.model('users',userSchema)

export default UserModel