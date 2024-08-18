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
import ModulusChecker from "uk-modulus-check";

const checker = new ModulusChecker();

console.log(checker.validate('180002', '00000190')); // true
console.log(checker.validate('938063', '15763217')); // false
```

## Details

[This](https://www.vocalink.com/media/a2febq5m/validating-account-numbers-uk-modulus-checking-v7-90.pdf) specification details logic to differentiate valid vs. invalid pairs of sort-code and account number. 

A mathematical algorithm compares the two values, and check if the two can be paired together legitimately.

[This](https://www.vocalink.com/tools/modulus-checking/) page details any changes to the specification.

## Technicalities

In general, I tried to minimise risk of returning `false` for a valid bank account.

1. if an account has an unseen sort code (not covered by any range in src/data/valacdos), by default, any combination of sort-code and account number will be considered valid. This is altered by instantiating a check with `ModulusChecker(false)` and then default behaviour will be set to false

2. I find the specification a bit confusing for some examples, specifically when 2 checks are run on the same account. I mark the account as valid if either of the two validations pass, for cases where multiple validations are provided for the same account. The specific test-cases in listest examples are 23, 27, 28. 

Both (1) and (2) might lead to a small % of 'false positives'. 

## License

MIT

## Credits

Thanks to [uphold/uk-modulus-checking](https://github.com/uphold/uk-modulus-checking) for creating a good Javascript implementation. 

It doesn't seem to have been updated since valacdos-v640 (12/10/2020), which motivates the creation of this package.



