import { CheckType } from './enums';

export interface ModulusWeight {
  start: number;
  end: number;
  check_type: CheckType;
  exception: number | null;
  weights: number[];
}

export interface BankAccount {
  accountNumber: string;
  sortCode: string;
}
