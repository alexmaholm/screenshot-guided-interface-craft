/** Shared calm message when an AI feature is used without internet. */
export const OFFLINE_MSG = "Du är offline. AI-funktionerna behöver internet – allt annat fungerar som vanligt.";
export const isOffline = () => typeof navigator !== "undefined" && navigator.onLine === false;
