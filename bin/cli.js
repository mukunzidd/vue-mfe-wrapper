#!/usr/bin/env node

import { Command } from 'commander'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { execSync } from 'child_process'
import * as fs from 'fs'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const WRAPPER_ROOT = resolve(__dirname, '..')

const program = new Command()

program
  .name('@mknz/vue-mfe-wrapper')
  .description('CLI for managing Vue.js micro-frontend projects')
  .version('0.1.0')

program
  .command('create')
  .description('Create a new Vue.js project with MFE wrapper')
  .argument('<project-name>', 'Name of the project')
  .action(async (projectName) => {
    try {
      // Create project directory
      const projectPath = join(process.cwd(), projectName)
      if (fs.existsSync(projectPath)) {
        console.error(chalk.red(`Error: Directory ${projectName} already exists`))
        process.exit(1)
      }

      fs.mkdirSync(projectPath)
      fs.mkdirSync(join(projectPath, 'src'))

      // Create project files
      const templateFiles = {
        'src/App.vue': `<template>
  <FrameworkWrapper :config="config">
    <template #header>
      <header class="header">
        <h1>Vue MFE Project</h1>
      </header>
    </template>

    <div class="content">
      <!-- Your content here -->
    </div>

    <template #footer>
      <footer class="footer">
        <p>Powered by @mknz/vue-mfe-wrapper</p>
      </footer>
    </template>
  </FrameworkWrapper>
</template>

<script setup>
import { ref } from 'vue'
import { FrameworkWrapper } from '@mknz/vue-mfe-wrapper'

const config = ref({
  features: []
})
</script>

<style>
.header {
  background-color: #4a5568;
  color: white;
  padding: 1rem;
  text-align: center;
}

.content {
  padding: 2rem;
}

.footer {
  background-color: #4a5568;
  color: white;
  padding: 1rem;
  text-align: center;
  margin-top: auto;
}
</style>`,

        'src/main.js': `import { createApp } from 'vue'
import App from './App.vue'

const app = createApp(App)
app.mount('#app')`,

        'index.html': `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <link rel="icon" href="/favicon.ico">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue MFE Project</title>
  </head>
  <body>
    <div id="app"></div>
    <script type="module" src="/src/main.js"></script>
  </body>
</html>`,

        'package.json': `{
  "name": "${projectName}",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  },
  "dependencies": {
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@vitejs/plugin-vue": "^4.5.2",
    "vite": "^5.0.10"
  }
}`,

        'vite.config.js': `import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})`
      }

      for (const [filePath, content] of Object.entries(templateFiles)) {
        const fullPath = join(projectPath, filePath)
        fs.mkdirSync(dirname(fullPath), { recursive: true })
        fs.writeFileSync(fullPath, content)
      }

      // Initialize git
      execSync('git init', { cwd: projectPath })

      // Install dependencies
      console.log(chalk.blue('Installing dependencies...'))
      execSync('npm install', { cwd: projectPath, stdio: 'inherit' })

      // Link local wrapper package
      console.log(chalk.blue('Linking local wrapper package...'))
      execSync('npm link', { cwd: WRAPPER_ROOT, stdio: 'inherit' })
      execSync('npm link @mknz/vue-mfe-wrapper', { cwd: projectPath, stdio: 'inherit' })

      console.log(chalk.green(`
Successfully created project ${projectName}

Next steps:
  cd ${projectName}
  npm run dev
`))
    } catch (error) {
      console.error(chalk.red('Error creating project:'), error)
      process.exit(1)
    }
  })

program
  .command('import')
  .description('Import micro-frontend features')
  .argument('<features...>', 'Feature names to import (space-separated)')
  .action(async (features) => {
    try {
      const SUPPORTED_FEATURES = [
        '@mknz/vue-mfe-feature-a'
        // Add more supported features here
      ]

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
      for (const feature of features) {
        console.log(chalk.blue(`Linking ${feature}...`))
        execSync('npm link', { cwd: resolve(WRAPPER_ROOT, '..', feature.split('/').pop()), stdio: 'inherit' })
        execSync(`npm link ${feature}`, { cwd: process.cwd(), stdio: 'inherit' })
      }

      // Create features directory if it doesn't exist
      const featuresDir = join('src', 'features')
      if (!fs.existsSync(featuresDir)) {
        fs.mkdirSync(featuresDir, { recursive: true })
      }

      // Create index.js to re-export all features
      const imports = features.map(f => {
        const parts = f.split('/')
        const lastPart = parts[parts.length - 1] || ''
        const featureName = lastPart
          .split('-')
          .slice(2)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('')
        return `export { ${featureName} } from '${f}'`
      }).join('\n')
      fs.writeFileSync(
        join(featuresDir, 'index.js'),
        `${imports}\n`
      )

      console.log(chalk.green(`
Successfully imported features: ${features.join(', ')}

Usage example:
import { ${features.map(f => {
        const parts = f.split('/')
        const lastPart = parts[parts.length - 1] || ''
        return lastPart
          .split('-')
          .slice(2)
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('')
      }).join(', ')} } from './features'
`))
    } catch (error) {
      console.error(chalk.red('Error importing features:'), error)
      process.exit(1)
    }
  })

program.parse()
