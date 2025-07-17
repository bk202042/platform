'use client';

import React from 'react';
import { Toaster } from 'sonner';

export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      expand={false}
      richColors
      closeButton
      toastOptions={{
        duration: 4000,
        style: {
          fontFamily: 'var(--font-sans)',
        },
        classNames: {
          toast: 'group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border-gray-200 group-[.toaster]:shadow-lg',
          description: 'group-[.toast]:text-gray-600',
          actionButton: 'group-[.toast]:bg-blue-600 group-[.toast]:text-white',
          cancelButton: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-900',
          closeButton: 'group-[.toast]:bg-gray-100 group-[.toast]:text-gray-900 group-[.toast]:border-gray-200',
          success: 'group-[.toast]:bg-green-50 group-[.toast]:text-green-900 group-[.toast]:border-green-200',
          error: 'group-[.toast]:bg-red-50 group-[.toast]:text-red-900 group-[.toast]:border-red-200',
          warning: 'group-[.toast]:bg-yellow-50 group-[.toast]:text-yellow-900 group-[.toast]:border-yellow-200',
          info: 'group-[.toast]:bg-blue-50 group-[.toast]:text-blue-900 group-[.toast]:border-blue-200',
        },
      }}
    />
  );
}
