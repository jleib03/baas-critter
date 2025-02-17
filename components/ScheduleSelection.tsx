"use client"

import { useState, useEffect, useCallback } from "react"
import { useFormContext } from "react-hook-form"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import type { FormData } from "./AvailabilityForm"

const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
]

export default function ScheduleSelection() {
  console.log("ScheduleSelection: Component function called")
  const { register, watch, setValue } = useFormContext<FormData>()
  const [selectedDays, setSelectedDays] = useState<{ [key: string]: boolean }>({})
  const [selectedMonths, setSelectedMonths] = useState<string[]>([])

  const watchedSchedule = watch("schedule")
  const watchedMonths = watch("months")

  useEffect(() => {
    console.log("ScheduleSelection: Component mounted")
    return () => console.log("ScheduleSelection: Component unmounted")
  }, [])

  useEffect(() => {
    console.log("ScheduleSelection: watchedSchedule changed:", watchedSchedule)
    if (watchedSchedule) {
      const initialSelectedDays = Object.keys(watchedSchedule).reduce(
        (acc, day) => {
          acc[day] = watchedSchedule[day]?.selected || false
          return acc
        },
        {} as { [key: string]: boolean },
      )
      console.log("ScheduleSelection: Setting selectedDays:", initialSelectedDays)
      setSelectedDays(initialSelectedDays)
    }
  }, [watchedSchedule])

  useEffect(() => {
    console.log("ScheduleSelection: watchedMonths changed:", watchedMonths)
    console.log("ScheduleSelection: Current selectedMonths:", selectedMonths)
    if (Array.isArray(watchedMonths) && JSON.stringify(watchedMonths) !== JSON.stringify(selectedMonths)) {
      console.log("ScheduleSelection: Updating selectedMonths to:", watchedMonths)
      setSelectedMonths(watchedMonths)
    }
  }, [watchedMonths, selectedMonths])

  const handleDayChange = useCallback(
    (day: string) => {
      console.log("ScheduleSelection: handleDayChange called for:", day)
      setSelectedDays((prev) => {
        const updated = { ...prev, [day]: !prev[day] }
        console.log("ScheduleSelection: Updating selectedDays:", updated)
        setValue(`schedule.${day}.selected`, updated[day], { shouldValidate: true })
        return updated
      })
    },
    [setValue],
  )

  const handleMonthChange = useCallback(
    (month: string) => {
      console.log("ScheduleSelection: handleMonthChange called for:", month)
      setSelectedMonths((prev) => {
        const updated = prev.includes(month) ? prev.filter((m) => m !== month) : [...prev, month]
        console.log("ScheduleSelection: Updating selectedMonths to:", updated)
        setValue("months", updated, { shouldValidate: true })
        return updated
      })
    },
    [setValue],
  )

  console.log("ScheduleSelection: Rendering. selectedMonths:", selectedMonths)

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-primary">Set Your Schedule</h2>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Select Months for Calendar View</h3>
        <div className="grid grid-cols-3 gap-2">
          {months.map((month) => (
            <div key={month} className="flex items-center space-x-2">
              <Checkbox
                id={`month-${month}`}
                checked={selectedMonths.includes(month)}
                onCheckedChange={() => handleMonthChange(month)}
              />
              <Label htmlFor={`month-${month}`}>{month}</Label>
            </div>
          ))}
        </div>
        <p className="text-sm text-muted-foreground">
          These months will be used to generate calendar views in the next steps. Your schedule will apply to all
          selected months.
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-primary">Weekly Schedule</h3>
        {daysOfWeek.map((day) => (
          <div key={day} className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox id={day} checked={selectedDays[day] || false} onCheckedChange={() => handleDayChange(day)} />
              <Label htmlFor={day} className="text-gray-900">
                {day}
              </Label>
            </div>
            {selectedDays[day] && (
              <div className="ml-6 space-y-2">
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`${day}-start`} className="text-gray-900">
                    Start Time
                  </Label>
                  <Input
                    id={`${day}-start`}
                    type="time"
                    defaultValue="09:00"
                    {...register(`schedule.${day}.startTime`)}
                    className="border-primary"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Label htmlFor={`${day}-end`} className="text-gray-900">
                    End Time
                  </Label>
                  <Input
                    id={`${day}-end`}
                    type="time"
                    defaultValue="17:00"
                    {...register(`schedule.${day}.endTime`)}
                    className="border-primary"
                  />
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

