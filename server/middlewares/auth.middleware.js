import AppError from "../utils/error.util.js";
import jwt from "jsonwebtoken";

const isLoggedIn = async(req,res,next)=>{
    const {token} = req.cookies;

    if(!token){
        return next(new AppError("Unauthenticated, please login again.",401));
    }

    const userDetails =await jwt.verify(token, process.env.JWT_SECRET);

    req.user = userDetails;

    next();
};


const authorizeRoles = (...roles) => {

    return (req, res, next) => {

        // req.user is created by isLoggedIn middleware
        if (!req.user) {
            return next(
                new AppError(
                    "User is not authenticated.",
                    401
                )
            );
        }


        // Check whether user's role is allowed
        if (!roles.includes(req.user.role)) {

            return next(
                new AppError(
                    "You are not authorized to access this resource.",
                    403
                )
            );
        }


        next();
    };
};



export{
    isLoggedIn, authorizeRoles
}