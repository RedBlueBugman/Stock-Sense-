import QRCode from 'qrcode';
import { Product } from '../types/inventory';

/**
 * Generates high-resolution data URL for a given product QR code
 */
export async function generateProductQRDataUrl(product: Product, size: number = 300): Promise<string> {
  try {
    const dataUrl = await QRCode.toDataURL(product.barcode || product.sku, {
      width: size,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR data URL:', err);
    return '';
  }
}

/**
 * Matches a decoded barcode/QR text to a known product in the catalog
 */
export function matchScannedCodeToProduct(scannedText: string, products: Product[]): Product | null {
  if (!scannedText) return null;
  const clean = scannedText.trim().toUpperCase();

  // 1. Direct barcode match (e.g. QR_SR001)
  const byBarcode = products.find((p) => p.barcode.toUpperCase() === clean);
  if (byBarcode) return byBarcode;

  // 2. Direct SKU match (e.g. SR001)
  const bySku = products.find((p) => p.sku.toUpperCase() === clean);
  if (bySku) return bySku;

  // 3. Substring match
  const bySubstring = products.find((p) => clean.includes(p.sku.toUpperCase()) || clean.includes(p.barcode.toUpperCase()));
  if (bySubstring) return bySubstring;

  return null;
}
