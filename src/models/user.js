import mongoose from './index.js'

const validateEmail = (email) => {
    return email.match(
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
  };

//   const ethereumAddressValidator = {
//     validator: function(v) {
//       // Regular expression to match an Ethereum address
//       return /^0x[a-fA-F0-9]{40}$/.test(v);
//     },
//     message: props => `${props.value} is not a valid Ethereum address!`
//   };



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
        required: true
        
    },
    PRIVATE_KEY:{
        type:String,
        required: true
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