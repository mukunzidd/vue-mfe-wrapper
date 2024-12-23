import chalk from 'chalk'
import ora from 'ora'
import { execSync } from 'child_process'
import { handleError } from '../utils/errors'

interface NpmSearchResult {
  name: string
  version: string
  description: string
}

export async function listFeatures() {
  const spinner = ora('Searching for available features...').start()
  
  try {
    // Search npm registry for @mknz/vue-mfe- packages
    const searchResult = execSync('npm search @mknz/vue-mfe- --json', { stdio: ['pipe', 'pipe', 'pipe'] })
    const features: NpmSearchResult[] = JSON.parse(searchResult.toString())
    
    spinner.succeed('Found available features:')
    
    if (features.length === 0) {
      console.log(chalk.yellow('\nNo features found. Features should be published with the prefix @mknz/vue-mfe-'))
      return
    }

    console.log('\nAvailable features:')
    features.forEach(feature => {
      console.log(`\n${chalk.cyan(feature.name)} ${chalk.gray(`v${feature.version}`)}`)
      if (feature.description) {
        console.log(chalk.gray(`  ${feature.description}`))
      }
    })

    console.log(`\n${chalk.blue('To import a feature:')} vue-mfe import <feature-name>`)
    
  } catch (error) {
    spinner.fail('Failed to fetch available features')
    handleError(error)
  }
}
