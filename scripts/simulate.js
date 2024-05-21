// import hre from 'hardhat'


// async function main() {
//   const contractAddress ='0x443Afd658272339E36e1e23Af89B4C40996a9109';
//   const [deployer] = await hre.ethers.getSigners();
//   const Voting = await hre.ethers.getContractFactory("Voting");
//   const voting = Voting.attach(contractAddress);

//   const candidateId = 1000;
//   const district = "Thoothukkudi";

//   try {
//     await voting.addCandidate(candidateId, district);
//     console.log("Candidate added successfully");
//   } catch (error) {
//     console.error("Error:", error.message);
//   }
// }

// main()
//   .then(() => process.exit(0))
//   .catch((error) => {
//     console.error(error);
//     process.exit(1);
//   });
