import type { LucideIcon } from 'lucide-react';
import {
  Brain,
  CalendarDays,
  Camera,
  CandlestickChart,
  Database,
  FileText,
  Fish,
  Globe2,
  Home,
  Image as ImageIcon,
  Languages,
  Mail,
  Mic,
  Presentation,
  Sparkles,
} from 'lucide-react';

export type SkillState = 'Activa' | 'Lista' | 'En pausa' | 'Próxima';
export type SkillTone = 'violet' | 'cyan' | 'emerald' | 'amber' | 'slate';

export type SkillCard = {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  state: SkillState;
  tone: SkillTone;
  icon: LucideIcon;
  metric?: string;
  href?: string;
  section: 'core' | 'ops' | 'lab' | 'paused';
};

export const skills: SkillCard[] = [
  {
    slug: 'persona',
    title: 'Persona',
    subtitle: 'Soul + Cron',
    description: 'Núcleo operativo del agente, memoria, pulso y automatizaciones.',
    state: 'Activa',
    tone: 'violet',
    icon: Brain,
    metric: '24/7',
    section: 'core',
  },
  {
    slug: 'whisper-yt',
    title: 'Whisper YT',
    subtitle: 'Audio y vídeo a texto',
    description: 'Transcripciones y extracción rápida de contenido desde audio o YouTube.',
    state: 'Lista',
    tone: 'cyan',
    icon: Mic,
    metric: 'STT',
    section: 'core',
  },
  {
    slug: 'knowledge',
    title: 'Base de conocimiento',
    subtitle: 'Memoria + contexto',
    description: 'Consulta y curación del conocimiento operativo sin perder trazabilidad.',
    state: 'Activa',
    tone: 'emerald',
    icon: Database,
    metric: 'RAG',
    section: 'core',
  },
  {
    slug: 'images',
    title: 'Images',
    subtitle: 'Prompting + edición',
    description: 'Afina el briefing, genera dentro del portal y reutiliza resultados para iterar o editar.',
    state: 'Lista',
    tone: 'amber',
    icon: ImageIcon,
    metric: 'IMG',
    href: '/images',
    section: 'core',
  },
  {
    slug: 'visual-lab',
    title: 'Visual Lab',
    subtitle: 'Creatividad controlada',
    description: 'Experimentos visuales con enfoque de producto y pruebas rápidas.',
    state: 'Próxima',
    tone: 'cyan',
    icon: Sparkles,
    metric: 'LAB',
    section: 'lab',
  },
  {
    slug: 'viral-analyser',
    title: 'Viral Analyser',
    subtitle: 'Ideas con criterio',
    description: 'Analiza potencial de piezas, ganchos y ángulos antes de producir.',
    state: 'Próxima',
    tone: 'slate',
    icon: CandlestickChart,
    metric: 'AI',
    section: 'lab',
  },
  {
    slug: 'translate-live',
    title: 'Translate Live',
    subtitle: 'Texto multilingüe',
    description: 'Traducción rápida y usable sin romper el tono ni el contexto.',
    state: 'Lista',
    tone: 'emerald',
    icon: Languages,
    metric: 'i18n',
    section: 'ops',
  },
  {
    slug: 'meetings',
    title: 'Meetings',
    subtitle: 'Notas y acciones',
    description: 'Resúmenes accionables, acuerdos y tareas a partir de reuniones.',
    state: 'Próxima',
    tone: 'slate',
    icon: CalendarDays,
    metric: 'MTG',
    section: 'ops',
  },
  {
    slug: 'ppts',
    title: 'PPTs',
    subtitle: 'Presentaciones rápidas',
    description: 'Estructura, narrativa y soporte visual para decks claros.',
    state: 'Próxima',
    tone: 'amber',
    icon: Presentation,
    metric: 'PPT',
    section: 'ops',
  },
  {
    slug: 'maily',
    title: 'Maily',
    subtitle: 'Correo operativo',
    description: 'Respuesta, seguimiento y automatización honesta del buzón.',
    state: 'Activa',
    tone: 'violet',
    icon: Mail,
    metric: 'MAIL',
    section: 'ops',
  },
  {
    slug: 'accounting',
    title: 'Contabilidad',
    subtitle: 'Operativa financiera',
    description: 'Espacio para presupuestos, facturas y control de negocio.',
    state: 'Próxima',
    tone: 'slate',
    icon: Globe2,
    metric: '€',
    section: 'ops',
  },
  {
    slug: 'quotes',
    title: 'Presupuestos',
    subtitle: 'Ofertas y cierres',
    description: 'Generación y seguimiento de propuestas comerciales.',
    state: 'Próxima',
    tone: 'amber',
    icon: FileText,
    metric: 'CRM',
    section: 'ops',
  },
  {
    slug: 'fishing-intel',
    title: 'Fishing Intel',
    subtitle: 'Briefings de pesca',
    description: 'Briefing táctico por embalse, fecha, especie, spot y lectura sonar, ya integrado en el portal.',
    state: 'Lista',
    tone: 'cyan',
    icon: Fish,
    metric: 'LIVE',
    href: '/fishing',
    section: 'core',
  },
  {
    slug: 'seguro-hogar',
    title: 'Seguro Hogar',
    subtitle: 'Póliza entendible',
    description: 'Lectura interactiva de la póliza: coberturas, exclusiones y guía práctica para enfocar partes.',
    state: 'Lista',
    tone: 'emerald',
    icon: Home,
    metric: 'POL',
    href: '/insurance/home',
    section: 'ops',
  },
  {
    slug: 'capture-log',
    title: 'Capture Log',
    subtitle: 'Fotos + EXIF + spots',
    description: 'Futuro módulo para geolocalizar capturas y aprender del histórico.',
    state: 'Próxima',
    tone: 'cyan',
    icon: Camera,
    metric: 'EXIF',
    section: 'paused',
  },
];

export const sectionMeta = {
  core: {
    title: 'Activas ahora',
    subtitle: 'Lo que ya tiene sentido abrir desde el móvil.',
  },
  ops: {
    title: 'Operativa',
    subtitle: 'Herramientas de trabajo y ejecución diaria.',
  },
  lab: {
    title: 'Laboratorio',
    subtitle: 'Piezas que vienen después, cuando merezcan existir.',
  },
  paused: {
    title: 'Bajo llave',
    subtitle: 'Ideas guardadas para retomarlas sin contaminar el portal principal.',
  },
} as const;
