import type { LiveConditions } from "@/lib/fishing-types";

function hourMinuteFromIso(value?: string) {
  if (!value) return null;
  const hhmm = value.slice(11, 16);
  const [h, m] = hhmm.split(":").map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return { h, m, label: hhmm };
}

function wrapHour(hour: number) {
  const h = ((hour % 24) + 24) % 24;
  return String(h).padStart(2, "0");
}

function fmtRange(centerHour: number, centerMinute: number, spanMinutes: number) {
  const startTotal = centerHour * 60 + centerMinute - spanMinutes;
  const endTotal = centerHour * 60 + centerMinute + spanMinutes;
  const sh = wrapHour(Math.floor((((startTotal % 1440) + 1440) % 1440) / 60));
  const sm = String((((startTotal % 60) + 60) % 60)).padStart(2, "0");
  const eh = wrapHour(Math.floor((((endTotal % 1440) + 1440) % 1440) / 60));
  const em = String((((endTotal % 60) + 60) % 60)).padStart(2, "0");
  return `${sh}:${sm}-${eh}:${em}`;
}

export function addDerivedSolunarWindows(base: LiveConditions): LiveConditions {
  const sunrise = hourMinuteFromIso(base.sunrise);
  const sunset = hourMinuteFromIso(base.sunset);
  const major: string[] = [];
  const minor: string[] = [];

  if (sunrise) minor.push(fmtRange(sunrise.h, sunrise.m, 45));
  if (sunset) minor.push(fmtRange(sunset.h, sunset.m, 45));
  if (sunrise && sunset) {
    const sunriseMin = sunrise.h * 60 + sunrise.m;
    const sunsetMin = sunset.h * 60 + sunset.m;
    const mid = Math.floor((sunriseMin + sunsetMin) / 2);
    major.push(fmtRange(Math.floor(mid / 60), mid % 60, 60));
  }
  if (base.moonPhaseLabel === "Luna nueva" || base.moonPhaseLabel === "Luna llena") {
    if (major.length) {
      major[0] = `${major[0]} · reforzada por fase lunar`;
    }
  }

  return {
    ...base,
    solunarMajor: major,
    solunarMinor: minor,
  };
}
