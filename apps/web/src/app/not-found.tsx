import Link from "next/link";
import { Button } from "@reborn/ui";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <p className="font-heading text-8xl font-bold text-bloom-rose-100 mb-0 leading-none select-none" aria-hidden>404</p>
        <h1 className="font-heading text-2xl font-bold text-charcoal -mt-4 mb-3">Page Not Found</h1>
        <p className="text-taupe font-body mb-8 leading-relaxed">
          The page you're looking for doesn't exist or has been moved. Let's get you back to something beautiful.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/"><Button variant="primary">Go Home</Button></Link>
          <Link href="/shop"><Button variant="outline">Shop Collection</Button></Link>
        </div>
      </div>
    </div>
  );
}
