import { Router } from "express";
import { approveRestaurant, getAdminStats, getAllRestaurants } from "../controllers/adminController.js";
import { adminOnly, protect } from "../middlewares/auth.js";

const adminRouter =Router()


adminRouter.use(protect)
adminRouter.use(adminOnly)

adminRouter.get('/restaurant',getAllRestaurants)
adminRouter.put('/restaurant/:id/approve',approveRestaurant)
adminRouter.get('/stats',getAdminStats)


export default adminRouter