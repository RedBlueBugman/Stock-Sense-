import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeDisplayProps {
  sku: string;
  className?: string;
  size?: number;
}

export const QRCodeDisplay: React.FC<QRCodeDisplayProps> = ({ sku, className = '', size = 100 }) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(sku, {
      width: size * 2, // High resolution for crisp scanning
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff',
      },
      errorCorrectionLevel: 'H',
    }).then((url) => {
      if (isMounted) setDataUrl(url);
    }).catch(() => {});

    return () => {
      isMounted = false;
    };
  }, [sku, size]);

  return (
    <div 
      className={`relative flex items-center justify-center bg-white p-2 rounded-xl shadow-inner border border-slate-200 overflow-hidden ${className}`}
      style={{ width: size, height: size }}
    >
      {dataUrl ? (
        <img
          src={dataUrl}
          alt={`QR code for ${sku}`}
          className="w-full h-full object-contain"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-slate-100 text-[10px] text-slate-400 font-mono">
          Loading...
        </div>
      )}
      {/* Central StockSense badge accent */}
      <div className="absolute inset-0 m-auto w-5 h-5 bg-purple-600 rounded flex items-center justify-center text-[9px] text-white font-black shadow-md pointer-events-none">
        SS
      </div>
    </div>
  );
};
