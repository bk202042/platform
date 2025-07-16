"use client";

import { PropertyListing } from "@/lib/types/property";
import { Separator } from "@/components/ui/separator";

interface PropertyCostsProps {
  property: PropertyListing;
}

export default function PropertyCosts({ property }: PropertyCostsProps) {
  const monthlyCosts = [
    { label: "기본 임대료", amount: property.price },
    { label: "주차비", amount: 5 },
    { label: "반려동물 요금 (해당 시)", amount: 40 },
  ];

  const oneTimeCosts = [
    { label: "보증금", amount: property.price * 2 },
    { label: "신청비", amount: 50 },
    { label: "관리비", amount: 300 },
    { label: "반려동물 보증금 (해당 시)", amount: 500 },
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
        <h2 className="text-xl font-bold text-gray-900">비용 및 수수료</h2>
      </div>
      {/* Monthly Costs */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-gray-800">월간 비용</h4>
        <div className="space-y-2">
          {monthlyCosts.map((cost) => (
            <div key={cost.label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{cost.label}</span>
              <span>{formatCurrency(cost.amount)}</span>
            </div>
          ))}
          <Separator className="my-2" />
          <div className="flex justify-between font-semibold text-gray-900">
            <span>총 월간 비용</span>
            <span>{formatCurrency(totalMonthlyCosts)}</span>
          </div>
        </div>
      </div>
      {/* One-time Costs */}
      <div className="mb-6">
        <h4 className="font-semibold mb-3 text-gray-800">일회성 비용</h4>
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
          * 표시된 가격은 예상 금액이며, 추가 비용 및 수수료가 발생할 수
          있습니다.
        </p>
        <p>* 반려동물 요금 및 보증금은 반려동물 소유자에게만 적용됩니다.</p>
        <p>* 보증금은 일반적으로 2개월치 임대료입니다.</p>
      </div>
    </div>
  );
}
