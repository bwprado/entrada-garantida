import { RevisarBackLink, RevisarClient } from './revisar-client'

export default function AdminImovelRevisarPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="border-b border-border bg-background px-4 py-3">
        <div className="container mx-auto max-w-4xl">
          <RevisarBackLink />
        </div>
      </div>
      <div className="flex-1 bg-muted/30 px-4 py-8">
        <div className="container mx-auto max-w-4xl">
          <RevisarClient />
        </div>
      </div>
    </div>
  )
}
