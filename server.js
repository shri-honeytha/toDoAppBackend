import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken";
const SECRET="mysecret123";

dotenv.config()

const app=express()
app.use(cors())
app.use(express.json())

mongoose.connect(process.env.MONGO_URI)
const PORT=process.env.PORT || 5000
app.listen(PORT,()=>{
    console.log("Server Started")
})

const taskSchema=mongoose.Schema(
    {
        task:String,
        email:String
    }
)

const taskModel=mongoose.model("Task",taskSchema)

const authenticate=async (req,res,next)=>{

    try{
    const authHeader=req.headers.authorization
    const token=authHeader.split(" ")[1] //[0] is Bearer and [1] is abc from authHeader, it will extract the token abc
   const user=await jwt.verify(token,SECRET)
   req.user=user
   next()
    }
    catch(error){
 res.json({message:"Unauthorized"})
    }
}

app.post("/tasks",authenticate,async(req,res)=>{
    const task=await taskModel.create({task:req.body.task,
        email:req.user.email
    })
    res.json(task)
})
app.get("/tasks",authenticate,async(req,res)=>{
    const tasks=await taskModel.find({email:req.user.email})
    res.json(tasks)
})
app.delete("/tasks/:id",authenticate,async(req,res)=>{
    await taskModel.findByIdAndDelete({_id:req.params.id,
        email:req.user.email}
    )
    res.json({message:"Task Deleted"})
})
const userSchema = new mongoose.Schema({
  name:String,
  email: {
    type: String,
    unique: true,
  },
  password: String,
});

const userModel = mongoose.model("User", userSchema);

app.post("/users/register", async (req, res) => {
 

    const {name,email,password,role} = req.body;
    const hashedPassword=await bcrypt.hash(password,10)
    const user=await userModel.create({
        name, email, password:hashedPassword,role
    })
    res.json(user)
   
} )

app.post("/users/login", async (req, res) => {
  
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });
    if(user){
        const chkPassword=await bcrypt.compare(password,user.password)
        if(chkPassword){
            const obj={
id: user._id,
name:user.name,
    email:user.email,role:user.role
            }
            const token=await jwt.sign(obj,SECRET,{expiresIn:"1h"})
            res.json({...obj,token,success:true})
        }
        else{
            res.json({message:"Invalid Password",success:false})
        }
    
    }
    else{
        res.json({message:"user not found",success:false})
    }
});



// const authorize=(...roles)=>{
//     return (req,res,next)=>{
//         if(roles.includes(req.user.role)){
//             next()
//         }else{
//             res.json({message:"Access Denied"})
//         }
//     }
// }

// app.get("/users", authenticate,authorize("admin"),async (req, res) => {
//     const users = await userModel.find();
//     res.json(users);
// });



