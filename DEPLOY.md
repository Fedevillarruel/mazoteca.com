# Deployment en Hostinger (Node.js Hosting)

## Requisitos previos
- Plan de Hostinger con **Node.js hosting** (Business o superior)
- Acceso al panel de Hostinger (hPanel)
- Repositorio en GitHub: `Fedevillarruel/mazoteca.com`

## Paso a paso

### 1. Conectar repositorio en Hostinger

1. Entrá a **hPanel** → **Avanzado** → **Git**
2. Conectá tu repo: `https://github.com/Fedevillarruel/mazoteca.com.git`
3. Branch: `main`
4. Activá **Auto Deploy** para que se deplogue al hacer push

### 2. Configurar Node.js en Hostinger

1. Ir a **hPanel** → **Avanzado** → **Node.js**
2. Configurar:
   - **Node.js version**: 20.x (o la más reciente disponible)
   - **Startup file**: `server.js`
   - **Port**: dejá el que Hostinger asigne (usa `process.env.PORT`)

### 3. Configurar variables de entorno

En **hPanel** → **Node.js** → **Environment Variables**, agregá:

```
NEXT_PUBLIC_SUPABASE_URL=https://jpuotljgoukutbrxfnvb.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
NEXT_PUBLIC_SITE_URL=https://mazoteca.com
```

### 4. Build y deploy

Hostinger ejecuta automáticamente estos comandos al hacer deploy:

```bash
npm install
npm run build
```

Y arranca la app con:

```bash
npm start
```

Que ejecuta `node server.js` → carga el servidor standalone de Next.js.

### 5. Verificar

Entrá a `https://mazoteca.com` y deberías ver la página de Mazoteca.

---

## Estructura del deploy

```
/                        ← root del hosting
├── server.js            ← entry point (carga .next/standalone/server.js)
├── package.json         ← scripts: build, start
├── next.config.ts       ← output: "standalone"
├── .next/
│   ├── standalone/      ← servidor Node.js autocontenido
│   │   └── server.js    ← servidor Next.js real
│   └── static/          ← assets estáticos
├── public/              ← archivos públicos
└── src/                 ← código fuente
```

## Troubleshooting

### "To get started, edit the page.tsx file"
Esto significa que el build no se ejecutó o que Hostinger no está usando el `server.js` correcto.
- Verificá que el **Startup file** sea `server.js` (no `app.js` ni `index.js`)
- Ejecutá el build manualmente desde SSH: `npm run build`
- Reiniciá la app Node.js desde hPanel

### La página carga pero sin estilos
Los archivos estáticos necesitan servirse desde `.next/static/`. El standalone server ya los maneja.

### Error 500
Revisá los logs en hPanel → Node.js → Logs. Probablemente faltan variables de entorno.
