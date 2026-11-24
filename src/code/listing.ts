export interface CodeListing {
  lines: string[]
  anchors: Record<string, number>
}

export function lineForAnchor(
  listing: CodeListing,
  anchor: string | undefined,
): number | undefined {
  return anchor === undefined ? undefined : listing.anchors[anchor]
}
