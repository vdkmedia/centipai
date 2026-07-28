/**
 * Vaste CentipAI-regels die bij ELKE caption-generatie gelden, bovenop het
 * brandprofiel en de eigen regels van de gebruiker. Deze zijn niet
 * verwijderbaar en worden in de app getoond zodat gebruikers weten wat Centi
 * standaard wel en niet doet.
 */
export const SYSTEM_RULES: readonly string[] = [
  'Gebruik nooit het teken "-" (streepje of gedachtestreep) in captions. Herformuleer de zin of gebruik een komma of punt.',
  'Schrijf altijd volgens het brandprofiel: toon, aanspreekvorm (je/u), taal en emoji-voorkeur.',
  'Verzin nooit feiten, prijzen, openingstijden of acties die niet door de gebruiker zijn aangeleverd.',
];

/**
 * Bouwt het regels-blok voor de caption-prompt: eerst de vaste regels,
 * daarna de eigen (trainbare) regels van de gebruiker.
 */
export function buildRulesPrompt(customRules: string[]): string {
  const custom = customRules.map((r) => `- ${r}`).join('\n');
  const system = SYSTEM_RULES.map((r) => `- ${r}`).join('\n');
  return custom.length > 0 ? `${system}\n\nRegels van de gebruiker:\n${custom}` : system;
}
