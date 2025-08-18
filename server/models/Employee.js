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

// IMPORTANT: Change "employees" to "Employee" here. 
// This is the standard Mongoose practice and will make linking models easier.
const EmployeeModel = mongoose.model("Employee", EmployeeSchema);

module.exports = EmployeeModel;