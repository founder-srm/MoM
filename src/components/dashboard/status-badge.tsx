import { Badge } from "@/components/ui/badge";

export function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "completed":
      return <Badge variant="default">{status}</Badge>;
    case "processing":
    case "transcribing":
    case "summarizing":
      return <Badge variant="secondary">{status}</Badge>;
    case "failed":
      return <Badge variant="destructive">{status}</Badge>;
    default:
      return <Badge variant="outline">{status || "unknown"}</Badge>;
  }
}
