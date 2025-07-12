'use client';

import { useState } from 'react';
import { ApartmentSelect } from '@/components/community/ApartmentSelect';

export function ApartmentSelectWrapper({ cities, apartments, initialValue }) {
  const [selected, setSelected] = useState(initialValue);

  return (
    <ApartmentSelect
      cities={cities}
      apartments={apartments}
      value={selected}
      onChange={setSelected}
    />
  );
}
