"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Background3D } from "@/components/3d-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Calendar, Target, ArrowRight, Send, Loader2, CheckCircle } from "lucide-react"
import { 
  usePot, 
  usePotMembers, 
  useJoinPot, 
  useContributeToCycle, 
  useCycleProgress,
  useIsMemberOf,
  useCompleteCycle,
  useCanCompleteCycle 
} from "@/hooks/useSavingsContract"
import { useAccount } from "wagmi"
import { useWaitForTransactionReceipt } from "wagmi"
import { formatEther, parseEther } from "viem"

export default function PoolDetailPage() {
  const params = useParams()
  const router = useRouter()
  const poolId = params.id as string
  const { address, isConnected } = useAccount()
  
  // Convert string ID to BigInt
  const potId = poolId ? BigInt(poolId) : BigInt(0)
  
  // Contract hooks
  const { data: potData, isLoading: isLoadingPot } = usePot(potId)
  const { data: members, isLoading: isLoadingMembers } = usePotMembers(potId)
  const { data: cycleProgress } = useCycleProgress(potId)
  const { data: isMember } = useIsMemberOf(potId, address || "0x0")
  
  // Write hooks
  const { joinPot, hash: joinHash, isPending: isJoining } = useJoinPot()
  const { contributeToCycle, hash: contributeHash, isPending: isContributing } = useContributeToCycle()
  const { completeCycle, hash: completeHash, isPending: isCompleting } = useCompleteCycle()
  
  // Read hooks for cycle completion
  const { data: canComplete } = useCanCompleteCycle(potId)
  
  // Transaction status
  const { isLoading: isConfirmingJoin } = useWaitForTransactionReceipt({ hash: joinHash })
  const { isLoading: isConfirmingContribute } = useWaitForTransactionReceipt({ hash: contributeHash })
  const { isLoading: isConfirmingComplete } = useWaitForTransactionReceipt({ hash: completeHash })
  
  const [bidAmount, setBidAmount] = useState("")
  const [submitAmount, setSubmitAmount] = useState("")

  // Handle join pool
  const handleJoinPool = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    
    if (!isMember) {
      try {
        await joinPot(potId)
      } catch (err) {
        console.error("Error joining pool:", err)
        alert("Failed to join pool")
      }
    }
  }

  // Handle contribute
  const handleContribute = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    
    if (!isMember) {
      alert("Please join the pool first")
      return
    }
    
    if (!submitAmount || parseFloat(submitAmount) <= 0) {
      alert("Please enter a valid amount")
      return
    }
    
    try {
      await contributeToCycle(potId, submitAmount)
      setSubmitAmount("")
    } catch (err) {
      console.error("Error contributing:", err)
      alert("Failed to contribute")
    }
  }

  // Handle complete cycle
  const handleCompleteCycle = async () => {
    if (!isConnected) {
      alert("Please connect your wallet first")
      return
    }
    
    if (!isMember) {
      alert("Only members can complete cycles")
      return
    }
    
    try {
      await completeCycle(potId)
    } catch (err) {
      console.error("Error completing cycle:", err)
      alert("Failed to complete cycle")
    }
  }

  // Format blockchain data
  const pool = potData ? {
    id: poolId,
    name: potData.name || "Loading...",
    description: potData.description || "",
    members: members?.length || 0,
    maxMembers: 10, // This would come from the contract
    totalAmount: potData.contributionAmount ? Number(formatEther(potData.contributionAmount as bigint)) : 0,
    targetAmount: potData.contributionAmount ? Number(formatEther(potData.contributionAmount as bigint)) * Number(potData.totalCycles || BigInt(0)) : 0,
    duration: `${Number(potData.totalCycles || BigInt(0))} cycles`,
    status: (potData.isCompleted ? "completed" : potData.isActive ? "active" : "upcoming") as const,
    startDate: new Date(Number(potData.createdAt || BigInt(0)) * 1000).toLocaleDateString(),
    endDate: "N/A",
    rules: [
      "Minimum contribution per cycle required",
      "Equal contributions by all members",
      "Cycle completes when all members contribute",
    ],
    members_list: members?.map((member, idx) => ({
      id: idx.toString(),
      name: `${member.slice(0, 6)}...${member.slice(-4)}`,
      contribution: potData.contributionAmount ? Number(formatEther(potData.contributionAmount as bigint)) : 0,
      status: "active",
    })) || [],
  } : {
    id: poolId,
    name: "Loading...",
    description: "",
    members: 0,
    maxMembers: 0,
    totalAmount: 0,
    targetAmount: 0,
    duration: "",
    status: "upcoming" as const,
    startDate: "",
    endDate: "",
    rules: [],
    members_list: [],
  }

  const progress = pool.targetAmount > 0 ? (pool.totalAmount / pool.targetAmount) * 100 : 0

  return (
    <div className="min-h-screen bg-background">
      <Background3D />
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-2">{pool.name}</h1>
                <p className="text-lg text-muted-foreground">{pool.description}</p>
              </div>
              <div
                className={`px-4 py-2 rounded-lg text-sm font-semibold ${
                  pool.status === "active" ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {pool.status.charAt(0).toUpperCase() + pool.status.slice(1)}
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Left Column - Pool Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Progress Card */}
              <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur p-6 animate-slide-up">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-foreground">Pool Progress</h3>
                    <span className="text-2xl font-bold text-primary">{Math.round(progress)}%</span>
                  </div>
                  <div className="w-full h-3 bg-muted rounded-full overflow-hidden mb-4">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Current</p>
                      <p className="text-xl font-bold text-foreground">${pool.totalAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target</p>
                      <p className="text-xl font-bold text-foreground">${pool.targetAmount.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Remaining</p>
                      <p className="text-xl font-bold text-accent">
                        ${(pool.targetAmount - pool.totalAmount).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4">
                <Card
                  className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur p-6 animate-slide-up"
                  style={{ animationDelay: "100ms" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/20">
                        <Users className="w-5 h-5 text-primary" />
                      </div>
                      <span className="text-sm text-muted-foreground">Members</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">
                      {pool.members}/{pool.maxMembers}
                    </p>
                  </div>
                </Card>

                <Card
                  className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur p-6 animate-slide-up"
                  style={{ animationDelay: "150ms" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-accent/20">
                        <Calendar className="w-5 h-5 text-accent" />
                      </div>
                      <span className="text-sm text-muted-foreground">Duration</span>
                    </div>
                    <p className="text-2xl font-bold text-foreground">{pool.duration}</p>
                  </div>
                </Card>
              </div>

              {/* Rules */}
              <Card
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur p-6 animate-slide-up"
                style={{ animationDelay: "200ms" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <h3 className="text-lg font-bold text-foreground mb-4">Pool Rules</h3>
                  <ul className="space-y-3">
                    {pool.rules.map((rule, index) => (
                      <li key={index} className="flex items-start gap-3">
                        <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                        <span className="text-sm text-muted-foreground">{rule}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>

              {/* Members */}
              <Card
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur p-6 animate-slide-up"
                style={{ animationDelay: "250ms" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <h3 className="text-lg font-bold text-foreground mb-4">Pool Members</h3>
                  <div className="space-y-3">
                    {pool.members_list.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors"
                      >
                        <div>
                          <p className="text-sm font-medium text-foreground">{member.name}</p>
                          <p className="text-xs text-muted-foreground">{member.status}</p>
                        </div>
                        <p className="text-sm font-bold text-primary">${member.contribution.toLocaleString()}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
            </div>

            {/* Right Column - Actions */}
            <div className="space-y-6">
              {/* Bid Section */}
              <Card
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur p-6 animate-slide-up"
                style={{ animationDelay: "300ms" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <Target className="w-5 h-5 text-primary" />
                    Place a Bid
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">Bid Amount</label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={bidAmount}
                        onChange={(e:any) => setBidAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <Button 
                      onClick={handleJoinPool}
                      disabled={isJoining || isConfirmingJoin || isMember}
                      className="w-full gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 disabled:opacity-50"
                    >
                      {isJoining || isConfirmingJoin ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {(isConfirmingJoin ? "Confirming..." : "Joining...")}
                        </>
                      ) : isMember ? (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Joined
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Join Pool
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Submit Contribution */}
              <Card
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur p-6 animate-slide-up"
                style={{ animationDelay: "350ms" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative">
                  <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-accent" />
                    Add Contribution
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <label className="text-xs text-muted-foreground block mb-2">Amount</label>
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={submitAmount}
                        onChange={(e:any) => setSubmitAmount(e.target.value)}
                        className="w-full px-3 py-2 bg-muted/50 border border-border/50 rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-all"
                      />
                    </div>
                    <Button 
                      onClick={handleContribute}
                      disabled={isContributing || isConfirmingContribute || !isMember}
                      className="w-full gap-2 bg-gradient-to-r from-accent to-primary hover:from-accent/90 hover:to-primary/90 text-primary-foreground border-0 disabled:opacity-50"
                    >
                      {isContributing || isConfirmingContribute ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {(isConfirmingContribute ? "Confirming..." : "Submitting...")}
                        </>
                      ) : (
                        <>
                          <ArrowRight className="w-4 h-4" />
                          Submit Contribution
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </Card>

              {/* Complete Cycle */}
              {isMember && canComplete && (
                <Card
                  className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur p-6 animate-slide-up"
                  style={{ animationDelay: "350ms" }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <h3 className="text-lg font-bold text-foreground mb-4 flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-primary" />
                      Complete Cycle
                    </h3>
                    <Button 
                      onClick={handleCompleteCycle}
                      disabled={isCompleting || isConfirmingComplete}
                      className="w-full gap-2 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white border-0 disabled:opacity-50"
                    >
                      {isCompleting || isConfirmingComplete ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          {(isConfirmingComplete ? "Confirming..." : "Completing...")}
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4" />
                          Complete Current Cycle
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Pool Info */}
              <Card
                className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur p-6 animate-slide-up"
                style={{ animationDelay: "400ms" }}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Start Date</p>
                    <p className="text-sm font-medium text-foreground">{pool.startDate}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">End Date</p>
                    <p className="text-sm font-medium text-foreground">{pool.endDate}</p>
                  </div>
                  <div className="pt-4 border-t border-border/30">
                    <Button
                      variant="outline"
                      className="w-full border-border/50 hover:border-destructive/50 hover:text-destructive bg-transparent"
                    >
                      Leave Pool
                    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
