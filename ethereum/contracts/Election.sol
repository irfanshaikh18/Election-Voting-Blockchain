// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.9;
/**
 * @title Owner
 * @dev Set & change owner
 */
contract ElectionFactory{

    address public deployedElection;
    address[] public elections;
    uint public count = 0; //keeping track and making sure there is only one deployed election
    uint i;

    function createElection(string memory name) public{
        require(count<1); //checking if there are more than 1 deployed election
        deployedElection = address(new Election(name, msg.sender));
        //elections[i++] = deployedElection;
        elections.push(deployedElection);
        count++;
    }

    function clearFactory() public{
        //removing current deployed election
        count =0;
        deployedElection =0x0000000000000000000000000000000000000000;
    }

}
contract Election {

    struct Candidate{
        string name;
        string description; 
        string url;
        uint votes;
    }

    //Candidate[] public candidates;
    mapping(uint => Candidate) public candidates;
    uint public candidateCount;
    address public admin;
    mapping(address => bool) public voters;
    string public electionName;
    bool public started; //true when election starts
    //this variable is only used to make sure candidates cant be after starting and after ending election
    bool public ended;  //ended indicates time to add candidate has ended
    
    //modifier to check election has started
    modifier electionStarted() {
        require(started);
        _;
    }
    //modifer to check manager
    modifier restricted() {
        require(msg.sender == admin);
        _;
    }
    //constructor
    constructor(string memory name, address creator) {
        admin = creator;
        electionName = name;
    }
    //start election
    function startElection() public restricted{
        require(!started);
        started = true;
        ended = true;
    }


    //add candidate 
    function addCandidate(string memory name, string memory description, string memory url) public restricted{
        require(!ended); //checking if time to add candidates has ended
        require(!started); 

        Candidate storage c = candidates[candidateCount++];
        c.name = name;
        c.description = description;
        c.url = url;
        c.votes = 0;
    }

    //vote candidate
    function voteCandidate(uint id) public electionStarted{

        Candidate storage currentCandidate = candidates[id];
        //checking if user has already voted
        require(!voters[msg.sender]);
        //voting candidate
        currentCandidate.votes++;
        //adding user to mapping
        voters[msg.sender] = true;

     }

    //end election
    function endElection() public restricted electionStarted{
        //A finished election will always have started = false, ended = true
        started = false;
        ended = true;
    }
}