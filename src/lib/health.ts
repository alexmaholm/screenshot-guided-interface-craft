/** Bridge to Apple Health / Google Health Connect. Native plugin is wired in the Capacitor build; web falls back gracefully. */
export function isNativeHealthAvailable(): boolean {
  if (typeof window === "undefined") return false;
  const cap = (window as unknown as { Capacitor?: { isNativePlatform?: () => boolean } }).Capacitor;
  return !!cap?.isNativePlatform?.();
}
export function healthSourceName(): string {
  if (typeof navigator === "undefined") return "Hälsoappen";
  return /iPhone|iPad|Mac/i.test(navigator.userAgent) ? "Apple Hälsa" : "Google Health Connect";
}
