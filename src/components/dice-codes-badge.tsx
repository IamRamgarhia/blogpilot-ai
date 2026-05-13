import Image from "next/image";

export function DiceCodesBadge() {
  return (
    <a
      href="https://dicecodes.com"
      target="_blank"
      rel="noreferrer noopener"
      className="flex items-center gap-2 text-xs text-slate-300 hover:text-white transition"
      title="Built by Dice Codes"
    >
      <Image src="/dice-codes-logo.svg" alt="Dice Codes" width={18} height={18} />
      <span>
        by <span className="font-semibold">Dice Codes</span>
      </span>
    </a>
  );
}
