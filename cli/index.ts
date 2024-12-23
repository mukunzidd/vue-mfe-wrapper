#!/usr/bin/env node

import { createFeature } from './commands/create'
import { importFeatures } from './commands/import'
import { handleError } from './utils/errors'

const command = process.argv[2]
const args = process.argv.slice(3)

async function main() {
  try {
    switch (command) {
      case 'create':
        if (args.length !== 1) {
          throw new Error('Usage: vue-mfe create <feature-name>')
        }
        await createFeature(args[0])
        break

      case 'import':
        if (args.length === 0) {
          throw new Error('Usage: vue-mfe import <feature-name> [feature-name...]')
        }
        await importFeatures(args)
        break

      default:
        console.log(`
Vue MFE CLI

Usage:
  vue-mfe create <feature-name>     Create a new Vue MFE feature
  vue-mfe import <feature-name...>  Import Vue MFE features into your project

Example:
  vue-mfe create @mknz/vue-mfe-feature-c
  vue-mfe import @mknz/vue-mfe-feature-a @mknz/vue-mfe-feature-b
`)
        break
    }
  } catch (error) {
    handleError(error)
  }
}

main()
