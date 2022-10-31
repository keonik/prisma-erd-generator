#!/usr/bin/env node
import { generatorHandler } from '@prisma/generator-helper';
import generate from './generate';

const disabled = Boolean(process.env.DISABLE_ERD);

generatorHandler({
    onManifest: () => ({
        defaultOutput: disabled ? 'N/A' : 'ERD.svg',
        prettyName: disabled ? 'No ERD' : 'Entity-relationship-diagram',
        requiresEngines: ['queryEngine'],
        version: require('../package.json').version,
    }),
    onGenerate: generate,
});
