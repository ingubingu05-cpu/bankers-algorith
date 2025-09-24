import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowRight } from "lucide-react";

interface SafeSequenceDisplayProps {
  sequence: number[];
}

export function SafeSequenceDisplay({ sequence }: SafeSequenceDisplayProps) {
  if (sequence.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Safe Execution Sequence</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap items-center gap-2">
          {sequence.map((processId, index) => (
            <div key={processId} className="flex items-center gap-2">
              <Badge variant="secondary" className="text-lg px-4 py-2">
                P{processId}
              </Badge>
              {index < sequence.length - 1 && (
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
