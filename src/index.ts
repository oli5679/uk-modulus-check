import { ModulusWeight } from './interfaces';
import { CheckType } from './enums';
import {
  applyAccountDetailExceptionRules,
  applyWeightValueExceptionRules,
  applyOverwriteExceptionRules,
  applyPostTotalExceptionRules,
} from './ExceptionRules';
import modulusWeightsArray from './data/valacdos.json';

const modulusCalculation = (
  modulusWeight: ModulusWeight,
  sortCode: string,
  accountNumber: string
): boolean => {
  // by default, the account details are the sort code followed by the account number
  const accountDetails = applyAccountDetailExceptionRules(
    sortCode,
    accountNumber,
    modulusWeight.exception
  );

  // apply weight and exception rules
  const weightValues = applyWeightValueExceptionRules(
    modulusWeight,
    accountDetails
  );
  const { modifiedAccountDetails, overwriteResult } =
    applyOverwriteExceptionRules(modulusWeight, accountDetails, sortCode);

  if (overwriteResult !== null) return overwriteResult;

  // Helper function to perform the modulus check
  const performCheck = (detailsToCheck: string, weights: number[]): boolean => {
    // multiply each digit of the account details by the corresponding weight value
    const multiplicationResultArray = detailsToCheck
      .split('')
      .map((digit, index) => parseInt(digit, 10) * weights[index]);

    // calculate total based on the check type
    let total: number;
    if (modulusWeight.check_type == CheckType.DBLAL) {
      total = multiplicationResultArray
        .map((num) => num.toString())
        .join('')
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
    } else {
      total = multiplicationResultArray.reduce((acc, curr) => acc + curr, 0);
    }

    // apply post-total exception rules
    const { adjustedTotal, postTotalOverwriteResult } =
      applyPostTotalExceptionRules(
        modulusWeight.exception,
        total,
        detailsToCheck,
        modulusWeight.check_type
      );
    if (postTotalOverwriteResult !== null) return postTotalOverwriteResult;

    // Perform final modulus check
    const modulusValue = modulusWeight.check_type === CheckType.MOD11 ? 11 : 10;
    return adjustedTotal % modulusValue === 0;
  };

  // First stage: try with modified account details (or original if no modification)
  if (performCheck(modifiedAccountDetails, weightValues)) {
    return true;
  }

  // Exception 14: two-stage check - if first check fails, try with position 6 modified to 7
  if (modulusWeight.exception === 14) {
    const fallbackDetails =
      accountDetails.slice(0, 6) + '7' + accountDetails.slice(7);
    if (performCheck(fallbackDetails, weightValues)) {
      return true;
    }
  }

  return false;
};

// Validate input format
const validateInput = (sortCode: string, accountNumber: string): boolean => {
  // sort code must be 6 digits, account number must be between 6 and 10 digits
  if (
    accountNumber.length <= 6 ||
    accountNumber.length >= 10 ||
    sortCode.length !== 6
  ) {
    return false;
  }

  // sort code and account number must be numeric
  return /^\d+$/.test(sortCode + accountNumber);
};

// Find matching modulus weights for a sort code
const findMatchingWeights = (sortCode: string): ModulusWeight[] => {
  const sortCodeNum = parseInt(sortCode, 10);
  return modulusWeightsArray.filter(
    (weight) =>
      weight.start &&
      weight.end &&
      sortCodeNum >= weight.start &&
      sortCodeNum <= weight.end
  ) as ModulusWeight[];
};

export function validateAccountDetails(
  sortCode: string,
  accountNumber: string
): boolean {
  // Validate input format
  if (!validateInput(sortCode, accountNumber)) {
    return false;
  }

  // Find matching modulus weights for this sort code
  const matchingModulusWeights = findMatchingWeights(sortCode);

  // If no matching weights, assume the sort code is valid by default
  if (!matchingModulusWeights.length) {
    return true;
  }

  // Exception 6: requires ALL checks to pass (both MOD11 and DBLAL)
  const hasException6 = matchingModulusWeights.some((w) => w.exception === 6);
  if (hasException6) {
    return matchingModulusWeights.every((weight) =>
      modulusCalculation(weight, sortCode, accountNumber)
    );
  }

  // Default: requires AT LEAST ONE check to pass (MOD11 OR DBLAL)
  // This applies to Exception 5 and other exceptions
  return matchingModulusWeights.some((weight) =>
    modulusCalculation(weight, sortCode, accountNumber)
  );
}
