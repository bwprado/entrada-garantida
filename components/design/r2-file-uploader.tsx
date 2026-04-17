import Image from 'next/image'

import { api } from '@/convex/_generated/api'
import { Id } from '@/convex/_generated/dataModel'
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

export function R2FileUploader({
  multiple = false,
  filesIds = [],
  handleUploadFiles,
  handleDeleteFile
}: {
  multiple?: boolean
  filesIds?: Id<'files'>[] | undefined
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

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-4">
        {filesUrls?.map((file) => (
          <FilePreviewCard
            key={file._id}
            file={file}
            handleDeleteFile={handleDeleteFile}
          />
        ))}
      </div>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger
          className={buttonVariants({ variant: 'outline', className: 'w-fit' })}
        >
          <Upload className="size-4" />
          Enviar arquivos
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Enviar arquivos</DialogTitle>
            <DialogDescription>
              Envie arquivos para o armazenamento R2.
            </DialogDescription>
          </DialogHeader>

          <FileUpload
            className="w-full max-w-md"
            value={files}
            onValueChange={setFiles}
            onFileReject={onFileReject}
            multiple
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
                  Ou clique para navegar (máx. 2 arquivos, até 5MB cada)
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
              Enviar arquivos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function FilePreviewCard({
  file,
  handleDeleteFile
}: {
  file: { _id: Id<'files'>; r2Key: string; url: string; name: string }
  handleDeleteFile: (fileId: Id<'files'>) => Promise<void>
}) {
  const [hoverOpen, setHoverOpen] = useState(false)
  const [alertOpen, setAlertOpen] = useState(false)

  return (
    <HoverCard
      open={hoverOpen && !alertOpen}
      onOpenChange={setHoverOpen}
      openDelay={150}
      closeDelay={100}
    >
      <HoverCardTrigger asChild>
        <div className="relative hover:outline-primary/50 hover:outline-2 hover:outline-offset-2 rounded-md p-1 size-24 aspect-square">
          <Image
            src={file.url}
            alt="File"
            sizes="100px"
            fill
            className="rounded-md overflow-hidden object-cover"
          />
          <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="size-7 absolute top-0 right-0"
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
      <HoverCardContent className="w-fit flex flex-col items-center justify-center">
        <div className="size-80 relative">
          <Image
            src={file.url}
            alt="File"
            sizes="200px"
            fill
            className="rounded-md object-contain"
          />
        </div>
        <p className="text-xs text-muted-foreground">{file.name}</p>
      </HoverCardContent>
    </HoverCard>
  )
}
