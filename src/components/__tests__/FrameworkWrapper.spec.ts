import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import FrameworkWrapper from '../FrameworkWrapper.vue'

// Create a mock feature component
const MockFeature = defineComponent({
  name: 'MockFeature',
  props: {
    message: {
      type: String,
      default: 'Hello from Mock Feature'
    }
  },
  template: '<div class="mock-feature">{{ message }}</div>'
})

describe('FrameworkWrapper', () => {
  it('renders properly with default slots', () => {
    const wrapper = mount(FrameworkWrapper, {
      slots: {
        header: '<div class="test-header">Header Content</div>',
        default: '<div class="test-content">Main Content</div>',
        footer: '<div class="test-footer">Footer Content</div>'
      }
    })

    expect(wrapper.find('.test-header').text()).toBe('Header Content')
    expect(wrapper.find('.test-content').text()).toBe('Main Content')
    expect(wrapper.find('.test-footer').text()).toBe('Footer Content')
    expect(wrapper.find('.framework-wrapper').exists()).toBe(true)
  })

  it('loads and renders features from config', async () => {
    const config = {
      features: [
        {
          name: 'test-feature',
          component: MockFeature,
          props: {
            message: 'Custom Message'
          }
        }
      ]
    }

    const wrapper = mount(FrameworkWrapper, {
      props: {
        config
      }
    })

    // Load the feature
    await wrapper.vm.loadFeature('test-feature')
    await wrapper.vm.$nextTick()

    // Check if the feature is rendered
    const feature = wrapper.find('.mock-feature')
    expect(feature.exists()).toBe(true)
    expect(feature.text()).toBe('Custom Message')
  })

  it('throws error when loading non-existent feature', async () => {
    const wrapper = mount(FrameworkWrapper)

    // Attempt to load non-existent feature
    await expect(wrapper.vm.loadFeature('non-existent'))
      .rejects
      .toThrow('Feature non-existent not found')
  })

  it('handles multiple features', async () => {
    const MockFeature2 = defineComponent({
      name: 'MockFeature2',
      template: '<div class="mock-feature-2">Feature 2</div>'
    })

    const config = {
      features: [
        {
          name: 'feature-1',
          component: MockFeature,
          props: {
            message: 'Feature 1'
          }
        },
        {
          name: 'feature-2',
          component: MockFeature2
        }
      ]
    }

    const wrapper = mount(FrameworkWrapper, {
      props: {
        config
      }
    })

    await wrapper.vm.loadFeature('feature-1')
    await wrapper.vm.loadFeature('feature-2')
    await wrapper.vm.$nextTick()

    expect(wrapper.find('.mock-feature').text()).toBe('Feature 1')
    expect(wrapper.find('.mock-feature-2').text()).toBe('Feature 2')
  })

  it('has correct base structure', () => {
    const wrapper = mount(FrameworkWrapper)
    
    // Check if the basic structure exists
    expect(wrapper.find('.framework-wrapper').exists()).toBe(true)
    expect(wrapper.find('.content').exists()).toBe(true)
    
    // Check if the wrapper element has the correct classes
    const wrapperClasses = wrapper.find('.framework-wrapper').classes()
    expect(wrapperClasses).toContain('framework-wrapper')
  })
})
