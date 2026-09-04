import {Router} from 'express';
import { createOwnerRestaurant, getOwnerBooking, updateBookingStatus, updateOwnerRestaurant } from '../controllers/ownerController.js';
import upload from '../config/multer.js';
import { protect } from '../middlewares/auth.js';


const ownerRouter= Router();

ownerRouter.use(protect)
ownerRouter.use(ownerRouter)

ownerRouter.get("/restaurant",getOwnerBooking)
ownerRouter.post("/restaurant",upload.single("image"),createOwnerRestaurant)
ownerRouter.put("/restaurant",upload.single("image"),updateOwnerRestaurant)
ownerRouter.get("/bookings",getOwnerBooking)
ownerRouter.put("/bookings/:id/status",updateBookingStatus)


export default ownerRouter