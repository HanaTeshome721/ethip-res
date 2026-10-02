

import { Response } from "express";
import { AuthRequest } from "../middlewares/auth.js";
import { Restaurant } from "../models/Restaurant.js";
import { User } from "../models/User.js";
import { Booking } from "../models/Booking.js";


// get all restaurant for admin management
// GET /api/admin/restaurants
export const getAllRestaurants = async(req:AuthRequest,res:Response): Promise<void> => {

    try {
        
        const restaurant = await Restaurant.find({}).populate('owner', "name email phone").sort({createdAt:-1})

        res.json(restaurant)

    } catch (error:any) {
     
        console.error(error)
        res.status(400).json({message:error.message})
    }
}



// approve/reject restaurant 
// PUT /api/admin/restaurant/:id/approve
export const approveRestaurant = async(req:AuthRequest,res:Response): Promise<void> => {

    try {

        const {status}= req.body;
        if(!status || !["approved","rejected","pending"].includes(status)){
            res.status(400).json({message:"pls provide a valid approval status"})
            return;
        }

        const restaurant = await Restaurant.findById(req.params.id)

        if(!restaurant){
            res.status(404).json({message:"restaurant profile not found "})
            return;
        }
        restaurant.status=status;
        res.json(restaurant);
    } catch (error:any) {
     
        console.error(error)
        res.status(400).json({message:error.message})
    }
}

// get system statisics
// GET /api/admin/stats
export const getAdminStats = async(req:AuthRequest,res:Response): Promise<void> => {

    try {
        const totalUsers= await User.countDocuments({role:"user"})
        const totalOwners= await User.countDocuments({role:"owner"})

        const totalBooking= await Booking.countDocuments({})
        const totalRestaurants= await Restaurant.countDocuments({})
        
        //GET latest 10 bookings
        const lastestBooking = await Booking
        .find({}).populate('user',"name email").populate("restaurant","name").sort({createdAt:-1}).limit(10) 

        res.json({
            users:{
                totalUsers,
                totalOwners,
                total: totalOwners + totalUsers,
            },
            restaurants:{
                total:totalRestaurants,
            },
            bookings:{
                total:totalBooking,
            },
            lastestBooking,

        })

    } catch (error:any) {
     
        console.error(error)
        res.status(400).json({message:error.message})
    }
}