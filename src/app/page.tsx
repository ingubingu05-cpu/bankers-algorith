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
import { SystemConfigForm } from "@/components/system-config-form";


export default function Home() {
  const [systemState, setSystemState] = useState<SystemState | null>(null);
  const [alertState, setAlertState] = useState<AlertState>({ type: null, message: null });
  const [safeSequence, setSafeSequence] = useState<number[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resourceNames, setResourceNames] = useState<string[]>([]);

  useEffect(() => {
    if (systemState) {
      const { isSafe, safeSequence: initialSequence } = checkSafety(systemState);
      if (isSafe) {
        setAlertState({ type: "success", message: "Initial state is safe." });
        setSafeSequence(initialSequence);
      } else {
        setAlertState({ type: "error", message: "Initial state is unsafe." });
        setSafeSequence([]);
      }
    }
  }, [systemState]);

  const handleSystemSetup = (state: SystemState) => {
    setSystemState(state);
    setResourceNames(
      Array.from({ length: state.resources }, (_, i) => String.fromCharCode(65 + i))
    );
  };
  
  const processLoanRequest = (data: LoanRequest) => {
    if (!systemState) return;

    setIsProcessing(true);
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
    setSystemState(null);
    setAlertState({ type: null, message: null });
    setSafeSequence([]);
    setResourceNames([]);
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
        {systemState && (
          <Button onClick={resetState} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Reset State
          </Button>
        )}
      </header>

      {!systemState ? (
        <SystemConfigForm onSetup={handleSystemSetup} />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          <div className="xl:col-span-2 space-y-8">
            <BankStatusTables state={systemState} resourceNames={resourceNames} />
          </div>

          <div className="space-y-6">
            <LoanRequestForm
              processCount={systemState.processes}
              resourceNames={resourceNames}
              onSubmit={processLoanRequest}
              isProcessing={isProcessing}
            />
            <StatusAlert alertState={alertState} />
            <SafeSequenceDisplay sequence={safeSequence} />
          </div>
        </div>
      )}
    </main>
  );
}
