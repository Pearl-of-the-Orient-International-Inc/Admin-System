/* eslint-disable react/no-unescaped-entities */
"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Option {
  value: string;
  label: string;
}

interface CreatableSelectProps {
  options: Option[];
  defaultValue?: Option;
  value?: string;
  onValueChange?: (value: string) => void;
  isLoading?: boolean;
  mutate?: () => void;
  name?: string;
  id?: string;
  placeholder?: string;
  searchPlaceholder?: string;
  disabled?: boolean;
  className?: string;
}

export default function CreatableSelect({
  options,
  defaultValue,
  value: controlledValue,
  onValueChange,
  isLoading = false,
  mutate,
  name,
  id,
  placeholder = "Select option...",
  searchPlaceholder = "Search option...",
  disabled = false,
  className,
}: CreatableSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [internalValue, setInternalValue] = React.useState<string>(
    defaultValue?.value || ""
  );
  const [query, setQuery] = React.useState("");
  const [createdOptions, setCreatedOptions] = React.useState<Option[]>([]);

  // Determine if component is controlled or uncontrolled
  const isControlled = controlledValue !== undefined;
  const currentValue = isControlled ? controlledValue : internalValue;

  // Combine original options with created options
  const allOptions = React.useMemo(() => {
    const combined = [...options, ...createdOptions];
    // Remove duplicates based on value
    const seen = new Set<string>();
    return combined.filter((option) => {
      if (seen.has(option.value.toLowerCase())) return false;
      seen.add(option.value.toLowerCase());
      return true;
    });
  }, [options, createdOptions]);

  // Filter options based on query
  const filteredOptions = React.useMemo(() => {
    if (!query) return allOptions;
    return allOptions.filter((option) =>
      option.label.toLowerCase().includes(query.toLowerCase())
    );
  }, [allOptions, query]);

  // Check if we can create a new option
  const canCreate = React.useMemo(() => {
    if (!query.trim()) return false;
    return !allOptions.some(
      (option) => option.label.toLowerCase() === query.toLowerCase()
    );
  }, [query, allOptions]);

  // Get the display label for the current value
  const displayLabel = React.useMemo(() => {
    const option = allOptions.find((opt) => opt.value === currentValue);
    return option?.label || currentValue || placeholder;
  }, [currentValue, allOptions, placeholder]);

  // Handle value change
  const handleValueChange = (newValue: string) => {
    if (isControlled) {
      onValueChange?.(newValue);
    } else {
      setInternalValue(newValue);
    }
    setOpen(false);
    setQuery("");
  };

  // Handle creating a new option
  const handleCreate = () => {
    if (!canCreate) return;

    const trimmedQuery = query.trim();
    const newOption: Option = {
      value: trimmedQuery,
      label: trimmedQuery,
    };

    setCreatedOptions((prev) => [...prev, newOption]);
    handleValueChange(trimmedQuery);

    // Trigger mutate callback if provided
    mutate?.();
  };

  // Handle clearing the query
  const handleClearQuery = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuery("");
  };

  return (
    <>
      {/* Hidden input for form submission */}
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue}
          id={id}
        />
      )}

      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            id={id && !name ? id : undefined}
            variant="outline"
            role="combobox"
            aria-expanded={open}
            disabled={disabled || isLoading}
            className={cn(
              "w-full justify-between rounded-md font-normal",
              !currentValue && "text-muted-foreground",
              className
            )}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading...</span>
              </div>
            ) : (
              <span className="truncate">{displayLabel}</span>
            )}
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="p-0 w-[--radix-popover-trigger-width]"
          align="start"
        >
          <Command shouldFilter={false}>
            <CommandInput
              value={query}
              onValueChange={setQuery}
              placeholder={searchPlaceholder}
              className="h-9"
            />
            <CommandList>
              <CommandGroup>
                {/* Create new option */}
                {canCreate && (
                  <CommandItem
                    value={query}
                    onSelect={handleCreate}
                    className="cursor-pointer"
                  >
                    <span className="flex-1">
                      Create <strong>"{query}"</strong>
                    </span>
                    <X
                      className="h-4 w-4 opacity-50 hover:opacity-100"
                      onClick={handleClearQuery}
                    />
                  </CommandItem>
                )}

                {/* Existing options */}
                {filteredOptions.length > 0 ? (
                  filteredOptions.map((option) => (
                    <CommandItem
                      key={option.value}
                      value={option.value}
                      onSelect={() => handleValueChange(option.value)}
                      className="cursor-pointer"
                    >
                      <span className="flex-1">{option.label}</span>
                      <Check
                        className={cn(
                          "h-4 w-4",
                          currentValue === option.value
                            ? "opacity-100"
                            : "opacity-0"
                        )}
                      />
                    </CommandItem>
                  ))
                ) : (
                  !canCreate && (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No options found.
                    </div>
                  )
                )}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </>
  );
}
