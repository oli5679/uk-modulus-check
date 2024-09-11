import { CheckType } from './enums';

export interface ModulusWeight {
  start: number | null;
  end: number | null;
  check_type?: CheckType;
  exception: number | null;
  weights: number[];
}

export interface BankAccount {
  accountNumber: string;
  sortCode: string;
}
