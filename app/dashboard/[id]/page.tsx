"use client"

import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface Submission {
  id: string
  firstName: string
  lastName: string
  email: string
  businessName: string
  createdAt: string
  services: any
  schedule: any
  daysOff: any[]
  additionalWorkDays: any[]
}

export default function SubmissionDetail() {
  const { id } = useParams()
  const [submission, setSubmission] = useState<Submission | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchSubmission() {
      try {
        const response = await fetch(`/api/submissions/${id}`)
        if (!response.ok) {
          throw new Error("Failed to fetch submission")
        }
        const data = await response.json()
        setSubmission(data)
      } catch (err) {
        setError("Error fetching submission")
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchSubmission()
  }, [id])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>
  if (!submission) return <div>Submission not found</div>

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6">Submission Detail</h1>
      <Card>
        <CardHeader>
          <CardTitle>{submission.businessName}</CardTitle>
        </CardHeader>
        <CardContent>
          <p>
            <strong>Name:</strong> {submission.firstName} {submission.lastName}
          </p>
          <p>
            <strong>Email:</strong> {submission.email}
          </p>
          <p>
            <strong>Submitted:</strong> {new Date(submission.createdAt).toLocaleString()}
          </p>
          <h2 className="text-xl font-semibold mt-4">Services</h2>
          <ul>
            {Object.entries(submission.services).map(
              ([service, details]: [string, any]) =>
                details.selected && (
                  <li key={service}>
                    {service}: ${details.cost}
                    {details.duration ? ` - ${details.duration} minutes` : ""}
                  </li>
                ),
            )}
          </ul>
          {/* Add more details as needed */}
        </CardContent>
      </Card>
    </div>
  )
}

