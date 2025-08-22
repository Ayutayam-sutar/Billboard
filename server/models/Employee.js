// server/models/Employee.js

const mongoose = require("mongoose");

const EmployeeSchema = new mongoose.Schema({
    name: String,
    email: {
        type: String,
        required: true,
        unique: true // No two users can have the same email
    },
    password: {
        type: String, // Passwords MUST be strings
        required: true
    }
});



const EmployeeModel = mongoose.model("Employee", EmployeeSchema);

module.exports = EmployeeModel;