import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {config} from "dotenv";

import userRoutes from "./routes/user.routes.js";
import allotmentRoutes from "./routes/allotment.routes.js";
import errorMiddleware from "./middlewares/error.middleware.js";


config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cors({
    origin : [process.env.FRONTEND_URL],
    credentials: true
}));
app.use(cookieParser());


app.use("/api/v1/user", userRoutes);
app.use("/api/v1/allotment", allotmentRoutes);


app.use("/ping", function(req,res){
    res.send("pong");
});

app.use((req,res)=>{
    res.status(404).send("OOPS!! 404 page not found")
});

app.use(errorMiddleware)


export default app ;