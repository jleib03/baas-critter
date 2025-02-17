import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Button } from "./ui/button"
import { Badge } from "./ui/badge"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./ui/alert-dialog"
import { Trash2 } from "lucide-react"
import type { Submission } from "./AdminDashboard"

interface SubmissionsTableProps {
  submissions: Submission[]
  onSelectSubmission: (submission: Submission) => void
  onDeleteSubmission: (id: string) => void
}

export default function SubmissionsTable({
  submissions,
  onSelectSubmission,
  onDeleteSubmission,
}: SubmissionsTableProps) {
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const getStatusDisplay = (status: string | undefined) => {
    const defaultStatus = "PENDING"
    const currentStatus = status || defaultStatus
    return currentStatus.charAt(0) + currentStatus.slice(1).toLowerCase()
  }

  const getStatusVariant = (status: string | undefined) => {
    switch (status) {
      case "SUBMITTED":
        return "default"
      case "UPDATED":
        return "secondary"
      default:
        return "outline"
    }
  }

  const handleDelete = (id: string) => {
    onDeleteSubmission(id)
    setDeletingId(null)
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Business Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Submission Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {submissions.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center">
              No submissions found
            </TableCell>
          </TableRow>
        ) : (
          submissions.map((submission) => (
            <TableRow key={submission.id}>
              <TableCell>{`${submission.firstName} ${submission.lastName}`}</TableCell>
              <TableCell>{submission.businessName}</TableCell>
              <TableCell>{submission.email}</TableCell>
              <TableCell>{new Date(submission.createdAt).toLocaleDateString()}</TableCell>
              <TableCell>
                <Badge variant={getStatusVariant(submission.status)}>{getStatusDisplay(submission.status)}</Badge>
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button onClick={() => onSelectSubmission(submission)}>View Details</Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="destructive" size="icon">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete the submission for{" "}
                          {submission.firstName} {submission.lastName}.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(submission.id)}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  )
}

