import { ethers } from 'ethers';
import fs from 'fs';
import CandidateModel from '../models/candidate.js';
import UserModel from '../models/user.js';


const contractABI = JSON.parse(fs.readFileSync('/home/karthik/BVS/BVS-BE/artifacts/contracts/Voting.sol/Voting.json', 'utf-8')).abi;
const provider = new ethers.providers.JsonRpcProvider(process.env.API_URL);
const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
const contractAddress = '0x2ABc162a8F4fc871ccF1C03020Eb57C4DF04651d';
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
  const candidateId = 25;
  const district = "Thoothukkudi";

  try {
    const tx = await contract.populateTransaction.addCandidate(candidateId, district);
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
     
     candidates.forEach(candidate => {
      console.log(`District: ${candidate.district}`);
      console.log(`Candidate ID: ${candidate.candidateId.toString()}`);
      console.log(`Vote Count: ${candidate.voteCount.toString()}`);
      
    });
    res.status(200).send({ message: 'Vote Status fetched Successfully',candidates});
    
  } catch (error) {
    console.error('Error fetching candidate details:', error);
  }
};

export default {
  CandidateName,
  candidateId,
  addCandidate,
  getCandidateDetails
};
