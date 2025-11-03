"use client";
import { CheckIcon, XIcon } from "@/components/svg";
import React, { useState, useRef, useEffect } from "react";

interface Option {
  id: number;
  name: string;
  value: string;
  color?: string;
  icon?: string;
}

export default function MultiSelect({
  options,
  selectedOptions,
  setSelectedOptions,
}: {
  options: Option[];
  selectedOptions: Option[];
  setSelectedOptions: React.Dispatch<React.SetStateAction<Option[]>>;
}) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [highlightedIndex, setHighlightedIndex] = useState<number>(0);

  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredOptions = options.filter(
    (option) =>
      !selectedOptions.some((selected) => selected.id === option.id) &&
      option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleOption = (option: Option) => {
    setSelectedOptions((prev) =>
      prev.some((o) => o.id === option.id)
        ? prev.filter((o) => o.id !== option.id)
        : [...prev, option]
    );
    setSearchTerm("");
    inputRef.current?.focus();
  };

  const removeOption = (option: Option) => {
    setSelectedOptions(selectedOptions.filter((o) => o.id !== option.id));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && searchTerm === "" && selectedOptions.length > 0) {
      removeOption(selectedOptions[selectedOptions.length - 1]);
    }

    if (!isOpen) {
      if (e.key === "ArrowDown" || e.key === "Enter") {
        setIsOpen(true);
        setHighlightedIndex(0);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev + 1) % filteredOptions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev - 1 + filteredOptions.length) % filteredOptions.length);
        break;
      case "Enter":
        e.preventDefault();
        if (filteredOptions[highlightedIndex]) {
          toggleOption(filteredOptions[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        break;
    }
  };

  useEffect(() => {
    if (isOpen) {
      setHighlightedIndex(0);
    }
  }, [isOpen, searchTerm]);

  return (
    <div className="mx-auto w-full max-w-sm" ref={wrapperRef}>
      <div className="relative">
        <div
          className="flex min-h-[40px] cursor-text flex-wrap items-center gap-2 rounded-md border border-slate-300 bg-white p-2 text-sm shadow-sm transition-colors focus-within:ring-2 focus-within:ring-slate-900 focus-within:ring-offset-2 dark:border-slate-600 dark:bg-black dark:focus-within:ring-slate-100"
          onClick={() => {
            setIsOpen(true);
            inputRef.current?.focus();
          }}
        >
          {selectedOptions.map((option) => (
            <div
              key={option.id}
              className="flex items-center gap-1.5 rounded-md bg-slate-100 px-2 py-1 font-medium text-slate-800 dark:bg-slate-800 dark:text-slate-200"
            >
              {option.name}
              <button
                type="button"
                className="rounded-full p-0.5 text-slate-500 transition-colors duration-200 hover:bg-slate-200 hover:text-slate-800 focus:ring-2 focus:ring-slate-400 focus:ring-offset-1 focus:outline-none dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-200 dark:focus:ring-slate-500"
                onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                  e.stopPropagation();
                  removeOption(option);
                }}
              >
                <XIcon />
              </button>
            </div>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
            onFocus={() => setIsOpen(true)}
            onKeyDown={handleKeyDown}
            placeholder={selectedOptions.length === 0 ? "Select frameworks..." : ""}
            className="flex-grow border-none bg-transparent p-0 text-sm text-slate-900 placeholder-slate-400 outline-none dark:text-slate-100 dark:placeholder-slate-500"
          />
        </div>

        {isOpen && (
          <div className="animate-popover-in absolute z-10 mt-2 max-h-60 w-full overflow-y-auto rounded-md border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-black">
            <ul className="p-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
                  <li
                    key={option.id}
                    className={`flex cursor-pointer items-center justify-between gap-2 rounded-md p-2 transition-colors duration-150 ${highlightedIndex === index ? "bg-slate-100 text-slate-900 dark:bg-slate-800 dark:text-slate-100" : "text-slate-700 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100"}`}
                    onClick={() => toggleOption(option)}
                    onMouseEnter={() => setHighlightedIndex(index)}
                  >
                    {option.icon}
                    {option.name}
                    {selectedOptions.some((o) => o.id === option.id) && <CheckIcon />}
                  </li>
                ))
              ) : (
                <li className="p-2 text-center text-slate-500 dark:text-slate-400">
                  Không có lựa chọn.
                </li>
              )}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
