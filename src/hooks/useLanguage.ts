import { useSyncExternalStore } from 'react'
import { getLang, setLang, subscribeLang } from '../code/language'
import type { Lang } from '../code/listing'

export function useLanguage(): readonly [Lang, (lang: Lang) => void] {
  const lang = useSyncExternalStore(subscribeLang, getLang)
  return [lang, setLang]
}
