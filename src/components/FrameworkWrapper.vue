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

<script setup lang="ts">
import { ref, watch } from 'vue'
import type { MfeFeature, WrapperConfig } from '../types'

const props = defineProps<{
  config?: WrapperConfig
}>()

const loadedFeatures = ref<Record<string, any>>({})

// Watch for changes in features
watch(() => props.config?.features, (newFeatures) => {
  console.log('Features updated:', newFeatures)
  if (newFeatures) {
    newFeatures.forEach(feature => {
      console.log('Loading feature:', feature.name, feature.component)
      loadedFeatures.value[feature.name] = feature.component
    })
  }
}, { deep: true })

// Expose the loadFeature method
const loadFeature = async (featureName: string) => {
  console.log('Loading feature:', featureName)
  if (props.config?.features) {
    const feature = props.config.features.find(f => f.name === featureName)
    if (feature) {
      console.log('Found feature:', feature)
      loadedFeatures.value[featureName] = feature.component
      return feature
    }
  }
  throw new Error(`Feature ${featureName} not found`)
}

defineExpose({
  loadFeature
})
</script>

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
