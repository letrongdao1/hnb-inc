"use client";

import { Spinner } from "@heroui/react";
import React from "react";

export default function Loader({ margin = 20 }: { margin?: number }) {
  return (
    <Spinner
      size="lg"
      variant="gradient"
      labelColor="foreground"
      color="default"
      style={{
        marginTop: `${margin}vh`,
      }}
    />
  );
}
