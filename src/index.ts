export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('boop');
  }
  return a + b;
};

import { generatorHandler } from '@prisma/generator-helper';
import generate from './generate';

generatorHandler({
  onManifest: () => ({
    defaultOutput: './ER_Diagram.png',
    prettyName: 'ER Diagram',
  }),
  onGenerate: generate,
});
