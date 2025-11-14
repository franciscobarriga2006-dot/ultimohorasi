"use client";
import React, { useEffect } from "react";
import { useHelp } from "@/components/HelpWidget";

type Step = {
  title?: string;
  content: React.ReactNode;
};

export default function RegisterHelp({ steps }: { steps: Step[] }) {
  const { register, unregister } = useHelp();
  useEffect(() => {
    register(steps);
    return () => unregister();
  }, [register, unregister, steps]);

  return null;
}
