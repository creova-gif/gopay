import { Capacitor } from "@capacitor/core";

export const isNative = () => Capacitor.isNativePlatform();
export const getPlatform = () => Capacitor.getPlatform(); // 'android' | 'ios' | 'web'

export async function initCapacitor() {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const { StatusBar, Style } = await import("@capacitor/status-bar");
    await StatusBar.setStyle({ style: Style.Dark });
    await StatusBar.setBackgroundColor({ color: "#080d08" });
    await StatusBar.show();
  } catch (e) {
    console.warn("StatusBar plugin not available", e);
  }

  try {
    const { SplashScreen } = await import("@capacitor/splash-screen");
    await SplashScreen.hide({ fadeOutDuration: 300 });
  } catch (e) {
    console.warn("SplashScreen plugin not available", e);
  }

  try {
    const { App } = await import("@capacitor/app");
    App.addListener("backButton", ({ canGoBack }) => {
      if (!canGoBack) {
        App.minimizeApp();
      } else {
        window.history.back();
      }
    });
  } catch (e) {
    console.warn("App plugin not available", e);
  }

  try {
    const { Keyboard } = await import("@capacitor/keyboard");
    Keyboard.addListener("keyboardWillShow", (info) => {
      document.body.style.setProperty(
        "--keyboard-height",
        `${info.keyboardHeight}px`
      );
    });
    Keyboard.addListener("keyboardWillHide", () => {
      document.body.style.setProperty("--keyboard-height", "0px");
    });
  } catch (e) {
    console.warn("Keyboard plugin not available", e);
  }
}

export async function triggerHaptic(type: "light" | "medium" | "heavy" = "light") {
  if (!Capacitor.isNativePlatform()) return;
  try {
    const { Haptics, ImpactStyle } = await import("@capacitor/haptics");
    const styleMap = {
      light: ImpactStyle.Light,
      medium: ImpactStyle.Medium,
      heavy: ImpactStyle.Heavy,
    };
    await Haptics.impact({ style: styleMap[type] });
  } catch (e) {
    // silently fail on web
  }
}
