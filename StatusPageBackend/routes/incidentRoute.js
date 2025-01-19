const express = require("express");
const router = express.Router();
const Incident = require("../models/incident"); // Import Incident model
const Service = require("../models/service"); // Import Service model

// Utility function to get the Socket.IO instance
const getIOInstance = (req) => req.app.get("io");

// 1. GET: Fetch All Incidents or a Specific Incident
router.get("/incidents/:id?", async (req, res) => {
    try {
        if (req.params.id) {
            const incident = await Incident.findById(req.params.id);
            if (!incident) {
                return res.status(404).json({ message: "Incident not found" });
            }
            res.json(incident);
        } else {
            const incidents = await Incident.find();
            res.json(incidents);
        }
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// 2. POST: Create a New Incident
router.post("/", async (req, res) => {
    const { serviceName, type, description, status, impactOnService } = req.body;

    if (!serviceName || !type || !description || !impactOnService) {
        return res.status(400).json({ message: "Missing required fields" });
    }

    try {
        const newIncident = new Incident({ serviceName, type, description, status, impactOnService });
        const savedIncident = await newIncident.save();

        // Update the status of the associated service
        const updatedService = await Service.findOneAndUpdate(
            { name: serviceName },
            { status: impactOnService },
            { new: true }
        );

        // Emit real-time events
        const io = getIOInstance(req);
        io.emit("incidentCreated", savedIncident); // Notify about the new incident
        io.emit("serviceUpdated", updatedService); // Notify about the service status change

        res.status(201).json(savedIncident);
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// 3. PUT: Update an Existing Incident
router.put("/:id", async (req, res) => {
    const { status, impactOnService, resolvedAt } = req.body;

    try {
        const updatedIncident = await Incident.findByIdAndUpdate(
            req.params.id,
            { status, impactOnService, resolvedAt, updatedAt: new Date() },
            { new: true }
        );

        if (!updatedIncident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        // Update the associated service's status
        let updatedService = null;
        if (status === "Resolved") {
            // Set service to Operational if the incident is resolved
            updatedService = await Service.findOneAndUpdate(
                { name: updatedIncident.serviceName },
                { status: "Operational" },
                { new: true }
            );
        } else if (impactOnService) {
            // Update service status based on the new impact
            updatedService = await Service.findOneAndUpdate(
                { name: updatedIncident.serviceName },
                { status: impactOnService },
                { new: true }
            );
        }

        // Emit real-time events
        const io = getIOInstance(req);
        io.emit("incidentUpdated", updatedIncident); // Notify about the incident update
        if (updatedService) {
            io.emit("serviceUpdated", updatedService); // Notify about the service status change
        }

        res.json(updatedIncident);
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

// 4. DELETE: Remove an Incident
router.delete("/deleteIncident/:id", async (req, res) => {
    try {
        const deletedIncident = await Incident.findByIdAndDelete(req.params.id);

        if (!deletedIncident) {
            return res.status(404).json({ message: "Incident not found" });
        }

        // Set associated service to Operational if the incident was resolved
        const updatedService = await Service.findOneAndUpdate(
            { name: deletedIncident.serviceName },
            { status: "Operational" },
            { new: true }
        );

        // Emit real-time events
        const io = getIOInstance(req);
        io.emit("incidentDeleted", deletedIncident); // Notify about the incident deletion
        io.emit("serviceUpdated", updatedService); // Notify about the service status change

        res.json({ message: "Incident deleted successfully", deletedIncident });
    } catch (error) {
        res.status(500).json({ error: "Internal server error", details: error.message });
    }
});

module.exports = router;
