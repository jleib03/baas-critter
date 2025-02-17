"use client"

import { useFormContext } from "react-hook-form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import type { FormData } from "./AvailabilityForm"

interface ExceptionsSelectionProps {
  formData: FormData | null
}

export default function ExceptionsSelection({ formData }: ExceptionsSelectionProps) {
  const { register, watch, setValue } = useFormContext<FormData>()
  const [daysOffDate, setDaysOffDate] = useState("")
  const [additionalWorkDate, setAdditionalWorkDate] = useState("")
  const daysOff = watch("daysOff") || []
  const additionalWorkDays = watch("additionalWorkDays") || []

  const addDaysOff = () => {
    if (daysOffDate) {
      setValue("daysOff", [...daysOff, { date: daysOffDate, available: false }])
      setDaysOffDate("")
    }
  }

  const removeDaysOff = (index: number) => {
    setValue(
      "daysOff",
      daysOff.filter((_: any, i: number) => i !== index),
    )
  }

  const addAdditionalWorkDay = () => {
    if (additionalWorkDate) {
      setValue("additionalWorkDays", [...additionalWorkDays, { date: additionalWorkDate, available: true }])
      setAdditionalWorkDate("")
    }
  }

  const removeAdditionalWorkDay = (index: number) => {
    setValue(
      "additionalWorkDays",
      additionalWorkDays.filter((_: any, i: number) => i !== index),
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Days-Off / Vacation</h2>
        <div className="space-y-2">
          <Label htmlFor="days-off-date">Select a date</Label>
          <div className="flex space-x-2">
            <Input
              id="days-off-date"
              type="date"
              value={daysOffDate}
              onChange={(e) => setDaysOffDate(e.target.value)}
            />
            <Button type="button" onClick={addDaysOff} className="w-full sm:w-auto">
              Add Days Off
            </Button>
          </div>
        </div>
        {daysOff.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Days-Off:</h3>
            {daysOff.map((exception: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <span>{exception.date}</span>
                <Button type="button" variant="destructive" onClick={() => removeDaysOff(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Additional Working Days</h2>
        <div className="space-y-2">
          <Label htmlFor="additional-work-date">Select a date</Label>
          <div className="flex space-x-2">
            <Input
              id="additional-work-date"
              type="date"
              value={additionalWorkDate}
              onChange={(e) => setAdditionalWorkDate(e.target.value)}
            />
            <Button type="button" onClick={addAdditionalWorkDay} className="w-full sm:w-auto">
              Add Working Day
            </Button>
          </div>
        </div>
        {additionalWorkDays.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Additional Working Days:</h3>
            {additionalWorkDays.map((exception: any, index: number) => (
              <div key={index} className="flex items-center space-x-2">
                <span>{exception.date}</span>
                <Button type="button" variant="destructive" onClick={() => removeAdditionalWorkDay(index)}>
                  Remove
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

