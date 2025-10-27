"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Background3D } from "@/components/3d-background"
import { PoolCard } from "@/components/pool-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Zap, ArrowRight } from "lucide-react"
import { useTotalPots } from "@/hooks/useSavingsContract"
import { useAccount } from "wagmi"
import { formatEther, encodeFunctionData, decodeFunctionResult } from "viem"
import { CONTRACT_ADDRESS, RPC_URL } from "@/config/contract"
import { SAVINGS_ABI } from "@/contract/abi/savings-circle"

interface Pool {
  id: string
  name: string
  description: string
  members: number
  maxMembers: number
  totalAmount: number
  targetAmount: number
  duration: string
  status: "active" | "completed" | "upcoming"
}

export default function Dashboard() {
  const { address, isConnected } = useAccount()
  const { data: totalPots, isLoading: isLoadingTotal } = useTotalPots()
  const [recentPools, setRecentPools] = useState<Pool[]>([])
  const [isLoadingPools, setIsLoadingPools] = useState(false)
  const [totalValue, setTotalValue] = useState(0)
  const [activePoolsCount, setActivePoolsCount] = useState(0)

  // Fetch recent pools from blockchain with automatic refresh
  useEffect(() => {
    const fetchRecentPools = async () => {
      if (!totalPots || Number(totalPots) === 0) {
        setRecentPools([])
        setTotalValue(0)
        setActivePoolsCount(0)
        return
      }

      setIsLoadingPools(true)
      try {
        const potCount = Number(totalPots)
        const pools: Pool[] = []
        let totalVal = 0
        let activeCount = 0
        
        // Fetch all pools to calculate accurate stats
        for (let i = 0; i < potCount; i++) {
          try {
            const response = await fetch(RPC_URL, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                jsonrpc: '2.0',
                id: 1,
                method: 'eth_call',
                params: [{
                  to: CONTRACT_ADDRESS.toLowerCase(),
                  data: encodeFunctionData({
                    abi: SAVINGS_ABI,
                    functionName: 'getPot',
                    args: [BigInt(i)]
                  })
                }, 'latest']
              })
            })
            
            if (!response.ok) {
              console.error(`Error fetching pot ${i}: HTTP ${response.status}`)
              continue
            }
            
            const text = await response.text()
            if (!text || text.trim() === '') {
              console.error(`Empty response for pot ${i}`)
              continue
            }
            
            let result
            try {
              result = JSON.parse(text)
            } catch (jsonError) {
              console.error(`Invalid JSON response for pot ${i}:`, text)
              continue
            }
            
            if (result.result && result.result !== '0x') {
              // Decode the result - The contract returns a tuple (struct)
              const decoded = decodeFunctionResult({
                abi: SAVINGS_ABI,
                functionName: 'getPot',
                data: result.result
              }) as any
              
              // The decoded result might be wrapped in an array
              const pot = Array.isArray(decoded) && decoded.length === 1 ? decoded[0] : decoded
              
              console.log(`Pot ${i} structure:`, pot)
              
              // Extract fields with fallbacks
              const potId = pot.id !== undefined ? Number(pot.id) : (pot[0] !== undefined ? Number(pot[0]) : i)
              const name = pot.name || pot[1] || `Pool #${i + 1}`
              const description = pot.description || pot[2] || "A savings pool on Rootstock"
              const contributionAmount = pot.contributionAmount || pot[4] || BigInt(0)
              const totalCycles = pot.totalCycles !== undefined ? Number(pot.totalCycles) : (pot[5] !== undefined ? Number(pot[5]) : 0)
              const currentCycle = pot.currentCycle !== undefined ? Number(pot.currentCycle) : (pot[6] !== undefined ? Number(pot[6]) : 0)
              const isActive = pot.isActive !== undefined ? pot.isActive : (pot[9] !== undefined ? pot[9] : false)
              const isCompleted = pot.isCompleted !== undefined ? pot.isCompleted : (pot[10] !== undefined ? pot[10] : false)
              const createdAt = pot.createdAt !== undefined ? Number(pot.createdAt) : (pot[11] !== undefined ? Number(pot[11]) : Date.now() / 1000)
              const members = pot.members || pot[12] || []
              
              // Safe conversion with error handling
              let contributionAmountEth = 0
              try {
                if (contributionAmount && contributionAmount !== BigInt(0)) {
                  contributionAmountEth = Number(formatEther(contributionAmount))
                }
              } catch (err) {
                console.error(`Error formatting contribution amount for pot ${i}:`, err)
              }
              
              const memberCount = Array.isArray(members) ? members.length : 0
              const targetAmount = contributionAmountEth * totalCycles
              const totalAmount = contributionAmountEth * memberCount * currentCycle
              
              // Calculate total value locked
              totalVal += totalAmount
              
              // Determine status
              let status: "active" | "completed" | "upcoming" = "upcoming"
              if (isCompleted) {
                status = "completed"
              } else if (isActive && memberCount > 0) {
                status = "active"
                activeCount++
              }
              
              const poolData = {
                id: potId.toString(),
                name: name,
                description: description,
                members: memberCount,
                maxMembers: totalCycles || 10,
                totalAmount: totalAmount,
                targetAmount: targetAmount,
                duration: `${totalCycles} cycles`,
                status: status,
              }
              
              pools.push(poolData)
            }
          } catch (err) {
            console.error(`Error fetching pot ${i}:`, err)
          }
        }
        
        // Sort by ID (newest first) and take last 3 for display
        pools.sort((a, b) => Number(b.id) - Number(a.id))
        const recentThree = pools.slice(0, 3)
        
        setRecentPools(recentThree)
        setTotalValue(totalVal)
        setActivePoolsCount(activeCount)
        setIsLoadingPools(false)
      } catch (err) {
        console.error("Error fetching pools:", err)
        setRecentPools([])
        setTotalValue(0)
        setActivePoolsCount(0)
        setIsLoadingPools(false)
      }
    }
    
    if (totalPots !== undefined) {
      fetchRecentPools()
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchRecentPools()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [totalPots])

  // Calculate stats from blockchain data
  const stats = [
    {
      label: "Total Pools",
      value: isLoadingTotal ? "..." : totalPots ? String(totalPots) : "0",
      change: "on-chain pools",
      icon: Users,
      color: "from-primary to-accent",
    },
    {
      label: "Active Savings",
      value: isLoadingPools ? "..." : `$${totalValue.toFixed(2)}`,
      change: `${activePoolsCount} active pools`,
      icon: TrendingUp,
      color: "from-accent to-primary",
    },
    {
      label: "Network",
      value: "Rootstock",
      change: "Testnet",
      icon: Zap,
      color: "from-primary/80 to-accent/80",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Background3D />
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-12 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Welcome to Your Savings Circle
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Join collective savings pools, earn together, and achieve your financial goals with your community.
            </p>
            <Link href="/create-pool">
              <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0 text-base h-12 px-8">
                Create Your First Pool
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {stats.map((stat, index) => {
              const Icon = stat.icon
              return (
                <Card
                  key={index}
                  className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:border-primary/50 p-6 animate-slide-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                        <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                      </div>
                      <div className={`p-3 rounded-lg bg-gradient-to-br ${stat.color}`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                    </div>
                    <p className="text-xs text-primary">{stat.change}</p>
                  </div>
                </Card>
              )
            })}
          </div>

          {/* Recent Pools Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Recent Pools</h2>
              <Link href="/pools">
                <Button
                  variant="outline"
                  className="border-border/50 hover:border-primary/50 hover:bg-primary/10 bg-transparent"
                >
                  View All Pools
                </Button>
              </Link>
            </div>

            {isLoadingTotal || isLoadingPools ? (
              <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-muted-foreground">Loading pools from blockchain...</p>
              </div>
            ) : recentPools.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentPools.map((pool, index) => (
                  <div key={pool.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                    <PoolCard
                      {...pool}
                      onView={() => window.location.href = `/pools/${pool.id}`}
                      onJoin={() => window.location.href = `/pools/${pool.id}`}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <Card className="border-border/50 bg-card/50 backdrop-blur p-12 text-center">
                <p className="text-muted-foreground mb-4">
                  {!isConnected 
                    ? "Connect your wallet to see pools"
                    : totalPots && Number(totalPots) > 0
                    ? "Pools are being loaded..."
                    : "No pools created yet. Be the first to create one!"}
                </p>
                {isConnected && (!totalPots || Number(totalPots) === 0) && (
                  <Link href="/create-pool">
                    <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0">
                      Create Pool
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                )}
              </Card>
            )}
          </div>

          {/* CTA Section */}
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 backdrop-blur p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Ready to start saving together?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Create a new savings pool or join an existing one to start your journey towards financial goals with
                your community.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/create-pool">
                  <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0">
                    Create Pool
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link href="/pools">
                  <Button
                    variant="outline"
                    className="border-border/50 hover:border-primary/50 hover:bg-primary/10 bg-transparent"
                  >
                    Browse Pools
                  </Button>
                </Link>
              </div>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}