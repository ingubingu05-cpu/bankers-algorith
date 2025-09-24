"use client";

import { useEffect, useState } from "react";
import {
  handleLoanRequest,
  checkSafety,
} from "@/lib/bankers-algorithm";
import type { SystemState, AlertState, LoanRequest } from "@/lib/types";
import { BankStatusTables } from "@/components/bank-status-tables";
import { LoanRequestForm } from "@/components/loan-request-form";
import { SafeSequenceDisplay } from "@/components/safe-sequence-display";
import { StatusAlert } from "@/components/status-alert";
import { Landmark, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

// Classic Banker's Algorithm example data
const getInitialState = (): SystemState => ({
  processes: 5,
  resources: 3,
  available: [3, 3, 2],
  max: [
    [7, 5, 3],
    [3, 2, 2],
    [9, 0, 2],
    [2, 2, 2],
    [4, 3, 3],
  ],
  allocation: [
    [0, 1, 0],
    [2, 0, 0],
    [3, 0, 2],
    [2, 1, 1],
    [0, 0, 2],
  ],
  need: [
    [7, 4, 3],
    [1, 2, 2],
    [6, 0, 0],
    [0, 1, 1],
    [4, 3, 1],
  ],
});

const RESOURCE_NAMES = ["A", "B", "C"];

export default function Home() {
  const [systemState, setSystemState] = useState<SystemState>(getInitialState());
  const [alertState, setAlertState] = useState<AlertState>({ type: null, message: null });
  const [safeSequence, setSafeSequence] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Initial safety check
  useEffect(() => {
    const { isSafe, safeSequence: initialSequence } = checkSafety(systemState);
    if (isSafe) {
      setAlertState({ type: "success", message: "Initial state is safe." });
      setSafeSequence(initialSequence);
    } else {
      setAlertState({ type: "error", message: "Initial state is unsafe." });
      setSafeSequence([]);
    }
  }, []);

  const processLoanRequest = (data: LoanRequest) => {
    setIsProcessing(true);
    // Simulate processing time
    setTimeout(() => {
      const result = handleLoanRequest(systemState, data.processId, data.request);
      
      setSystemState(result.newState);
      
      if (result.granted) {
        setAlertState({ type: "success", message: result.message });
        setSafeSequence(result.safeSequence);
      } else {
        const alertType = result.message.startsWith("Error:") ? 'error' : 'warning';
        setAlertState({ type: alertType, message: result.message });
        if (alertType === 'warning') {
            const { safeSequence: currentSafeSequence } = checkSafety(result.newState);
            setSafeSequence(currentSafeSequence);
        } else {
            setSafeSequence([]);
        }
      }
      setIsProcessing(false);
    }, 500);
  };

  const resetState = () => {
    const initialState = getInitialState();
    setSystemState(initialState);
    const { isSafe, safeSequence: initialSequence } = checkSafety(initialState);
    if (isSafe) {
        setAlertState({ type: "success", message: "System reset to a safe initial state." });
        setSafeSequence(initialSequence);
    } else {
        setAlertState({ type: "error", message: "System reset to an unsafe initial state." });
        setSafeSequence([]);
    }
  };

  return (
    <main className="container mx-auto p-4 md:p-8">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
            <Landmark className="h-10 w-10 text-primary" />
            <div>
                <h1 className="text-3xl font-bold text-primary font-headline">BankSafe</h1>
                <p className="text-muted-foreground">Banker's Algorithm Simulator</p>
            </div>
        </div>
        <Button onClick={resetState} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset State
        </Button>
      </header>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        <div className="xl:col-span-2 space-y-8">
          <BankStatusTables state={systemState} resourceNames={RESOURCE_NAMES} />
        </div>

        <div className="space-y-6">
          <LoanRequestForm
            processCount={systemState.processes}
            resourceNames={RESOURCE_NAMES}
            onSubmit={processLoanRequest}
            isProcessing={isProcessing}
          />
          <StatusAlert alertState={alertState} />
          <SafeSequenceDisplay sequence={safeSequence} />
        </div>
      </div>
    </main>
  );
}
