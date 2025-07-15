import * as React from "react";
import { AgentRegistrationData } from "@/lib/types/agent";

export default function AgentRegistrationEmail({
  firstName,
  lastName,
  salesVolume,
  email,
  phone,
  zipCode,
}: AgentRegistrationData) {
  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
      }}
    >
      <h2
        style={{
          color: "#2563eb",
          borderBottom: "1px solid #ddd",
          paddingBottom: "10px",
        }}
      >
        신규 중개인 등록
      </h2>

      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
        VinaHome에 새로운 중개인이 등록했습니다. 세부 정보는 다음과 같습니다:
      </p>

      <div
        style={{
          background: "#f8fafc",
          padding: "15px",
          borderRadius: "5px",
          marginBottom: "20px",
        }}
      >
        <p style={{ margin: "8px 0" }}>
          <strong>이름:</strong> {firstName} {lastName}
        </p>
        <p style={{ margin: "8px 0" }}>
          <strong>판매량:</strong> {salesVolume}
        </p>
        <p style={{ margin: "8px 0" }}>
          <strong>이메일:</strong> {email}
        </p>
        {phone && (
          <p style={{ margin: "8px 0" }}>
            <strong>전화번호:</strong> {phone}
          </p>
        )}
        {zipCode && (
          <p style={{ margin: "8px 0" }}>
            <strong>우편번호:</strong> {zipCode}
          </p>
        )}
        <p style={{ margin: "8px 0" }}>
          <strong>등록일:</strong> {new Date().toLocaleString()}
        </p>
      </div>

      <p style={{ fontSize: "16px", color: "#4b5563" }}>
        파트너십에 대해 논의하기 위해 가능한 한 빨리 이 중개인에게 연락해
        주십시오.
      </p>

      <div
        style={{
          marginTop: "30px",
          borderTop: "1px solid #ddd",
          paddingTop: "15px",
          fontSize: "14px",
          color: "#6b7280",
        }}
      >
        <p>VinaHome - 부동산 성공을 위한 AI 기반 파트너</p>
      </div>
    </div>
  );
}
