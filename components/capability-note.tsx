import type { CapabilityWarning } from '@/lib/capabilities';

/** Prominent notes when params exceed what Muse can actually deliver. */
export function CapabilityNote({ warnings }: { warnings: CapabilityWarning[] }) {
  if (warnings.length === 0) return null;
  return (
    <div className="rounded-xl border border-amber-400 bg-amber-50 p-3 text-sm text-amber-900 dark:bg-amber-950 dark:text-amber-200">
      <div className="font-medium">参数提醒</div>
      <ul className="mt-1 list-disc space-y-1 pl-5">
        {warnings.map((w) => (
          <li key={w.code}>{w.zh}</li>
        ))}
      </ul>
    </div>
  );
}
