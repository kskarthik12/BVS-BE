import { ethers } from 'ethers';
import fs from 'fs';
import CandidateModel from '../models/candidate.js';
import UserModel from '../models/user.js';


const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "district",
        "type": "string"
      }
    ],
    "name": "Voted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_district",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "_candidateName",
        "type": "string"
      }
    ],
    "name": "addCandidate",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "candidates",
    "outputs": [
      {
        "internalType": "string",
        "name": "district",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "candidateName",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "candidateId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "voteCount",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllVotesOfCandidates",
    "outputs": [
      {
        "components": [
          {
            "internalType": "string",
            "name": "district",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "candidateName",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "candidateId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "voteCount",
            "type": "uint256"
          }
        ],
        "internalType": "struct Voting.Candidate[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_candidateId",
        "type": "uint256"
      },
      {
        "internalType": "string",
        "name": "_district",
        "type": "string"
      }
    ],
    "name": "vote",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "name": "voters",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  }
]
const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = '0x5BAAE64AbBa44Eae32A64FC653E4BAc1B73E84B4';
const contract = new ethers.Contract(contractAddress, contractABI, wallet);

// Function to fetch gas details
const getGasDetails = async () => {
  const feeData = await provider.getFeeData();
  const maxPriorityFeePerGas = ethers.utils.parseUnits('2', 'gwei'); // Reasonable priority fee (2 gwei)
  const maxFeePerGas = feeData.maxFeePerGas || feeData.gasPrice.add(maxPriorityFeePerGas);
  return { maxFeePerGas, maxPriorityFeePerGas };
};

// Add Candidate
const addCandidate = async (req, res) => {
  const { candidateId, district,candidateName } = req.body;

  try {
    const tx = await contract.populateTransaction.addCandidate(candidateId, district,candidateName);
    const { maxFeePerGas, maxPriorityFeePerGas } = await getGasDetails();

    console.log("Transaction data:", tx);
    console.log("Gas details:", { maxFeePerGas, maxPriorityFeePerGas });

    const txResponse = await wallet.sendTransaction({
      ...tx,
      gasLimit: ethers.utils.hexlify(500000),
      maxFeePerGas,
      maxPriorityFeePerGas,
      type: 2
    });

    console.log("Transaction sent:", txResponse);

    const receipt = await txResponse.wait();
    console.log("Transaction receipt:", receipt);

    res.status(200).json({ success: true, message:"Candidate added successfully",transactionHash: receipt.transactionHash });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ success: false, message: 'Failed to add candidate', error: error.message });
  }
};

// Get Candidate by District
const CandidateName = async (req, res) => {
  const district = req.query.district;
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
// const candidateId = async (req, res) => {
//   try {
//     const candidateId = 18;
//     const district = "Thoothukkudi";
//     const tx = await contract.populateTransaction.vote(candidateId, district);
//     const { maxFeePerGas, maxPriorityFeePerGas } = await getGasDetails();

//     console.log("Transaction data:", tx);
//     console.log("Gas details:", { maxFeePerGas, maxPriorityFeePerGas });

//     const txResponse = await wallet.sendTransaction({
//       ...tx,
//       gasLimit: ethers.utils.hexlify(500000),
//       maxFeePerGas,
//       maxPriorityFeePerGas,
//       type: 2
//     });

//     console.log("Transaction sent:", txResponse);

//     const receipt = await txResponse.wait();
//     console.log("Transaction receipt:", receipt);

//     res.status(200).send({ message: 'User voted Successfully',transactionHash: receipt.transactionHash });
//   } catch (error) {
//     console.error("Error:", error);
//     res.status(500).send({ error: error.message });
//   }
// };

const getCandidateDetails = async (req, res) => {
  try {
    // Call the getCandidate function

    const candidates = await contract.getAllVotesOfCandidates();
     
    const convertedCandidates = candidates.map(candidate => ({
      district: candidate.district,
      candidateName:candidate.candidateName,
      candidateId: candidate.candidateId.toString(),
      voteCount: candidate.voteCount.toString(),
    }));
    console.log(convertedCandidates);
    res.status(200).send({ message: 'Vote Status fetched Successfully',convertedCandidates});
    
  } catch (error) {
    console.error('Error fetching candidate details:', error);
  }
};

const getAllcandidates = async (req, res) => {
  try {
      let candidate = await CandidateModel.find();
      return res.status(200).send({
          message: "Data Fetch Successful",
          candidate   
      });
  } catch (error) {
      console.error('Error in getting all users:', error);
      return res.status(500).send({
          message: error.message || "Internal Server Error"
      });
  }
};

export default {
  CandidateName,
  // candidateId,
  addCandidate,
  getCandidateDetails,
  getAllcandidates
};
