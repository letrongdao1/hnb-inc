"use client";

import { forwardRef } from "react";
import DatePicker, { DatePickerProps, registerLocale } from "react-datepicker";
import { Input, InputProps } from "@heroui/react";
import "react-datepicker/dist/react-datepicker.css";
import { vi } from "date-fns/locale";
import { CalendarIcon } from "@/components/svg";

registerLocale("vi", vi);

type CustomDatepickerProps = DatePickerProps & {
  inputProps?: InputProps;
};

const HeroUIInput = forwardRef<HTMLInputElement, InputProps>((props, ref) => {
  return (
    <Input
      ref={ref}
      value={props.value}
      onChange={props.onChange}
      onClick={props.onClick}
      readOnly
      startContent={<CalendarIcon size={20} />}
      {...props}
    />
  );
});

HeroUIInput.displayName = "HeroUIInput";

export default function CustomDatepicker({
  inputProps,
  ...datePickerProps
}: CustomDatepickerProps) {
  return (
    <DatePicker
      locale={"vi"}
      popperProps={{
        strategy: "absolute",
        placement: "bottom-start"
      }}
      {...datePickerProps}
      customInput={<HeroUIInput {...inputProps} />}
    />
  );
}
