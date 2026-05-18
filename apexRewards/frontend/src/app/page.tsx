import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="mx-auto max-w-7xl px-4 py-24 text-center">
        <Badge variant="apex" className="mb-6 text-sm px-4 py-1">
          Built on Stellar · Powered by APEX
        </Badge>
        <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 mb-6">
          Loyalty Rewards,{" "}
          <span className="text-purple-600">On-Chain.</span>
        </h1>
        <p className="mx-auto max-w-2xl text-lg text-gray-500 mb-10">
          ApexRewards lets brands run transparent loyalty campaigns on the Stellar blockchain.
          Earn APEX tokens for every action — and redeem them for real value.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/campaigns">
            <Button size="lg">Explore Campaigns</Button>
          </Link>
          <Link href="/dashboard">
            <Button size="lg" variant="outline">My Dashboard</Button>
          </Link>
        </div>
      </section>

      {/* Features */}
      <section className="bg-white border-t border-gray-100 py-20">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Why ApexRewards?
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: "⬡",
                title: "Stellar-Native",
                desc: "APEX tokens live on Stellar — near-zero fees, 5-second finality, global reach.",
              },
              {
                icon: "🔒",
                title: "Trustless Campaigns",
                desc: "Smart contracts guarantee payouts. No middlemen, no broken promises.",
              },
              {
                icon: "🎁",
                title: "Real Redemptions",
                desc: "Swap APEX for gift cards, crypto, merchandise, or exclusive discounts.",
              },
            ].map((f) => (
              <div key={f.title} className="rounded-xl border border-gray-200 p-6 text-center">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{f.title}</h3>
                <p className="text-sm text-gray-500">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-purple-700 py-16 text-center text-white">
        <h2 className="text-3xl font-bold mb-4">Start earning APEX today</h2>
        <p className="text-purple-200 mb-8">Connect your Freighter wallet and join a campaign in seconds.</p>
        <Link href="/campaigns">
          <Button variant="secondary" size="lg">Browse Campaigns</Button>
        </Link>
      </section>
    </div>
  );
}
