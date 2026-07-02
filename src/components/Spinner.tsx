import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface SpinnerProps {
  size?: number;
  className?: string;
}

export default function Spinner({ size = 14, className }: SpinnerProps) {
  return <Loader2 size={size} className={cn("animate-spin", className)} />;
}
