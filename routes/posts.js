const Post = require("../models/Post");
const User = require("../models/User");

const router=require("express").Router();

//create a post
router.post("/",async (req,res)=>{
    const newPost=new Post(req.body);
    try{
        const savedPost=await newPost.save();
        res.status(200).json(savedPost);
    }catch(err){
        res.status(500).json(err);
    }   
});

//update a post
router.put("/:id", async(req,res)=>{
    //req.params.id ==  // Get the post ID from the request path parameters.
    // Try to find the post with the specified ID.
    try{
        const post=await Post.findById(req.params.id);
        
    // Check if the user is trying to update their own post.
        if(post.userId===req.body.userId){
               // Update the post with the data from the request body.
            await post.updateOne({$set:req.body});
            res.status(200).json("the post has been updated");
        }else{
            res.status(403).json("You can  update only your post")
        }

    }catch(err){
        res.status(500).json(err);
    }
});
//delete a post
router.delete("/:id", async(req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
        if(post.userId===req.body.userId){
            await post.deleteOne();
            res.status(200).json("the post has been deleted")
        }else{
            res.status(403).json("You can delete only your post")
        }

    }catch(err){
        res.status(500).json(err);
    }
});

// like/dislike a post

router.put("/:id/like",async (req,res)=>{
    try{
        const post=await Post.findById(req.params.id);
 // Check if the user has already liked the post.
       if (!post.likes.includes(req.body.userId)) {
    // If not, add the user to the list of likes.
            await post.updateOne({$push:{likes:req.body.userId}});
            res.status(200).json("You liked the post");
        }else{
            // If the user has already liked the post, remove them from the list of likes.
            await post.updateOne({$pull:{likes:req.body.userId}});
            res.status(200).json("You unliked the post");
        }
    }catch(err){
        res.status(500).json(err);
    }
})

//get a post

router.get("/:id",async(req,res)=>{
    try{
        const post = await Post.findById(req.params.id);
        res.status(200).json(post);

    }catch(err){
        res.status(500).json(err);
    }
})

//get timeline posts
router.get("/timeline/:userId",async (req,res)=>{
    // let postArray=[];
    try{
        // Get the user who is requesting the timeline
        const currentUser=await User.findById(req.params.userId);
        // Get the posts that the user has made
        const userPosts=await Post.find({userId:currentUser._id});
          // Get the posts that the user's friends have made
        const friendPosts=await Promise.all(
            currentUser.following.map((friendId)=>{
                // Get the posts for the specified friend
                return Post.find({userId:friendId});
            })
        );
         // Combine the user's posts and their friends' posts and  Return the combined list of posts
        res.status(200).json(userPosts.concat(...friendPosts));
    }catch(err){
        res.status(500).json(err);
    }
});
//get user's all posts
router.get("/profile/:username",async (req,res)=>{
    try{
        const user=await User.findOne({username:req.params.username});
        const posts=await Post.find({userId:user._id});
        res.status(200).json(posts);
    }catch(err){
        res.status(500).json(err);
    }
});


module.exports=router;