import * as React from "react";

interface RequestInfoEmailProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export default function RequestInfoEmail({
  name,
  email,
  phone,
  message,
}: RequestInfoEmailProps) {
  return (
    <div
      style={{ fontFamily: "Arial, sans-serif", color: "#222", fontSize: 16 }}
    >
      <h2>새 부동산 정보 요청</h2>
      <p>
        <strong>이름:</strong> {name}
      </p>
      <p>
        <strong>이메일:</strong> {email}
      </p>
      {phone && (
        <p>
          <strong>전화번호:</strong> {phone}
        </p>
      )}
      <p>
        <strong>메시지:</strong>
      </p>
      <p>{message}</p>
    </div>
  );
}
