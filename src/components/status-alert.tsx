import { AlertTriangle, CheckCircle, Info, XCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { AlertState } from "@/lib/types";

interface StatusAlertProps {
  alertState: AlertState;
}

const alertConfig = {
  success: {
    icon: <CheckCircle className="h-4 w-4" />,
    title: "Success",
    variant: "default",
    className: "border-green-500/50 text-green-700 dark:border-green-500/60 dark:text-green-400 [&>svg]:text-green-600 dark:[&>svg]:text-green-400"
  },
  error: {
    icon: <XCircle className="h-4 w-4" />,
    title: "Error",
    variant: "destructive",
  },
  warning: {
    icon: <AlertTriangle className="h-4 w-4" />,
    title: "Warning",
    variant: "default",
    className: "border-yellow-500/50 text-yellow-700 dark:border-yellow-500/60 dark:text-yellow-400 [&>svg]:text-yellow-600 dark:[&>svg]:text-yellow-400"
  },
  info: {
    icon: <Info className="h-4 w-4" />,
    title: "System Status",
    variant: "default",
  },
};

export function StatusAlert({ alertState }: StatusAlertProps) {
  if (!alertState.type || !alertState.message) {
    const config = alertConfig['info'];
    return (
      <Alert variant={config.variant} className="bg-card/50">
        {config.icon}
        <AlertTitle>{config.title}</AlertTitle>
        <AlertDescription>
          Submit a loan request to check the system's safety.
        </AlertDescription>
      </Alert>
    );
  }

  const config = alertConfig[alertState.type] || alertConfig['info'];

  return (
    <Alert variant={config.variant as "default" | "destructive"} className={config.className}>
      {config.icon}
      <AlertTitle>{config.title}</AlertTitle>
      <AlertDescription>{alertState.message}</AlertDescription>
    </Alert>
  );
}
