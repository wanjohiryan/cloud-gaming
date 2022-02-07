import React, { useRef, useEffect } from "react";

export default function VideoStream({ src, height, width }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (src) {
      console.log("got src", src);
      videoRef.current.srcObject = src;
    }
  }, [src]);

  return (
    <video controls height={height} width={width} ref={videoRef} autoPlay />
  );
}
