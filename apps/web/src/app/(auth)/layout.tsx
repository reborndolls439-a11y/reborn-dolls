import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-hero flex flex-col">
      <div className="p-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-taupe hover:text-charcoal transition-colors font-body"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to store
        </Link>
      </div>
      <div className="flex-1 flex items-center justify-center px-4 pb-12">
        {children}
      </div>
    </div>
  );
}
