const router=require("express").Router();
const User=require("../models/User");
const bcrypt=require("bcrypt");
//Register
router.post("/register",async(req,res)=>{
    try{
        //generate new password
        const salt=await bcrypt.genSalt(10);
        const hashedPassword=await bcrypt.hash(req.body.password,salt)
        //create new user
        const newUser=new User({
            username:req.body.username,
            email:req.body.email,
            password:hashedPassword,
        });

        //save user and respond
        const user= await newUser.save();
        res.status(200).json(user);
    }catch(err){
        console.log("error",err);

    }
});
//Login
router.post("/login",async(req,res)=>{
   try{
    const user = await User.findOne({email:req.body.email});
    if(!user){
         res.status(401).json("User not found");
        return;
    }
    
  // Compare the password entered by the user to the password stored in the database.
    const validPassword=await bcrypt.compare(req.body.password,user.password);
    if(!validPassword){
        res.status(401).json("Wrong Password Entered");
    }
    res.status(200).json(user);

   }catch(err){
    console.log("Error!",err);
   }
})




module.exports=router;