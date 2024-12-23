export interface MfeFeature {
  name: string
  component: any // This will be a Vue component
  props?: Record<string, any>
}

export interface WrapperConfig {
  features?: MfeFeature[]
  router?: any // Vue Router instance
}
