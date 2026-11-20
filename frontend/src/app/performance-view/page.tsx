"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import PerformanceView from "@/components/views/PerformanceView";

export default function PerformanceViewIndexPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/performance-view/bandwidth-utilization");
  }, [router]);

  return <PerformanceView />;
}
