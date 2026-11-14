// Base de datos unificada de Rutas, Pueblos y Albergues del Camino de Santiago
const PUEBLOS_POR_ORDEN = {
  "camino-frances": [
    "saint-jean-pied-de-port",
    "roncesvalles",
    "zubiri",
    "pamplona",
    "puente la reina",
    "estella",
    "los arcos",
    "logroño",
    "nájera",
    "santo domingo de la calzada",
    "belorado",
    "san juan de ortega",
    "atapuerca",
    "burgos",
    "hornillos del camino",
    "castrojeriz",
    "frómista",
    "carrión de los condes",
    "sahagún",
    "león",
    "hospital de órbigo",
    "astorga",
    "rabanal del camino",
    "ponferrada",
    "villafranca del bierzo",
    "o cebreiro",
    "triacastela",
    "samos",
    "sarria",
    "portomarín",
    "palas de rei",
    "melide",
    "arzúa",
    "o pedrouzo",
    "santiago de compostela"
  ],
  "camino-portugues-interior": [
    "lisboa",
    "santarém",
    "golegã",
    "tomar",
    "alvaiázere",
    "ansião",
    "coimbra",
    "mealhada",
    "águeda",
    "albergaria-a-velha",
    "porto",
    "barcelos",
    "ponte de lima",
    "valença",
    "tui",
    "o porriño",
    "redondela",
    "pontevedra",
    "caldas de reis",
    "padrón",
    "santiago",
    "vila do conde",
    "póvoa de varzim",
    "esposende",
    "viana do castelo",
    "caminha",
    "vila nova de cerveira",
    "a guarda",
    "oia",
    "baiona",
    "vigo"
  ],
  "camino-portugues-costa": [
    "porto",
    "vila do conde",
    "póvoa de varzim",
    "esposende",
    "viana do castelo",
    "caminha",
    "vila nova de cerveira",
    "a guarda",
    "oia",
    "baiona",
    "vigo",
    "redondela",
    "pontevedra",
    "caldas de reis",
    "padrón",
    "santiago"
  ],
  "camino-ingles": [
    "ferrol",
    "neda",
    "fene",
    "cabanas",
    "pontedeume",
    "miño",
    "betanzos",
    "presedo",
    "hospital de bruma",
    "sigüeiro",
    "santiago de compostela",
    "a coruña",
    "sergude",
    "santiago"
  ],
  "camino-del-norte": [
    "irún",
    "hondarribia",
    "pasaia",
    "san sebastián",
    "zarautz",
    "deba",
    "markina-xemein",
    "gernika",
    "lezama",
    "bilbao",
    "portugalete",
    "castro urdiales",
    "laredo",
    "santoña",
    "santander",
    "santillana del mar",
    "comillas",
    "san vicente de la barquera",
    "llanes",
    "ribadesella",
    "colunga",
    "villaviciosa",
    "gijón",
    "avilés",
    "soto de luiña",
    "cadavedo",
    "luarca",
    "la caridad",
    "tapia de casariego",
    "ribadeo",
    "lourenzá",
    "mondoñedo",
    "abadín",
    "vilalba",
    "baamonde",
    "sobrado dos monxes",
    "arzúa",
    "santiago"
  ],
  "camino-primitivo": [
    "oviedo",
    "grado",
    "salas",
    "tineo",
    "pola de allande",
    "berducedo",
    "a fonsagrada",
    "o cádavo",
    "castroverde",
    "lugo",
    "san román da retorta",
    "melide",
    "arzúa",
    "o pedrouzo",
    "santiago",
    "grandas de salime"
  ],
  "camino-sanabres": [
    "sevilla",
    "zafra",
    "villafranca de los barros",
    "mérida",
    "cáceres",
    "casar de cáceres",
    "cañaveral",
    "plasencia",
    "béjar",
    "salamanca",
    "zamora",
    "puebla de sanabria",
    "a gudiña",
    "laza",
    "xunqueira de ambía",
    "ourense",
    "cea",
    "dozón",
    "lalín",
    "silleda",
    "santiago"
  ],
  "camino-invierno": [
    "león",
    "ponferrada",
    "ourense",
    "o barco de valdeorras",
    "a rúa",
    "quiroga",
    "monforte de lemos",
    "chantada",
    "pontevedra",
    "rodeiro",
    "lalín",
    "silleda",
    "a estrada",
    "vedra",
    "boqueixón",
    "villavieja",
    "las médulas",
    "puente de domingo flórez",
    "sobradelo",
    "vilamartín de valdeorras",
    "a pobra do brollón",
    "diomondi",
    "santiago"
  ],
  "camino-fisterra-muxia": [
    "santiago",
    "negreira",
    "a pena",
    "olveiroa",
    "o logoso",
    "xaviña",
    "hospital",
    "fisterra",
    "corcubión",
    "cee",
    "lires",
    "muxía"
  ]
};

const ALBERGUES_Y_HOTELES = {
  "camino-frances": [
    {
      "name": "Albergue Beilari (Saint-Jean-Pied-de-Port)",
      "town": "Saint-Jean-Pied-de-Port"
    },
    {
      "name": "Albergue Gîte Ultreia (Saint-Jean-Pied-de-Port)",
      "town": "Saint-Jean-Pied-de-Port"
    },
    {
      "name": "Albergue Le Chemin vers l'Étoile (Saint-Jean-Pied-de-Port)",
      "town": "Saint-Jean-Pied-de-Port"
    },
    {
      "name": "Albergue Borda (Saint-Jean-Pied-de-Port)",
      "town": "Saint-Jean-Pied-de-Port"
    },
    {
      "name": "Albergue Gîte Compostella (Saint-Jean-Pied-de-Port)",
      "town": "Saint-Jean-Pied-de-Port"
    },
    {
      "name": "Albergue de Peregrinos de Roncesvalles (Roncesvalles)",
      "town": "Roncesvalles"
    },
    {
      "name": "Albergue Casa Sabina (Roncesvalles)",
      "town": "Roncesvalles"
    },
    {
      "name": "Albergue La Posada (Roncesvalles)",
      "town": "Roncesvalles"
    },
    {
      "name": "Albergue Jakue (Roncesvalles)",
      "town": "Roncesvalles"
    },
    {
      "name": "Albergue Zaldiko (Zubiri)",
      "town": "Zubiri"
    },
    {
      "name": "Albergue Suseia (Zubiri)",
      "town": "Zubiri"
    },
    {
      "name": "Albergue Zubiri (Zubiri)",
      "town": "Zubiri"
    },
    {
      "name": "Albergue El Palo de Avellano (Zubiri)",
      "town": "Zubiri"
    },
    {
      "name": "Albergue Jesús y María (Pamplona)",
      "town": "Pamplona"
    },
    {
      "name": "Albergue de Peregrinos Casa Ibarrola (Pamplona)",
      "town": "Pamplona"
    },
    {
      "name": "Albergue Plaza Catedral (Pamplona)",
      "town": "Pamplona"
    },
    {
      "name": "Albergue Xarma (Pamplona)",
      "town": "Pamplona"
    },
    {
      "name": "Albergue Paderborn (Pamplona)",
      "town": "Pamplona"
    },
    {
      "name": "Albergue de los Padres Reparadores (Puente la Reina)",
      "town": "Puente la Reina"
    },
    {
      "name": "Albergue Santiago Apostol (Puente la Reina)",
      "town": "Puente la Reina"
    },
    {
      "name": "Albergue Jakue (Puente la Reina)",
      "town": "Puente la Reina"
    },
    {
      "name": "Albergue Puente (Puente la Reina)",
      "town": "Puente la Reina"
    },
    {
      "name": "Albergue Estrella Guia (Puente la Reina)",
      "town": "Puente la Reina"
    },
    {
      "name": "Albergue de Peregrinos de Estella (Estella)",
      "town": "Estella"
    },
    {
      "name": "Albergue San Cipriano (Estella)",
      "town": "Estella"
    },
    {
      "name": "Albergue Hospitalero (Estella)",
      "town": "Estella"
    },
    {
      "name": "Albergue Oncineda (Estella)",
      "town": "Estella"
    },
    {
      "name": "Albergue Hilako (Estella)",
      "town": "Estella"
    },
    {
      "name": "Albergue Isaac Santiago (Los Arcos)",
      "town": "Los Arcos"
    },
    {
      "name": "Albergue de Peregrinos de Los Arcos (Los Arcos)",
      "town": "Los Arcos"
    },
    {
      "name": "Albergue Casa Alberdi (Los Arcos)",
      "town": "Los Arcos"
    },
    {
      "name": "Albergue La Fuente (Los Arcos)",
      "town": "Los Arcos"
    },
    {
      "name": "Albergue de Peregrinos de Logroño (Logroño)",
      "town": "Logroño"
    },
    {
      "name": "Albergue Check In Rioja (Logroño)",
      "town": "Logroño"
    },
    {
      "name": "Albergue Santiago (Logroño)",
      "town": "Logroño"
    },
    {
      "name": "Albergue San Saturnino (Logroño)",
      "town": "Logroño"
    },
    {
      "name": "Albergue Albas (Logroño)",
      "town": "Logroño"
    },
    {
      "name": "Albergue de Peregrinos de Nájera (Nájera)",
      "town": "Nájera"
    },
    {
      "name": "Albergue Sancho III (Nájera)",
      "town": "Nájera"
    },
    {
      "name": "Albergue El Peregrino (Nájera)",
      "town": "Nájera"
    },
    {
      "name": "Albergue Nájera (Nájera)",
      "town": "Nájera"
    },
    {
      "name": "Albergue de la Cofradía del Santo (Santo Domingo de la Calzada)",
      "town": "Santo Domingo de la Calzada"
    },
    {
      "name": "Albergue San Francisco (Santo Domingo de la Calzada)",
      "town": "Santo Domingo de la Calzada"
    },
    {
      "name": "Albergue Casa del Santo (Santo Domingo de la Calzada)",
      "town": "Santo Domingo de la Calzada"
    },
    {
      "name": "Albergue Cuatro Cantones (Belorado)",
      "town": "Belorado"
    },
    {
      "name": "Albergue A Santiago (Belorado)",
      "town": "Belorado"
    },
    {
      "name": "Albergue El Corro (Belorado)",
      "town": "Belorado"
    },
    {
      "name": "Albergue Caminante (Belorado)",
      "town": "Belorado"
    },
    {
      "name": "Albergue de San Juan de Ortega (San Juan de Ortega)",
      "town": "San Juan de Ortega"
    },
    {
      "name": "Albergue El Peregrino (Atapuerca)",
      "town": "Atapuerca"
    },
    {
      "name": "Albergue San Rafael (Atapuerca)",
      "town": "Atapuerca"
    },
    {
      "name": "Albergue La Hutte (Atapuerca)",
      "town": "Atapuerca"
    },
    {
      "name": "Albergue Municipal de Peregrinos (Burgos)",
      "town": "Burgos"
    },
    {
      "name": "Albergue Casa de la Calera (Burgos)",
      "town": "Burgos"
    },
    {
      "name": "Albergue La Catedral (Burgos)",
      "town": "Burgos"
    },
    {
      "name": "Albergue Happy Hostal Carrales (Burgos)",
      "town": "Burgos"
    },
    {
      "name": "Albergue de Hornillos (Hornillos del Camino)",
      "town": "Hornillos del Camino"
    },
    {
      "name": "Albergue El Alfar (Hornillos del Camino)",
      "town": "Hornillos del Camino"
    },
    {
      "name": "Albergue Sol a Sol (Hornillos del Camino)",
      "town": "Hornillos del Camino"
    },
    {
      "name": "Albergue de San Esteban (Castrojeriz)",
      "town": "Castrojeriz"
    },
    {
      "name": "Albergue Ultreia (Castrojeriz)",
      "town": "Castrojeriz"
    },
    {
      "name": "Albergue Rosalia (Castrojeriz)",
      "town": "Castrojeriz"
    },
    {
      "name": "Albergue Orion (Castrojeriz)",
      "town": "Castrojeriz"
    },
    {
      "name": "Albergue de Peregrinos de Frómista (Frómista)",
      "town": "Frómista"
    },
    {
      "name": "Albergue Estrella del Camino (Frómista)",
      "town": "Frómista"
    },
    {
      "name": "Albergue San Martín (Frómista)",
      "town": "Frómista"
    },
    {
      "name": "Albergue Luz de Frómista (Frómista)",
      "town": "Frómista"
    },
    {
      "name": "Albergue de Santa María (Carrión de los Condes)",
      "town": "Carrión de los Condes"
    },
    {
      "name": "Albergue Espíritu Santo (Carrión de los Condes)",
      "town": "Carrión de los Condes"
    },
    {
      "name": "Albergue Don Camino (Carrión de los Condes)",
      "town": "Carrión de los Condes"
    },
    {
      "name": "Albergue Casa Tia Paula (Carrión de los Condes)",
      "town": "Carrión de los Condes"
    },
    {
      "name": "Albergue Cluny (Sahagún)",
      "town": "Sahagún"
    },
    {
      "name": "Albergue Viatoris (Sahagún)",
      "town": "Sahagún"
    },
    {
      "name": "Albergue Domus Viatoris (Sahagún)",
      "town": "Sahagún"
    },
    {
      "name": "Albergue de Peregrinos de Sahagún (Sahagún)",
      "town": "Sahagún"
    },
    {
      "name": "Albergue de Peregrinos de León (León)",
      "town": "León"
    },
    {
      "name": "Albergue Santa María de Carbajal (León)",
      "town": "León"
    },
    {
      "name": "Albergue San Francisco de Asís (León)",
      "town": "León"
    },
    {
      "name": "Albergue Check In León (León)",
      "town": "León"
    },
    {
      "name": "Albergue Unamuno (León)",
      "town": "León"
    },
    {
      "name": "Albergue Muralla Leonesa (León)",
      "town": "León"
    },
    {
      "name": "Albergue San Miguel (Hospital de Órbigo)",
      "town": "Hospital de Órbigo"
    },
    {
      "name": "Albergue Casa de los Hidalgos (Hospital de Órbigo)",
      "town": "Hospital de Órbigo"
    },
    {
      "name": "Albergue Villares (Hospital de Órbigo)",
      "town": "Hospital de Órbigo"
    },
    {
      "name": "Albergue La Encina (Hospital de Órbigo)",
      "town": "Hospital de Órbigo"
    },
    {
      "name": "Albergue de Peregrinos Siervas de María (Astorga)",
      "town": "Astorga"
    },
    {
      "name": "Albergue San Javier (Astorga)",
      "town": "Astorga"
    },
    {
      "name": "Albergue Só Por Hoje (Astorga)",
      "town": "Astorga"
    },
    {
      "name": "Albergue My Way (Astorga)",
      "town": "Astorga"
    },
    {
      "name": "Albergue La Peseta (Astorga)",
      "town": "Astorga"
    },
    {
      "name": "Albergue Nuestra Señora del Pilar (Rabanal del Camino)",
      "town": "Rabanal del Camino"
    },
    {
      "name": "Albergue Gaucelmo (Rabanal del Camino)",
      "town": "Rabanal del Camino"
    },
    {
      "name": "Albergue El Pilar (Rabanal del Camino)",
      "town": "Rabanal del Camino"
    },
    {
      "name": "Albergue La Candela (Rabanal del Camino)",
      "town": "Rabanal del Camino"
    },
    {
      "name": "Albergue San Nicolás de Flüe (Ponferrada)",
      "town": "Ponferrada"
    },
    {
      "name": "Albergue Guiana (Ponferrada)",
      "town": "Ponferrada"
    },
    {
      "name": "Albergue de Peregrinos de Ponferrada (Ponferrada)",
      "town": "Ponferrada"
    },
    {
      "name": "Albergue Alda Centro Ponferrada (Ponferrada)",
      "town": "Ponferrada"
    },
    {
      "name": "Albergue de la Piedra (Villafranca del Bierzo)",
      "town": "Villafranca del Bierzo"
    },
    {
      "name": "Albergue La Piedra (Villafranca del Bierzo)",
      "town": "Villafranca del Bierzo"
    },
    {
      "name": "Albergue Ave Fénix (Villafranca del Bierzo)",
      "town": "Villafranca del Bierzo"
    },
    {
      "name": "Albergue Leo (Villafranca del Bierzo)",
      "town": "Villafranca del Bierzo"
    },
    {
      "name": "Albergue Camino y Leyenda (Villafranca del Bierzo)",
      "town": "Villafranca del Bierzo"
    },
    {
      "name": "Albergue de Peregrinos de O Cebreiro (O Cebreiro)",
      "town": "O Cebreiro"
    },
    {
      "name": "Albergue La Faba (O Cebreiro)",
      "town": "O Cebreiro"
    },
    {
      "name": "Albergue Casa García (O Cebreiro)",
      "town": "O Cebreiro"
    },
    {
      "name": "Albergue de Peregrinos de Triacastela (Triacastela)",
      "town": "Triacastela"
    },
    {
      "name": "Albergue Berce do Camiño (Triacastela)",
      "town": "Triacastela"
    },
    {
      "name": "Albergue Aitzenea (Triacastela)",
      "town": "Triacastela"
    },
    {
      "name": "Albergue Complexo Xacobeo (Triacastela)",
      "town": "Triacastela"
    },
    {
      "name": "Albergue del Monasterio de Samos (Samos)",
      "town": "Samos"
    },
    {
      "name": "Albergue Val de Samos (Samos)",
      "town": "Samos"
    },
    {
      "name": "Albergue A Casa de Naúfragos (Samos)",
      "town": "Samos"
    },
    {
      "name": "Albergue de Peregrinos de Sarria (Sarria)",
      "town": "Sarria"
    },
    {
      "name": "Albergue Monasterio de la Magdalena (Sarria)",
      "town": "Sarria"
    },
    {
      "name": "Albergue Don Álvaro (Sarria)",
      "town": "Sarria"
    },
    {
      "name": "Albergue O Durmiñento (Sarria)",
      "town": "Sarria"
    },
    {
      "name": "Albergue Los Blasones (Sarria)",
      "town": "Sarria"
    },
    {
      "name": "Albergue San Lázaro (Sarria)",
      "town": "Sarria"
    },
    {
      "name": "Albergue Casa Peltre (Sarria)",
      "town": "Sarria"
    },
    {
      "name": "Albergue Mayor (Sarria)",
      "town": "Sarria"
    },
    {
      "name": "Albergue Oasis (Sarria)",
      "town": "Sarria"
    },
    {
      "name": "Albergue Alma do Camiño (Sarria)",
      "town": "Sarria"
    },
    {
      "name": "Albergue de Peregrinos de Portomarín (Portomarín)",
      "town": "Portomarín"
    },
    {
      "name": "Albergue Ferramenteiro (Portomarín)",
      "town": "Portomarín"
    },
    {
      "name": "Albergue El Caminante (Portomarín)",
      "town": "Portomarín"
    },
    {
      "name": "Albergue PortoSantiago (Portomarín)",
      "town": "Portomarín"
    },
    {
      "name": "Albergue Ultreia (Portomarín)",
      "town": "Portomarín"
    },
    {
      "name": "Albergue Novo Porto (Portomarín)",
      "town": "Portomarín"
    },
    {
      "name": "Albergue Aqua (Portomarín)",
      "town": "Portomarín"
    },
    {
      "name": "Albergue Pons Minea (Portomarín)",
      "town": "Portomarín"
    },
    {
      "name": "Albergue de Peregrinos de Palas de Rei (Palas de Rei)",
      "town": "Palas de Rei"
    },
    {
      "name": "Albergue Os Chacotes (Palas de Rei)",
      "town": "Palas de Rei"
    },
    {
      "name": "Albergue San Marcos (Palas de Rei)",
      "town": "Palas de Rei"
    },
    {
      "name": "Albergue Outeiro (Palas de Rei)",
      "town": "Palas de Rei"
    },
    {
      "name": "Albergue Buen Camino (Palas de Rei)",
      "town": "Palas de Rei"
    },
    {
      "name": "Albergue A Casiña di Marcello (Palas de Rei)",
      "town": "Palas de Rei"
    },
    {
      "name": "Albergue de Peregrinos de Melide (Melide)",
      "town": "Melide"
    },
    {
      "name": "Albergue O Cruceiro (Melide)",
      "town": "Melide"
    },
    {
      "name": "Albergue O Apalpador (Melide)",
      "town": "Melide"
    },
    {
      "name": "Albergue Pereiro (Melide)",
      "town": "Melide"
    },
    {
      "name": "Albergue San Antón (Melide)",
      "town": "Melide"
    },
    {
      "name": "Albergue Raido (Melide)",
      "town": "Melide"
    },
    {
      "name": "Albergue A Lúa do Camiño (Melide)",
      "town": "Melide"
    },
    {
      "name": "Albergue Teodora (Melide)",
      "town": "Melide"
    },
    {
      "name": "Albergue Xabarín (Melide)",
      "town": "Melide"
    },
    {
      "name": "Albergue de Peregrinos de Arzúa (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Albergue de Ribadiso (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Albergue Ultreia (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Albergue Santiago Apóstol (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Albergue Vía Láctea (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Albergue Los Caminantes (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Albergue Don Quijote (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Albergue A Conda (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Albergue de Peregrinos de O Pedrouzo (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Albergue de Santa Irene (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Albergue Porta de Santiago (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Albergue Mirador de Pedrouzo (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Albergue Edreira (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Albergue Cruceiro (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Albergue Buleiro (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Albergue Rem (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Albergue Seminario Menor (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue de Peregrinos San Lázaro (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue Monte do Gozo (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue The Last Stamp (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue Roots & Boots (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue Santo Santiago (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue Azabache (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue Sixtos No Caminho (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue Linares (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue Porta Real (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue SCQ (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue La Salle (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    }
  ],
  "camino-portugues-interior": [
    {
      "name": "Albergue de Peregrinos de Lisboa (Lisboa)",
      "town": "Lisboa"
    },
    {
      "name": "Lisbon Destination Hostel (Lisboa)",
      "town": "Lisboa"
    },
    {
      "name": "This Is Lisbon Hostel (Lisboa)",
      "town": "Lisboa"
    },
    {
      "name": "Albergue de Peregrinos de Santarém (Santarém)",
      "town": "Santarém"
    },
    {
      "name": "Hostel Santarém (Santarém)",
      "town": "Santarém"
    },
    {
      "name": "N1 Hostel Apartments (Santarém)",
      "town": "Santarém"
    },
    {
      "name": "Albergue de Peregrinos de Golegã (Golegã)",
      "town": "Golegã"
    },
    {
      "name": "Quinta dos Álamos (Golegã)",
      "town": "Golegã"
    },
    {
      "name": "Albergue de Peregrinos de Tomar (Tomar)",
      "town": "Tomar"
    },
    {
      "name": "Hostel 2300 Thomar (Tomar)",
      "town": "Tomar"
    },
    {
      "name": "Ninho do Falcão (Tomar)",
      "town": "Tomar"
    },
    {
      "name": "Albergue de Peregrinos de Alvaiázere (Alvaiázere)",
      "town": "Alvaiázere"
    },
    {
      "name": "Albergue O Caminheiro (Alvaiázere)",
      "town": "Alvaiázere"
    },
    {
      "name": "Albergue de Peregrinos de Ansião (Ansião)",
      "town": "Ansião"
    },
    {
      "name": "Ansiturismo (Ansião)",
      "town": "Ansião"
    },
    {
      "name": "Albergue de Peregrinos de Coimbra (Coimbra)",
      "town": "Coimbra"
    },
    {
      "name": "Coimbra Portagem Hostel (Coimbra)",
      "town": "Coimbra"
    },
    {
      "name": "Serenata Hostel (Coimbra)",
      "town": "Coimbra"
    },
    {
      "name": "Be Coimbra Hostel (Coimbra)",
      "town": "Coimbra"
    },
    {
      "name": "Albergue de Peregrinos de Mealhada (Mealhada)",
      "town": "Mealhada"
    },
    {
      "name": "Hostel Mealhada (Mealhada)",
      "town": "Mealhada"
    },
    {
      "name": "Residencial Imperial (Mealhada)",
      "town": "Mealhada"
    },
    {
      "name": "Albergue de Peregrinos de Águeda (Águeda)",
      "town": "Águeda"
    },
    {
      "name": "Águeda Hostel (Águeda)",
      "town": "Águeda"
    },
    {
      "name": "Albergue de Peregrinos de Albergaria-a-Velha (Albergaria-a-Velha)",
      "town": "Albergaria-a-Velha"
    },
    {
      "name": "Albergue Rainha D. Teresa (Albergaria-a-Velha)",
      "town": "Albergaria-a-Velha"
    },
    {
      "name": "Albergue de Peregrinos do Porto (Porto)",
      "town": "Porto"
    },
    {
      "name": "The Passenger Hostel (Porto)",
      "town": "Porto"
    },
    {
      "name": "Cats Hostel Porto (Porto)",
      "town": "Porto"
    },
    {
      "name": "Best Guest Porto Hostel (Porto)",
      "town": "Porto"
    },
    {
      "name": "Pilgrim's Hostel (Porto)",
      "town": "Porto"
    },
    {
      "name": "Albergue de Peregrinos de Barcelos (Barcelos)",
      "town": "Barcelos"
    },
    {
      "name": "Albergue Cidade de Barcelos (Barcelos)",
      "town": "Barcelos"
    },
    {
      "name": "Way Guest House (Barcelos)",
      "town": "Barcelos"
    },
    {
      "name": "Hostel Casa do Rio (Barcelos)",
      "town": "Barcelos"
    },
    {
      "name": "Albergue de Peregrinos de Ponte de Lima (Ponte de Lima)",
      "town": "Ponte de Lima"
    },
    {
      "name": "Albergue de Peregrinos da Igreja (Ponte de Lima)",
      "town": "Ponte de Lima"
    },
    {
      "name": "Casa Fernanda (Ponte de Lima)",
      "town": "Ponte de Lima"
    },
    {
      "name": "Quinta das Leiras (Ponte de Lima)",
      "town": "Ponte de Lima"
    },
    {
      "name": "Albergue de Peregrinos de Valença (Valença)",
      "town": "Valença"
    },
    {
      "name": "Albergue das Adelas (Valença)",
      "town": "Valença"
    },
    {
      "name": "Hostel Valença (Valença)",
      "town": "Valença"
    },
    {
      "name": "Albergue S. Teotónio (Valença)",
      "town": "Valença"
    },
    {
      "name": "Albergue de Peregrinos de Tui (Tui)",
      "town": "Tui"
    },
    {
      "name": "Ideas Peregrinas (Tui)",
      "town": "Tui"
    },
    {
      "name": "Villa San Clemente (Tui)",
      "town": "Tui"
    },
    {
      "name": "Pallanes (Tui)",
      "town": "Tui"
    },
    {
      "name": "Buen Camino (Tui)",
      "town": "Tui"
    },
    {
      "name": "Albergue de Peregrinos de O Porriño (O Porriño)",
      "town": "O Porriño"
    },
    {
      "name": "Senda Sur (O Porriño)",
      "town": "O Porriño"
    },
    {
      "name": "Camino Santiago Porriño (O Porriño)",
      "town": "O Porriño"
    },
    {
      "name": "Rincón del Peregrino (O Porriño)",
      "town": "O Porriño"
    },
    {
      "name": "Casucho da Peregrina (O Porriño)",
      "town": "O Porriño"
    },
    {
      "name": "Fonte dos Aloques (O Porriño)",
      "town": "O Porriño"
    },
    {
      "name": "Casa da Torre (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "Albergue Parroquial Santiago Apóstol (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "A Casa da Herba (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "Alfonso XII (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "A Conserveira (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "A Rotonda (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "Albergue de Peregrinos Virgen Peregrina (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Aloxa Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Slow City Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Acolá Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Nacama Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "dpaso Urban Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "GBC Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Hostel Charino (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Albergue de Peregrinos de Caldas (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "O Cruceiro (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Timonel (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Agarimo (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "A Queimada (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "As Pozas Termais (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Urraca (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Albor (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "GBC Hostel (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Albergue de Peregrinos de Padrón (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "A Barca (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "Cruces de Iria (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "Rossol (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "Corredoiras (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "Albergue Seminario Menor (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Albergue San Lázaro (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Albergue Monte do Gozo (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "The Last Stamp (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Roots & Boots (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Santo Santiago (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Azabache (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Sixtos No Caminho (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Linares (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Porta Real (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "SCQ (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "La Salle (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Albergue de Peregrinos de Vila do Conde (Vila do Conde)",
      "town": "Vila do Conde"
    },
    {
      "name": "HI Vila do Conde (Vila do Conde)",
      "town": "Vila do Conde"
    },
    {
      "name": "Bellamar Hostel (Vila do Conde)",
      "town": "Vila do Conde"
    },
    {
      "name": "Albergue de Peregrinos de Póvoa de Varzim (Póvoa de Varzim)",
      "town": "Póvoa de Varzim"
    },
    {
      "name": "Póvoa de Varzim Guest House (Póvoa de Varzim)",
      "town": "Póvoa de Varzim"
    },
    {
      "name": "Big House (Póvoa de Varzim)",
      "town": "Póvoa de Varzim"
    },
    {
      "name": "Albergue de Peregrinos de Esposende (Esposende)",
      "town": "Esposende"
    },
    {
      "name": "Hostel do Rio (Esposende)",
      "town": "Esposende"
    },
    {
      "name": "Hi Esposende (Esposende)",
      "town": "Esposende"
    },
    {
      "name": "Albergue de Peregrinos de Viana (Viana do Castelo)",
      "town": "Viana do Castelo"
    },
    {
      "name": "HI Viana do Castelo (Viana do Castelo)",
      "town": "Viana do Castelo"
    },
    {
      "name": "Hostel Maçã de Eva (Viana do Castelo)",
      "town": "Viana do Castelo"
    },
    {
      "name": "Albergue de Peregrinos de Caminha (Caminha)",
      "town": "Caminha"
    },
    {
      "name": "Arca Nova Guest House (Caminha)",
      "town": "Caminha"
    },
    {
      "name": "Bom Caminha (Caminha)",
      "town": "Caminha"
    },
    {
      "name": "Albergue de Peregrinos de Vila Nova de Cerveira (Vila Nova de Cerveira)",
      "town": "Vila Nova de Cerveira"
    },
    {
      "name": "Albergue de Peregrinos de A Guarda (A Guarda)",
      "town": "A Guarda"
    },
    {
      "name": "O Peirao (A Guarda)",
      "town": "A Guarda"
    },
    {
      "name": "A Gaviota (A Guarda)",
      "town": "A Guarda"
    },
    {
      "name": "O Cruceiro (A Guarda)",
      "town": "A Guarda"
    },
    {
      "name": "A Cabeciña (Oia)",
      "town": "Oia"
    },
    {
      "name": "Aguncheiro (Oia)",
      "town": "Oia"
    },
    {
      "name": "O Acivro (Oia)",
      "town": "Oia"
    },
    {
      "name": "Albergue de Peregrinos de Baiona (Baiona)",
      "town": "Baiona"
    },
    {
      "name": "Santa Marta (Baiona)",
      "town": "Baiona"
    },
    {
      "name": "Estela do Mar (Baiona)",
      "town": "Baiona"
    },
    {
      "name": "Albergue de Peregrinos de Vigo (Vigo)",
      "town": "Vigo"
    },
    {
      "name": "Albergue Estación (Vigo)",
      "town": "Vigo"
    },
    {
      "name": "The Last Stamp (Vigo)",
      "town": "Vigo"
    },
    {
      "name": "Vigosmile (Vigo)",
      "town": "Vigo"
    },
    {
      "name": "Santiago Apóstol (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "Albergue Virgen Peregrina (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Aloxa (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Acolá (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Nacama (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Slow City (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "dpaso (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "GBC (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Charino (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Albergue de Peregrinos (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Albergue de Peregrinos (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "Seminario Menor (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "San Lázaro (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Monte do Gozo (Santiago)",
      "town": "Santiago"
    }
  ],
  "camino-portugues-costa": [
    {
      "name": "Albergue de Peregrinos do Porto (Porto)",
      "town": "Porto"
    },
    {
      "name": "The Passenger Hostel (Porto)",
      "town": "Porto"
    },
    {
      "name": "Cats Hostel Porto (Porto)",
      "town": "Porto"
    },
    {
      "name": "Best Guest Porto Hostel (Porto)",
      "town": "Porto"
    },
    {
      "name": "Pilgrim's Hostel (Porto)",
      "town": "Porto"
    },
    {
      "name": "Casa da Torre (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "Albergue Parroquial Santiago Apóstol (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "A Casa da Herba (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "Alfonso XII (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "A Conserveira (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "A Rotonda (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "Albergue de Peregrinos Virgen Peregrina (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Aloxa Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Slow City Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Acolá Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Nacama Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "dpaso Urban Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "GBC Hostel (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Hostel Charino (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Albergue de Peregrinos de Caldas (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "O Cruceiro (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Timonel (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Agarimo (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "A Queimada (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "As Pozas Termais (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Urraca (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Albor (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "GBC Hostel (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Albergue de Peregrinos de Padrón (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "A Barca (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "Cruces de Iria (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "Rossol (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "Corredoiras (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "Albergue Seminario Menor (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Albergue San Lázaro (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Albergue Monte do Gozo (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "The Last Stamp (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Roots & Boots (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Santo Santiago (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Azabache (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Sixtos No Caminho (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Linares (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Porta Real (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "SCQ (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "La Salle (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Albergue de Peregrinos de Vila do Conde (Vila do Conde)",
      "town": "Vila do Conde"
    },
    {
      "name": "HI Vila do Conde (Vila do Conde)",
      "town": "Vila do Conde"
    },
    {
      "name": "Bellamar Hostel (Vila do Conde)",
      "town": "Vila do Conde"
    },
    {
      "name": "Albergue de Peregrinos de Póvoa de Varzim (Póvoa de Varzim)",
      "town": "Póvoa de Varzim"
    },
    {
      "name": "Póvoa de Varzim Guest House (Póvoa de Varzim)",
      "town": "Póvoa de Varzim"
    },
    {
      "name": "Big House (Póvoa de Varzim)",
      "town": "Póvoa de Varzim"
    },
    {
      "name": "Albergue de Peregrinos de Esposende (Esposende)",
      "town": "Esposende"
    },
    {
      "name": "Hostel do Rio (Esposende)",
      "town": "Esposende"
    },
    {
      "name": "Hi Esposende (Esposende)",
      "town": "Esposende"
    },
    {
      "name": "Albergue de Peregrinos de Viana (Viana do Castelo)",
      "town": "Viana do Castelo"
    },
    {
      "name": "HI Viana do Castelo (Viana do Castelo)",
      "town": "Viana do Castelo"
    },
    {
      "name": "Hostel Maçã de Eva (Viana do Castelo)",
      "town": "Viana do Castelo"
    },
    {
      "name": "Albergue de Peregrinos de Caminha (Caminha)",
      "town": "Caminha"
    },
    {
      "name": "Arca Nova Guest House (Caminha)",
      "town": "Caminha"
    },
    {
      "name": "Bom Caminha (Caminha)",
      "town": "Caminha"
    },
    {
      "name": "Albergue de Peregrinos de Vila Nova de Cerveira (Vila Nova de Cerveira)",
      "town": "Vila Nova de Cerveira"
    },
    {
      "name": "Albergue de Peregrinos de A Guarda (A Guarda)",
      "town": "A Guarda"
    },
    {
      "name": "O Peirao (A Guarda)",
      "town": "A Guarda"
    },
    {
      "name": "A Gaviota (A Guarda)",
      "town": "A Guarda"
    },
    {
      "name": "O Cruceiro (A Guarda)",
      "town": "A Guarda"
    },
    {
      "name": "A Cabeciña (Oia)",
      "town": "Oia"
    },
    {
      "name": "Aguncheiro (Oia)",
      "town": "Oia"
    },
    {
      "name": "O Acivro (Oia)",
      "town": "Oia"
    },
    {
      "name": "Albergue de Peregrinos de Baiona (Baiona)",
      "town": "Baiona"
    },
    {
      "name": "Santa Marta (Baiona)",
      "town": "Baiona"
    },
    {
      "name": "Estela do Mar (Baiona)",
      "town": "Baiona"
    },
    {
      "name": "Albergue de Peregrinos de Vigo (Vigo)",
      "town": "Vigo"
    },
    {
      "name": "Albergue Estación (Vigo)",
      "town": "Vigo"
    },
    {
      "name": "The Last Stamp (Vigo)",
      "town": "Vigo"
    },
    {
      "name": "Vigosmile (Vigo)",
      "town": "Vigo"
    },
    {
      "name": "Santiago Apóstol (Redondela)",
      "town": "Redondela"
    },
    {
      "name": "Albergue Virgen Peregrina (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Aloxa (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Acolá (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Nacama (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Slow City (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "dpaso (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "GBC (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Charino (Pontevedra)",
      "town": "Pontevedra"
    },
    {
      "name": "Albergue de Peregrinos (Caldas de Reis)",
      "town": "Caldas de Reis"
    },
    {
      "name": "Albergue de Peregrinos (Padrón)",
      "town": "Padrón"
    },
    {
      "name": "Seminario Menor (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "San Lázaro (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Monte do Gozo (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Albergue de Peregrinos de A Guarda (Municipal)",
      "town": "A Guarda"
    },
    {
      "name": "Albergue O Peirao (A Guarda)",
      "town": "A Guarda"
    },
    {
      "name": "Albergue de Peregrinos de Vigo Juan Manuel López-Chaves (Xunta)",
      "town": "Vigo"
    },
    {
      "name": "R4Hostel Vigo (Vigo)",
      "town": "Vigo"
    },
    {
      "name": "Albergue de Peregrinos Casa da Torre (Redondela - Xunta)",
      "town": "Redondela"
    }
  ],
  "camino-ingles": [
    {
      "name": "Albergue de Ferrol / Hotel Almirante (Ferrol)",
      "town": "Ferrol"
    },
    {
      "name": "Albergue de Peregrinos de Neda (Neda)",
      "town": "Neda"
    },
    {
      "name": "Albergue de Peregrinos de Pontedeume (Pontedeume)",
      "town": "Pontedeume"
    },
    {
      "name": "Albergue Río Eume (Pontedeume)",
      "town": "Pontedeume"
    },
    {
      "name": "Albergue de Peregrinos de Miño (Miño)",
      "town": "Miño"
    },
    {
      "name": "Albergue Casa da Pescadería (Betanzos)",
      "town": "Betanzos"
    },
    {
      "name": "Albergue San Martín (Betanzos)",
      "town": "Betanzos"
    },
    {
      "name": "Albergue de Presedo (Presedo)",
      "town": "Presedo"
    },
    {
      "name": "Albergue de Peregrinos de Bruma (Hospital de Bruma)",
      "town": "Hospital de Bruma"
    },
    {
      "name": "Albergue Camino Inglés (Sigüeiro)",
      "town": "Sigüeiro"
    },
    {
      "name": "Albergue Mirás (Sigüeiro)",
      "town": "Sigüeiro"
    },
    {
      "name": "Seminario Menor / Albergue Monte do Gozo (Santiago de Compostela)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue de Peregrinos de Ferrol (Ferrol)",
      "town": "Ferrol"
    },
    {
      "name": "Albergue de Peregrinos de A Coruña (A Coruña)",
      "town": "A Coruña"
    },
    {
      "name": "Albergue de Peregrinos de Sergude (Sergude)",
      "town": "Sergude"
    },
    {
      "name": "Albergue de Peregrinos de Betanzos (Betanzos)",
      "town": "Betanzos"
    },
    {
      "name": "Albergue de Peregrinos de Presedo (Presedo)",
      "town": "Presedo"
    },
    {
      "name": "Albergue de Peregrinos de Hospital de Bruma (Hospital de Bruma)",
      "town": "Hospital de Bruma"
    },
    {
      "name": "Albergue de Peregrinos de Sigüeiro (Sigüeiro)",
      "town": "Sigüeiro"
    },
    {
      "name": "Albergue de Peregrinos de Santiago de Compostela (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Albergue de Peregrinos de Ferrol (Xunta - Curuxeiras)",
      "town": "Ferrol"
    },
    {
      "name": "Hotel Almirante (Ferrol)",
      "town": "Ferrol"
    },
    {
      "name": "Hotel Silva (Ferrol)",
      "town": "Ferrol"
    },
    {
      "name": "Albergue de Peregrinos de Neda (Xunta)",
      "town": "Neda"
    },
    {
      "name": "Pensión Maragoto (Neda)",
      "town": "Neda"
    },
    {
      "name": "Albergue de Peregrinos de Fene (Municipal)",
      "town": "Fene"
    },
    {
      "name": "Albergue O Pinar de Cabanas (Cabanas)",
      "town": "Cabanas"
    },
    {
      "name": "Albergue de Peregrinos de Pontedeume (Municipal)",
      "town": "Pontedeume"
    },
    {
      "name": "Albergue Alecrín (Pontedeume)",
      "town": "Pontedeume"
    },
    {
      "name": "Hotel Eumesa (Pontedeume)",
      "town": "Pontedeume"
    },
    {
      "name": "Albergue de Peregrinos de Miño (Municipal)",
      "town": "Miño"
    },
    {
      "name": "Albergue de Peregrinos de Betanzos (Xunta - Santa María)",
      "town": "Betanzos"
    },
    {
      "name": "Albergue Río Mondeo (Betanzos)",
      "town": "Betanzos"
    },
    {
      "name": "Hotel Garelos (Betanzos)",
      "town": "Betanzos"
    },
    {
      "name": "Albergue de Peregrinos de Presedo (Xunta)",
      "town": "Presedo"
    },
    {
      "name": "Albergue de Peregrinos de A Coruña (Municipal)",
      "town": "A Coruña"
    },
    {
      "name": "Albergue de Peregrinos de Sergude (Xunta)",
      "town": "Sergude"
    },
    {
      "name": "Albergue de Peregrinos de Hospital de Bruma (Xunta)",
      "town": "Hospital de Bruma"
    },
    {
      "name": "Albergue Rectoral de Outeiro (Hospital de Bruma)",
      "town": "Hospital de Bruma"
    },
    {
      "name": "Albergue O Mesón (Poulo - Ordes)",
      "town": "Hospital de Bruma"
    },
    {
      "name": "Albergue de Peregrinos de Poulo (Xunta)",
      "town": "Hospital de Bruma"
    },
    {
      "name": "Albergue Camiño Real (Sigüeiro)",
      "town": "Sigüeiro"
    },
    {
      "name": "Albergue Delia (Sigüeiro)",
      "town": "Sigüeiro"
    },
    {
      "name": "Albergue San Lázaro / Monte do Gozo (Santiago)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue Fin del Camino (Santiago)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue Roots & Boots (Santiago)",
      "town": "Santiago de Compostela"
    },
    {
      "name": "Albergue La Estación (Santiago)",
      "town": "Santiago de Compostela"
    }
  ],
  "camino-del-norte": [
    {
      "name": "Albergue de Peregrinos de Irún (Irún)",
      "town": "Irún"
    },
    {
      "name": "Albergue Martindozenea (Irún)",
      "town": "Irún"
    },
    {
      "name": "Albergue de Peregrinos de FICOBA (Irún)",
      "town": "Irún"
    },
    {
      "name": "Albergue de Peregrinos de Hondarribia (Hondarribia)",
      "town": "Hondarribia"
    },
    {
      "name": "Albergue de Peregrinos de Pasaia (Pasaia)",
      "town": "Pasaia"
    },
    {
      "name": "Albergue de Peregrinos de San Sebastián (San Sebastián)",
      "town": "San Sebastián"
    },
    {
      "name": "Ulia Hostel (San Sebastián)",
      "town": "San Sebastián"
    },
    {
      "name": "A Room In The City (San Sebastián)",
      "town": "San Sebastián"
    },
    {
      "name": "Koisi Hostel (San Sebastián)",
      "town": "San Sebastián"
    },
    {
      "name": "Albergue de Peregrinos de Zarautz (Zarautz)",
      "town": "Zarautz"
    },
    {
      "name": "Gran Camping Zarautz (Zarautz)",
      "town": "Zarautz"
    },
    {
      "name": "Talaimendi (Zarautz)",
      "town": "Zarautz"
    },
    {
      "name": "Albergue de Peregrinos de Deba (Deba)",
      "town": "Deba"
    },
    {
      "name": "Geltoki (Deba)",
      "town": "Deba"
    },
    {
      "name": "Izarraitz (Deba)",
      "town": "Deba"
    },
    {
      "name": "Albergue de Peregrinos de Markina (Markina-Xemein)",
      "town": "Markina-Xemein"
    },
    {
      "name": "Pitis (Markina-Xemein)",
      "town": "Markina-Xemein"
    },
    {
      "name": "Arretxinaga (Markina-Xemein)",
      "town": "Markina-Xemein"
    },
    {
      "name": "Albergue de Peregrinos de Gernika (Gernika)",
      "town": "Gernika"
    },
    {
      "name": "Gernika Hostel (Gernika)",
      "town": "Gernika"
    },
    {
      "name": "Lorategi (Gernika)",
      "town": "Gernika"
    },
    {
      "name": "Albergue de Peregrinos de Lezama (Lezama)",
      "town": "Lezama"
    },
    {
      "name": "Albergue de Peregrinos de Bilbao (Bilbao)",
      "town": "Bilbao"
    },
    {
      "name": "Bilbao Akelarre Hostel (Bilbao)",
      "town": "Bilbao"
    },
    {
      "name": "Quartier Bilbao (Bilbao)",
      "town": "Bilbao"
    },
    {
      "name": "Bilbao Central Hostel (Bilbao)",
      "town": "Bilbao"
    },
    {
      "name": "Albergue de Peregrinos de Portugalete (Portugalete)",
      "town": "Portugalete"
    },
    {
      "name": "Albergue de Peregrinos de Castro Urdiales (Castro Urdiales)",
      "town": "Castro Urdiales"
    },
    {
      "name": "Albergue de Islares (Castro Urdiales)",
      "town": "Castro Urdiales"
    },
    {
      "name": "Ostello Castro (Castro Urdiales)",
      "town": "Castro Urdiales"
    },
    {
      "name": "Albergue de Peregrinos de Laredo (Laredo)",
      "town": "Laredo"
    },
    {
      "name": "Albergue El Buen Pastor (Laredo)",
      "town": "Laredo"
    },
    {
      "name": "Albergue de Peregrinos de Santoña (Santoña)",
      "town": "Santoña"
    },
    {
      "name": "Albergue Berria (Santoña)",
      "town": "Santoña"
    },
    {
      "name": "Albergue de Peregrinos de Santander (Santander)",
      "town": "Santander"
    },
    {
      "name": "Albergue Santos Mártires (Santander)",
      "town": "Santander"
    },
    {
      "name": "Alojamientos Picos de Europa (Santander)",
      "town": "Santander"
    },
    {
      "name": "Albergue de Peregrinos de Santillana (Santillana del Mar)",
      "town": "Santillana del Mar"
    },
    {
      "name": "Albergue Solar de Hidalgos (Santillana del Mar)",
      "town": "Santillana del Mar"
    },
    {
      "name": "Albergue Arroyo (Santillana del Mar)",
      "town": "Santillana del Mar"
    },
    {
      "name": "Albergue de Peregrinos de Comillas (Comillas)",
      "town": "Comillas"
    },
    {
      "name": "La Huella del Camino (Comillas)",
      "town": "Comillas"
    },
    {
      "name": "Albergue de Peregrinos de San Vicente (San Vicente de la Barquera)",
      "town": "San Vicente de la Barquera"
    },
    {
      "name": "Albergue La Braña (San Vicente de la Barquera)",
      "town": "San Vicente de la Barquera"
    },
    {
      "name": "El Galeón (San Vicente de la Barquera)",
      "town": "San Vicente de la Barquera"
    },
    {
      "name": "Albergue de Peregrinos de Llanes (Llanes)",
      "town": "Llanes"
    },
    {
      "name": "La Estación (Llanes)",
      "town": "Llanes"
    },
    {
      "name": "La Senda (Llanes)",
      "town": "Llanes"
    },
    {
      "name": "Albergue de Peregrinos de Ribadesella (Ribadesella)",
      "town": "Ribadesella"
    },
    {
      "name": "Albergue Roberto Frassinelli (Ribadesella)",
      "town": "Ribadesella"
    },
    {
      "name": "Albergue de Peregrinos de Colunga (Colunga)",
      "town": "Colunga"
    },
    {
      "name": "Albergue de Peregrinos de Sebrayu (Villaviciosa)",
      "town": "Villaviciosa"
    },
    {
      "name": "Albergue La Ferrería (Villaviciosa)",
      "town": "Villaviciosa"
    },
    {
      "name": "Albergue de Peregrinos de Gijón (Gijón)",
      "town": "Gijón"
    },
    {
      "name": "Hostel Gijón Centro (Gijón)",
      "town": "Gijón"
    },
    {
      "name": "Albergue de Peregrinos Pedro Solís (Avilés)",
      "town": "Avilés"
    },
    {
      "name": "Albergue de Peregrinos de Soto de Luiña (Soto de Luiña)",
      "town": "Soto de Luiña"
    },
    {
      "name": "Albergue de Peregrinos de Cadavedo (Cadavedo)",
      "town": "Cadavedo"
    },
    {
      "name": "Albergue de Peregrinos de Almuña (Luarca)",
      "town": "Luarca"
    },
    {
      "name": "Albergue Villa de Luarca (Luarca)",
      "town": "Luarca"
    },
    {
      "name": "Albergue de Peregrinos de La Caridad (La Caridad)",
      "town": "La Caridad"
    },
    {
      "name": "Albergue de Peregrinos de Tapia (Tapia de Casariego)",
      "town": "Tapia de Casariego"
    },
    {
      "name": "Albergue de Peregrinos de Ribadeo (Ribadeo)",
      "town": "Ribadeo"
    },
    {
      "name": "A Ponte (Ribadeo)",
      "town": "Ribadeo"
    },
    {
      "name": "El Olivo (Ribadeo)",
      "town": "Ribadeo"
    },
    {
      "name": "Camino Norte (Ribadeo)",
      "town": "Ribadeo"
    },
    {
      "name": "Albergue de Peregrinos de Lourenzá (Lourenzá)",
      "town": "Lourenzá"
    },
    {
      "name": "Albergue de Peregrinos de Mondoñedo (Mondoñedo)",
      "town": "Mondoñedo"
    },
    {
      "name": "Albergue da Natureza (Mondoñedo)",
      "town": "Mondoñedo"
    },
    {
      "name": "O Bisonte (Mondoñedo)",
      "town": "Mondoñedo"
    },
    {
      "name": "Albergue de Peregrinos de Abadín (Abadín)",
      "town": "Abadín"
    },
    {
      "name": "Albergue de Peregrinos de Vilalba (Vilalba)",
      "town": "Vilalba"
    },
    {
      "name": "As Pedreiras (Vilalba)",
      "town": "Vilalba"
    },
    {
      "name": "A Lagoa (Vilalba)",
      "town": "Vilalba"
    },
    {
      "name": "Albergue de Peregrinos de Baamonde (Baamonde)",
      "town": "Baamonde"
    },
    {
      "name": "O Abeiro (Baamonde)",
      "town": "Baamonde"
    },
    {
      "name": "Albergue de Peregrinos de Sobrado (Sobrado dos Monxes)",
      "town": "Sobrado dos Monxes"
    },
    {
      "name": "Albergue del Monasterio (Sobrado dos Monxes)",
      "town": "Sobrado dos Monxes"
    },
    {
      "name": "Porta Real (Sobrado dos Monxes)",
      "town": "Sobrado dos Monxes"
    },
    {
      "name": "A Cantina (Sobrado dos Monxes)",
      "town": "Sobrado dos Monxes"
    },
    {
      "name": "Albergue de Peregrinos (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Ribadiso (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Ultreia (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Santiago Apóstol (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Vía Láctea (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Seminario Menor (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "San Lázaro (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Monte do Gozo (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "The Last Stamp (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Roots & Boots (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Santo Santiago (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Azabache (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Sixtos No Caminho (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Linares (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Porta Real (Santiago)",
      "town": "Santiago"
    }
  ],
  "camino-primitivo": [
    {
      "name": "Albergue de Peregrinos El Salvador (Oviedo)",
      "town": "Oviedo"
    },
    {
      "name": "Albergue La Peregrina (Oviedo)",
      "town": "Oviedo"
    },
    {
      "name": "Albergue Villa Cecilia (Oviedo)",
      "town": "Oviedo"
    },
    {
      "name": "Albergue de Peregrinos de Grado (Grado)",
      "town": "Grado"
    },
    {
      "name": "Albergue El Salvador (Grado)",
      "town": "Grado"
    },
    {
      "name": "Albergue Villa de Grado (Grado)",
      "town": "Grado"
    },
    {
      "name": "Albergue de Peregrinos de Salas (Salas)",
      "town": "Salas"
    },
    {
      "name": "Albergue Casa Sueño (Salas)",
      "town": "Salas"
    },
    {
      "name": "Albergue La Campa (Salas)",
      "town": "Salas"
    },
    {
      "name": "Albergue de Peregrinos de Tineo (Tineo)",
      "town": "Tineo"
    },
    {
      "name": "Albergue Mater Christi (Tineo)",
      "town": "Tineo"
    },
    {
      "name": "Albergue La Plaza (Tineo)",
      "town": "Tineo"
    },
    {
      "name": "Albergue de Peregrinos de Pola de Allande (Pola de Allande)",
      "town": "Pola de Allande"
    },
    {
      "name": "Albergue de Peñaseita (Pola de Allande)",
      "town": "Pola de Allande"
    },
    {
      "name": "Albergue de Peregrinos de Berducedo (Berducedo)",
      "town": "Berducedo"
    },
    {
      "name": "Albergue Camino Primitivo (Berducedo)",
      "town": "Berducedo"
    },
    {
      "name": "Albergue de Peregrinos de A Fonsagrada (A Fonsagrada)",
      "town": "A Fonsagrada"
    },
    {
      "name": "Albergue Cantábrico (A Fonsagrada)",
      "town": "A Fonsagrada"
    },
    {
      "name": "Albergue de Peregrinos de O Cádavo (O Cádavo)",
      "town": "O Cádavo"
    },
    {
      "name": "Albergue de Peregrinos de Castroverde (Castroverde)",
      "town": "Castroverde"
    },
    {
      "name": "Casa do Chao (Castroverde)",
      "town": "Castroverde"
    },
    {
      "name": "Albergue de Peregrinos de Lugo (Lugo)",
      "town": "Lugo"
    },
    {
      "name": "Porta de Santiago (Lugo)",
      "town": "Lugo"
    },
    {
      "name": "Credencial (Lugo)",
      "town": "Lugo"
    },
    {
      "name": "Casa da Chanca (Lugo)",
      "town": "Lugo"
    },
    {
      "name": "Albergue de Peregrinos de San Román (San Román da Retorta)",
      "town": "San Román da Retorta"
    },
    {
      "name": "Albergue de Peregrinos de Melide (Melide)",
      "town": "Melide"
    },
    {
      "name": "O Cruceiro (Melide)",
      "town": "Melide"
    },
    {
      "name": "O Apalpador (Melide)",
      "town": "Melide"
    },
    {
      "name": "Pereiro (Melide)",
      "town": "Melide"
    },
    {
      "name": "San Antón (Melide)",
      "town": "Melide"
    },
    {
      "name": "Raido (Melide)",
      "town": "Melide"
    },
    {
      "name": "A Lúa do Camiño (Melide)",
      "town": "Melide"
    },
    {
      "name": "Teodora (Melide)",
      "town": "Melide"
    },
    {
      "name": "Xabarín (Melide)",
      "town": "Melide"
    },
    {
      "name": "Albergue de Peregrinos (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Ribadiso (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Ultreia (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Santiago Apóstol (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Vía Láctea (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Los Caminantes (Arzúa)",
      "town": "Arzúa"
    },
    {
      "name": "Albergue de Peregrinos (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Santa Irene (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Porta de Santiago (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Mirador de Pedrouzo (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Edreira (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Cruceiro (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Buleiro (O Pedrouzo)",
      "town": "O Pedrouzo"
    },
    {
      "name": "Seminario Menor (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "San Lázaro (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Monte do Gozo (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "The Last Stamp (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Roots & Boots (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Santo Santiago (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Azabache (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Sixtos No Caminho (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Linares (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Porta Real (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "📍 OTROS (Añadir hotel / albergue / punto personalizado) (Grandas de Salime)",
      "town": "Grandas de Salime"
    }
  ],
  "camino-sanabres": [
    {
      "name": "Albergue Triana (Sevilla)",
      "town": "Sevilla"
    },
    {
      "name": "Albergue de Peregrinos de Sevilla (Sevilla)",
      "town": "Sevilla"
    },
    {
      "name": "The Spot Hostel (Sevilla)",
      "town": "Sevilla"
    },
    {
      "name": "Oasis Backpackers (Sevilla)",
      "town": "Sevilla"
    },
    {
      "name": "Albergue de Peregrinos de Zafra (Zafra)",
      "town": "Zafra"
    },
    {
      "name": "Hotel Cervantes Hostel (Zafra)",
      "town": "Zafra"
    },
    {
      "name": "Albergue de Peregrinos de Villafranca (Villafranca de los Barros)",
      "town": "Villafranca de los Barros"
    },
    {
      "name": "Albergue Las Caballeras (Villafranca de los Barros)",
      "town": "Villafranca de los Barros"
    },
    {
      "name": "Albergue de Peregrinos de Mérida (Mérida)",
      "town": "Mérida"
    },
    {
      "name": "El Alfarero (Mérida)",
      "town": "Mérida"
    },
    {
      "name": "Lusitania Hostel (Mérida)",
      "town": "Mérida"
    },
    {
      "name": "Albergue de Peregrinos de Cáceres (Cáceres)",
      "town": "Cáceres"
    },
    {
      "name": "Las Veletas (Cáceres)",
      "town": "Cáceres"
    },
    {
      "name": "Casa Mari (Cáceres)",
      "town": "Cáceres"
    },
    {
      "name": "Albergue de Peregrinos de Casar (Casar de Cáceres)",
      "town": "Casar de Cáceres"
    },
    {
      "name": "Albergue de Peregrinos de Cañaveral (Cañaveral)",
      "town": "Cañaveral"
    },
    {
      "name": "Albergue de Peregrinos de Plasencia (Plasencia)",
      "town": "Plasencia"
    },
    {
      "name": "Albergue de Peregrinos de Béjar (Béjar)",
      "town": "Béjar"
    },
    {
      "name": "Albergue de Peregrinos de Salamanca (Salamanca)",
      "town": "Salamanca"
    },
    {
      "name": "La Calvera (Salamanca)",
      "town": "Salamanca"
    },
    {
      "name": "Revolutum Hostel (Salamanca)",
      "town": "Salamanca"
    },
    {
      "name": "Albergue de Peregrinos de Zamora (Zamora)",
      "town": "Zamora"
    },
    {
      "name": "Albergue Vía de la Plata (Zamora)",
      "town": "Zamora"
    },
    {
      "name": "Albergue de Peregrinos de Puebla de Sanabria (Puebla de Sanabria)",
      "town": "Puebla de Sanabria"
    },
    {
      "name": "Albergue de Peregrinos de A Gudiña (A Gudiña)",
      "town": "A Gudiña"
    },
    {
      "name": "Albergue de Peregrinos de Laza (Laza)",
      "town": "Laza"
    },
    {
      "name": "Albergue de Peregrinos de Xunqueira (Xunqueira de Ambía)",
      "town": "Xunqueira de Ambía"
    },
    {
      "name": "Albergue de Peregrinos de Ourense (Ourense)",
      "town": "Ourense"
    },
    {
      "name": "Albergue As Burgas (Ourense)",
      "town": "Ourense"
    },
    {
      "name": "Albergue Xabarín (Ourense)",
      "town": "Ourense"
    },
    {
      "name": "Albergue de Peregrinos de Cea (Cea)",
      "town": "Cea"
    },
    {
      "name": "Mirador do Monte (Cea)",
      "town": "Cea"
    },
    {
      "name": "Albergue de Peregrinos de Dozón (Dozón)",
      "town": "Dozón"
    },
    {
      "name": "Santa María (Dozón)",
      "town": "Dozón"
    },
    {
      "name": "Albergue de Peregrinos de Lalín (Lalín)",
      "town": "Lalín"
    },
    {
      "name": "A Laxe (Lalín)",
      "town": "Lalín"
    },
    {
      "name": "Lalín Centro (Lalín)",
      "town": "Lalín"
    },
    {
      "name": "Albergue de Peregrinos de Silleda (Silleda)",
      "town": "Silleda"
    },
    {
      "name": "Santa Olaia (Silleda)",
      "town": "Silleda"
    },
    {
      "name": "Seminario Menor (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "San Lázaro (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Monte do Gozo (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "The Last Stamp (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Roots & Boots (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Santo Santiago (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Azabache (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Sixtos No Caminho (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Linares (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Porta Real (Santiago)",
      "town": "Santiago"
    }
  ],
  "camino-invierno": [
    {
      "name": "Albergue San Nicolás de Flüe (Ponferrada)",
      "town": "Ponferrada"
    },
    {
      "name": "Albergue Guiana (Ponferrada)",
      "town": "Ponferrada"
    },
    {
      "name": "Albergue de Peregrinos de Ponferrada (Ponferrada)",
      "town": "Ponferrada"
    },
    {
      "name": "Albergue de Peregrinos de O Barco (O Barco de Valdeorras)",
      "town": "O Barco de Valdeorras"
    },
    {
      "name": "Albergue de Peregrinos de A Rúa (A Rúa)",
      "town": "A Rúa"
    },
    {
      "name": "Albergue de Peregrinos de Quiroga (Quiroga)",
      "town": "Quiroga"
    },
    {
      "name": "Albergue de Peregrinos de Monforte (Monforte de Lemos)",
      "town": "Monforte de Lemos"
    },
    {
      "name": "Albergue Lemus (Monforte de Lemos)",
      "town": "Monforte de Lemos"
    },
    {
      "name": "Albergue de Peregrinos de Chantada (Chantada)",
      "town": "Chantada"
    },
    {
      "name": "Albergue de Peregrinos de Rodeiro (Rodeiro)",
      "town": "Rodeiro"
    },
    {
      "name": "Albergue A Laxe (Lalín)",
      "town": "Lalín"
    },
    {
      "name": "Albergue de Peregrinos de Lalín (Lalín)",
      "town": "Lalín"
    },
    {
      "name": "Albergue de Peregrinos de Silleda (Silleda)",
      "town": "Silleda"
    },
    {
      "name": "Santa Olaia (Silleda)",
      "town": "Silleda"
    },
    {
      "name": "Albergue de Peregrinos de A Estrada (A Estrada)",
      "town": "A Estrada"
    },
    {
      "name": "A Coruña (A Estrada)",
      "town": "A Estrada"
    },
    {
      "name": "Albergue de Peregrinos de Vedra (Vedra)",
      "town": "Vedra"
    },
    {
      "name": "Albergue de Peregrinos de Boqueixón (Boqueixón)",
      "town": "Boqueixón"
    },
    {
      "name": "Seminario Menor (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "San Lázaro (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Monte do Gozo (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "The Last Stamp (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Roots & Boots (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Santo Santiago (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Azabache (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Sixtos No Caminho (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Linares (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Porta Real (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Albergue Municipal de Villavieja (Villavieja)",
      "town": "Villavieja"
    },
    {
      "name": "Casa Socorro / Hotel Medulio (Las Médulas)",
      "town": "Las Médulas"
    },
    {
      "name": "Albergue Casa Rosa (Puente de Domingo Flórez)",
      "town": "Puente de Domingo Flórez"
    },
    {
      "name": "Alojamiento Bar Mar (Sobradelo)",
      "town": "Sobradelo"
    },
    {
      "name": "Albergue de Peregrinos de Xagoaza (O Barco de Valdeorras)",
      "town": "O Barco de Valdeorras"
    },
    {
      "name": "Albergue Municipal de Vilamartín de Valdeorras",
      "town": "Vilamartín de Valdeorras"
    },
    {
      "name": "Albergue Juvenil / Municipal de Quiroga",
      "town": "Quiroga"
    },
    {
      "name": "Albergue Municipal de A Pobra do Brollón",
      "town": "A Pobra do Brollón"
    },
    {
      "name": "Albergue Santiago 15 (Monforte de Lemos)",
      "town": "Monforte de Lemos"
    },
    {
      "name": "Albergue de Peregrinos de Diomondi (Xunta)",
      "town": "Diomondi"
    },
    {
      "name": "Albergue A Pausa do Asma (Chantada)",
      "town": "Chantada"
    },
    {
      "name": "Albergue-Hostal Carpinteiras (Rodeiro)",
      "town": "Rodeiro"
    },
    {
      "name": "Albergue Lalín Centro (Lalín)",
      "town": "Lalín"
    }
  ],
  "camino-fisterra-muxia": [
    {
      "name": "Seminario Menor (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "San Lázaro (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Monte do Gozo (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "The Last Stamp (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Roots & Boots (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Santo Santiago (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Azabache (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Sixtos No Caminho (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Linares (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Porta Real (Santiago)",
      "town": "Santiago"
    },
    {
      "name": "Albergue de Peregrinos de Negreira (Negreira)",
      "town": "Negreira"
    },
    {
      "name": "Lua (Negreira)",
      "town": "Negreira"
    },
    {
      "name": "Bergando (Negreira)",
      "town": "Negreira"
    },
    {
      "name": "Casa Manola (Negreira)",
      "town": "Negreira"
    },
    {
      "name": "Albergue de Peregrinos de A Pena (A Pena)",
      "town": "A Pena"
    },
    {
      "name": "Albergue de Peregrinos de Olveiroa (Olveiroa)",
      "town": "Olveiroa"
    },
    {
      "name": "Casa Loncho (Olveiroa)",
      "town": "Olveiroa"
    },
    {
      "name": "Albergue de Peregrinos de Hospital (Hospital)",
      "town": "Hospital"
    },
    {
      "name": "Albergue de Peregrinos de Fisterra (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "Finistellae (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "Mar de Fora (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "A Casa do Peixe (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "Albergue de Peregrinos de Muxía (Muxía)",
      "town": "Muxía"
    },
    {
      "name": "Bela Muxía (Muxía)",
      "town": "Muxía"
    },
    {
      "name": "Arribada (Muxía)",
      "town": "Muxía"
    },
    {
      "name": "A de Loló (Muxía)",
      "town": "Muxía"
    },
    {
      "name": "O Encontro (Muxía)",
      "town": "Muxía"
    },
    {
      "name": "Albergue de Peregrinos de Negreira (Xunta)",
      "town": "Negreira"
    },
    {
      "name": "Albergue San José (Negreira)",
      "town": "Negreira"
    },
    {
      "name": "Albergue El Carmen (Negreira)",
      "town": "Negreira"
    },
    {
      "name": "Albergue Alecrín (Negreira)",
      "town": "Negreira"
    },
    {
      "name": "Albergue Bergando (Negreira)",
      "town": "Negreira"
    },
    {
      "name": "Albergue Cotón (Negreira)",
      "town": "Negreira"
    },
    {
      "name": "Albergue Santa Mariña (A Pena)",
      "town": "A Pena"
    },
    {
      "name": "Albergue Alto da Pena (A Pena)",
      "town": "A Pena"
    },
    {
      "name": "Albergue de Peregrinos de Olveiroa (Xunta)",
      "town": "Olveiroa"
    },
    {
      "name": "Albergue O Refuxio de Xallas (Olveiroa)",
      "town": "Olveiroa"
    },
    {
      "name": "Albergue Camiño Fisterra (Olveiroa)",
      "town": "Olveiroa"
    },
    {
      "name": "Albergue O Logoso (O Logoso)",
      "town": "O Logoso"
    },
    {
      "name": "Albergue San Roque de Corcubión (Municipal)",
      "town": "Corcubión"
    },
    {
      "name": "Albergue de Peregrinos de Cee / A Casa da Fonte (Cee)",
      "town": "Cee"
    },
    {
      "name": "Albergue de Peregrinos de Fisterra (Xunta)",
      "town": "Fisterra"
    },
    {
      "name": "Albergue Por Fin (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "Albergue-Pensión Finistellae (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "Albergue Arasolis (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "Albergue Mar de Rostro (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "Albergue Mar de Fora (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "Albergue O Encontro / Cabo da Vila (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "Albergue de Sonia - Buen Camino (Fisterra)",
      "town": "Fisterra"
    },
    {
      "name": "Albergue Liresca (Lires)",
      "town": "Lires"
    },
    {
      "name": "Albergue Moreira (Lires)",
      "town": "Lires"
    },
    {
      "name": "Albergue de Peregrinos de Muxía (Municipal)",
      "town": "Muxía"
    },
    {
      "name": "Albergue Bela Muxía (Muxía)",
      "town": "Muxía"
    },
    {
      "name": "Albergue Arribada (Muxía)",
      "town": "Muxía"
    },
    {
      "name": "Albergue Da Costa (Muxía)",
      "town": "Muxía"
    },
    {
      "name": "Albergue Muxía Mare (Muxía)",
      "town": "Muxía"
    },
    {
      "name": "Albergue @Muxía (Muxía)",
      "town": "Muxía"
    }
  ]
};
