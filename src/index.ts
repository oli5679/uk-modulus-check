import { readFileSync } from 'fs';
import { ModulusWeight } from './interfaces';
import { CheckType } from './enums';
import { z } from 'zod';
import {
  applyAccountDetailExceptionRules,
  applyWeightValueExceptionRules,
  applyOverwriteExceptionRules,
  applyPostTotalExceptionRules,
} from './ExceptionRules';
import { fetchModulusWeights } from './dataLoader';

export default class ModulusChecker {
  private modulusWeighstArray: ModulusWeight[];
  private unseenSortCodeBehaviour: boolean = true;
  constructor(unseenSortCodeBehaviour: boolean = true) {
    this.modulusWeighstArray = fetchModulusWeights();
    this.unseenSortCodeBehaviour = unseenSortCodeBehaviour;
  }

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

    // there are acceptions that are applied after the total has been calculated
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
    // sort code must be 6 digits and account number must be between 6 and 10 digits
    if (
      accountNumber.length <= 6 ||
      accountNumber.length >= 10 ||
      sortCode.length !== 6
    )
      return false;

    // check if there are any non-numeric characters in the sort code or account number
    if (!/^\d+$/.test(sortCode + accountNumber)) return false;

    const matchingModulusWeights = this.modulusWeighstArray.filter(
      (weight) =>
        parseInt(sortCode, 10) >= weight.start &&
        parseInt(sortCode, 10) <= weight.end
    );
    // there must be at least one matching modulus weight, otherwise return the default behaviour
    if (!matchingModulusWeights.length) return this.unseenSortCodeBehaviour;

    // return true if any of the matching modulus weights pass the modulus
    // this includes the case where there are multiple matching modulus weights
    return matchingModulusWeights.some((weight) =>
      this.modulusCheck(weight, sortCode, accountNumber)
    );
  }
}
