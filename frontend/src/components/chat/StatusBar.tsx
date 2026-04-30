type Props = {
  model?: string;
  tokensUsed?: number;
  tokensMax?: number;
  optimal?: boolean;
};

export default function StatusBar({
  model = "GPT-4O",
  tokensUsed = 0,
  tokensMax = 128000,
  optimal = true,
}: Props) {
  return (
    <div className="flex items-center justify-between text-xs mt-3 px-1">
      <div className="flex items-center gap-1.5">
        <span
          className={`w-1.5 h-1.5 rounded-full ${
            optimal ? "bg-emerald-500" : "bg-amber-500"
          }`}
        />
        <span className="font-bold text-slate-500 tracking-widest">
          {optimal ? "SYSTEM OPTIMAL" : "SYSTEM DEGRADED"}
        </span>
      </div>
      <div className="text-slate-400 tracking-wider">
        <span className="font-bold">{model}</span>{" "}
        <span>
          {tokensUsed.toLocaleString()} / {tokensMax.toLocaleString()} TOKENS
        </span>
      </div>
    </div>
  );
}
