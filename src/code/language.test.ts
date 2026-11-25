import { afterEach, describe, expect, it } from 'vitest'
import { LANG_KEY, getLang, setLang } from './language'
import { isLang } from './listing'

afterEach(() => setLang('ts'))

describe('language setting', () => {
  it('is TypeScript by default', () => {
    expect(getLang()).toBe('ts')
  })

  it('can be changed and is remembered', () => {
    setLang('python')
    expect(getLang()).toBe('python')
    expect(localStorage.getItem(LANG_KEY)).toBe('python')
  })

  it('only accepts known languages', () => {
    expect(isLang('java')).toBe(true)
    expect(isLang('cobol')).toBe(false)
    expect(isLang(null)).toBe(false)
  })
})
