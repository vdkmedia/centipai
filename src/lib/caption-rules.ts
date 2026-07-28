/**
 * Interne standaardregels voor caption-generatie. Niet zichtbaar in de app.
 * Eigen regels van de gebruiker gaan ALTIJD voor: wie bijv. toch streepjes
 * wil, voegt zelf een regel toe en overschrijft daarmee de standaard.
 */
const DEFAULT_RULES: readonly string[] = [
  'Gebruik geen "-" (streepje of gedachtestreep) in captions. Herformuleer de zin of gebruik een komma of punt.',
  'Schrijf volgens het brandprofiel: toon, aanspreekvorm (je/u), taal en emoji-voorkeur.',
  'Verzin geen feiten, prijzen, openingstijden of acties die niet door de gebruiker zijn aangeleverd.',
];

/**
 * Bouwt het regels-blok voor de caption-prompt. De regels van de gebruiker
 * staan onderaan en krijgen expliciet voorrang op de standaardregels.
 */
export function buildRulesPrompt(customRules: string[]): string {
  const system = DEFAULT_RULES.map((r) => `- ${r}`).join('\n');
  if (customRules.length === 0) return `Standaardregels:\n${system}`;
  const custom = customRules.map((r) => `- ${r}`).join('\n');
  return (
    `Standaardregels:\n${system}\n\n` +
    `Regels van de gebruiker (deze gaan vóór de standaardregels als ze botsen):\n${custom}`
  );
}
