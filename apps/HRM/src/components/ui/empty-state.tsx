import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

interface EmptyStateProps {
  icon: React.ReactNode
  title: string
  description: string
  action?: { label: string; href: string }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="py-12 text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center text-slate-300">
          {icon}
        </div>
        <h3 className="text-base font-medium text-slate-700">{title}</h3>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        {action && (
          <Link href={action.href} className="mt-4 inline-block">
            <Button style={{ backgroundColor: "#1E3A5F" }} size="sm">
              {action.label}
            </Button>
          </Link>
        )}
      </CardContent>
    </Card>
  )
}
