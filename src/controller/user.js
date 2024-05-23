import UserModel from '../models/user.js'; 
import CandidateModel from '../models/candidate.js';
import Auth from '../utils/auth.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcryptjs';



const signUp = async (req, res) => {    
    try {
        let user = await UserModel.findOne({Voter_id: req.body.Voter_id});
        if (!user) {
            req.body.password = await Auth.hashPassword(req.body.password);
            await UserModel.create(req.body);
            return res.status(201).send({
                message: "User Sign Up Successful"
            });
        } else {
            return res.status(400).send({
                message: `User with Voter ID ${req.body.Voter_id} already exists`
            });
        }
    } catch (error) {
        console.error('Error in sign up:', error);
        return res.status(500).send({
            message: error.message || "Internal Server Error"
        });
    }
};

const login = async (req, res) => {
    try {
        let user = await UserModel.findOne({Voter_id: req.body.Voter_id});
        if (user) {
            if (await Auth.hashCompare(req.body.password, user.password)) {
                let token = await Auth.createToken({
                    Voter_id: user.Voter_id,
                    id: user._id,
                    role: user.role,
                    District:user.District,
                    Etherium_Address:user.Etherium_Address
                });
                return res.status(200).send({
                    message: "Login Successful",
                    user: {
                        Voter_id: user.Voter_id,
                        id: user._id,
                        role: user.role,
                        District:user.District,
                        Etherium_Address:user.Etherium_Address
                    },
                    token
                });
            } else {
                return res.status(400).send({
                    message: "Incorrect Password"
                });
            }
        } else {
            return res.status(400).send({
                message: `User with Voter ID ${req.body.Voter_id} does not exist`
            });
        }
    } catch (error) {
        console.error('Error in login:', error);
        return res.status(500).send({
            message: error.message || "Internal Server Error"
        });
    }
};

const getAllUsers = async (req, res) => {
    try {
        let users = await UserModel.find({}, {password: 0});
        return res.status(200).send({
            message: "Data Fetch Successful",
            users   
        });
    } catch (error) {
        console.error('Error in getting all users:', error);
        return res.status(500).send({
            message: error.message || "Internal Server Error"
        });
    }
};

const forgotPassword = async (req, res) => {
    const email = req.body.email;

    try {
        const user = await UserModel.findOne({ email });
        if (!user) {
            return res.status(400).json({ status: 400, msg: `User with email ${email} does not exist.` });
        }

        const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' }); 

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Password Reset',
            html: `<p>Please click <a href="http://localhost:5173/reset-password/${token}">here</a> to reset your password.</p>`
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ status: 200, msg: "Password reset link sent successfully.",token });
    } catch (error) {
        console.error('Error sending email:', error);
        return res.status(500).json({ status: 500, msg: "An error occurred while sending the password reset link." });
    }
};

const resetPassword = async (req, res) => {
    const token = req.params.token;
    const newPassword = req.body.newPassword;

    if (!token || !newPassword) {
        return res.status(400).json({ status: 400, msg: "Token and newPassword are required." });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await UserModel.updateOne({ email: decoded.email }, { password: hashedPassword });

        return res.status(200).json({ status: 200, msg: "Password updated successfully." });
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(400).json({ status: 400, msg: "Invalid or expired token." });
        }
        console.error('Error resetting password:', error);
        return res.status(500).json({ status: 500, msg: "An error occurred while resetting the password." });
    }
};

const updateVoteStatus = async (req, res) => {
    const { Voter_id } = req.body;
    
    try {
        const user = await UserModel.findOneAndUpdate(
            { Voter_id: Voter_id },
            { voting_state: true },
            { new: true } // Return the updated document
        );

        if (!user) {
            return res.status(404).send({
                message: "User not found"
            });
        }

        return res.status(200).send({
            message: "Vote status updated successfully",
            user
        });
    } catch (error) {
        console.error('Error in updating vote status:', error);
        return res.status(500).send({
            message: error.message || "Internal Server Error"
        });
    }
};




export default {
    signUp,
    login,
    getAllUsers,
    forgotPassword,
    resetPassword,
    updateVoteStatus
    
};
