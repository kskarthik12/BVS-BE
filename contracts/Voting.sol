// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    uint public candidatesCount;

    mapping(address => bool) public hasVoted;

    address public owner; // Address of the contract owner

    event Voted(uint indexed candidateId);
    event CandidateAdded(uint indexed candidateId, string name);
    event CandidateVoteCount(uint indexed candidateId, uint voteCount);

    constructor() {
        owner = msg.sender; // Set the contract deployer as the owner
    }

    modifier onlyOwner {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }

    function addCandidate(string memory _name) public onlyOwner {
        candidatesCount++;
        candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
        emit CandidateAdded(candidatesCount, _name);
    }

    function vote(uint _candidateId) public {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        require(!hasVoted[msg.sender], "You have already voted");

        candidates[_candidateId].voteCount++;
        hasVoted[msg.sender] = true;
        emit Voted(_candidateId);
        emitCandidateVoteCount(_candidateId);
    }

    function getCandidateVoteCount(uint _candidateId) public view returns (uint) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID");
        return candidates[_candidateId].voteCount;
    }

    function emitCandidateVoteCount(uint _candidateId) internal {
        uint voteCount = candidates[_candidateId].voteCount;
        emit CandidateVoteCount(_candidateId, voteCount);
    }
}
