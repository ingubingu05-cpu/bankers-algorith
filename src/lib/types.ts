export interface SystemState {
  resources: number;
  processes: number;
  available: number[];
  max: number[][];
  allocation: number[][];
  need: number[][];
}

export interface LoanRequest {
  processId: number;
  request: number[];
}

export type AlertState = {
  type: 'success' | 'error' | 'warning' | null;
  message: string | null;
};
