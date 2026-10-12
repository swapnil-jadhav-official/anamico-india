"use client";

import { useState, useEffect } from "react";
import { X, Download, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function MobileAppDownload() {
  const [isVisible, setIsVisible] = useState(false);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [deviceType, setDeviceType] = useState<"android" | "ios" | "desktop">("desktop");

  useEffect(() => {
    // Detect device type
    const userAgent = navigator.userAgent.toLowerCase();
    const isAndroid = /android/.test(userAgent);
    const isIOS = /iphone|ipad|ipod/.test(userAgent);

    if (isAndroid) {
      setDeviceType("android");
      setIsVisible(true);
    } else if (isIOS) {
      setDeviceType("ios");
      setIsVisible(true);
    } else {
      setIsVisible(false);
    }

    // Check if user has dismissed the prompt before
    const dismissed = localStorage.getItem("app-download-dismissed");
    if (dismissed) {
      setIsVisible(false);
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("app-download-dismissed", "true");
  };

  const handleDownload = () => {
    if (deviceType === "android") {
      // Download APK
      window.location.href = "/downloads/anamico.apk";
    } else if (deviceType === "ios") {
      // For iOS, show PWA install instructions or download IPA
      window.location.href = "/downloads/anamico.ipa";
    }
  };

  const handleInstallPWA = () => {
    if (deviceType === "ios") {
      // Show iOS PWA install instructions
      alert("To install:\n1. Tap the Share button\n2. Tap 'Add to Home Screen'\n3. Tap 'Add'");
    }
  };

  if (!isVisible) return null;

  return (
    <>
      {/* Floating Button */}
      {!isPopoverOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <Button
            onClick={() => setIsPopoverOpen(true)}
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg bg-primary hover:bg-primary/90"
          >
            <Smartphone className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Popover Card */}
      {isPopoverOpen && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom duration-300">
          <Card className="w-80 shadow-2xl border-2">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-primary rounded-lg">
                    <Smartphone className="h-5 w-5 text-primary-foreground" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Download Our App</CardTitle>
                    <CardDescription className="text-xs">
                      {deviceType === "android" ? "Android APK" : "iOS App"}
                    </CardDescription>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsPopoverOpen(false)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm text-muted-foreground">
                Get the best shopping experience with our mobile app!
              </div>

              <div className="space-y-2">
                {deviceType === "android" && (
                  <Button
                    onClick={handleDownload}
                    className="w-full"
                    size="lg"
                  >
                    <Download className="mr-2 h-4 w-4" />
                    Download APK
                  </Button>
                )}

                {deviceType === "ios" && (
                  <>
                    <Button
                      onClick={handleInstallPWA}
                      className="w-full"
                      size="lg"
                    >
                      <Smartphone className="mr-2 h-4 w-4" />
                      Install as App
                    </Button>
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      className="w-full"
                      size="lg"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download IPA (Testflight)
                    </Button>
                  </>
                )}
              </div>

              <Button
                variant="ghost"
                size="sm"
                className="w-full text-xs"
                onClick={handleDismiss}
              >
                Don't show again
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </>
  );
}
