'use client'

import { GatedToolPage } from '@/components/GatedToolPage'

export default function PaperInsightsPage() {
  return (
    <GatedToolPage
      toolId="insights"
      edgeFunction="paper-insights"
      requiresDocument
      showScore
      buildBody={(prompt, doc) => ({
        document_text: `${prompt}\n\n${doc!.text}`.slice(0, 120000),
        filename: doc!.filename,
      })}
    />
  )
}
