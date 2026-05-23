import QRCode from "qrcode";

/**
 * Génère un QR code (base64) pour une url ou un texte donné.
 * @param text Le texte ou l'URL à encoder
 * @returns string (image PNG en base64)
 */
export async function generateQRCode(text: string): Promise<string> {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error("Erreur génération QR code:", err);
    return "";
  }
}
