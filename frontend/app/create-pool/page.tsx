"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Background3D } from "@/components/3d-background"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Checkbox } from "@/components/ui/checkbox"
import { ArrowLeft, ArrowRight, CheckCircle } from "lucide-react"

interface FormData {
  poolName: string
  description: string
  category: string
  targetAmount: string
  duration: string
  maxMembers: string
  monthlyContribution: string
  poolType: "open" | "invite"
  rules: string
  agreeToTerms: boolean
}

export default function CreatePoolPage() {
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState<FormData>({
    poolName: "",
    description: "",
    category: "",
    targetAmount: "",
    duration: "",
    maxMembers: "",
    monthlyContribution: "",
    poolType: "open",
    rules: "",
    agreeToTerms: false,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const categories = [
    { id: "savings", label: "General Savings" },
    { id: "emergency", label: "Emergency Fund" },
    { id: "goal", label: "Goal-Based" },
    { id: "investment", label: "Investment" },
  ]

  const durations = [
    { id: "3", label: "3 months" },
    { id: "6", label: "6 months" },
    { id: "12", label: "12 months" },
    { id: "24", label: "24 months" },
  ]

  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {}

    if (currentStep === 1) {
      if (!formData.poolName.trim()) newErrors.poolName = "Pool name is required"
      if (!formData.description.trim()) newErrors.description = "Description is required"
      if (!formData.category) newErrors.category = "Category is required"
    } else if (currentStep === 2) {
      if (!formData.targetAmount) newErrors.targetAmount = "Target amount is required"
      if (!formData.duration) newErrors.duration = "Duration is required"
      if (!formData.maxMembers) newErrors.maxMembers = "Max members is required"
      if (!formData.monthlyContribution) newErrors.monthlyContribution = "Monthly contribution is required"
    } else if (currentStep === 3) {
      if (!formData.agreeToTerms) newErrors.agreeToTerms = "You must agree to the terms"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1)
    }
  }

  const handlePrevious = () => {
    setStep(step - 1)
  }

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: "",
      }))
    }
  }

  const handleSubmit = () => {
    if (validateStep(3)) {
      console.log("Pool created:", formData)
      router.push("/pools")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Background3D />
      <Navbar />

      <main className="pt-20 pb-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back Button */}
          <Link
            href="/pools"
            className="inline-flex items-center gap-2 text-primary hover:text-primary/80 mb-6 animate-slide-up"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Pools</span>
          </Link>

          {/* Header */}
          <div className="mb-8 animate-slide-up">
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 text-balance">Create Your Pool</h1>
            <p className="text-lg text-muted-foreground">
              Start a new savings pool and invite others to join your financial journey.
            </p>
          </div>

          {/* Progress Indicator */}
          <div className="mb-8 animate-slide-up">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3].map((s) => (
                <div key={s} className="flex items-center flex-1">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      s < step
                        ? "bg-primary text-primary-foreground"
                        : s === step
                          ? "bg-accent text-accent-foreground"
                          : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {s < step ? <CheckCircle className="w-5 h-5" /> : s}
                  </div>
                  {s < 3 && <div className={`flex-1 h-1 mx-2 rounded-full ${s < step ? "bg-primary" : "bg-muted"}`} />}
                </div>
              ))}
            </div>
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Basic Info</span>
              <span>Pool Details</span>
              <span>Review</span>
            </div>
          </div>

          {/* Form Card */}
          <Card className="border-border/50 bg-card/50 backdrop-blur p-8 animate-slide-up">
            {/* Step 1: Basic Information */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Basic Information</h2>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Pool Name</Label>
                  <Input
                    placeholder="e.g., Summer Vacation Fund"
                    value={formData.poolName}
                    onChange={(e:any) => handleInputChange("poolName", e.target.value)}
                    className={`bg-input border-border/50 text-foreground placeholder:text-muted-foreground ${
                      errors.poolName ? "border-destructive" : ""
                    }`}
                  />
                  {errors.poolName && <p className="text-xs text-destructive mt-1">{errors.poolName}</p>}
                </div>

                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Description</Label>
                  <Textarea
                    placeholder="Describe the purpose and goals of your pool..."
                    value={formData.description}
                    onChange={(e:any) => handleInputChange("description", e.target.value)}
                    className={`bg-input border-border/50 text-foreground placeholder:text-muted-foreground ${
                      errors.description ? "border-destructive" : ""
                    }`}
                    rows={4}
                  />
                  {errors.description && <p className="text-xs text-destructive mt-1">{errors.description}</p>}
                </div>

                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Category</Label>
                  <Select value={formData.category} onValueChange={(value:any) => handleInputChange("category", value)}>
                    <SelectTrigger className="bg-input border-border/50 text-foreground">
                      <SelectValue placeholder="Select a category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border/50">
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id} className="text-foreground">
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-destructive mt-1">{errors.category}</p>}
                </div>

                <div>
                  <Label className="text-sm font-semibold text-foreground mb-3 block">Pool Type</Label>
                  <RadioGroup
                    value={formData.poolType}
                    onValueChange={(value:any) => handleInputChange("poolType", value as "open" | "invite")}
                  >
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/30 hover:border-primary/50 cursor-pointer">
                      <RadioGroupItem value="open" id="open" />
                      <Label htmlFor="open" className="flex-1 cursor-pointer">
                        <p className="font-semibold text-foreground">Open Pool</p>
                        <p className="text-xs text-muted-foreground">Anyone can join</p>
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 p-3 rounded-lg border border-border/30 hover:border-primary/50 cursor-pointer">
                      <RadioGroupItem value="invite" id="invite" />
                      <Label htmlFor="invite" className="flex-1 cursor-pointer">
                        <p className="font-semibold text-foreground">Invite Only</p>
                        <p className="text-xs text-muted-foreground">Only invited members can join</p>
                      </Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}

            {/* Step 2: Pool Details */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Pool Details</h2>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Target Amount ($)</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={formData.targetAmount}
                      onChange={(e:any) => handleInputChange("targetAmount", e.target.value)}
                      className={`bg-input border-border/50 text-foreground placeholder:text-muted-foreground ${
                        errors.targetAmount ? "border-destructive" : ""
                      }`}
                    />
                    {errors.targetAmount && <p className="text-xs text-destructive mt-1">{errors.targetAmount}</p>}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Duration</Label>
                    <Select value={formData.duration} onValueChange={(value:any) => handleInputChange("duration", value)}>
                      <SelectTrigger className="bg-input border-border/50 text-foreground">
                        <SelectValue placeholder="Select duration" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border/50">
                        {durations.map((dur) => (
                          <SelectItem key={dur.id} value={dur.id} className="text-foreground">
                            {dur.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {errors.duration && <p className="text-xs text-destructive mt-1">{errors.duration}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Max Members</Label>
                    <Input
                      type="number"
                      placeholder="10"
                      value={formData.maxMembers}
                      onChange={(e:any) => handleInputChange("maxMembers", e.target.value)}
                      className={`bg-input border-border/50 text-foreground placeholder:text-muted-foreground ${
                        errors.maxMembers ? "border-destructive" : ""
                      }`}
                    />
                    {errors.maxMembers && <p className="text-xs text-destructive mt-1">{errors.maxMembers}</p>}
                  </div>

                  <div>
                    <Label className="text-sm font-semibold text-foreground mb-2 block">Monthly Contribution ($)</Label>
                    <Input
                      type="number"
                      placeholder="500"
                      value={formData.monthlyContribution}
                      onChange={(e:any) => handleInputChange("monthlyContribution", e.target.value)}
                      className={`bg-input border-border/50 text-foreground placeholder:text-muted-foreground ${
                        errors.monthlyContribution ? "border-destructive" : ""
                      }`}
                    />
                    {errors.monthlyContribution && (
                      <p className="text-xs text-destructive mt-1">{errors.monthlyContribution}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-foreground mb-2 block">Pool Rules (Optional)</Label>
                  <Textarea
                    placeholder="Add any specific rules or guidelines for your pool..."
                    value={formData.rules}
                    onChange={(e:any) => handleInputChange("rules", e.target.value)}
                    className="bg-input border-border/50 text-foreground placeholder:text-muted-foreground"
                    rows={4}
                  />
                </div>
              </div>
            )}

            {/* Step 3: Review */}
            {step === 3 && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground mb-6">Review Your Pool</h2>
                </div>

                <div className="space-y-4 p-4 bg-muted/30 rounded-lg border border-border/30">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Pool Name</p>
                    <p className="font-semibold text-foreground">{formData.poolName}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Description</p>
                    <p className="text-sm text-foreground">{formData.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Category</p>
                      <p className="font-semibold text-foreground">
                        {categories.find((c) => c.id === formData.category)?.label}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Pool Type</p>
                      <p className="font-semibold text-foreground capitalize">{formData.poolType}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Target Amount</p>
                      <p className="font-semibold text-foreground">${formData.targetAmount}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Duration</p>
                      <p className="font-semibold text-foreground">
                        {durations.find((d) => d.id === formData.duration)?.label}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Max Members</p>
                      <p className="font-semibold text-foreground">{formData.maxMembers}</p>
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">Monthly Contribution</p>
                      <p className="font-semibold text-foreground">${formData.monthlyContribution}</p>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-primary/10 rounded-lg border border-primary/30">
                  <Checkbox
                    id="terms"
                    checked={formData.agreeToTerms}
                    onCheckedChange={(checked:any) => handleInputChange("agreeToTerms", checked as boolean)}
                    className="mt-1"
                  />
                  <Label htmlFor="terms" className="text-sm text-foreground cursor-pointer">
                    I agree to the pool terms and conditions. I understand that all members must contribute equally and
                    decisions are made by majority vote.
                  </Label>
                </div>
                {errors.agreeToTerms && <p className="text-xs text-destructive">{errors.agreeToTerms}</p>}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-4 mt-8 pt-6 border-t border-border/30">
              {step > 1 && (
                <Button
                  variant="outline"
                  onClick={handlePrevious}
                  className="flex-1 border-border/50 hover:border-primary/50 hover:bg-primary/10 bg-transparent"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous
                </Button>
              )}
              {step < 3 ? (
                <Button
                  onClick={handleNext}
                  className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0"
                >
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={handleSubmit}
                  className="flex-1 gap-2 bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-primary-foreground border-0"
                >
                  <CheckCircle className="w-4 h-4" />
                  Create Pool
                </Button>
              )}
            </div>
          </Card>
        </div>
      </main>
    </div>
  )
}
