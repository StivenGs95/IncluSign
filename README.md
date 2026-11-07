# IncluSign MVP

Prototipo estático de aprendizaje de Lengua de Señas Colombiana preparado para Apache/WAMP.

## Estructura

- `index.html`: entrada del sitio; redirige al acceso.
- `pages/`: login demostrativo, inicio de aprendizaje, catálogo de cursos, detalle de lección y perfil.
- `assets/css/`: estilos de la interfaz.
- `assets/js/`: interacciones del prototipo.
- `assets/img/`: logotipo completo y símbolo para el menú compacto.

## Ejecutar en WAMP

1. Inicia los servicios de Apache desde Wampserver.
2. Abre `http://localhost/proyecto/`.

No requiere PHP ni base de datos en esta fase. El login permite entrar a la pantalla principal sin validar cuentas; el avance y el guardado son demostrativos y no persisten información. El catálogo presenta cinco cursos con sus lecciones en acordeones.

## Dependencias externas

- Bootstrap 5.3.3 se carga desde jsDelivr.
- Las fotografías de ambientación se cargan desde Unsplash.

La carga de estos recursos requiere conexión a internet. Para una versión sin conexión, se deben incluir Bootstrap y las imágenes dentro de `assets/` y actualizar sus referencias.
