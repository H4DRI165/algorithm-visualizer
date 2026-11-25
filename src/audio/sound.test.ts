import { afterEach, describe, expect, it, vi } from 'vitest'
import { SOUND_KEY, isSoundEnabled, setSoundEnabled } from './sound'
import { NOTES, playSound } from './tone'

afterEach(() => {
  setSoundEnabled(false)
  vi.unstubAllGlobals()
})

describe('sound setting', () => {
  it('is off by default', () => {
    expect(isSoundEnabled()).toBe(false)
  })

  it('can be switched on and is remembered', () => {
    setSoundEnabled(true)
    expect(isSoundEnabled()).toBe(true)
    expect(localStorage.getItem(SOUND_KEY)).toBe('on')
    setSoundEnabled(false)
    expect(localStorage.getItem(SOUND_KEY)).toBe('off')
  })
})

describe('playSound', () => {
  it('does nothing when off, and plays one tone per note when on', () => {
    const starts: number[] = []
    class FakeAudioContext {
      state = 'running'
      currentTime = 1
      destination = {}
      resume() {
        return Promise.resolve()
      }
      createGain() {
        return {
          gain: {
            setValueAtTime() {},
            exponentialRampToValueAtTime() {},
          },
          connect() {},
        }
      }
      createOscillator() {
        return {
          frequency: { value: 0 },
          connect() {},
          start(t: number) {
            starts.push(t)
          },
          stop() {},
        }
      }
    }
    vi.stubGlobal('AudioContext', FakeAudioContext)

    playSound('win')
    expect(starts).toHaveLength(0)

    setSoundEnabled(true)
    playSound('win')
    expect(starts).toHaveLength(NOTES.win.length)
    expect(starts[0]).toBe(1)
    expect(starts[1]).toBeGreaterThan(starts[0] ?? 0)
  })

  it('does not throw when audio is unavailable', () => {
    setSoundEnabled(true)
    vi.stubGlobal('AudioContext', undefined)
    expect(() => playSound('correct')).not.toThrow()
  })
})
