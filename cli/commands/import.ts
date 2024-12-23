import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import { CLIError, validateFeatureName, checkVueProject, handleError } from '../utils/errors'

const SUPPORTED_FEATURES = [
  '@mknz/vue-mfe-feature-a'
  // Add more supported features here
]

export async function importFeatures(features: string[]) {
  try {
    checkVueProject()

    // Validate features
    features.forEach(feature => validateFeatureName(feature, SUPPORTED_FEATURES))

    // Install features
    console.log(chalk.blue('Installing features...'))
    try {
      execSync(`npm install ${features.join(' ')}`, { stdio: 'inherit' })
    } catch (error) {
      console.error(chalk.red('Error installing features:'), error)
      throw error
    }

    // Create features directory if it doesn't exist
    const featuresDir = path.join('src', 'features')
    if (!fs.existsSync(featuresDir)) {
      fs.mkdirSync(featuresDir, { recursive: true })
    }

    // Create index.ts to re-export all features
    const imports = features.map(f => `export { ${getFeatureName(f)} } from '${f}'`).join('\n')
    fs.writeFileSync(
      path.join(featuresDir, 'index.ts'),
      `${imports}\n`
    )

    console.log(chalk.green(`
Successfully imported features: ${features.join(', ')}

Features are now available in your project. You can import them from:
  import { ${features.map(getFeatureName).join(', ')} } from './features'
`))
  } catch (error) {
    handleError(error)
  }
}

function getFeatureName(packageName: string): string {
  const parts = packageName.split('/')
  const lastPart = parts[parts.length - 1]
  return lastPart
    .split('-')
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}
