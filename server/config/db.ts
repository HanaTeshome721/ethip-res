import mongoose from "mongoose";

const connectDB = async ()=>{
    try {
        mongoose.connection.on("connected", ()=>console.log("Mongodb connected"))

    await mongoose.connect(process.env.MONGODB_URI!)
        
    } catch (error) {
        console.error("mongodb connection error",error)
        process.exit(1)
    }
}


export default connectDB