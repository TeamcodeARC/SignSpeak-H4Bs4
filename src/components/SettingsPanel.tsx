import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  Moon,
  Sun,
  Volume2,
  Languages,
  Accessibility,
  X,
  Check,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface SettingsPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const SettingsPanel = ({
  isOpen = true,
  onClose = () => {},
}: SettingsPanelProps) => {
  // Theme is now completely removed and fixed to dark mode, but keeping the commented code for future use
  // const [theme, setTheme] = useState<"light" | "dark">("dark");
  const [volume, setVolume] = useState<number>(80);
  const [language, setLanguage] = useState<string>("english");
  const [voice, setVoice] = useState<string>("default");
  const [fontSize, setFontSize] = useState<number>(100);
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);

  // Completely removing theme toggle functionality
  // const toggleTheme = () => {
  //   setTheme(theme === "light" ? "dark" : "light");
  // };

  const panelVariants = {
    open: { x: 0, opacity: 1 },
    closed: { x: "100%", opacity: 0 },
  };

  return (
    <motion.div
      className={`fixed top-0 right-0 h-full w-full sm:w-[400px] bg-background z-50 shadow-xl overflow-auto`}
      initial="closed"
      animate={isOpen ? "open" : "closed"}
      variants={panelVariants}
      transition={{ type: "spring", damping: 25, stiffness: 300 }}
    >
      <Card className="h-full border-0 rounded-none">
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-xl font-semibold">Settings</CardTitle>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="language" className="w-full">
            <TabsList className="grid grid-cols-2 mb-6">
              {/* Theme tab completely removed */}
              {/* 
              <TabsTrigger value="appearance">
                <Sun className="h-4 w-4 mr-2" />
                Appearance
              </TabsTrigger>
              */}
              <TabsTrigger value="language">
                <Languages className="h-4 w-4 mr-2" />
                Language
              </TabsTrigger>
              <TabsTrigger value="accessibility">
                <Accessibility className="h-4 w-4 mr-2" />
                Accessibility
              </TabsTrigger>
            </TabsList>

            {/* Theme content removed but kept as comment for future use 
            <TabsContent value="appearance" className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <h3 className="text-sm font-medium">Dark Mode</h3>
                  <p className="text-xs text-muted-foreground">
                    Toggle between light and dark theme
                  </p>
                </div>
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={toggleTheme}
                />
              </div>
              <Separator />
            </TabsContent>
            */}

            <TabsContent value="language" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Translation Language</h3>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="english">English</SelectItem>
                      <SelectItem value="spanish">Spanish</SelectItem>
                      <SelectItem value="french">French</SelectItem>
                      <SelectItem value="german">German</SelectItem>
                      <SelectItem value="hindi">Hindi</SelectItem>
                      <SelectItem value="bengali">Bengali</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <h3 className="text-sm font-medium">Voice Selection</h3>
                  <Select value={voice} onValueChange={setVoice}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select voice" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="neutral">Neutral</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Voice Volume</h3>
                    <span className="text-xs text-muted-foreground">
                      {volume}%
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[volume]}
                      onValueChange={(value) => setVolume(value[0])}
                      max={100}
                      step={1}
                    />
                  </div>
                </div>
              </div>
              <Separator />
            </TabsContent>

            <TabsContent value="accessibility" className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium">Font Size</h3>
                    <span className="text-xs text-muted-foreground">
                      {fontSize}%
                    </span>
                  </div>
                  <Slider
                    value={[fontSize]}
                    onValueChange={(value) => setFontSize(value[0])}
                    min={75}
                    max={150}
                    step={5}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">High Contrast</h3>
                    <p className="text-xs text-muted-foreground">
                      Increase contrast for better visibility
                    </p>
                  </div>
                  <Switch
                    checked={highContrast}
                    onCheckedChange={setHighContrast}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h3 className="text-sm font-medium">Reduced Motion</h3>
                    <p className="text-xs text-muted-foreground">
                      Minimize animations throughout the app
                    </p>
                  </div>
                  <Switch
                    checked={reducedMotion}
                    onCheckedChange={setReducedMotion}
                  />
                </div>
              </div>
              <Separator />
            </TabsContent>
          </Tabs>

          <div className="mt-6 flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onClose}>
              <Check className="h-4 w-4 mr-2" />
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default SettingsPanel;