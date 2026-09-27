"use client";

import { useState } from "react";

export function DeleteButton({
  label,
  confirm,
  action,
}: {
  label: string;
  confirm: string;
  action: () => Promise<{ error?: string; ok?: boolean }>;
}) {
  const [msg, setMsg] = useState("");
  return (
    <div>
      <button
        type="button"
        className="text-xs font-bold uppercase text-red-300"
        onClick={async () => {
          if (!window.confirm(confirm)) return;
          const r = await action();
          if (r.error) setMsg(r.error);
        }}
      >
        {label}
      </button>
      {msg && <p className="mt-1 text-xs text-red-200">{msg}</p>}
    </div>
  );
}
