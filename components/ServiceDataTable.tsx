import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table"

interface ServiceData {
  name: string
  durations: string[]
  costs: { [key: string]: number }
  petTypes: string[]
  restrictions: string[]
  additionalInfo: string[]
}

interface ServiceDataTableProps {
  data: { [key: string]: ServiceData }
}

export default function ServiceDataTable({ data }: ServiceDataTableProps) {
  return (
    <div className="mt-8">
      <h3 className="text-lg font-semibold mb-4">Structured Service Data</h3>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Service</TableHead>
            <TableHead>Durations</TableHead>
            <TableHead>Costs</TableHead>
            <TableHead>Pet Types</TableHead>
            <TableHead>Restrictions</TableHead>
            <TableHead>Additional Info</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Object.entries(data).map(([service, details]) => (
            <TableRow key={service}>
              <TableCell>{details.name}</TableCell>
              <TableCell>{details.durations.join(", ")}</TableCell>
              <TableCell>
                {Object.entries(details.costs).map(([duration, cost]) => (
                  <div key={duration}>
                    {duration}: ${cost}
                  </div>
                ))}
              </TableCell>
              <TableCell>{details.petTypes.join(", ")}</TableCell>
              <TableCell>{details.restrictions.join(", ")}</TableCell>
              <TableCell>{details.additionalInfo.join(", ")}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

