import { useState, type KeyboardEvent } from "react";

interface ListInputProps {
  label: string;
  items: string[];
  onChange: (items: string[]) => void;
  placeholder?: string;
}

export function ListInput({ label, items, onChange, placeholder }: ListInputProps) {
  const [draft, setDraft] = useState("");

  function addDraft() {
    const value = draft.trim();
    if (!value) return;
    onChange([...items, value]);
    setDraft("");
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter") {
      event.preventDefault();
      addDraft();
    } else if (event.key === "Backspace" && draft === "" && items.length > 0) {
      onChange(items.slice(0, -1));
    }
  }

  function removeItem(index: number) {
    onChange(items.filter((_, i) => i !== index));
  }

  return (
    <div className="list-input">
      <label htmlFor={`list-input-${label}`}>{label}</label>
      {items.length > 0 && (
        <ol className="list-input__items">
          {items.map((item, index) => (
            <li key={index}>
              <span>{item}</span>
              <button
                type="button"
                className="list-input__remove"
                aria-label={`Remover ${item}`}
                onClick={() => removeItem(index)}
              >
                ×
              </button>
            </li>
          ))}
        </ol>
      )}
      <input
        id={`list-input-${label}`}
        value={draft}
        placeholder={placeholder}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={addDraft}
      />
    </div>
  );
}
