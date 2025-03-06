const User = require('../model/User')
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");


const register = async(req,res) => {
    try {
        const { username, password } = req.body;
    
        // Check if user exists
        const existingUser = await User.findOne({ username });
        if (existingUser) return res.status(400).json({ message: "Username already taken" });
    
        // Create new user
        const newUser = new User({ username, password });
        await newUser.save();
    
        res.status(201).json({ message: "User registered successfully" });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
}


const login = async(req,res) => {
    try {
        const { username, password } = req.body;
        console.log(username,password)
        // Find user
        const user = await User.findOne({ username });
        if (!user) return res.status(400).json({ message: "Invalid credentials" });
    
        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });
    
        // Generate Token
        const token = jwt.sign({ userId: user._id }, "secretKey", { expiresIn: "8h" });
    
        res.json({ message: "Login successful", token });
      } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
      }
}

module.exports = {register,login}