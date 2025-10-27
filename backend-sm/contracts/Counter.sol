// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

/**
 * @title RecurringLotteryPot
 * @dev Multi-cycle lottery pot (e.g., 6 months) where each month one member wins
 */
contract RecurringLotteryPot {
    
    struct Pot {
        uint256 id;
        string name;
        string description;
        address creator;
        uint256 contributionAmount;      // Fixed amount per member per cycle
        uint256 totalCycles;             // e.g., 6 for 6-month pot
        uint256 currentCycle;            // Current cycle number (1 to totalCycles)
        uint256 cycleDuration;           // Duration of each cycle in seconds (e.g., 30 days)
        uint256 lastCycleTime;           // Timestamp of last cycle completion
        bool isActive;
        bool isCompleted;
        uint256 createdAt;
        address[] members;
        address[] winners;               // Track winners of each cycle
    }
    
    struct CycleInfo {
        uint256 cycleNumber;
        uint256 totalCollected;
        address winner;
        uint256 completedAt;
        bool isCompleted;
    }
    
    uint256 private potCount;
    mapping(uint256 => Pot) private pots;
    mapping(uint256 => mapping(address => bool)) private isMember;
    mapping(uint256 => mapping(uint256 => mapping(address => bool))) private hasPaidCycle; // potId => cycle => member => paid
    mapping(uint256 => mapping(uint256 => uint256)) private cycleCollections; // potId => cycle => amount
    mapping(uint256 => mapping(uint256 => CycleInfo)) private cycleHistory; // potId => cycle => info
    
    event PotCreated(uint256 indexed potId, address indexed creator, string name, uint256 totalCycles, uint256 contributionAmount);
    event MemberJoined(uint256 indexed potId, address indexed member, uint256 memberCount);
    event CycleContribution(uint256 indexed potId, uint256 indexed cycle, address indexed member, uint256 amount);
    event CycleCompleted(uint256 indexed potId, uint256 indexed cycle, address indexed winner, uint256 amount);
    event PotCompleted(uint256 indexed potId, uint256 totalCycles);
    
    modifier potExists(uint256 _potId) {
        require(_potId > 0 && _potId <= potCount, "Pot does not exist");
        _;
    }
    
    /**
     * @dev Create a new recurring lottery pot
     * @param _name Name of the pot
     * @param _description Description
     * @param _contributionAmount Fixed amount each member pays per cycle
     * @param _totalCycles Total number of cycles (e.g., 6 for 6 months)
     * @param _cycleDuration Duration of each cycle in seconds (e.g., 30 days = 2592000)
     */
    function createPot(
        string memory _name,
        string memory _description,
        uint256 _contributionAmount,
        uint256 _totalCycles,
        uint256 _cycleDuration
    ) external returns (uint256) {
        require(_contributionAmount > 0, "Contribution must be > 0");
        require(_totalCycles > 1, "Need at least 2 cycles");
        require(_totalCycles <= 24, "Max 24 cycles allowed");
        require(_cycleDuration >= 1 days, "Cycle must be at least 1 day");
        require(bytes(_name).length > 0, "Name required");
        
        potCount++;
        Pot storage newPot = pots[potCount];
        newPot.id = potCount;
        newPot.name = _name;
        newPot.description = _description;
        newPot.creator = msg.sender;
        newPot.contributionAmount = _contributionAmount;
        newPot.totalCycles = _totalCycles;
        newPot.currentCycle = 1;
        newPot.cycleDuration = _cycleDuration;
        newPot.isActive = true;
        newPot.createdAt = block.timestamp;
        newPot.lastCycleTime = block.timestamp;
        
        // Creator auto-joins
        newPot.members.push(msg.sender);
        isMember[potCount][msg.sender] = true;
        
        emit PotCreated(potCount, msg.sender, _name, _totalCycles, _contributionAmount);
        emit MemberJoined(potCount, msg.sender, 1);
        
        return potCount;
    }
    
    /**
     * @dev Join a pot (only allowed before first cycle completes)
     */
    function joinPot(uint256 _potId) 
        external 
        potExists(_potId)
    {
        Pot storage pot = pots[_potId];
        require(pot.isActive, "Pot not active");
        require(pot.currentCycle == 1, "Can only join before first cycle completes");
        require(!isMember[_potId][msg.sender], "Already a member");
        require(pot.members.length < pot.totalCycles, "Pot is full");
        
        pot.members.push(msg.sender);
        isMember[_potId][msg.sender] = true;
        
        emit MemberJoined(_potId, msg.sender, pot.members.length);
    }
    
    /**
     * @dev Contribute to current cycle
     */
    function contributeToCurrentCycle(uint256 _potId) 
        external 
        payable 
        potExists(_potId)
    {
        Pot storage pot = pots[_potId];
        require(pot.isActive, "Pot not active");
        require(!pot.isCompleted, "Pot completed");
        require(isMember[_potId][msg.sender], "Not a member");
        require(msg.value == pot.contributionAmount, "Exact contribution amount required");
        require(!hasPaidCycle[_potId][pot.currentCycle][msg.sender], "Already paid this cycle");
        
        hasPaidCycle[_potId][pot.currentCycle][msg.sender] = true;
        cycleCollections[_potId][pot.currentCycle] += msg.value;
        
        emit CycleContribution(_potId, pot.currentCycle, msg.sender, msg.value);
    }
    
    /**
     * @dev Complete current cycle: draw winner and pay, then move to next cycle
     */
    function completeCycle(uint256 _potId)
        external
        potExists(_potId)
    {
        Pot storage pot = pots[_potId];
        require(pot.isActive, "Pot not active");
        require(!pot.isCompleted, "Pot already completed");
        
        uint256 currentCycle = pot.currentCycle;
        
        // Check if all members have paid for this cycle
        uint256 paidCount = 0;
        for (uint256 i = 0; i < pot.members.length; i++) {
            if (hasPaidCycle[_potId][currentCycle][pot.members[i]]) {
                paidCount++;
            }
        }
        require(paidCount == pot.members.length, "Not all members paid");
        
        // Check if minimum cycle duration has passed
        require(
            block.timestamp >= pot.lastCycleTime + pot.cycleDuration,
            "Cycle duration not elapsed"
        );
        
        // Get eligible members (those who haven't won yet)
        address[] memory eligibleMembers = _getEligibleMembers(_potId);
        require(eligibleMembers.length > 0, "No eligible members");
        
        // Draw winner from eligible members
        uint256 randomNum = uint256(
            keccak256(
                abi.encodePacked(
                    block.timestamp,
                    block.prevrandao,
                    _potId,
                    currentCycle,
                    msg.sender
                )
            )
        );
        
        address winner = eligibleMembers[randomNum % eligibleMembers.length];
        uint256 prizeAmount = cycleCollections[_potId][currentCycle];
        
        // Record winner
        pot.winners.push(winner);
        
        // Store cycle history
        cycleHistory[_potId][currentCycle] = CycleInfo({
            cycleNumber: currentCycle,
            totalCollected: prizeAmount,
            winner: winner,
            completedAt: block.timestamp,
            isCompleted: true
        });
        
        // Transfer prize
        (bool success, ) = payable(winner).call{value: prizeAmount}("");
        require(success, "Transfer failed");
        
        emit CycleCompleted(_potId, currentCycle, winner, prizeAmount);
        
        // Move to next cycle or complete pot
        if (currentCycle >= pot.totalCycles) {
            pot.isCompleted = true;
            pot.isActive = false;
            emit PotCompleted(_potId, pot.totalCycles);
        } else {
            pot.currentCycle++;
            pot.lastCycleTime = block.timestamp;
        }
    }
    
    /**
     * @dev Get eligible members (who haven't won yet)
     */
    function _getEligibleMembers(uint256 _potId) 
        private 
        view 
        returns (address[] memory) 
    {
        Pot storage pot = pots[_potId];
        address[] memory tempEligible = new address[](pot.members.length);
        uint256 count = 0;
        
        for (uint256 i = 0; i < pot.members.length; i++) {
            address member = pot.members[i];
            bool hasWon = false;
            
            // Check if member has already won
            for (uint256 j = 0; j < pot.winners.length; j++) {
                if (pot.winners[j] == member) {
                    hasWon = true;
                    break;
                }
            }
            
            if (!hasWon) {
                tempEligible[count] = member;
                count++;
            }
        }
        
        // Create exact-sized array
        address[] memory eligible = new address[](count);
        for (uint256 i = 0; i < count; i++) {
            eligible[i] = tempEligible[i];
        }
        
        return eligible;
    }
    
    // ============ View Functions ============
    
    function getPot(uint256 _potId) 
        external 
        view 
        potExists(_potId) 
        returns (Pot memory) 
    {
        return pots[_potId];
    }
    
    function getMembers(uint256 _potId)
        external
        view
        potExists(_potId)
        returns (address[] memory)
    {
        return pots[_potId].members;
    }
    
    function getWinners(uint256 _potId)
        external
        view
        potExists(_potId)
        returns (address[] memory)
    {
        return pots[_potId].winners;
    }
    
    function getCycleInfo(uint256 _potId, uint256 _cycle)
        external
        view
        potExists(_potId)
        returns (CycleInfo memory)
    {
        return cycleHistory[_potId][_cycle];
    }
    
    function hasMemberPaidCycle(uint256 _potId, uint256 _cycle, address _member)
        external
        view
        potExists(_potId)
        returns (bool)
    {
        return hasPaidCycle[_potId][_cycle][_member];
    }
    
    function getCurrentCycleCollection(uint256 _potId)
        external
        view
        potExists(_potId)
        returns (uint256)
    {
        return cycleCollections[_potId][pots[_potId].currentCycle];
    }
    
    function getCycleProgress(uint256 _potId)
        external
        view
        potExists(_potId)
        returns (uint256 paidCount, uint256 totalMembers)
    {
        Pot storage pot = pots[_potId];
        totalMembers = pot.members.length;
        paidCount = 0;
        
        for (uint256 i = 0; i < pot.members.length; i++) {
            if (hasPaidCycle[_potId][pot.currentCycle][pot.members[i]]) {
                paidCount++;
            }
        }
    }
    
    function isMemberOf(uint256 _potId, address _user)
        external
        view
        potExists(_potId)
        returns (bool)
    {
        return isMember[_potId][_user];
    }
    
    function getTotalPots() external view returns (uint256) {
        return potCount;
    }
    
    function canCompleteCycle(uint256 _potId)
        external
        view
        potExists(_potId)
        returns (bool)
    {
        Pot storage pot = pots[_potId];
        if (!pot.isActive || pot.isCompleted) return false;
        
        // Check if all paid
        uint256 paidCount = 0;
        for (uint256 i = 0; i < pot.members.length; i++) {
            if (hasPaidCycle[_potId][pot.currentCycle][pot.members[i]]) {
                paidCount++;
            }
        }
        
        if (paidCount != pot.members.length) return false;
        
        // Check time elapsed
        return block.timestamp >= pot.lastCycleTime + pot.cycleDuration;
    }
    
    receive() external payable {
        revert("Use contributeToCurrentCycle()");
    }
    
    fallback() external payable {
        revert("Invalid call");
    }
}