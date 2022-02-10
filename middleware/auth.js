//this is for verifying user access by checking the authenticity  of token

const jwt=require('jsonwebtoken');
const config=require('config');



module.exports=function(req,res,next){

    //get token from header
    const token=req.header('x-auth-token');


    //check if no token
    if(!token)
        return res.status(401).json({msg:'No token, authorization denied'});
    
    //verify token
    try {
        jwt.verify(token, config.get("jwtSecret"), (error, decoded) => {
            if (error) {
              return res.status(401).json({ msg: "Token is not valid" });
            } 
            req.user = decoded.user;
            next();
        })
    } catch (error) {
        res.status(401).json({msg:"token is not valid"});
    }


}