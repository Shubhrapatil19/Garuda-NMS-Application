"use client";

import { useRouter } from "next/navigation";
import DeviceOnboardingView from "@/components/DeviceOnboardingView";

export default function DeviceOnboardingPage() {
  const router = useRouter();

  return (
    <DeviceOnboardingView onBackToDashboard={() => router.push("/dashboard")} />
  );
}
