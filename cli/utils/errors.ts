import chalk from 'chalk'
import * as fs from 'fs'
import * as path from 'path'

export class CLIError extends Error {
  constructor(message: string, public exitCode: number = 1) {
    super(message)
    this.name = 'CLIError'
  }
}

export function handleError(error: unknown): never {
  if (error instanceof CLIError) {
    console.error(chalk.red(`Error: ${error.message}`))
    if (process.env.NODE_ENV === 'test') {
      throw error
    }
    process.exit(error.exitCode)
  }

  if (error instanceof Error) {
    console.error(chalk.red('An unexpected error occurred:'), error.message)
    if (process.env.DEBUG) {
      console.error(error.stack)
    }
    if (process.env.NODE_ENV === 'test') {
      throw error
    }
    process.exit(1)
  }

  console.error(chalk.red('An unknown error occurred'))
  if (process.env.NODE_ENV === 'test') {
    throw new Error('An unknown error occurred')
  }
  process.exit(1)
}

export function validateProjectName(name: string): void {
  if (!name) {
    throw new CLIError('Project name is required')
  }

  if (!/^[a-zA-Z0-9-_]+$/.test(name)) {
    throw new CLIError('Project name can only contain letters, numbers, hyphens, and underscores')
  }

  if (name.length > 214) {
    throw new CLIError('Project name is too long (maximum 214 characters)')
  }
}

export function validateFeatureName(name: string, supportedFeatures: string[]): void {
  if (!name) {
    throw new CLIError('Feature name is required')
  }

  if (!supportedFeatures.includes(name)) {
    throw new CLIError(
      `Feature "${name}" is not supported.\nSupported features: ${supportedFeatures.join(', ')}`
    )
  }
}

export function checkVueProject(): void {
  if (!fs.existsSync('package.json')) {
    throw new CLIError('package.json not found. Make sure you are in a Vue project directory.')
  }

  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
  if (!packageJson.dependencies?.['@mknz/vue-mfe-wrapper']) {
    throw new CLIError(
      'This is not a Vue MFE project. Please run this command in a project created with @mknz/vue-mfe-wrapper.'
    )
  }
}
