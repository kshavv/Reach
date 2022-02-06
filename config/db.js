const mongoose=require("mongoose");
const config=require("config");  //we can access all the config variables using this

const db=config.get('mongoURI');


const connectDB= async()=>{

    try {
        await mongoose.connect(db);
        console.log("mongo DB connected...");
    } catch (error) {
        console.error(error.message);
        process.exit(1);
    }

}


module.exports=connectDB;

