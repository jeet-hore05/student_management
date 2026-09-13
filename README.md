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

The User Module is responsible for managing users, authentication, user roles, and role-based access control.

**1. Create User Model**

Created:

`models/user.model.js`

The User Model defines the structure of user data that will be stored in MongoDB.

The model supports three user roles:

- `ADMIN`
- `TEACHER`
- `STUDENT`

It also contains functionality for:

- Password hashing
- Password comparison
- JWT token generation
- Student-specific information
- User data validation

**2. Create User Controller**

Created:

`controllers/user.controller.js`

The User Controller contains the logic for handling user-related operations.

Currently, it handles:

- User login
- User logout
- Fetching the logged-in user's profile
- Creating students
- Creating teachers
- Checking whether the email already exists
- Checking whether the student roll number already exists
- Generating JWT authentication tokens
- Setting authentication cookies

When creating a student, the role is automatically assigned as `STUDENT`.

When creating a teacher, the role is automatically assigned as `TEACHER`.

The user cannot decide their role while creating the account.

**3. Create User Routes**

Created:

`routes/user.routes.js`

The User Routes define the API endpoints for user-related operations.

### Public Routes

These routes can be accessed without authentication:

- `POST /login` — Login an existing user
- `GET /logout` — Logout the current user

### Protected Routes

This route requires the user to be logged in:

- `GET /me` — Get the profile of the logged-in user

### Admin Routes

These routes require the user to be logged in and have the `ADMIN` role:

- `POST /createStudent` — Create a new student
- `POST /createTeacher` — Create a new teacher

**4. Create Authentication Middleware**

Created:

`middlewares/auth.middleware.js`

The `isLoggedIn` middleware is used to verify whether the user is authenticated.

It checks for the JWT token stored in the user's cookie and verifies the token using the JWT secret.

If the token is valid, the user's information is attached to the request through `req.user`.

**5. Create Role Authorization Middleware**

Added:

`authorizeRoles()`

The `authorizeRoles` middleware is responsible for checking whether the authenticated user has permission to access a particular resource.

It checks the user's role from `req.user.role`.

If the user's role is allowed, the request continues to the controller.

If the user's role is not allowed, the request is rejected with a `403` authorization error.

The authorization flow is:

`Request → isLoggedIn → authorizeRoles → Controller`

**6. Role-Based Access Control**

The current system supports the following roles:

| Role | Access |
|---|---|
| `ADMIN` | Can create students and teachers |
| `TEACHER` | Cannot access admin-only routes |
| `STUDENT` | Cannot access admin-only routes |

This prevents users from accessing resources that are not permitted for their role.

**7. Authentication and Authorization Flow**

The current authentication and authorization flow works as follows:

`Login → Verify Credentials → Generate JWT → Store Token in Cookie`

For protected resources:

`Request → Verify JWT → Identify User → Check Role → Allow/Deny Access`

The User Module now provides the foundation for **authentication and role-based authorization** in the application.

**8. File Upload and Password Management**

After implementing authentication and role-based authorization, we added **file upload** and **password management** functionality to the User Module.

**1. Implement File Upload**

File upload functionality was added to the user creation process.

When creating a student or teacher, an optional profile image can be uploaded.

The uploaded image is:

- Validated by the Multer middleware
- Uploaded to Cloudinary
- Resized to `250 × 250`
- Cropped based on the detected face
- Stored in the user's avatar information
- Removed from the local `uploads/` directory after successful upload

The user's avatar stores both the Cloudinary `public_id` and `secure_url`.

**2. Implement Forgot Password**

Added:

`forgotPassword`

The forgot password functionality allows a user to request a password reset using their registered email address.

The process:

`Email → Generate Reset Token → Save Token → Create Reset URL → Send Email`

The reset link is sent to the user's registered email using the email utility.

**3. Implement Reset Password**

Added:

`resetPassword`

The reset password functionality allows the user to set a new password using the reset token received through email.

The reset token is hashed and matched with the stored token.

The token is also checked for expiry before allowing the password to be changed.

After successfully changing the password, the reset token and its expiry are removed.

**4. Implement Change Password**

Added:

`changePassword`

The change password functionality is available to authenticated users.

The process verifies the user's current password before allowing a new password to be set.

The new password is then saved and automatically hashed through the User Model's password hashing logic.

**5. Email Utility**

Created:

`utils/sendEmail.js`

The email utility uses **Nodemailer** and SMTP configuration from environment variables to send emails from the application.

It is currently used for the forgot password functionality.

**6. File Upload Middleware**

Created:

`middlewares/multer.middleware.js`

Multer is used to handle image uploads before they are processed by the controller.

The middleware:

- Accepts `.jpg`, `.jpeg`, `.png`, and `.webp` files
- Limits file size to 50 MB
- Temporarily stores uploaded files in the `uploads/` directory
- Rejects unsupported file types

**7. Password Management Flow**

Forgot password:

`Forgot Password → Generate Token → Send Email → Reset Password`

Change password:

`Login → Verify Current Password → Set New Password`



**Step 4 : Department Allotment Module**

After completing the User Module, we implemented the **Department Allotment Module**.

This module is used to assign students and teachers to their respective departments and maintain department-related information.

**1. Create Department Model**

Created:

`models/department.model.js`

The Department Model defines the structure of department information that will be stored in MongoDB.

It is used to store and manage department details required for student and teacher allotment.

**2. Create Department Allotment Controller**

Created:

`controllers/allotment.controller.js`

The Allotment Controller contains the logic for assigning users to departments.

It handles department allotment according to the user's role and maintains the required relationship between users and departments.

**3. Create Department Allotment Routes**

Created:

`routes/allotment.routes.js`

The Allotment Routes define the API endpoints used for department-related allotment operations.

These routes connect incoming requests with the corresponding allotment controller functions.

**4. Department Allotment Flow**

The department allotment process works as follows:

`Admin Request → Allotment Route → Allotment Controller → Department/User Data → MongoDB`

The department information can then be used by other modules of the Student Management System, such as **attendance, subjects, and routine management**.

**Step 5 : Subject Module**

After completing the Department Allotment Module, we implemented the **Subject Module**.

This module is used to create and manage subjects that are assigned to different departments in the Student Management System.

**1. Create Subject Model**

Created:

`models/subject.model.js`

The Subject Model defines the structure of subject information that will be stored in MongoDB.

It stores the required details of a subject and maintains its relationship with the corresponding department.

**2. Create Subject Controller**

Created:

`controllers/subject.controller.js`

The Subject Controller contains the logic for handling subject-related operations.

It is responsible for:

* Creating subjects
* Validating subject information
* Checking the associated department
* Storing subject information in MongoDB
* Retrieving subject information

**3. Create Subject Routes**

Created:

`routes/subject.routes.js`

The Subject Routes define the API endpoints used for subject-related operations.

These routes connect incoming requests to the corresponding controller functions.

**4. Subject Module Flow**

The subject management process works as follows:

`Request → Subject Route → Subject Controller → Subject Model → MongoDB`

The subject information created through this module can later be used by other modules such as **attendance and routine management**.


**Step 6 : Routine Module**

After completing the Subject Module, we implemented the **Routine Module**.

This module is used to create and manage the weekly class routine for students and teachers.

**1. Create Routine Model**

Created:

`models/routine.model.js`

The Routine Model defines the structure of routine information that will be stored in MongoDB.

It stores the required details of a class, such as the subject, teacher, department, day, time, and other routine-related information.

**2. Create Routine Controller**

Created:

`controllers/routine.controller.js`

The Routine Controller contains the logic for handling routine-related operations.

It is responsible for:

* Creating routine entries
* Validating routine information
* Checking the associated subject and department
* Assigning teachers to classes
* Storing routine information in MongoDB
* Retrieving routine information

**3. Create Routine Routes**

Created:

`routes/routine.routes.js`

The Routine Routes define the API endpoints used for routine-related operations.

These routes connect incoming requests to the corresponding controller functions.

**4. Routine Module Flow**

The routine management process works as follows:

`Request → Routine Route → Routine Controller → Routine Model → MongoDB`

The routine information created through this module can later be used to display the weekly class schedule and support other modules such as **attendance management**.
