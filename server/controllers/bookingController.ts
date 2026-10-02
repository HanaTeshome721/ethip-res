
import { Request, Response } from 'express';
import { AuthRequest } from '../middlewares/auth.js';
import { Restaurant } from '../models/Restaurant.js';
import { Booking } from '../models/Booking.js';

// create a new booking
// POST /api/bookings
// @access private

export const createBooking= async(req:AuthRequest,res:Response) : Promise<void>=>{
    try {
        const {restaurantId, date,time,guests,occasion,specialRequests} = req.body

        if(!restaurantId || !date || !time || !guests || !occasion ||!specialRequests){
            res.status(400).json({message:"pls provide all required reservation details"})
            return;

        }
        // check if restaurant exists
        const restaurant = await Restaurant.findById(restaurantId)

        if(!restaurant){
            res.status(404).json({message:"Restaurant not found"})
            return;
        }

        if(restaurant.status !== "approved"){
           res.status(400).json({message:"restaurant not open for this restaurant"})
           return;     
        }

        // verify seat availability
        const requestedGuests =Number(guests);

        const existingBookings=await Booking.find({
            restaurant:restaurantId,
            data:new Date(date),
            time,
            status:"confirmed"
        })

        const bookingSeats = existingBookings.reduce((sum,b)=> sum +b.guests,0)

        const totalSeats =restaurant.totalSeats || 20 ;

        const availableSeates= totalSeats -bookingSeats

        if(requestedGuests > availableSeates){
            res.status(400).json({
                message: `unable to reserve. only ${availableSeates} seates are available for this time slot`
            })
        }

        const booking = await Booking.create({
            user: req.user?._id,
            restaurant: restaurantId,
            date: new Date(date),
            time,
            guests: Number(guests),
            occasion,
            specialRequests,
            status: "confirmed",
        })

        // populate restaurant info before returning
        const populateBooking =await booking.populate("restaurant","name location image address") 

        res.status(201).json(populateBooking)

    } catch (error:any) {
       console.error(error);
       res.status(400).json({message:error.message}) 
    }
}


// get logged in user booking
// GET /api/bookings/my
// @access private

export const getMyBooking= async(req:AuthRequest,res:Response) : Promise<void>=>{
    try {
        const booking =await Booking.find({user:req.user?._id}).populate("restaurant", "name location image address slug").sort({date:-1,time:-1})
        res.json(booking)
    } catch (error:any) {
       console.error(error);
       res.status(400).json({message:error.message}) 
    }
}


// cancel a booking
// PUT /api/bookings/:id/cancel
// @access private

export const cancelBooking= async(req:AuthRequest,res:Response) : Promise<void>=>{
    try {
        
        const booking= await Booking.findById(req.params.id);

        if(!booking){
            res.status(404).json({message:"booking not found"})
            return;
        }

        // verify user own the booking

        if(booking.user.toString() !==  req.user?._id.toString()){
            res.status(401).json({message:" not authorized to cancel booking "})
            return;
        }

        booking.status="cancelled"
        await booking.save()

        const populateBooking = await booking.populate("restaurant"," name location image address")

        res.json(populateBooking)
    } catch (error:any) {
       console.error(error);
       res.status(400).json({message:error.message}) 
    }
}