import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface ServiceOfferingsTableProps {
  serviceOfferings: any // Consider creating a more specific type
}

export function ServiceOfferingsTable({ serviceOfferings }: ServiceOfferingsTableProps) {
  if (!serviceOfferings || typeof serviceOfferings !== "object") {
    return <p>No service offerings data available.</p>
  }

  // Extract services from the serviceOfferings object
  const services = Object.entries(serviceOfferings)
    .filter(([key]) => key !== "additionalComments")
    .map(([_, service]) => service)
    .filter(
      (service) =>
        service &&
        typeof service === "object" &&
        ((service.costs && Object.keys(service.costs).length > 0) ||
          (Array.isArray(service.acceptedPets) && service.acceptedPets.length > 0)),
    )

  // Extract common logistics that are the same across all services
  const commonLogistics = services.length > 0 && services[0].logistics ? services[0].logistics : null

  if (services.length === 0) {
    return <p>No valid services found in the data.</p>
  }

  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Durations & Costs</TableHead>
            <TableHead>Accepted Pets</TableHead>
            <TableHead>Service-Specific Logistics</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {services.map((service, index) => (
            <TableRow key={index}>
              <TableCell>{service.name}</TableCell>
              <TableCell>
                {service.costs &&
                  Object.entries(service.costs).map(([duration, cost]) => (
                    <div key={duration}>{`${duration}: $${cost}`}</div>
                  ))}
              </TableCell>
              <TableCell>{Array.isArray(service.acceptedPets) ? service.acceptedPets.join(", ") : "N/A"}</TableCell>
              <TableCell>{Array.isArray(service.logistics) ? service.logistics.join(", ") : "N/A"}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {commonLogistics && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Common Logistics</h3>
          <ul className="list-disc pl-5">
            {commonLogistics.map((item: string, index: number) => (
              <li key={index}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      {serviceOfferings.additionalComments && (
        <div>
          <h3 className="text-lg font-semibold mb-2">Additional Comments</h3>
          <p>{serviceOfferings.additionalComments}</p>
        </div>
      )}
    </div>
  )
}

