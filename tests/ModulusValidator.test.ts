import ModulusValidator from '../src/ModulusValidator';
import {ModulusWeight, ModCheck} from '../src/interfaces';


describe('modulusCheck', () => {
    let validator: ModulusValidator;

    beforeEach(() => {
      validator = new ModulusValidator();
    });
    test('example 1 from vocalink spect', () => {
        const exampleWeights: ModulusWeight = {
            start: 499272,
            end: 499273,
            mod: ModCheck.DBLAL,
            exception: null,
            weights: [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]
        }
        
        const result = validator.modulusCheck(
            exampleWeights,
            '499273',
            '12345678'
        );
        expect(result).toBe(true);
    }), 
    test('example 1 from vocalink spec with 1 increment', () => {
        const exampleWeights: ModulusWeight = {
            start: 499272,
            end: 499273,
            mod: ModCheck.DBLAL,
            exception: null,
            weights: [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1]
        }
        const result = validator.modulusCheck(
            exampleWeights,
            '499273',
            '1234569'
        );
        expect(result).toBe(false);
    });
    test('example 2 from vocalink spec', () => {
        const exampleWeights: ModulusWeight = {
            start: 0,
            end: 1,
            mod: ModCheck.MOD11,
            exception: null,
            weights: [0, 0, 0, 0, 0, 0, 7, 5, 8, 3, 4, 6, 2, 1]
        }
        const result = validator.modulusCheck(
            exampleWeights,
            '000000',
            '58177632'
        );
        expect(result).toBe(true);
    });
});

describe('combineAccountDetails', () => {
    let validator: ModulusValidator;

    beforeEach(() => {
      validator = new ModulusValidator();
    });

    test('8 digit case - simple concatenation', () => {
        const result = validator.combineAccountDetails('0000000', '12345678',0);
        expect(result).toBe('000000012345678');
    });
    test('10 digit case - remove final two digits', () => {
        const result = validator.combineAccountDetails('0000000', '1234567890',0);
        expect(result).toBe('000000012345678');
    });
    test('6 digit case - prepend two zeros to account', () => {
        const result = validator.combineAccountDetails('111111', '123456',0);
        expect(result).toBe('11111100123456');
    })
    test('7 digit case - prepend one zero to account', () => {
        const result = validator.combineAccountDetails('111111', '1234567',0);
        expect(result).toBe('11111101234567');
    });
    test('9 digit case - remove first digit from account but mutate sort code', () => {
        const result = validator.combineAccountDetails('000000', '123456789',0);
        expect(result).toBe('00000123456789');
    });
});

describe('ModulusValidator', () => {
  let validator: ModulusValidator;

  beforeEach(() => {
    validator = new ModulusValidator();
  });
  // these are custom tests
  test('should return false for a length 7 sort code', () => {
    const isValid = validator.isValid('1234567','12345678'); 
    expect(isValid).toBe(false);
  });

  test('should return false for a length 11 account number', () => {
    const isValid = validator.isValid( '000000','12345678910',);
    expect(isValid).toBe(false);
  });
  test('should return false for a non-numeric sort code', () => {
    const isValid = validator.isValid('12345a','12345678');
    expect(isValid).toBe(false);
  });

  // these are the tests from the vocalink spec

  // https://www.vocalink.com/media/a2febq5m/validating-account-numbers-uk-modulus-checking-v7-90.pdf

  test('1 Pass modulus 10 check', () => {
    const isValid = validator.isValid('089999', '66374958');
    expect(isValid).toBe(true);
  });


  test('2 Pass modulus 11 check', () => {
    const isValid = validator.isValid('107999', '88837491');
    expect(isValid).toBe(true);
  });

    test('3 Pass double alternate check', () => {
        const isValid = validator.isValid('202959', '63748472');
        expect(isValid).toBe(true);
    });
    
    test('4 Exception 10 & 11 where first check passes and second check fails.', () => {
        const isValid = validator.isValid('871427', '46238510');
        expect(isValid).toBe(true);
    });
    
    test('5 Exception 10 & 11 where first check fails and second check passes.', () => {
        const isValid = validator.isValid('872427', '46238510');
        expect(isValid).toBe(true);
    });
    
    test('6 Exception 10 where in the account number ab=09 and the g=9. The first check passes and second check fails.', () => {
        const isValid = validator.isValid('871427', '09123496');
        expect(isValid).toBe(true);
    });
    
    test('7 Exception 10 where in the account number ab=99 and the g=9. The first check passes and the second check fails', () => {
        const isValid = validator.isValid('871427', '99123496');
        expect(isValid).toBe(true);
    });

    test('8 Exception 3, and the sorting code is the start of a range. As c=6 the second check should be ignored.', () => {
        const isValid = validator.isValid('820000', '73688637');
        expect(isValid).toBe(true);
    });

    test('9 Exception 3, and the sorting code is the end of a range. As c=9 the second check should be ignored.', () => {
        const isValid = validator.isValid('827999', '73988638');
        expect(isValid).toBe(true);
    });

    test('10 Exception 3. As c<>6 or 9 perform both checks pass.', () => {
        const isValid = validator.isValid('827101', '28748352');
        expect(isValid).toBe(true);
    });

    test('11 Exception 4 where the remainder is equal to the checkdigit.', () => {
        const isValid = validator.isValid('134020', '63849203');
        expect(isValid).toBe(true);
    });

    test('12 Exception 1 – ensures that 27 has been added to the accumulated total and passes double alternate modulus check.', () => {
        const isValid = validator.isValid('118765', '64371389');
        expect(isValid).toBe(true);
    });

    test('13 Exception 6 where the account fails standard check but is a foreign currency account.', () => {
        const isValid = validator.isValid('200915', '41011166');
        expect(isValid).toBe(true);
    });
    // todo impement exception 5
    /*
    test('14 Exception 5 where the check passes' , () => {
        const isValid = validator.isValid('938611', '07806039');
        expect(isValid).toBe(true);
    });
    test('15 Exception 5 where the check passes with substitution.', () => {
        const isValid = validator.isValid('938600', '42368003');
        expect(isValid).toBe(true);
    });
    test('16 Exception 5 where both checks produce a remainder of 0 and pass.', () => {
        const isValid = validator.isValid('938063', '55065200');
        expect(isValid).toBe(true);
    });
    */
    
   test('17 Exception 7 where the check passes.', () => {
    const isValid = validator.isValid('772798', '99345694');
    expect(isValid).toBe(true);
   });

   test('18 Exception 8 where the check passes.', () => {
    const isValid = validator.isValid('086090', '06774744');
    expect(isValid).toBe(true);
   });

   test('19 Exception 2 & 9 where the first check passes.', () => {
    const isValid = validator.isValid('309070', '02355688');
    expect(isValid).toBe(true);
   });

   /*
    test('20 Exception 2 & 9 where the first check fails and second check passes with substitution.', () => {
     const isValid = validator.isValid('309070', '12345668');
     expect(isValid).toBe(true);
    });
    
    test('21 Exception 2 & 9 where a≠0 and g≠9 and passes.', () => {
     const isValid = validator.isValid('309070', '12345677');
     expect(isValid).toBe(true);
    });

    test('22 Exception 2 & 9 where a≠0 and g=9 and passes.', () => {
     const isValid = validator.isValid('309070', '99345694');
     expect(isValid).toBe(true);
    });
    */
        /*
    todo implement exception 5
    test('23 Exception 5 where the first checkdigit is correct and the second incorrect.', () => {
        const isValid = validator.isValid('938063', '15764273');
        expect(isValid).toBe(false);
    });
    
    test('24 Exception 5 where the first checkdigit is incorrect and the second correct.', () => {
        const isValid = validator.isValid('938063', '15764264');
        expect(isValid).toBe(false);
    });
    test('25 Exception 5 where the first checkdigit is incorrect with a remainder of 1.', () => {
        const isValid = validator.isValid('938063', '15763217');
        expect(isValid).toBe(false);
    });
    */
     test('26 Exception 1 where it fails double alternate check.', () => {
        const isValid = validator.isValid('118765', '64371388');
        expect(isValid).toBe(false);
     });
    /*
     test('27 Pass modulus 11 check and fail double alternate check.', () => {
        const isValid = validator.isValid('203099', '66831036');
        expect(isValid).toBe(false);
    });
    */
    test('28 Fail modulus 11 check and pass double alternate check.', () => {
        const isValid = validator.isValid('203099', '58716970');
        expect(isValid).toBe(false);
    });
    
    test('29 Fail modulus 10 check.', () => {
        const isValid = validator.isValid('089999', '66374959');
        expect(isValid).toBe(false);
    });
    test('30 Fail modulus 11 check.', () => {
        const isValid = validator.isValid('107999', '88837493');
        expect(isValid).toBe(false);
    });
    test('31 Exception 12/13 where passes modulus 11 check.', () => {
        const isValid = validator.isValid('074456', '12345112');
        expect(isValid).toBe(true);
    });
    
    test('32 Exception 12/13 where passes the modulus 11check.', () => {
        const isValid = validator.isValid('070116', '34012583');
        expect(isValid).toBe(true);
    });
   test('33 Exception 12/13 where fails the modulus 11 check, but passes the modulus 10 check.', () => {
    const isValid = validator.isValid('074456', '11104102');
    expect(isValid).toBe(true);
   });
   
    test('34 Exception 14 where the first check fails and the second check passes.', () => {
     const isValid = validator.isValid('180002', '00000190');
     expect(isValid).toBe(true);
    });

});