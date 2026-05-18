"use client"

import { ResultTag, ResultTagVariant } from "@/app/lib/bracket-utils"
import { cn } from "@/lib/utils"

interface ResultBadgeProps {
  tag: ResultTag
}

const variantClasses: Record<ResultTagVariant, string> = {
  success: "bg-green-500 text-white text-xs px-2 py-0.5 rounded-full",
  danger: "bg-red-500 text-white text-xs px-2 py-0.5 rounded-full",
  "danger-bold": "bg-red-800 text-white text-xs px-2 py-0.5 rounded-full border-2 border-red-600",
  info: "bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full",
}

export function ResultBadge({ tag }: ResultBadgeProps) {
  return (
    <span className={cn(variantClasses[tag.variant], "inline-block mt-1")}>
      {tag.label}
    </span>
  )
}

interface ResultBadgeListProps {
  tags: ResultTag[]
}

export function ResultBadgeList({ tags }: ResultBadgeListProps) {
  if (tags.length === 0) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {tags.map((tag, i) => (
        <ResultBadge key={i} tag={tag} />
      ))}
    </div>
  )
}