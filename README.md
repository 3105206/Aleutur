# Al Eutur Perfumes — sitio web

Sitio publicado en **https://aleutur.netlify.app**

Cada cambio que se sube a la rama `main` de este repositorio se publica solo en
Netlify, en uno o dos minutos. No hay que subir nada a mano.

## Qué hay en cada carpeta

| Ruta | Para qué sirve |
|---|---|
| `index.html` | La estructura de la página (encabezado, secciones, pie). Casi nunca se toca. |
| `css/estilos.css` | Colores, tipografías y diseño. |
| `js/app.js` | Arma las fichas, el buscador, los filtros y los botones de WhatsApp. |
| `datos/perfumes.js` | **La lista de perfumes de la colección.** |
| `datos/decants.js` | **Los decants y los combos, con sus precios.** |
| `img/perfumes/` | Una foto por perfume, con fondo transparente (`.webp`). |
| `herramientas/agregar_perfume.py` | Script que procesa la foto y agrega la ficha. |

## Cómo agregar un perfume

Hacen falta dos cosas: la foto del frasco y los datos de la ficha.

1. Guardar la foto en `img/perfumes/<clave>.webp` (fondo transparente, unos 720 px de alto).
2. Agregar un bloque a `datos/perfumes.js`:

```js
{
  "k": "tresnuit",                      // clave única, minúsculas, sin espacios
  "name": "Tres Nuit",
  "brand": "Armaf",
  "seccion": "arabe",                   // arabe | disenador
  "genero": "hombre",                   // hombre (incluye unisex) | mujer
  "fam": "Aromática verde",             // texto debajo del nombre
  "cat": "fresco",                      // fresco | oriental | amaderado | gourmand
  "encargue": false,                    // true = etiqueta "Por encargue"
  "img": "img/perfumes/tresnuit.webp",
  "desc": "Descripción corta del perfume.",
  "top": "Limón · Verbena",             // notas de salida
  "heart": "Violeta · Iris",            // notas de corazón
  "base": "Ámbar gris · Sándalo",       // notas de fondo
  "il": "Inspirado en",
  "insp": "Green Irish Tweed · Creed"
}
```

El orden de la lista es el orden en que se ven en la web, dentro de cada sección.

La web tiene tres secciones de frascos enteros: **Diseñador** (arriba),
**Perfumes árabes** (con buscador y filtros) y **Mujer**, que tiene un grupo
de diseñador y otro de árabes. Los campos `seccion` y `genero` deciden dónde
aparece cada ficha: con `"genero": "mujer"` va a la sección Mujer, en el grupo
que le corresponda según `seccion`. Los de diseñador llevan `"il": "Presentación"` e
`"insp": "Original · 100 ml"` en lugar del perfume de referencia.

El script hace los dos pasos de una (quita el fondo negro o blanco de la foto,
la achica y agrega la ficha):

```bash
python3 herramientas/agregar_perfume.py --foto foto.jpg --clave tresnuit \
  --nombre "Tres Nuit" --marca "Armaf" --familia "Aromática verde" --cat fresco \
  --desc "Descripción corta." --salida "Limón · Verbena" --corazon "Violeta · Iris" \
  --fondo "Ámbar gris · Sándalo" --inspirado "Green Irish Tweed · Creed"
```

Para un perfume de mujer se agrega `--genero mujer`.

Para un perfume de diseñador se agrega `--seccion disenador --etiqueta "Presentación"`
y en `--inspirado` va la presentación (por ejemplo `"Original · 100 ml"`).

## Cómo cambiar un precio de decant o un combo

Editar `datos/decants.js`. El campo `precio` va en pesos, sin puntos. Cada
decant usa la clave `k` de un perfume de la colección y toma de ahí el nombre,
la marca y la foto.

## Cómo sacar un perfume

Borrar su bloque de `datos/perfumes.js`. Si tenía decant o estaba en un combo,
sacarlo también de `datos/decants.js`.

## Datos de contacto del sitio

- WhatsApp: el número está en `js/app.js` (constante `WA`) y en los enlaces de `index.html`.
- Instagram: `aleutur_perfumeria`, en el pie de `index.html`.
