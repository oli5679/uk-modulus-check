# UKModulusCheck

## Overview

TypeScript class that validates UK bank account details using the modulus checking algorithm. 

It only uses vanilla typescript, and can be used on the frontend.

Vocalink periodically updates the txt files here mapping sort-code ranges to validation weights. We currently use `v8-50` (valid from 23 June 2025). 

## Status

![Build Status](https://github.com/oli5679/uk-modulus-check/actions/workflows/ci.yml/badge.svg)

## Installation

```
npm install uk-modulus-check
```

See [here](https://www.npmjs.com/package/uk-modulus-check) for the NPM package.

## Usage


```
import {validateAccountDetails} from "uk-modulus-check";


console.log(validateAccountDetails('180002', '00000190')); // true
console.log(validateAccountDetails('938063', '15763217')); // false
```

```
const {validateAccountDetails} = require("uk-modulus-check");

console.log(validateAccountDetails('180002', '00000190')); // true
console.log(validateAccountDetails('938063', '15763217')); // false
```

## Details

[This](https://www.vocalink.com/media/e3dlebpm/validating-account-numbers-uk-modulus-checking-v8-50.pdf) specification details logic to differentiate valid vs. invalid pairs of sort-code and account number. 

A mathematical algorithm compares the two values, and check if the two can be paired together legitimately.

[This](https://www.vocalink.com/tools/modulus-checking/) page details any changes to the specification.

## sort codes not in spec

If an account has an unseen sort code (not covered by any range in src/data/valacdos), any combination of sort-code and account number will be considered valid. This is because the Vocalink data doesn't seem to have 100% coverage. This might lead to a small % of 'false positives'. 

## License

MIT

## Credits

Thanks to [uphold/uk-modulus-checking](https://github.com/uphold/uk-modulus-checking) for creating a good Javascript implementation. 

It doesn't seem to have been updated since valacdos-v640 (12/10/2020), and I'm not sure it can be used directly in the frontend given 'fs' dependency, which motivates the creation of this package.



