import AppError from "../utils/error.util.js";
import jwt from "jsonwebtoken";

const isLoggedIn = (req, res, next) => {
    try {
        // Check whether the authentication cookie exists
        const token = req.cookies?.token;

        if (!token) {
            return next(
                new AppError("Please login to access this resource.", 401)
            );
        }
        // Verify JWT token
        const userDetails = jwt.verify(token, process.env.JWT_SECRET );

        // Ensure decoded token contains a valid payload
        if (
            !userDetails ||
            typeof userDetails !== "object" ||
            !userDetails.id ||
            !userDetails.role
        ) {
            return next(
                new AppError("Invalid authentication token.", 401)
            );
        }

        // Attach authenticated user information
        req.user = userDetails;

        next();

    } catch (error) {
        if (
            error.name === "TokenExpiredError" ||
            error.name === "JsonWebTokenError" ||
            error.name === "NotBeforeError"
        ) {
            return next(
                new AppError("Session expired or invalid. Please login again.", 401)
            );
        }

        next(error);
    }
};

const authorizeRoles = (...roles) => {
    return (req, res, next) => {

        // Ensure user is authenticated
        if (!req.user) {
            return next(
                new AppError("Please login first.", 401)
            );
        }

        // Check user permissions
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


export {
    isLoggedIn,
    authorizeRoles
};
