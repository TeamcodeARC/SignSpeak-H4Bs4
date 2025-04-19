import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Play, Volume2, Copy, Check, History } from "lucide-react";
import { textToSpeech } from "@/lib/backend-api";

/**
 * Props for the TranslationPanel component
 * @property {string} translatedText - The detected sign language text
 * @property {number} confidenceScore - Confidence score (0-100) of the detection
 * @property {function} onPlaySpeech - Callback when speech is played
 * @property {boolean} isActive - Whether the panel is active
 */
interface TranslationPanelProps {
  translatedText?: string;
  confidenceScore?: number;
  onPlaySpeech?: (language: string) => void;
  isActive?: boolean;
}

/**
 * TranslationPanel component - Displays the translated sign language
 * Provides text-to-speech, language selection, and translation history
 */
const TranslationPanel = ({
  translatedText = "Waiting for sign language input...",
  confidenceScore = 0,
  onPlaySpeech = () => {},
  isActive = false,
}: TranslationPanelProps) => {
  // State management
  const [selectedLanguage, setSelectedLanguage] = useState<string>("en-US");
  const [displayedText, setDisplayedText] = useState<string>(translatedText);
  const [copied, setCopied] = useState<boolean>(false);
  const [translationHistory, setTranslationHistory] = useState<string[]>([]);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [audioSrc, setAudioSrc] = useState<string>("");
  
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement>(null);

  // Available languages for text-to-speech
  const languages = [
    { value: "en-US", label: "English (US)" },
    { value: "en-GB", label: "English (UK)" },
    { value: "es-ES", label: "Spanish" },
    { value: "fr-FR", label: "French" },
    { value: "de-DE", label: "German" },
    { value: "hi-IN", label: "Hindi" },
    { value: "bn-IN", label: "Bengali" },
  ];

  // Update displayed text when translated text changes
  useEffect(() => {
    if (
      translatedText &&
      translatedText !== "Waiting for sign language input..."
    ) {
      setDisplayedText(translatedText);

      // Add to history if it's a new translation
      if (!translationHistory.includes(translatedText)) {
        setTranslationHistory((prev) => [translatedText, ...prev].slice(0, 10));
      }
    }
  }, [translatedText]);

  /**
   * Handle text-to-speech conversion and playback
   * Uses backend TTS service with browser TTS as fallback
   */
  const handlePlaySpeech = async () => {
    try {
      setIsPlayingAudio(true);

      // Try to use the backend TTS service
      try {
        const result = await textToSpeech(displayedText, selectedLanguage);
        
        // Set the audio source
        setAudioSrc(result.audio);

        // Play the audio
        if (audioRef.current) {
          audioRef.current.play();
        }
      } catch (error) {
        console.error(
          "Error using backend TTS, falling back to browser TTS:",
          error,
        );

        // Fallback to browser's speech synthesis
        const utterance = new SpeechSynthesisUtterance(displayedText);
        utterance.lang = selectedLanguage;
        window.speechSynthesis.speak(utterance);
      }

      // Call the provided callback
      onPlaySpeech(selectedLanguage);
    } catch (error) {
      console.error("Error playing speech:", error);
    } finally {
      setIsPlayingAudio(false);
    }
  };

  /**
   * Copy the translated text to clipboard
   */
  const handleCopyText = () => {
    navigator.clipboard.writeText(displayedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /**
   * Get appropriate color for confidence score indicator
   * @param {number} score - Confidence score (0-100)
   * @returns {string} CSS class for the color
   */
  const getConfidenceColor = (score: number) => {
    if (score >= 80) return "bg-green-500";
    if (score >= 60) return "bg-yellow-500";
    return "bg-red-500";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      {/* Hidden audio element for playing TTS audio */}
      <audio
        ref={audioRef}
        src={audioSrc}
        onEnded={() => setIsPlayingAudio(false)}
        style={{ display: "none" }}
      />
      
      <Card className="backdrop-blur-md bg-background/80 border shadow-lg">
        <CardHeader>
          <CardTitle className="flex justify-between items-center">
            <span>Translation</span>
            <div className="flex items-center space-x-2 text-sm font-normal">
              <span>Confidence:</span>
              <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className={`h-full ${getConfidenceColor(confidenceScore)}`}
                  style={{ width: `${confidenceScore}%` }}
                />
              </div>
              <span>{confidenceScore}%</span>
            </div>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Translation display box */}
          <motion.div
            key={displayedText}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
            className="min-h-32 p-4 rounded-lg bg-muted/50 relative backdrop-blur-sm border border-white/10 shadow-inner"
          >
            <p className="text-lg">{displayedText}</p>
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 opacity-70 hover:opacity-100"
              onClick={handleCopyText}
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </motion.div>

          {/* Language selection and quick speak button */}
          <div className="flex items-center space-x-2">
            <Select
              value={selectedLanguage}
              onValueChange={setSelectedLanguage}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select language" />
              </SelectTrigger>
              <SelectContent>
                {languages.map((language) => (
                  <SelectItem key={language.value} value={language.value}>
                    {language.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Button
              onClick={handlePlaySpeech}
              variant="outline"
              size="icon"
              className="flex-shrink-0"
              disabled={
                isPlayingAudio ||
                !displayedText ||
                displayedText === "Waiting for sign language input..."
              }
            >
              {isPlayingAudio ? (
                <motion.div
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                >
                  <Volume2 className="h-5 w-5 text-primary" />
                </motion.div>
              ) : (
                <Volume2 className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Main play button */}
          <div className="flex justify-center">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full"
            >
              <Button
                onClick={handlePlaySpeech}
                className="w-full relative overflow-hidden group"
                variant="default"
                disabled={
                  isPlayingAudio ||
                  !displayedText ||
                  displayedText === "Waiting for sign language input..."
                }
              >
                <span className="absolute inset-0 w-full h-full transition-all duration-300 ease-out transform translate-x-0 -skew-x-12 bg-gradient-to-r from-transparent to-white/10 group-hover:translate-x-full group-hover:skew-x-12"></span>
                {isPlayingAudio ? (
                  <>
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "linear",
                      }}
                      className="mr-2"
                    >
                      <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    </motion.div>
                    Playing...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Play Translation
                  </>
                )}
              </Button>
            </motion.div>
          </div>

          {/* Recent translations history */}
          {translationHistory.length > 0 && (
            <div className="mt-4">
              <div className="flex items-center mb-2">
                <History className="h-4 w-4 mr-2 text-muted-foreground" />
                <h3 className="text-sm font-medium text-muted-foreground">
                  Recent Translations
                </h3>
              </div>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {translationHistory.map((text, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="text-sm p-2 rounded bg-muted/30 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => setDisplayedText(text)}
                  >
                    {text}
                  </motion.div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default TranslationPanel;
