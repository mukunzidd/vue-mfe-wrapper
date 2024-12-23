import { execSync } from 'child_process'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'
import ora from 'ora'
import { CLIError, validateFeatureName, handleError } from '../utils/errors'

export async function createFeature(name: string) {
  const spinner = ora()
  try {
    // Validate feature name
    spinner.start(chalk.blue('Validating feature name...'))
    if (!name.startsWith('@mknz/vue-mfe-')) {
      throw new CLIError('Feature name must start with "@mknz/vue-mfe-"')
    }
    spinner.succeed(chalk.green('Feature name is valid'))

    // Create directory
    const dirName = name.split('/')[1]
    spinner.start(chalk.blue(`Creating directory ${dirName}...`))
    if (fs.existsSync(dirName)) {
      throw new CLIError(`Directory ${dirName} already exists`)
    }
    fs.mkdirSync(dirName)
    spinner.succeed(chalk.green(`Created directory ${dirName}`))

    // Initialize git repository
    spinner.start(chalk.blue('Initializing git repository...'))
    execSync('git init', { cwd: dirName, stdio: 'ignore' })
    spinner.succeed(chalk.green('Initialized git repository'))

    // Create package.json
    spinner.start(chalk.blue('Creating package.json...'))
    const packageJson = {
      name,
      version: '0.1.0',
      private: false,
      description: `${dirName}: A Vue 3 component for micro-frontend architecture`,
      type: 'module',
      main: './dist/index.umd.cjs',
      module: './dist/index.js',
      types: './dist/index.d.ts',
      style: './dist/style.css',
      exports: {
        '.': {
          types: './dist/index.d.ts',
          import: './dist/index.js',
          require: './dist/index.umd.cjs'
        },
        './style.css': './dist/style.css'
      },
      files: ['dist'],
      scripts: {
        dev: 'vite',
        build: 'run-p type-check:test build-only',
        preview: 'vite preview',
        'test:unit': 'vitest',
        'build-only': 'vite build',
        'type-check': 'vue-tsc --noEmit -p tsconfig.app.json --composite false',
        'type-check:test': 'vue-tsc --noEmit -p tsconfig.vitest.json --composite false',
        lint: 'eslint . --ext .vue,.js,.jsx,.cjs,.mjs,.ts,.tsx,.cts,.mts --fix --ignore-path .gitignore',
        format: 'prettier --write src/',
        prepublishOnly: 'npm run build'
      },
      dependencies: {
        '@mknz/vue-mfe-wrapper': '^0.1.1',
        vue: '^3.3.11'
      },
      devDependencies: {
        '@tsconfig/node18': '^18.2.2',
        '@types/jsdom': '^21.1.6',
        '@types/node': '^18.19.3',
        '@vitejs/plugin-vue': '^4.5.2',
        '@vue/test-utils': '^2.4.3',
        '@vue/tsconfig': '^0.5.1',
        eslint: '^8.49.0',
        jsdom: '^23.0.1',
        'npm-run-all2': '^6.1.1',
        typescript: '~5.3.0',
        vite: '^5.0.10',
        'vite-plugin-dts': '^3.7.0',
        vitest: '^1.0.4',
        'vue-tsc': '^1.8.25'
      },
      keywords: ['vue', 'microfrontend', 'component', 'typescript'],
      author: process.env.USER || 'unknown',
      license: 'MIT',
      publishConfig: {
        access: 'public'
      }
    }
    fs.writeFileSync(
      path.join(dirName, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    )
    spinner.succeed(chalk.green('Created package.json'))

    // Create tsconfig files
    spinner.start(chalk.blue('Creating TypeScript configuration...'))
    const tsConfigBase = {
      files: [],
      references: [
        { path: './tsconfig.node.json' },
        { path: './tsconfig.app.json' },
        { path: './tsconfig.vitest.json' }
      ],
      compilerOptions: {
        moduleResolution: 'node',
        target: 'esnext',
        module: 'esnext',
        lib: ['esnext', 'dom'],
        strict: true,
        jsx: 'preserve',
        sourceMap: true,
        resolveJsonModule: true,
        esModuleInterop: true,
        paths: {
          '@/*': ['./src/*']
        },
        types: ['node', 'vue']
      }
    }

    const tsConfigNode = {
      extends: '@tsconfig/node18/tsconfig.json',
      include: [
        'vite.config.*',
        'vitest.config.*',
        'cypress.config.*',
        'nightwatch.config.*',
        'playwright.config.*'
      ],
      compilerOptions: {
        composite: true,
        module: 'ESNext',
        moduleResolution: 'Bundler',
        types: ['node']
      }
    }

    const tsConfigApp = {
      extends: '@vue/tsconfig/tsconfig.dom.json',
      include: ['env.d.ts', 'src/**/*', 'src/**/*.vue'],
      exclude: ['src/**/__tests__/*'],
      compilerOptions: {
        composite: true,
        baseUrl: '.',
        paths: {
          '@/*': ['./src/*']
        }
      }
    }

    const tsConfigVitest = {
      extends: './tsconfig.app.json',
      exclude: [],
      compilerOptions: {
        composite: true,
        lib: [],
        types: ['node', 'jsdom']
      }
    }

    fs.writeFileSync(
      path.join(dirName, 'tsconfig.json'),
      JSON.stringify(tsConfigBase, null, 2)
    )
    fs.writeFileSync(
      path.join(dirName, 'tsconfig.node.json'),
      JSON.stringify(tsConfigNode, null, 2)
    )
    fs.writeFileSync(
      path.join(dirName, 'tsconfig.app.json'),
      JSON.stringify(tsConfigApp, null, 2)
    )
    fs.writeFileSync(
      path.join(dirName, 'tsconfig.vitest.json'),
      JSON.stringify(tsConfigVitest, null, 2)
    )
    spinner.succeed(chalk.green('Created TypeScript configuration files'))

    // Create Vite config
    spinner.start(chalk.blue('Creating Vite configuration...'))
    const viteConfig = `import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [
    vue(),
    dts({
      insertTypesEntry: true,
      rollupTypes: true
    })
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      name: '${name.replace(/@|\//g, '')}',
      fileName: 'index'
    },
    rollupOptions: {
      external: ['vue', '@mknz/vue-mfe-wrapper'],
      output: {
        globals: {
          vue: 'Vue',
          '@mknz/vue-mfe-wrapper': 'VueMfeWrapper'
        }
      }
    }
  }
})
`
    fs.writeFileSync(path.join(dirName, 'vite.config.ts'), viteConfig)
    spinner.succeed(chalk.green('Created Vite configuration'))

    // Create source files
    spinner.start(chalk.blue('Creating source files...'))
    const srcDir = path.join(dirName, 'src')
    const componentsDir = path.join(srcDir, 'components')
    const typesDir = path.join(srcDir, 'types')
    fs.mkdirSync(srcDir)
    fs.mkdirSync(componentsDir)
    fs.mkdirSync(typesDir)

    // Create wrapper type declaration
    const wrapperTypes = `declare module '@mknz/vue-mfe-wrapper' {
  import type { Component } from 'vue'

  export interface Feature {
    name: string
    components: Record<string, Component>
  }

  export interface FrameworkConfig {
    features: Feature[]
  }

  export const FrameworkWrapper: Component
}`
    fs.writeFileSync(path.join(typesDir, 'vue-mfe-wrapper.d.ts'), wrapperTypes)

    // Create index.ts
    const indexTs = `import type { Feature } from '@mknz/vue-mfe-wrapper'

export const ${getFeatureName(name)}: Feature = {
  name: '${name}',
  components: {}
}
`
    fs.writeFileSync(path.join(srcDir, 'index.ts'), indexTs)

    // Create .gitignore
    const gitignore = `node_modules/
.DS_Store
dist/
coverage/
*.log
.env*
`
    fs.writeFileSync(path.join(dirName, '.gitignore'), gitignore)

    // Create .npmignore
    const npmignore = `# Development files
src/App.vue
.vscode/
.idea/
.git/
.gitignore
.eslintrc.*
.prettierrc.*
*.config.js
*.config.ts
tsconfig*.json

# Test files
tests/
coverage/
*.test.*
*.spec.*

# Build tools
vite.config.ts
vitest.config.ts

# Misc
.DS_Store
*.log
.env*
node_modules/
`
    fs.writeFileSync(path.join(dirName, '.npmignore'), npmignore)

    // Create README.md
    const readme = `# ${name}

A Vue 3 component for micro-frontend architecture, built with [@mknz/vue-mfe-wrapper](https://www.npmjs.com/package/@mknz/vue-mfe-wrapper).

## Installation

\`\`\`bash
npm install ${name}
\`\`\`

## Usage

### With Vue MFE Wrapper

\`\`\`typescript
// features/index.ts
import { ${getFeatureName(name)} } from '${name}'
import '${name}/style.css'

export { ${getFeatureName(name)} }
\`\`\`

## License

MIT
`
    fs.writeFileSync(path.join(dirName, 'README.md'), readme)

    // Install dependencies
    spinner.start(chalk.blue('Installing dependencies...'))
    execSync('npm install', { cwd: dirName, stdio: 'ignore' })
    spinner.succeed(chalk.green('Installed dependencies'))

    console.log(chalk.green(`
Successfully created ${chalk.bold(name)}!

Next steps:
  1. ${chalk.cyan(`cd ${dirName}`)}
  2. Create your components in ${chalk.cyan('src/components/')}
  3. Export them in ${chalk.cyan('src/index.ts')}
  4. Run ${chalk.cyan('npm run dev')} to start development
  5. Run ${chalk.cyan('npm run build')} to build for production
  6. Run ${chalk.cyan('npm publish')} to publish to npm

For more information, check the ${chalk.cyan('README.md')} file.
`))
  } catch (error) {
    spinner.fail(chalk.red('Failed to create feature'))
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
