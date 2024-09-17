import { ModulusWeight } from './interfaces';
import { CheckType } from './enums';
import {
  applyAccountDetailExceptionRules,
  applyWeightValueExceptionRules,
  applyOverwriteExceptionRules,
  applyPostTotalExceptionRules,
} from './ExceptionRules';
import modulusWeightsArray from './data/valacdos.json';

export default class ModulusChecker {
  modulusCheck = (
    modulusWeight: ModulusWeight,
    sortCode: string,
    accountNumber: string
  ): boolean => {
    // by default, the account details are the sort code followed by the account number
    // there are exceptions to this rule, which are handled in the applyAccountDetailExceptionRules function
    const accountDetails = applyAccountDetailExceptionRules(
      sortCode,
      accountNumber,
      modulusWeight.exception
    );

    // the default behaviour is to multiply and sum account details by the weight values and then carry out a modulus check
    // there are adjustments, where modulus check is skipped, or weights and account details are modified
    const weightValues = applyWeightValueExceptionRules(
      modulusWeight,
      accountDetails
    );
    const { modifiedAccountDetails, overwriteResult } =
      applyOverwriteExceptionRules(modulusWeight, accountDetails);
    if (overwriteResult !== null) return overwriteResult;

    // multiply each digit of the account details by the corresponding weight value
    const multiplicationResultArray = modifiedAccountDetails
      .split('')
      .map((digit, index) => parseInt(digit, 10) * weightValues[index]);

    // the total is calculated differently depending on DBLAL
    // in the case of DBLAL, the total is the sum of the digits of the multiplication result
    // e.g. 18 -> 1 + 8 = 9 rather than 18
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
    // there are exceptions that are applied after the total has been calculated
    // these can either adjust the total, or require a non-standard modulus check
    const { adjustedTotal, overwriteResult2 } = applyPostTotalExceptionRules(
      modulusWeight.exception,
      total,
      accountDetails
    );
    if (overwriteResult2 !== null) return overwriteResult2;
    const checkTypeValue =
      modulusWeight.check_type === CheckType.MOD11 ? 11 : 10;
    return adjustedTotal % checkTypeValue === 0;
  };

  validate(sortCode: string, accountNumber: string): boolean {
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
    // if there are no matching modulus weights, the sort code is not recognised
    // return true, since Vocalink data doesn't seem to have 100% coverage
    if (!matchingModulusWeights.length) return true;
    // if any of the matching modulus weights pass the modulus, the account number is valid
    // note, this is slightly conservative, and might return true for some invalid account numbers
    // find the actual spec. quite confusing on these cases
    return matchingModulusWeights.some((weight) =>
      this.modulusCheck(weight as ModulusWeight, sortCode, accountNumber)
    );
  }
}
