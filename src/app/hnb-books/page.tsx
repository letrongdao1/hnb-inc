"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Loader from "@/components/loader";

export default function HNBBooks() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/hnb-books/assets");
  }, [router]);

  return <Loader />;
}
