import { Trash2, Pencil } from "lucide-react";
import { useState } from "react";

export default function Sidebar({ chats, onNew, onSelect, onDelete, onRename, onSearch }) {
  const [q, setQ] = useState("");

  return (
    <div className="w-72 h-full p-6 bg-black/40 backdrop-blur-2xl border-r border-white/10">

      <div className="sans-meta mb-6">ARCHIVE INDEX</div>

      <button
        onClick={onNew}
        className="w-full mb-6 py-3 border border-white/20 hover:bg-white hover:text-black transition tracking-[0.3em]"
      >
        NEW ENTRY
      </button>

      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          onSearch(e.target.value);
        }}
        placeholder="Search archive..."
        className="w-full mb-6 bg-transparent border-b border-white/20 p-2 text-sm outline-none"
      />

      <div className="space-y-3">
        {chats.map((c) => (
          <div key={c.id} className="group flex justify-between items-center hover-lux p-2">

            <span
              onClick={() => onSelect(c.id)}
              className="cursor-pointer text-sm opacity-80"
            >
              {c.title}
            </span>

            <div className="flex gap-2 opacity-0 group-hover:opacity-100">
              <Pencil size={13} onClick={() => onRename(c.id)} />
              <Trash2 size={13} onClick={() => onDelete(c.id)} />
            </div>

          </div>
        ))}
      </div>

    </div>
  );
}