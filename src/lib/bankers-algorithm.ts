import type { SystemState } from './types';

// Helper to check if array A is less than or equal to array B element-wise
const isLessOrEqual = (a: number[], b: number[]): boolean => {
  return a.every((val, i) => val <= b[i]);
};

// Helper to add two arrays element-wise
const addArrays = (a: number[], b: number[]): number[] => {
  return a.map((val, i) => val + b[i]);
};

// Helper to subtract array B from array A element-wise
const subtractArrays = (a: number[], b: number[]): number[] => {
  return a.map((val, i) => val - b[i]);
};

/**
 * Checks if the current system state is safe.
 * @param state - The current system state.
 * @returns An object with isSafe boolean and the safeSequence array.
 */
export const checkSafety = (
  state: SystemState
): { isSafe: boolean; safeSequence: number[] } => {
  const { processes, resources, available, allocation, need } = state;
  const work = [...available];
  const finish = Array(processes).fill(false);
  const safeSequence: number[] = [];
  
  let foundProcessInPass = true;
  while(safeSequence.length < processes && foundProcessInPass) {
    foundProcessInPass = false;
    for (let i = 0; i < processes; i++) {
      if (!finish[i] && isLessOrEqual(need[i], work)) {
        for (let j = 0; j < resources; j++) {
          work[j] += allocation[i][j];
        }
        finish[i] = true;
        safeSequence.push(i);
        foundProcessInPass = true;
      }
    }
  }

  return {
    isSafe: safeSequence.length === processes,
    safeSequence,
  };
};

/**
 * Handles a loan request using the Banker's Algorithm.
 * @param currentState - The current state of the system.
 * @param processId - The ID of the process making the request.
 * @param request - The resources being requested.
 * @returns An object with the result of the request.
 */
export const handleLoanRequest = (
  currentState: SystemState,
  processId: number,
  request: number[]
) => {
  const { available, allocation, need } = currentState;

  if (!isLessOrEqual(request, need[processId])) {
    return {
      granted: false,
      newState: currentState,
      message: `Error: Process ${processId} has exceeded its maximum claim. Request cannot be granted.`,
      safeSequence: [],
    };
  }

  if (!isLessOrEqual(request, available)) {
    return {
      granted: false,
      newState: currentState,
      message: `Request denied for Process ${processId}. Resources not available. Process must wait.`,
      safeSequence: checkSafety(currentState).safeSequence,
    };
  }

  const pretendedState: SystemState = JSON.parse(JSON.stringify(currentState));
  pretendedState.available = subtractArrays(available, request);
  pretendedState.allocation[processId] = addArrays(
    allocation[processId],
    request
  );
  pretendedState.need[processId] = subtractArrays(
    need[processId],
    request
  );

  const { isSafe, safeSequence } = checkSafety(pretendedState);

  if (isSafe) {
    return {
      granted: true,
      newState: pretendedState,
      message: `Loan for Process ${processId} granted. The system is in a safe state.`,
      safeSequence,
    };
  } else {
    return {
      granted: false,
      newState: currentState, // Revert to original state
      message: `Request for Process ${processId} denied. Granting it would lead to an unsafe state.`,
      safeSequence: checkSafety(currentState).safeSequence,
    };
  }
};
