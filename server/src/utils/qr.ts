import QRCode from "qrcode";

export async function makeQrDataUrl(text: string) {
  return QRCode.toDataURL(text, { errorCorrectionLevel: "M" });
}
