import { readFileSync, writeFileSync } from 'fs';

const processSubstitutionMap = () =>
  {
    const scsubtab = readFileSync(`${__dirname}/data/scsubtab.txt`, 'utf8')
      .split('\r\n')
      .map((line) => line.split(/\s+/))
      .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

    writeFileSync(`${__dirname}/data/scsubtab.json`, JSON.stringify(scsubtab, null, 2));
    
  };

const processModulusWeights = () => {
  const valacdos =  readFileSync(`${__dirname}/data/valacdos-v7-90.txt`, 'utf8')
    .split('\r\n')
    .map((line) => {
      const data = line.split(/\s+/);
      return {
        start: parseInt(data[0], 10),
        end: parseInt(data[1], 10),
        check_type: data[2],
        exception: parseInt(data[17], 10) || null,
        weights: data.slice(3, 17).map((weight) => parseInt(weight, 10)),
      };
    });

  writeFileSync(`${__dirname}/data/valacdos.json`, JSON.stringify(valacdos, null, 2));
};


processSubstitutionMap();
processModulusWeights();