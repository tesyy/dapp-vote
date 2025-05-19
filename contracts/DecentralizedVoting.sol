pragma solidity ^0.5.15;

/**
 * @title Decentralized Voting System
 * @dev Implements a voting system with candidates and voter tracking
 */
contract DecentralizedVoting {
    struct Candidate {
        uint id;
        string name;
        string party;
        uint voteCount;
    }

    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public hasVoted;
    
    uint public totalCandidates;
    uint256 public votingStartTime;
    uint256 public votingEndTime;

    /**
     * @dev Contract constructor
     * @param _startTime The Unix timestamp for when voting starts
     * @param _endTime The Unix timestamp for when voting ends
     */
    constructor(uint256 _startTime, uint256 _endTime) public {
        require(_startTime < _endTime, "Start time must be before end time");
        // It's good practice to ensure start time is not in the past, 
        // but block.timestamp can be manipulated by miners to some extent.
        // For critical applications, consider an off-chain mechanism or oracle for time.
        require(block.timestamp < _startTime, "Start time must be in the future or very near future");
        votingStartTime = _startTime;
        votingEndTime = _endTime;
    }

    /**
     * @dev Adds a new candidate to the election
     * @param candidateName Name of the candidate
     * @param candidateParty Political party of the candidate
     * @return The ID of the newly added candidate
     */
    function addCandidate(string memory candidateName, string memory candidateParty) 
        public 
        returns(uint) 
    {
        totalCandidates++;
        candidates[totalCandidates] = Candidate(
            totalCandidates,
            candidateName,
            candidateParty,
            0
        );
        return totalCandidates;
    }

    /**
     * @dev Cast a vote for a candidate
     * @param candidateId The ID of the candidate to vote for
     */
    function castVote(uint candidateId) public {
        require(block.timestamp >= votingStartTime && block.timestamp <= votingEndTime, 
            "Voting period is not active");
        require(candidateId > 0 && candidateId <= totalCandidates, 
            "Invalid candidate ID");
        require(!hasVoted[msg.sender], 
            "You have already voted");
            
        hasVoted[msg.sender] = true;
        candidates[candidateId].voteCount++;
    }

    // View functions could be added here, for example:
    // function getCandidate(uint candidateId) public view returns (uint, string memory, string memory, uint) {
    //     require(candidateId > 0 && candidateId <= totalCandidates, "Invalid candidate ID");
    //     Candidate memory c = candidates[candidateId];
    //     return (c.id, c.name, c.party, c.voteCount);
    // }
    // 
    // function getVotingStatus() public view returns (bool, uint256, uint256) {
    //     bool isActive = block.timestamp >= votingStartTime && block.timestamp <= votingEndTime;
    //     return (isActive, votingStartTime, votingEndTime);
    // }
} 