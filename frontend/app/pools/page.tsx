"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Background3D } from "@/components/3d-background"
import { PoolCard } from "@/components/pool-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Search, Filter, ArrowRight } from "lucide-react"

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
}

const allPools: Pool[] = [
  {
    id: "1",
    name: "Summer Vacation Fund",
    description: "Group savings for summer trip",
    members: 8,
    maxMembers: 10,
    totalAmount: 8500,
    targetAmount: 10000,
    duration: "6 months",
    status: "active",
    category: "goal",
    createdAt: "2024-01-15",
  },
  {
    id: "2",
    name: "Emergency Fund Circle",
    description: "Collective emergency savings",
    members: 12,
    maxMembers: 12,
    totalAmount: 15200,
    targetAmount: 15000,
    duration: "12 months",
    status: "active",
    category: "emergency",
    createdAt: "2024-01-10",
  },
  {
    id: "3",
    name: "Tech Gadgets Pool",
    description: "Save for latest tech together",
    members: 5,
    maxMembers: 8,
    totalAmount: 3200,
    targetAmount: 5000,
    duration: "3 months",
    status: "active",
    category: "goal",
    createdAt: "2024-02-01",
  },
  {
    id: "4",
    name: "Home Renovation Fund",
    description: "Collective home improvement savings",
    members: 6,
    maxMembers: 10,
    totalAmount: 12500,
    targetAmount: 20000,
    duration: "12 months",
    status: "active",
    category: "savings",
    createdAt: "2024-01-20",
  },
  {
    id: "5",
    name: "Education Investment Pool",
    description: "Save for education and courses",
    members: 4,
    maxMembers: 8,
    totalAmount: 5600,
    targetAmount: 10000,
    duration: "9 months",
    status: "active",
    category: "investment",
    createdAt: "2024-02-05",
  },
  {
    id: "6",
    name: "Wedding Fund Circle",
    description: "Group savings for wedding expenses",
    members: 7,
    maxMembers: 10,
    totalAmount: 9800,
    targetAmount: 15000,
    duration: "8 months",
    status: "active",
    category: "goal",
    createdAt: "2024-01-25",
  },
  {
    id: "7",
    name: "Car Purchase Pool",
    description: "Save together for a new vehicle",
    members: 3,
    maxMembers: 6,
    totalAmount: 4200,
    targetAmount: 8000,
    duration: "6 months",
    status: "upcoming",
    category: "savings",
    createdAt: "2024-02-10",
  },
  {
    id: "8",
    name: "Vacation Collective 2024",
    description: "International trip savings group",
    members: 9,
    maxMembers: 10,
    totalAmount: 11200,
    targetAmount: 12000,
    duration: "4 months",
    status: "active",
    category: "goal",
    createdAt: "2024-01-30",
  },
]

export default function PoolsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [selectedStatus, setSelectedStatus] = useState<string>("all")
  const [joinedPools, setJoinedPools] = useState<Set<string>>(new Set())

  const filteredPools = useMemo(() => {
    return allPools.filter((pool) => {
      const matchesSearch =
        pool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        pool.description.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesCategory = !selectedCategory || pool.category === selectedCategory

      const matchesStatus = selectedStatus === "all" || pool.status === selectedStatus

      return matchesSearch && matchesCategory && matchesStatus
    })
  }, [searchQuery, selectedCategory, selectedStatus])

  const handleJoinPool = (poolId: string) => {
    setJoinedPools((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(poolId)) {
        newSet.delete(poolId)
      } else {
        newSet.add(poolId)
      }
      return newSet
    })
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
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Explore Savings Pools</h1>
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
              <span className="font-semibold text-foreground">{allPools.length}</span> pools
            </p>
            {joinedPools.size > 0 && (
              <Badge variant="secondary" className="bg-primary/20 text-primary border-primary/30">
                {joinedPools.size} pool{joinedPools.size !== 1 ? "s" : ""} joined
              </Badge>
            )}
          </div>

          {/* Pools Grid */}
          {filteredPools.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {filteredPools.map((pool, index) => (
                <div key={pool.id} className="animate-slide-up" style={{ animationDelay: `${index * 50}ms` }}>
                  <PoolCard
                    {...pool}
                    onView={() => console.log("View pool:", pool.id)}
                    onJoin={() => handleJoinPool(pool.id)}
                  />
                </div>
              ))}
            </div>
          ) : (
            <Card className="border-border/50 bg-card/50 backdrop-blur p-12 text-center mb-12">
              <p className="text-muted-foreground mb-4">No pools found matching your criteria.</p>
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
