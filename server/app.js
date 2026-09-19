import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import {config} from "dotenv";

import userRoutes from "./routes/user.routes.js";
import allotmentRoutes from "./routes/allotment.routes.js";
import subjectRoutes from "./routes/subject.routes.js";
import routineRoutes from "./routes/routine.routes.js";
import attendanceRoutes from "./routes/attendance.routes.js";
import viewRoutes from "./routes/view.routes.js";
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
app.use("/api/v1/subject", subjectRoutes);
app.use("/api/v1/routine", routineRoutes);
app.use("/api/v1/attendance", attendanceRoutes);
app.use("/api/v1/view", viewRoutes);


app.use("/ping", function(req,res){
    res.send("pong");
});

app.use((req,res)=>{
    res.status(404).send("OOPS!! 404 page not found")
});

app.use(errorMiddleware)


export default app ;