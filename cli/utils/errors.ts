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
    throw new CLIError(`Feature "${name}" is not supported. Supported features: ${supportedFeatures.join(', ')}`)
  }

  if (!name.startsWith('@mknz/vue-mfe-')) {
    throw new CLIError('Feature name must start with "@mknz/vue-mfe-"')
  }
}

export function checkVueProject(): void {
  const packageJsonPath = path.join(process.cwd(), 'package.json')
  if (!fs.existsSync(packageJsonPath)) {
    throw new CLIError('package.json not found. Are you in the correct directory?')
  }

  try {
    const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'))
    const hasDependency = packageJson.dependencies?.['@mknz/vue-mfe-wrapper'] ||
                         packageJson.devDependencies?.['@mknz/vue-mfe-wrapper']
    
    if (!hasDependency) {
      throw new CLIError('This is not a Vue MFE project. Please install @mknz/vue-mfe-wrapper first.')
    }
  } catch (error) {
    if (error instanceof CLIError) throw error
    throw new CLIError('Error reading package.json')
  }
}
