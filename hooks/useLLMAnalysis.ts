"use client"

import { useState } from "react"
import type { UseFormSetValue } from "react-hook-form"

interface AnalysisResult {
  [key: string]: any
}

interface UseLLMAnalysisProps {
  setValue: UseFormSetValue<any>
  apiRoute: string
}

export const useLLMAnalysis = ({ setValue, apiRoute }: UseLLMAnalysisProps) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyzeData = async (data: any) => {
    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch(apiRoute, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to analyze input")
      }

      const analysisResult: AnalysisResult = await response.json()

      // Update form with analyzed data
      Object.entries(analysisResult).forEach(([key, value]) => {
        setValue(key, value)
      })

      return analysisResult
    } catch (error) {
      setError(error instanceof Error ? error.message : "An error occurred during analysis")
      throw error
    } finally {
      setIsAnalyzing(false)
    }
  }

  return { analyzeData, isAnalyzing, error }
}

