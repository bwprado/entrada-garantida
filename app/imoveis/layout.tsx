export default function ImoveisLayout({
  children
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 bg-gradient-to-br from-primary/5 via-background to-secondary/5 p-4">
      {children}
    </div>
  )
}
