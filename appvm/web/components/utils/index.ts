import { Buffer } from "buffer";

export const decodeBase64 = (b64str:string) => {
  const b = Buffer.from(b64str, "base64");
  return b.toString();
};

export const encodeBase64 = (str:string) => {
  const b = Buffer.from(str);
  return b.toString("base64");
};

export const getDevice = () => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "mobile"; // tablet
  } else if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated|(hpw|web)OS|Opera M(obi|ini)/.test(
      ua
    )
  ) {
    return "mobile";
  }
  return "pc";
};