import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

const SUPPORTED_FEATURES = [
  '@mknz/vue-mfe-feature-a'
  // Add more supported features here
]

export async function importFeatures(features: string[]) {
  try {
    // Check if we're in a Vue project
    if (!fs.existsSync('package.json')) {
      console.error(chalk.red('Error: package.json not found. Make sure you are in a Vue project directory.'))
      process.exit(1)
    }

    const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
    if (!packageJson.dependencies?.['@mknz/vue-mfe-wrapper']) {
      console.error(chalk.red('Error: This is not a Vue MFE project. Please run this command in a project created with @mknz/vue-mfe-wrapper.'))
      process.exit(1)
    }

    // Validate features
    const invalidFeatures = features.filter(f => !SUPPORTED_FEATURES.includes(f))
    if (invalidFeatures.length > 0) {
      console.error(chalk.red(`Error: The following features are not supported: ${invalidFeatures.join(', ')}`))
      console.log(chalk.blue(`Supported features: ${SUPPORTED_FEATURES.join(', ')}`))
      process.exit(1)
    }

    // Install features
    console.log(chalk.blue('Installing features...'))
    execSync(`npm install ${features.join(' ')}`, { stdio: 'inherit' })

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

Usage example:
import { ${features.map(f => getFeatureName(f)).join(', ')} } from './features'
`))
  } catch (error) {
    console.error(chalk.red('Error importing features:'), error)
    process.exit(1)
  }
}

function getFeatureName(packageName: string): string {
  // Convert @mknz/vue-mfe-feature-a to FeatureA
  return packageName
    .split('/')
    .pop()!
    .split('-')
    .slice(2)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')
}
