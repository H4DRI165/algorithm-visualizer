import type { CodeListing } from '../../code/listing'
import { lineForAnchor } from '../../code/listing'
import { CodePanel } from './CodePanel'
import { VariablesPanel } from './VariablesPanel'

interface CodeViewProps {
  listing: CodeListing
  anchor?: string
  vars?: Record<string, number>
}

export function CodeView({ listing, anchor, vars }: CodeViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <CodePanel
        lines={listing.lines}
        activeLine={lineForAnchor(listing, anchor)}
      />
      <VariablesPanel vars={vars} />
    </div>
  )
}
