#!/usr/bin/env node
import { generatorHandler } from '@prisma/generator-helper';
import generate from './generate';

generatorHandler({
  onManifest: () => ({
    defaultOutput: 'ERD.svg',
    prettyName: 'Entity-relationship-diagram',
    requiresEngines: ['queryEngine'],
  }),
  onGenerate: generate,
});
