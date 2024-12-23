#!/usr/bin/env node

import { Command } from 'commander'
import { fileURLToPath } from 'url'
import { dirname, join, resolve } from 'path'
import { execSync } from 'child_process'
import * as fs from 'fs'
import chalk from 'chalk'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

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
        'package.json': `{
  "name": "${projectName}",
  "version": "0.1.0",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "run-p type-check build-only",
    "preview": "vite preview",
    "test:unit": "vitest",
    "build-only": "vite build",
    "type-check": "vue-tsc --build --force",
    "lint": "eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore",
    "format": "prettier --write src/"
  },
  "dependencies": {
    "@mknz/vue-mfe-wrapper": "^0.1.1",
    "vue": "^3.3.11",
    "vue-router": "^4.2.5"
  },
  "devDependencies": {
    "@rushstack/eslint-patch": "^1.3.3",
    "@tsconfig/node18": "^18.2.2",
    "@types/jsdom": "^21.1.6",
    "@types/node": "^18.19.3",
    "@vitejs/plugin-vue": "^4.5.2",
    "@vue/eslint-config-prettier": "^8.0.0",
    "@vue/eslint-config-typescript": "^12.0.0",
    "@vue/test-utils": "^2.4.3",
    "@vue/tsconfig": "^0.5.0",
    "eslint": "^8.49.0",
    "eslint-plugin-vue": "^9.17.0",
    "jsdom": "^23.0.1",
    "npm-run-all2": "^6.1.1",
    "prettier": "^3.0.3",
    "typescript": "~5.3.0",
    "vite": "^5.0.10",
    "vitest": "^1.0.4",
    "vue-tsc": "^1.8.25"
  }
}`,
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
        <p>&copy; 2024 Vue MFE Project</p>
      </footer>
    </template>
  </FrameworkWrapper>
</template>

<script setup lang="ts">
import { FrameworkWrapper } from '@mknz/vue-mfe-wrapper'
import type { FrameworkConfig } from '@mknz/vue-mfe-wrapper'

const config: FrameworkConfig = {
  features: []
}
</script>

<style scoped>
.header {
  padding: 1rem;
  background-color: #42b883;
  color: white;
}

.content {
  padding: 1rem;
}

.footer {
  padding: 1rem;
  background-color: #35495e;
  color: white;
  text-align: center;
}
</style>`,
        'src/main.ts': `import { createApp } from 'vue'
import App from './App.vue'

createApp(App).mount('#app')`,
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
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,
        'tsconfig.json': `{
  "files": [],
  "references": [
    {
      "path": "./tsconfig.node.json"
    },
    {
      "path": "./tsconfig.app.json"
    },
    {
      "path": "./tsconfig.vitest.json"
    }
  ]
}`,
        'tsconfig.app.json': `{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "composite": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}`,
        'tsconfig.node.json': `{
  "extends": "@tsconfig/node18/tsconfig.json",
  "include": [
    "vite.config.*",
    "vitest.config.*",
    "cypress.config.*",
    "nightwatch.config.*",
    "playwright.config.*"
  ],
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"]
  }
}`,
        'tsconfig.vitest.json': `{
  "extends": "./tsconfig.app.json",
  "exclude": [],
  "compilerOptions": {
    "composite": true,
    "lib": [],
    "types": ["node", "jsdom"]
  }
}`,
        'vite.config.ts': `import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})`,
        '.gitignore': `# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*
pnpm-debug.log*
lerna-debug.log*

node_modules
.DS_Store
dist
dist-ssr
coverage
*.local

/cypress/videos/
/cypress/screenshots/

# Editor directories and files
.vscode/*
!.vscode/extensions.json
.idea
*.suo
*.ntvs*
*.njsproj
*.sln
*.sw?

*.tsbuildinfo`,
        'README.md': `# ${projectName}

This is a Vue.js micro-frontend project created with @mknz/vue-mfe-wrapper.

## Project Setup

\`\`\`sh
npm install
\`\`\`

### Compile and Hot-Reload for Development

\`\`\`sh
npm run dev
\`\`\`

### Type-Check, Compile and Minify for Production

\`\`\`sh
npm run build
\`\`\`

### Run Unit Tests with [Vitest](https://vitest.dev/)

\`\`\`sh
npm run test:unit
\`\`\`

### Lint with [ESLint](https://eslint.org/)

\`\`\`sh
npm run lint
\`\`\`
`
      }

      // Create project files
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
      // Check if we're in a Vue project
      if (!fs.existsSync('package.json')) {
        console.error(chalk.red('Error: package.json not found. Make sure you are in a Vue project directory.'))
        process.exit(1)
      }

      // Read package.json
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'))
      if (!packageJson.dependencies?.['@mknz/vue-mfe-wrapper']) {
        console.error(chalk.red('Error: This is not a Vue MFE project. Please run this command in a project created with @mknz/vue-mfe-wrapper.'))
        process.exit(1)
      }

      // Install features
      console.log(chalk.blue('Installing features...'))
      execSync(`npm install ${features.join(' ')}`, { stdio: 'inherit' })

      // Create features directory if it doesn't exist
      const featuresDir = join('src', 'features')
      if (!fs.existsSync(featuresDir)) {
        fs.mkdirSync(featuresDir, { recursive: true })
      }

      // Create index.ts to re-export all features
      const imports = features.map(f => {
        const parts = f.split('/')
        const lastPart = parts[parts.length - 1]
        const featureName = lastPart
          .split('-')
          .map(part => part.charAt(0).toUpperCase() + part.slice(1))
          .join('')
        return `export { ${featureName} } from '${f}'`
      }).join('\n')
      fs.writeFileSync(
        join(featuresDir, 'index.ts'),
        `${imports}\n`
      )

      console.log(chalk.green(`
Successfully imported features: ${features.join(', ')}

Features are now available in your project. You can import them from:
  import { ${features.map(f => {
    const parts = f.split('/')
    const lastPart = parts[parts.length - 1]
    return lastPart
      .split('-')
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
