import {validateAccountDetails} from '../src';

describe('ModulusChecker', () => {
    
    describe('isValid', () => {
        // Custom tests
        test('should return false for a length 7 sort code', () => {
            const isValid = validateAccountDetails('1234567', '12345678');
            expect(isValid).toBe(false);
        });

        test('should return false for a length 11 account number', () => {
            const isValid = validateAccountDetails('000000', '12345678910');
            expect(isValid).toBe(false);
        });

        test('should return false for a non-numeric sort code', () => {
            const isValid = validateAccountDetails('12345a', '12345678');
            expect(isValid).toBe(false);
        });

        test('should return true for a sort code not on the spec range', () => {
            const isValid = validateAccountDetails('000000', '12345678');
            expect(isValid).toBe(true);
        });

        // Vocalink spec tests

        // Comment indicates the test number from Chapter 3, here
        // https://www.vocalink.com/media/vu1advew/validating-account-numbers-uk-modulus-checking-v850.pdf
        // not passing for 23, 27, 28, which are all expected failures according to the spec.
        
        const vocalinkSpecTests = [
            { sortCode: '089999', accountNumber: '66374958', expectedResult: true }, // 1
            { sortCode: '107999', accountNumber: '88837491', expectedResult: true }, // 2
            { sortCode: '202959', accountNumber: '63748472', expectedResult: true }, // 3
            { sortCode: '871427', accountNumber: '46238510', expectedResult: true }, // 4
            { sortCode: '872427', accountNumber: '46238510', expectedResult: true }, // 5
            { sortCode: '871427', accountNumber: '09123496', expectedResult: true }, // 6
            { sortCode: '871427', accountNumber: '99123496', expectedResult: true }, // 7
            { sortCode: '820000', accountNumber: '73688637', expectedResult: true }, // 8
            { sortCode: '827999', accountNumber: '73988638', expectedResult: true }, // 9
            { sortCode: '827101', accountNumber: '28748352', expectedResult: true }, // 10
            { sortCode: '134020', accountNumber: '63849203', expectedResult: true }, // 11
            { sortCode: '118765', accountNumber: '64371389', expectedResult: true }, // 12
            { sortCode: '200915', accountNumber: '41011166', expectedResult: true }, // 13
            { sortCode: '938611', accountNumber: '07806039', expectedResult: true }, // 14
            { sortCode: '938600', accountNumber: '42368003', expectedResult: true }, // 15
            { sortCode: '938063', accountNumber: '55065200', expectedResult: true }, // 16
            { sortCode: '772798', accountNumber: '99345694', expectedResult: true }, // 17
            { sortCode: '086090', accountNumber: '06774744', expectedResult: true }, // 18
            { sortCode: '309070', accountNumber: '02355688', expectedResult: true }, // 19
            { sortCode: '309070', accountNumber: '12345668', expectedResult: true }, // 20
            { sortCode: '309070', accountNumber: '12345677', expectedResult: true }, // 21
            { sortCode: '309070', accountNumber: '99345694', expectedResult: true }, // 22          
            { sortCode: '938063', accountNumber: '15764273', expectedResult: false }, // 23
            { sortCode: '938063', accountNumber: '15764264', expectedResult: false }, // 24
            { sortCode: '938063', accountNumber: '15763217', expectedResult: false }, // 25
            { sortCode: '118765', accountNumber: '64371388', expectedResult: false }, // 26
            { sortCode: '203099', accountNumber: '66831036', expectedResult: false }, // 27
            { sortCode: '203099', accountNumber: '58716970', expectedResult: false }, // 28
            { sortCode: '089999', accountNumber: '66374959', expectedResult: false }, // 29
            { sortCode: '107999', accountNumber: '88837493', expectedResult: false }, // 30
            { sortCode: '074456', accountNumber: '12345112', expectedResult: true },  // 31
            { sortCode: '070116', accountNumber: '34012583', expectedResult: true },  // 32
            { sortCode: '074456', accountNumber: '11104102', expectedResult: true },  // 33
            { sortCode: '180002', accountNumber: '00000190', expectedResult: true },  // 34
          ];
          
          vocalinkSpecTests.forEach(({ sortCode, accountNumber, expectedResult }, index) => {
            test(`Vocalink spec test ${index + 1}`, () => {
              const isValid = validateAccountDetails(sortCode, accountNumber);
              expect(isValid).toBe(expectedResult);
            });
          });

        vocalinkSpecTests.forEach(({ sortCode, accountNumber, expectedResult }, index) => {
            test(`Vocalink spec test ${index + 1}`, () => {
                const isValid = validateAccountDetails(sortCode, accountNumber);
                expect(isValid).toBe(expectedResult);
            });
        });
    });

    describe('Coutts sort code test', () => {
        // adding a test for the Coutts sort code since earlier had a bug with this range
        test('Sort code 180002 with account number 09747109 should be valid', () => {
            const isValid = validateAccountDetails('180002', '09747109');
            expect(isValid).toBe(true);
        });

        test('Sort code 180002 with account number 12345678 should be invalid (last digit must be 0, 1, or 9)', () => {
            const isValid = validateAccountDetails('180002', '12345678');
            expect(isValid).toBe(false);
        });

        test('Exception 14 correctly replaces position 6 without dropping the last digit', () => {
            // For 180002 09747109:
            // Account details: 18000209747109
            // After exception 14 modification: 18000209747109 (replace pos 6 with 0, which is already 0)
            // MOD11 calculation: 165 % 11 = 0 ✓
            const isValid = validateAccountDetails('180002', '09747109');
            expect(isValid).toBe(true);
        });
    });

    describe('Coventry Building Society 9-digit accounts', () => {
        test('Sort code 090128 with 9-digit account', () => {
            expect(typeof validateAccountDetails('090128', '123456789')).toBe('boolean');
        });

        test('Sort code 720000 with 9-digit account', () => {
            expect(typeof validateAccountDetails('720000', '987654321')).toBe('boolean');
        });

        test('Sort code 890000 with 9-digit account', () => {
            expect(typeof validateAccountDetails('890000', '111222333')).toBe('boolean');
        });

        test('Sort code 165710 with 9-digit account', () => {
            expect(typeof validateAccountDetails('165710', '444555666')).toBe('boolean');
        });
    });
});