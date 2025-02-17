"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Textarea } from "./ui/textarea"
import { useFormContext } from "react-hook-form"
import Image from "next/image"
import { Sparkles } from "lucide-react"
import { saveToLocalStorage, getFromLocalStorage } from "@/utils/localStorage"

interface AIAssistantProps {
  header: string
  prompt: string
  description?: string
  exampleText?: string
  fieldName?: string
}

export default function AIAssistant({
  header,
  prompt,
  description = "Describe your services and I'll help organize the information.",
  exampleText = "Example: I offer dog walking services for small and medium dogs, charging $30 for 30-minute walks and $45 for hour-long walks.",
  fieldName,
}: AIAssistantProps) {
  const [input, setInput] = useState("")
  const formContext = useFormContext()
  const { setValue, getValues } = formContext || {}

  useEffect(() => {
    if (fieldName) {
      const savedValue = getFromLocalStorage(fieldName)
      if (savedValue) {
        setInput(savedValue)
        if (setValue) {
          setValue(fieldName, savedValue)
        }
      } else if (getValues) {
        const currentValue = getValues(fieldName)
        if (currentValue) {
          setInput(currentValue)
        }
      }
    }
  }, [fieldName, setValue, getValues])

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setInput(value)
    if (setValue && fieldName) {
      setValue(fieldName, value)
      saveToLocalStorage(fieldName, value)
    }
    console.log(`Updated ${fieldName} with value:`, value)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
            {header}
            <Sparkles className="h-6 w-6 text-primary" />
          </h2>
          <p className="text-gray-600">{description}</p>
        </div>
        <Image
          src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yXrSzR4fIAO7wXse1UZ8A6CNohgWcg.png"
          alt="Critter Dog Illustration"
          width={48}
          height={48}
          className="opacity-10"
        />
      </div>

      <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
        <p className="text-sm text-gray-600">{exampleText}</p>
      </div>

      <Textarea
        placeholder={prompt}
        value={input}
        onChange={handleInputChange}
        rows={6}
        className="resize-none border-gray-200 focus:border-primary focus:ring-primary"
      />
    </div>
  )
}

