import type { LiveConditions, Reservoir } from "@/lib/fishing-types";

function summarizeWind(speed?: number) {
  if (speed === undefined) return "sin dato";
  if (speed < 6) return "muy flojo";
  if (speed < 12) return "flojo útil";
  if (speed < 20) return "moderado";
  return "duro";
}

export async function fetchLiveConditions(reservoir: Reservoir, date: string): Promise<LiveConditions> {
  const url = new URL("https://api.open-meteo.com/v1/forecast");
  url.searchParams.set("latitude", String(reservoir.latitude));
  url.searchParams.set("longitude", String(reservoir.longitude));
  url.searchParams.set("hourly", "temperature_2m,wind_speed_10m,wind_direction_10m,cloud_cover,weather_code");
  url.searchParams.set("daily", "temperature_2m_max,temperature_2m_min,precipitation_probability_max,sunrise,sunset,wind_speed_10m_max,wind_gusts_10m_max,weather_code");
  url.searchParams.set("timezone", "Europe/Madrid");
  url.searchParams.set("start_date", date);
  url.searchParams.set("end_date", date);

  const response = await fetch(url.toString(), { next: { revalidate: 1800 } });
  if (!response.ok) {
    throw new Error(`Open-Meteo ${response.status}`);
  }

  const json = await response.json();
  const daily = json.daily ?? {};
  const hourly = json.hourly ?? {};

  const maxWind = daily.wind_speed_10m_max?.[0];
  const minTemp = daily.temperature_2m_min?.[0];
  const maxTemp = daily.temperature_2m_max?.[0];
  const rain = daily.precipitation_probability_max?.[0];
  const sunrise = daily.sunrise?.[0];
  const sunset = daily.sunset?.[0];

  const summary = `Temp ${minTemp ?? "—"}-${maxTemp ?? "—"}ºC · lluvia ${rain ?? "—"}% · viento ${summarizeWind(maxWind)}${maxWind !== undefined ? ` (${maxWind} km/h)` : ""}`;

  return {
    reservoirId: reservoir.id,
    date,
    temperatureMinC: minTemp,
    temperatureMaxC: maxTemp,
    precipitationProbabilityMax: rain,
    sunrise,
    sunset,
    windSpeedMaxKmh: maxWind,
    windGustsMaxKmh: daily.wind_gusts_10m_max?.[0],
    weatherCode: daily.weather_code?.[0],
    hourly: Array.isArray(hourly.time)
      ? hourly.time.map((time: string, index: number) => ({
          time,
          temperatureC: hourly.temperature_2m?.[index],
          windSpeedKmh: hourly.wind_speed_10m?.[index],
          windDirectionDeg: hourly.wind_direction_10m?.[index],
          cloudCover: hourly.cloud_cover?.[index],
          weatherCode: hourly.weather_code?.[index],
        }))
      : [],
    summary,
  };
}
