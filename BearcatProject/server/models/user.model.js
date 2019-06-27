const mongoose=require('mongoose');
const bcrypt=require('bcryptjs');

var userSchema=new mongoose.Schema({
SId:{
type:String,
required:"SID  cannot be empty"
},
    firstName:{
        type:String,
        required:"First Name cannot be empty"
    },
    lastName:{
        type:String,
        required:"Last Name cannot be empty"
    },
    email:{
type:String,
required:"Email cannot be empty",
unique:true
    },
    password:{
        type:String,
        required:"Password cannot be empty"
    },
    saltSecret:String
});

userSchema.pre('save',function(next){
bcrypt.genSalt(10,(err,salt)=>{
    bcrypt.hash(this.password,salt,(err,hash)=>{
        this.password=hash;
        this.saltSecret=salt;
        next();
    });

});

});





mongoose.model('User',userSchema);
