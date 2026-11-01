import { Suspense } from "react";
import LoginForm from "./LoginForm";

function LoginSkeleton() {
  return (
    <div className="bg-white rounded-3xl shadow-elevated border border-charcoal-100 p-8 animate-pulse">
      <div className="flex flex-col items-center mb-8 gap-3">
        <div className="w-10 h-10 rounded-full bg-charcoal-200" />
        <div className="h-6 w-36 bg-charcoal-200 rounded" />
        <div className="h-4 w-44 bg-charcoal-100 rounded" />
      </div>
      <div className="space-y-4">
        <div className="h-12 bg-charcoal-100 rounded-xl" />
        <div className="h-12 bg-charcoal-100 rounded-xl" />
        <div className="h-4 w-28 bg-charcoal-100 rounded self-end ml-auto" />
        <div className="h-12 bg-bloom-rose/40 rounded-xl" />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-ivory flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md">
        <Suspense fallback={<LoginSkeleton />}>
          <LoginForm />
        </Suspense>
      </div>
    </div>
  );
}
