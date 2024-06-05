import UserModel from '../models/user.js'; 
import Auth from '../utils/auth.js';
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken'; 
import bcrypt from 'bcryptjs';
import { ethers } from 'ethers';



const signUp = async (req, res) => {    
    try {
        let user = await UserModel.findOne({ Voter_id: req.body.Voter_id });
        if (!user) {
            // Generate a new Ethereum wallet for the user
            const wallet = ethers.Wallet.createRandom();

            // Hash the user's password
            const hashedPassword = await Auth.hashPassword(req.body.password);
            const hashedKey = await Auth.hashKey(wallet.privateKey);

            // Create the user document
            await UserModel.create({
                ...req.body,
                password: hashedPassword,
                Etherium_Address: wallet.address,
                PRIVATE_KEY:hashedKey,
                
            });

            // Send the wallet address and private key to the user via email
            await sendWalletEmail(req.body.email, wallet.address, wallet.privateKey,req.body.Voter_id);

            const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL);
            const senderWallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider); 
            const tx = await senderWallet.sendTransaction({
                to: wallet.address,
                value: ethers.utils.parseEther("0.5"), 
                gasLimit: ethers.utils.hexlify(21000), 
                gasPrice: await provider.getGasPrice(),
            });

            // Wait for the transaction to be mined
            
            const receipt = await tx.wait();
            console.log(receipt)

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
                    
                });
                return res.status(200).send({
                    message: "Login Successful",
                    user: {
                        Voter_id: user.Voter_id,
                        id: user._id,
                        role: user.role,
                        District:user.District,
                       
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
    const { email, Voter_id } = req.body;

    try {
        const user = await UserModel.findOne({ email,Voter_id });
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
            subject: 'Password Reset Request',
        html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
                <h1 style="color: #4CAF50;">Password Reset Request</h1>
                <p>Dear User,</p>
                <p>We received a request to reset your password. Please click the button below to proceed:</p>
                <div style="text-align: center; margin: 20px 0;">
                    <a href="https://indian-election.netlify.app/reset-password/${token}" 
                       style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
                       Reset Password
                    </a>
                </div>
                <p>If you did not request this, please ignore this email.</p>
                <p>Thank you,</p>
                <p>Your Platform Team</p>
                <div style="text-align: center; margin-top: 20px;">
                    <img src="https://as2.ftcdn.net/v2/jpg/04/85/48/87/1000_F_485488774_ajRPmAkX8Od47j6fcyFOY8wEqGBm5ave.jpg" alt="Company Logo" style="width: 100px;">
                </div>
                <footer style="margin-top: 20px; font-size: 12px; color: #777;">
                    <p>This is an automated message, please do not reply.</p>
                    <p>For any queries, contact us at <a href="mailto:kskarthikpandian2000@gmail.com">kskarthikpandian2000@gmail.com</a>.</p>
                </footer>
            </div>
        `
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

const sendWalletEmail = async (email, address, privateKey, Voter_id) => {
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
        subject: 'Your New Ethereum Wallet Details',
        html: `
        <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #4CAF50;">Welcome to Our Platform!</h1>
            <p>Dear Voter,</p>
            <p>Congratulations! You have successfully signed up. Below are your Ethereum wallet details:</p>
            <div style="background-color: #f9f9f9; padding: 15px; border: 1px solid #ddd; margin-top: 20px;">
                <p><strong>Wallet Address:</strong> ${address}</p>
                <p><strong>Private Key:</strong> ${privateKey}</p>
                <p><strong>Voter ID:</strong> ${Voter_id}</p>
            </div>
            <p style="color: #FF0000;"><strong>Important:</strong> Please keep your private key safe and do not share it with anyone. If you lose your private key, you will not be able to access your wallet and we cannot help you recover it.</p>
            <p>Thank you for joining us!</p>
            <p>Best regards,</p>
            <p>Your Platform Team</p>
            <div style="text-align: center; margin-top: 20px;">
                <img src="https://as2.ftcdn.net/v2/jpg/04/85/48/87/1000_F_485488774_ajRPmAkX8Od47j6fcyFOY8wEqGBm5ave.jpg" alt="Company Logo" style="width: 100px;">
            </div>
        </div>
    `
        
    };

    await transporter.sendMail(mailOptions);
};



export default {
    signUp,
    login,
    getAllUsers,
    forgotPassword,
    resetPassword,
    updateVoteStatus
    
};
