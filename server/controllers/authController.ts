import { Request,Response } from "express"
import jwt from 'jsonwebtoken'
import { User } from "../models/User.js"
import bcrypt from "bcrypt"
import { AuthRequest } from "../middlewares/auth.js"


// HELPer to generate JWT token
const generateToken =(id:string)=>{
    return jwt.sign({id}, process.env.JWT_SECRET as string, {expiresIn:"30d"})
}

// Register a new user
//POST  /api/auth/register

export const registerUser= async (req:Request,res:Response) : Promise<void> => {
    try {
        const {name,email,password,phone,role}=req.body
        if (!name  || !email || !password){
             res.status(400).json({message:"pls enter all required fields"})
             return ;
        }

        // check if user exists

        const userExist = await User.find({email})
        if (userExist){
            res.status(400).json({message:"user already exist"})
            return ;
        }

        // HASH paswword
        const salt=  await bcrypt.genSalt(10)
        const hasehdPassword = await bcrypt.hash(password,salt)

        // create user
        const user =await User.create({
            name,
            email,
            password:hasehdPassword,
            phone,
            role,
        })

        if(user){
            res.status(201).json({
                _id:user._id,
                name: user.name,
                email:user.email,
                phone:user.phone,
                role:user.role,
                token: generateToken(user._id.toString())
            })
        }else{
            res.status(400).json({message:"Invalid user data"})
        }

    } catch (error:any) {
        console.error(error)
        res.status(400).json({message:error.message})
    }
}

// Register a new user and get token
//POST  /api/auth/login

export const loginUser= async (req:Request,res:Response) : Promise<void> => {
    try {
        
        
         const {email,password}=req.body
        if ( !email || !password){
             res.status(400).json({message:"pls provide email and password fields"})
             return ;
        }

        // check if user exists

        const user = await User.findOne({email})
        if (!user){
            res.status(400).json({message:"user not  exist , register "})
            return ;
        }

        // check if password match

        const isMatch = await bcrypt.compare(password,user.password || "")

        if(!isMatch){
             res.status(401).json({message:"invalid email or password"})
            return ;
        }

         res.json({
                _id:user._id,
                name: user.name,
                email:user.email,
                phone:user.phone,
                role:user.role,
                token: generateToken(user._id.toString())
            })

        
    } catch (error:any) {
        console.error(error)
        res.status(400).json({message:error.message})
    }
}
// get user profile
//GET /api/auth/me
// access private

export const getMe= async (req:AuthRequest,res:Response) : Promise<void> => {
    try {
        if(!req.user){
            res.status(401).json({message:"not authorized"})
        }
    res.json(req.user)

    } catch (error:any) {
         console.error(error)
        res.status(400).json({message:error.message})
    }
}