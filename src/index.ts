#!/usr/bin/env node
import { generatorHandler } from '@prisma/generator-helper'
import generate from './generate'

const disabled = process.env.DISABLE_ERD === 'true'

import { readFileSync } from 'fs';

const packageJsonPath = 'package.json';
const packageJsonData = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));

generatorHandler({
    onManifest: () => ({
        defaultOutput: disabled ? 'N/A' : 'ERD.svg',
        prettyName: disabled ? 'No ERD' : 'Entity-relationship-diagram',
        requiresEngines: ['queryEngine'],
        version: packageJsonData?.version,
    }),
    onGenerate: generate,
})
