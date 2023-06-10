const router=require("express").Router();
const User=require("../models/User");
const bcrypt=require("bcrypt");



//update user
//**************here we will use put becoz it is updating process
router.put("/:id", async(req,res)=>{ 
    
  // Check if the user is updating their own account or is an admin.
    if(req.body.userId=== req.params.id || req.body.isAdmin){
        //here params.id is the "/:id"
        // The `params.id` variable is the ID of the user account being updated.

         // Check if the user has provided a new password.
        if(req.body.password){
            // Generate a salt for the new password.
            try{
                const salt=await bcrypt.genSalt(10);
                req.body.password=await bcrypt.hash(req.body.password,salt);
            }catch(err){
                return res.status(500).json(err);
            }
        }
        try{
            const user=await User.findByIdAndUpdate(req.params.id,{
                $set: req.body,
        });
            res.status(200).json("account has been updated")
        }catch(err){
            return res.status(500).json(err);
            
        }}
        else{
            return res.status(403).json("You can update only your account!");
        }
    
});


//delete user

router.delete("/:id", async(req,res)=>{
    // res.send("Jai Shree Krishna");
    if(req.body.userId=== req.params.id || req.body.isAdmin){
      
        try{
            await User.findByIdAndDelete(req.params.id);
            res.status(403).json("account has been deleted!");
        }catch(err){
            return res.status(500).json(err);
            
        }}
        else{
            return res.status(403).json("You can delete only your account!");
        }
    
});


//get a user

router.get("/",async (req,res)=>{
      // Get the user ID from the request query parameters
    const userId=req.query.userId;
    const username=req.query.username;
    try{
        const user= userId? await User.findById(userId) : await User.findOne({username:username});
        // Remove the password and updatedAt properties from the user object
        //unnecessary information like password/updatedAt needs to hidden
        //user._doc contains all other information
        const {password,updatedAt,...other}=user._doc;
        // Send the user object back to the client as a JSON response
        res.status(200).json(other);

    }catch(err){
        res.status(500).json(err);
    }
})
//get all users that have registered
router.get("/all", async (req, res) => {
    // Find all users in the database
    try{

        const users = await User.find();
        res.status(200).json(users);
    }catch(err){
        console.log(err);
    }
  
    // Remove the password and updatedAt properties from the user objects
    // Unnecessary information like password/updatedAt needs to be hidden
    // user._doc contains all other information
    // const usersWithoutPassword = users.map(user => ({
    //   ...user._doc,
    //   password: undefined,
    //   updatedAt: undefined,
    // }));
  
    // Send the user objects back to the client as a JSON response
  });
  
//get friends
router.get("/friends/:userId",async(req,res)=>{
    try{
      const user=await User.findById(req.params.userId);
      // Get the user's friends
      const friends=await Promise.all(
    // For each friend ID in the user's following list,
    // find the user with that ID
        user.following.map((friendId)=>{
            return User.findById(friendId);
        })
      );
      let friendList=[];
  // For each friend,
  // extract the friend's ID, username, and profile picture
  // and add them to the friendList array
      friends.map((friend)=>{
        const{_id,username,profilePicture}=friend;
        friendList.push({_id,username,profilePicture});
      });
      res.status(200).json(friendList);
    }catch(err){
        res.status(500).json(err);
    }
});

//follow a user
router.put("/:id/follow",async (req,res)=>{
    // Check if the user is trying to follow themselves   
    if(req.body.userId!== req.params.id ){
        // Get the user ID from the request body
        try{
            const user=await User.findById(req.params.id);
            const currentUser=await User.findById(req.body.userId);
              // Check if the user is already following the specified user
             if(!user.followers.includes(req.body.userId)){  

                  // Update the user's followers and following lists
                await user.updateOne({$push:{followers:req.body.userId}});
                await currentUser.updateOne({$push:{following:req.params.id}});
                res.status(200).json("user has been followed");
            }else{
                res.status(403).json("You are already following this user")
            }
        }catch(err){
            res.status(500).json(err);
        }
        
        }else{
            res.status(403).json("You can't follow youself");

        }
});


//unfollow a user

router.put("/:id/unfollow",async (req,res)=>{
    if(req.body.userId!== req.params.id ){
        try{
            const user=await User.findById(req.params.id);
            const currentUser=await User.findById(req.body.userId);
            if(user.followers.includes(req.body.userId)){
                await user.updateOne({$pull:{followers:req.body.userId}});
                await currentUser.updateOne({$pull:{following:req.params.id}});
                res.status(200).json("user has been unfollowed");
                console.log("user unfollowed");
            }else{
                res.status(403).json("You don't follow this user")
             }
        }catch(err){
        res.status(500).json("err in follow");
        }
       
        }else{
            res.status(403).json("You can't unfollow youself");

        }
});

module.exports=router;