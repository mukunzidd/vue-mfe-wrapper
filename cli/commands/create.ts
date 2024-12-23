import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import { CLIError, validateProjectName, handleError } from '../utils/errors'

const TEMPLATE_FILES = {
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

<script setup lang="ts">
import { ref } from 'vue'
import { FrameworkWrapper } from '@mknz/vue-mfe-wrapper'
import type { WrapperConfig } from '@mknz/vue-mfe-wrapper'

const config = ref<WrapperConfig>({
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

  'src/main.ts': `import { createApp } from 'vue'
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
    <script type="module" src="/src/main.ts"></script>
  </body>
</html>`,

  'package.json': `{
  "name": "vue-mfe-project",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "vite",
    "build": "run-p type-check \"build-only {@}\" --",
    "preview": "vite preview",
    "build-only": "vite build",
    "type-check": "vue-tsc --noEmit -p tsconfig.vitest.json --composite false"
  },
  "dependencies": {
    "@mknz/vue-mfe-wrapper": "^0.1.0",
    "vue": "^3.3.0"
  },
  "devDependencies": {
    "@tsconfig/node18": "^18.2.2",
    "@types/node": "^20.10.5",
    "@vitejs/plugin-vue": "^4.5.2",
    "@vue/tsconfig": "^0.5.1",
    "npm-run-all2": "^6.1.1",
    "typescript": "~5.3.0",
    "vite": "^5.0.10",
    "vue-tsc": "^1.8.25"
  }
}`,

  'tsconfig.json': `{
  "extends": "@vue/tsconfig/tsconfig.dom.json",
  "include": ["env.d.ts", "src/**/*", "src/**/*.vue"],
  "exclude": ["src/**/__tests__/*"],
  "compilerOptions": {
    "composite": true,
    "noEmit": true,
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
    "nightwatch.conf.*",
    "playwright.config.*"
  ],
  "compilerOptions": {
    "composite": true,
    "module": "ESNext",
    "moduleResolution": "Bundler",
    "types": ["node"]
  }
}`,

  'vite.config.ts': `import { fileURLToPath, URL } from 'node:url'
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

export async function create(projectName: string) {
  try {
    validateProjectName(projectName)

    // Create project directory
    const projectPath = path.resolve(process.cwd(), projectName)
    if (fs.existsSync(projectPath)) {
      throw new CLIError(`Directory ${projectName} already exists`)
    }

    fs.mkdirSync(projectPath)
    fs.mkdirSync(path.join(projectPath, 'src'))

    // Create project files
    for (const [filePath, content] of Object.entries(TEMPLATE_FILES)) {
      const fullPath = path.join(projectPath, filePath)
      fs.mkdirSync(path.dirname(fullPath), { recursive: true })
      fs.writeFileSync(fullPath, content)
    }

    // Initialize git
    execSync('git init', { cwd: projectPath })

    // Install dependencies
    console.log(chalk.blue('Installing dependencies...'))
    try {
      execSync('npm install', { cwd: projectPath, stdio: 'inherit' })
    } catch (error) {
      console.error(chalk.red('Error installing dependencies:'), error)
      throw error
    }

    console.log(chalk.green(`
Successfully created project ${projectName}

Next steps:
  cd ${projectName}
  npm run dev
`))
  } catch (error) {
    handleError(error)
  }
}
