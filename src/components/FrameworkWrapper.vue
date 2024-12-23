<script setup lang="ts">
import { ref } from 'vue'
import type { MfeFeature, WrapperConfig } from '../types'

const props = defineProps<{
  config?: WrapperConfig
}>()

const loadedFeatures = ref<Record<string, any>>({})

const loadFeature = async (featureName: string) => {
  if (props.config?.features) {
    const feature = props.config.features.find(f => f.name === featureName)
    if (feature) {
      loadedFeatures.value[featureName] = feature.component
      return feature
    }
  }
  throw new Error(`Feature ${featureName} not found`)
}

// Expose the loadFeature method
defineExpose({
  loadFeature
})
</script>

<template>
  <div class="framework-wrapper">
    <slot name="header"></slot>
    <main class="content">
      <slot></slot>
      <template v-for="(feature, name) in loadedFeatures" :key="name">
        <component
          :is="feature"
          v-bind="props.config?.features?.find(f => f.name === name)?.props || {}"
        />
      </template>
    </main>
    <slot name="footer"></slot>
  </div>
</template>

<style scoped>
.framework-wrapper {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.content {
  flex: 1;
  padding: 1rem;
}
</style>
