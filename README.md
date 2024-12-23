# @mknz/vue-mfe-wrapper

A Vue.js wrapper framework for managing and dynamically loading micro-frontend features.

## Features

- 🔌 Plug-and-play micro-frontend architecture
- 🛠️ CLI tools for project setup and feature management
- 🎨 Customizable layout with header and footer slots
- 📦 Easy feature integration
- 🔄 Dynamic feature loading

## Installation

```bash
npm install @mknz/vue-mfe-wrapper
```

## Quick Start

### Using the CLI

1. Create a new Vue.js project with the wrapper:

```bash
npx @mknz/vue-mfe-wrapper create my-mfe-app
cd my-mfe-app
npm run dev
```

2. Import micro-frontend features:

```bash
npx @mknz/vue-mfe-wrapper import @mknz/vue-mfe-feature-a
```

### Manual Setup

1. Install the package:

```bash
npm install @mknz/vue-mfe-wrapper
```

2. Use the wrapper in your App.vue:

```vue
<template>
  <FrameworkWrapper :config="config">
    <template #header>
      <header>
        <h1>My MFE App</h1>
      </header>
    </template>

    <div class="content">
      <!-- Your content here -->
    </div>

    <template #footer>
      <footer>
        <p>Powered by @mknz/vue-mfe-wrapper</p>
      </footer>
    </template>
  </FrameworkWrapper>
</template>

<script setup>
import { ref } from 'vue'
import { FrameworkWrapper } from '@mknz/vue-mfe-wrapper'

const config = ref({
  features: [] // List of enabled features
})
</script>
```

## Supported Features

The following micro-frontend features are officially supported and can be imported using the CLI:

| Package Name | Description | Latest Version |
|-------------|-------------|----------------|
| `@mknz/vue-mfe-feature-a` | A customizable Counter component with light/dark themes | 0.1.0 |

To use any of these features:

1. Import the feature using the CLI:
```bash
npx @mknz/vue-mfe-wrapper import <package-name>
```

2. Add it to your config:
```typescript
const config = ref({
  features: ['<package-name>']
})
```


3. Use the component in your template:
```vue
<template>
  <FeatureComponent />
</template>

<script setup>
import { FeatureComponent } from '<package-name>'
</script>
```

## Configuration

The wrapper accepts a configuration object with the following properties:

```typescript
interface WrapperConfig {
  features: string[] // List of enabled feature package names
}
```

## Slots

The wrapper provides three slots for customization:

- `header`: Top section of the layout
- `default`: Main content area
- `footer`: Bottom section of the layout

## CLI Commands

### Create a New Project

```bash
npx @mknz/vue-mfe-wrapper create <project-name>
```

Creates a new Vue.js project with the MFE wrapper pre-configured.

### Import Features

```bash
npx @mknz/vue-mfe-wrapper import <feature-package-name>
```

Imports and sets up a micro-frontend feature in your project.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
