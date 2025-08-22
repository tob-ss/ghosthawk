import * as React from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SimpleSelectProps {
  value?: string;
  onValueChange?: (value: string) => void;
  placeholder?: string;
  children: React.ReactNode;
  className?: string;
}

interface SimpleSelectItemProps {
  value: string;
  children: React.ReactNode;
  className?: string;
}

const SimpleSelectContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}>({
  isOpen: false,
  setIsOpen: () => {},
});

export function SimpleSelect({ value, onValueChange, placeholder, children, className }: SimpleSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const selectRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const contextValue = {
    value,
    onValueChange,
    isOpen,
    setIsOpen,
  };

  return (
    <SimpleSelectContext.Provider value={contextValue}>
      <div className={cn("relative", className)} ref={selectRef}>
        {children}
      </div>
    </SimpleSelectContext.Provider>
  );
}

export function SimpleSelectTrigger({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen, setIsOpen } = React.useContext(SimpleSelectContext);

  return (
    <button
      type="button"
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      onClick={() => setIsOpen(!isOpen)}
    >
      {children}
      <ChevronDown className="h-4 w-4 opacity-50" />
    </button>
  );
}

export function SimpleSelectValue({ placeholder }: { placeholder?: string }) {
  const { value } = React.useContext(SimpleSelectContext);
  
  return (
    <span className={cn("block truncate", !value && "text-muted-foreground")}>
      {value || placeholder}
    </span>
  );
}

export function SimpleSelectContent({ children, className }: { children: React.ReactNode; className?: string }) {
  const { isOpen } = React.useContext(SimpleSelectContext);

  if (!isOpen) return null;

  return (
    <div
      className={cn(
        "absolute top-full z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-white/95 text-gray-900 shadow-md animate-in fade-in-0 zoom-in-95",
        className
      )}
    >
      {children}
    </div>
  );
}

export function SimpleSelectItem({ value, children, className }: SimpleSelectItemProps) {
  const { onValueChange, setIsOpen } = React.useContext(SimpleSelectContext);

  const handleClick = () => {
    onValueChange?.(value);
    setIsOpen(false);
  };

  return (
    <div
      className={cn(
        "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 px-2 text-sm outline-none hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground",
        className
      )}
      onClick={handleClick}
    >
      {children}
    </div>
  );
}