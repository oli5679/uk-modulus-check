import { applyAccountDetailExceptionRules } from '../src/ExceptionRules';

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