import Web3 from 'web3';
import fs from 'fs';
import CandidateModel from '../models/candidate.js';
import UserModel from '../models/user.js';
import dotenv from 'dotenv';

dotenv.config();

const contractABI = JSON.parse(fs.readFileSync('/home/karthik/BVS/BVS-BE/artifacts/contracts/Voting.sol/Voting.json', 'utf-8'));

const web3 = new Web3(process.env.API_URL);
const contractAddress = process.env.CONTRACT_ADDRESS;
const contract = new web3.eth.Contract(contractABI.abi, contractAddress);

const userAddress = process.env.OWNER_ADDRESS;
const userPrivateKey = process.env.PRIVATE_KEY;

// Function to fetch gas details
const getGasDetails = async () => {
  const gasPrice = await web3.eth.getGasPrice();
  const latestBlock = await web3.eth.getBlock('latest');
  const baseFeePerGas = latestBlock.baseFeePerGas;
  const maxPriorityFeePerGas = Web3.utils.toWei('2', 'gwei'); // Reasonable priority fee (2 gwei)
  const maxFeePerGas = parseInt(baseFeePerGas) + parseInt(maxPriorityFeePerGas);
  return { gasPrice, maxFeePerGas, maxPriorityFeePerGas };
};

// Add Candidate
const addCandidate = async (req, res) => {
  const candidateId = 17;
  const district = "Thoothukkudi";

  try {
    const txData = contract.methods.addCandidate(candidateId, district).encodeABI();
    const nonce = await web3.eth.getTransactionCount(userAddress);

    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await getGasDetails();

    const signedTx = await web3.eth.accounts.signTransaction({
      to: contractAddress,
      data: txData,
      gas: '500000',
      gasPrice,
      nonce
    }, userPrivateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("Transaction hash:", receipt.transactionHash);
    res.status(200).json({ success: true, transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: 'Failed to add candidate', error: error.message });
  }
};

// Get Candidate by District
const CandidateName = async (req, res) => {
  const district = req.params.district;
  try {
    const candidates = await CandidateModel.find({ district });
    if (candidates.length > 0) {
      res.status(200).json({ success: true, message: 'Candidates Fetched Successfully', candidates });
    } else {
      res.status(404).json({ success: false, message: 'No candidates found for the district' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: 'Failed to fetch candidates', error: error.message });
  }
};

// Vote for a Candidate
const CandidateId = async (req, res) => {
  try {
    const candidateId = 1;
    const district = "Thoothukkudi";
    const txData = contract.methods.vote(candidateId, district).encodeABI();
    const nonce = await web3.eth.getTransactionCount(userAddress);

    const { gasPrice, maxFeePerGas, maxPriorityFeePerGas } = await getGasDetails();

    const signedTx = await web3.eth.accounts.signTransaction({
      to: contractAddress,
      data: txData,
      gas: '500000',
      maxFeePerGas,
      maxPriorityFeePerGas,
      nonce,
      type: '0x2'
    }, userPrivateKey);

    const receipt = await web3.eth.sendSignedTransaction(signedTx.rawTransaction);
    console.log("Vote transaction hash:", receipt.transactionHash);
    res.status(200).send({ transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).send({ error: error.message });
  }
};

export default {
  CandidateName,
  CandidateId,
  addCandidate
};
