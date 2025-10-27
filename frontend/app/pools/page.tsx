"use client"

import { useState, useMemo, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Background3D } from "@/components/3d-background"
import { PoolCard } from "@/components/pool-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ArrowRight } from "lucide-react"
import { useTotalPots } from "@/hooks/useSavingsContract"
import { useAccount, useReadContract } from "wagmi"
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
  category: "savings" | "investment" | "emergency" | "goal"
  createdAt: string
  contributionAmount: number
  totalCycles: number
  currentCycle: number
}

export default function PoolsPage() {
  const router = useRouter()
  const { address } = useAccount()
  const { data: totalPots, isLoading: isLoadingTotal } = useTotalPots()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [poolData, setPoolData] = useState<Pool[]>([])
  const [isLoadingPools, setIsLoadingPools] = useState(false)

  const filteredPools = useMemo(() => {
    return poolData.filter((pool) => {
      console.log("this is pool ", pool)
      const matchesSearch =
        pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = !selectedCategory || pool.category === selectedCategory

      const matchesStatus = selectedStatus === "all" || pool.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchQuery, selectedCategory, selectedStatus, poolData])

  // Fetch all pools from blockchain with automatic refresh
  useEffect(() => {
    const fetchBlockchainPools = async () => {
      if (!totalPots || Number(totalPots) === 0) {
        setPoolData([])
        setIsLoadingPools(false)
        return
      }

      setIsLoadingPools(true)
      try {
        const potCount = Number(totalPots)
        const pools: Pool[] = []
        
        // Fetch all pools
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
              
              // The decoded result is a struct/tuple, access it properly
              // It could be decoded[0] being the entire struct or decoded itself
              const pot = Array.isArray(decoded) && decoded.length === 1 ? decoded[0] : decoded
              
              console.log(`Pot ${i} structure:`, pot)
              
              // Extract fields - adjust indices based on actual structure
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
              
              // Safe conversion with fallback
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
              
              // Determine status
              let status: "active" | "completed" | "upcoming" = "upcoming"
              if (isCompleted) {
                status = "completed"
              } else if (isActive && memberCount > 0) {
                status = "active"
              }
              
              pools.push({
                id: potId.toString(),
                name: name,
                description: description,
                members: memberCount,
                maxMembers: totalCycles || 10,
                totalAmount: totalAmount,
                targetAmount: targetAmount,
                duration: `${totalCycles} cycles`,
                status: status,
                category: "savings",
                createdAt: new Date(createdAt * 1000).toISOString(),
                contributionAmount: contributionAmountEth,
                totalCycles: totalCycles,
                currentCycle: currentCycle,
              })
            }
          } catch (err) {
            console.error(`Error fetching pot ${i}:`, err)
          }
        }
        
        // Sort pools by creation date (newest first)
        pools.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        
        setPoolData(pools)
        setIsLoadingPools(false)
      } catch (err) {
        console.error("Error fetching blockchain pools:", err)
        setPoolData([])
        setIsLoadingPools(false)
      }
    }
    
    if (totalPots !== undefined) {
      fetchBlockchainPools()
      
      // Refresh every 30 seconds
      const interval = setInterval(() => {
        fetchBlockchainPools()
      }, 30000)
      
      return () => clearInterval(interval)
    }
  }, [totalPots])

  const handleJoinPool = (poolId: string) => {
    router.push(`/pools/${poolId}`)
  }

  const categories = [
    { id: "savings", label: "Savings" },
    { id: "investment", label: "Investment" },
    { id: "emergency", label: "Emergency" },
    { id: "goal", label: "Goal" },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Background3D />
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-12 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">
              Explore Savings Pools
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl">
              Discover and join savings pools that match your financial goals. Connect with others and save together.
            </p>
          </div>

          {/* Search and Filters */}
          <Card className="mb-8 border-border/50 bg-card/50 backdrop-blur p-6 animate-slide-up">
            <div className="space-y-6">
              {/* Search Bar */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  placeholder="Search pools by name or description..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-input border-border/50 text-foreground placeholder:text-muted-foreground h-11"
                />
              </div>

              {/* Category and Status Filters */}
              <div className="space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-3">
                    <Filter className="w-4 h-4 text-muted-foreground" />
                    <span className="text-sm font-semibold text-foreground">Categories</span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <Badge
                      variant={selectedCategory === null ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => setSelectedCategory(null)}
                    >
                      All Categories
                    </Badge>
                    {categories.map((cat) => (
                      <Badge
                        key={cat.id}
                        variant={selectedCategory === cat.id ? "default" : "outline"}
                        className="cursor-pointer"
                        onClick={() => setSelectedCategory(cat.id)}
                      >
                        {cat.label}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Status Filter */}
                <div>
                  <span className="text-sm font-semibold text-foreground block mb-3">Status</span>
                  <Tabs value={selectedStatus} onValueChange={setSelectedStatus}>
                    <TabsList className="bg-muted/50 border-border/50">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="active">Active</TabsTrigger>
                      <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
                      <TabsTrigger value="completed">Completed</TabsTrigger>
                    </TabsList>
                  </Tabs>
                </div>
              </div>
            </div>
          </Card>

          {/* Results Info */}
          <div className="mb-6 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{filteredPools.length}</span> of{" "}
              <span className="font-semibold text-foreground">{poolData.length}</span> pools
              {totalPots && Number(totalPots) > 0 && (
                <span className="text-xs text-primary ml-2">({Number(totalPots)} on-chain)</span>
              )}
            </p>
            {isLoadingPools && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                Syncing with blockchain...
              </Badge>
            )}
          </div>

          {/* Pools Grid */}
          {isLoadingTotal || isLoadingPools ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-muted-foreground">Loading pools from blockchain...</p>
            </div>
          ) : filteredPools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredPools.map((pool, index) => (
                <div key={pool.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <PoolCard
                    {...pool}
                    onView={() => router.push(`/pools/${pool.id}`)}
                    onJoin={() => handleJoinPool(pool.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur p-12 text-center mb-12">
              <p className="text-muted-foreground mb-4">
                {poolData.length === 0 
                  ? "No pools created yet. Be the first to create one!"
                  : "No pools found matching your criteria."}
              </p>
              {poolData.length === 0 ? (
                <Link href="/create-pool">
                  <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0">
                    Create First Pool
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <Button
                  variant="outline"
                  className="border-border/50 hover:border-primary/50 hover:bg-primary/10 bg-transparent"
                  onClick={() => {
                    setSearchQuery("")
                    setSelectedCategory(null)
                    setSelectedStatus("all")
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </Card>
          )}

          {/* CTA Section */}
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 backdrop-blur p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">
                Can't find what you're looking for?
              </h3>
              <p className="text-muted-foreground mb-6 max-w-2xl">
                Create your own savings pool and invite friends to join your financial journey.
              </p>
              <Link href="/create-pool">
                <Button className="gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0">
                  Create New Pool
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}