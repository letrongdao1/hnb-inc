"use client";

import Navbar from "@/components/navbar";
import { UserInfo } from "@/interfaces/user";
import { Suspense } from "react";

export default function ClientLayout({
  user,
  children,
}: {
  user: UserInfo | null;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen w-full flex-col items-stretch justify-start gap-8 px-2 py-4 sm:p-10">
      <Navbar user={user} />
      <main className="flex w-full flex-1 flex-col items-center justify-start">
        <Suspense fallback={null}>{children}</Suspense>
      </main>
    </div>
  );
}
