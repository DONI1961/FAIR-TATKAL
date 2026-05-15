"use client";

import { useState, useRef, useEffect } from "react";
import { Train, Search } from "lucide-react";
import { cn } from "@/lib/utils";

// All stations derived from the seeded IRCTC train catalog
const ALL_STATIONS = [
  "Mumbai Central",
  "New Delhi",
  "Chennai",
  "Bangalore",
  "Varanasi",
  "Howrah",
  "Mumbai CSMT",
  "Pune",
  "Coimbatore",
  "Lucknow",
];

export default function StationAutocomplete({ id, name, value, onChange, placeholder, label, className }) {
  const [query, setQuery] = useState(value || "");
  const [suggestions, setSuggestions] = useState([]);
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(-1);
  const containerRef = useRef(null);
  const inputRef = useRef(null);

  // Sync if parent resets value
  useEffect(() => {
    setQuery(value || "");
  }, [value]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
        setHighlighted(-1);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleInput = (e) => {
    const val = e.target.value;
    setQuery(val);
    setHighlighted(-1);

    if (val.trim().length === 0) {
      setSuggestions([]);
      setOpen(false);
      onChange({ target: { name, value: "" } });
      return;
    }

    const filtered = ALL_STATIONS.filter((s) =>
      s.toLowerCase().includes(val.toLowerCase())
    );
    setSuggestions(filtered);
    setOpen(filtered.length > 0);

    // Still propagate partial value to parent
    onChange({ target: { name, value: val } });
  };

  const selectStation = (station) => {
    setQuery(station);
    setSuggestions([]);
    setOpen(false);
    setHighlighted(-1);
    onChange({ target: { name, value: station } });
  };

  const handleKeyDown = (e) => {
    if (!open) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlighted((h) => Math.min(h + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlighted((h) => Math.max(h - 1, 0));
    } else if (e.key === "Enter" && highlighted >= 0) {
      e.preventDefault();
      selectStation(suggestions[highlighted]);
    } else if (e.key === "Escape") {
      setOpen(false);
      setHighlighted(-1);
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {label && (
        <label htmlFor={id} className="mb-2 block text-xs font-bold uppercase tracking-widest text-muted-foreground">
          {label}
        </label>
      )}
      <input
        ref={inputRef}
        type="text"
        id={id}
        name={name}
        value={query}
        onChange={handleInput}
        onKeyDown={handleKeyDown}
        onFocus={() => {
          if (suggestions.length > 0) setOpen(true);
        }}
        placeholder={placeholder}
        autoComplete="off"
        required
        className={cn(
          "w-full h-16 rounded-2xl border border-border bg-secondary/30 px-4 text-foreground outline-none transition-all focus:bg-secondary/50 focus:border-primary/50 focus:ring-4 focus:ring-primary/10 placeholder:text-muted-foreground/50",
          className
        )}
      />

      {open && suggestions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-2 w-full overflow-hidden rounded-2xl border border-border bg-popover/95 p-1 backdrop-blur-2xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200"
        >
          {suggestions.map((station, idx) => {
            const matchStart = station.toLowerCase().indexOf(query.toLowerCase());
            const before = station.slice(0, matchStart);
            const match = station.slice(matchStart, matchStart + query.length);
            const after = station.slice(matchStart + query.length);

            return (
              <li
                key={station}
                role="option"
                aria-selected={highlighted === idx}
                onMouseDown={() => selectStation(station)}
                onMouseEnter={() => setHighlighted(idx)}
                className={cn(
                  "flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all",
                  highlighted === idx
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                )}
              >
                <div className={cn(
                  "flex size-8 items-center justify-center rounded-lg transition-colors",
                  highlighted === idx ? "bg-primary/20 text-primary" : "bg-secondary text-muted-foreground"
                )}>
                  <Train className="size-4" />
                </div>
                <span>
                  {before}
                  <span className="font-bold text-primary">{match}</span>
                  {after}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}

