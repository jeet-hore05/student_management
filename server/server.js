
import app from "./app.js";
import connectDB from "./config/dbConnection.js";

const PORT = process.env.PORT || 5173;

app.listen(PORT, async() =>{
    await connectDB();
    console.log(`App is running at http://localhost:${PORT}`);
});