function normalizePhase(days: number) {
  const synodicMonth = 29.53058867;
  const normalized = ((days % synodicMonth) + synodicMonth) % synodicMonth;
  return normalized;
}

export function getMoonPhase(dateIso: string) {
  const target = new Date(`${dateIso}T12:00:00Z`);
  const knownNewMoon = new Date("2000-01-06T18:14:00Z");
  const days = (target.getTime() - knownNewMoon.getTime()) / 86400000;
  const age = normalizePhase(days);
  const illumination = Math.round(((1 - Math.cos((2 * Math.PI * age) / 29.53058867)) / 2) * 100);

  let label = "Luna nueva";
  if (age >= 1.5 && age < 6.5) label = "Creciente";
  else if (age >= 6.5 && age < 8.5) label = "Cuarto creciente";
  else if (age >= 8.5 && age < 13.5) label = "Gibosa creciente";
  else if (age >= 13.5 && age < 15.5) label = "Luna llena";
  else if (age >= 15.5 && age < 20.5) label = "Gibosa menguante";
  else if (age >= 20.5 && age < 22.5) label = "Cuarto menguante";
  else if (age >= 22.5 && age < 28.0) label = "Menguante";

  return {
    ageDays: Number(age.toFixed(1)),
    illuminationPercent: illumination,
    label,
  };
}
