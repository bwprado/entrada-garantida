"use client"

import * as React from "react"
import { Upload, X, FileIcon } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

type FileUploadContextValue = {
  files: File[]
  setFiles: (next: File[]) => void
  mergeIncoming: (incoming: File[]) => void
  inputRef: React.RefObject<HTMLInputElement | null>
  inputId: string
  disabled?: boolean
  invalid?: boolean
  accept?: string
  maxFiles: number
  maxSize?: number
  multiple: boolean
  onFileValidate?: (file: File) => string | null | undefined
}

const FileUploadContext = React.createContext<FileUploadContextValue | null>(
  null
)

function useFileUploadContext() {
  const ctx = React.useContext(FileUploadContext)
  if (!ctx) {
    throw new Error("FileUpload components must be used within FileUpload")
  }
  return ctx
}

export function useFileUploadOptional() {
  return React.useContext(FileUploadContext)
}

function formatBytes(n: number) {
  if (n < 1024) return `${n} B`
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(1)} KB`
  return `${(n / (1024 * 1024)).toFixed(1)} MB`
}

export type FileUploadProps = Omit<
  React.HTMLAttributes<HTMLDivElement>,
  "onChange" | "defaultValue"
> & {
  value?: File[]
  defaultValue?: File[]
  onValueChange?: (files: File[]) => void
  accept?: string
  maxFiles?: number
  maxSize?: number
  multiple?: boolean
  disabled?: boolean
  invalid?: boolean
  onFileValidate?: (file: File) => string | null | undefined
}

export function FileUpload({
  value,
  defaultValue,
  onValueChange,
  accept,
  maxFiles = 10,
  maxSize,
  multiple = true,
  disabled,
  invalid,
  onFileValidate,
  className,
  children,
  ...props
}: FileUploadProps) {
  const inputRef = React.useRef<HTMLInputElement>(null)
  const inputId = React.useId()
  const [internal, setInternal] = React.useState<File[]>(defaultValue ?? [])
  const isControlled = value !== undefined
  const files = isControlled ? value : internal

  const setFiles = React.useCallback(
    (next: File[]) => {
      if (!isControlled) setInternal(next)
      onValueChange?.(next)
    },
    [isControlled, onValueChange]
  )

  const mergeIncoming = React.useCallback(
    (incoming: File[]) => {
      let base = multiple ? [...files] : []
      for (const file of incoming) {
        if (maxSize !== undefined && file.size > maxSize) continue
        const err = onFileValidate?.(file)
        if (err) continue
        if (base.length >= maxFiles) break
        base.push(file)
      }
      if (!multiple && base.length > 0) base = [base[base.length - 1]!]
      setFiles(base)
    },
    [files, setFiles, maxFiles, maxSize, multiple, onFileValidate]
  )

  const ctx = React.useMemo<FileUploadContextValue>(
    () => ({
      files,
      setFiles,
      mergeIncoming,
      inputRef,
      inputId,
      disabled,
      invalid,
      accept,
      maxFiles,
      maxSize,
      multiple,
      onFileValidate
    }),
    [
      files,
      setFiles,
      mergeIncoming,
      inputId,
      disabled,
      invalid,
      accept,
      maxFiles,
      maxSize,
      multiple,
      onFileValidate
    ]
  )

  return (
    <FileUploadContext.Provider value={ctx}>
      <div className={cn("space-y-4", className)} {...props}>
        <input
          id={inputId}
          ref={inputRef}
          type="file"
          className="sr-only"
          aria-label="Selecionar arquivos para envio"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            const list = e.target.files
            if (list?.length) mergeIncoming(Array.from(list))
            e.target.value = ""
          }}
        />
        {children}
      </div>
    </FileUploadContext.Provider>
  )
}

export type FileUploadDropzoneProps = React.HTMLAttributes<HTMLDivElement>

export function FileUploadDropzone({
  className,
  children,
  ...props
}: FileUploadDropzoneProps) {
  const { mergeIncoming, disabled, invalid, inputRef } = useFileUploadContext()
  const [dragging, setDragging] = React.useState(false)

  return (
    <div
      role="button"
      tabIndex={0}
      data-dragging={dragging ? "" : undefined}
      data-disabled={disabled ? "" : undefined}
      data-invalid={invalid ? "" : undefined}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault()
          inputRef.current?.click()
        }
      }}
      onClick={() => {
        if (!disabled) inputRef.current?.click()
      }}
      onDragEnter={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragging(true)
      }}
      onDragLeave={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragging(false)
      }}
      onDragOver={(e) => {
        e.preventDefault()
        e.stopPropagation()
      }}
      onDrop={(e) => {
        e.preventDefault()
        e.stopPropagation()
        setDragging(false)
        if (disabled) return
        const list = e.dataTransfer.files
        if (!list?.length) return
        mergeIncoming(Array.from(list))
      }}
      className={cn(
        "flex min-h-[140px] cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-8 text-center transition-colors",
        dragging && "border-primary bg-primary/5",
        invalid && "border-destructive",
        disabled && "pointer-events-none opacity-50",
        className
      )}
      {...props}>
      {children ?? (
        <>
          <Upload className="mb-2 size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Arraste imagens aqui ou clique para escolher
          </p>
        </>
      )}
    </div>
  )
}

export type FileUploadTriggerProps = React.ComponentProps<typeof Button>

export function FileUploadTrigger({
  className,
  children,
  disabled,
  onClick,
  ...props
}: FileUploadTriggerProps) {
  const { inputRef } = useFileUploadContext()
  const ctx = useFileUploadContext()

  return (
    <Button
      type="button"
      variant="outline"
      disabled={ctx.disabled || disabled}
      className={className}
      onClick={(e) => {
        onClick?.(e)
        inputRef.current?.click()
      }}
      {...props}>
      {children ?? "Escolher arquivos"}
    </Button>
  )
}

export type FileUploadListProps = React.HTMLAttributes<HTMLUListElement> & {
  orientation?: "vertical" | "horizontal"
}

export function FileUploadList({
  className,
  orientation = "vertical",
  ...props
}: FileUploadListProps) {
  return (
    <ul
      data-orientation={orientation}
      className={cn(
        orientation === "horizontal"
          ? "flex flex-row flex-wrap gap-2"
          : "flex flex-col gap-2",
        className
      )}
      {...props}
    />
  )
}

export type FileUploadItemProps = React.HTMLAttributes<HTMLLIElement> & {
  value: File
}

export function FileUploadItem({
  value: file,
  className,
  children,
  ...props
}: FileUploadItemProps) {
  return (
    <li
      className={cn(
        "flex items-center gap-3 rounded-md border bg-card p-3 text-left",
        className
      )}
      {...props}>
      {children ?? (
        <>
          <FileUploadItemPreview file={file} />
          <FileUploadItemMetadata file={file} />
          <FileUploadItemDelete file={file} />
        </>
      )}
    </li>
  )
}

export function FileUploadItemPreview({
  file,
  className,
  ...props
}: { file: File } & React.HTMLAttributes<HTMLDivElement>) {
  const [src, setSrc] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (!file.type.startsWith("image/")) {
      setSrc(null)
      return
    }
    const url = URL.createObjectURL(file)
    setSrc(url)
    return () => URL.revokeObjectURL(url)
  }, [file])

  if (src) {
    return (
      <div
        className={cn(
          "relative size-14 shrink-0 overflow-hidden rounded-md border bg-muted",
          className
        )}
        {...props}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt="" className="size-full object-cover" />
      </div>
    )
  }

  return (
    <div
      className={cn(
        "flex size-14 shrink-0 items-center justify-center rounded-md border bg-muted",
        className
      )}
      {...props}>
      <FileIcon className="size-6 text-muted-foreground" />
    </div>
  )
}

export function FileUploadItemMetadata({
  file,
  className,
  ...props
}: { file: File } & React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn("min-w-0 flex-1", className)} {...props}>
      <p className="truncate text-sm font-medium">{file.name}</p>
      <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
    </div>
  )
}

export function FileUploadItemProgress(_props: {
  file: File
  className?: string
}) {
  return null
}

export function FileUploadItemDelete({
  file,
  className,
  ...props
}: { file: File } & React.ComponentProps<typeof Button>) {
  const { files, setFiles } = useFileUploadContext()

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      className={cn("shrink-0", className)}
      aria-label="Remover arquivo"
      onClick={() => setFiles(files.filter((f) => f !== file))}
      {...props}>
      <X className="size-4" />
    </Button>
  )
}

export function FileUploadClear({
  className,
  children,
  ...props
}: React.ComponentProps<typeof Button>) {
  const { files, setFiles, disabled } = useFileUploadContext()

  if (files.length === 0) return null

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      disabled={disabled}
      className={className}
      onClick={() => setFiles([])}
      {...props}>
      {children ?? "Limpar todos"}
    </Button>
  )
}

FileUpload.displayName = "FileUpload"
