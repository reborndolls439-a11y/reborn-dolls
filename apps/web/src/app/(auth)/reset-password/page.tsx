import { Suspense } from "react";
import ResetPasswordForm from "./ResetPasswordForm";

function ResetPasswordSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-elevated border border-charcoal-100 p-8 animate-pulse">
      <div className="flex flex-col items-center mb-8 gap-3">
        <div className="h-7 w-40 bg-charcoal-200 rounded" />
        <div className="h-4 w-52 bg-charcoal-100 rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-charcoal-100 rounded-xl" />
        <div className="h-12 bg-charcoal-100 rounded-xl" />
        <div className="h-12 bg-bloom-rose/40 rounded-xl" />
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<ResetPasswordSkeleton />}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
