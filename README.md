# ClínicaConnect - Gestión Interdisciplinaria

Sistema de gestión de informes médicos interdisciplinarios para centros de día, con integración de IA (Gemini) para asistencia en redacción y análisis.

## Características

- Gestión de informes por roles profesionales (Psicología, Nutrición, Terapia Ocupacional, etc.)
- Formularios especializados: Evolución Bimestral, Admisión Integral, Informe Semestral, Planificación Semestral
- Asistencia de IA para mejorar redacción, generar conclusiones, sugerir objetivos y actividades
- Autenticación personalizada con Firebase
- Interfaz responsiva con Tailwind CSS
- Vista de impresión optimizada para PDF

## Instalación

1. Clona el repositorio:
   ```bash
   git clone <url-del-repo>
   cd clinica-connect
   ```

2. Instala las dependencias:
   ```bash
   npm install
   ```

3. Configura las variables de entorno:
   Copia `.env` y configura tus claves:
   ```env
   REACT_APP_FIREBASE_CONFIG={"apiKey":"...","authDomain":"...","projectId":"...","storageBucket":"...","messagingSenderId":"...","appId":"..."}
   REACT_APP_APP_ID=tu-app-id
   REACT_APP_INITIAL_AUTH_TOKEN=opcional-token-personalizado
   REACT_APP_GEMINI_API_KEY=tu-clave-gemini
   ```

4. Inicia la aplicación en desarrollo:
   ```bash
   npm start
   ```

## Despliegue

### Build de Producción

```bash
npm run build
```

Esto crea la carpeta `build` con los archivos optimizados para producción.

### Opciones de Despliegue

#### Vercel
1. Conecta tu repo a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Despliega automáticamente

#### Netlify
1. Sube la carpeta `build` o conecta el repo
2. Configura las variables de entorno en Netlify
3. Despliega

#### Firebase Hosting
```bash
npm install -g firebase-tools
firebase login
firebase init hosting
firebase deploy
```

#### Apache/Nginx
Sube el contenido de `build` a tu servidor web.

## Configuración de Firebase

1. Crea un proyecto en Firebase Console
2. Habilita Firestore Database
3. Configura Authentication (opcional para auth personalizada)
4. Copia la configuración del SDK en `.env`

## Configuración de Gemini API

1. Obtén una API key de Google AI Studio
2. Configura `REACT_APP_GEMINI_API_KEY` en `.env`

## Estructura del Proyecto

```
clinica-connect/
├── public/
│   ├── index.html
│   └── ...
├── src/
│   ├── App.js          # Componente principal
│   ├── index.js        # Punto de entrada
│   └── index.css       # Estilos Tailwind
├── .env                # Variables de entorno
├── package.json
├── tailwind.config.js
└── postcss.config.js
```

## Uso

1. Regístrate o inicia sesión
2. Crea un nuevo informe seleccionando el tipo y datos del paciente
3. Edita las secciones según tu rol profesional
4. Usa los botones de IA para asistencia
5. Guarda y genera PDF para impresión

## Roles y Permisos

- **Admin**: Acceso completo a todas las secciones
- **Profesionales**: Edición solo en sus áreas específicas
- **Lectura**: Visualización de informes completos

## Tecnologías

- React 18
- Firebase (Auth, Firestore)
- Tailwind CSS
- Lucide React (iconos)
- Google Gemini AI