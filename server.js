const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");

const app = express();
const port = 3000;

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/userDB", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("Error connecting to MongoDB:", err));

// Define a User schema
const userSchema = new mongoose.Schema({
    username: String,
    password: String,
});

// Create a User model
const User = mongoose.model("User", userSchema);

// Handle login requests
app.post("/login", async (req, res) => {
    const { username, password } = req.body;

    try {
        const user = await User.findOne({ username, password });
        if (user) {
            res.send(`Login successful! Welcome, ${user.username}.`);
        } else {
            res.send("Invalid username or password.");
        }
    } catch (err) {
        res.status(500).send("Server error: " + err.message);
    }
});

// Start the server
app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
