
const express=require("express");
const app= express();
const mongoose=require("mongoose");
const dotenv=require("dotenv");
const helmet=require("helmet");
const morgan=require("morgan");
const userRoute=require("./routes/users");
const authRoute=require("./routes/auth");
const postRoute=require("./routes/posts");
const messageRoute=require("./routes/message");
const conversationRoute=require("./routes/conversation");
const multer =require('multer');
const path=require("path");
const cors=require("cors");
const http= require("http");
const socketio = require("socket.io");
const server = http.createServer(app);
// const io = new Server(httpServer);
const PORT= process.env.PORT|| 8000;
const io=socketio(server,{
  cors:{
    
  }
});
// const io=socketio(server,{
//   cors:{
//       origin:"http://localhost:3000",
//   },
// });
app.use(cors()) // Use this after the variable declaration

dotenv.config();




mongoose.connect(process.env.MONGO_URL)
.then(()=>{console.log("Database Connection successful")})
.catch((err)=>{console.log("Error",err)});

app.use("/images", express.static(path.join(__dirname, "public/images")));
// //middleware



app.use(express.json());
app.use(helmet());
app.use(morgan("common"));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, "public/images");
    },
    filename: (req, file, cb) => {
      cb(null, req.body.name);
    },
  });
  
  const upload = multer({ storage: storage });
  app.post("/api/upload", upload.single("file"), (req, res) => {
    try {
      return res.status(200).json("File uploded successfully");
    } catch (error) {
      console.error(error);
    }
  });


  let users=[];
  const addUser = (userId, socketId) => {
    !users.some((user) => user.userId === userId) &&
      users.push({ userId, socketId });
  };
  
  const removeUser = (socketId) => {
    users = users.filter((user) => user.socketId !== socketId);
  };
  
  const getUser = (userId) => {
    return users.find((user) => user.userId === userId);
  };
  // io.on("connection", (socket) => {
  //   // ...
  //  
  //   // console.log("user connected!")
  // });
  


io.on("connection",(socket)=>{
  //when connected
   console.log("a user connected");
//take userId and socketId from user
socket.on("addUser", (userId) => {
  addUser(userId, socket.id);
  io.emit("getUsers", users);
});

//send and get message
socket.on("sendMessage", ({ senderId, receiverId, text }) => {
  const user = getUser(receiverId);
  io.to(user.socketId).emit("getMessage", {
    senderId,
    text,
  });
});

//when disconnect
socket.on("disconnect", () => {
  console.log("a user disconnected!");
  removeUser(socket.id);
  io.emit("getUsers", users);
});
});


app.use("/api/users",userRoute);
app.use("/api/auth",authRoute);
app.use("/api/posts",postRoute);
app.use("/api/message",messageRoute);
app.use("/api/conversation",conversationRoute);


server.listen(PORT,()=>{
    console.log("Jai Shree Krishna");

});