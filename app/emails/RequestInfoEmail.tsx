import * as React from 'react';

interface RequestInfoEmailProps {
  name: string;
  email: string;
  phone?: string;
  message: string;
}

export default function RequestInfoEmail({ name, email, phone, message }: RequestInfoEmailProps) {
  return (
    <div style={{ fontFamily: 'Arial, sans-serif', color: '#222', fontSize: 16 }}>
      <h2>New Property Info Request</h2>
      <p><strong>Name:</strong> {name}</p>
      <p><strong>Email:</strong> {email}</p>
      {phone && <p><strong>Phone:</strong> {phone}</p>}
      <p><strong>Message:</strong></p>
      <p>{message}</p>
    </div>
  );
}
