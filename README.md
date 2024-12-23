# @mknz/vue-mfe-wrapper

A Vue.js micro-frontend framework that allows you to dynamically load and manage Vue.js features in a modular way.

## Features

- 🔌 Plug-and-play feature integration
- 🎨 Customizable layout with slots (header, content, footer)
- 🔄 Dynamic feature loading
- 🎯 Type-safe feature configuration
- 📦 Easy to extend and maintain

## Installation

```bash
npm install @mknz/vue-mfe-wrapper
```

## Quick Start

1. Import and use the wrapper component:

```vue
<template>
  <FrameworkWrapper :config="config">
    <template #header>
      <header>Your Header</header>
    </template>
    
    <!-- Your content -->
    
    <template #footer>
      <footer>Your Footer</footer>
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
```

2. Load features dynamically:

```typescript
import MyFeature from '@mknz/my-feature'

const loadFeature = () => {
  config.value.features = [
    {
      name: 'my-feature',
      component: MyFeature,
      props: {
        // Feature-specific props
      }
    }
  ]
}
```

## Configuration

### WrapperConfig

```typescript
interface WrapperConfig {
  features?: MfeFeature[]
}

interface MfeFeature {
  name: string
  component: any // Vue component
  props?: Record<string, any>
}
```

## Slots

The wrapper provides three slots for layout customization:

- `header`: Top section of the page
- `default`: Main content area
- `footer`: Bottom section of the page

## Creating Features

Features should be created as separate npm packages. Each feature should:

1. Export a Vue component as its main entry point
2. Include proper TypeScript types
3. Follow the naming convention: `@mknz/vue-mfe-feature-*`

Example feature structure:
```
my-feature/
├── src/
│   ├── components/
│   │   └── MyFeature.vue
│   ├── types.ts
│   └── index.ts
├── package.json
└── README.md
```

## Example Features

- [@mknz/vue-mfe-feature-a](https://github.com/yourusername/vue-mfe-feature-a) - A counter component with theming support

## Development

```bash
# Install dependencies
npm install

# Run demo
npm run demo

# Build
npm run build

# Run tests
npm run test:unit
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details
