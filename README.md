# IncluSign — Prototipo funcional

Herramienta web para el **aprendizaje y la consulta de la Lengua de Señas Colombiana (LSC)**, orientada a personas oyentes que quieren dar su primer paso para comunicarse con personas sordas.

Proyecto de Software · Facultad de Ingeniería · Corporación Universitaria Iberoamericana
Equipo: Jeison Stiven González Santana · Natalia Ramos Feo

## Cómo abrirlo

Es un prototipo solo de interfaz (HTML, CSS y JavaScript): no necesita base de datos ni PHP.

- Con XAMPP: inicia **Apache** y abre `http://localhost/IncluSign/` (redirige a `pages/login.html`).
- También funciona en cualquier hosting estático (por ejemplo, GitHub Pages).

Se necesita conexión a internet para cargar los videos y los estilos.

**Cuenta de prueba:** `estudiante@inclusign.co` / `Estudiante2026*` (también puedes crear una cuenta nueva).

## Funcionalidades

| Módulo | Qué permite |
|---|---|
| Cuentas | Registro, inicio y cierre de sesión (simulados en el navegador) |
| Mi aprendizaje | Siguiente lección sugerida, avance, señas aprendidas y precisión en la práctica |
| Lecciones | 5 cursos y 10 lecciones; las señas se ven una a una en video |
| Diccionario | 27 señas con video en 4 categorías, búsqueda sin distinguir tildes y favoritas |
| Práctica | Cuestionarios con el video de la seña (sin mostrar la palabra) y cuatro opciones |
| Perfil | Estadísticas, cursos, favoritas, cambio de nombre y contraseña |

## Videos de las señas

Todas las señas se muestran con los videos oficiales de la serie **#UnaSeñaParaTi** del Instituto Nacional para Sordos (INSOR), insertados desde su canal de YouTube y citados en cada página:
https://conecta.insor.gov.co/contenidos-accesibles/

Para agregar una seña, añade una entrada en `assets/js/datos.js` con el identificador del video de YouTube.

## Datos

No hay servidor ni base de datos. Las cuentas, el avance, las favoritas y los resultados se guardan en el `localStorage` del navegador; si se borran los datos del navegador, el prototipo vuelve a su estado inicial.

## Estructura

```
├── index.html                ← redirige a pages/login.html
├── pages/
│   ├── login.html            ← inicio de sesión
│   ├── register.html         ← crear cuenta
│   ├── main.html             ← Mi aprendizaje
│   ├── catalog.html          ← catálogo de cursos
│   ├── serviceDetails.html   ← lección con videos
│   ├── dictionary.html       ← diccionario
│   ├── signDetails.html      ← ficha de una seña
│   ├── practice.html         ← práctica
│   └── profile.html          ← perfil
├── assets/css/style.css
├── assets/js/datos.js    ← señas, videos, cursos y lecciones
├── assets/js/app.js      ← lógica y pantallas
├── assets/img/
└── docs/                 ← documento de entrega y pantallazos
```

IncluSign es una herramienta de apoyo y no reemplaza la enseñanza formal de la LSC.
