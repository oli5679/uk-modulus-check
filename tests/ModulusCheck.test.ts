import ModulusChecker from '../src/UKModulusCheck';
import { applyAccountDetailExceptionRules } from '../src/ExceptionRules';
import { ModulusWeight } from '../src/interfaces';
import { CheckType } from '../src/constants';

describe('ModulusChecker', () => {
    let checker: ModulusChecker;

    beforeEach(() => {
        checker = new ModulusChecker();
    });

    describe('modulusCheck', () => {
        const exampleWeights: ModulusWeight = {
            start: 499272,
            end: 499273,
            check_type: CheckType.DBLAL,
            exception: null,
            weights: [2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1, 2, 1],
        };

        test('should pass example 1 from Vocalink spec', () => {
            const result = checker.modulusCheck(exampleWeights, '499273', '12345678');
            expect(result).toBe(true);
        });

        test('should fail example 1 from Vocalink spec with 1 increment', () => {
            const result = checker.modulusCheck(exampleWeights, '499273', '1234569');
            expect(result).toBe(false);
        });

        test('should pass example 2 from Vocalink spec', () => {
            const exampleWeights: ModulusWeight = {
                start: 0,
                end: 1,
                check_type: CheckType.MOD11,
                exception: null,
                weights: [0, 0, 0, 0, 0, 0, 7, 5, 8, 3, 4, 6, 2, 1],
            };
            const result = checker.modulusCheck(exampleWeights, '000000', '58177632');
            expect(result).toBe(true);
        });
    });

    describe('isValid', () => {
        // Custom tests
        test('should return false for a length 7 sort code', () => {
            const isValid = checker.validate('1234567', '12345678');
            expect(isValid).toBe(false);
        });

        test('should return false for a length 11 account number', () => {
            const isValid = checker.validate('000000', '12345678910');
            expect(isValid).toBe(false);
        });

        test('should return false for a non-numeric sort code', () => {
            const isValid = checker.validate('12345a', '12345678');
            expect(isValid).toBe(false);
        });

        // Vocalink spec tests
        const vocalinkSpecTests = [
            { sortCode: '089999', accountNumber: '66374958', expectedResult: true },
            { sortCode: '107999', accountNumber: '88837491', expectedResult: true },
            { sortCode: '202959', accountNumber: '63748472', expectedResult: true },
            { sortCode: '871427', accountNumber: '46238510', expectedResult: true },
            { sortCode: '872427', accountNumber: '46238510', expectedResult: true },
            { sortCode: '871427', accountNumber: '09123496', expectedResult: true },
            { sortCode: '871427', accountNumber: '99123496', expectedResult: true },
            { sortCode: '820000', accountNumber: '73688637', expectedResult: true },
            { sortCode: '827999', accountNumber: '73988638', expectedResult: true },
            { sortCode: '827101', accountNumber: '28748352', expectedResult: true },
            { sortCode: '134020', accountNumber: '63849203', expectedResult: true },
            { sortCode: '118765', accountNumber: '64371389', expectedResult: true },
            { sortCode: '200915', accountNumber: '41011166', expectedResult: true },
            { sortCode: '938611', accountNumber: '07806039', expectedResult: true },
            { sortCode: '938600', accountNumber: '42368003', expectedResult: true },
            { sortCode: '938063', accountNumber: '55065200', expectedResult: true },
            { sortCode: '772798', accountNumber: '99345694', expectedResult: true },
            { sortCode: '086090', accountNumber: '06774744', expectedResult: true },
            { sortCode: '309070', accountNumber: '02355688', expectedResult: true },
            { sortCode: '309070', accountNumber: '12345668', expectedResult: true },
            { sortCode: '309070', accountNumber: '12345677', expectedResult: true },
            { sortCode: '309070', accountNumber: '99345694', expectedResult: true },
            { sortCode: '938063', accountNumber: '15764264', expectedResult: false },
            { sortCode: '938063', accountNumber: '15763217', expectedResult: false },
            { sortCode: '118765', accountNumber: '64371388', expectedResult: false },
            { sortCode: '089999', accountNumber: '66374959', expectedResult: false },
            { sortCode: '107999', accountNumber: '88837493', expectedResult: false },
            { sortCode: '074456', accountNumber: '12345112', expectedResult: true },
            { sortCode: '070116', accountNumber: '34012583', expectedResult: true },
            { sortCode: '074456', accountNumber: '11104102', expectedResult: true },
            { sortCode: '180002', accountNumber: '00000190', expectedResult: true },
        ];

        vocalinkSpecTests.forEach(({ sortCode, accountNumber, expectedResult }, index) => {
            test(`Vocalink spec test ${index + 1}`, () => {
                const isValid = checker.validate(sortCode, accountNumber);
                expect(isValid).toBe(expectedResult);
            });
        });
    });
});

describe('applyAccountDetailExceptionRules', () => {
    const exceptionRuleTests = [
        { sortCode: '0000000', accountNumber: '12345678', exception: 0, expected: '000000012345678' },
        { sortCode: '0000000', accountNumber: '1234567890', exception: 0, expected: '000000012345678' },
        { sortCode: '111111', accountNumber: '123456', exception: 0, expected: '11111100123456' },
        { sortCode: '111111', accountNumber: '1234567', exception: 0, expected: '11111101234567' },
        { sortCode: '000000', accountNumber: '123456789', exception: 0, expected: '00000123456789' },
    ];

    exceptionRuleTests.forEach(({ sortCode, accountNumber, exception, expected }, index) => {
        test(`Exception rule test ${index + 1}`, () => {
            const result = applyAccountDetailExceptionRules(sortCode, accountNumber, exception);
            expect(result).toBe(expected);
        });
    });
});