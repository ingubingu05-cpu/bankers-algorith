import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { SystemState } from "@/lib/types";

interface BankStatusTablesProps {
  state: SystemState;
  resourceNames: string[];
}

const ResourceTable = ({
  title,
  data,
  resourceNames,
}: {
  title: string;
  data: number[][];
  resourceNames: string[];
}) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Process</TableHead>
            {resourceNames.map((name) => (
              <TableHead key={name}>{name}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, processId) => (
            <TableRow key={processId}>
              <TableCell className="font-medium">P{processId}</TableCell>
              {row.map((value, resourceId) => (
                <TableCell key={resourceId}>{value}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
);

export function BankStatusTables({ state, resourceNames }: BankStatusTablesProps) {
  const { available, allocation, max, need } = state;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle>Available Resources</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-6">
            {resourceNames.map((name, i) => (
              <div key={name} className="text-center">
                <p className="text-sm font-medium text-muted-foreground">{name}</p>
                <p className="text-3xl font-bold">{available[i]}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <ResourceTable title="Maximum Need" data={max} resourceNames={resourceNames} />
      <ResourceTable title="Allocation" data={allocation} resourceNames={resourceNames} />
      <ResourceTable title="Remaining Need" data={need} resourceNames={resourceNames} />
    </div>
  );
}
