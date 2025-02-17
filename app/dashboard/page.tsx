import type React from "react"
import Link from "next/link"

export default async function DashboardPage() {
  const res = await fetch("http://localhost:3001/api/submissions", {
    cache: "no-store",
  })

  if (!res.ok) {
    throw new Error("Failed to fetch submissions")
  }

  const submissions = await res.json()

  return (
    <div className="p-4">
      <h1 className="text-3xl font-bold mb-4">Submissions</h1>
      <table className="w-full border-collapse">
        <thead>
          <tr>
            <th className="border p-2">Applicant Name</th>
            <th className="border p-2">Business Name</th>
            <th className="border p-2">Email</th>
            <th className="border p-2">Date Submitted</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>
                <Link href={`/dashboard/${submission.id}`} className="text-primary hover:underline">
                  {`${submission.firstName} ${submission.lastName}`}
                </Link>
              </TableCell>
              <TableCell>{submission.businessName}</TableCell>
              <TableCell>{submission.email}</TableCell>
              <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
            </TableRow>
          ))}
        </tbody>
      </table>
    </div>
  )
}

const TableRow = ({ children }: { children: React.ReactNode }) => <tr className="border-b">{children}</tr>

const TableCell = ({ children }: { children: React.ReactNode }) => <td className="border p-2">{children}</td>

