const mongoose = require ('mongoose');
const bcrypt = require('bcryptjs');

const registerSchema = new mongoose.Schema({
    firstname:{
        type: String,
        required: true,
    },

    lastname:{
        type:String,
        required:true,
    },
    email:{
        type:String,
        required: true,
        unique: true,
    },
    phoneNumber:{
        type:String,
        required: true,
    },
    employeeId:{
        type: String,
        required: true,
        unique: true,
    },
    password:{
        type: String,
        required: true,
    }
});

//Hash when password save (for security)
registerSchema.pre("save", async function (next){
    if (!this.isModified("password")) 
        return next();

    this.password = await bcrypt.hash(this.password, 10);
    next();
});

module.exports = mongoose.model("RegisterUser", registerSchema)