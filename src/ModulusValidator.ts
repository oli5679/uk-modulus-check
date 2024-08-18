import {readFileSync} from 'fs';

import { ModulusWeight, ModCheck, AccountDetailIndexes} from './interfaces';

export const getWeightValues = (modulusWeight: ModulusWeight, accountDetails: string): number[] => {
  let weightings = modulusWeight.weights;
  const ab = accountDetails.slice(AccountDetailIndexes.a, AccountDetailIndexes.b+1);
  if ((modulusWeight.exception == 7) ||((modulusWeight.exception == 10) && (['09', '99'].includes(ab))) ){
    if(accountDetails[AccountDetailIndexes.g] === '9'){ 
      for (let i = 0; i < AccountDetailIndexes.b+1; i++){
        weightings[i] = 0;
      }      
    }
  }
  if (modulusWeight.exception === 2) {
    const a = accountDetails[AccountDetailIndexes.a];
    const g = accountDetails[AccountDetailIndexes.g];
    if (a !== '0' && g !== '9') {
      weightings = [0, 0, 1, 2, 5, 3, 6, 4, 8, 7, 10, 9, 3, 1];
    } else if (a !== '0' && g === '9') {
      weightings = [0, 0, 0, 0, 0, 0, 0, 0, 8, 7, 10, 9, 3, 1];
    }
  }
  return weightings;
}


export default class ModulusValidator {
  private substitutionMap: { [key: string]: string };
  private modulusWeighstArray:  ModulusWeight[];

  constructor() {
    this.substitutionMap = this.loadSubstitutionMap();
    this.modulusWeighstArray = this.loadModulusWeightsArray();
  }

  modulusCheck = (modulusWeight: ModulusWeight, sortCode: string, accountNumber: string): boolean => {
    let accountDetails = this.combineAccountDetails(sortCode, accountNumber, modulusWeight.exception);
    const weightValues = getWeightValues(modulusWeight, accountDetails);
    const ab = accountDetails.slice(AccountDetailIndexes.a, AccountDetailIndexes.b+1);
    const g = parseInt(accountDetails[AccountDetailIndexes.g], 10);
    const h = parseInt(accountDetails[AccountDetailIndexes.h], 10);
  
    const aValue = accountDetails[AccountDetailIndexes.a];
  
    // exception 3 is a special case where the first digit of the account number must be 1 or 9
    if (modulusWeight.exception === 3 && (['1','9'].includes(aValue))){ 
      return true;
    }
  
    // exception 6 is a special case where the first digit of the account number must be between 4 and 10 and the 7th and 8th digits must be the same
    if (modulusWeight.exception === 6 && (parseInt(aValue,10) >= 4) && (parseInt(aValue,10) <= 10) && (accountDetails[AccountDetailIndexes.g]=== accountDetails[AccountDetailIndexes.h])) {
      return true;
    }
    if (modulusWeight.exception === 14){

      if (!['0', '1', '9'].includes(accountDetails[AccountDetailIndexes.h])){
        return false;
      }
      const sortCode = accountDetails.slice(0, 6);
      const accountNumber = accountDetails.slice(6, -1);
      accountDetails = sortCode + '0' + accountNumber;
    }

    const multiplicationResultArray: number[] = [];
    accountDetails.split('').forEach((digit, index) => {
      const digitInteger = parseInt(digit, 10);
      multiplicationResultArray.push(digitInteger * weightValues[index]);
    })

  
    if (modulusWeight.mod != ModCheck.DBLAL) {
      let total = multiplicationResultArray.reduce((acc, curr) => acc + curr, 0);
      // exception 1 is a special case where the total is incremented by 27
      if (modulusWeight.exception == 1){
        total += 27;
      }
      if (modulusWeight.exception == 4){
        const remainder = total % 11;
        const checkDigit = parseInt(accountNumber.substring(accountNumber.length - 2), 10);
        if (remainder === checkDigit){
          return true;
        }
      }
      if (modulusWeight.exception == 5) {
        const remainder = total % 11;
        if ((remainder === 0 && g === 0) || (remainder !== 1 && 11 - remainder === g)) {
            return true;
        }
        return false;
      }

      if (modulusWeight.mod === ModCheck.MOD10){
        return total % 10 === 0;
      }
      else if (modulusWeight.mod === ModCheck.MOD11){
        return total % 11 === 0;
      }
      else {
        // should never reach this point given the enum
        return false;
      }
    }
    // this case has a different treatment of 2 digit values --> 18 becomes 1 + 8
    if (modulusWeight.mod === ModCheck.DBLAL) {
      // sum the individual digits of the string
      let total = multiplicationResultArray
        .map(num => num.toString())
        .join('')
        .split('')
        .reduce((acc, digit) => acc + parseInt(digit, 10), 0);
      // exception 1 is a special case where the total is incremented by 27
      if (modulusWeight.exception == 1){
        total += 27;
      }
      return total % 10 === 0;
    }
      // should never reach this point given the enum
      return false;
    }

  getSortCodeWeights(sortCode: string): ModulusWeight[] {
    const matchingWeights: ModulusWeight[] = [];
    const sortCodeInt = parseInt(sortCode, 10);
    for (const weight of this.modulusWeighstArray) {
      if (sortCodeInt >= weight.start && sortCodeInt <= weight.end) {
        matchingWeights.push(weight);
      }
    }
    return matchingWeights; 
  }

  combineAccountDetails = (sortCode: string, accountNumber: string, modulusWeightException: number | null) => {
    let accountCodeAdjusted = accountNumber;
    let sortCodeAdjusted = sortCode;
    // if exception 5 is present, substitute the sort code if its a key in the substitution map
    if (modulusWeightException === 5 && this.substitutionMap[sortCode]){
      sortCodeAdjusted = this.substitutionMap[sortCode];
    }
    if (modulusWeightException === 8){
      sortCodeAdjusted = '090126';
    }  
    if (modulusWeightException === 9){
      sortCodeAdjusted = '309634';
    }

    // prefix 6 digit account numbers with two zeros
    if (accountNumber.length === 6) {
      accountCodeAdjusted = '00' + accountNumber;
    }
    // prefix 7 digit account numbers with one zero
    if (accountNumber.length === 7) {
      accountCodeAdjusted = '0' + accountNumber;
    }

    // Nine digit account numbers
    // Replace the last digit of the sorting code with the first digit of the account number, then usethe last eight digits of the account number
  
    if (accountNumber.length === 9) {
      sortCodeAdjusted = sortCode.slice(0, -1) + accountNumber[0];
      accountCodeAdjusted = accountNumber.slice(1);
    }
  
    // Ten digit account numbers
    // use the first eight digits only 
    // Todo add alterative logic for "National Westminster Bank plc"
    if (accountNumber.length === 10) {
      accountCodeAdjusted = accountNumber.slice(0, 8);
    }
    return sortCodeAdjusted + accountCodeAdjusted;
  }


  isValid(sortCode: string, accountNumber: string): boolean {
    // sort code must be 6 digits and account number must be between 6 and 10 digits
    if (accountNumber.length < 6 || accountNumber.length > 10 || sortCode.length !== 6) {
      return false;
    }

    // check if there are any non-numeric characters in the sort code or account number
    if (!/^\d+$/.test(sortCode) || !/^\d+$/.test(accountNumber)) {
      return false;
    }
    
    const matchingModulusWeights = this.getSortCodeWeights(sortCode);
    // there must be at least one matching modulus weight
    if (!matchingModulusWeights.length) {
      return false;
    }

    // use the first matching modulus weight to check the account number
    const firstModulusWeight = matchingModulusWeights[0];
    const firstModulusCheck = this.modulusCheck(firstModulusWeight, sortCode, accountNumber);
    if ((firstModulusCheck)){
      return true;
    }
    if ((firstModulusWeight.exception === null) || (matchingModulusWeights.length == 1)  ){
      return false;
    }
    else {
      return this.modulusCheck(matchingModulusWeights[1], sortCode, accountNumber);
    }
  }

  private loadSubstitutionMap(): { [key: string]: string } {
    const content = readFileSync(`${__dirname}/data/scsubtab.txt`, 'utf8');
    const substitutionMap: { [key: string]: string } = {};

    content.split('\r\n').forEach((line) => {
      const data = line.split(/\s+/);
      substitutionMap[data[0]] = data[1]
    });
    return substitutionMap;
  }

  private loadModulusWeightsArray():  ModulusWeight[] {
    const content = readFileSync(`${__dirname}/data/valacdos-v7-90.txt`, 'utf8');
    const modulusWeightArray: ModulusWeight[] = [];

    content.split('\r\n').forEach((line) => {
      const data = line.split(/\s+/);
      modulusWeightArray.push({
        start: parseInt(data[0], 10),
        end: parseInt(data[1], 10),
        mod: data[2] as ModCheck,
        exception: parseInt(data[17], 10) || null,
        weights: data.slice(3, 17).map((weight) => parseInt(weight, 10)),
      });
    });
    return modulusWeightArray;
}

}

