import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import Web3 from 'web3'
import ethers from 'ethers'
import AppRoutes from './src/routes/index.js'
dotenv.config()

const app = express();

app.use(cors());
app.use(express.json());
app.use(AppRoutes);

app.listen(process.env.PORT,()=>console.log("Server Listening in Port" + process.env.PORT))