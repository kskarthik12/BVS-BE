// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string district;
        string candidateName;
        uint256 candidateId;
        uint256 voteCount;
    }

    Candidate[] public candidates;
    mapping(address => bool) public voters;
    address public owner;

    // Event to be emitted when a vote is cast
    event Voted(uint indexed candidateId, string district);


    // Modifier to only allow the owner to execute the function
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can perform this action");
        _;
    }


    // Constructor to set the owner and add initial candidates
    constructor() {
        owner = msg.sender;
        addInitialCandidates();
    }

    // Function to add initial candidates, only accessible by the owner
    function addInitialCandidates() private onlyOwner {
        
        candidates.push(Candidate("Thoothukkudi","Manikkaraj A", 1, 0));
        candidates.push(Candidate("Thoothukkudi","Sivasamy Velumani", 2, 0));
        candidates.push(Candidate("Thoothukkudi","Kanimozhi", 3, 0));
        candidates.push(Candidate("Thoothukkudi","Vijayaseelan S.D.R", 4, 0));
        candidates.push(Candidate("Tirunelveli","Balasubramanian", 5, 0));
        candidates.push(Candidate("Tirunelveli","Jansi Rani M", 6, 0));
        candidates.push(Candidate("Tirunelveli","Nainar Nagenthran", 7, 0));
        candidates.push(Candidate("Tirunelveli","Athisayam V", 8, 0));
        
    }

    // Function to add a candidate, only accessible by the owner
    function addCandidate(uint256 _candidateId, string memory _district, string memory _candidateName) public onlyOwner {
        candidates.push(Candidate({
            district: _district,
            candidateId: _candidateId,
            candidateName:_candidateName,
            voteCount: 0 // Initialize vote count to 0
        }));
    }

    // Function to vote for a candidate
    function vote(uint256 _candidateId, string memory _district) public {
        require(!voters[msg.sender], "You have already voted.");

        for (uint i = 0; i < candidates.length; i++) {
            if (keccak256(bytes(candidates[i].district)) == keccak256(bytes(_district)) && candidates[i].candidateId == _candidateId) {
                candidates[i].voteCount++;
                voters[msg.sender] = true;
                emit Voted(_candidateId, _district);
                return; // Exit the function once vote is counted
            }
        }

        revert("Candidate not found for the given district and ID.");
    }

    // Function to get vote status
    function getAllVotesOfCandidates() public view returns (Candidate[] memory){
        return candidates;
    }
}
