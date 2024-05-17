import hre from 'hardhat'
async function main() {
  const Voting = await hre.ethers.getContractFactory("Voting");
  const contract = await Voting.deploy();

  console.log("Voting contract deployed to:", contract.address);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
