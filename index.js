import express from 'express';
import bodyParser from 'body-parser';
import mongoose from 'mongoose';
import userRouter from './routes/userRouter.js';
import productRouter from './routes/productRouter.js';
import verifyJWT from './middleware/auth.js';
import orderRouter from './routes/orderRouter.js';

let app = express();

mongoose.connect("mongodb+srv://admin:123@cluster0.l9vfy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0").then(
    ()=>{
        console.log("Connected to the database");
    }
).catch(
    ()=>{
        console.log("Connectin failed");
    }
)

app.use(bodyParser.json());
app.use(verifyJWT)


app.use("/api/user",userRouter);
app.use("/api/product",productRouter);
app.use("/api/order",orderRouter)

app.listen(5000,
    ()=>{
        console.log("Server is running on port 5000")
    }
)