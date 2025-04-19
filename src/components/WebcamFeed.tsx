import React, { useState, useRef, useEffect, useCallback } from "react";
import { RefreshCw } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Alert, AlertDescription, AlertTitle } from "./ui/alert";
import { detectHands, interpretSign } from "@/lib/backend-api";

/**
 * Props for the WebcamFeed component
 * @property {function} onGestureDetected - Callback when a sign is detected
 * @property {boolean} isActive - Whether the webcam should be active
 */
interface WebcamFeedProps {
  onGestureDetected?: (gesture: string, confidence: number) => void;
  isActive?: boolean;
}

/**
 * WebcamFeed component - Handles webcam access, frame capturing, and sign detection
 * Uses MediaPipe through backend API for hand detection and sign recognition
 */
const WebcamFeed = ({
  onGestureDetected = () => {},
  isActive = true,
}: WebcamFeedProps) => {
  // State management
  const [hasPermission, setHasPermission] = useState<boolean | null>(null); // Camera permission status
  const [isLoading, setIsLoading] = useState(true); // Initialization status
  const [error, setError] = useState<string | null>(null); // Error messages
  const [isProcessing, setIsProcessing] = useState(false); // Frame processing status
  const [annotatedImageUrl, setAnnotatedImageUrl] = useState<string | null>(null); // Hand landmarks overlay image

  // Refs
  const videoRef = useRef<HTMLVideoElement>(null); // Video element reference
  const canvasRef = useRef<HTMLCanvasElement>(null); // Canvas for frame capturing
  const streamRef = useRef<MediaStream | null>(null); // Active media stream reference
  const processingIntervalRef = useRef<number | null>(null); // Interval ID for periodic capture

  /**
   * Captures the current frame from the webcam
   * Draws the frame to a hidden canvas and gets the image data
   */
  const captureFrame = useCallback(() => {
    if (!videoRef.current || !canvasRef.current || !isActive || isProcessing)
      return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    // Draw the current video frame to canvas
    context.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    // Convert canvas to JPEG data URL
    const imageData = canvas.toDataURL("image/jpeg", 0.8);

    // Process the captured frame
    processImage(imageData);
  }, [isActive, isProcessing]);

  /**
   * Process the captured image through backend APIs
   * First detects hands, then if hands are found, interprets the sign
   * @param {string} imageData - Base64 encoded image data
   */
  const processImage = async (imageData: string) => {
    setIsProcessing(true);
    setAnnotatedImageUrl(null); // Clear previous overlay
    
    try {
      // Step 1: Detect hands using MediaPipe via backend API
      const handDetection = await detectHands(imageData);

      // Update the overlay image if hands were detected
      if (handDetection.handsDetected && handDetection.annotatedImage) {
        setAnnotatedImageUrl(handDetection.annotatedImage);
      } else {
        setAnnotatedImageUrl(null); 
      }

      // Step 2: If hands are detected, interpret the sign
      if (handDetection.handsDetected) {
        const result = await interpretSign(imageData);

        if (result.text && result.text !== "Unable to interpret sign") {
          console.log(
            "Detected sign:",
            result.text,
            "with confidence:",
            result.confidence,
          );
          // Call the callback with the detected sign and confidence
          onGestureDetected(result.text, result.confidence);
        }
      }
    } catch (err) {
      console.error("Error processing image:", err);
      setAnnotatedImageUrl(null); // Clear overlay on error
    } finally {
      setIsProcessing(false);
    }
  };

  /**
   * Stops the camera stream and releases resources
   */
  const stopCamera = () => {
    if (streamRef.current) {
      // Stop all tracks in the media stream
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  /**
   * Initialize the camera and request permissions
   */
  const initializeCamera = async () => {
    setIsLoading(true);
    setError(null);

    try {
      stopCamera(); // Stop any existing camera streams

      // Define camera constraints
      const constraints = {
        video: {
          facingMode: "user", // Use front camera
        },
        audio: false, // No audio needed
      };

      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      // Connect stream to video element
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      setHasPermission(true);
      setIsLoading(false);
    } catch (err) {
      console.error("Camera access error:", err);
      setHasPermission(false);
      setError("Could not access camera. Check browser permissions.");
      setIsLoading(false);
    }
  };

  /**
   * Retry camera initialization after permission denied
   */
  const handleRetry = () => {
    initializeCamera();
  };

  // Effect to initialize or stop camera based on isActive prop
  useEffect(() => {
    if (isActive) {
      initializeCamera();
    } else {
      stopCamera();
    }

    // Cleanup on unmount or when isActive changes
    return () => {
      stopCamera();
      if (processingIntervalRef.current) {
        clearInterval(processingIntervalRef.current);
      }
    };
  }, [isActive]);

  // Effect to set up periodic frame capture when camera is active
  useEffect(() => {
    if (hasPermission && isActive) {
      // Capture frame every 3 seconds
      processingIntervalRef.current = window.setInterval(() => {
        captureFrame();
      }, 3000);

      // Initial capture after camera is initialized (1.5s delay)
      const initialCapture = setTimeout(() => {
        captureFrame();
      }, 1500);

      // Cleanup intervals when component unmounts or dependencies change
      return () => {
        if (processingIntervalRef.current) {
          clearInterval(processingIntervalRef.current);
        }
        clearTimeout(initialCapture);
      };
    }
  }, [hasPermission, isActive, captureFrame]);

  return (
    <div className="relative w-full max-w-2xl mx-auto bg-background">
      <Card className="overflow-hidden rounded-xl border shadow-lg relative">
        {/* Loading state */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[480px] bg-muted/20 space-y-4">
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            >
              <RefreshCw className="w-10 h-10 text-brand-blue" />
            </motion.div>
            <p className="text-center text-muted-foreground max-w-xs">
              Initializing camera...
              <br />
              <span className="text-sm">
                Click the <strong>Start</strong> button in the top-right corner
                when ready
              </span>
            </p>
          </div>
        ) : hasPermission ? (
          /* Camera active state */
          <div className="relative w-full h-[480px] overflow-hidden bg-black">
            {/* Live video feed */}
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover bg-black z-10"
            />
            {/* Hidden canvas for frame capture */}
            <canvas ref={canvasRef} className="hidden" />

            {/* Hand landmarks overlay */}
            {annotatedImageUrl && (
              <img
                src={annotatedImageUrl}
                alt="Hand Landmarks Overlay"
                className="absolute top-0 left-0 w-full h-full object-contain z-20 pointer-events-none"
              />
            )}

            {/* Processing indicator */}
            {isProcessing && (
              <div className="absolute top-4 right-4 bg-black/50 text-white px-3 py-1 rounded-full flex items-center z-20">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  className="mr-2"
                >
                  <RefreshCw className="h-4 w-4" />
                </motion.div>
                <span className="text-xs">Detecting signs...</span>
              </div>
            )}

            {/* Instruction overlay */}
            <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-sm text-white p-3 rounded-lg z-20">
              <p className="text-sm text-center flex items-center justify-center">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="mr-2 text-brand-green"
                >
                  <svg
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.5 12C8.15685 12 9.5 10.6569 9.5 9C9.5 7.34315 8.15685 6 6.5 6C4.84315 6 3.5 7.34315 3.5 9C3.5 10.6569 4.84315 12 6.5 12Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M17.5 21C19.1569 21 20.5 19.6569 20.5 18C20.5 16.3431 19.1569 15 17.5 15C15.8431 15 14.5 16.3431 14.5 18C14.5 19.6569 15.8431 21 17.5 21Z"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M9.5 9L14.5 18M6.5 12L17.5 15"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                  </svg>
                </motion.div>
                Position your hands clearly in the frame to detect sign language
              </p>
            </div>
          </div>
        ) : (
          /* Permission denied state */
          <div className="flex flex-col items-center justify-center h-[480px] bg-muted/20 p-6">
            <Alert variant="destructive" className="max-w-md w-full shadow-lg">
              <AlertTitle className="text-lg font-semibold">
                Camera Access Denied
              </AlertTitle>
              <AlertDescription className="mt-2">
                <p className="mb-3">
                  {error ||
                    "Please allow camera access to use the sign language interpreter."}
                </p>
                <div className="bg-black/10 p-3 rounded-md mb-3 text-sm">
                  <p className="font-medium mb-1">
                    How to enable camera access:
                  </p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Click the camera icon in your browser's address bar</li>
                    <li>Select "Allow" for camera access</li>
                    <li>Refresh the page</li>
                  </ol>
                </div>
                <Button onClick={handleRetry} className="w-full mt-2">
                  Try Again
                </Button>
              </AlertDescription>
            </Alert>
          </div>
        )}
      </Card>
    </div>
  );
};

export default WebcamFeed;