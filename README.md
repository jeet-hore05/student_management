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


**Step 7 : Attendance Module**

After completing the Routine Module, we implemented the **Attendance Module**.

This module is used to record and manage student attendance based on their classes and subjects.

**1. Create Attendance Model**

Created:

`models/attendance.model.js`

The Attendance Model defines the structure of attendance information that will be stored in MongoDB.

It stores the required details related to the student, subject, class, date, and attendance status.

**2. Create Attendance Controller**

Created:

`controllers/attendance.controller.js`

The Attendance Controller contains the logic for handling attendance-related operations.

It is responsible for:

* Recording student attendance
* Validating attendance information
* Checking the associated student and subject
* Updating attendance records
* Retrieving attendance information

**3. Create Attendance Routes**

Created:

`routes/attendance.routes.js`

The Attendance Routes define the API endpoints used for attendance-related operations.

These routes connect incoming requests to the corresponding controller functions.

**4. Attendance Module Flow**

The attendance management process works as follows:

`Request → Attendance Route → Attendance Controller → Attendance Model → MongoDB`

The attendance records can later be used to view and manage student attendance based on subjects and classes.


**Step 8 : View Module**

After completing the Attendance Module, we implemented the **View Module**.

This module is used to retrieve and display the information stored in different modules of the Student Management System.

**1. Create View Controller**

Created:

`controllers/view.controller.js`

The View Controller contains the logic for retrieving the required information from the database.

It is responsible for:

* Retrieving student and teacher information
* Retrieving subject information
* Retrieving routine information
* Retrieving attendance information
* Sending the requested data to the client

**2. Create View Routes**

Created:

`routes/view.routes.js`

The View Routes define the API endpoints used to retrieve information from the system.

These routes connect incoming requests to the corresponding view controller functions.

**3. View Module Flow**

The view process works as follows:

`Request → View Route → View Controller → Database Models → Response`

The View Module brings together information from the **User, Subject, Routine, and Attendance** modules so that the required academic information can be displayed to t


**Step 9 : Frontend Setup**

After completing the backend modules, we started setting up the **frontend** of the Student Management System.

The frontend is developed using **React.js with Vite** and **Tailwind CSS**.

**1. Create the Client Directory**

We create a separate `client` directory for all frontend-related code.

```bash
mkdir client
cd client
```

**2. Create React Application**

Inside the `client` directory, we create the React application using Vite.

```bash
npm create vite@latest
```

During the setup, select:

* Framework: `React`
* Variant: `JavaScript`

After creating the project:

```bash
cd client
npm install
```

**3. Run the React Application**

Before installing additional libraries, we first check whether the React application is working correctly.

```bash
npm run dev
```

This starts the Vite development server.

**4. Setup Tailwind CSS**

Install Tailwind CSS and its Vite integration:

```bash
npm install tailwindcss @tailwindcss/vite
```

Update:

`vite.config.js`

Add the Tailwind CSS Vite plugin to the configuration.

```js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
```

Then update:

`src/index.css`

```css
@import "tailwindcss";
@plugin "daisyui";
```

This enables Tailwind CSS in the React application.

**5. Install Frontend Libraries**

After setting up React and Tailwind CSS, we install the libraries required for the application.

```bash
npm install @reduxjs/toolkit react-router-dom react-icons react-chartjs-2 chart.js daisyui axios react-hot-toast
```

These libraries are used for different frontend requirements:

* `@reduxjs/toolkit` — State management
* `react-router-dom` — Frontend routing and navigation
* `react-icons` — Icons in the user interface
* `react-chartjs-2` — React components for charts
* `chart.js` — Chart generation
* `daisyui` — UI components built on top of Tailwind CSS
* `axios` — Communication with the backend API
* `react-hot-toast` — Displaying notification messages

**6. Frontend Setup Flow**

The frontend setup process is:

`Create Client → Create React App with Vite → Install Dependencies → Run React → Setup Tailwind CSS → Install Frontend Libraries`

At this stage, the basic frontend environment is ready for developing the application's **pages, components, navigation, state management, API communication, charts, icons, UI components, and notifications**.


**Step 10 : Redux Toolkit Setup**

After setting up the frontend libraries, we implemented the basic **state management structure using Redux Toolkit**.

Redux Toolkit is used to manage and share application state across different React components.

**1. Install Redux Dependencies**

The required Redux packages are installed using:

```bash
npm install @reduxjs/toolkit react-redux
```

These packages are used for different purposes:

* `@reduxjs/toolkit` — Provides tools such as `configureStore` and `createSlice` for creating and managing the Redux store.
* `react-redux` — Connects Redux with React and provides components/hooks such as `Provider`, `useSelector`, and `useDispatch`.

**2. Create Redux Store**

Created the Redux store to manage the application's global state.

The store acts as the central location where the Redux state is maintained.

The store is configured using `configureStore` from `@reduxjs/toolkit`.

**3. Create Redux Slice**

Created a slice using `createSlice` from `@reduxjs/toolkit`.

The slice contains:

* The initial state
* The slice name
* Reducers for managing state changes

At this stage, the basic slice structure has been created and no specific application logic has been added yet.

**4. Configure Redux Provider**

The Redux store is connected to the React application using the `Provider` component from `react-redux`.

The `Provider` makes the Redux store available to the entire React component tree.

The basic Redux flow is:

`React Component → Redux Action → Reducer → Store → Updated State`

At this stage, the basic **Redux Toolkit setup** is complete and ready for implementing application-specific state management.



**Step 11 : Axios Instance Setup**

After setting up Redux Toolkit, we implemented a reusable **Axios instance** for communicating with the backend API.

**1. Create Axios Instance**

Created:

`Helper/axiosInstance.js`

Instead of creating a new Axios configuration for every API request, we created a common Axios instance that can be reused throughout the application.

**2. Configure Backend URL**

The Axios instance is configured with the backend API's base URL.

This allows us to make API requests using relative endpoints instead of repeatedly writing the complete backend URL.

**3. Configure Credentials**

`withCredentials` is enabled so that cookies, including the authentication cookie, can be sent with requests to the backend.

This is required because the application uses cookie-based authentication.

**4. Axios Flow**

The frontend API communication works as follows:

`React Component → Axios Instance → Backend API → Response`

The Axios instance is now ready to be used by different frontend modules for communicating with the backend.


**Step 12 : Footer Component**

After setting up Axios, we implemented the **Footer Component** for the frontend.

**1. Create Footer Component**

Created:

`Components/Footer.jsx`

The Footer component contains the common footer section of the application.

It is created as a reusable component so that the same footer can be used across different pages of the application.

**2. Add Footer Styling**

The Footer component is styled using **Tailwind CSS** to provide the required layout and responsive design.

**3. Use Footer Component**

The Footer component can be imported into the required layout or page and rendered as part of the application's common UI.

The basic component structure is:

`Page/Layout → Footer Component`

The Footer component is now ready to be reused throughout the frontend application.

**Step 13 : Homepage, HomeLayout and Redux Slice**

After implementing the Footer component, we developed the **Homepage**, created the **HomeLayout**, and extended Redux Toolkit state management for the frontend.

**1. Create Homepage**

Created the homepage component to serve as the main landing page of the Student Management System.

The homepage provides the initial interface through which users can access the application.

It is designed using React and Tailwind CSS with a responsive layout for mobile, tablet, and desktop screens.

**2. Create HomeLayout**

Created the HomeLayout component to manage the common layout of the homepage.

It provides a structured way to organize the main page content and reusable components, such as the Footer.

This helps maintain a consistent layout and avoids repeating common UI elements.

**3. Update Redux Slice**

Updated the Redux slice to manage the state required by the frontend.

The slice defines the initial state and reducers used to handle state changes.

This allows React components to access and update shared application state through Redux Toolkit.

**4. Integrate the Components**

The Homepage and HomeLayout work together to organize the main landing page, while Redux Toolkit manages the shared state required by the application.

The overall structure is:

`Homepage → HomeLayout → Page Content + Footer`

The Redux flow is:

`React Component → Redux Action → Reducer → Store → Updated State`

At this stage, the homepage structure, common layout, and Redux state management are in place for further frontend development.

**Step 14 : Authentication and Password Management**

After setting up the Homepage, HomeLayout, and Redux state management, we implemented the frontend authentication and password management functionality.

**1. Create Login Page**

Created the login page to allow existing users to access the Student Management System using their registered email and password.

The login form collects user credentials and sends them to the backend API using the configured Axios instance.

**2. Manage Authentication State Using Redux**

Integrated Redux Toolkit to manage authentication-related state in the frontend.

This allows the application to maintain and access relevant user information across different React components.

**3. Implement Forgot Password**

Created the forgot password functionality to allow users to request a password reset using their registered email address.

The frontend sends the user's email to the backend, which handles the password reset request.

**4. Implement Reset Password**

Created the reset password page to allow users to set a new password using the reset link received through email.

The frontend submits the reset information to the backend, where the reset token is validated and the password is updated.

**5. Implement Change Password**

Implemented the change password functionality for authenticated users.

The interface allows users to provide their current password and a new password. The information is sent to the backend, where the current password is verified before updating the password.

**6. API Integration**

Integrated the authentication and password management pages with the backend using Axios.

The frontend communicates with the corresponding backend endpoints to process login, forgot password, reset password, and change password requests.

**7. Authentication Flow**

The implemented authentication flow is:

`Login Page → Backend Authentication → Redux Authentication State`

The password management flow is:

`Forgot Password → Email Reset Link → Reset Password`

For authenticated users:

`Change Password → Verify Current Password → Update Password`

At this stage, the frontend supports the basic **login, forgot password, reset password, and change password** workflows.

**Step 15 : Allotment, Student and Department Modules**

After implementing authentication and password management, we developed the **Allotment, Student, and Department modules** in the frontend.

**1. Implement Allotment Module**

Created the allotment interface to manage department allotment for students and teachers.

The module communicates with the backend using the configured Axios instance to perform the required allotment operations.

It connects the user information with the relevant department according to the implemented backend functionality.

**2. Implement Student Module**

Created the Student Module to manage student-related information in the frontend.

The module provides the interface for working with student records and communicating with the backend for the supported student operations.

The student interface integrates with the existing authentication system and uses the configured Axios instance for API requests.

**3. Implement Department Module**

Created the Department Module to manage department-related information.

The module provides the interface for displaying and managing departments through the corresponding backend APIs.

It communicates with the backend using Axios to retrieve or submit department information.

**4. Integrate with Redux and Backend APIs**

Integrated the modules with the existing frontend structure and backend API.

Axios is used for HTTP communication, while Redux Toolkit manages the shared application state where required.

**5. Module Flow**

The general data flow is:

`React Component → Axios Instance → Backend Route → Controller → MongoDB → Response`

These modules extend the frontend with department management, student management, and department allotment functionality.



**Step 16 : Teacher Management, Subject, Routine and Attendance Modules**

After implementing the Allotment, Student, and Department modules, we developed the **Teacher Management, Subject, Routine, and Attendance modules** in the frontend.

**1. Implement Teacher Management Module**

Created the Teacher Management interface to manage teacher-related information.

The module communicates with the backend using the configured Axios instance to retrieve and manage teacher records according to the implemented functionality.

**2. Implement Subject Module**

Created the Subject Module to manage subject-related information.

The module communicates with the backend APIs to retrieve and manage subjects associated with the relevant academic departments.

**3. Implement Routine Module**

Created the Routine Module to display and manage class schedules.

The module communicates with the backend to retrieve routine information, including the relevant subjects, teachers, departments, and class timings supported by the application.

**4. Implement Attendance Module**

Created the Attendance Module to manage student attendance records.

The module communicates with the backend to perform the supported attendance operations and retrieve attendance information for viewing and management.

**5. Integrate Backend APIs**

Integrated the modules with the existing backend APIs using the reusable Axios instance.

This allows the frontend to exchange data with the backend and display information retrieved from MongoDB.

**6. Module Flow**

The general data flow is:

`React Component → Axios Instance → Backend Route → Controller → MongoDB → Response`

These modules extend the frontend with teacher management, subject management, routine management, and attendance functionality.

**Step 17 : View Module**

After implementing the Teacher Management, Subject, Routine, and Attendance modules, we developed the **View Module** in the frontend.

**1. Implement View Module**

Created the View interface to display information retrieved from different modules of the Student Management System.

The module brings together the relevant academic information so that users can view the data available to them.

**2. Integrate Backend APIs**

Connected the View Module to the backend using the reusable Axios instance.

The frontend sends requests to the corresponding backend endpoints and receives the required information for display.

**3. Display Academic Information**

The View Module is used to display information from the following modules, according to the implemented functionality:

- Student and teacher information
- Subject information
- Class routine information
- Attendance records

**4. View Module Flow**

The data flow works as follows:

`View Component → Axios Instance → Backend Route → Controller → Database Models → Response → Display Data`

The View Module completes the main frontend structure by providing an interface for viewing information managed by the different modules of the Student Management System.