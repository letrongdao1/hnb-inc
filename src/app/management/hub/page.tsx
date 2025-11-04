"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";

export default function HubManagement() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/management/hub/news");
  }, [router]);

  return <Loader />;
}
