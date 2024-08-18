import { readFileSync } from 'fs';
import { ModulusWeight } from './interfaces';
import { AccountDetailIndex } from './enums';

const loadSubstitutionMap = (): { [key: string]: string } =>
  readFileSync(`${__dirname}/data/scsubtab.txt`, 'utf8')
    .split('\r\n')
    .map((line) => line.split(/\s+/))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

const applyLengthAdjustments = (
  sortCode: string,
  accountNumber: string
): { sortCode: string; accountNumber: string } => {
  let [adjustedSortCode, adjustedAccountNumber] = [sortCode, accountNumber];
  if (accountNumber.length === 6) {
    adjustedAccountNumber = '00' + accountNumber;
  } else if (accountNumber.length === 7) {
    adjustedAccountNumber = '0' + accountNumber;
  } else if (accountNumber.length === 9) {
    adjustedSortCode = sortCode.slice(0, -1) + accountNumber[0];
    adjustedAccountNumber = accountNumber.slice(1);
  } else if (accountNumber.length === 10) {
    adjustedAccountNumber = accountNumber.slice(0, 8);
  }
  return { sortCode: adjustedSortCode, accountNumber: adjustedAccountNumber };
};

const applyExceptionAdjustments = (
  sortCode: string,
  accountNumber: string,
  modulusWeightException: number | null
): { sortCode: string; accountNumber: string } => {
  let [adjustedSortCode, adjustedAccountNumber] = [sortCode, accountNumber];
  let substitutionMap = loadSubstitutionMap();
  if (modulusWeightException === 5 && substitutionMap[sortCode]) {
    adjustedSortCode = substitutionMap[sortCode];
  } else if (modulusWeightException === 8) {
    adjustedSortCode = '090126';
  } else if (modulusWeightException === 9) {
    adjustedSortCode = '309634';
  }
  return { sortCode: adjustedSortCode, accountNumber: adjustedAccountNumber };
};

export const applyAccountDetailExceptionRules = (
  sortCode: string,
  accountNumber: string,
  modulusWeightException: number | null
): string => {
  const {
    sortCode: lengthAdjustedSortCode,
    accountNumber: lengthAdjustedAccountNumber,
  } = applyLengthAdjustments(sortCode, accountNumber);
  const {
    sortCode: exceptionAdjustedSortCode,
    accountNumber: exceptionAdjustedAccountNumber,
  } = applyExceptionAdjustments(
    lengthAdjustedSortCode,
    lengthAdjustedAccountNumber,
    modulusWeightException
  );
  return exceptionAdjustedSortCode + exceptionAdjustedAccountNumber;
};

export const applyWeightValueExceptionRules = (
  modulusWeight: ModulusWeight,
  accountDetails: string
): number[] => {
  let modifiedWeightings = modulusWeight.weights;
  const ab = accountDetails.slice(
    AccountDetailIndex.A,
    AccountDetailIndex.B + 1
  );
  if (
    modulusWeight.exception == 7 ||
    (modulusWeight.exception == 10 && ['09', '99'].includes(ab))
  ) {
    if (accountDetails[AccountDetailIndex.G] === '9') {
      for (let i = 0; i < AccountDetailIndex.B + 1; i++) {
        modifiedWeightings[i] = 0;
      }
    }
  }
  if (modulusWeight.exception === 2) {
    const a = accountDetails[AccountDetailIndex.A];
    const g = accountDetails[AccountDetailIndex.G];
    if (a !== '0' && g !== '9') {
      modifiedWeightings = [0, 0, 1, 2, 5, 3, 6, 4, 8, 7, 10, 9, 3, 1];
    } else if (a !== '0' && g === '9') {
      modifiedWeightings = [0, 0, 0, 0, 0, 0, 0, 0, 8, 7, 10, 9, 3, 1];
    }
  }
  return modifiedWeightings;
};

export const applyOverwriteExceptionRules = (
  modulusWeight: ModulusWeight,
  accountDetails: string
): { modifiedAccountDetails: string; overwriteResult: boolean | null } => {
  const a = accountDetails[AccountDetailIndex.A];
  const g = accountDetails[AccountDetailIndex.G];
  const h = accountDetails[AccountDetailIndex.H];

  // exception 3 is a special case where the first digit of the account number must be 1 or 9
  if (modulusWeight.exception === 3 && ['1', '9'].includes(a)) {
    return { modifiedAccountDetails: accountDetails, overwriteResult: true };
  }

  // exception 6 is a special case where the first digit of the account number must be between 4 and 10 and the 7th and 8th digits must be the same
  if (
    modulusWeight.exception === 6 &&
    parseInt(a, 10) >= 4 &&
    parseInt(a, 10) <= 10 &&
    g === h
  ) {
    return { modifiedAccountDetails: accountDetails, overwriteResult: true };
  }
  if (modulusWeight.exception === 14) {
    if (!['0', '1', '9'].includes(h)) {
      return { modifiedAccountDetails: accountDetails, overwriteResult: false };
    }
    return {
      modifiedAccountDetails:
        accountDetails.slice(0, 6) + '0' + accountDetails.slice(6, -1),
      overwriteResult: null,
    };
  }
  return { modifiedAccountDetails: accountDetails, overwriteResult: null };
};

export const applyPostTotalExceptionRules = (
  exception: number | null,
  total: number,
  accountDetails: string
): { adjustedTotal: number; overwriteResult2: boolean | null } => {
  let adjustedTotal = total;
  let overwriteResult2 = null;
  if (exception == 1) {
    adjustedTotal += 27;
  }
  if (exception == 4) {
    const remainder = total % 11;
    const checkDigit = parseInt(
      accountDetails.substring(accountDetails.length - 2),
      10
    );
    if (remainder === checkDigit) {
      overwriteResult2 = true;
    }
  }
  if (exception == 5) {
    const g = parseInt(accountDetails[AccountDetailIndex.G], 10);
    const remainder = total % 11;
    overwriteResult2 =
      (remainder === 0 && g === 0) || (remainder !== 1 && 11 - remainder === g);
  }
  return { adjustedTotal, overwriteResult2 };
};
