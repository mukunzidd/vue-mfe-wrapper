# Vue MFE Wrapper

[![npm version](https://img.shields.io/npm/v/@mknz/vue-mfe-wrapper)](https://www.npmjs.com/package/@mknz/vue-mfe-wrapper)
[![Tests](https://img.shields.io/badge/tests-26%20passing-brightgreen)](https://github.com/mukunzidd/vue-mfe-wrapper/actions)

A lightweight framework for creating and managing Vue.js micro-frontends.

## Quick Start

### Create a New MFE App

```bash
# Using bunx (recommended)
bunx @mknz/vue-mfe-wrapper create mfe-app

# Using npx
npx @mknz/vue-mfe-wrapper create mfe-app

cd mfe-app
npm run dev
```

### Import Supported Features

```bash
# Using bunx (recommended)
bunx @mknz/vue-mfe-wrapper import @mknz/vue-mfe-feature-b

# Using npx
npx @mknz/vue-mfe-wrapper import @mknz/vue-mfe-feature-b
```

### Use the Imported Feature

```vue
<template>
  <FrameworkWrapper :config="config">
    <!-- Your other components -->
  </FrameworkWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FrameworkWrapper } from '@mknz/vue-mfe-wrapper'
import { VueMfeFeatureB, TodoList } from './features'
import type { WrapperConfig } from '@mknz/vue-mfe-wrapper'

const config = ref<WrapperConfig>({
  features: [
    {
      name: 'feature-b',
      props: {
        theme: 'dark',
        storageKey: 'my-todos',
        maxItems: 100
      }
    }
  ]
})
</script>
```

## Supported Features

Currently supported MFE features:
- [@mknz/vue-mfe-feature-a](https://www.npmjs.com/package/@mknz/vue-mfe-feature-a) - Counter component
- [@mknz/vue-mfe-feature-b](https://www.npmjs.com/package/@mknz/vue-mfe-feature-b) - TodoList component with localStorage support

## Global Installation (Not Recommended)

While possible, we don't recommend installing the CLI globally as it may lead to version conflicts:

```bash
# Using npm (not recommended)
npm install -g @mknz/vue-mfe-wrapper

# Then you can run commands without npx/bunx
vue-mfe-wrapper create mfe-app
vue-mfe-wrapper import @mknz/vue-mfe-feature-b
```

## Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Run tests
npm run test
```

## License

MIT
