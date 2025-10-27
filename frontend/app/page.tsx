"use client"

import { useState } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Background3D } from "@/components/3d-background"
import { PoolCard } from "@/components/pool-card"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { TrendingUp, Users, Zap, ArrowRight } from "lucide-react"

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState<"overview" | "active" | "history">("overview")

  const stats = [
    {
      label: "Total Pools",
      value: "12",
      change: "+2 this month",
      icon: Users,
      color: "from-primary to-accent",
    },
    {
      label: "Active Savings",
      value: "$24,500",
      change: "+$3,200 this week",
      icon: TrendingUp,
      color: "from-accent to-primary",
    },
    {
      label: "Earnings",
      value: "$1,240",
      change: "+12% vs last month",
      icon: Zap,
      color: "from-primary/80 to-accent/80",
    },
  ]

  const activePools = [
    {
      id: "1",
      name: "Summer Vacation Fund",
      description: "Group savings for summer trip",
      members: 8,
      maxMembers: 10,
      totalAmount: 8500,
      targetAmount: 10000,
      duration: "6 months",
      status: "active" as const,
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
      status: "active" as const,
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
      status: "active" as const,
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

          {/* Active Pools Section */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-foreground">Your Active Pools</h2>
              <Link href="/pools">
                <Button
                  variant="outline"
                  className="border-border/50 hover:border-primary/50 hover:bg-primary/10 bg-transparent"
                >
                  View All Pools
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activePools.map((pool, index) => (
                <div key={pool.id} className="animate-slide-up" style={{ animationDelay: `${index * 100}ms` }}>
                  <PoolCard
                    {...pool}
                    onView={() => console.log("View pool:", pool.id)}
                    onJoin={() => console.log("Join pool:", pool.id)}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <Card className="relative overflow-hidden border-border/50 bg-gradient-to-r from-primary/20 via-accent/10 to-primary/20 backdrop-blur p-8 md:p-12">
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
            <div className="relative">
              <h3 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Ready to start saving together?</h3>
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
