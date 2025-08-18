// server/auth.js

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { analyzeWithGemini } = require('./services/geminiService');
const mime = require('mime-types');
const EmployeeModel = require('./models/Employee');
const BillboardModel = require('./models/Billboard');

const app = express();
app.use(express.json());
// This creates an "approved list" of addresses
const allowedOrigins = [
    'http://localhost:5173', // Your local dev address
    // ❗️ REPLACE WITH YOUR LIVE FRONTEND URL
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests from the approved list
        if (!origin || allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

mongoose.connect("mongodb+srv://juggernauts6996:shreeram@cluster0.su7f7c3.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0")
  .then(() => console.log("✅ Successfully connected to MongoDB Atlas"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) { fs.mkdirSync(uploadsDir); }
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
});
const upload = multer({ storage: storage });

// --- MIDDLEWARE ---
const verifyUser = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
        const token = authHeader.split(" ")[1];
        jwt.verify(token, "your_jwt_secret_key", (err, decoded) => {
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

// Helper function to run YOLO analysis
const runYoloAnalysis = (imagePath) => {
    return new Promise((resolve, reject) => {
        const pythonScriptPath = path.join(__dirname, 'python_model', 'test_model.py');
        const pythonProcess = spawn('python', [pythonScriptPath, imagePath]);
        let analysisResultJson = '', errorOutput = '';
        
        pythonProcess.stdout.on('data', (data) => { analysisResultJson += data.toString(); });
        pythonProcess.stderr.on('data', (data) => { errorOutput += data.toString(); });
        
        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python Error: ${errorOutput}`);
                return reject(new Error("YOLO analysis failed"));
            }
            try {
                const analysisResult = JSON.parse(analysisResultJson);
                resolve(analysisResult);
            } catch (parseError) {
                console.error("Error parsing YOLO results:", parseError);
                reject(parseError);
            }
        });
    });
};

// --- AUTHENTICATION ROUTES ---
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
        const token = jwt.sign(payload, "your_jwt_secret_key", { expiresIn: '1h' });
        res.json({ message: "Success", token: token });
    } catch (err) {
        console.error("Error in /login:", err);
        res.status(500).json({ message: "Server error" });
    }
});

// --- DATA & AI ROUTES ---
app.get('/my-billboards', verifyUser, async (req, res) => {
    try {
        const userId = req.user.id;
        const billboards = await BillboardModel.find({ uploadedBy: userId });
        res.json(billboards);
    } catch (err) {
        res.status(500).json({ message: "Server error fetching billboards" });
    }
});

// Original YOLOv8-only analysis route
// app.post('/analyze-billboard', verifyUser, upload.single('billboardImage'), (req, res) => {
//     if (!req.file) { return res.status(400).json({ message: "No image file uploaded." });}
//     const imagePath = req.file.path;
//     const pythonScriptPath = path.join(__dirname, 'python_model', 'test_model.py');
//     const pythonProcess = spawn('python', [pythonScriptPath, imagePath]);
//     let analysisResultJson = '', errorOutput = '';
//     pythonProcess.stdout.on('data', (data) => { analysisResultJson += data.toString(); });
//     pythonProcess.stderr.on('data', (data) => { errorOutput += data.toString(); });
//     pythonProcess.on('close', async (code) => {
//         if (code !== 0) {
//             console.error(`Python Error: ${errorOutput}`);
//             return res.status(500).json({ message: "AI analysis failed.", error: errorOutput });
//         }
//         try {
//             const analysisResult = JSON.parse(analysisResultJson);
//             const userId = req.user.id;
//             const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;
//             const newBillboard = new BillboardModel({ imageUrl: imageUrl, violations: analysisResult.violations, uploadedBy: userId });
//             const savedBillboard = await newBillboard.save();
//             res.status(201).json(savedBillboard);
//         } catch (parseError) {
//             console.error("Error parsing JSON from Python script:", parseError, "Raw output:", analysisResultJson);
//             res.status(500).json({ message: "Failed to parse AI results." });
//         }
//     });
// });

// New Hybrid AI Analysis Route
app.post('/analyze-hybrid', verifyUser, upload.single('billboardImage'), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ message: "No image file uploaded." });
    }
    try {
        const imagePath = req.file.path;
        const imageMimeType = mime.lookup(imagePath);
        const userId = req.user.id;
        const imageUrl = `http://localhost:3001/uploads/${req.file.filename}`;

        if (!imageMimeType) {
            return res.status(400).json({ message: "Could not determine image type." });
        }
        
        const yoloPromise = runYoloAnalysis(imagePath);
        const geminiPromise = analyzeWithGemini(imagePath, imageMimeType);

        const [yoloResults, geminiResults] = await Promise.all([yoloPromise, geminiPromise]);
        
        // --- THIS IS THE NEW, CLEARER INSPECTOR ---
        console.log("\n<<<<< ----- THIS IS THE NEW DEBUG CODE RUNNING ----- >>>>>");
        console.log("Gemini API returned the following violations array:");
        console.log(geminiResults.violations);
        // --- END OF INSPECTOR ---

        const combinedViolations = [
            ...(yoloResults.violations || []),
            ...(geminiResults.violations || []).map(v => `Gemini: ${v.violation_type} (${v.severity}) - ${v.details}`)
        ];

        const newBillboard = new BillboardModel({
            imageUrl, violations: combinedViolations,
            summary: geminiResults.summary, location_details: geminiResults.location_details,
            is_compliant: geminiResults.is_compliant, uploadedBy: userId,
        });

        const savedBillboard = await newBillboard.save();
        res.status(201).json(savedBillboard);

    } catch (err) {
        console.error("❌ Error in hybrid analysis:", err);
        res.status(500).json({ message: "Hybrid AI analysis failed.", error: err.message });
    }
});

// --- HEALTH CHECK ROUTE ---
app.get('/health', (req, res) => {
    console.log("✅ Health check endpoint was hit!");
    res.json({ status: "ok", message: "Server is healthy" });
});

// --- START SERVER (MUST BE THE LAST THING) ---
app.listen(3001, () => {
    console.log("Server is running on port 3001");
});