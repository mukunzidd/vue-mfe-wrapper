#!/usr/bin/env node

import { Command } from 'commander'
import { create } from './commands/create'
import { importFeatures } from './commands/import'

const program = new Command()

program
  .name('@mknz/vue-mfe-wrapper')
  .description('CLI for managing Vue.js micro-frontend projects')
  .version('0.1.0')

program
  .command('create <project-name>')
  .description('Create a new Vue.js project with MFE wrapper')
  .action(create)

program
  .command('import')
  .description('Import micro-frontend features')
  .argument('<features...>', 'Feature names to import (space-separated)')
  .action(importFeatures)

program.parse()
