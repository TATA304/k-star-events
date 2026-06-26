import logoAsset from "@/assets/kstar-logo.png.asset.json";

export function Logo({ className = "h-10 w-auto" }: { className?: string }) {
  return <img src="/kstar-logo.png" alt="K-Star" className={className} />
}
