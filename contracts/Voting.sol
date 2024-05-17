// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Voting {
    struct Candidate {
        string district;
        uint256 candidateId;
        uint256 voteCount;
    }

    Candidate[] public candidates;
    mapping(address => bool) public voters;
    uint public candidatesCount;

    // Event to be emitted when a vote is cast
    event Voted(uint indexed candidateId, string district);

    // Function to add a candidate
    function addCandidate(uint256 _candidateId, string memory _district) public {
        candidates.push(Candidate({
            district: _district,
            candidateId: _candidateId,
            voteCount: 0
        }));
        candidatesCount++;
    }

    // Function to vote for a candidate
    function vote(uint256 _candidateId, string memory _district) public {
        require(!voters[msg.sender], "You have already voted.");
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");

        Candidate storage candidate = candidates[_candidateId - 1];
        require(keccak256(bytes(candidate.district)) == keccak256(bytes(_district)), "Invalid district.");

        voters[msg.sender] = true;
        candidate.voteCount++;

        emit Voted(_candidateId, _district);
    }

    // Function to get candidate details
    function getCandidate(uint _candidateId) public view returns (string memory, uint) {
        require(_candidateId > 0 && _candidateId <= candidatesCount, "Invalid candidate ID.");
        Candidate storage candidate = candidates[_candidateId - 1];
        return (candidate.district, candidate.voteCount);
    }
}
