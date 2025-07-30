import React from 'react';

export default function AppLogo({
  size = 40,
  className = '',
}: {
  size?: number;
  className?: string;
}) {
  return (
    <img
      src="https://bahvvtynjvbocjfxgnbm.supabase.co/storage/v1/object/public/logo//moneymint.png"
      alt="Money Mint Logo"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      style={{ display: 'inline-block' }}
    />
  );
}
