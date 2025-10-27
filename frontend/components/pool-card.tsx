"use client"

import { Users, TrendingUp, Lock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"

interface PoolCardProps {
  id: string
  name: string
  description: string
  members: number
  maxMembers: number
  totalAmount: number
  targetAmount: number
  duration: string
  status: "active" | "completed" | "upcoming"
  onJoin?: () => void
  onView?: () => void
}

export function PoolCard({
  id,
  name,
  description,
  members,
  maxMembers,
  totalAmount,
  targetAmount,
  duration,
  status,
  onJoin,
  onView,
}: PoolCardProps) {
  const progress = (totalAmount / targetAmount) * 100
  const isFull = members >= maxMembers

  return (
    <Card className="group relative overflow-hidden border-border/50 bg-card/50 backdrop-blur hover:bg-card/80 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/20">
      {/* Animated background glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-bold text-foreground mb-1">{name}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
          <div
            className={`px-3 py-1 rounded-full text-xs font-semibold ${
              status === "active"
                ? "bg-primary/20 text-primary"
                : status === "completed"
                  ? "bg-green-500/20 text-green-400"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-semibold text-primary">{Math.round(progress)}%</span>
          </div>
          <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mb-4 pb-4 border-b border-border/30">
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Users className="w-4 h-4 text-primary" />
              <span className="text-xs text-muted-foreground">Members</span>
            </div>
            <p className="text-sm font-bold text-foreground">
              {members}/{maxMembers}
            </p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <TrendingUp className="w-4 h-4 text-accent" />
              <span className="text-xs text-muted-foreground">Total</span>
            </div>
            <p className="text-sm font-bold text-foreground">${totalAmount.toLocaleString()}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 mb-1">
              <Lock className="w-4 h-4 text-primary/60" />
              <span className="text-xs text-muted-foreground">Duration</span>
            </div>
            <p className="text-sm font-bold text-foreground">{duration}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          {onView && (
            <Button
              variant="outline"
              size="sm"
              className="flex-1 border-border/50 hover:border-primary/50 hover:bg-primary/10 bg-transparent"
              onClick={onView}
            >
              View Details
            </Button>
          )}
          {onJoin && (
            <Button
              size="sm"
              className={`flex-1 ${
                isFull
                  ? "bg-muted text-muted-foreground cursor-not-allowed"
                  : "bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground"
              }`}
              disabled={isFull}
              onClick={onJoin}
            >
              {isFull ? "Pool Full" : "Join Pool"}
            </Button>
          )}
        </div>
      </div>
    </Card>
  )
}
