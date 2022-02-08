import React, { useRef, useEffect } from "react";

export default function VideoStream({ src, height, width }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (src) {
      videoRef.current.srcObject = src;
    }
  }, [src]);

  return (
    <video height={height} width={width} ref={videoRef} autoPlay controls />
  );
}
