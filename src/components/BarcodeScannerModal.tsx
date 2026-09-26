import React, { useEffect, useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Check, 
  Scan, 
  Zap, 
  Sparkles, 
  Volume2, 
  Camera, 
  CameraOff, 
  RefreshCw, 
  SwitchCamera,
  Layers,
  AlertTriangle,
  Play
} from 'lucide-react';
import jsQR from 'jsqr';
import { Product } from '../types/inventory';
import { MOCK_PRODUCTS } from '../data/mockProducts';
import { playScannerBeep } from '../utils/audio';
import { QRCodeDisplay } from './QRCodeDisplay';
import { matchScannedCodeToProduct } from '../utils/qrUtils';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (product: Product) => void;
  products?: Product[];
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  onScan,
  products = MOCK_PRODUCTS,
}) => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isScanningSuccess, setIsScanningSuccess] = useState<boolean>(false);
  const [activeRippleId, setActiveRippleId] = useState<number | null>(null);
  const [scannerMode, setScannerMode] = useState<'camera' | 'simulation'>('camera');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [videoDevices, setVideoDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const modalRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameId = useRef<number | null>(null);
  const isDecodingRef = useRef<boolean>(false);

  // Stop camera stream cleanly
  const stopCameraStream = useCallback(() => {
    if (animationFrameId.current) {
      cancelAnimationFrame(animationFrameId.current);
      animationFrameId.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => {
        track.stop();
      });
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  }, []);

  // Handle successful match from camera or manual simulation click
  const handleProductRecognized = useCallback((product: Product) => {
    if (isDecodingRef.current) return;
    isDecodingRef.current = true;

    setSelectedProduct(product);
    setIsScanningSuccess(true);
    setActiveRippleId(product.id);

    // 1. Play industrial laser scanner beep sound
    playScannerBeep();

    // 2. Stop camera stream
    stopCameraStream();

    // 3. Callback and close modal after 800ms
    setTimeout(() => {
      onScan(product);
      setIsScanningSuccess(false);
      setSelectedProduct(null);
      isDecodingRef.current = false;
      onClose();
    }, 800);
  }, [onScan, onClose, stopCameraStream]);

  // Real-time video frame scanning loop
  const scanCameraFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || isDecodingRef.current) {
      return;
    }

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    if (video.readyState >= video.HAVE_CURRENT_DATA && video.videoWidth > 0 && ctx) {
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;

      // Draw current video frame to processing canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // 1. Try native BarcodeDetector API if available (Chrome / Edge hardware accelerated)
      if ('BarcodeDetector' in window) {
        try {
          const barcodeDetector = new (window as any).BarcodeDetector({
            formats: ['qr_code', 'code_128', 'code_39', 'ean_13'],
          });
          barcodeDetector
            .detect(canvas)
            .then((barcodes: Array<{ rawValue: string }>) => {
              if (barcodes && barcodes.length > 0 && !isDecodingRef.current) {
                const detectedText = barcodes[0].rawValue;
                const matched = matchScannedCodeToProduct(detectedText, products);
                if (matched) {
                  handleProductRecognized(matched);
                  return;
                }
              }
            })
            .catch(() => {});
        } catch {
          // fallback to jsQR below
        }
      }

      // 2. jsQR Frame analysis (Universal cross-browser support)
      try {
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const code = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'dontInvert',
        });

        if (code && code.data && !isDecodingRef.current) {
          const matched = matchScannedCodeToProduct(code.data, products);
          if (matched) {
            handleProductRecognized(matched);
            return;
          }
        }
      } catch {
        // Safe frame capture fallback
      }
    }

    if (!isDecodingRef.current) {
      animationFrameId.current = requestAnimationFrame(scanCameraFrame);
    }
  }, [products, handleProductRecognized]);

  // Enumerate video input devices
  const loadVideoDevices = useCallback(async () => {
    try {
      if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter((d) => d.kind === 'videoinput');
        setVideoDevices(cameras);
        if (cameras.length > 0 && !selectedDeviceId) {
          setSelectedDeviceId(cameras[0].deviceId);
        }
      }
    } catch {
      // safe fallback
    }
  }, [selectedDeviceId]);

  // Robust multi-tier Camera initialization
  const startCameraStream = useCallback(async (deviceIdOverride?: string) => {
    setCameraError(null);
    stopCameraStream();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera API is not supported in this browser. Please use the simulation grid below.');
      setScannerMode('simulation');
      return;
    }

    const deviceId = deviceIdOverride || selectedDeviceId;

    // Constraint tiered strategies
    const constraintTiers: MediaStreamConstraints[] = [
      // Tier 1: Exact / Specified device or environment facing
      {
        video: deviceId
          ? { deviceId: { exact: deviceId } }
          : { facingMode: { ideal: 'environment' }, width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      },
      // Tier 2: Standard VGA
      {
        video: { width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      },
      // Tier 3: Basic generic video
      {
        video: true,
        audio: false,
      },
    ];

    let stream: MediaStream | null = null;
    let lastError: any = null;

    for (const constraints of constraintTiers) {
      try {
        stream = await navigator.mediaDevices.getUserMedia(constraints);
        if (stream) break;
      } catch (err) {
        lastError = err;
      }
    }

    if (!stream) {
      const errMessage =
        lastError?.name === 'NotAllowedError' || lastError?.name === 'PermissionDeniedError'
          ? 'Camera permission denied. Please allow camera access in your browser or use the simulation tags below.'
          : lastError?.name === 'NotFoundError' || lastError?.name === 'DevicesNotFoundError'
          ? 'No camera found on this device. Use the interactive QR simulation grid below.'
          : 'Unable to start camera. Please ensure camera is not in use by another app.';

      setCameraError(errMessage);
      setIsCameraActive(false);
      return;
    }

    streamRef.current = stream;
    loadVideoDevices();

    if (videoRef.current) {
      const video = videoRef.current;
      video.srcObject = stream;
      video.muted = true;
      video.setAttribute('playsinline', 'true');

      video.onloadedmetadata = () => {
        video
          .play()
          .then(() => {
            setIsCameraActive(true);
            setCameraError(null);
            animationFrameId.current = requestAnimationFrame(scanCameraFrame);
          })
          .catch(() => {
            setIsCameraActive(true);
            animationFrameId.current = requestAnimationFrame(scanCameraFrame);
          });
      };
    }
  }, [selectedDeviceId, loadVideoDevices, scanCameraFrame, stopCameraStream]);

  // Handle modal lifecycle
  useEffect(() => {
    if (isOpen) {
      setSelectedProduct(null);
      setIsScanningSuccess(false);
      isDecodingRef.current = false;

      // Give DOM element time to mount
      const timer = setTimeout(() => {
        if (scannerMode === 'camera') {
          startCameraStream();
        }
      }, 100);

      return () => {
        clearTimeout(timer);
        stopCameraStream();
      };
    } else {
      stopCameraStream();
    }
  }, [isOpen, scannerMode, startCameraStream, stopCameraStream]);

  // Accessibility: Escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Switch camera device
  const handleSwitchCamera = (newDeviceId: string) => {
    setSelectedDeviceId(newDeviceId);
    startCameraStream(newDeviceId);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-labelledby="scanner-modal-title"
        >
          {/* Dark Backdrop with Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="fixed inset-0 bg-black/85 backdrop-blur-md"
            onClick={onClose}
            aria-hidden="true"
          />

          {/* Modal Container */}
          <motion.div
            ref={modalRef}
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="relative w-full max-w-xl bg-slate-900/95 border border-purple-500/30 rounded-3xl shadow-[0_20px_60px_-15px_rgba(139,92,246,0.35)] backdrop-blur-xl overflow-hidden z-10 my-auto text-slate-100"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Hidden Canvas for Video Frame Processing */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Ambient Background Glows */}
            <div className="absolute -top-32 -left-32 w-64 h-64 bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-32 -right-32 w-64 h-64 bg-indigo-600/20 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-slate-950/80">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                  <Scan className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h2 id="scanner-modal-title" className="text-lg font-bold text-white tracking-wide flex items-center gap-2">
                    StockSense Optical Scanner
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                      isCameraActive 
                        ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                        : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                    }`}>
                      {isCameraActive ? 'LIVE WEBCAM ACTIVE' : 'SIMULATION MODE'}
                    </span>
                  </h2>
                  <p className="text-xs text-slate-400">Hold QR code up to camera or tap sample product below</p>
                </div>
              </div>

              {/* Mode Toggle & Close */}
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700 text-[11px]">
                  <button
                    type="button"
                    onClick={() => {
                      setScannerMode('camera');
                      startCameraStream();
                    }}
                    className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      scannerMode === 'camera'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Switch to live device webcam"
                  >
                    <Camera className="w-3.5 h-3.5" />
                    <span>Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScannerMode('simulation');
                      stopCameraStream();
                    }}
                    className={`px-2.5 py-1 rounded-md font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                      scannerMode === 'simulation'
                        ? 'bg-purple-600 text-white shadow'
                        : 'text-slate-400 hover:text-white'
                    }`}
                    title="Switch to interactive tags grid"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Grid</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={onClose}
                  aria-label="Close scanner modal"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent hover:border-slate-700 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* SECTION A: SCANNER VIEWFINDER */}
              <div className="flex flex-col items-center">
                <div className="relative w-full max-w-[460px] h-[260px] sm:h-[290px] rounded-2xl overflow-hidden bg-gradient-to-br from-indigo-950/95 via-purple-950/90 to-slate-950 border-2 border-purple-500/50 shadow-[0_0_40px_rgba(139,92,246,0.35)] flex items-center justify-center">
                  
                  {/* Real Live Video Stream Element */}
                  <video
                    ref={videoRef}
                    autoPlay
                    muted
                    playsInline
                    className={`absolute inset-0 w-full h-full object-cover z-0 transition-opacity duration-300 ${
                      scannerMode === 'camera' && isCameraActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
                    }`}
                  />

                  {/* Camera Error / Permission Fallback View */}
                  {scannerMode === 'camera' && cameraError && (
                    <div className="absolute inset-0 z-10 bg-slate-950/95 p-6 flex flex-col items-center justify-center text-center">
                      <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 mb-2">
                        <CameraOff className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Camera Access Notice</h4>
                      <p className="text-xs text-slate-300 mt-1 max-w-xs leading-relaxed">
                        {cameraError}
                      </p>
                      <div className="mt-3 flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => startCameraStream()}
                          className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow cursor-pointer"
                        >
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span>Allow / Retry Camera</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setScannerMode('simulation')}
                          className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold cursor-pointer"
                        >
                          Use Sample Grid
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Viewfinder Reticle Corners */}
                  <div className="absolute top-4 left-4 w-8 h-8 border-t-2 border-l-2 border-purple-400 rounded-tl-lg shadow-[0_0_12px_#a855f7] pointer-events-none z-10" />
                  <div className="absolute top-4 right-4 w-8 h-8 border-t-2 border-r-2 border-purple-400 rounded-tr-lg shadow-[0_0_12px_#a855f7] pointer-events-none z-10" />
                  <div className="absolute bottom-4 left-4 w-8 h-8 border-b-2 border-l-2 border-purple-400 rounded-bl-lg shadow-[0_0_12px_#a855f7] pointer-events-none z-10" />
                  <div className="absolute bottom-4 right-4 w-8 h-8 border-b-2 border-r-2 border-purple-400 rounded-br-lg shadow-[0_0_12px_#a855f7] pointer-events-none z-10" />

                  {/* Center Target Box */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <div className="w-36 h-36 border border-purple-400/40 rounded-2xl flex items-center justify-center shadow-inner">
                      <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-ping" />
                    </div>
                  </div>

                  {/* Scanning Laser Line Animation */}
                  {!isScanningSuccess && (
                    <motion.div
                      className="absolute left-4 right-4 h-[3px] bg-gradient-to-r from-transparent via-cyan-300 via-purple-300 to-transparent shadow-[0_0_20px_#c084fc,0_0_30px_#818cf8] pointer-events-none z-10"
                      animate={{
                        top: ['15%', '85%', '15%'],
                        opacity: [0.8, 1, 0.8],
                      }}
                      transition={{
                        duration: 2.0,
                        repeat: Infinity,
                        ease: 'easeInOut',
                      }}
                    >
                      <div className="absolute inset-0 bg-purple-400/60 blur-sm" />
                    </motion.div>
                  )}

                  {/* Success Green Flash Animation & Checkmark Icon */}
                  <AnimatePresence>
                    {isScanningSuccess && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="absolute inset-0 bg-emerald-500/40 backdrop-blur-sm border-2 border-emerald-400 flex flex-col items-center justify-center z-30"
                      >
                        <motion.div
                          initial={{ scale: 0, rotate: -45 }}
                          animate={{ scale: [0, 1.25, 1], rotate: 0 }}
                          transition={{ duration: 0.35, ease: 'easeOut' }}
                          className="w-16 h-16 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-[0_0_35px_rgba(16,185,129,0.9)]"
                        >
                          <Check className="w-10 h-10 stroke-[3]" />
                        </motion.div>

                        {selectedProduct && (
                          <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="mt-3 text-center"
                          >
                            <span className="inline-block px-4 py-1.5 rounded-full bg-slate-950/95 text-emerald-300 text-xs font-mono font-bold tracking-wider border border-emerald-500/60 shadow-xl">
                              DECODED: {selectedProduct.sku} ({selectedProduct.name})
                            </span>
                          </motion.div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* HUD Telemetry Bar */}
                  <div className="absolute bottom-2.5 left-4 right-4 flex items-center justify-between text-[11px] font-mono text-purple-300/90 pointer-events-none z-20">
                    <span className="flex items-center gap-1.5 bg-slate-950/80 px-2.5 py-0.5 rounded-md backdrop-blur border border-purple-500/20">
                      <span className={`w-2 h-2 rounded-full ${isCameraActive ? 'bg-emerald-400 animate-ping' : 'bg-purple-400'}`} />
                      {isCameraActive ? 'SENSOR ONLINE • 60 FPS' : 'CLICK SIMULATION READY'}
                    </span>
                    
                    {videoDevices.length > 1 && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          const currentIndex = videoDevices.findIndex((d) => d.deviceId === selectedDeviceId);
                          const nextDevice = videoDevices[(currentIndex + 1) % videoDevices.length];
                          handleSwitchCamera(nextDevice.deviceId);
                        }}
                        className="pointer-events-auto flex items-center gap-1 bg-slate-950/80 hover:bg-slate-900 text-[10px] text-purple-300 px-2 py-0.5 rounded border border-purple-500/30 transition-colors cursor-pointer"
                        title="Switch Webcam"
                      >
                        <SwitchCamera className="w-3 h-3" />
                        <span>Flip Cam</span>
                      </button>
                    )}
                  </div>
                </div>

                <p className="mt-3 text-xs font-medium text-purple-300 flex items-center gap-2 text-center">
                  <Zap className="w-3.5 h-3.5 text-purple-400 flex-shrink-0" />
                  <span>
                    {isCameraActive
                      ? 'Hold any of the 4 demo QR tags up to the camera to scan automatically:'
                      : 'Camera not active. Click any simulated QR card below to test instantly:'}
                  </span>
                </p>
              </div>

              {/* SECTION B: QR CODE SELECTION AREA (2x2 Grid) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-purple-400" />
                    4 Demo Category QR Codes
                  </span>
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Volume2 className="w-3 h-3 text-slate-400" />
                    Honeywell Beep Synthesized
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3.5">
                  {products.map((product) => {
                    const isSelected = selectedProduct?.id === product.id;
                    const isRippleActive = activeRippleId === product.id;

                    return (
                      <motion.button
                        key={product.id}
                        type="button"
                        whileHover={{ scale: 1.02, translateY: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleProductRecognized(product)}
                        disabled={isScanningSuccess}
                        className={`group relative flex flex-col items-center p-3 rounded-2xl border text-left transition-all duration-200 overflow-hidden cursor-pointer focus:outline-none focus:ring-2 focus:ring-purple-500 ${
                          isSelected
                            ? 'bg-purple-900/50 border-purple-400 shadow-[0_0_20px_rgba(139,92,246,0.6)]'
                            : 'bg-slate-800/60 hover:bg-slate-800 border-slate-700/80 hover:border-purple-500/50 hover:shadow-[0_8px_20px_rgba(139,92,246,0.2)]'
                        }`}
                      >
                        {/* Ripple Effect Animation */}
                        {isRippleActive && (
                          <motion.span
                            initial={{ scale: 0, opacity: 0.7 }}
                            animate={{ scale: 3, opacity: 0 }}
                            transition={{ duration: 0.6, ease: 'easeOut' }}
                            className="absolute inset-0 m-auto w-24 h-24 bg-purple-400/40 rounded-full pointer-events-none"
                          />
                        )}

                        {/* QR Code Matrix */}
                        <div className="relative mb-2">
                          <QRCodeDisplay sku={product.barcode || product.sku} size={95} />

                          {/* Product Emoji Icon Badge */}
                          <div className="absolute -bottom-2 -right-2 w-7 h-7 bg-slate-900 border border-purple-500/40 rounded-full flex items-center justify-center text-sm shadow-md group-hover:scale-110 transition-transform">
                            {product.emoji}
                          </div>
                        </div>

                        {/* Product Info */}
                        <div className="w-full text-center mt-1">
                          <div className="text-xs sm:text-sm font-bold text-white truncate group-hover:text-purple-300 transition-colors">
                            {product.name}
                          </div>
                          <div className="text-[11px] font-mono text-purple-400 font-semibold tracking-wider mt-0.5">
                            {product.sku}
                          </div>
                          <div className="flex items-center justify-center gap-1.5 mt-1">
                            {product.current_stock === 0 ? (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono font-bold bg-red-500/20 text-red-400 border border-red-500/40">
                                0 IN STOCK (DEPLETED)
                              </span>
                            ) : (
                              <span className="px-1.5 py-0.2 rounded text-[10px] font-mono text-slate-300 bg-slate-900/80 border border-slate-700/60">
                                {product.current_stock} units
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-3 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300 text-[10px] font-mono">ESC</kbd> to exit
              </span>
              <span className="text-[11px] text-slate-500">Hardware-Accelerated Frame Decoder</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
