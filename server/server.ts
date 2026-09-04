import "dotenv/config";
import express, { NextFunction, Request, Response } from 'express';
import cors from "cors";
import connectDB from "./config/db.js";
import authRouter from "./routes/authRoutes.js";
import restaurantRouter from "./routes/restaurantRoutes.js";
import bookingRouter from "./routes/bookingRoute.js";

const app = express();

// connect to mongoDB

await connectDB()

// Middleware
app.use(cors())
app.use(express.json());

const port = process.env.PORT || 5000;

app.use('/api/auth',authRouter)
app.use('/api/restaurants',restaurantRouter)
app.use('/api/bookings',bookingRouter)


// global erro handeller
app.use((err:Error,req:Request,res:Response,next:NextFunction)=>{
    console.error("unhandel error:",err)
    res.status(500).json({
        message:err.message || "Internal server error",
        stack:process.env.NODE_ENV === "production" ? undefined :err.stack,
    })
})

app.get('/', (req: Request, res: Response) => {
    res.send('Server is Live!');
});

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});