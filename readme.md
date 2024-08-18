# UKModulusValidator

## Overview

ModulusValidator is a TypeScript class designed to validate UK bank account details using the modulus checking algorithm. 

It only using vanilla typescript, and the 'fs' file-loading library. 

From time to time, Vocalink updates the txt files here mapping sort-code ranges to validation weights. We currently use `v7-90` (valid from 17 August 2024). 
s
## Usage

```
import ModulusChecker from 'UKModulusCheck';

let checker = new ModulusCheck()

checker.validate({ sortCode:  '180002', accountNumber: '00000190'})
# true

checker.validate({ sortCode:  '938063', accountNumber: '15763217'})
# false
```
', accountNumber: '', expectedResult: true

## Installation

[todo add to npm and add]

## Details

[This](https://www.vocalink.com/media/a2febq5m/validating-account-numbers-uk-modulus-checking-v7-90.pdf) specification details logic to differentiate valid vs. invaid pairs of sort-code and account number. 

A mathematical algorithm compares the two values, and check if the two can be paired together legitimately.

[This](https://www.vocalink.com/tools/modulus-checking/) page details any changes to the specification.


## License

MIT

## Credits

Many thanks to bazerk/uk-modulus-checking for inspiration (Python)

Also thanks to uphold/uk-modulus-checking for creating a good Javascript implementation. It doesn't seem to be updated since valacdos-v640, which motivats the create (12/10/2020)

