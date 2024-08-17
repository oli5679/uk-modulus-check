//create an enum for mod that is one of MOD11, MOD10, DBLAL

export enum ModCheck {
  MOD11 = 'MOD11',
  MOD10 = 'MOD10',
  DBLAL = 'DBLAL'
}

export enum AccountDetailIndexes {
  u = 0,
  v = 1,
  w = 2,
  x = 3,
  y = 4,
  z = 5,
  a = 6,
  b = 7,
  c = 8,
  d = 9,
  e = 10,
  f = 11,
  g = 12,
  h = 13
}

export interface ModulusWeight {
    start: number;
    end: number;
    mod: ModCheck;
    exception: number | null;
    weights: number[];
  }

export interface BankAccount {
  accountNumber: string;
  sortCode: string;
}