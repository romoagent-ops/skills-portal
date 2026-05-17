export type PublicZone = {
  reservoirId: string;
  slug: string;
  name: string;
  zoneType: "bridge" | "point" | "cove" | "riprap" | "channel-edge" | "flat";
  structureTags: string[];
  bestWhen: string[];
  tacticalNote: string;
};

export const publicZones: PublicZone[] = [
  { reservoirId: "garcia-sola", slug: "puente-castilblanco", name: "Puente de Castilblanco", zoneType: "bridge", structureTags: ["pilares", "sombra", "piedra", "talud"], bestWhen: ["amanecer", "post-freza", "viento suave", "actividad de alburno"], tacticalNote: "Ataca primero sombras, piedra y cambio rápido a profundidad. Buen sitio para pez en transición y para revisar actividad suspendida con sonda." },
  { reservoirId: "garcia-sola", slug: "riprap-piedra", name: "Tramos de riprap y piedra rota", zoneType: "riprap", structureTags: ["piedra", "cangrejo", "transición"], bestWhen: ["viento lateral", "sol medio", "bass activo a reacción"], tacticalNote: "Muy buena zona para jig, spinnerbait y chatter si el viento mueve orilla o empuja pasto." },
  { reservoirId: "garcia-sola", slug: "entradas-recula", name: "Entradas y salidas de recula", zoneType: "cove", structureTags: ["mezcla de agua", "paso", "alga", "pez pasto"], bestWhen: ["mañana", "mediodía solunar", "cambios de viento"], tacticalNote: "Prioriza entradas con cobertura y salida cercana a canal. Ideal para fluke, texas y lectura fina de pez comiendo alburno." },
  { reservoirId: "garcia-sola", slug: "puntas-canal", name: "Puntas con acceso a canal", zoneType: "point", structureTags: ["punta", "corte", "canal", "transición"], bestWhen: ["post-freza", "pez desplazado", "viento moderado"], tacticalNote: "Muy útiles para patrón de transición. Revisar paralelo y luego cara profunda con sonda antes de abandonar." },

  { reservoirId: "orellana", slug: "puntas-claras", name: "Puntas claras y cambios de piedra", zoneType: "point", structureTags: ["claridad", "piedra", "drop", "alburno"], bestWhen: ["agua clara", "viento suave", "bass receloso", "finesse"], tacticalNote: "Menos ruido, más precisión. Agua clara pide distancia, caída natural y revisar la cara profunda con sonda antes de insistir." },
  { reservoirId: "orellana", slug: "playas-tecnicas", name: "Playas técnicas con transición", zoneType: "flat", structureTags: ["llanura", "transición", "cambio de fondo"], bestWhen: ["post-freza", "pez suelto", "primera hora"], tacticalNote: "Sirven para interceptar pez que sale de freza y no termina de irse profundo. Ideal para fluke, senko y swimbait fino." },
  { reservoirId: "orellana", slug: "cambios-piedra", name: "Cambios de piedra y corte", zoneType: "channel-edge", structureTags: ["piedra", "corte", "profundidad", "cangrejo"], bestWhen: ["sol alto", "jig", "pez pegado"], tacticalNote: "Si falla la orilla amable, aprieta aquí con jig, texas o neko y mira si el pez se ha pegado al primer escalón serio." },

  { reservoirId: "cijara", slug: "colas-brazos", name: "Colas y brazos remotos", zoneType: "channel-edge", structureTags: ["cola", "madera", "brazo", "menos presión"], bestWhen: ["jornadas largas", "pez menos tocado", "actividad de pasto"], tacticalNote: "Cíjara premia lectura de agua y tiempo invertido. Los sectores menos machacados suelen merecer la pena." },
  { reservoirId: "cijara", slug: "recortados-rocosos", name: "Recortados rocosos", zoneType: "riprap", structureTags: ["roca", "recorte", "profundidad cercana"], bestWhen: ["viento útil", "reacción", "bass/lucio activos"], tacticalNote: "Buenos para power fishing controlado cuando el viento mete oxígeno y mueve alburno sobre piedra." },
  { reservoirId: "cijara", slug: "puntas-madera", name: "Puntas con madera o cobertura aislada", zoneType: "point", structureTags: ["punta", "madera", "emboscada"], bestWhen: ["mañana", "post-freza", "pez de paso"], tacticalNote: "Haz pocas pero buenas: cobertura aislada con profundidad cerca suele dar el pez mejor colocado del tramo." },

  { reservoirId: "encinarejo", slug: "vegetacion-somera", name: "Vegetación y someras", zoneType: "flat", structureTags: ["vegetación", "somero", "freza", "emboscada"], bestWhen: ["primavera", "bass activo", "topwater/blando"], tacticalNote: "Encinarejo suele premiar pez cerca de cobertura viva. Si ves vida, no te vayas demasiado pronto al agua profunda." },
  { reservoirId: "encinarejo", slug: "entradas-agua", name: "Entradas de agua y mezcla", zoneType: "cove", structureTags: ["oxígeno", "pasto", "transición"], bestWhen: ["cambios de viento", "actividad", "mañana"], tacticalNote: "Si entra agua o movimiento, revisa rápido porque puede concentrar mucho pez pequeño y algún bass bueno detrás." },

  { reservoirId: "guadalmena", slug: "cortados-principales", name: "Cortados y caras profundas", zoneType: "channel-edge", structureTags: ["corte", "profundidad", "suspensión"], bestWhen: ["sonda", "mediodía", "pez desplazado"], tacticalNote: "Muy buen embalse para mezclar visual y electrónica. Si el pez se despega de orilla, aquí hay que leer fino." },
  { reservoirId: "guadalmena", slug: "puntas-brazos", name: "Puntas de brazos", zoneType: "point", structureTags: ["punta", "paso", "emboscada"], bestWhen: ["amanecer", "transición", "viento útil"], tacticalNote: "Las puntas bien situadas pueden darte tanto bass como lucio según presión, viento y presencia de pasto." },

  { reservoirId: "yeguas", slug: "orillas-tomadas", name: "Orillas tomadas y transiciones", zoneType: "flat", structureTags: ["agua tomada", "transición", "reacción"], bestWhen: ["viento", "reacción", "pez activo"], tacticalNote: "Si el agua toma un poco de color, gana enteros el power fishing y la búsqueda rápida de sectores vivos." },
  { reservoirId: "yeguas", slug: "puntas-mix", name: "Puntas mixtas", zoneType: "point", structureTags: ["punta", "piedra", "profundidad cerca"], bestWhen: ["cambio de luz", "pez en paso"], tacticalNote: "Buen sitio para alternar fluke, jig y spinner según lo que te devuelva el agua." },

  { reservoirId: "san-rafael-de-navallana", slug: "estructuras-cola", name: "Estructuras y colas", zoneType: "cove", structureTags: ["cola", "estructura", "pasto"], bestWhen: ["mañana", "sectores con vida", "presión media"], tacticalNote: "Navallana agradece seleccionar bien los sectores con señal real de comida; si no la ves, no te enamores del sitio." },
  { reservoirId: "san-rafael-de-navallana", slug: "someras-utiles", name: "Someras útiles", zoneType: "flat", structureTags: ["somero", "orilla", "transición"], bestWhen: ["primera hora", "post-freza"], tacticalNote: "La ventana corta de somero puede ser muy buena, pero suele caer rápido: tener plan B profundo es obligatorio." },

  { reservoirId: "la-brena", slug: "paredes-reculas", name: "Paredes y reculas", zoneType: "cove", structureTags: ["pared", "recorte", "sombra"], bestWhen: ["sol cambiante", "transición", "pez de ambush"], tacticalNote: "Combina caras de sombra y reculas con cambio rápido. Hay que leer dónde se coloca el pez cada día." },
  { reservoirId: "la-brena", slug: "zonas-mixtas", name: "Zonas mixtas", zoneType: "point", structureTags: ["mixto", "piedra", "orilla-profundo"], bestWhen: ["día variable", "búsqueda"], tacticalNote: "Buen embalse para patrón de descarte: empieza mixto, localiza actividad y luego aprieta el tipo de puesto ganador." },
] as const;
