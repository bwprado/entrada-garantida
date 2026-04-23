"use client"

import { cn } from "@/lib/utils"
import {
  File,
  FileArchive,
  FileAudio,
  FileCode,
  FileCog,
  FileImage,
  FileSpreadsheet,
  FileText,
  FileVideo,
  type LucideIcon
} from "lucide-react"

export function isImageMimeType(mime: string) {
  return (mime || "").startsWith("image/")
}

/** True when we can show `next/image` (image MIME or known image extension if MIME is empty). */
export function canUseImagePreview(mime: string, fileName: string) {
  if (isImageMimeType(mime)) return true
  if ((mime || "").length > 0) return false
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""
  return ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "heic", "avif"].includes(
    ext
  )
}

type IconDescriptor = {
  Icon: LucideIcon
  iconClass: string
}

/**
 * Picks a Lucide icon and accent for a file from MIME type and name (for missing MIME).
 */
export function getFileIconDescriptor(
  mime: string,
  fileName: string
): IconDescriptor {
  const type = mime || ""
  const ext = fileName.split(".").pop()?.toLowerCase() ?? ""

  if (type.startsWith("video/") || ["webm", "mp4", "mov", "avi", "mkv"].includes(ext)) {
    return { Icon: FileVideo, iconClass: "text-sky-600 dark:text-sky-400" }
  }
  if (type.startsWith("audio/") || ["mp3", "wav", "ogg", "flac", "m4a"].includes(ext)) {
    return { Icon: FileAudio, iconClass: "text-violet-600 dark:text-violet-400" }
  }

  if (type === "application/pdf" || ext === "pdf") {
    return { Icon: FileText, iconClass: "text-red-600 dark:text-red-400" }
  }

  if (
    type ===
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
    type === "application/vnd.ms-excel" ||
    ["xlsx", "xls", "csv", "ods", "tsv"].includes(ext)
  ) {
    return {
      Icon: FileSpreadsheet,
      iconClass: "text-emerald-600 dark:text-emerald-400"
    }
  }

  if (type === "text/markdown" || ext === "md" || ext === "markdown") {
    return { Icon: FileText, iconClass: "text-slate-600 dark:text-slate-300" }
  }

  if (type.startsWith("text/") || ["txt", "rtf", "log"].includes(ext)) {
    return { Icon: FileText, iconClass: "text-muted-foreground" }
  }

  if (
    [
      "html",
      "css",
      "js",
      "jsx",
      "ts",
      "tsx",
      "json",
      "xml",
      "php",
      "py",
      "rb",
      "java",
      "c",
      "cpp",
      "cs"
    ].includes(ext) ||
    type.includes("json") ||
    type.includes("javascript")
  ) {
    return { Icon: FileCode, iconClass: "text-amber-600 dark:text-amber-400" }
  }

  if (["zip", "rar", "7z", "tar", "gz", "bz2"].includes(ext) || type.includes("zip")) {
    return { Icon: FileArchive, iconClass: "text-amber-800 dark:text-amber-500" }
  }

  if (
    type.startsWith("image/") ||
    ["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp", "ico", "heic", "avif"].includes(
      ext
    )
  ) {
    return { Icon: FileImage, iconClass: "text-cyan-600 dark:text-cyan-400" }
  }

  if (
    type.startsWith("application/") ||
    ["exe", "msi", "app", "apk", "deb", "rpm", "dll", "so"].includes(ext) ||
    ext === "doc" ||
    ext === "docx" ||
    type.includes("msword") ||
    type.includes("wordprocessingml")
  ) {
    return { Icon: FileCog, iconClass: "text-muted-foreground" }
  }

  return { Icon: File, iconClass: "text-muted-foreground" }
}

/** Icon only — matches the old file-upload `getFileIcon` slot (sits inside the bordered cell). */
export function FileTypeGlyph({
  type,
  name,
  className
}: {
  type: string
  name: string
  className?: string
}) {
  const { Icon, iconClass } = getFileIconDescriptor(type, name)
  return (
    <Icon
      className={cn("size-10", iconClass, className)}
      strokeWidth={1.5}
      aria-hidden
    />
  )
}

export function FileTypeIconView({
  type,
  name,
  className,
  iconClassName
}: {
  type: string
  name: string
  className?: string
  /** Tailwind for the icon SVG (size + color) */
  iconClassName?: string
}) {
  const { Icon, iconClass } = getFileIconDescriptor(type, name)
  return (
    <div
      className={cn(
        "flex size-full min-h-0 min-w-0 items-center justify-center rounded-md border border-border/60 bg-gradient-to-b from-muted/50 to-muted/20",
        className
      )}
    >
      <Icon
        className={cn("size-10 shrink-0", iconClass, iconClassName)}
        strokeWidth={1.5}
        aria-hidden
      />
    </div>
  )
}
