import { CheckType } from './constants';

//create an enum for mod that is one of MOD11, MOD10, DBLAL

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
