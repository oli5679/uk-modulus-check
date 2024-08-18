# UKModulusCheck

## Overview

TypeScript class that validates UK bank account details using the modulus checking algorithm. 

It only users vanilla typescript, and the 'fs' file-loading library. 

From time to time, Vocalink updates the txt files here mapping sort-code ranges to validation weights. We currently use `v7-90` (valid from 17 August 2024). 

## Status

![Build Status](https://github.com/oli5679/uk-modulus-check/actions/workflows/ci.yml/badge.svg)

## Installation

```
npm install uk-modulus-check
```

## Usage
```
const ModulusChecker = require('uk-modulus-check');

const modulusChecker = new ModulusChecker();

console.log(modulusChecker.validate('180002', '00000190')); // true

console.log(modulusChecker.validate('938063', '15763217')); // false
```


## Details

[This](https://www.vocalink.com/media/a2febq5m/validating-account-numbers-uk-modulus-checking-v7-90.pdf) specification details logic to differentiate valid vs. invalid pairs of sort-code and account number. 

A mathematical algorithm compares the two values, and check if the two can be paired together legitimately.

[This](https://www.vocalink.com/tools/modulus-checking/) page details any changes to the specification.


## License

MIT

## Credits

Many thanks to [bazerk/uk-modulus-checking](https://github.com/bazerk/uk-modulus-checking) for inspiration (Python)

Also thanks to [uphold/uk-modulus-checking](https://github.com/uphold/uk-modulus-checking) for creating a good Javascript implementation. It doesn't seem to be updated since valacdos-v640 (12/10/2020), which motivates the creation of this package



