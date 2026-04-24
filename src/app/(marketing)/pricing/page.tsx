import Link from "next/link";
import { Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { STANDARD_PRICES, SESSION_TYPE_LABELS, SESSION_TYPE_SPOTS, PLATFORM_FEE, TRAINER_SHARE } from "@/lib/types";

const SESSION_CONFIGS = [
  {
    type: "semi-private" as const,
    icon: "👥",
    range: "$40–$50",
    description: "2–3 players training together. Split the cost, keep quality high.",
    highlight: false,
    perks: [
      "Split cost with 1–2 friends",
      "Same trainer as private",
      "Great for pairs or siblings",
      "~45% less than private",
    ],
    savingsLabel: "~45% less than private",
  },
  {
    type: "small-group" as const,
    icon: "⚽",
    range: "$25–$35",
    description: "4–6 players. The sweet spot — competitive reps, coach attention, affordable.",
    highlight: true,
    perks: [
      "Most popular format",
      "Competitive team environment",
      "~65% less than private",
    ],
    savingsLabel: "~65% less than private",
  },
  {
    type: "clinic" as const,
    icon: "🏟️",
    range: "$15–$25",
    description: "7+ players. Academy-style training at the lowest per-player cost.",
    highlight: false,
    perks: [
      "Best value per player",
      "Ideal for team or club groups",
      "Structured, coach-run session",
      "~75% less than private",
    ],
    savingsLabel: "~75% less than private",
  },
];

// Savings table examples
const EXAMPLES = [
  { size: 1,  type: "private" as const,      label: "1 player (private)" },
  { size: 2,  type: "semi-private" as const, label: "2 players (semi-private)" },
  { size: 3,  type: "semi-private" as const, label: "3 players (semi-private)" },
  { size: 4,  type: "small-group" as const,  label: "4 players (small group)" },
  { size: 6,  type: "small-group" as const,  label: "6 players (small group)" },
  { size: 10, type: "clinic" as const,       label: "10 players (clinic)" },
];


export default function PricingPage() {
  const privateRate = 85;

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="py-16 md:py-24 border-b" style={{ backgroundColor: "#0F3154" }}>
        <div className="container text-center">
          <p className="text-sm font-bold uppercase tracking-widest mb-4" style={{ color: "#DC373E" }}>
            No hidden fees. No surprises.
          </p>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white mb-5">
            Simple, transparent pricing
          </h1>
          <p className="text-white/70 text-lg md:text-xl max-w-2xl mx-auto mb-8">
            Your player gets expert coaching. You split the cost with friends.
            Same quality as private training — at a fraction of the price.
          </p>
        </div>
      </div>

      {/* Session type cards */}
      <div className="container py-16 md:py-20">
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {SESSION_CONFIGS.map((config) => {
            const price = STANDARD_PRICES[config.type];
            return (
              <div
                key={config.type}
                className="relative rounded-2xl overflow-hidden flex flex-col"
                style={config.highlight
                  ? { border: "2px solid #DC373E", boxShadow: "0 10px 40px rgba(220,55,62,0.15)" }
                  : { border: "1px solid hsl(var(--border))" }
                }
              >
                {config.highlight && (
                  <div className="text-center text-xs font-bold uppercase tracking-wider text-white py-2" style={{ backgroundColor: "#DC373E" }}>
                    Most Popular
                  </div>
                )}
                {/* Top */}
                <div className="p-6 border-b" style={{ backgroundColor: config.highlight ? "#0F3154" : undefined }}>
                  <div className="text-3xl mb-3">{config.icon}</div>
                  <h3 className={`text-lg font-bold mb-1 ${config.highlight ? "text-white" : ""}`}>
                    {SESSION_TYPE_LABELS[config.type]}
                  </h3>
                  <p className={`text-xs mb-4 ${config.highlight ? "text-white/60" : "text-muted-foreground"}`}>
                    {SESSION_TYPE_SPOTS[config.type]}
                  </p>
                  {/* Price display */}
                  <div className="flex items-end gap-1 mb-1">
                    <span className={`text-4xl font-extrabold ${config.highlight ? "text-white" : ""}`}>
                      ${price}
                    </span>
                    <span className={`text-sm mb-1.5 ${config.highlight ? "text-white/60" : "text-muted-foreground"}`}>
                      / player
                    </span>
                  </div>
                  <p className={`text-xs ${config.highlight ? "text-white/40" : "text-muted-foreground"}`}>
                    Market range: {config.range}
                  </p>
                  {config.savingsLabel && (
                    <p className="text-xs font-semibold mt-2" style={{ color: config.highlight ? "#FCA5A5" : "#DC373E" }}>
                      {config.savingsLabel}
                    </p>
                  )}
                </div>
                {/* Perks */}
                <div className={`p-6 flex-1 flex flex-col ${config.highlight ? "bg-card" : ""}`}>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{config.description}</p>
                  <ul className="space-y-2 flex-1">
                    {config.perks.map((perk) => (
                      <li key={perk} className="flex items-start gap-2 text-sm">
                        <Check className="h-4 w-4 mt-0.5 flex-shrink-0" style={{ color: config.highlight ? "#DC373E" : "#0F3154" }} />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="mt-6 w-full text-white" style={{ backgroundColor: config.highlight ? "#DC373E" : "#0F3154" }}>
                    <Link href="/groups">
                      Find a session <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

      </div>

      {/* Savings table */}
      <div className="border-t border-b" style={{ backgroundColor: "#f4f6f9" }}>
        <div className="container py-16 md:py-20">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">How the savings add up</h2>
              <p className="text-muted-foreground text-lg">
                Same trainer. Same hour. More players = less per person.
              </p>
            </div>

            <div className="bg-white rounded-2xl border overflow-hidden shadow-sm">
              <table className="w-full">
                <thead>
                  <tr className="border-b" style={{ backgroundColor: "#0F3154" }}>
                    <th className="text-left px-6 py-4 text-sm font-semibold text-white/70">Session</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-white/70">Per player</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-white/70">Total collected</th>
                    <th className="text-right px-6 py-4 text-sm font-semibold text-white/70">Saving vs. private</th>
                  </tr>
                </thead>
                <tbody>
                  {EXAMPLES.map((ex, i) => {
                    const price = STANDARD_PRICES[ex.type];
                    const total = price * ex.size;
                    const saving = ex.type === "private" ? 0 : Math.round((1 - price / privateRate) * 100);
                    return (
                      <tr key={i} className={`border-b last:border-0 ${i % 2 === 1 ? "bg-gray-50" : ""}`}>
                        <td className="px-6 py-4 text-sm font-medium">{ex.label}</td>
                        <td className="px-6 py-4 text-sm text-right font-bold" style={{ color: "#0F3154" }}>
                          ${price}
                        </td>
                        <td className="px-6 py-4 text-sm text-right text-muted-foreground">${total}</td>
                        <td className="px-6 py-4 text-sm text-right font-semibold">
                          {saving === 0 ? (
                            <span className="text-muted-foreground">baseline</span>
                          ) : (
                            <span style={{ color: "#DC373E" }}>−{saving}%</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-center text-muted-foreground mt-3">
              Private baseline at $85. Actual private rates are set by each trainer and vary.
            </p>
          </div>
        </div>
      </div>


      {/* FAQ */}
      <div className="border-t" style={{ backgroundColor: "#f4f6f9" }}>
        <div className="container py-16 md:py-20">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl font-bold text-center mb-8">Common questions</h2>
            <div className="space-y-5">
              {[
                {
                  q: "Who sets the prices?",
                  a: "We do — for all group formats (semi-private, small group, clinic). Trainers choose the format and schedule; the platform sets the per-player rate. Private session rates are set by the trainer.",
                },
                {
                  q: "Are there any extra fees?",
                  a: "No. The price you see is what you pay. No booking fees, no surprise charges at checkout.",
                },
                {
                  q: "Why are group prices the same across all trainers?",
                  a: "It removes friction for players and fairness concerns between trainers. Everyone on the platform competes on quality, not price — which is better for everyone.",
                },
                {
                  q: "Do you offer package or season pricing?",
                  a: "Yes. Trainers can offer 8–12 week packages at a 10–15% discount vs per-session rates. Packages lock in revenue for trainers and build consistency for players.",
                },
                {
                  q: "How do trainers get paid?",
                  a: `Trainers receive ${Math.round(TRAINER_SHARE * 100)}% of every session. Payments are processed automatically after the session is completed.`,
                },
              ].map(({ q, a }) => (
                <div key={q} className="bg-white rounded-2xl border p-6">
                  <p className="font-bold mb-2">{q}</p>
                  <p className="text-sm text-muted-foreground leading-relaxed">{a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
