'use client'

import { GatedToolPage } from '@/components/GatedToolPage'
import { splitIntoSections } from '@/lib/sections'

export default function ProofreaderPage() {
  return (
    <GatedToolPage
      toolId="proofreader"
      edgeFunction="proofreading"
      requiresDocument
      buildBody={(prompt, doc) => {
        const sections = splitIntoSections(doc!.text, doc!.filename)
        return {
          sections: { ...sections, instructions: prompt },
          filename: doc!.filename,
        }
      }}
    />
  )
}
