const express = require('express');
const router = express.Router();
const Service = require('../models/service');

// Get the Socket.IO instance from the app
const getIOInstance = (req) => req.app.get('io');

// 1. GET: Fetch All Services or a Specific Service
router.get('/getServices/:id?', async (req, res) => {
    try {
        if (req.params.id) {
            const service = await Service.findById(req.params.id);
            if (!service) {
                return res.status(404).json({ message: 'Service not found' });
            }
            res.json(service);
        } else {
            const services = await Service.find();
            res.json(services);
        }
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

// 2. POST: Create a New Service
router.post('/services', async (req, res) => {
    const { name, description, status } = req.body;

    if (!name || !description) {
        return res.status(400).json({ message: 'Name and description are required' });
    }

    try {
        const newService = new Service({ name, description, status });
        const savedService = await newService.save();

        // Emit a real-time event
        const io = getIOInstance(req);
        io.emit('serviceCreated', savedService);

        res.status(201).json(savedService);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Service name must be unique' });
        } else {
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
});

// 3. PUT: Update an Existing Service
router.put('/services/:id', async (req, res) => {
    const { name, description, status } = req.body;

    try {
        const updatedService = await Service.findByIdAndUpdate(
            req.params.id,
            { name, description, status, updatedAt: new Date() },
            { new: true, runValidators: true }
        );

        if (!updatedService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Emit a real-time event
        const io = getIOInstance(req);
        io.emit('serviceUpdated', updatedService);

        res.json(updatedService);
    } catch (error) {
        if (error.code === 11000) {
            res.status(400).json({ error: 'Service name must be unique' });
        } else {
            res.status(500).json({ error: 'Internal server error', details: error.message });
        }
    }
});

// 4. DELETE: Remove a Service
router.delete('/deleteService/:id', async (req, res) => {
    try {
        const deletedService = await Service.findByIdAndDelete(req.params.id);

        if (!deletedService) {
            return res.status(404).json({ message: 'Service not found' });
        }

        // Emit a real-time event
        const io = getIOInstance(req);
        io.emit('serviceDeleted', deletedService);

        res.json({ message: 'Service deleted successfully', deletedService });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error', details: error.message });
    }
});

module.exports = router;
