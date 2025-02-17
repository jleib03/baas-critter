import type { Submission } from "../components/AdminDashboard"

export function convertToCSV(submissions: Submission[]): string {
  const headers = [
    "ID",
    "First Name",
    "Last Name",
    "Email",
    "Business Name",
    "Created At",
    "Services",
    "Schedule",
    "Days Off",
    "Additional Work Days",
  ]

  const rows = submissions.map((submission) => [
    submission.id,
    submission.firstName,
    submission.lastName,
    submission.email,
    submission.businessName,
    submission.createdAt,
    JSON.stringify(submission.services),
    JSON.stringify(submission.schedule),
    JSON.stringify(submission.daysOff),
    JSON.stringify(submission.additionalWorkDays),
  ])

  return [headers.join(","), ...rows.map((row) => row.map((cell) => `"${cell}"`).join(","))].join("\n")
}

export function downloadCSV(csv: string, filename: string): void {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" })
  const link = document.createElement("a")
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }
}

