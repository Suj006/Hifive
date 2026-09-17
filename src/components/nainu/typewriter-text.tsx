"use client";

import { useEffect, useState } from "react";

export function TypewriterText({
  text,
  speed = 20,
  onDone,
  className,
}: {
  text: string;
  speed?: number;
  onDone?: () => void;
  className?: string;
}) {
  const [shown, setShown] = useState("");
  const [finished, setFinished] = useState(false);

  useEffect(() => {
    let i = 0;
    const id = setInterval(() => {
      i += 1;
      setShown(text.slice(0, i));
      if (i >= text.length) {
        clearInterval(id);
        setFinished(true);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- onDone is stable enough for this cosmetic effect; re-running per text change is what matters
  }, [text, speed]);

  return (
    <p className={className}>
      {shown}
      {!finished ? <span className="animate-pulse">▋</span> : null}
    </p>
  );
}
