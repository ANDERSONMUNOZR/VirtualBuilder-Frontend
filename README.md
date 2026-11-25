# VirtualBuilder — laboratorio educativo de construcción con bloques

> Construye tus ideas con las manos.

Aplicación web para crear, editar y guardar estructuras 3D hechas de bloques individuales, usando gestos de las
manos reconocidos con **MediaPipe** o controles con el mouse. Incluye una expansión (**DLC**) que sincroniza la
construcción con un mundo de **Minecraft Java Edition** en tiempo real.

Proyecto integrador — Lenguaje de Programación Frontend · Tecnología Superior en Desarrollo de Software ·
Instituto Superior Tecnológico Liceo Cristiano · 2026.

## Integrantes
| Integrante | Responsabilidades |
|---|---|
| Michael George España Vera | HTML5, Bootstrap, estructura de páginas y navegación |
| Jaime Eduardo Gaybor Gómez | CSS3, estilos responsive, diseño visual y biblioteca de bloques |
| Anderson Javier Muñoz Rivera | JavaScript, constructor 3D, MediaPipe, guardado y pruebas |

## Tecnologías
- **HTML5, CSS3, Bootstrap 5 y JavaScript puro** (sin frameworks).
- **Three.js** (librería de gráficos 3D) cargada desde CDN.
- **MediaPipe Hands** para el reconocimiento de manos *(en desarrollo)*.
- **localStorage** para guardar proyectos *(en desarrollo)*.
- DLC: **Java + PaperMC** para Minecraft Java Edition *(en desarrollo)*.

## Funcionalidades
- [x] Biblioteca de bloques con categorías, buscador y equivalencia en Minecraft.
- [x] Colocar bloques con el mouse sobre una cuadrícula 3D de 32 × 32 × 32.
- [x] Editar, reemplazar (pintar), copiar material y eliminar bloques; deshacer y rehacer.
- [x] Estadísticas en vivo: cantidad de bloques, tamaño y bloques por material.
- [ ] Guardar y recuperar proyectos con localStorage.
- [ ] Control con gestos de las manos (MediaPipe).
- [ ] Herramientas de forma: línea, muro, anillo, caja, esfera y pirámide.
- [ ] Retos guiados de construcción con progreso.
- [ ] DLC Minecraft: sincronización en tiempo real.

## Cómo ejecutarlo
La cámara del navegador solo funciona en `localhost` o en `https`, por eso se usa un servidor local
(Python viene incluido en la mayoría de equipos):

```bash
python -m http.server 8080
```

Luego abrir <http://localhost:8080>.

## Controles del constructor
| Acción | Mouse / teclado |
|---|---|
| Usar herramienta | Clic izquierdo |
| Borrar | Clic derecho |
| Girar / mover cámara | Arrastrar / arrastrar con clic derecho |
| Zoom | Rueda del mouse |
| Herramientas | `B` colocar · `E` borrar · `P` pintar · `I` copiar material |
| Deshacer / rehacer | `Ctrl + Z` / `Ctrl + Y` |

## Estructura
```
index.html            Portada
constructor.html      Espacio de construcción 3D
css/                  Tema visual y estilos del constructor
js/constructor/       Lógica del constructor (mundo, historial, escena 3D, herramientas, interfaz)
```
