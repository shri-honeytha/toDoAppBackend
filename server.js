import express from "express"
import cors from "cors"
import mongoose from "mongoose"
import dotenv from "dotenv"

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
    }
)

const taskModel=mongoose.model("Task",taskSchema)

app.post("/tasks",async(req,res)=>{
    const task=await taskModel.create({task:req.body.task})
    res.json(task)
})
app.get("/tasks",async(req,res)=>{
    const tasks=await taskModel.find()
    res.json(tasks)
})
app.delete("/tasks/:id",async(req,res)=>{
    await taskModel.findByIdAndDelete(req.params.id)
    res.json({message:"Task Deleted"})
})



