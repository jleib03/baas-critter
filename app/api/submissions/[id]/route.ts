import { NextResponse } from "next/server"
import prisma from "@/lib/prisma"

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id
    await prisma.submission.delete({
      where: { id },
    })
    return NextResponse.json({ message: "Submission deleted successfully" })
  } catch (error) {
    console.error("Error deleting submission:", error)
    return NextResponse.json({ error: "Error deleting submission" }, { status: 500 })
  }
}

