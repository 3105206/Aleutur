// ============================================================
//  DECANTS Y COMBOS — Al Eutur Perfumes
//  k      : clave del perfume en datos/perfumes.js (toma de ahí
//           nombre, marca y foto). Si el decant no está en la
//           colección, poner name, brand e img acá.
//  precio : en pesos, sin puntos.
// ============================================================
window.DECANTS = [
  {
    "k": "toscano",
    "dupe": "Tuscan Leather · Tom Ford",
    "precio": "290"
  },
  {
    "k": "clubdenuit",
    "dupe": "Aventus · Creed",
    "precio": "290"
  },
  {
    "k": "momento",
    "dupe": "Arabians Tonka · Montale",
    "precio": "290"
  },
  {
    "k": "mega",
    "dupe": "Y EDP · YSL",
    "precio": "290"
  },
  {
    "k": "khamrah_waha",
    "dupe": "Lanzamiento 2026",
    "precio": "390"
  },
  {
    "k": "aquadubai",
    "dupe": "Imagination · Louis Vuitton",
    "precio": "390"
  },
  {
    "k": "invictus",
    "brand": "Paco Rabanne",
    "name": "Invictus Aqua",
    "dupe": "Diseñador original",
    "precio": "390",
    "img": "img/perfumes/invictus_aqua.webp"
  }
];

window.COMBOS = [
  {
    "nombre": "Intensos de Noche",
    "items": [
      "toscano",
      "clubdenuit",
      "momento"
    ],
    "labels": [
      "Toscano Leather",
      "Club de Nuit Intense Man",
      "Momento"
    ],
    "precio": "750",
    "ahorro": "Ahorrás $ 120",
    "destacado": false
  },
  {
    "nombre": "Selección Premium",
    "items": [
      "khamrah_waha",
      "aquadubai",
      "invictus"
    ],
    "labels": [
      "Khamrah Waha",
      "Amber Oud Aqua Dubai",
      "Invictus Aqua"
    ],
    "precio": "900",
    "ahorro": "Ahorrás $ 270",
    "destacado": false
  },
  {
    "nombre": "Elegí 3",
    "items": [],
    "labels": [],
    "precio": "820",
    "ahorro": "Vos armás el combo",
    "destacado": true
  }
];
