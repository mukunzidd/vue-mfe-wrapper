# Vue MFE Wrapper

[![Tests](https://img.shields.io/badge/tests-26%20passing-brightgreen)](https://github.com/mukunzi10/vue-mfe-wrapper/actions)
[![npm version](https://img.shields.io/npm/v/@mknz/vue-mfe-wrapper)](https://www.npmjs.com/package/@mknz/vue-mfe-wrapper)

A Vue.js wrapper framework for micro-frontend architecture. This package provides a set of tools and commands to create, manage, and use micro-frontend features in your Vue.js applications.

## Installation

```bash
npm install @mknz/vue-mfe-wrapper
```

## Supported Features

Currently available micro-frontend features:

| Feature | Description | Version |
|---------|-------------|---------|
| `@mknz/vue-mfe-feature-a` | Counter component with theme support | 0.1.5 |
| `@mknz/vue-mfe-feature-b` | TodoList component with local storage | 0.1.0 |

## CLI Commands

The Vue MFE Wrapper comes with a command-line interface (CLI) to help you manage your micro-frontend features.

### List Available Features

View all available micro-frontend features that you can use in your project:

```bash
vue-mfe list
```

This command will show you:
- All published features with the `@mknz/vue-mfe-` prefix
- Their current versions
- Brief descriptions of what each feature does

### Create a New Feature

Create a new micro-frontend feature with all the necessary configuration:

```bash
vue-mfe create @mknz/vue-mfe-feature-name
```

This command will:
- Create a new directory for your feature
- Set up TypeScript configuration
- Configure Vite for building
- Create necessary source files and directories
- Initialize Git repository
- Install required dependencies

### Import Features

Import one or more features into your Vue.js project:

```bash
vue-mfe import @mknz/vue-mfe-feature-a @mknz/vue-mfe-feature-b
```

This command will:
- Install the specified features as dependencies
- Add necessary imports to your project
- Import feature styles automatically
- Update your feature exports

## Using Features in Your Vue App

After importing features, you can use them in your Vue components:

```vue
<template>
  <FrameworkWrapper :config="config">
    <!-- Your app content -->
    <template #header>
      <header>
        <h1>My App</h1>
      </header>
    </template>

    <!-- Features will be rendered here -->
    <div class="content">
      <!-- Each feature is rendered based on its configuration -->
    </div>

    <template #footer>
      <footer>
        <p>Powered by Vue MFE Wrapper</p>
      </footer>
    </template>
  </FrameworkWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FrameworkWrapper } from '@mknz/vue-mfe-wrapper'
import type { WrapperConfig } from '@mknz/vue-mfe-wrapper'

const config = ref<WrapperConfig>({
  features: [
    {
      name: 'feature-a',
      props: {
        theme: 'dark',
        initialCount: 0
      }
    },
    {
      name: 'feature-b',
      props: {
        storageKey: 'my-todos'
      }
    }
  ]
})
</script>
```

## Feature Configuration

Each feature in your config can have the following properties:

```typescript
interface FeatureConfig {
  name: string;           // Name of the feature (e.g., 'feature-a')
  props?: Record<string, any>; // Props to pass to the feature
}

interface WrapperConfig {
  features: FeatureConfig[];
}
```

### Feature-Specific Props

#### @mknz/vue-mfe-feature-a
- `theme`: 'light' | 'dark' (default: 'light')
- `initialCount`: number (default: 0)

#### @mknz/vue-mfe-feature-b
- `storageKey`: string (default: 'vue-mfe-todos')
- `maxItems`: number (default: 100)

## Error Handling

The CLI includes comprehensive error handling:
- Validates feature names (must start with `@mknz/vue-mfe-`)
- Ensures proper project setup
- Provides clear error messages
- Handles npm registry interactions safely

## Need Help?

If you encounter any issues or need help:
1. Run `vue-mfe list` to see available features
2. Check that your feature names start with `@mknz/vue-mfe-`
3. Ensure you're in the correct directory when running commands
4. Look for detailed error messages in the console

For more detailed documentation or to report issues, visit our GitHub repository.
