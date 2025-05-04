"use client";

import { PropertyListing } from "@/types/property";
import { Separator } from "@/components/ui/separator";

interface PropertyCostsProps {
  property: PropertyListing;
}

export default function PropertyCosts({ property }: PropertyCostsProps) {
  const monthlyCosts = [
    { label: "Base rent", amount: property.price },
    { label: "Parking fee", amount: 5 },
    { label: "Pet fee (if applicable)", amount: 40 },
  ];

  const oneTimeCosts = [
    { label: "Security deposit", amount: property.price * 2 },
    { label: "Application fee", amount: 50 },
    { label: "Administrative fee", amount: 300 },
    { label: "Pet deposit (if applicable)", amount: 500 },
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const totalMonthlyCosts = monthlyCosts.reduce(
    (acc, cost) => acc + cost.amount,
    0,
  );

  return (
    <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">Costs & Fees</h2>
      </div>
      {/* Monthly Costs */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-gray-800">Monthly Costs</h4>
        <div className="space-y-2">
          {monthlyCosts.map((cost) => (
            <div key={cost.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{cost.label}</span>
              <span>{formatCurrency(cost.amount)}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold text-gray-900">
            <span>Total Monthly Costs</span>
            <span>{formatCurrency(totalMonthlyCosts)}</span>
          </div>
        </div>
      </div>
      {/* One-time Costs */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-gray-800">One-time Costs</h4>
        <div className="space-y-2">
          {oneTimeCosts.map((cost) => (
            <div key={cost.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{cost.label}</span>
              <span>{formatCurrency(cost.amount)}</span>
            </div>
          ))}
        </div>
      </div>
      <div className="text-xs text-muted-foreground">
        <p>
          * Prices shown are estimates. Additional costs and fees may apply.
        </p>
        <p>* Pet fees and deposits only apply to pet owners.</p>
        <p>* Security deposit is typically two months&apos; rent.</p>
      </div>
    </div>
  );
}
