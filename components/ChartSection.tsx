import type { Transaction } from "@/components/TransactionForm";
import { currency } from "@/lib/utils";

type ChartSectionProps = {
  transactions: Transaction[];
};

export default function ChartSection({ transactions }: ChartSectionProps) {
  const categories = transactions.reduce<Record<string, number>>((accumulator, transaction) => {
    if (transaction.type === "expense") {
      accumulator[transaction.category] = (accumulator[transaction.category] ?? 0) + transaction.amount;
    }

    return accumulator;
  }, {});

  const maxAmount = Math.max(...Object.values(categories), 1);

  return (
    <section className="panel" style={{ padding: 24 }}>
      <h2 style={{ marginTop: 0 }}>Depenses par categorie</h2>
      <div className="grid">
        {Object.entries(categories).map(([category, amount]) => (
          <div key={category}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 8,
                color: "var(--muted)",
              }}
            >
              <span>{category}</span>
              <span>{currency(amount)}</span>
            </div>
            <div
              style={{
                height: 12,
                borderRadius: 999,
                background: "rgba(17, 94, 89, 0.08)",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${(amount / maxAmount) * 100}%`,
                  height: "100%",
                  background: "linear-gradient(90deg, #0f766e, #14b8a6)",
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
