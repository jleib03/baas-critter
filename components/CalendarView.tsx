"use client"

import { useState, useEffect } from "react"
import type { FormData } from "./AvailabilityForm"
import { Clock } from "lucide-react"

interface CalendarViewProps {
  formData: FormData
  month: string
}

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
const MONTHS = [
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

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(":")
  const hour = Number.parseInt(hours)
  const ampm = hour >= 12 ? "PM" : "AM"
  const formattedHour = hour % 12 || 12
  return `${formattedHour}${minutes === "00" ? "" : `:${minutes}`}${ampm}`
}

export default function CalendarView({ formData, month }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    const monthIndex = MONTHS.indexOf(month)
    if (monthIndex !== -1) {
      setCurrentDate(new Date(new Date().getFullYear(), monthIndex, 1))
    }
  }, [month])

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const formatDateString = (date: Date) => {
    return date.toISOString().split("T")[0]
  }

  const isDayOff = (date: Date) => {
    const dateString = formatDateString(date)
    return (
      formData.daysOff?.some((exception) => {
        const exceptionDate = new Date(exception.date)
        return formatDateString(exceptionDate) === dateString
      }) || false
    )
  }

  const isAdditionalWorkDay = (date: Date) => {
    const dateString = formatDateString(date)
    return (
      formData.additionalWorkDays?.some((exception) => {
        const exceptionDate = new Date(exception.date)
        return formatDateString(exceptionDate) === dateString
      }) || false
    )
  }

  const isDateAvailable = (date: Date) => {
    // First check if it's a day off - this should override all other availability
    if (isDayOff(date)) {
      return false
    }

    const dayIndex = date.getDay()
    const fullDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex]

    // Check if it's an additional work day
    if (isAdditionalWorkDay(date)) {
      return true
    }

    // Check regular schedule
    return formData.schedule[fullDayName]?.selected || false
  }

  const getAvailabilityTimes = (date: Date) => {
    const dateString = formatDateString(date)
    const additionalWorkDay = formData.additionalWorkDays?.find((exception) => {
      const exceptionDate = new Date(exception.date)
      return formatDateString(exceptionDate) === dateString
    })

    if (additionalWorkDay && additionalWorkDay.startTime && additionalWorkDay.endTime) {
      return {
        start: formatTime(additionalWorkDay.startTime),
        end: formatTime(additionalWorkDay.endTime),
      }
    }

    const dayIndex = date.getDay()
    const fullDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex]

    if (formData.schedule[fullDayName]?.selected || isAdditionalWorkDay(date)) {
      const start = formatTime(formData.schedule[fullDayName]?.startTime || "09:00")
      const end = formatTime(formData.schedule[fullDayName]?.endTime || "17:00")
      return { start, end }
    }
    return null
  }

  const getAvailableServices = (date: Date) => {
    if (isDayOff(date)) return []

    const dayIndex = date.getDay()
    const fullDayName = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"][dayIndex]

    if (!formData.schedule[fullDayName]?.selected && !isAdditionalWorkDay(date)) return []

    return Object.entries(formData.services)
      .filter(([_, service]) => service.selected)
      .map(([name, _]) => name)
  }

  const renderCalendar = () => {
    const daysInMonth = getDaysInMonth(currentDate)
    const firstDayOfMonth = getFirstDayOfMonth(currentDate)
    const days = []

    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(<div key={`empty-${i}`} className="h-28 bg-gray-50"></div>)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
      const dayOffStatus = isDayOff(date)
      const additionalWorkingDay = isAdditionalWorkDay(date)
      const available = isDateAvailable(date)

      days.push(
        <div
          key={day}
          className={`h-28 border p-2 overflow-hidden ${
            dayOffStatus
              ? "bg-red-100"
              : additionalWorkingDay
                ? "bg-green-100"
                : available
                  ? "bg-primary/5 hover:bg-primary/10 transition-colors"
                  : "bg-gray-50"
          }`}
        >
          <div className="font-semibold mb-1">{day}</div>
          {dayOffStatus ? (
            <div className="inline-flex items-center bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-full">
              Vacation
            </div>
          ) : (
            available && (
              <div className="space-y-0.5">
                <div className="inline-flex items-center bg-primary text-white text-[10px] px-1.5 py-0.5 rounded-full">
                  Available
                </div>
                {getAvailabilityTimes(date) && (
                  <div className="flex items-center text-[10px] text-primary">
                    <Clock className="h-2.5 w-2.5 mr-0.5" />
                    <span>
                      {getAvailabilityTimes(date)?.start}-{getAvailabilityTimes(date)?.end}
                    </span>
                  </div>
                )}
                <div className="text-[10px] text-gray-600 leading-tight">
                  {getAvailableServices(date).map((service) => (
                    <div key={service} className="capitalize truncate">
                      • {service}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
          {additionalWorkingDay && !dayOffStatus && (
            <div className="inline-flex items-center bg-green-500 text-white text-[10px] px-1.5 py-0.5 rounded-full mt-0.5">
              Extra
            </div>
          )}
        </div>,
      )
    }

    return days
  }

  return (
    <div className="space-y-4 bg-white rounded-lg p-4 border">
      <h3 className="text-xl font-semibold text-primary">
        {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
      </h3>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div key={day} className="h-8 flex items-center justify-center font-semibold text-primary">
            {day}
          </div>
        ))}
        {renderCalendar()}
      </div>
    </div>
  )
}

