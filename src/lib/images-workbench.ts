export type ImageWorkbenchMode = "generate" | "edit";

export type ImageQuestion = {
  id: string;
  label: string;
  placeholder: string;
  help?: string;
};

export type ImageBrief = {
  summary: string;
  goal: string;
  suggestedPrompt: string;
  questions: ImageQuestion[];
  defaults: {
    aspectRatio: string;
    size: string;
    outputFormat: "png" | "jpeg" | "webp";
    background: "auto" | "opaque" | "transparent";
    count: number;
  };
};

export type RenderPromptInput = {
  mode: ImageWorkbenchMode;
  prompt: string;
  answers?: Record<string, string>;
  negativePrompt?: string;
};

const QUESTION_BANK: Record<ImageWorkbenchMode, ImageQuestion[]> = {
  generate: [
    {
      id: "subject",
      label: "¿Qué sujeto o elemento principal tiene que dominar la imagen?",
      placeholder: "Ej. una astronauta de 30 años, un Porsche 911 clásico, un logo minimalista...",
    },
    {
      id: "style",
      label: "¿Qué estilo visual quieres exactamente?",
      placeholder: "Ej. fotografía editorial premium, 3D cartoon limpio, óleo dramático, UI mockup realista...",
    },
    {
      id: "composition",
      label: "¿Cómo quieres el encuadre y la composición?",
      placeholder: "Ej. primer plano, cenital, cuerpo entero, producto centrado, espacio negativo a la izquierda...",
    },
    {
      id: "scene",
      label: "¿Qué fondo, entorno o contexto debe tener?",
      placeholder: "Ej. estudio blanco, cocina nórdica, calle de Tokio de noche, fondo transparente...",
    },
    {
      id: "mood",
      label: "¿Qué luz, color o atmósfera buscas?",
      placeholder: "Ej. luz suave de mañana, neón azul-magenta, tonos cálidos, look cinematográfico oscuro...",
    },
    {
      id: "constraints",
      label: "¿Hay algo obligatorio o algo que deba evitar?",
      placeholder: "Ej. sin texto, sin manos deformes, mantener branding neutro, dejar hueco para titular...",
    },
  ],
  edit: [
    {
      id: "keep",
      label: "¿Qué parte debe mantenerse intacta sí o sí?",
      placeholder: "Ej. la cara, el encuadre, el logo, el producto, la postura...",
    },
    {
      id: "change",
      label: "¿Qué quieres cambiar exactamente?",
      placeholder: "Ej. quitar fondo, cambiar camiseta a negro, añadir humo, corregir iluminación...",
    },
    {
      id: "zone",
      label: "¿En qué zona o elemento debe aplicarse el cambio?",
      placeholder: "Ej. solo el fondo, solo la pared del fondo, únicamente el coche, no tocar la persona...",
    },
    {
      id: "style",
      label: "¿El resultado final debe conservar el estilo actual o llevarlo a otro estilo?",
      placeholder: "Ej. mantener hiperrealista, pasar a ilustración editorial, look luxury, estética anime...",
    },
    {
      id: "quality",
      label: "¿Qué nivel de acabado esperas?",
      placeholder: "Ej. realista y creíble, limpio para ecommerce, social media premium, acabado cinematográfico...",
    },
    {
      id: "constraints",
      label: "¿Qué errores o cambios no debe introducir?",
      placeholder: "Ej. no tocar manos/cara, no deformar proporciones, no cambiar colores de marca...",
    },
  ],
};

const ASPECT_RATIO_MAP: Array<{ ratio: string; match: RegExp }> = [
  { ratio: "9:16", match: /(story|reel|vertical|9:16|portada móvil|movil|móvil)/i },
  { ratio: "16:9", match: /(youtube|banner|hero|cabecera|header|16:9|horizontal|landscape)/i },
  { ratio: "4:5", match: /(instagram post|feed|4:5|portrait post)/i },
  { ratio: "1:1", match: /(square|cuadrad|1:1|icono|logo|sticker)/i },
];

const SIZE_BY_RATIO: Record<string, string> = {
  "1:1": "1024x1024",
  "4:5": "1024x1280",
  "3:2": "1536x1024",
  "16:9": "1536x1024",
  "9:16": "1024x1536",
};

function contains(prompt: string, tokens: string[]) {
  const lower = prompt.toLowerCase();
  return tokens.some((token) => lower.includes(token));
}

function inferAspectRatio(prompt: string) {
  const hit = ASPECT_RATIO_MAP.find((item) => item.match.test(prompt));
  return hit?.ratio ?? "1:1";
}

function inferBackground(prompt: string): "auto" | "opaque" | "transparent" {
  if (/(transparent|sin fondo|fondo transparente|png sticker|recorte)/i.test(prompt)) return "transparent";
  if (/(white background|fondo blanco|studio background|escena|habitación|paisaje)/i.test(prompt)) return "opaque";
  return "auto";
}

function inferOutputFormat(prompt: string, background: "auto" | "opaque" | "transparent"): "png" | "jpeg" | "webp" {
  if (background === "transparent") return "png";
  if (/(webp)/i.test(prompt)) return "webp";
  return "jpeg";
}

function inferGoal(mode: ImageWorkbenchMode, prompt: string) {
  if (mode === "edit") return "Modificar una imagen existente sin perder control sobre qué se toca y qué se conserva.";
  if (contains(prompt, ["logo", "icono", "sticker"])) return "Generar un asset limpio y reutilizable.";
  if (contains(prompt, ["instagram", "post", "story", "reel"])) return "Generar una pieza lista para social media.";
  if (contains(prompt, ["banner", "hero", "web", "landing"])) return "Generar una pieza pensada para web o cabecera.";
  return "Convertir una idea inicial en un briefing visual mucho más preciso antes de generar.";
}

function summarizePrompt(mode: ImageWorkbenchMode, prompt: string) {
  const clean = prompt.trim();
  if (!clean) {
    return mode === "edit"
      ? "Sube una o varias imágenes y describe el cambio que quieres provocar."
      : "Describe la imagen que tienes en mente y la convertimos en un briefing serio antes de generar.";
  }

  if (mode === "edit") {
    return `Vamos a convertir tu petición de edición en instrucciones más cerradas para evitar cambios laterales raros: ${clean}`;
  }

  return `La idea base ya está clara, pero conviene cerrarla mejor antes de generar: ${clean}`;
}

export function buildImageBrief(mode: ImageWorkbenchMode, prompt: string): ImageBrief {
  const clean = prompt.trim();
  const aspectRatio = inferAspectRatio(clean);
  const background = inferBackground(clean);
  const outputFormat = inferOutputFormat(clean, background);

  const filteredQuestions = QUESTION_BANK[mode].filter((question) => {
    if (question.id === "subject") return clean.length < 140;
    if (question.id === "style") return !contains(clean, ["realista", "cinematic", "cinematográfico", "3d", "anime", "editorial", "minimalista", "oil painting", "acuarela"]);
    if (question.id === "composition") return !contains(clean, ["primer plano", "close-up", "cenital", "plano medio", "cuerpo entero", "macro", "frontal"]);
    if (question.id === "scene") return !contains(clean, ["fondo", "background", "estudio", "cocina", "calle", "oficina", "playa", "bosque", "transparent"]);
    if (question.id === "mood") return !contains(clean, ["luz", "lighting", "oscuro", "cálido", "warm", "neón", "nocturno", "dramático"]);
    if (question.id === "change") return clean.length < 180 || !contains(clean, ["quitar", "cambiar", "añadir", "replace", "remove"]);
    if (question.id === "zone") return !contains(clean, ["solo", "únicamente", "background", "fondo", "cara", "producto"]);
    if (question.id === "constraints") return !contains(clean, ["sin ", "no ", "mantener", "evitar"]);
    return true;
  }).slice(0, 5);

  return {
    summary: summarizePrompt(mode, clean),
    goal: inferGoal(mode, clean),
    suggestedPrompt: clean,
    questions: filteredQuestions,
    defaults: {
      aspectRatio,
      size: SIZE_BY_RATIO[aspectRatio] ?? "1024x1024",
      outputFormat,
      background,
      count: 1,
    },
  };
}

export function buildRenderPrompt({ mode, prompt, answers = {}, negativePrompt }: RenderPromptInput) {
  const clean = prompt.trim();
  const answered = Object.entries(answers)
    .map(([key, value]) => [key, value.trim()] as const)
    .filter(([, value]) => value.length > 0);

  const blocks: string[] = [];
  if (clean) blocks.push(clean);

  if (answered.length) {
    const mapped = answered.map(([key, value]) => {
      const question = QUESTION_BANK[mode].find((item) => item.id === key);
      return question ? `${question.label} ${value}` : value;
    });
    blocks.push(mapped.join(". "));
  }

  if (mode === "edit") {
    blocks.push("Respeta al máximo la estructura útil de la imagen base y aplica solo los cambios pedidos de forma coherente.");
  } else {
    blocks.push("Entrega una imagen visualmente consistente, bien compuesta y sin artefactos obvios.");
  }

  if (negativePrompt?.trim()) {
    blocks.push(`Evitar: ${negativePrompt.trim()}`);
  }

  return blocks.join("\n\n").trim();
}

export function getSizeOptions(aspectRatio: string) {
  const preferred = SIZE_BY_RATIO[aspectRatio] ?? "1024x1024";
  return Array.from(new Set([preferred, "1024x1024", "1536x1024", "1024x1536"]));
}
