const express=require("express");
const router=express.Router();
const {check,validationResult}=require("express-validator");


const auth=require('../../middleware/auth');
const User=require('../../models/Users');



const bcrypt=require('bcryptjs');
const jwt=require("jsonwebtoken");
const config=require("config");  //we can access all the config variables using this

//@route    GET api/auth
//@desc     auth Route
//@access   protected
router.get('/',auth,async(req,res)=>{
    try {
        const user=await User.findById(req.user.id).select('-password');
        res.json(user);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');
    }
})




//@route    POST api/auth
//@desc     authenticate user and get token
//@access   Public

//array of different checks for the express validator
const regDataCheck=[
    check('email','please include a valid email').isEmail(),
    check('password','please enter a password with 6 or more character').isLength({min:6})    
];

router.post('/',regDataCheck,async(req,res)=>{
const errors=validationResult(req); 
if(!errors.isEmpty()){
    return res.status(400).json({errors:errors.array()});
}

const {email,password}=req.body;
try {
//check if user exist
let user=await User.findOne({email:email});
if(!user){
    return res.status(400).json({errors:[{msg:'Invalid Credentials'}]});
}   


//check if the password is correct(as the database stores the encrypted password we'll need bcrypt)
const isMatch=await bcrypt.compare(password,user.password);
if(!isMatch){
    return res.status(400).json({errors:[{msg:'Invalid Credentials'}]});
}

//return json web token (as when user will register, he/she should be logged in also)
const payload={
    user:{
        id:user.id
    }
} //payload given to the token

jwt.sign(payload,config.get('jwtSecret'),
{expiresIn:360000},
(err,token)=>{
    if(err)
        throw err;
    res.json({token});
});

} catch (error) {
    console.error(error.message);
    res.status(500).send('Server error');
}

})

module.exports=router; 