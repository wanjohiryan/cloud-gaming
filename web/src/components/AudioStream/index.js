import React, { useRef, useEffect } from "react";

export default function AudioStream({ src }) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!src) return;

    audioRef.current.srcObject = src;
  }, [src]);

  return <audio ref={audioRef} autoPlay />;
}
