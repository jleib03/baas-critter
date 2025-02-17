import { Button } from "./ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { ServiceOfferingsTable } from "./ServiceOfferingsTable"
import { ScheduleTable } from "./ScheduleTable"
import type { Submission } from "./AdminDashboard"

interface SubmissionDetailProps {
  submission: Submission
  onBack: () => void
  onViewCalendar: () => void
}

export function SubmissionDetail({ submission, onBack, onViewCalendar }: SubmissionDetailProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Submission Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold mb-2">Business Information</h3>
          <p>
            <strong>Name:</strong> {submission.firstName} {submission.lastName}
          </p>
          <p>
            <strong>Business Name:</strong> {submission.businessName}
          </p>
          <p>
            <strong>Email:</strong> {submission.email}
          </p>
          <p>
            <strong>Submission Date:</strong> {new Date(submission.createdAt).toLocaleDateString()}
          </p>
          <p>
            <strong>Status:</strong> {submission.status}
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Service Offerings</h3>
          {submission.onboarding?.serviceOfferings ? (
            <ServiceOfferingsTable serviceOfferings={submission.onboarding.serviceOfferings} />
          ) : (
            <p>No service offerings data available.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Schedule</h3>
          <ScheduleTable
            schedule={submission.schedule}
            daysOff={submission.daysOff}
            additionalWorkDays={submission.additionalWorkDays}
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button onClick={onBack} variant="outline">
          Back to Dashboard
        </Button>
        <Button onClick={onViewCalendar}>View Calendar</Button>
      </CardFooter>
    </Card>
  )
}

