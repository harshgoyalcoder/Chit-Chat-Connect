const Conversation = require("../models/Conversation");

const router=require("express").Router();

//new conv
router.post("/",async (req,res)=>{
    const newConversation= new Conversation({
        members:[req.body.senderId,req.body.receiverId]
    });

    try{
        const savedConversation=await newConversation.save();
        res.status(200).json(savedConversation);

    }catch(err){
        res.status(500).json(err);
    }
});

//get conv of user
router.get("/:userId",async (req,res)=>{
  // Try to find all conversations for the user.
  try {
    // Find all conversations where the user is a member.
      const conversation=await Conversation.find({
        members:{$in:[req.params.userId]},
      });
      res.status(200).json(conversation);
    }catch(err){
        res.status(500).json(err);
    }
});


//get conv includes two userId
router.get("/find/:firstUserId/:secondUserId",async (req,res)=>{
 // Try to find a conversation that has both the specified first and second user as members.
 try{
      const conversation=await Conversation.findOne({
        members:{$all:[req.params.firstUserId,req.params.secondUserId]},
      });
      res.status(200).json(conversation);
    }catch(err){
        res.status(500).json(err);
    }
});

module.exports=router;
