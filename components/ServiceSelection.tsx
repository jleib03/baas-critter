"use client"

import { useState, useEffect } from "react"
import { useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import type { FormData } from "./AvailabilityForm"

const services = [
  { id: "walking", name: "Walking", hasDuration: true },
  { id: "sitting", name: "Sitting", hasDuration: true },
  { id: "overnights", name: "Overnights", hasDuration: false },
  { id: "homeBoarding", name: "Home Boarding", hasDuration: false },
]

export default function ServiceSelection() {
  const { register, watch, setValue } = useFormContext<FormData>()
  const [selectedServices, setSelectedServices] = useState<{ [key: string]: boolean }>({})

  const watchedServices = watch("services") || {}

  useEffect(() => {
    const initialSelectedServices = Object.keys(watchedServices).reduce(
      (acc, service) => {
        acc[service] = watchedServices[service]?.selected || false
        return acc
      },
      {} as { [key: string]: boolean },
    )
    setSelectedServices(initialSelectedServices)
  }, [watchedServices])

  const handleServiceChange = (service: string) => {
    setSelectedServices((prev) => ({
      ...prev,
      [service]: !prev[service],
    }))
    setValue(`services.${service}.selected`, !selectedServices[service])
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-gray-900">Select Your Services</h2>
      {services.map((service) => (
        <div key={service.id} className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox
              id={service.id}
              checked={selectedServices[service.id] || false}
              onCheckedChange={() => handleServiceChange(service.id)}
              {...register(`services.${service.id}.selected`)}
            />
            <Label htmlFor={service.id}>{service.name}</Label>
          </div>
          {selectedServices[service.id] && (
            <div className="ml-6 space-y-2">
              <div>
                <Label htmlFor={`${service.id}-cost`}>Cost per service ($)</Label>
                <Input
                  id={`${service.id}-cost`}
                  type="number"
                  defaultValue={watchedServices[service.id]?.cost || 0}
                  {...register(`services.${service.id}.cost`, { valueAsNumber: true })}
                />
              </div>
              {service.hasDuration && (
                <div>
                  <Label htmlFor={`${service.id}-duration`}>Duration (minutes)</Label>
                  <Input
                    id={`${service.id}-duration`}
                    type="number"
                    defaultValue={watchedServices[service.id]?.duration || 0}
                    {...register(`services.${service.id}.duration`, { valueAsNumber: true })}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

