**Student Management System**

A web-based application for managing student information, attendance, and other academic activities.

**Development Guide**

This section documents the development of the project step by step, starting from the initial project setup.

The purpose of this documentation is to explain not only what was implemented, but also how and why each part of the project was implemented.

**Step 1: Backend + Database Setup**

First, we will set up the backend server and database for the Student Management System.

1. Create the Server Directory

We create a separate server directory for all backend-related code.

cd server

2. Initialize the Node.js Project

Initialize a Node.js project using: npm init

This creates a package.json file, which keeps track of the project's dependencies and configuration.

3. Install Required Dependencies

Install the required backend dependencies:

npm i bcryptjs cloudinary cookie-parser cors dotenv express jsonwebtoken mongoose multer nodemailer --save

Install Nodemon for development:

npm i nodemon --save

These dependencies will be used later as different features of the application are implemented.

4. Setup the Backend Server

After installing the dependencies, we set up the Express.js server.

The Express server acts as the backend of our application and will handle requests coming from the frontend.

At this stage, our main goal is simply to make sure that the backend server is running successfully.

5. Setup MongoDB

Next, we set up MongoDB as the database for the application.

MongoDB will be used to store the data required by the Student Management System.

We use Mongoose to establish a connection between our Node.js backend and MongoDB.




**Step 2 : Setup Error Handling**




To handle errors properly throughout the application, we created a centralized error-handling system.

**1. Create Error Middleware**

Created:

`middlewares/error.middleware.js`

The error middleware is responsible for:

- Handling errors generated in the application
- Setting a default status code when one is not provided
- Setting a default error message
- Sending a consistent error response to the client
- Providing the error stack for debugging

**2. Create AppError Utility**

Created:

`utils/error.util.js`

The `AppError` utility is a custom error class used to create application-specific errors.

It allows us to define:

- Custom error messages
- HTTP status codes
- Error stack traces




**Step 3 : User Module**



After setting up error handling, we implemented the **User Module**.
The User Module is responsible for managing user registration, login, logout, and profile-related operations.

**1. Create User Model**

Created:

`models/user.model.js`

The User Model defines the structure of user data that will be stored in MongoDB.
It also contains the functionality required for password handling and JWT token generation.

**2. Create User Controller**

Created:

`controllers/user.controller.js`

The User Controller contains the logic for handling user-related operations.
Currently, it handles:

- User registration
- User login
- User logout
- Fetching the logged-in user's profile
- Checking whether the email already exists
- Generating JWT authentication tokens
- Setting authentication cookies

**3. Create User Routes**

Created:

`routes/user.routes.js`

The User Routes define the API endpoints for user-related operations.
Currently, the following routes are implemented:

- `POST /register` — Register a new user
- `POST /login` — Login an existing user
- `GET /logout` — Logout the current user
- `GET /me` — Get the profile of the logged-in user

**4. Create Authentication Middleware**

Created:

`middlewares/auth.middleware.js`

The authentication middleware is used to protect routes that require the user to be logged in.
It checks for the JWT token stored in the user's cookie and verifies the token using the JWT secret.
If the token is valid, the user's information is attached to the request and the request is allowed to continue.
If the token is missing, an authentication error is returned.

**5. User Authentication Flow**

The current authentication flow works as follows:

`Register → Generate JWT → Store Token in Cookie`

`Login → Verify Credentials → Generate JWT → Store Token in Cookie`

`Protected Route → Verify Token → Access User Profile`