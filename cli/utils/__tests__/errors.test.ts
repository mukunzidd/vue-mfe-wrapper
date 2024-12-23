import { describe, it, expect, vi, beforeEach } from 'vitest'
import {
  CLIError,
  handleError,
  validateProjectName,
  validateFeatureName,
  checkVueProject
} from '../errors'
import * as fs from 'fs'

vi.mock('fs')
vi.mock('chalk', () => ({
  default: {
    red: (text: string) => text,
    blue: (text: string) => text,
    green: (text: string) => text
  }
}))

describe('CLIError', () => {
  it('should create error with default exit code', () => {
    const error = new CLIError('test error')
    expect(error.message).toBe('test error')
    expect(error.exitCode).toBe(1)
  })

  it('should create error with custom exit code', () => {
    const error = new CLIError('test error', 2)
    expect(error.exitCode).toBe(2)
  })
})

describe('handleError', () => {
  const mockConsoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
  const mockExit = vi.spyOn(process, 'exit').mockImplementation(() => {
    throw new Error('process.exit called')
  })

  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should handle CLIError', () => {
    expect(() => handleError(new CLIError('cli error', 2))).toThrow('cli error')
    expect(mockConsoleError).toHaveBeenCalledWith(expect.stringContaining('cli error'))
  })

  it('should handle standard Error', () => {
    expect(() => handleError(new Error('standard error'))).toThrow('standard error')
    expect(mockConsoleError).toHaveBeenCalledWith(
      expect.stringContaining('An unexpected error occurred'),
      'standard error'
    )
  })

  it('should handle unknown error', () => {
    expect(() => handleError('unknown error')).toThrow('An unknown error occurred')
    expect(mockConsoleError).toHaveBeenCalledWith('An unknown error occurred')
  })
})

describe('validateProjectName', () => {
  it('should throw error for empty name', () => {
    expect(() => validateProjectName('')).toThrow('Project name is required')
  })

  it('should throw error for invalid characters', () => {
    expect(() => validateProjectName('test@project')).toThrow(
      'Project name can only contain letters, numbers, hyphens, and underscores'
    )
  })

  it('should throw error for too long name', () => {
    const longName = 'a'.repeat(215)
    expect(() => validateProjectName(longName)).toThrow('Project name is too long')
  })

  it('should not throw for valid name', () => {
    expect(() => validateProjectName('valid-project-123')).not.toThrow()
  })
})

describe('validateFeatureName', () => {
  const supportedFeatures = ['@mknz/vue-mfe-feature-a']

  it('should throw error for empty name', () => {
    expect(() => validateFeatureName('', supportedFeatures)).toThrow('Feature name is required')
  })

  it('should throw error for unsupported feature', () => {
    expect(() => validateFeatureName('@mknz/unsupported', supportedFeatures)).toThrow(
      'Feature "@mknz/unsupported" is not supported'
    )
  })

  it('should not throw for supported feature', () => {
    expect(() => validateFeatureName('@mknz/vue-mfe-feature-a', supportedFeatures)).not.toThrow()
  })
})

describe('checkVueProject', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should throw error if package.json not found', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(false)
    
    expect(() => checkVueProject()).toThrow('package.json not found')
  })

  it('should throw error if not a Vue MFE project', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
      dependencies: {}
    }))

    expect(() => checkVueProject()).toThrow('This is not a Vue MFE project')
  })

  it('should not throw for valid Vue MFE project', () => {
    vi.spyOn(fs, 'existsSync').mockReturnValue(true)
    vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify({
      dependencies: {
        '@mknz/vue-mfe-wrapper': '^1.0.0'
      }
    }))

    expect(() => checkVueProject()).not.toThrow()
  })
})
