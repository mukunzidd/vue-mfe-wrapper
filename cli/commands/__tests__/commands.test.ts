import { describe, it, expect, vi, beforeEach } from 'vitest'
import { create } from '../create'
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
    green: (text: string) => text
  }
}))

describe('create command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(process, 'exit').mockImplementation((() => { throw new Error('process.exit called') }) as any)
    vi.spyOn(process, 'cwd').mockReturnValue('/test')
  })

  it('should create project with valid name', async () => {
    vi.spyOn(path, 'resolve').mockReturnValue('/test/my-project')
    vi.spyOn(path, 'join').mockImplementation((...parts) => parts.join('/'))
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {})
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {})

    await create('my-project')

    expect(fs.mkdirSync).toHaveBeenCalledWith('/test/my-project')
    expect(fs.mkdirSync).toHaveBeenCalledWith('/test/my-project/src')
    expect(execSync).toHaveBeenCalledWith('git init', { cwd: '/test/my-project' })
    expect(execSync).toHaveBeenCalledWith('npm install', { cwd: '/test/my-project', stdio: 'inherit' })
  })

  it('should throw error if project directory exists', async () => {
    vi.spyOn(path, 'resolve').mockReturnValue('/test/existing-project')
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)

    await expect(create('existing-project')).rejects.toThrow('Directory existing-project already exists')
  })
})

describe('import command', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'log').mockImplementation(() => {})
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.spyOn(process, 'exit').mockImplementation((() => { throw new Error('process.exit called') }) as any)
    vi.spyOn(process, 'cwd').mockReturnValue('/test')
  })

  it('should import valid features', async () => {
    vi.spyOn(path, 'join').mockImplementation((...parts) => parts.join('/'))
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
      dependencies: {
        '@mknz/vue-mfe-wrapper': '^1.0.0'
      }
    }))
    vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {})
    vi.spyOn(fs, 'mkdirSync').mockImplementation(() => {})

    await importFeatures(['@mknz/vue-mfe-feature-a'])

    expect(execSync).toHaveBeenCalledWith('npm install @mknz/vue-mfe-feature-a', { stdio: 'inherit' })
    expect(fs.writeFileSync).toHaveBeenCalledWith(
      'src/features/index.ts',
      expect.stringContaining('export { VueMfeFeatureA } from \'@mknz/vue-mfe-feature-a\'')
    )
  })

  it('should throw error for unsupported features', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
      dependencies: {
        '@mknz/vue-mfe-wrapper': '^1.0.0'
      }
    }))

    await expect(importFeatures(['@mknz/unsupported-feature']))
      .rejects.toThrow('Feature "@mknz/unsupported-feature" is not supported')
  })

  it('should throw error if not in a Vue MFE project', async () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
      dependencies: {}
    }))

    await expect(importFeatures(['@mknz/vue-mfe-feature-a']))
      .rejects.toThrow('This is not a Vue MFE project')
  })
})
