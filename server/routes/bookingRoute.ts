import { Router } from "express";
import { cancelBooking, createBooking, getMyBooking } from "../controllers/bookingController.js";
import { protect } from "../middlewares/auth.js";


const bookingRouter =Router()

bookingRouter.post('/',protect,createBooking)
bookingRouter.get('/my',protect,getMyBooking)
bookingRouter.put('/:id/',protect,cancelBooking)



export default bookingRouter