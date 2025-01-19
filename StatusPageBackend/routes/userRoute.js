const express = require("express");
const router = express.Router();
const User = require("../models/user"); // Import the User model
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
require("dotenv").config();


// 1. GET: Fetch All Users or a Specific User
router.get("/:id?", async (req, res) => {
    try {
        if (req.params.id) {
            // Fetch a specific user by ID
            const user = await User.findById(req.params.id);
            if (!user) {
                return res.status(404).json({ message: "User not found" });
            }
            res.json(user);
        } else {
            // Fetch all users
            const users = await User.find();
            res.json(users);
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// 2. POST: Create a New User
router.post("/new", async (req, res) => {
    const { email, password, associatedServices } = req.body;

    // Validate required fields
    if (!email || !password || !associatedServices) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        // Automatically set isAdmin based on associatedServices
        const isAdmin = associatedServices.toLowerCase() === "admin";

        const hashedPassword = await bcrypt.hash(password, 10);

        // Create and save the new user
        const newUser = new User({
            email,
            password: hashedPassword,
            isAdmin,
            associatedServices,
        });

        const savedUser = await newUser.save();
        res.status(201).json(savedUser);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: "Email already exists" });
        } else {
            res.status(500).json({ error: "Internal server error", details: error.message });
        }
    }
});

router.post("/login", async (req, res) => {
    const { email, password } = req.body;
    console.log(email, password);


    try {
        const user = await User.findOne({ email: email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        if (!await bcrypt.compare(password, user.password)) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Generate a JWT token
        const token = jwt.sign(
            { userId: user._id, email: user.email, isAdmin: user.isAdmin },
            process.env.JWT_SECRET, // Ensure you have JWT_SECRET in your environment variables
            { expiresIn: '1h' } // Token expires in 1 hour
        );

        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});


// 3. DELETE: Remove a User
router.delete("/:id", async (req, res) => {
    try {
        const deletedUser = await User.findByIdAndDelete(req.params.id);

        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.json({ message: "User deleted successfully", deletedUser });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

module.exports = router;
