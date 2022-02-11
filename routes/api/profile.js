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
router.post('/',[auth,validationChecks],async(req,res)=>{

    const error=validationResult(req);
    if(!error.isEmpty()){
        return res.status(400).json({err:error.array()});
    }

    const {company,website,location,bio,status,githubusername,
        skills,youtube,facebook,twitter,instagram,linkedin
    }=req.body;

    //build profile object
    const profileFields={};
    profileFields.user=req.user.id; // this user id in request comes after the token is decoded (auth middleware:: line(24))
    
    if(company) profileFields.company=company;
    if(website) profileFields.website=website;
    if(location) profileFields.location=location;
    if(bio) profileFields.bio=bio;
    if(githubusername) profileFields.githubusername=githubusername;

    if(status) profileFields.status=status;
    if(skills){
        profileFields.skills=skills.split(',').map(skill=>skill.trim());
    }

    //build social objects
    profileFields.social={};
    if(youtube) profileFields.social.youtube=youtube;
    if(facebook) profileFields.social.facebook=facebook;
    if(twitter) profileFields.social.twitter=twitter;
    if(linkedin) profileFields.social.linkedin=linkedin;
    if(instagram) profileFields.social.instagram=instagram;

    //save profile details on database
    try {
        
        let profile=await Profile.findOne({user:req.user.id});
        if(profile){
            //profile already exist that means profile is being updated
            profile=await Profile.findOneAndUpdate({user:req.user.id},{$set:profileFields},{new:true});
            return res.json(profile);
        }

        //create the profile
        profile=new Profile(profileFields);
        await profile.save();
        res.json(profile);


    } catch (error) {
        console.log(error);
        res.status(500).send('Server Error');
    }

})



//@route    GET api/profile
//@desc     Get all profile
//@access   public

router.get('/',async(req,res)=>{
    try {
      
        const profiles=await Profile.find().populate('user',['name','avatar']);
        res.json(profiles);

    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');        
    }
})


//@route    GET api/profile/user/:user_id
//@desc     Get profile by user Id 
//@access   public

router.get('/user/:user_id',async(req,res)=>{
    try {
        const profile=await Profile.findOne({user:req.params.user_id}).populate('user',['name','avatar']);
        if(!profile)return res.status(400).json({msg:"Profile not found"});
        res.json(profile);

    } catch (error) {
        console.error(error.message);
        if(err.kind=='ObjectId'){
            if(!profile)return res.status(400).json({msg:"Profile not found"});
        }
        res.status(500).send('Server Error');        
    }
})



//@route    Delete api/profile
//@desc     Delete profile user and post
//@access   private

router.delete('/',auth,async(req,res)=>{
    try {
        //remove users posts

        //Remove profile and user
        await Profile.findOneAndRemove({user:req.user.id}); //again, the auth middleware will add the user id 
        await User.findOneAndRemove({_id:req.user.id}); //again, the auth middleware will add the user id 
        
        res.json({msg:"user deleted"});


    } catch (error) {
        console.error(error.message);
        res.status(500).send('Server Error');        
    }
})
