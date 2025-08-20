// server/auth.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const axios = require('axios'); // We'll use axios to call Hugging Face
const FormData = require('form-data'); // And form-data to send the image
require('dotenv').config();

const EmployeeModel = require('./models/Employee');
const BillboardModel = require('./models/Billboard');

const app = express();
app.use(express.json());

// --- CORS Configuration ---
const allowedOrigins = [
  "http://localhost:5173",
  "https://billboard-inspect.netlify.app",
];
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
};
app.use(cors(corsOptions));

// --- Static File Serving ---
// This makes sure your backend can serve the uploaded images
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- Database Connection ---
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// --- Multer Configuration for File Uploads ---
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir); }
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- JWT Middleware ---
const verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                return res.status(403).json({ message: "Token is not valid" });
            }
            req.user = decoded;
            next();
        });
    } else {
        res.status(401).json({ message: "You are not authenticated" });
    }
};

// --- Authentication Routes ---
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newEmployee = new EmployeeModel({ name, email, password: hashedPassword });
        await newEmployee.save();
        res.status(201).json({ message: "User registered successfully" });
    } catch (err) {
        console.error("Error in /register:", err);
        res.status(500).json({ message: "Error registering user" });
    }
});

app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await EmployeeModel.findOne({ email: email });
        if (!user) { return res.status(404).json({ message: "User not found" }); }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) { return res.status(400).json({ message: "Invalid credentials" }); }
        const payload = { id: user._id, name: user.name };
        const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: "Success", token: token });
    } catch (err) {
        console.error("Error in /login:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// --- Data Routes ---
app.get('/my-billboards', verifyUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const billboards = await BillboardModel.find({ uploadedBy: userId });
        res.json(billboards);
    } catch (err) {
        res.status(500).json({ message: "Server error fetching billboards" });
    }
});

// --- NEW HYBRID AI ROUTE (Calling Hugging Face) ---
app.post('/analyze-hybrid', verifyUser, upload.single('billboardImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded." });
    }
    
    // Check if the Hugging Face URL is configured
    if (!process.env.HUGGING_FACE_URL) {
        console.error("❌ HUGGING_FACE_URL environment variable is not set.");
        return res.status(500).json({ message: "AI service is not configured on the server." });
    }

    try {
        console.log(`Forwarding image to Hugging Face URL: ${process.env.HUGGING_FACE_URL}`);

        // 1. Create a form and append the image file to it
        const form = new FormData();
        form.append('file', fs.createReadStream(req.file.path), req.file.filename);
        
        // 2. Send the form to your Hugging Face Space using axios
        const response = await axios.post(process.env.HUGGING_FACE_URL, form, {
            headers: {
                ...form.getHeaders()
            }
        });

        // 3. The AI analysis now comes from the Hugging Face response
        const analysisResult = response.data;
        console.log("✅ Received analysis from Hugging Face:", analysisResult);

        // 4. Create the correct public URL for the saved image
        const backendUrl = process.env.BACKEND_URL || `http://localhost:${PORT}`;
        const imageUrl = `${backendUrl}/uploads/${req.file.filename}`;
        const userId = req.user.id;
        
        // 5. Save the results to your database
        const newBillboard = new BillboardModel({
            imageUrl: imageUrl,
            violations: analysisResult.violations || [],
            summary: analysisResult.summary || "No summary provided.",
            location_details: analysisResult.location_details || {},
            is_compliant: analysisResult.is_compliant,
            uploadedBy: userId,
        });

        const savedBillboard = await newBillboard.save();
        res.status(201).json(savedBillboard);

    } catch (err) {
        console.error("❌ Error calling Hugging Face or saving data:", err.message);
        // Provide more detailed error if it's from axios
        if (err.response) {
            console.error("Hugging Face Response Error:", err.response.data);
        }
        res.status(500).json({ message: "Hybrid AI analysis failed.", error: err.message });
    }
});

app.get('/', (req, res) => {
    res.json({ status: "ok", message: "Server root is healthy" });
});

// --- Health Check Route ---
app.get('/health', (req, res) => {
    console.log("✅ Health check endpoint was hit!");
    res.json({ status: "ok", message: "Server is healthy" });
});

// --- Start Server ---
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on port ${PORT}`);
});