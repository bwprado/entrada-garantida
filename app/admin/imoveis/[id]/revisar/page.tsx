import { RevisarBackLink, RevisarClient } from './revisar-client'

export default function AdminImovelRevisarPage() {
  return (
    <div className="flex w-full flex-1 flex-col">
      <div className="container mx-auto max-w-4xl">
        <RevisarClient />
      </div>
    </div>
  )
}
