import { ModulusWeight } from './interfaces';
import { AccountDetailIndex, CheckType } from './enums';
import substitutionMap from './data/scsubtab.json';

// Constants for modulus checking
const MOD11_VALUE = 11;
const MOD10_VALUE = 10;
const EXCEPTION_1_ADJUSTMENT = 27;

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
    const digitA = accountDetails[AccountDetailIndex.A];
    const digitG = accountDetails[AccountDetailIndex.G];
    if (digitA !== '0' && digitG !== '9') {
      modifiedWeightings = [0, 0, 1, 2, 5, 3, 6, 4, 8, 7, 10, 9, 3, 1];
    } else if (digitA !== '0' && digitG === '9') {
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
    [AccountDetailIndex.A]: digitA,
    [AccountDetailIndex.G]: digitG,
    [AccountDetailIndex.H]: digitH,
  } = accountDetails;
  if (modulusWeight.exception === 3 && ['1', '9'].includes(digitA))
    return { modifiedAccountDetails: accountDetails, overwriteResult: true };
  if (
    modulusWeight.exception === 6 &&
    parseInt(digitA, 10) >= 4 &&
    parseInt(digitA, 10) <= 10 &&
    digitG === digitH
  ) {
    return { modifiedAccountDetails: accountDetails, overwriteResult: true };
  }
  if (modulusWeight.exception === 14) {
    if (!['0', '1', '9'].includes(digitH)) {
      return { modifiedAccountDetails: accountDetails, overwriteResult: null };
    }
    // Exception 14: Don't modify here - let the main logic handle two-stage check if needed
    return { modifiedAccountDetails: accountDetails, overwriteResult: null };
  }
  return { modifiedAccountDetails: accountDetails, overwriteResult: null };
};

const handleException5 = (
  checkType: CheckType | undefined,
  total: number,
  digitG: number
): boolean | null => {
  const modulusValue =
    checkType === CheckType.MOD11 ? MOD11_VALUE : MOD10_VALUE;
  const remainder = total % modulusValue;
  const REMAINDER_ZERO = 0;
  const REMAINDER_ONE = 1;

  // Case 1: remainder === 0 && g === 0 (always valid)
  if (remainder === REMAINDER_ZERO && digitG === REMAINDER_ZERO) {
    return true;
  }

  // Case 2: MOD11 - when 11 - remainder === g, return null to let normal check proceed
  // This prevents false positives where MOD11 would pass but DBLAL fails
  if (
    checkType === CheckType.MOD11 &&
    remainder !== REMAINDER_ZERO &&
    remainder !== REMAINDER_ONE &&
    modulusValue - remainder === digitG
  ) {
    return null; // Let normal check proceed (will fail, making overall fail)
  }

  // Case 3: DBLAL remainder === 1 (special case when MOD11 passes)
  if (checkType === CheckType.DBLAL && remainder === REMAINDER_ONE) {
    return true;
  }

  // Case 4: DBLAL - when 10 - remainder === g
  if (
    checkType === CheckType.DBLAL &&
    remainder !== REMAINDER_ZERO &&
    remainder !== REMAINDER_ONE &&
    modulusValue - remainder === digitG
  ) {
    return true;
  }

  // Default: return null to let normal check proceed
  return null;
};

export const applyPostTotalExceptionRules = (
  exception: number | null,
  total: number,
  accountDetails: string,
  checkType?: CheckType
): { adjustedTotal: number; postTotalOverwriteResult: boolean | null } => {
  let adjustedTotal = total;
  let postTotalOverwriteResult: boolean | null = null;

  // Exception 1: Add 27 to total
  if (exception === 1) {
    adjustedTotal += EXCEPTION_1_ADJUSTMENT;
  }

  // Exception 4: Check if remainder matches last two digits
  if (exception === 4) {
    if (
      total % MOD11_VALUE ===
      parseInt(accountDetails.substring(accountDetails.length - 2), 10)
    ) {
      postTotalOverwriteResult = true;
    }
  }

  // Exception 5: Special validation logic
  if (exception === 5) {
    const digitG = parseInt(accountDetails[AccountDetailIndex.G], 10);
    postTotalOverwriteResult = handleException5(checkType, total, digitG);
  }

  return { adjustedTotal, postTotalOverwriteResult };
};

