import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi"
import { parseEther } from "viem"
import { CONTRACT_ADDRESS } from "@/config/contract"
import { SAVINGS_ABI } from "@/contract/abi/savings-circle"

// Read hooks
export function useTotalPots() {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVINGS_ABI,
    functionName: "getTotalPots",
  })
}

export function usePot(potId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVINGS_ABI,
    functionName: "getPot",
    args: [potId],
  })
}

export function usePotMembers(potId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVINGS_ABI,
    functionName: "getMembers",
    args: [potId],
  })
}

export function useCycleProgress(potId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVINGS_ABI,
    functionName: "getCycleProgress",
    args: [potId],
  })
}

export function useCurrentCycleCollection(potId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVINGS_ABI,
    functionName: "getCurrentCycleCollection",
    args: [potId],
  })
}

export function useCycleInfo(potId: bigint, cycle: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVINGS_ABI,
    functionName: "getCycleInfo",
    args: [potId, cycle],
  })
}

export function useCanCompleteCycle(potId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVINGS_ABI,
    functionName: "canCompleteCycle",
    args: [potId],
  })
}

export function useIsMemberOf(potId: bigint, userAddress: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVINGS_ABI,
    functionName: "isMemberOf",
    args: [potId, userAddress],
  })
}

export function useHasMemberPaidCycle(potId: bigint, cycle: bigint, member: `0x${string}`) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVINGS_ABI,
    functionName: "hasMemberPaidCycle",
    args: [potId, cycle, member],
  })
}

export function useWinners(potId: bigint) {
  return useReadContract({
    address: CONTRACT_ADDRESS,
    abi: SAVINGS_ABI,
    functionName: "getWinners",
    args: [potId],
  })
}

// Write hooks
export function useCreatePot() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const createPot = async (
    name: string,
    description: string,
    contributionAmount: string, // in ETH/RBTC
    totalCycles: bigint,
    cycleDuration: bigint // in seconds
  ) => {
    const amountInWei = parseEther(contributionAmount)
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SAVINGS_ABI,
      functionName: "createPot",
      args: [name, description, amountInWei, totalCycles, cycleDuration],
    })
  }

  return { createPot, hash, isPending, error }
}

// Hook to get the new pool ID from a transaction
export function usePoolIdFromTx(hash: `0x${string}` | undefined) {
  const { data: receipt } = useWaitForTransactionReceipt({ hash })
  
  return receipt
}

export function useJoinPot() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const joinPot = async (potId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SAVINGS_ABI,
      functionName: "joinPot",
      args: [potId],
    })
  }

  return { joinPot, hash, isPending, error }
}

export function useContributeToCycle() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const contributeToCycle = async (
    potId: bigint,
    amount: string // in ETH/RBTC
  ) => {
    const amountInWei = parseEther(amount)
    
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SAVINGS_ABI,
      functionName: "contributeToCurrentCycle",
      args: [potId],
      value: amountInWei,
    })
  }

  return { contributeToCycle, hash, isPending, error }
}

export function useCompleteCycle() {
  const { writeContract, data: hash, isPending, error } = useWriteContract()
  
  const completeCycle = async (potId: bigint) => {
    writeContract({
      address: CONTRACT_ADDRESS,
      abi: SAVINGS_ABI,
      functionName: "completeCycle",
      args: [potId],
    })
  }

  return { completeCycle, hash, isPending, error }
}

