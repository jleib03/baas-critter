"use client"

import { useState, useEffect } from "react"
import { useForm, FormProvider } from "react-hook-form"
import { Checkbox } from "./ui/checkbox"
import { Label } from "./ui/label"
import { Button } from "./ui/button"
import AIAssistant from "./AIAssistant"
import { Loader2 } from "lucide-react"
import { LLMErrorAlert } from "./LLMErrorAlert"
import { saveToLocalStorage, getFromLocalStorage } from "@/utils/localStorage"

const services = [
  { id: "walking", name: "Dog Walking" },
  { id: "sitting", name: "Pet Sitting" },
  { id: "overnight", name: "Overnight Care" },
  { id: "homeBoarding", name: "Home Boarding" },
]

interface ServiceOfferingsFormProps {
  onSubmit: (data: any) => void
}

export default function ServiceOfferingsForm({ onSubmit }: ServiceOfferingsFormProps) {
  const methods = useForm()
  const { register, handleSubmit, watch, getValues, setValue } = methods
  const [aiResponses, setAIResponses] = useState({
    durationsAndCosts: "",
    petTypes: "",
    logistics: "",
  })
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [localError, setLocalError] = useState<string | null>(null)

  const watchedServices = watch("services")

  useEffect(() => {
    // Load saved services
    const savedServices = getFromLocalStorage("serviceOfferings_services")
    if (savedServices) {
      const parsedServices = JSON.parse(savedServices)
      Object.entries(parsedServices).forEach(([key, value]) => {
        setValue(`services.${key}`, value)
      })
    }

    // Load saved AI responses
    const savedResponses = getFromLocalStorage("serviceOfferings_aiResponses")
    if (savedResponses) {
      setAIResponses(JSON.parse(savedResponses))
    }
  }, [setValue])

  useEffect(() => {
    // Save services whenever they change
    const services = getValues("services")
    saveToLocalStorage("serviceOfferings_services", JSON.stringify(services))
  }, [getValues]) // Removed unnecessary dependency: watchedServices

  const typeMapping = {
    service_durations_costs: "durationsAndCosts",
    pet_types: "petTypes",
    logistics_additional_information: "logistics",
  }

  const handleAnalyzeAvailability = async () => {
    setIsAnalyzing(true)
    setLocalError(null)

    try {
      const formData = getValues()

      // Validate inputs
      const requiredFields = ["service_durations_costs", "pet_types", "logistics_additional_information"]
      const missingFields = requiredFields.filter((field) => !formData[field]?.trim())

      if (missingFields.length > 0) {
        throw new Error(`Please fill in all required fields: ${missingFields.join(", ")}`)
      }

      const results = await Promise.all(
        Object.entries({
          service_durations_costs: formData.service_durations_costs,
          pet_types: formData.pet_types,
          logistics_additional_information: formData.logistics_additional_information,
        }).map(async ([key, value]) => {
          if (!value) return [key, null]

          const type = typeMapping[key]

          const response = await fetch("/api/analyze-services", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: value,
              type,
            }),
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || `Failed to analyze ${key}`)
          }

          const data = await response.json()
          const responseKey =
            key === "service_durations_costs" ? "durationsAndCosts" : key === "pet_types" ? "petTypes" : "logistics"
          return [responseKey, data.analysis]
        }),
      )

      const analyzedData = Object.fromEntries(results.filter(([_, value]) => value !== null))

      // Save AI responses
      saveToLocalStorage("serviceOfferings_aiResponses", JSON.stringify(analyzedData))

      // Convert 'on' values to boolean true
      const services = Object.entries(formData.services || {}).reduce(
        (acc, [key, value]) => {
          acc[key] = value === "on"
          return acc
        },
        {} as Record<string, boolean>,
      )

      // Structure the data for the review page
      const completeFormData = {
        services,
        durationsAndCosts: analyzedData.durationsAndCosts || "",
        petTypes: analyzedData.petTypes || "",
        logistics: analyzedData.logistics || "",
      }

      // Submit the structured data
      onSubmit(completeFormData)

      console.log("Analysis complete. Updated responses:", completeFormData)
    } catch (error) {
      console.error("Error analyzing service offerings:", error)
      setLocalError(error instanceof Error ? error.message : "An error occurred while analyzing the input.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <FormProvider {...methods}>
      <form className="space-y-6">
        <div>
          <h3 className="text-lg font-medium">Select Your Services</h3>
          <div className="mt-2 space-y-2">
            {services.map((service) => (
              <div key={service.id} className="flex items-center">
                <Checkbox id={service.id} {...register(`services.${service.id}`)} />
                <Label htmlFor={service.id} className="ml-2">
                  {service.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <AIAssistant
          header="Service Durations & Costs"
          description="For each service you selected above, please describe the durations offered and associated costs."
          prompt="Please describe the duration options and pricing for each service you offer. Be specific about different duration options and their costs."
          exampleText="Example: For dog walking, I charge $30 for 30 minutes and $45 for an hour. For pet sitting visits, I charge $25 for a 30-minute visit. Overnight stays are $80 per night."
          fieldName="service_durations_costs"
        />

        <AIAssistant
          header="Pet Types"
          description="For each service you offer, specify which types of pets you can accommodate."
          prompt="What types of pets do you provide care for with each service? Include any size restrictions or special considerations."
          exampleText="Example: I walk dogs up to 60 pounds and can handle up to 2 dogs per walk. For pet sitting, I care for cats, small dogs, and caged pets like birds and hamsters."
          fieldName="pet_types"
        />

        <AIAssistant
          header="Logistics & Additional Information"
          description="Tell us about your service area and any important logistics details."
          prompt="Please provide details about your service area, travel restrictions, additional fees, and any other important information."
          exampleText="Example: I serve zip codes 12345 and 12346. I charge a $5 travel fee for locations more than 5 miles from my home. I require 24-hour notice for cancellations."
          fieldName="logistics_additional_information"
        />

        <LLMErrorAlert error={localError} />

        <div className="flex justify-between">
          <Button variant="outline" type="button" onClick={() => (window.location.href = "/onboarding/landing")}>
            Back to Onboarding Home
          </Button>
          <Button
            type="button"
            onClick={handleAnalyzeAvailability}
            disabled={isAnalyzing}
            className="bg-primary hover:bg-primary/90"
          >
            {isAnalyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              "Analyze Information"
            )}
          </Button>
        </div>
      </form>
    </FormProvider>
  )
}

