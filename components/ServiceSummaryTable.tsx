"use client"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"

interface ServiceData {
  services: {
    [key: string]: boolean
  }
  durationsAndCosts: string
  petTypes: string
  logistics: string
}

interface ProcessedService {
  name: string
  durations: Array<{
    duration: string
    cost: number
  }>
  acceptedPets: string[]
  restrictions: {
    size?: string
    capacity?: string
    [key: string]: string | undefined
  }
  logistics?: {
    [key: string]: string
  }
}

interface ServiceSummaryTableProps {
  data: ServiceData
}

export default function ServiceSummaryTable({ data }: ServiceSummaryTableProps) {
  if (!data || !data.services) {
    return <div>No service data available</div>
  }

  // Parse the JSON responses
  const durationsData = JSON.parse(data.durationsAndCosts)
  const petTypesData = JSON.parse(data.petTypes)
  const logisticsData = JSON.parse(data.logistics)

  // Get selected services and process their data
  const selectedServices = Object.entries(data.services)
    .filter(([_, selected]) => selected)
    .map(([service]) => service)

  const processedServices: ProcessedService[] = selectedServices.map((service) => {
    const durations = durationsData[service]?.durations || []
    const petInfo = petTypesData[service] || { acceptedPets: [], restrictions: {} }
    const serviceLogistics = logisticsData.serviceSpecific[service] || {}

    return {
      name: service.charAt(0).toUpperCase() + service.slice(1),
      durations,
      acceptedPets: petInfo.acceptedPets || [],
      restrictions: petInfo.restrictions || {},
      logistics: serviceLogistics,
    }
  })

  // Format generic logistics for display
  const genericLogistics = []
  if (logisticsData && logisticsData.generic) {
    const { serviceArea, travelFee } = logisticsData.generic

    if (serviceArea) {
      const zipCodes = serviceArea.zipCodes ? serviceArea.zipCodes.join(", ") : "Not specified"
      const locations = serviceArea.locations ? ` (${serviceArea.locations.join(", ")})` : ""
      genericLogistics.push(`Service Area: ${zipCodes}${locations}`)
    }

    if (travelFee) {
      genericLogistics.push(`Travel Fee: $${travelFee.fee || "N/A"} for distances over ${travelFee.distance || "N/A"}`)
    }
  }

  if (genericLogistics.length === 0) {
    genericLogistics.push("No generic logistics information available")
  }

  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Service Summary</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[150px]">Service</TableHead>
              <TableHead>Duration & Cost</TableHead>
              <TableHead>Pet Types</TableHead>
              <TableHead>Restrictions</TableHead>
              <TableHead>Service-Specific Logistics</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {processedServices.map((service) => (
              <TableRow key={service.name}>
                <TableCell className="font-medium">{service.name}</TableCell>
                <TableCell>
                  {service.durations.map((detail, idx) => (
                    <div key={idx} className="mb-1">
                      {detail.duration}: ${detail.cost}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {service.acceptedPets.map((pet, idx) => (
                      <Badge key={idx} variant="secondary" className="mr-1">
                        {pet}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {Object.entries(service.restrictions).map(([key, value], idx) => (
                    <div key={idx} className="mb-1">
                      {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                    </div>
                  ))}
                </TableCell>
                <TableCell>
                  {Object.entries(service.logistics || {}).map(([key, value], idx) => (
                    <div key={idx} className="mb-1">
                      {key.charAt(0).toUpperCase() + key.slice(1)}: {value}
                    </div>
                  ))}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-2">Generic Logistics</h3>
          {genericLogistics.length > 0 ? (
            <ul className="list-disc pl-5">
              {genericLogistics.map((item, idx) => (
                <li key={idx}>{item}</li>
              ))}
            </ul>
          ) : (
            <p>No generic logistics information available.</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}

