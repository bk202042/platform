import * as React from "react";
import { AgentRegistrationData } from "@/types/agent";

export default function AgentRegistrationEmail({
  firstName,
  lastName,
  salesVolume,
  email,
  phone,
  zipCode
}: AgentRegistrationData) {
  return (
    <div
      style={{ fontFamily: "Arial, sans-serif", maxWidth: "600px", margin: "0 auto" }}
    >
      <h2 style={{ color: "#2563eb", borderBottom: "1px solid #ddd", paddingBottom: "10px" }}>
        New Agent Registration
      </h2>
      
      <p style={{ fontSize: "16px", lineHeight: "1.5" }}>
        A new agent has registered to join VinaHome. Here are their details:
      </p>
      
      <div style={{ background: "#f8fafc", padding: "15px", borderRadius: "5px", marginBottom: "20px" }}>
        <p style={{ margin: "8px 0" }}>
          <strong>Name:</strong> {firstName} {lastName}
        </p>
        <p style={{ margin: "8px 0" }}>
          <strong>Sales Volume:</strong> {salesVolume}
        </p>
        <p style={{ margin: "8px 0" }}>
          <strong>Email:</strong> {email}
        </p>
        {phone && (
          <p style={{ margin: "8px 0" }}>
            <strong>Phone:</strong> {phone}
          </p>
        )}
        {zipCode && (
          <p style={{ margin: "8px 0" }}>
            <strong>ZIP Code:</strong> {zipCode}
          </p>
        )}
        <p style={{ margin: "8px 0" }}>
          <strong>Registration Date:</strong> {new Date().toLocaleString()}
        </p>
      </div>
      
      <p style={{ fontSize: "16px", color: "#4b5563" }}>
        Please reach out to this agent as soon as possible to discuss the partnership.
      </p>
      
      <div style={{ marginTop: "30px", borderTop: "1px solid #ddd", paddingTop: "15px", fontSize: "14px", color: "#6b7280" }}>
        <p>VinaHome - Your AI-Powered Partner in Real Estate Success</p>
      </div>
    </div>
  );
}
