<template>
  <FrameworkWrapper ref="wrapper" :config="config">
    <template #header>
      <header class="header">
        <h1>Vue MFE Framework Demo</h1>
      </header>
    </template>

    <div class="features-container">
      <button @click="loadFeatureA" :disabled="featureALoaded">Load Feature A</button>
      <div v-if="error" class="error">{{ error }}</div>
    </div>

    <template #footer>
      <footer class="footer">
        <p>Vue MFE Framework Demo Footer</p>
      </footer>
    </template>
  </FrameworkWrapper>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { FrameworkWrapper } from '../src'
import Counter from '@mknz/vue-mfe-feature-a'
import type { WrapperConfig } from '../src/types'

const featureALoaded = ref(false)
const error = ref('')

const config = ref<WrapperConfig>({
  features: []
})

const loadFeatureA = () => {
  try {
    console.log('Counter component:', Counter)
    config.value.features = [
      {
        name: 'feature-a',
        component: Counter,
        props: {
          title: 'Feature A Counter',
          initialCount: 0,
          theme: 'light',
          minValue: -50,
          maxValue: 50,
          stepSizes: [1, 5, 10]
        }
      }
    ]
    featureALoaded.value = true
  } catch (e) {
    console.error('Error loading feature:', e)
    error.value = e.message
  }
}
</script>

<style>
.header {
  background-color: #4a5568;
  color: white;
  padding: 1rem;
  text-align: center;
}

.footer {
  background-color: #4a5568;
  color: white;
  padding: 1rem;
  text-align: center;
  margin-top: auto;
}

.features-container {
  padding: 2rem;
  text-align: center;
}

.error {
  color: red;
  margin-top: 1rem;
}

button {
  padding: 0.5rem 1rem;
  font-size: 1rem;
  background-color: #4299e1;
  color: white;
  border: none;
  border-radius: 0.25rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

button:hover:not(:disabled) {
  background-color: #3182ce;
}

button:disabled {
  background-color: #a0aec0;
  cursor: not-allowed;
}
</style>
