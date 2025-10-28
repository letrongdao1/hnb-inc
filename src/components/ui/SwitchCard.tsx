"use client";

import { Switch, SwitchProps } from "@heroui/react";
import React from "react";

export default function SwitchCard({
  title,
  description,
  checked,
  setChecked,
  switchProps,
  switchClassName,
}: {
  title: string;
  description?: string;
  checked: boolean;
  setChecked: React.Dispatch<React.SetStateAction<boolean>>;
  switchProps?: SwitchProps;
  switchClassName?: string;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded-md bg-inherit/80 px-4 py-2 md:gap-8">
      <div className="flex flex-1 flex-col justify-center gap-1">
        <p className="font-semibold">{title}</p>
        {description && <p className="text-xs opacity-60">{description}</p>}
      </div>

      <Switch
        checked={checked}
        onChange={(e) => {
          setChecked(e.target.checked);
        }}
        {...switchProps}
        className={switchClassName}
      />
    </div>
  );
}
