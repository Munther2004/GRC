import { cn } from "@/lib/utils"

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn(
        "bg-gradient-to-r from-muted via-muted/60 to-muted rounded-md",
        "animate-shimmer bg-[length:200%_100%]",
        "shine",
        className
      )}
      {...props}
    />
  )
}

export function SkeletonCard({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4 rounded-lg border border-border bg-card p-6 animate-in fade-in duration-500">
      <Skeleton className="h-8 w-1/3" />
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-4 w-full" />
      ))}
      <div className="pt-4 flex gap-2">
        <Skeleton className="h-10 w-20 rounded-md" />
        <Skeleton className="h-10 w-20 rounded-md" />
      </div>
    </div>
  )
}

export function SkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="rounded-lg border border-border bg-card p-4 animate-in fade-in"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          <Skeleton className="h-6 mb-3" />
          <Skeleton className="h-4 mb-2" />
          <Skeleton className="h-4 w-3/4 mb-3" />
          <Skeleton className="h-10 rounded-md mt-4" />
        </div>
      ))}
    </div>
  )
}

export { Skeleton }
