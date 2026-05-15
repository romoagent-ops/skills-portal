# skills-portal

Portal mobile-first para `skills.romobot.es`.

## Objetivo
Agrupar las skills de Romo en una interfaz móvil seria, clara y extensible, separada del prototipo previo de Fishing Intel.

## Desarrollo
```bash
npm install
npm run dev
```

## Validación
```bash
npm run lint
npm run build
```

## Cierre temporal
La app puede cerrarse con auth interna usando estas variables en `.env.local`:
```bash
SKILLS_PORTAL_PASSWORD=...
SKILLS_PORTAL_SESSION_TOKEN=...
```
Esto es un cierre temporal hasta moverlo a Cloudflare Zero Trust.

## Nota
Fishing Intel queda archivada por ahora y se retomará después en su propio repositorio.
