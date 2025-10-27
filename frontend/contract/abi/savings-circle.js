export const SAVINGS_ABI = [
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			}
		],
		"name": "completeCycle",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			}
		],
		"name": "contributeToCurrentCycle",
		"outputs": [],
		"stateMutability": "payable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "string",
				"name": "_name",
				"type": "string"
			},
			{
				"internalType": "string",
				"name": "_description",
				"type": "string"
			},
			{
				"internalType": "uint256",
				"name": "_contributionAmount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_totalCycles",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_cycleDuration",
				"type": "uint256"
			}
		],
		"name": "createPot",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "potId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "cycle",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "winner",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "CycleCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "potId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "cycle",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "member",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "amount",
				"type": "uint256"
			}
		],
		"name": "CycleContribution",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			}
		],
		"name": "joinPot",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "potId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "member",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "memberCount",
				"type": "uint256"
			}
		],
		"name": "MemberJoined",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "potId",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalCycles",
				"type": "uint256"
			}
		],
		"name": "PotCompleted",
		"type": "event"
	},
	{
		"anonymous": false,
		"inputs": [
			{
				"indexed": true,
				"internalType": "uint256",
				"name": "potId",
				"type": "uint256"
			},
			{
				"indexed": true,
				"internalType": "address",
				"name": "creator",
				"type": "address"
			},
			{
				"indexed": false,
				"internalType": "string",
				"name": "name",
				"type": "string"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "totalCycles",
				"type": "uint256"
			},
			{
				"indexed": false,
				"internalType": "uint256",
				"name": "contributionAmount",
				"type": "uint256"
			}
		],
		"name": "PotCreated",
		"type": "event"
	},
	{
		"stateMutability": "payable",
		"type": "fallback"
	},
	{
		"stateMutability": "payable",
		"type": "receive"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			}
		],
		"name": "canCompleteCycle",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			}
		],
		"name": "getCurrentCycleCollection",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_cycle",
				"type": "uint256"
			}
		],
		"name": "getCycleInfo",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "cycleNumber",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalCollected",
						"type": "uint256"
					},
					{
						"internalType": "address",
						"name": "winner",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "completedAt",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isCompleted",
						"type": "bool"
					}
				],
				"internalType": "struct RecurringLotteryPot.CycleInfo",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			}
		],
		"name": "getCycleProgress",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "paidCount",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "totalMembers",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			}
		],
		"name": "getMembers",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			}
		],
		"name": "getPot",
		"outputs": [
			{
				"components": [
					{
						"internalType": "uint256",
						"name": "id",
						"type": "uint256"
					},
					{
						"internalType": "string",
						"name": "name",
						"type": "string"
					},
					{
						"internalType": "string",
						"name": "description",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "creator",
						"type": "address"
					},
					{
						"internalType": "uint256",
						"name": "contributionAmount",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "totalCycles",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "currentCycle",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "cycleDuration",
						"type": "uint256"
					},
					{
						"internalType": "uint256",
						"name": "lastCycleTime",
						"type": "uint256"
					},
					{
						"internalType": "bool",
						"name": "isActive",
						"type": "bool"
					},
					{
						"internalType": "bool",
						"name": "isCompleted",
						"type": "bool"
					},
					{
						"internalType": "uint256",
						"name": "createdAt",
						"type": "uint256"
					},
					{
						"internalType": "address[]",
						"name": "members",
						"type": "address[]"
					},
					{
						"internalType": "address[]",
						"name": "winners",
						"type": "address[]"
					}
				],
				"internalType": "struct RecurringLotteryPot.Pot",
				"name": "",
				"type": "tuple"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [],
		"name": "getTotalPots",
		"outputs": [
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			}
		],
		"name": "getWinners",
		"outputs": [
			{
				"internalType": "address[]",
				"name": "",
				"type": "address[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			},
			{
				"internalType": "uint256",
				"name": "_cycle",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_member",
				"type": "address"
			}
		],
		"name": "hasMemberPaidCycle",
		"outputs": [
			{
				"internalType": "bool",
				"name": "",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "_potId",
				"type": "uint256"
			},
			{
				"internalType": "address",
				"name": "_user",
				"type": "address"
			}
		],
		"name": "isMemberOf",
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