const express = require("express");
const cors = require("cors");
const path = require("path");
const http = require("http"); // Import http to create the server
const { Server } = require("socket.io"); // Import the Server class from Socket.IO
require("dotenv").config();
// const clerkMiddleware = require('@clerk/express');

const app = express();

// Middleware
app.use(express.json({ extended: true, limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.set("trust proxy", 1);

// app.use(clerkMiddleware())

const corsOptions = {
    origin: "*",
    credentials: true,
    optionSuccessStatus: 200,
};
app.use(cors(corsOptions));

// Import DB configuration
const dbConfig = require("./db");

const serviceRoute = require('./routes/serviceRoute');
const incidentRoute = require('./routes/incidentRoute');
const userRoute = require('./routes/userRoute');

app.use('/api/services', serviceRoute);
app.use('/api/incidents', incidentRoute);
app.use('/api/users', userRoute);

// Create the HTTP server
const server = http.createServer(app);

// Set up Socket.IO
const io = new Server(server, {
    cors: {
        origin: "*", // Allow all origins (adjust as needed)
        methods: ["GET", "POST"],
    },
});

// Handle Socket.IO connections
io.on("connection", (socket) => {
    console.log(`User connected: ${socket.id}`);

    socket.on("disconnect", () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

// Attach the Socket.IO instance to the app for use in routes
app.set("io", io);

// Start the server
const port = process.env.PORT || 4000;
server.listen(port, () => console.log("Node server with Socket.IO started"));
