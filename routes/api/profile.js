const express=require("express");
const router=express.Router();
const {check,validationResult}=require("express-validator");


const auth=require('../../middleware/auth');


const Profile=require('../../models/Profile');
const User=require('../../models/Users');


//@route    GET api/profile/me
//@desc     get current user profile
//@access   protected
router.get('/me',auth,async(req,res)=>{
    try {
        const profile=await Profile.findOne({user:req.user.id}).populate('user',['name','avatar']);
        if(!profile)
            return res.status(400).json({msg:'There is no profile for this user'});
        
        res.json(profile);
        
    } catch (error) {
        console.log(error);
        res.status(500).send('server Error');
    }
})
module.exports=router; 


//@route    POST api/profile
//@desc     create/update a user profile
//@access   protected


const validationChecks=[
    check('status','Status is required').not().isEmpty(),
    check('skills','Skills is required').not().isEmpty(),
]


//here we have to use two middleware auth and express-validator middleware 
router.post('/',[auth,validationChecks],(req,res)=>{

    const error=validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({err:errors.array()});
    }

})