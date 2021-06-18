#!/usr/bin/env node
import { generatorHandler } from '@prisma/generator-helper';
import generate from './generate';

generatorHandler({
  onManifest: () => ({
    defaultOutput: './ER_Diagram.png',
    prettyName: 'ER Diagram',
  }),
  onGenerate: generate,
});
