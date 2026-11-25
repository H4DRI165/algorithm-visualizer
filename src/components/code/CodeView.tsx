import type { CodeListing } from '../../code/listing'
import { lineForAnchor } from '../../code/listing'
import { useLanguage } from '../../hooks/useLanguage'
import { CodePanel } from './CodePanel'
import { VariablesPanel } from './VariablesPanel'

interface CodeViewProps {
  listing: CodeListing
  anchor?: string
  flashAnchor?: string
  vars?: Record<string, number>
}

export function CodeView({
  listing,
  anchor,
  flashAnchor,
  vars,
}: CodeViewProps) {
  const [lang, setLang] = useLanguage()

  return (
    <div className="flex flex-col gap-4">
      <CodePanel
        lines={listing.lines}
        activeLine={lineForAnchor(listing, anchor)}
        flashLine={lineForAnchor(listing, flashAnchor)}
        lang={lang}
        onLangChange={setLang}
      />
      <VariablesPanel vars={vars} />
    </div>
  )
}
