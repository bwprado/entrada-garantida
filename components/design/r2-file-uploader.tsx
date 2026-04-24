import Image from 'next/image'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
import { canUseImagePreview, FileTypeIconView } from '@/lib/file-type-icon'
import { formatBytes } from '@/lib/utils'
import { useQuery } from 'convex/react'
import { Loader2, Trash, Upload, X } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Button, buttonVariants } from '../ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '../ui/dialog'
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger
} from '../ui/file-upload'
import { ScrollArea } from '../ui/scroll-area'
import { HoverCard, HoverCardTrigger, HoverCardContent } from '../ui/hover-card'
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction
} from '../ui/alert-dialog'
import {
  Sortable,
  SortableContent,
  SortableItem,
  SortableOverlay
} from '../ui/sortable'

export function R2FileUploader({
  multiple = false,
  filesIds = [],
  totalFileSlots,
  perPickMaxFiles,
  reorderable = false,
  onReorderIds,
  handleUploadFiles,
  handleDeleteFile
}: {
  multiple?: boolean
  filesIds?: Id<'files'>[] | undefined
  /** When set with `multiple`, hides add when count reaches cap and caps picker batch size. */
  totalFileSlots?: number
  /** Max files per open-file dialog when `multiple` (defaults: 2 without total cap, else `totalFileSlots`). */
  perPickMaxFiles?: number
  /** When `multiple`, drag thumbnails to reorder; first photo is the listing cover. */
  reorderable?: boolean
  onReorderIds?: (next: Id<'files'>[]) => void
  handleUploadFiles: (files: File[]) => Promise<void>
  handleDeleteFile: (fileId: Id<'files'>) => Promise<void>
}) {
  const [files, setFiles] = useState<File[]>([])
  const [open, setOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)

  const filesUrls = useQuery(
    api.r2.getFileUrlAndMetadata,
    filesIds && filesIds.length > 0 ? { fileIds: filesIds } : 'skip'
  )

  const onFileReject = useCallback((file: File, message: string) => {
    toast(message, {
      description: `"${file.name.length > 20 ? `${file.name.slice(0, 20)}...` : file.name}" has been rejected`
    })
  }, [])

  const storedCount = filesIds?.length ?? 0
  const hasStoredFile = !multiple && storedCount > 0
  const remainingSlots =
    multiple && totalFileSlots !== undefined
      ? Math.max(0, totalFileSlots - storedCount)
      : Number.POSITIVE_INFINITY
  const showUploadTrigger = multiple
    ? totalFileSlots === undefined || storedCount < totalFileSlots
    : storedCount === 0

  const pickerMaxFiles = multiple
    ? totalFileSlots !== undefined
      ? Math.min(
          perPickMaxFiles ?? totalFileSlots,
          Math.max(0, remainingSlots)
        )
      : (perPickMaxFiles ?? 2)
    : 1

  const orderedIds = filesIds ?? []
  const usePhotoReorder =
    Boolean(multiple && reorderable && onReorderIds && orderedIds.length > 0)

  return (
    <div className="flex flex-col gap-4">
      {usePhotoReorder ? (
        <Sortable
          value={orderedIds}
          getItemValue={(id) => id}
          onValueChange={(next) => onReorderIds?.(next as Id<'files'>[])}
          orientation="mixed"
        >
          <SortableContent className="flex flex-wrap gap-4">
            {orderedIds.map((id) => {
                const file = filesUrls?.find((f) => f._id === id)
                const isCover = id === orderedIds[0]
                return (
                  <SortableItem
                    key={id}
                    value={id}
                    asHandle
                    className="shrink-0 touch-manipulation"
                  >
                    {file ? (
                      <FilePreviewCard
                        file={file}
                        handleDeleteFile={handleDeleteFile}
                        isCover={isCover}
                      />
                    ) : (
                      <div
                        className="size-24 shrink-0 animate-pulse rounded-md bg-muted"
                        aria-hidden
                      />
                    )}
                  </SortableItem>
                )
              })}
            </SortableContent>
            <SortableOverlay className="z-50">
              {({ value }) => {
                const f = filesUrls?.find((x) => x._id === value)
                if (!f) {
                  return (
                    <div className="size-24 rounded-md border bg-muted shadow-lg" />
                  )
                }
                const overlayImage = canUseImagePreview(f.type, f.name)
                return (
                  <div className="pointer-events-none relative size-24 overflow-hidden rounded-md border bg-background shadow-lg">
                    {overlayImage ? (
                      <Image
                        src={f.url}
                        alt=""
                        sizes="100px"
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <FileTypeIconView
                        type={f.type}
                        name={f.name}
                        className="size-full"
                        iconClassName="size-9"
                      />
                    )}
                  </div>
                )
              }}
            </SortableOverlay>
        </Sortable>
      ) : (
        <div className="flex flex-wrap gap-4">
          {hasStoredFile && filesUrls === undefined && (
            <div
              className="size-24 shrink-0 animate-pulse rounded-md bg-muted"
              aria-hidden
            />
          )}
          {filesUrls?.map((file) => (
            <FilePreviewCard
              key={file._id}
              file={file}
              handleDeleteFile={handleDeleteFile}
            />
          ))}
        </div>
      )}
      {showUploadTrigger && (
        <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className={buttonVariants({ variant: 'outline', className: 'w-fit' })}
        >
          <Upload className="size-4" />
          {multiple ? 'Enviar arquivos' : 'Enviar arquivo'}
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {multiple ? 'Enviar arquivos' : 'Enviar arquivo'}
            </DialogTitle>
            <DialogDescription>
              {multiple
                ? 'Envie arquivos para o armazenamento R2.'
                : 'Envie um arquivo para o armazenamento R2.'}
            </DialogDescription>
          </DialogHeader>

          <FileUpload
            className="w-full max-w-md"
            value={files}
            onValueChange={setFiles}
            onFileReject={onFileReject}
            multiple={multiple}
            maxFiles={pickerMaxFiles}
          >
            <FileUploadDropzone>
              <div className="flex flex-col items-center gap-1 text-center">
                <div className="flex items-center justify-center rounded-full border p-2.5">
                  <Upload className="size-6 text-muted-foreground" />
                </div>
                <p className="font-medium text-sm">
                  Arraste e solte arquivos aqui
                </p>
                <p className="text-muted-foreground text-xs">
                  Ou clique para navegar (
                  {multiple
                    ? `máx. ${pickerMaxFiles} arquivo${pickerMaxFiles === 1 ? '' : 's'}`
                    : '1 arquivo'}
                  , até 5MB cada)
                </p>
              </div>
              <FileUploadTrigger asChild>
                <Button variant="outline" size="sm" className="mt-2 w-fit">
                  Navegar arquivos
                </Button>
              </FileUploadTrigger>
            </FileUploadDropzone>
            <ScrollArea className="max-h-[400px]">
              <FileUploadList>
                {files.map((file, index) => (
                  <FileUploadItem key={index} value={file}>
                    <FileUploadItemPreview />
                    <FileUploadItemMetadata />
                    <FileUploadItemDelete asChild>
                      <Button variant="ghost" size="icon" className="size-7">
                        <X />
                      </Button>
                    </FileUploadItemDelete>
                  </FileUploadItem>
                ))}
              </FileUploadList>
            </ScrollArea>
          </FileUpload>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancelar
              </Button>
            </DialogClose>
            <Button
              onClick={async () => {
                setIsUploading(true)
                try {
                  await handleUploadFiles(files)
                  setFiles([])
                  setOpen(false)
                } catch (error) {
                  toast.error('Erro ao enviar arquivos')
                  console.error(error)
                } finally {
                  setIsUploading(false)
                }
              }}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="size-4 animate-spin" /> : null}
              {multiple ? 'Enviar arquivos' : 'Enviar'}
            </Button>
          </DialogFooter>
        </DialogContent>
        </Dialog>
      )}
    </div>
  )
}

function FilePreviewCard({
  file,
  handleDeleteFile,
  isCover = false
}: {
  file: {
    _id: Id<'files'>
    r2Key: string
    url: string
    name: string
    type: string
    size?: number
  }
  handleDeleteFile: (fileId: Id<'files'>) => Promise<void>
  isCover?: boolean
}) {
  const [hoverOpen, setHoverOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)
  const isImage = canUseImagePreview(file.type, file.name)
  const ext = file.name.includes('.')
    ? `.${file.name.split('.').pop()}`
    : '—'
  const tipoLabel = file.type?.trim() || 'Não informado'

  return (
    <HoverCard
      open={hoverOpen && !alertOpen}
      onOpenChange={setHoverOpen}
      openDelay={150}
      closeDelay={100}
    >
      <HoverCardTrigger asChild>
        <div className="relative hover:outline-primary/50 hover:outline-2 hover:outline-offset-2 rounded-md p-1 size-24 aspect-square">
          {isCover ? (
            <span className="pointer-events-none absolute inset-x-0 top-0 z-1 rounded-t-md bg-primary px-0.5 py-0.5 text-center text-[10px] font-medium leading-tight text-primary-foreground">
              Capa do anúncio
            </span>
          ) : null}
          {isImage ? (
            <Image
              src={file.url}
              alt=""
              sizes="100px"
              fill
              className="rounded-md overflow-hidden object-cover"
            />
          ) : (
            <FileTypeIconView
              type={file.type}
              name={file.name}
              className="size-full overflow-hidden"
              iconClassName="size-9"
            />
          )}
          <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 z-10 size-7"
                onPointerDown={(e) => e.stopPropagation()}
              >
                <Trash />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir arquivo?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta ação não pode ser desfeita. Será removido o arquivo da
                  base de dados e o arquivo será excluído do R2.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={() => handleDeleteFile(file._id)}>
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-80 max-w-[min(100vw-2rem,20rem)] p-0">
        <div className="flex max-h-[min(50vh,22rem)] flex-col">
          {isImage ? (
            <div className="relative aspect-video w-full shrink-0 bg-muted/40">
              <Image
                src={file.url}
                alt=""
                sizes="(max-width: 24rem) 100vw, 20rem"
                fill
                className="object-contain p-2"
              />
            </div>
          ) : (
            <div className="flex shrink-0 items-center justify-center border-b border-border/60 bg-muted/30 py-6">
              <FileTypeIconView
                type={file.type}
                name={file.name}
                className="h-32 w-40 border-border/80"
                iconClassName="!size-16"
              />
            </div>
          )}
          <div className="space-y-2.5 p-3 text-sm" role="group" aria-label="Informações do arquivo">
            <div>
              <p className="text-xs font-medium text-muted-foreground">Nome</p>
              <p className="mt-0.5 break-words font-medium leading-snug text-foreground">
                {file.name}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-x-3 gap-y-2">
              <div>
                <p className="text-xs font-medium text-muted-foreground">Tipo</p>
                <p className="mt-0.5 break-all font-mono text-xs leading-snug text-foreground">
                  {tipoLabel}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">
                  Extensão
                </p>
                <p className="mt-0.5 font-mono text-xs text-foreground">
                  {ext}
                </p>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Tamanho</p>
              <p className="mt-0.5 text-foreground tabular-nums">
                {formatBytes(file.size ?? 0)}
              </p>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}
