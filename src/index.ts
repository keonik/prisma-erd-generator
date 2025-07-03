#!/usr/bin/env node
import { generatorHandler } from '@prisma/generator-helper'
import generate from './generate'

const disabled = process.env.DISABLE_ERD === 'true'

import { readFileSync } from 'fs';

let packageJsonData;
try {
    packageJsonData = JSON.parse(readFileSync('package.json', 'utf-8'));
} catch (e) {
    console.error(e);
    packageJsonData = { version: "1.0.0" };
}

generatorHandler({
    onManifest: () => ({
        defaultOutput: disabled ? 'N/A' : 'ERD.svg',
        prettyName: disabled ? 'No ERD' : 'Entity-relationship-diagram',
        requiresEngines: ['queryEngine'],
        version: packageJsonData?.version,
    }),
    onGenerate: generate,
})
