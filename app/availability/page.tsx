import Image from "next/image"
import AvailabilityForm from "../../components/AvailabilityForm"

export default function AvailabilityPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
          <h1 className="text-lg font-semibold leading-6 text-gray-900">Care by Critter Scheduling Input</h1>
        </div>
      </header>
      <main>
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex items-center space-x-4 mb-6">
              <h2 className="text-3xl font-bold text-gray-900">Set Your Availability</h2>
              <Image
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-yXrSzR4fIAO7wXse1UZ8A6CNohgWcg.png"
                alt="Critter Dog Illustration"
                width={48}
                height={48}
                className="w-12 h-12"
              />
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Configure your schedule and services to let clients know when you're available for pet care.
            </p>
            <div className="mt-6">
              <AvailabilityForm />
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

