const express=require("express");
const router=express.Router();
const {check,validationResult}=require("express-validator");


const User=require('../../models/Users');


const  gravatar=require('gravatar');
const bcrypt=require('bcryptjs');


const jwt=require("jsonwebtoken");
const config=require("config");  //we can access all the config variables using this



//@route    POST api/users
//@desc     Register user
//@access   Public

//array of different checks for the express validator
const regDataCheck=[
        check('name','name is required').not().isEmpty(),
        check('email','please include a valid email').isEmail(),
        check('password','please enter a password with 6 or more character').isLength({min:6})    
    ];

router.post('/',regDataCheck,async(req,res)=>{
    const errors=validationResult(req); 
    if(!errors.isEmpty()){
        return res.status(400).json({errors:errors.array()});
    }

    const {name,email,password}=req.body;
    try {
    //check if user already exist
    let user=await User.findOne({email:email});
    if(user){
        return res.status(400).json({errors:[{msg:'user already exist'}]});
    }   

    //create the user using the entered details otherwise
    const avatar=gravatar.url('email',{s:'200',r:'pg',d:'mm'});
    user=new User({
        name,
        email,
        password,
        avatar
    });
 
    //encrypt password using bcrypt
    const salt=await bcrypt.genSalt(10);
    user.password=await bcrypt.hash(password,salt);
    await user.save(); //now finally we can save the user  in the database


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