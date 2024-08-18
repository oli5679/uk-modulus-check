import { readFileSync } from 'fs';
import { CheckType } from './enums';
import { ModulusWeight } from './interfaces';

const loadSubstitutionMap = (): { [key: string]: string } =>
  readFileSync(`${__dirname}/data/scsubtab.txt`, 'utf8')
    .split('\r\n')
    .map((line) => line.split(/\s+/))
    .reduce((acc, [key, value]) => ({ ...acc, [key]: value }), {});

const loadModulusWeights = (): ModulusWeight[] => {
  return readFileSync(`${__dirname}/data/valacdos-v7-90.txt`, 'utf8')
    .split('\r\n')
    .map((line) => {
      const data = line.split(/\s+/);
      return {
        start: parseInt(data[0], 10),
        end: parseInt(data[1], 10),
        check_type: data[2] as CheckType,
        exception: parseInt(data[17], 10) || null,
        weights: data.slice(3, 17).map((weight) => parseInt(weight, 10)),
      };
    });
};

// we implement a cache here to avoid reading either file multiple times
const cachedModulusWeights: ModulusWeight[] | undefined = undefined;
const cachedSubstitutionMap: { [key: string]: string } | undefined = undefined;

export const fetchModulusWeights = () => {
  if (cachedModulusWeights) return cachedModulusWeights;
  return loadModulusWeights();
};

export const fetchSubstitutionMap = () => {
  if (cachedSubstitutionMap) return cachedSubstitutionMap;
  return loadSubstitutionMap();
};
