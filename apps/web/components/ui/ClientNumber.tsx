"use client";

import React, { useEffect, useState } from "react";

export default function ClientNumber({ value }: { value: number }) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    try {
      setText(new Intl.NumberFormat(undefined).format(value));
    } catch (e) {
      setText(String(value));
    }
  }, [value]);

  return <span>{text}</span>;
}
