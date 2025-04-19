import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Sun,
  Moon,
  Settings,
  HelpCircle,
  Camera,
  CameraOff,
  History,
  Info,
  Github,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import WebcamFeed from "./WebcamFeed";
import TranslationPanel from "./TranslationPanel";
import SettingsPanel from "./SettingsPanel";

/**
 * Main homepage component for the SignSpeak application
 * Handles webcam feed, translation, settings and UI state
 */
const HomePage = () => {
  // State management
  const [darkMode, setDarkMode] = useState(true); // Theme setting
  const [isListening, setIsListening] = useState(false); // Webcam active state
  const [showSettings, setShowSettings] = useState(false); // Settings panel visibility
  const [showHelp, setShowHelp] = useState(false); // Help dialog visibility
  const [showAbout, setShowAbout] = useState(false); // About dialog visibility
  
  // Translation results
  const [translatedText, setTranslatedText] = useState(
    "Waiting for sign language input..."
  );
  const [confidenceScore, setConfidenceScore] = useState(0);

  // Apply dark mode to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [darkMode]);

  /**
   * Handler for when WebcamFeed detects a sign language gesture
   * @param gesture - The detected sign text
   * @param confidence - Confidence score (0-1)
   */
  const handleGestureDetected = (gesture: string, confidence: number) => {
    setTranslatedText(gesture);
    setConfidenceScore(Math.round(confidence * 100));
  };

  // UI toggle functions
  const toggleAbout = () => setShowAbout(!showAbout);
  const toggleDarkMode = () => setDarkMode(!darkMode);
  const toggleListening = () => setIsListening(!isListening);
  const toggleSettings = () => setShowSettings(!showSettings);
  const toggleHelp = () => setShowHelp(!showHelp);

  return (
    <div
      className={`min-h-screen w-full ${darkMode ? "dark bg-gray-900 text-white" : "bg-gray-50 text-gray-900"}`}
    >
      {/* Background gradient & decorative elements */}
      <div className="absolute inset-0 bg-gradient-to-br from-brand-purple/10 via-brand-blue/5 to-brand-green/10 pointer-events-none" />
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Floating particles - purely decorative */}
        {Array.from({ length: 40 }).map((_, i) => (
          <motion.div
            key={`particle-${i}`}
            className={`absolute rounded-full ${i % 3 === 0 ? "bg-brand-green/20" : i % 3 === 1 ? "bg-brand-blue/20" : "bg-brand-purple/20"}`}
            style={{
              width: Math.random() * 12 + 4,
              height: Math.random() * 12 + 4,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              filter: "blur(1px)",
            }}
            animate={{
              y: [0, Math.random() * -150 - 50],
              x: [0, (Math.random() - 0.5) * 50],
              opacity: [0, 0.7, 0],
              scale: [1, Math.random() * 0.5 + 1, 1],
            }}
            transition={{
              duration: Math.random() * 15 + 10,
              repeat: Infinity,
              ease: "easeInOut",
              delay: Math.random() * 10,
            }}
          />
        ))}

        {/* Decorative hand outlines */}
        <motion.div
          className="absolute w-64 h-64 opacity-5 hidden md:block"
          style={{
            bottom: "5%",
            left: "5%",
            backgroundImage: 'url("https://api.dicebear.com/7.x/shapes/svg?seed=hand1")',
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            transform: "rotate(-15deg)",
          }}
          animate={{
            y: [0, -10, 0],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute w-72 h-72 opacity-5 hidden md:block"
          style={{
            top: "10%",
            right: "5%",
            backgroundImage: 'url("https://api.dicebear.com/7.x/shapes/svg?seed=hand2")',
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            transform: "rotate(15deg)",
          }}
          animate={{
            y: [0, 10, 0],
            opacity: [0.05, 0.08, 0.05],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2,
          }}
        />

        {/* Light beams */}
        <div className="absolute top-0 left-1/4 w-1/2 h-screen bg-gradient-radial from-brand-blue/5 to-transparent opacity-30 transform -translate-x-1/2" />
        <div className="absolute top-1/4 right-0 w-1/2 h-screen bg-gradient-radial from-brand-purple/5 to-transparent opacity-30 transform translate-x-1/4" />
      </div>

      {/* Header */}
      <header className="relative z-10 flex items-center justify-between p-4 backdrop-blur-sm border-b border-white/10 to-transparent bg-gradient-to-r via-[100%] from-[#7fd78e] from-[0%] to-[59%]">
        <div className="flex items-center text-[#070101]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center"
          >
            <img
              src="/logo.png"
              alt="SignSpeak Logo"
              className="h-8 w-8 mr-2"
            />
            <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-green via-brand-blue to-brand-purple">
              SignSpeak
            </span>
            <Badge
              variant="outline"
              className="ml-2 bg-black/20 text-[#020101] bg-[#f3ecec]"
            >
              AI Powered
            </Badge>
          </motion.div>
        </div>

        {/* Header buttons/icons */}
        <div className="flex items-center space-x-4">
          {/* Dark mode toggle (commented out for now) */}
          {/* 
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleDarkMode}>
                  {darkMode ? (
                    <Sun className="h-5 w-5" />
                  ) : (
                    <Moon className="h-5 w-5" />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>{darkMode ? "Light mode" : "Dark mode"}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          */}

          {/* Settings button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleSettings}>
                  <Settings className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Settings</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* Help button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleHelp}>
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Help</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* About button */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleAbout}>
                  <Info className="h-5 w-5" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>About</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          {/* GitHub link */}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <a
                  href="https://github.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center h-9 w-9 rounded-md text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  <Github className="h-5 w-5" />
                </a>
              </TooltipTrigger>
              <TooltipContent>
                <p>View on GitHub</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      {/* Main content - Translation interface */}
      <main className="relative z-10 container mx-auto p-4 pt-8">
        <div className="space-y-4">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Webcam feed section */}
            <div className="lg:w-2/3 to-[#] bg-[#054523]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="relative rounded-xl overflow-hidden backdrop-blur-sm border border-white/10 shadow-xl bg-[#369065] from-[#020541]"
              >
                {/* Camera toggle button */}
                <div className="absolute top-4 right-4 z-30">
                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Button
                      variant={isListening ? "destructive" : "default"}
                      size="sm"
                      onClick={toggleListening}
                      className="rounded-full shadow-lg font-medium bg-[#6c9977] bg-gradient-to-r from-[#354da7] text-[#fbf6f6] text-sm"
                    >
                      {isListening ? (
                        <>
                          <CameraOff className="h-4 w-4 mr-2" />
                          Stop Camera
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          Start Camera
                        </>
                      )}
                    </Button>
                  </motion.div>
                  {!isListening && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 1 }}
                      className="mt-2 bg-black/60 text-white text-xs p-2 rounded-md text-center backdrop-blur-sm"
                    >
                      Click to activate camera
                    </motion.div>
                  )}
                </div>
                
                {/* Webcam component */}
                <WebcamFeed
                  isActive={isListening}
                  onGestureDetected={handleGestureDetected}
                  key={`webcam-${isListening}`}
                />
              </motion.div>
            </div>

            {/* Translation panel */}
            <div className="lg:w-1/3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <TranslationPanel
                  isActive={isListening}
                  translatedText={translatedText}
                  confidenceScore={confidenceScore}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </main>

      {/* Settings panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ opacity: 0, x: 300 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 300 }}
            className="fixed top-0 right-0 z-50 h-full w-full md:w-96 backdrop-blur-md bg-black/30 border-l border-white/10 shadow-2xl"
          >
            <SettingsPanel
              onClose={toggleSettings}
              darkMode={darkMode}
              setDarkMode={setDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* About panel */}
      <AnimatePresence>
        {showAbout && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={toggleAbout}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-xl p-6 max-w-md w-full mx-4 border shadow-lg backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-brand-green via-brand-blue to-brand-purple">
                  About SignSpeak
                </h2>
                <Button variant="ghost" size="sm" onClick={toggleAbout}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <p>
                  SignSpeak is an AI-powered sign language interpreter that
                  converts hand gestures into text and speech in real-time.
                </p>

                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-brand-green">
                    Powered by Custom AI Models
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    This application uses three custom-trained models (Digit, ASL, ISL) 
                    to accurately interpret sign language gestures and provide natural
                    language translations in real-time.
                  </p>
                </div>

                <div>
                  <h3 className="font-semibold mb-2">Features</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Real-time sign language detection</li>
                    <li>Hand landmark visualization</li>
                    <li>Multi-model interpretation</li>
                    <li>Text-to-speech conversion</li>
                    <li>Accessible interface</li>
                  </ul>
                </div>

                <div className="pt-2">
                  <Button className="w-full" onClick={toggleAbout}>
                    Close
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Help dialog */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={toggleHelp}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-card rounded-xl p-6 max-w-md w-full mx-4 border shadow-lg backdrop-blur-md"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-brand-blue">
                  SignSpeak Help
                </h2>
                <Button variant="ghost" size="sm" onClick={toggleHelp}>
                  ✕
                </Button>
              </div>

              <div className="space-y-4">
                <div className="bg-muted/30 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2 text-brand-green">
                    How to Use SignSpeak
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-sm">
                    <li>
                      Click the <strong>Start Camera</strong> button to activate the
                      camera
                    </li>
                    <li>Position your hands clearly in the frame</li>
                    <li>Make sign language gestures</li>
                    <li>View the translation in the panel on the right</li>
                    <li>Use text-to-speech to hear the translated sign</li>
                  </ol>
                </div>

                <div className="pt-2">
                  <Button className="w-full" onClick={toggleHelp}>
                    Got it
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer */}
      <footer className="relative z-10 mt-8 py-4 px-6 text-center text-sm text-muted-foreground">
        <p>
          Copyright © {new Date().getFullYear()} • Made with 💖 by Chirag
          Nahata, Snigdha Ghosh, Srijita Saha & Rajat Mitra for Hack4Bengal 4.0
        </p>
      </footer>
    </div>
  );
};

export default HomePage;