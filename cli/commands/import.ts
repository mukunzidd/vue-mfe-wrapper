import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { CLIError, validateFeatureName, checkVueProject, handleError } from '../utils/errors'

const SUPPORTED_FEATURES = [
  '@mknz/vue-mfe-feature-a',
  '@mknz/vue-mfe-feature-b'
  // Add more supported features here
]

export async function importFeatures(features: string[]) {
  const spinner = ora()
  try {
    // Check if we're in a Vue project
    spinner.start(chalk.blue('Checking project structure...'))
    checkVueProject()
    spinner.succeed(chalk.green('Valid Vue project structure detected'))

    // Validate features
    spinner.start(chalk.blue('Validating features...'))
    features.forEach(feature => validateFeatureName(feature, SUPPORTED_FEATURES))
    spinner.succeed(chalk.green('All features are valid'))

    // Install features
    spinner.start(chalk.blue(`Installing features: ${features.join(', ')}...`))
    try {
      execSync(`npm install ${features.join(' ')}`, { stdio: 'ignore' })
      spinner.succeed(chalk.green('Features installed successfully'))
    } catch (error) {
      spinner.fail(chalk.red('Error installing features'))
      throw error
    }

    // Create features directory if it doesn't exist
    const featuresDir = path.join('src', 'features')
    spinner.start(chalk.blue('Setting up features directory...'))
    if (!fs.existsSync(featuresDir)) {
      fs.mkdirSync(featuresDir, { recursive: true })
    }

    // Update index.ts
    const indexPath = path.join(featuresDir, 'index.ts')
    spinner.start(chalk.blue('Updating features index...'))
    
    // Read existing exports if file exists
    let existingContent = ''
    if (fs.existsSync(indexPath)) {
      existingContent = fs.readFileSync(indexPath, 'utf-8')
    }

    // Generate new imports with components
    const newImports = features.map(f => {
      const featureName = getFeatureName(f)
      const components = getComponentNames(f)
      return `export { ${featureName}, ${components} } from '${f}';
import '${f}/dist/style.css';`
    }).join('\n')
    
    // Combine existing content with new imports
    const finalContent = existingContent
      ? `${existingContent.trim()}\n${newImports}\n`
      : `${newImports}\n`

    // Write back to index.ts
    fs.writeFileSync(indexPath, finalContent)
    spinner.succeed(chalk.green('Features index updated'))

    console.log(chalk.green(`
Successfully imported features: ${chalk.bold(features.join(', '))}

${chalk.cyan('Features are now available in your project!')}

Import them in your components:
${features.map(f => {
  const featureName = getFeatureName(f)
  const components = getComponentNames(f)
  return chalk.gray(`  import { ${featureName}, ${components} } from './features'`)
}).join('\n')}

Configure them in your app:
${chalk.gray(`  const config = {
    features: [${features.map(getFeatureName).join(', ')}]
  }`)}
`))
  } catch (error) {
    spinner.fail(chalk.red('Failed to import features'))
    handleError(error)
  }
}

function getFeatureName(packageName: string): string {
  const parts = packageName.split('/')
  const lastPart = parts[parts.length - 1]
  return 'VueMfe' + lastPart
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}

function getComponentNames(packageName: string): string {
  // Map known features to their component names
  const componentMap: Record<string, string[]> = {
    '@mknz/vue-mfe-feature-a': ['Counter'],
    '@mknz/vue-mfe-feature-b': ['TodoList']
  }
  return componentMap[packageName]?.join(', ') || ''
}
