# 🪙 Savings Circle DApp - Rootstock Blockchain

A decentralized savings circle application built on Rootstock, combining Bitcoin's security with Ethereum's smart contract capabilities. Create transparent, trustless savings pools with automated fund distribution.

![Rootstock](https://img.shields.io/badge/Rootstock-Testnet-orange) ![Solidity](https://img.shields.io/badge/Solidity-^0.8.20-blue) ![Next.js](https://img.shields.io/badge/Next.js-15-black) ![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

---

## 🎯 Overview

Traditional savings circles require trust in organizers and manual processes. This DApp eliminates intermediaries by bringing savings on-chain with smart contracts, ensuring transparency and automation.

**Why Rootstock?**
- **Bitcoin Security**: Merge-mined with Bitcoin for maximum security
- **EVM Compatible**: Use familiar Solidity and Ethereum tools
- **RBTC**: 1:1 Bitcoin peg for seamless DeFi participation
- **Fast & Cheap**: 30-second blocks with low transaction fees

---

## ✨ Features

**Core Functionality**
- Create custom savings pools with targets and recipients
- Contribute RBTC via MetaMask wallet integration
- Real-time progress tracking with live updates
- Automatic fund distribution when targets reached
  
**Technical Highlights**
- Smart contracts on Bitcoin-secured blockchain
- Modern React frontend with TypeScript
- Wagmi hooks for seamless Web3 interactions


---

## 🛠 Tech Stack

**Blockchain**
- Rootstock (RSK) - EVM-compatible Bitcoin sidechain
- Solidity ^0.8.20 - Smart contract language
- Hardhat/Remix - Development environment
- Viem - TypeScript Ethereum library

**Frontend**
- Next.js 15 - React framework with App Router
- TypeScript - Type-safe development
- Wagmi - React hooks for Web3
- Tailwind CSS - Utility-first styling
- shadcn/ui - Component library
- Three.js - 3D backgrounds

---

## 📦 Prerequisites

**Required**
- Node.js v18+ and npm
- MetaMask browser extension
- Git and code editor (VS Code recommended)

**Knowledge**
- Basic Solidity and JavaScript/TypeScript
- React fundamentals
- Blockchain concepts (wallets, transactions, gas)

---

## 🚀 Quick Start

### 1. MetaMask Configuration

Add Rootstock Testnet to MetaMask:

| Parameter | Value |
|-----------|-------|
| Network Name | Rootstock Testnet |
| RPC URL | `https://public-node.testnet.rsk.co` |
| Chain ID | `31` |
| Currency Symbol | `tRBTC` |
| Block Explorer | `https://explorer.testnet.rsk.co` |

Get test RBTC from [Rootstock Faucet](https://faucet.rootstock.io)

### 2. Clone & Install

```bash
# Clone repository
git clone https://github.com/yourusername/savings-circle-dapp.git
cd savings-circle-dapp

# Install smart contract dependencies
cd smart-contracts
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 3. Configure Environment

**Smart Contracts** - Create `smart-contracts/.env`:
```env
PRIVATE_KEY=your_metamask_private_key
```


### 4. Deploy Smart Contract

```bash
cd smart-contracts

# Compile contracts
npx hardhat compile

# Run tests
npx hardhat test

# Deploy to Rootstock testnet
npx hardhat run scripts/deploy.js --network rskTestnet
```

Save the deployed contract address for frontend configuration.

### 5. Run Frontend

```bash
cd frontend

# Development mode
npm run dev

# Production build
npm run build
npm start
```

Access at `http://localhost:3000`

---

## 📂 Project Structure

```
savings-circle-dapp/
│
├── frontend/
│   ├── app/
│   │   ├── create-pool/          # Pool creation page
│   │   ├── pools/                # Pool listing
│   │   │   └── [id]/            # Pool details (dynamic)
│   │   ├── layout.tsx            # Root layout with providers
│   │   ├── page.tsx              # Landing page
│   │   └── globals.css           # Global styles
│   │
│   ├── components/
│   │   ├── ui/                   # shadcn/ui components
│   │   ├── 3d-background.tsx     # Three.js background
│   │   ├── navbar.tsx            # Navigation with wallet
│   │   └── pool-card.tsx         # Pool display card
│   │
│   ├── lib/
│   │   └── utils.ts              # Helper functions
│   │
│   └── package.json
│
└── smart-contracts/
    ├── SavingsCircle.sol         # Main contract
    ├── scripts/                  # Deployment scripts
    ├── test/                     # Test suite
    └── hardhat.config.js         # Hardhat configuration
```

---

## 📖 Usage

### Creating a Pool

1. Navigate to "Create Pool" page
2. Enter pool details:
   - Name (max 50 characters)
   - Description (max 200 characters)
   - Target amount in RBTC
   - Recipient wallet address
3. Confirm MetaMask transaction
4. Wait ~30 seconds for confirmation

### Contributing to a Pool

1. Browse active pools on homepage
2. Click pool card to view details
3. Enter contribution amount
4. Confirm transaction in MetaMask
5. See real-time progress update

### Distributing Funds

When pool reaches target:
1. "Distribute Funds" button activates
2. Any participant can trigger distribution
3. Funds transfer automatically to recipient
4. Pool marked as completed

---

## 🧪 Testing

**Smart Contracts**
```bash
cd smart-contracts

# Run all tests
npx hardhat test

# Check coverage
npx hardhat coverage

# Test specific file
npx hardhat test test/SavingsCircle.test.js
```

**Frontend**
```bash
cd frontend

# Run tests (if configured)
npm test

# Type checking
npm run type-check
```

---

## 🏗 Architecture

**Smart Contract Design**
- `Pool` struct: stores name, target, current amount, recipient
- `Contribution` tracking per participant
- Events for all state changes
- Modifiers for access control
- ReentrancyGuard for security

**Frontend Flow**
1. User connects MetaMask via Wagmi
2. Contract calls through Viem/Wagmi hooks
3. Real-time updates via contract event listeners
4. State management with React hooks
5. UI updates reflect blockchain state

---

## 🔒 Security

**Smart Contract**
- ReentrancyGuard protection
- Input validation on all functions
- Access control with modifiers
- Safe math operations
- Comprehensive event logging

**Frontend**
- Environment variable protection
- Input sanitization
- Secure wallet connections
- HTTPS enforcement
- Regular dependency updates

---

## 🤝 Contributing

Contributions welcome! Please:
1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

MIT License - See LICENSE file for details


---

**Built with ❤️ on Rootstock**
