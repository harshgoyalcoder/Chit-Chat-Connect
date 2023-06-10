const Message = require("../models/Message");

const router=require("express").Router();

//add
router.post("/",async (req,res)=>{
    // Create a new Message object from the request body.
    const newMessage= new Message(req.body);
      // Try to save the message to the database.

    try{
        const savedMessage=await newMessage.save();
        res.status(200).json(savedMessage);

    }catch(err){
        res.status(500).json(err);
    }
});

//get
router.get("/:conversationId",async (req,res)=>{
    try{
      const messages=await Message.find({
        conversationId:req.params.conversationId,
      });
      res.status(200).json(messages);
    }catch(err){
        res.status(500).json(err);
    }
});

module.exports=router;
