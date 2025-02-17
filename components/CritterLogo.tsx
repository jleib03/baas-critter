import Image from "next/image"

interface CritterLogoProps {
  className?: string
  size?: number
}

export default function CritterLogo({ className = "", size = 32 }: CritterLogoProps) {
  return (
    <Image
      src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Critter%20-%20Logo%20Mark%20-%20Orange%20(E75837)-FByjzEhV9CRLD8KC9plKnZ1pl2n6W9.png"
      alt="Critter.Pet"
      width={size}
      height={size}
      className={className}
    />
  )
}

