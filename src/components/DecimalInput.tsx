import { useState, type ComponentProps } from "react";
import { Input } from "@/components/ui/input";

/** Parse a Swedish-style decimal ("1,5" or "1.5"). Returns undefined for empty, NaN for invalid. */
export function parseDecimal(text: string): number | undefined {
  const t = text.trim().replace(",", ".");
  if (t === "") return undefined;
  if (!/^\d*\.?\d*$/.test(t) || t === ".") return NaN;
  return Number(t);
}

/** Number field that keeps what the user types (e.g. "1,") so commas aren't swallowed. */
export function DecimalInput({ value, onValue, ...rest }: Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type"> & { value: number | undefined; onValue: (n: number | undefined) => void }) {
  const [draft, setDraft] = useState<string | null>(null);
  const shown = draft ?? (value === undefined ? "" : String(value).replace(".", ","));
  return (
    <Input
      {...rest}
      type="text"
      inputMode="decimal"
      value={shown}
      onChange={(e) => {
        const n = parseDecimal(e.target.value);
        if (Number.isNaN(n)) return;
        setDraft(e.target.value);
        onValue(n);
      }}
      onBlur={(e) => { setDraft(null); rest.onBlur?.(e); }}
    />
  );
}
