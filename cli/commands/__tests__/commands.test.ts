import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFeature } from '../create'
import { importFeatures } from '../import'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

process.env.NODE_ENV = 'test'

vi.mock('fs')
vi.mock('path')
vi.mock('child_process', async () => {
  const execSyncMock = vi.fn()
  return {
    execSync: execSyncMock,
    default: {
      execSync: execSyncMock
    }
  }
})
vi.mock('chalk', () => ({
  default: {
    red: (text: string) => text,
    blue: (text: string) => text,
    green: (text: string) => text,
    bold: (text: string) => text,
    cyan: (text: string) => text,
    gray: (text: string) => text
  }
}))
vi.mock('ora', () => ({
  default: () => ({
    start: () => ({ succeed: () => {}, fail: () => {} }),
    succeed: () => {},
    fail: () => {}
  })
}))

describe('create command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(process, 'exit').mockImplementation((() => { throw new Error('process.exit called') }) as any)
    vi.spyOn(process, 'cwd').mockReturnValue('/test')
  })

  it('should create feature with valid name', async () => {
    vi.spyOn(path, 'resolve').mockReturnValue('/test/vue-mfe-feature-test')
    vi.spyOn(path, 'join').mockImplementation((...parts) => parts.join('/'))
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {})
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {})

    await createFeature('@mknz/vue-mfe-feature-test')

    expect(fs.mkdirSync).toHaveBeenCalledWith('vue-mfe-feature-test')
    expect(fs.mkdirSync).toHaveBeenCalledWith('vue-mfe-feature-test/src')
    expect(fs.mkdirSync).toHaveBeenCalledWith('vue-mfe-feature-test/src/components')
    expect(fs.mkdirSync).toHaveBeenCalledWith('vue-mfe-feature-test/src/types')
    expect(execSync).toHaveBeenCalledWith('git init', { cwd: 'vue-mfe-feature-test', stdio: 'ignore' })
    expect(execSync).toHaveBeenCalledWith('npm install', { cwd: 'vue-mfe-feature-test', stdio: 'ignore' })
    
    // Check if package.json was created with correct content
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'vue-mfe-feature-test/package.json',
      expect.stringContaining('"name": "@mknz/vue-mfe-feature-test"')
    )
    
    // Check if TypeScript configs were created
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'vue-mfe-feature-test/tsconfig.json',
      expect.any(String)
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'vue-mfe-feature-test/tsconfig.app.json',
      expect.any(String)
    )
    
    // Check if vite config was created
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'vue-mfe-feature-test/vite.config.ts',
      expect.stringContaining('vite-plugin-dts')
    )
  })

  it('should throw error if feature name is invalid', async () => {
    await expect(createFeature('invalid-name'))
      .rejects.toThrow('Feature name must start with "@mknz/vue-mfe-"')
  })

  it('should throw error if directory exists', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    await expect(createFeature('@mknz/vue-mfe-feature-test'))
      .rejects.toThrow('Directory vue-mfe-feature-test already exists')
  })
})

describe('import command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(process, 'exit').mockImplementation((() => { throw new Error('process.exit called') }) as any)
    vi.spyOn(process, 'cwd').mockReturnValue('/test')
    
    // Mock package.json for all tests
    vi.spyOn(path, 'join').mockImplementation((...parts) => parts.join('/'))
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockImplementation((filePath: string) => {
      if (filePath.endsWith('package.json')) {
        return JSON.stringify({
          dependencies: {
            '@mknz/vue-mfe-wrapper': '^1.0.0'
          }
        })
      }
      if (filePath.endsWith('src/features/index.ts')) {
        return 'export { VueMfeFeatureA, Counter } from \'@mknz/vue-mfe-feature-a\'\n'
      }
      throw new Error(`Unexpected file read: ${filePath}`)
    })
  })

  it('should import valid features', async () => {
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {})

    await importFeatures(['@mknz/vue-mfe-feature-a'])

    expect(execSync).toHaveBeenCalledWith('npm install @mknz/vue-mfe-feature-a', { stdio: 'ignore' })
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'src/features/index.ts',
      expect.stringContaining('export { VueMfeFeatureA, Counter } from \'@mknz/vue-mfe-feature-a\'')
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'src/features/index.ts',
      expect.stringContaining('import \'@mknz/vue-mfe-feature-a/style.css\'')
    )
  })

  it('should preserve existing exports when importing new features', async () => {
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {})

    await importFeatures(['@mknz/vue-mfe-feature-b'])

    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'src/features/index.ts',
      expect.stringContaining('export { VueMfeFeatureA, Counter } from \'@mknz/vue-mfe-feature-a\'')
    )
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'src/features/index.ts',
      expect.stringContaining('export { VueMfeFeatureB, TodoList } from \'@mknz/vue-mfe-feature-b\'')
    )
  })

  it('should throw error for unsupported features', async () => {
    await expect(importFeatures(['@mknz/unsupported-feature']))
      .rejects.toThrow('Feature "@mknz/unsupported-feature" is not supported')
  })
})
