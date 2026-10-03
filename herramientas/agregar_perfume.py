#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Agrega (o actualiza) un perfume en la web de Al Eutur.

Hace dos cosas:
  1. Toma la foto del frasco, le quita el fondo liso (negro o blanco),
     la achica y la guarda como img/perfumes/<clave>.webp
  2. Agrega la ficha a datos/perfumes.js (o la reemplaza si la clave ya existe)

Uso:
  python3 herramientas/agregar_perfume.py \
      --foto foto.jpg --clave tresnuit \
      --nombre "Tres Nuit" --marca "Armaf" \
      --familia "Aromática verde" --cat fresco \
      --desc "Limón y violeta sobre un fondo de ámbar gris." \
      --salida "Limón · Verbena" --corazon "Violeta · Iris" --fondo "Ámbar gris · Sándalo" \
      --inspirado "Green Irish Tweed · Creed"

Opcionales: --encargue  --despues-de <clave>  --etiqueta "Lanzamiento"
Requiere: pip install pillow numpy scipy
"""
import argparse
import json
import re
import sys
from pathlib import Path

RAIZ = Path(__file__).resolve().parent.parent
DATOS = RAIZ / "datos" / "perfumes.js"
IMGS = RAIZ / "img" / "perfumes"
CATS = ("fresco", "oriental", "amaderado", "gourmand")
ORDEN = ["k", "name", "brand", "fam", "cat", "encargue", "img",
         "desc", "top", "heart", "base", "il", "insp"]
MARCA_INICIO = "window.PERFUMES = "


def leer():
    txt = DATOS.read_text(encoding="utf-8")
    i = txt.index(MARCA_INICIO)
    cab = txt[:i + len(MARCA_INICIO)]
    cuerpo = txt[i + len(MARCA_INICIO):].strip()
    if cuerpo.endswith(";"):
        cuerpo = cuerpo[:-1]
    return cab, json.loads(cuerpo)


def escribir(cab, lista):
    DATOS.write_text(cab + json.dumps(lista, ensure_ascii=False, indent=2) + ";\n",
                     encoding="utf-8")


def procesar_foto(origen, destino, alto=720):
    """Quita el fondo liso que toca los bordes y guarda en WebP transparente."""
    import numpy as np
    from PIL import Image, ImageFilter
    from scipy import ndimage

    im = Image.open(origen)
    if im.mode in ("RGBA", "LA") and np.array(im.convert("RGBA"))[..., 3].min() < 250:
        out = im.convert("RGBA")                      # ya viene sin fondo
    else:
        rgb = np.array(im.convert("RGB")).astype(np.int16)
        esquinas = np.concatenate([rgb[:6, :6].reshape(-1, 3), rgb[:6, -6:].reshape(-1, 3),
                                   rgb[-6:, :6].reshape(-1, 3), rgb[-6:, -6:].reshape(-1, 3)])
        fondo = np.median(esquinas, axis=0)
        dist = np.abs(rgb - fondo).max(axis=2)
        parecido = dist < 24
        etiquetas, _ = ndimage.label(parecido)
        borde = set(etiquetas[0, :]) | set(etiquetas[-1, :]) | set(etiquetas[:, 0]) | set(etiquetas[:, -1])
        borde.discard(0)
        es_fondo = np.isin(etiquetas, list(borde))
        alfa = np.where(es_fondo, 0, 255).astype(np.uint8)
        alfa = np.array(Image.fromarray(alfa).filter(ImageFilter.GaussianBlur(0.8)))
        alfa[alfa < 40] = 0
        out = Image.fromarray(np.dstack([rgb.astype(np.uint8), alfa]), "RGBA")

    caja = out.getbbox()
    if caja:
        out = out.crop(caja)
    if out.height > alto:
        out = out.resize((round(out.width * alto / out.height), alto), Image.LANCZOS)
    destino.parent.mkdir(parents=True, exist_ok=True)
    out.save(destino, "WEBP", quality=88, method=6)
    return out.size


def main():
    ap = argparse.ArgumentParser(description="Agrega un perfume a la web de Al Eutur")
    ap.add_argument("--clave", required=True, help="identificador corto, sin espacios (ej: tresnuit)")
    ap.add_argument("--nombre", required=True)
    ap.add_argument("--marca", required=True)
    ap.add_argument("--familia", required=True, help="texto bajo el nombre (ej: Oriental gourmand)")
    ap.add_argument("--cat", required=True, choices=CATS, help="filtro de la colección")
    ap.add_argument("--desc", required=True)
    ap.add_argument("--salida", required=True)
    ap.add_argument("--corazon", required=True)
    ap.add_argument("--fondo", required=True)
    ap.add_argument("--inspirado", required=True, help="perfume de referencia, o texto libre")
    ap.add_argument("--etiqueta", default="Inspirado en", help='rótulo del recuadro (ej: "Lanzamiento")')
    ap.add_argument("--foto", help="foto del frasco; si se omite se mantiene la que ya exista")
    ap.add_argument("--encargue", action="store_true")
    ap.add_argument("--despues-de", dest="despues", help="clave del perfume tras el cual insertarlo")
    a = ap.parse_args()

    if not re.fullmatch(r"[a-z0-9_]+", a.clave):
        sys.exit("La clave solo puede tener minúsculas, números y guión bajo.")

    img_rel = f"img/perfumes/{a.clave}.webp"
    if a.foto:
        tam = procesar_foto(Path(a.foto), RAIZ / img_rel)
        print(f"Foto guardada en {img_rel}  {tam[0]}x{tam[1]}")
    elif not (RAIZ / img_rel).exists():
        sys.exit(f"Falta --foto y no existe {img_rel}")

    ficha = {"k": a.clave, "name": a.nombre, "brand": a.marca, "fam": a.familia, "cat": a.cat,
             "encargue": bool(a.encargue), "img": img_rel, "desc": a.desc, "top": a.salida,
             "heart": a.corazon, "base": a.fondo, "il": a.etiqueta, "insp": a.inspirado}
    ficha = {k: ficha[k] for k in ORDEN}

    cab, lista = leer()
    claves = [p["k"] for p in lista]
    if a.clave in claves:
        lista[claves.index(a.clave)] = ficha
        print(f"Ficha '{a.clave}' actualizada.")
    elif a.despues:
        if a.despues not in claves:
            sys.exit(f"No existe la clave '{a.despues}'.")
        lista.insert(claves.index(a.despues) + 1, ficha)
        print(f"Ficha '{a.clave}' agregada después de '{a.despues}'.")
    else:
        lista.append(ficha)
        print(f"Ficha '{a.clave}' agregada al final.")
    escribir(cab, lista)
    print(f"Total de perfumes: {len(lista)}")


if __name__ == "__main__":
    main()
