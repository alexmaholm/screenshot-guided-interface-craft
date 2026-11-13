/** Time-of-day greeting for the home header. */
export function greetingFor(hour: number): string {
  if (hour >= 5 && hour < 12) return "God morgon";
  if (hour >= 12 && hour < 18) return "God eftermiddag";
  if (hour >= 18 && hour < 23) return "God kväll";
  return "Vila gott";
}
