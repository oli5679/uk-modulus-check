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
    const { adjustedTotal, overwriteResult2 } = applyPostTotalExceptionRules(
      modulusWeight.exception,
      total,
      detailsToCheck
    );
    if (overwriteResult2 !== null) return overwriteResult2;

    const checkTypeValue = modulusWeight.check_type === CheckType.MOD11 ? 11 : 10;
    return adjustedTotal % checkTypeValue === 0;
  };

  // First stage: try with modified account details (or original if no modification)
  if (performCheck(modifiedAccountDetails, weightValues)) {
    return true;
  }

  // Exception 14: two-stage check - if first check fails, try with position 6 modified to 7
  // This is only for sort code 180002 (Coutts)
  if (modulusWeight.exception === 14 && parseInt(sortCode, 10) === 180002) {
    const fallbackDetails = accountDetails.slice(0, 6) + '7' + accountDetails.slice(7);
    if (performCheck(fallbackDetails, weightValues)) {
      return true;
    }
  }

  return false;
};

export function validateAccountDetails(
  sortCode: string,
  accountNumber: string
): boolean {
  // sort code must be 6 digits, account number must be between 6 and 10 digits
  if (
    accountNumber.length <= 6 ||
    accountNumber.length >= 10 ||
    sortCode.length !== 6
  )
    return false;

  // sort code and account number must be numeric
  if (!/^\d+$/.test(sortCode + accountNumber)) return false;

  // find the modulus weight that matches the sort code
  const matchingModulusWeights = modulusWeightsArray.filter(
    (weight) =>
      weight.start &&
      weight.end &&
      parseInt(sortCode, 10) >= weight.start &&
      parseInt(sortCode, 10) <= weight.end
  );

  // if no matching weights, assume the sort code is valid by default
  if (!matchingModulusWeights.length) return true;

  // check if any matching weight passes the modulus check
  return matchingModulusWeights.some((weight) =>
    modulusCalculation(weight as ModulusWeight, sortCode, accountNumber)
  );
}
