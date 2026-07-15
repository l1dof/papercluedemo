'use client'

import { GatedToolPage } from '@/components/GatedToolPage'
import { splitIntoSections } from '@/lib/sections'

export default function JournalFormattingPage() {
  return (
    <GatedToolPage
      toolId="journal"
      edgeFunction="journal-formatting"
      buildBody={(prompt, doc) => {
        // Per the backend contract (and the security design), only
        // bibliographic metadata goes to journal matching — never the
        // full manuscript text.
        if (doc) {
          const sections = splitIntoSections(doc.text, doc.filename)
          return {
            title: sections.title ?? doc.filename,
            abstract: (sections.abstract ?? doc.text.slice(0, 2000)).slice(0, 4000),
            keywords: prompt
              .split(/[,;]/)
              .map((k) => k.trim())
              .filter(Boolean)
              .slice(0, 10),
          }
        }
        return { title: prompt, abstract: prompt, keywords: [] }
      }}
    />
  )
}
