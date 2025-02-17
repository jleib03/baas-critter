import type React from "react"
import { Alert, AlertTitle, AlertDescription } from "./ui/alert"
import { XCircle } from "lucide-react"

interface LLMErrorAlertProps {
  error: string | null
}

export const LLMErrorAlert: React.FC<LLMErrorAlertProps> = ({ error }) => {
  if (!error) return null

  return (
    <Alert variant="destructive">
      <XCircle className="h-4 w-4" />
      <AlertTitle>Error</AlertTitle>
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  )
}

