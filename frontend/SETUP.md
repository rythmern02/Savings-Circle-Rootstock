# Wallet Integration Setup

## Installation

Install the required dependencies for wallet integration:

```bash
npm install wagmi@^2.13.0 viem@^2.21.0 @tanstack/react-query@^5.56.0
```

Or if using npm:

```bash
npm install wagmi viem @tanstack/react-query
```

Or if using yarn:

```bash
yarn add wagmi viem @tanstack/react-query
```

## What's Been Set Up

### 1. Wallet Provider (`frontend/components/providers/wallet-provider.tsx`)
- Configured with Rootstock Testnet (Chain ID: 31)
- Integrated wagmi for wallet connections
- Set up React Query for state management

### 2. Contract Hooks (`frontend/hooks/useSavingsContract.ts`)
All contract interaction hooks are ready:

**Read Operations:**
- `useTotalPots()` - Get total number of pots
- `usePot(potId)` - Get pot details
- `usePotMembers(potId)` - Get list of members
- `useCycleProgress(potId)` - Get current cycle progress
- `useCurrentCycleCollection(potId)` - Get current cycle collection amount
- `useCycleInfo(potId, cycle)` - Get cycle information
- `useCanCompleteCycle(potId)` - Check if cycle can be completed
- `useIsMemberOf(potId, userAddress)` - Check if user is a member
- `useHasMemberPaidCycle(potId, cycle, member)` - Check if member paid for cycle
- `useWinners(potId)` - Get list of winners

**Write Operations:**
- `useCreatePot()` - Create a new savings pot
- `useJoinPot()` - Join an existing pot
- `useContributeToCycle()` - Contribute to current cycle
- `useCompleteCycle()` - Complete a cycle

### 3. Updated Navbar (`frontend/components/navbar.tsx`)
- Real wallet connection using wagmi
- Connect/disconnect functionality
- Displays connected wallet address

### 4. Contract Configuration (`frontend/config/contract.ts`)
- Contract address: `0x3Bce0A51945E93AAD9D355D3628eC2e13d8d313a`
- Rootstock Testnet RPC configuration

## Usage Example

```tsx
import { useCreatePot } from "@/hooks/useSavingsContract"
import { useAccount } from "wagmi"

function CreatePoolForm() {
  const { address, isConnected } = useAccount()
  const { createPot, isPending, error } = useCreatePot()
  
  const handleSubmit = async () => {
    if (!isConnected) return
    
    await createPot(
      "My Savings Pool",
      "Description here",
      "0.1", // Amount in RBTC
      BigInt(6), // Total cycles
      BigInt(2592000) // Cycle duration in seconds (30 days)
    )
  }
  
  return (
    <button onClick={handleSubmit} disabled={isPending}>
      {isPending ? "Creating..." : "Create Pool"}
    </button>
  )
}
```

## Network Configuration

The app is configured for **Rootstock Testnet**:
- Chain ID: 31
- RPC URL: https://public.rpc.testnet.rootstock.io
- Native Currency: RBTC (Rootstock Bitcoin)
- Blockchain Explorer: https://explorer.testnet.rootstock.io

## Notes

- Make sure MetaMask or another wallet extension is installed
- The wallet will prompt to switch to Rootstock Testnet when connecting
- Testnet RBTC can be obtained from faucets
- All contract interactions require an active wallet connection

