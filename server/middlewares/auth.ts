import { NextFunction, Request, Response } from "express";
import { IUser, User } from "../models/User.js";
import jwt  from "jsonwebtoken";

export interface AuthRequest extends Request{
        user?: IUser;
}

export const protect= async (req :AuthRequest,res:Response,next:NextFunction):Promise<void> =>{

    let token;
    if(req.headers.authorization && req.headers.authorization.startsWith("Bearer")){
        try {
            
            // get token from headers
            token =req.headers.authorization.split(" ")[1];

            // verify token
            const decoded= jwt.verify(token,process.env.JWT_SECRET!) as {id:string};

            // get user from the token

            const user = await User.findById(decoded.id).select("-password")

            if(!user){
                res.status(401).json({message:"not authorized , user not found"})
                  return ;
            }    

            req.user=user
            next()
        } catch (error) {
             console.error("auth middlware error:",error)
        res.status(401).json({message:"not authorized , token failed"})
        return;
        }
    }

    if(!token){
        res.status(401).json({message:"not authorized no token"})

    }
}


export const adminOnly =async (req :AuthRequest,res:Response,next:NextFunction):Promise<void> =>{

    if(req.user && req.user.role==="admin"){
        next()
    }else{
        res.status(403).json({message:"access denied , admin role required"})
    }

}
export const ownerOnly =async (req :AuthRequest,res:Response,next:NextFunction):Promise<void> =>{

    if(req.user && (req.user.role==="owner" || req.user.role==="admin")  ){
        next()
    }else{
        res.status(403).json({message:"access denied , not owner ,admin role required"})
    }


}