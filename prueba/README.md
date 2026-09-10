# 🌤️ climita — Barry Outdoors Weather & Activity Decision Engine

> Sistema inteligente y minimalista de evaluación meteorológica en tiempo real para la toma de decisiones en actividades al aire libre, impulsado por **React + Vite**, la **API pública de Open-Meteo** y flujos automatizados en **n8n**.

---

## 📌 Tabla de Contenidos
- [Descripción General](#-descripción-general)
- [Características Principales](#-características-principales)
- [Reglas de Negocio y Evaluación de Riesgo](#-reglas-de-negocio-y-evaluación-de-riesgo)
- [Matriz de Viabilidad de Actividades](#-matriz-de-viabilidad-de-actividades)
- [Integración con n8n & json-server](#-integración-con-n8n--json-server)
- [Estructura del Proyecto (Feature-based)](#-estructura-del-proyecto-feature-based)
- [Instalación y Puesta en Marcha](#-instalación-y-puesta-en-marcha)
- [Tecnologías Utilizadas](#-tecnologías-utilizadas)

---

## 📖 Descripción General

**climita** es una plataforma diseñada para guías, organizadores de expediciones y entusiastas del aire libre. La aplicación analiza automáticamente múltiples variables climáticas (temperatura, sensación térmica, lluvia, probabilidad de precipitación, velocidad y dirección del viento, humedad) para calcular un nivel de riesgo objetivo y emitir un dictamen técnico:

- 🟢 **Realizar**: Condiciones óptimas y seguras.
- 🟡 **Precaución**: Requiere equipo preventivo y monitoreo continuo.
- 🔴 **Reprogramar**: Condiciones adversas o de alto riesgo para los participantes.

---

## 🌟 Características Principales

1. **⏰ Selector Horario Interactivo (Timeline 24h con Mini Gráficos)**:
   - Permite consultar el clima hora por hora.
   - Cada hora incluye una barra visual vertical de nivel para comparar la temperatura y la precipitación de un vistazo.

2. **📅 Selector de Día (`Hoy` / `Mañana`)**:
   - Alterna entre el pronóstico de hoy y el de mañana, recalculando todas las métricas en tiempo real.

3. **🎯 Matriz de Viabilidad de Actividades (Qué SÍ y qué NO hacer)**:
   - Clasifica automáticamente qué expediciones están recomendadas (ej. *Senderismo, Picnic*) y cuáles están desaconsejadas (ej. *Kayak por viento > 18 km/h* o *Escalada por lluvia*).

4. **🌙 Micro-Animaciones Dinámicas (Día / Noche / Lluvia / Tormenta)**:
   - Las animaciones están **encapsuladas en el ícono meteorológico** sin sobrecargar la pantalla:
     - ☀️ **Día Soleado**: Sol brillante con rayos giratorios y partículas doradas.
     - 🌙 **Noche Estrellada**: Luna creciente con destellos de estrellas.
     - 🌧️ **Lluvia**: Nube con gotas cayendo continuamente.
     - ⛈️ **Tormenta**: Nube oscura con chispas de relámpagos intermitentes.

5. **🧭 Brújula y Dirección del Viento**:
   - Widget interactivo con aguja orientada en tiempo real hacia los rumbos cardinales (*N, NE, E, SE, S, SO, O, NO*) y velocidad en km/h.

6. **⭐ Lugares Favoritos con Persistencia Local (`LocalStorage`)**:
   - Permite marcar destinos con una estrella para tenerlos siempre fijados en primer lugar.

7. **🌟 Mejor Ventana del Día (Recomendación Inteligente)**:
   - Algoritmo que analiza las 24 horas y sugiere el bloque horario óptimo con menor lluvia y temperatura más agradable.

8. **🎒 Checklist Dinámico de Equipamiento**:
   - Lista interactiva con casillas de verificación que se adapta al clima (añade impermeables si llueve, protector solar si hace sol, o cortavientos/térmica si baja la temperatura).

9. **🔍 Buscador Global con Autocompletado**:
   - Barra de búsqueda conectada a Open-Meteo Geocoding para consultar cualquier ciudad, parque o localidad del mundo.

10. **📲 Generador y Compartidor de Reportes en WhatsApp**:
    - Genera un resumen listo con emojis y viabilidad de actividades para enviar con un clic a clientes y equipos de guías.

---

## ⚙️ Reglas de Negocio y Evaluación de Riesgo

El motor de reglas de negocio evalúa los siguientes umbrales:

| Nivel de Riesgo | Recomendación | Criterios Meteorológicos |
| :--- | :--- | :--- |
| **Crítico / Alto** | 🔴 **Reprogramar** | Temperatura `< 10°C` o `> 35°C`<br>Precipitación `> 2.0 mm`<br>Viento `> 30 km/h` o ráfagas `> 50 km/h` |
| **Moderado** | 🟡 **Precaución** | Temperatura `10°C - 14°C` o `31°C - 35°C`<br>Precipitación `0.1 mm - 2.0 mm`<br>Viento `15 km/h - 30 km/h` |
| **Bajo** | 🟢 **Realizar** | Condiciones meteorológicas dentro de los rangos óptimos de seguridad. |

---

## 🥾 Matriz de Viabilidad de Actividades

Cada actividad al aire libre cuenta con sus propios parámetros de tolerancia:

- 🥾 **Senderismo / Trekking**: Lluvia máx: 1.5 mm | Viento máx: 28 km/h | Temp: 8°C - 34°C
- 🚣 **Kayak & Deportes Acuáticos**: Lluvia máx: 0.5 mm | Viento máx: 18 km/h | Temp: 14°C - 36°C
- ⛺ **Campamento Nocturno**: Lluvia máx: 1.0 mm | Viento máx: 22 km/h | Temp: 10°C - 32°C
- 🚵 **Ciclismo de Montaña (MTB)**: Lluvia máx: 0.8 mm | Viento máx: 25 km/h | Temp: 10°C - 33°C
- 🧗 **Escalada en Roca**: Lluvia máx: 0.1 mm | Viento máx: 20 km/h | Temp: 12°C - 30°C
- 🧺 **Picnic & Paseo**: Lluvia máx: 0.2 mm | Viento máx: 24 km/h | Temp: 15°C - 32°C

---

## 🤖 Integración con n8n & json-server

El proyecto incluye flujos exportados listos para n8n:

1. **`barry-outdoors-webhook-and-db-n8n-workflow.json`**:
   - `Webhook Trigger` (POST a `/weather-evaluation`)
   - `HTTP Request` (Open-Meteo API)
   - `Code Node - Business Rules` (Evaluación de umbrales)
   - `Switch - Routes` (Realizar / Precaución / Reprogramar)
   - `Save to JSON-Server DB` (POST a `http://localhost:3001/evaluations`)
   - `Respond to Webhook` (Devuelve el resultado al frontend de React)

2. **`db.json`**:
   - Colecciones para `locations`, `activities`, `evaluations`, `alerts` y `participants`.

---

## 📁 Estructura del Proyecto (Feature-based)

```text
prueba/
├── index.html
├── package.json
├── vite.config.js
├── db.json                                              # Base de datos simulada para json-server
├── barry-outdoors-weather-n8n-workflow.json             # Workflow de prueba n8n
├── barry-outdoors-webhook-and-db-n8n-workflow.json      # Workflow completo con Webhook y DB
└── src/
    ├── App.jsx                                          # Punto de entrada de la aplicación
    ├── index.css                                        # Sistema de diseño minimalista Dark Obsidian
    ├── main.jsx                                         # Renderizado de React
    ├── pages/
    │   └── dashboard-page.jsx                           # Vista principal ensamblada
    ├── features/
    │   └── weather-evaluation/
    │       ├── components/
    │       │   └── weather-panel.jsx                    # Panel interactivo de clima y actividades
    │       └── use-weather.js                           # Custom hook con reglas de negocio y estado
    └── shared/
        ├── components/
        │   ├── Loader.jsx
        │   ├── StatusBadge.jsx
        │   ├── WeatherBackgroundEffects.jsx
        │   └── WeatherCard.jsx
        └── services/
            └── api-client.js                            # Cliente HTTP con Open-Meteo y Webhooks n8n
```

---

## 🚀 Instalación y Puesta en Marcha

### 1. Clonar el repositorio
```bash
git clone https://github.com/danielramirez272006-arch/clima-actumatizacion.git
cd clima-actumatizacion/prueba
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Iniciar el servidor de desarrollo de React
```bash
npm run dev
```
La aplicación estará disponible en: **`http://localhost:5173/`** o **`http://localhost:5174/`**

### 4. (Opcional) Iniciar la API Mock (`json-server`)
```bash
npx json-server --watch db.json --port 3001
```

### 5. (Opcional) Iniciar `n8n`
```bash
n8n start
```
Abre **`http://localhost:5678/`** e importa el archivo `barry-outdoors-webhook-and-db-n8n-workflow.json`.

---

## 🛠️ Tecnologías Utilizadas

- **React 19** + **Vite 6** (Frontend moderno y de alto rendimiento)
- **Open-Meteo Forecast & Geocoding API** (Datos meteorológicos globales en tiempo real sin API key)
- **n8n Automation** (Orquestación de flujos de decisión y webhooks)
- **json-server** (Base de datos REST simulada para persistencia de auditoría)
- **Vanilla CSS3** (Diseño Dark Glassmorphism con micro-animaciones)

---

**Desarrollado con ❤️ para Barry Outdoors & climita**
