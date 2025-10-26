import { ModulusWeight } from './interfaces';
import { AccountDetailIndex } from './enums';
import substitutionMap from './data/scsubtab.json';

// Helper function to identify bank type from sort code
const getBankType = (sortCode: string): 'santander' | 'coventry' | 'other' => {
  const code = parseInt(sortCode, 10);

  // Santander ranges (as documented by Vocalink)
  const santanderRanges = [{ start: 871427, end: 872427 }];

  // Coventry Building Society ranges
  const coventryRanges = [
    { start: 90000, end: 91900 },
    { start: 720000, end: 729999 },
    { start: 890000, end: 892999 },
    { code: 165710 },
  ];

  for (const range of santanderRanges) {
    if (code >= range.start && code <= range.end) {
      return 'santander';
    }
  }

  for (const range of coventryRanges) {
    if ('code' in range) {
      if (code === range.code) return 'coventry';
    } else {
      if (code >= range.start && code <= range.end) return 'coventry';
    }
  }

  return 'other';
};

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
    const bankType = getBankType(sortCode);
    if (bankType === 'santander') {
      // Vocalink documented logic for Santander: move first digit to sort code
      adjustedSortCode = sortCode.slice(0, -1) + accountNumber[0];
      adjustedAccountNumber = accountNumber.slice(1);
    } else if (bankType === 'coventry') {
      // Coventry Building Society: simply remove the first digit
      adjustedAccountNumber = accountNumber.slice(1);
    } else {
      // For other banks with 9-digit accounts, use Vocalink logic as fallback
      adjustedSortCode = sortCode.slice(0, -1) + accountNumber[0];
      adjustedAccountNumber = accountNumber.slice(1);
    }
  } else if (accountNumber.length === 10) {
    adjustedAccountNumber = accountNumber.slice(0, 8);
  }
  return { sortCode: adjustedSortCode, accountNumber: adjustedAccountNumber };
};

const applyExceptionAdjustments = (
  sortCode: string,
  modulusWeightException: number | null
): string => {
  let adjustedSortCode = sortCode;
  if (
    modulusWeightException === 5 &&
    substitutionMap[sortCode as keyof typeof substitutionMap]
  ) {
    adjustedSortCode =
      substitutionMap[sortCode as keyof typeof substitutionMap];
  } else if (modulusWeightException === 8) {
    adjustedSortCode = '090126';
  } else if (modulusWeightException === 9) {
    adjustedSortCode = '309634';
  }
  return adjustedSortCode;
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
  const exceptionAdjustedSortCode = applyExceptionAdjustments(
    lengthAdjustedSortCode,
    modulusWeightException
  );
  return exceptionAdjustedSortCode + lengthAdjustedAccountNumber;
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
  accountDetails: string,
  _sortCode?: string
): { modifiedAccountDetails: string; overwriteResult: boolean | null } => {
  const {
    [AccountDetailIndex.A]: a,
    [AccountDetailIndex.G]: g,
    [AccountDetailIndex.H]: h,
  } = accountDetails;
  if (modulusWeight.exception === 3 && ['1', '9'].includes(a))
    return { modifiedAccountDetails: accountDetails, overwriteResult: true };
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
      return { modifiedAccountDetails: accountDetails, overwriteResult: null };
    }
    // Exception 14: Don't modify here - let the main logic handle two-stage check if needed
    return { modifiedAccountDetails: accountDetails, overwriteResult: null };
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
    if (
      total % 11 ===
      parseInt(accountDetails.substring(accountDetails.length - 2), 10)
    ) {
      overwriteResult2 = true;
    }
  }
  if (exception == 5) {
    const a = parseInt(accountDetails[AccountDetailIndex.A], 10);
    if (a === 1) {
      overwriteResult2 = false;
    } else {
      overwriteResult2 = true;
    }
  }
  return { adjustedTotal, overwriteResult2 };
};
