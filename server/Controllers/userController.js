const userModel = require('../Models/userModel');
const bcrypt = require('bcrypt');
const validator = require('validator');
const jwt = require('jsonwebtoken');

const createToken = (_id) => {
    const jwtkey = process.env.JWT_SECRET_KEY;
    return jwt.sign({_id}, jwtkey, {expiresIn: "3d"});
};

const registerUser = async(req, res) => {

    try {
        const {name, email, password} = req.body;

        let user = await userModel.findOne({email});

        if(user) return res.status(400).json('User is already exist');1

        if(!name || !email || !password) return res.status(400).json('all fiels are required');

        if(!validator.isEmail(email)) return res.status(400).json('The email is not valid');

        if(!validator.isStrongPassword(password)) return res.status(400).json('Password must be strong');

        user = new userModel({name, email, password});
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(user.password, salt);

        await user.save();

        const token = createToken(user._id);

        res.status(200).json({_id: user._id, name, email, token});
    }
    catch(error){
        console.error(error);
        res.status(500).json(error);
    }
    
};

const loginUser = async(req, res) => {
    try {
        const {email, password} = req.body;
        const user = await userModel.findOne({email});
        if(!user) return res.status(400).json("Invalid email or password");
        const isInvalidPassword = await bcrypt.compare(password, user.password);

        if(!isInvalidPassword) return res.status(400).json("Invalid email or password");

        const token = createToken(user._id);

        res.status(200).json({_id: user._id, name: user.name, email, token});
    }
    catch(error){
        console.error(error);
        res.status(500).json(error);
    }  
};

const findUser = async(req, res) => {
    try{
        const userId = req.params.userId;
        const user = await userModel.findById(userId);
        
        res.status(200).json(user);
    }
    catch(error){
        console.error(error);
        res.status(500).json(error);
    }
};

const getUsers = async(req, res) => {
    try{
        const users = await userModel.find();
        
        res.status(200).json(users);
    }
    catch(error){
        console.error(error);
        res.status(500).json(error);
    }
};


module.exports = {registerUser, loginUser, findUser, getUsers};