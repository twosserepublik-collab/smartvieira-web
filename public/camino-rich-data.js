// Datos detallados propios de Etapas, Desniveles, Servicios por Localidad y Fichas de Albergues
const CAMINO_ETAPAS = {
  'camino-frances': [
    { n: 'Etapa 1–5', route: 'Saint-Jean-Pied-de-Port → Pamplona', km: '65,2 km', time: '3–4 días', up: '+1.850 m', down: '-1.580 m', diff: 4, profile: [20, 95, 65, 55, 45], town: 'Pamplona', desc: 'Cruce mítico de los Pirineos por la Ruta de Napoleón (o Valcarlos en invierno) hasta Roncesvalles, bosques de Zubiri y llegada a Pamplona.' },
    { n: 'Etapa 6–12', route: 'Pamplona → Logroño → Burgos', km: '216 km', time: '8–9 días', up: '+2.420 m', down: '-2.010 m', diff: 3, profile: [45, 75, 40, 50, 70, 55], town: 'Burgos', desc: 'Alto del Perdón, puente románico de Puente la Reina, viñedos de La Rioja, Montes de Oca y Catedral gótica de Burgos.' },
    { n: 'Etapa 13–21', route: 'Burgos → Sahagún → León → Astorga', km: '229 km', time: '9–10 días', up: '+1.380 m', down: '-1.390 m', diff: 2, profile: [55, 50, 48, 52, 50, 55], town: 'Astorga', desc: 'La Meseta castellana: cielos inmensos, Canal de Castilla en Frómista, Catedral de León y Palacio de Gaudí en Astorga.' },
    { n: 'Etapa 22–28', route: 'Astorga → Cruz de Ferro → O Cebreiro → Sarria', km: '155 km', time: '6–7 días', up: '+2.650 m', down: '-3.040 m', diff: 4, profile: [55, 92, 35, 32, 95, 45], town: 'Sarria', desc: 'Subida a Foncebadón y Cruz de Ferro (1.504 m), descenso vertiginoso a Ponferrada y gran ascenso gallego a O Cebreiro.' },
    { n: 'Etapa 29', route: 'Sarria → Portomarín', km: '22,2 km', time: '5 h 15 m', up: '+398 m', down: '-457 m', diff: 2, profile: [45, 68, 55, 60, 35], town: 'Portomarín', desc: 'Inicio más popular (últimos 100 km). Corredoiras entre carballos, Barbadelo, Ferreiros y paso del río Miño hacia Portomarín.' },
    { n: 'Etapa 30', route: 'Portomarín → Palas de Rei', km: '24,8 km', time: '5 h 45 m', up: '+485 m', down: '-305 m', diff: 3, profile: [35, 75, 62, 82, 58], town: 'Palas de Rei', desc: 'Ascenso continuado hasta el Alto de Ligonde y cruceiro de Lameiros antes de descender a Palas de Rei.' },
    { n: 'Etapa 31', route: 'Palas de Rei → Arzúa', km: '28,5 km', time: '6 h 30 m', up: '+520 m', down: '-700 m', diff: 3, profile: [58, 45, 60, 42, 65, 38], town: 'Arzúa', desc: 'Etapa reina gastronómica por Melide (pulpo obligatorio), Boente y Castañeda hasta la villa quesera de Arzúa.' },
    { n: 'Etapa 32', route: 'Arzúa → O Pedrouzo (O Pino)', km: '19,3 km', time: '4 h 30 m', up: '+310 m', down: '-405 m', diff: 2, profile: [38, 52, 40, 58, 30], town: 'O Pedrouzo', desc: 'Jornada amable por bosques de eucaliptos y suaves sube-bajas pasando por Santa Irene hasta O Pedrouzo.' },
    { n: 'Etapa 33', route: 'O Pedrouzo → Santiago de Compostela', km: '19,4 km', time: '4 h 30 m', up: '+335 m', down: '-360 m', diff: 2, profile: [30, 62, 42, 68, 25], town: 'Santiago de Compostela', desc: 'Subida final al Monte do Gozo (primera vista de las torres de la Catedral) y entrada triunfal a la Praza do Obradoiro.' }
  ],
  'camino-portugues-interior': [
    { n: 'Tramo 1–2', route: 'Lisboa → Coimbra → Oporto', km: '337 km', time: '14 días', up: '+3.100 m', down: '-3.080 m', diff: 3, profile: [15, 45, 30, 60, 40, 25], town: 'Porto', desc: 'Trazado tranquilo por el valle del Tajo, Tomar (Convento de Cristo), Coimbra y la vibrante ciudad de Oporto.' },
    { n: 'Tramo 3', route: 'Oporto → Barcelos → Ponte de Lima → Tui', km: '125 km', time: '5–6 días', up: '+1.640 m', down: '-1.610 m', diff: 3, profile: [25, 42, 35, 88, 30], town: 'Tui', desc: 'Puente medieval de Ponte de Lima, exigente subida a Labruja, fortaleza de Valença y cruce del río Miño hacia Galicia.' },
    { n: 'Etapa Tui–Porriño', route: 'Tui → O Porriño', km: '16,1 km', time: '3 h 45 m', up: '+210 m', down: '-220 m', diff: 1, profile: [30, 45, 35, 48, 28], town: 'O Porriño', desc: 'Catedral de Tui, Puente das Febres y senderos boscosos hasta O Porriño (recomendado el desvío fluvial).' },
    { n: 'Etapa Porriño–Redondela', route: 'O Porriño → Redondela', km: '15,5 km', time: '3 h 40 m', up: '+260 m', down: '-275 m', diff: 2, profile: [28, 65, 40, 20], town: 'Redondela', desc: 'Subida a Santiaguiño de Antas y vistas de la ría de Vigo al descender a Redondela (confluencia con la Costa).' },
    { n: 'Etapa Redondela–Pontevedra', route: 'Redondela → Pontevedra', km: '19,6 km', time: '4 h 30 m', up: '+390 m', down: '-375 m', diff: 2, profile: [20, 68, 25, 65, 22], town: 'Pontevedra', desc: 'Puente medieval de Pontesampaio, antiguo camino de piedra en A Canicouva y casco monumental de Pontevedra.' },
    { n: 'Etapa Pontevedra–Caldas', route: 'Pontevedra → Caldas de Reis', km: '21,1 km', time: '5 h', up: '+280 m', down: '-270 m', diff: 2, profile: [22, 48, 35, 52, 24], town: 'Caldas de Reis', desc: 'Viñedos de Albariño, cascadas de Barosa (desvío muy recomendado) y fuentes termales de Caldas de Reis.' },
    { n: 'Etapa Caldas–Padrón', route: 'Caldas de Reis → Padrón', km: '18,6 km', time: '4 h 20 m', up: '+240 m', down: '-250 m', diff: 2, profile: [24, 52, 32, 45, 18], town: 'Padrón', desc: 'Bosques de Carracedo, cruceiro de Pontecesures sobre el río Ulla y llegada a Padrón (el Pedrón romano).' },
    { n: 'Etapa Final', route: 'Padrón → Santiago de Compostela', km: '24,2 km', time: '5 h 45 m', up: '+430 m', down: '-190 m', diff: 2, profile: [18, 40, 58, 72, 65], town: 'Santiago', desc: 'Colegiata de Iria Flavia, santuario de A Esclavitude y ascenso gradual por Milladoiro hasta el Obradoiro.' }
  ],
  'camino-portugues-costa': [
    { n: 'Etapa 1–3', route: 'Oporto → Vila do Conde → Esposende → Viana do Castelo', km: '82 km', time: '3–4 días', up: '+480 m', down: '-475 m', diff: 2, profile: [12, 18, 15, 22, 14], town: 'Viana do Castelo', desc: 'Pasarelas de madera sobre dunas atlánticas, villas marineras y santuario de Santa Luzia en Viana.' },
    { n: 'Etapa 4–5', route: 'Viana → Caminha → A Guarda → Oia → Baiona', km: '62 km', time: '2–3 días', up: '+790 m', down: '-775 m', diff: 2, profile: [14, 18, 35, 25, 28], town: 'Baiona', desc: 'Cruce en barca por el Miño hasta Galicia, castro de Santa Trega, Monasterio de Oia junto al mar y fortaleza de Baiona.' },
    { n: 'Etapa 6–7', route: 'Baiona → Vigo → Redondela', km: '41 km', time: '2 días', up: '+620 m', down: '-610 m', diff: 2, profile: [28, 45, 20, 52, 22], town: 'Redondela', desc: 'Playas de Nigrán, travesía por Vigo con vistas a las Islas Cíes y senda da Auga hasta Redondela.' },
    { n: 'Tramo Final', route: 'Redondela → Pontevedra → Caldas → Padrón → Santiago', km: '83,5 km', time: '4 días', up: '+1.340 m', down: '-1.085 m', diff: 2, profile: [22, 60, 35, 50, 68], town: 'Santiago', desc: 'Se une al trazado Central en Redondela hasta la Catedral de Santiago.' }
  ],
  'camino-ingles': [
    { n: 'Etapa 1', route: 'Ferrol → Neda → Pontedeume', km: '29,5 km', time: '6 h 45 m', up: '+460 m', down: '-455 m', diff: 2, profile: [10, 28, 18, 52, 15], town: 'Pontedeume', desc: 'Se puede dividir durmiendo en Neda (14,5 km). Bordea la ría de Ferrol, Fene, playa de Cabanas y puente medieval de Pontedeume.' },
    { n: 'Etapa 2', route: 'Pontedeume → Miño → Betanzos', km: '20,5 km', time: '5 h', up: '+510 m', down: '-490 m', diff: 3, profile: [15, 72, 22, 68, 25], town: 'Betanzos', desc: 'Fuerte subida inicial saliendo de Pontedeume, playa de Miño y casco gótico monumental de Betanzos.' },
    { n: 'Etapa 3', route: 'Betanzos → Hospital de Bruma', km: '24,2 km', time: '6 h', up: '+690 m', down: '-350 m', diff: 4, profile: [25, 48, 65, 92, 85], town: 'Hospital de Bruma', desc: 'Etapa reina y más exigente del Camino Inglés. Se puede partir en Presedo (12 km) o continuar hasta Bruma (enclave solitario).' },
    { n: 'Ramal Coruña', route: 'A Coruña → Sergude → Hospital de Bruma', km: '32 km', time: '1–2 días', up: '+540 m', down: '-210 m', diff: 2, profile: [10, 38, 62, 85], town: 'Hospital de Bruma', desc: 'Alternativa histórica para peregrinos marítimos que confluye con Ferrol en As Travesas / Bruma.' },
    { n: 'Etapa 4', route: 'Hospital de Bruma → Sigüeiro', km: '24,4 km', time: '5 h 45 m', up: '+260 m', down: '-410 m', diff: 2, profile: [85, 62, 48, 35, 30], town: 'Sigüeiro', desc: 'Terreno muy cómodo de bosque gallego y aldeas rurales hasta la villa de Sigüeiro (todos los servicios).' },
    { n: 'Etapa 5', route: 'Sigüeiro → Santiago de Compostela', km: '16,5 km', time: '3 h 45 m', up: '+290 m', down: '-260 m', diff: 2, profile: [30, 52, 45, 60, 62], town: 'Santiago', desc: 'Puente medieval sobre el río Tambre, bosque encantado y entrada urbana norte hacia la Catedral.' }
  ],
  'camino-del-norte': [
    { n: 'Tramo Vasco', route: 'Irún → San Sebastián → Markina → Bilbao → Portugalete', km: '175 km', time: '7–8 días', up: '+4.100 m', down: '-4.080 m', diff: 4, profile: [20, 82, 35, 90, 28, 75], town: 'Bilbao', desc: 'Montes junto al Cantábrico (Jaizkibel, Flysch de Zumaia), bahía de La Concha y paso por Bilbao.' },
    { n: 'Tramo Cántabro', route: 'Portugalete → Castro Urdiales → Santander → San Vicente', km: '172 km', time: '7 días', up: '+2.350 m', down: '-2.340 m', diff: 3, profile: [20, 48, 32, 55, 25, 42], town: 'Santander', desc: 'Acantilados, playas de Laredo y Noja, bahía de Santander, Santillana del Mar y Comillas.' },
    { n: 'Tramo Asturiano', route: 'San Vicente → Llanes → Gijón → Avilés → Luarca → Ribadeo', km: '286 km', time: '11–12 días', up: '+4.450 m', down: '-4.430 m', diff: 3, profile: [25, 45, 65, 38, 70, 30], town: 'Ribadeo', desc: 'Bufones de Pría, ría de Villaviciosa (donde se separa el Primitivo), Luarca y cruce de la ría del Eo a Galicia.' },
    { n: 'Tramo Gallego', route: 'Ribadeo → Mondoñedo → Vilalba → Sobrado → Arzúa → Santiago', km: '192 km', time: '8 días', up: '+3.150 m', down: '-2.920 m', diff: 3, profile: [20, 72, 85, 58, 70, 52], town: 'Santiago', desc: 'Playa de As Catedrais, catedral de Mondoñedo, subida a A Xesta, monasterio cisterciense de Sobrado y enlace en Arzúa.' }
  ],
  'camino-primitivo': [
    { n: 'Etapas 1–3', route: 'Oviedo → Grado → Salas → Tineo', km: '73 km', time: '3 días', up: '+1.920 m', down: '-1.510 m', diff: 3, profile: [30, 55, 40, 72, 80], town: 'Tineo', desc: 'Inicio ante la Catedral de Oviedo; valles verdes asturianos, monasterio de Cornellana y subida a La Espina.' },
    { n: 'Etapa Reina', route: 'Tineo → Hospitales (o Pola de Allande) → Berducedo', km: '52 km', time: '2 días', up: '+1.650 m', down: '-1.420 m', diff: 5, profile: [75, 98, 92, 65], town: 'Berducedo', desc: 'La famosa Ruta de los Hospitales por cordal de alta montaña (1.200 m, sin servicios; llevar agua/comida). Con niebla usar Pola de Allande.' },
    { n: 'Etapas 6–9', route: 'Berducedo → Grandas → A Fonsagrada → O Cádavo → Lugo', km: '104 km', time: '4 días', up: '+2.340 m', down: '-2.580 m', diff: 4, profile: [65, 35, 95, 78, 52], town: 'Lugo', desc: 'Descenso espectacular al embalse de Grandas de Salime, puerto del Acebo hacia Galicia y Muralla Romana de Lugo.' },
    { n: 'Últimos 100 km', route: 'Lugo → San Romão → Melide → Arzúa → Santiago', km: '101 km', time: '4–5 días', up: '+1.480 m', down: '-1.660 m', diff: 2, profile: [52, 60, 48, 62, 50], town: 'Santiago', desc: 'Etapa solitaria por San Romão da Retorta y enlace en Melide con el Camino Francés hasta Santiago.' }
  ],
  'camino-sanabres': [
    { n: 'Vía de la Plata', route: 'Sevilla → Mérida → Cáceres → Salamanca → Zamora', km: '555 km', time: '20 días', up: '+4.800 m', down: '-4.250 m', diff: 3, profile: [12, 35, 48, 42, 68, 55], town: 'Zamora', desc: 'Calzada romana milenaria por dehesas extremeñas, teatros romanos y ciudades Patrimonio. Ideal en primavera u otoño.' },
    { n: 'Sanabrés Puro', route: 'Zamora → Puebla de Sanabria → A Gudiña → Laza → Ourense', km: '240 km', time: '9–10 días', up: '+4.100 m', down: '-4.520 m', diff: 4, profile: [55, 82, 95, 65, 30], town: 'Ourense', desc: 'Desvío verde en Granja de Moreruela hacia los puertos de Padornelo y A Canda entrando a Galicia hasta las termas de Ourense.' },
    { n: 'Últimos 100 km', route: 'Ourense → Cea → Dozón → Lalín → Silleda → Santiago', km: '108 km', time: '5 días', up: '+1.850 m', down: '-1.710 m', diff: 3, profile: [30, 80, 68, 52, 60], town: 'Santiago', desc: 'Exigente cuesta inicial de Costiña de Canedo, pan de Cea, Monasterio de Oseira y tranquila campiña pontevedresa.' }
  ],
  'camino-invierno': [
    { n: 'Etapas 1–3', route: 'Ponferrada → Las Médulas → O Barco → A Rúa → Quiroga', km: '84 km', time: '4 días', up: '+1.620 m', down: '-1.880 m', diff: 3, profile: [50, 78, 35, 32, 34], town: 'Quiroga', desc: 'Alternativa sin nieve al Cebreiro: minas romanas de Las Médulas y valle del río Sil hacia Valdeorras.' },
    { n: 'Ribeira Sacra', route: 'Quiroga → Monforte de Lemos → Diomondi → Chantada → Rodeiro', km: '90 km', time: '3–4 días', up: '+2.120 m', down: '-1.720 m', diff: 4, profile: [34, 48, 32, 85, 76], town: 'Rodeiro', desc: 'Paso por los viñedos heroicos en bancales de Belesar y los cañones de la Ribeira Sacra.' },
    { n: 'Últimos 100 km', route: 'Chantada / Rodeiro → Lalín → Silleda → Puente Ulla → Santiago', km: '105 km', time: '4–5 días', up: '+1.540 m', down: '-1.860 m', diff: 2, profile: [76, 58, 45, 30, 60], town: 'Santiago', desc: 'Desde A Laxe / Lalín comparte trazado con el Camino Sanabrés por Boqueixón y el Pico Sacro.' }
  ],
  'camino-fisterra-muxia': [
    { n: 'Etapa 1', route: 'Santiago → Negreira', km: '20,6 km', time: '5 h', up: '+420 m', down: '-530 m', diff: 2, profile: [60, 48, 65, 28, 38], town: 'Negreira', desc: 'Salida por Carballeira de San Lourenzo, aldea medieval de Ponte Maceira sobre el río Tambre y llegada a Negreira.' },
    { n: 'Etapa 2', route: 'Negreira → Olveiroa', km: '33,6 km', time: '7 h 45 m', up: '+690 m', down: '-560 m', diff: 3, profile: [38, 72, 60, 78, 55], town: 'Olveiroa', desc: 'Etapa larga (divisible en A Pena / Santa Mariña) entre bosques y prados de la comarca de Xallas.' },
    { n: 'Ramal Fisterra', route: 'Olveiroa → Cee → Corcubión → Cabo Fisterra', km: '34 km', time: '7 h 30 m', up: '+460 m', down: '-750 m', diff: 2, profile: [55, 62, 12, 18, 25], town: 'Fisterra', desc: 'Primera vista del océano al descender a Cee y llegada emocionante al Faro del Fin del Mundo (Km 0).' },
    { n: 'Ramal / Conexión Muxía', route: 'Olveiroa → Muxía / Fisterra ↔ Lires ↔ Muxía', km: '32 / 27,6 km', time: '6–7 h', up: '+520 m', down: '-530 m', diff: 2, profile: [55, 68, 25, 48, 12], town: 'Muxía', desc: 'Acantilados de la Costa da Morte hasta el Santuario da Virxe da Barca frente a las olas del Atlántico.' }
  ]
};

// Servicios verificados disponibles en las principales localidades de paso
const SERVICIOS_PUEBLO = {
  'saint-jean-pied-de-port': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🚂 Tren/Bus'],
  'roncesvalles': ['🛏️ Albergue histórico', '🍽️ Restaurante', '⛪ Colegiata', '🚌 Bus'],
  'pamplona': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 Tren/Bus'],
  'logroño': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Centro Salud', '🚂 Tren/Bus'],
  'burgos': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 AVE/Bus'],
  'león': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 AVE/Bus'],
  'astorga': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Centro Salud', '🚂 Tren/Bus'],
  'ponferrada': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 Tren/Bus'],
  'o cebreiro': ['🛒 Tienda básica', '🍽️ Mesones', '⛪ Santuario'],
  'sarria': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Centro Salud', '🚂 Tren/Bus'],
  'portomarín': ['💊 Farmacia', '🏧 Cajero', '🛒 Tienda', '🍽️ Bares/Menú', '🩺 Consultorio'],
  'palas de rei': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🏥 Centro Salud'],
  'melide': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Pulperías', '🏥 Centro Salud'],
  'arzúa': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🏥 Centro Salud'],
  'o pedrouzo': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Bares/Menú', '🏥 Centro Salud'],
  'santiago de compostela': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 AVE/Bus/Aeropuerto'],
  'santiago': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 AVE/Bus/Aeropuerto'],
  'lisboa': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 Tren/Avión'],
  'porto': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 Tren/Avión'],
  'viana do castelo': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🚂 Tren/Bus'],
  'a guarda': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Bares/Menú', '🚌 Bus'],
  'baiona': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🚌 Bus'],
  'vigo': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 Tren/Avión'],
  'tui': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Centro Salud', '🚂 Tren/Bus'],
  'o porriño': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🚂 Tren/Bus'],
  'redondela': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Bares/Menú', '🚂 Tren/Bus'],
  'pontevedra': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 Tren/Bus'],
  'caldas de reis': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Termas y Menú', '🚌 Bus'],
  'padrón': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🚂 Tren/Bus'],
  'ferrol': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 Tren/Bus'],
  'neda': ['💊 Farmacia', '🏧 Cajero', '🛒 Tienda', '🍽️ Bares/Menú'],
  'pontedeume': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🚂 Tren/Bus'],
  'miño': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Bares/Menú'],
  'betanzos': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Centro Salud', '🚂 Tren/Bus'],
  'presedo': ['🛏️ Albergue público', '🍽️ Bar cercano'],
  'hospital de bruma': ['🛏️ Albergue Xunta', '🍽️ Mesón/Bar cercano'],
  'sigüeiro': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🚌 Bus'],
  'a coruña': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 AVE/Avión'],
  'oviedo': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 AVE/Bus'],
  'lugo': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 Tren/Bus'],
  'ourense': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 AVE/Bus'],
  'monforte de lemos': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚂 Tren/Bus'],
  'negreira': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🚌 Bus'],
  'olveiroa': ['🛏️ Albergues Xunta/Privados', '🍽️ Bares/Menú'],
  'cee': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🏥 Hospital', '🚌 Bus'],
  'corcubión': ['💊 Farmacia', '🏧 Cajero', '🛒 Tienda', '🍽️ Restaurantes'],
  'fisterra': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🚌 Bus'],
  'muxía': ['💊 Farmacia', '🏧 Cajero', '🛒 Supermercado', '🍽️ Restaurantes', '🚌 Bus']
};

// Fichas reales verificadas (plazas, precios, teléfonos, apertura y servicios concretos)
const ALBERGUES_DETALLE = {
  'albergue de peregrinos de sarria': { plazas: '40 plazas', price: '10 €', phone: '+34 660 39 68 13', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: 'Cocina básica, microondas, lavadero, wifi, sábanas desechables, guarda-bicis' },
  'albergue de peregrinos de portomarín': { plazas: '114 plazas', price: '10 €', phone: '+34 660 39 68 16', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: 'Dormitorios amplios, cocina/microondas, lavadora, secadora, wifi, bicis' },
  'albergue de peregrinos de palas de rei': { plazas: '60 plazas', price: '10 €', phone: '+34 660 39 68 20', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: 'Céntrico, cocina, lavadora/secadora, wifi, espacio bicicletas, adaptado PMR' },
  'albergue de peregrinos de arzúa': { plazas: '56 plazas', price: '10 €', phone: '+34 660 39 68 24', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: 'Edificio histórico rehabilitado, microondas, lavadora, secadora, wifi' },
  'albergue de peregrinos de o pedrouzo': { plazas: '+100 plazas', price: '10 €', phone: '+34 660 39 68 26', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: 'Alta capacidad, cocina/nevera, lavandería, wifi, guarda-bicis' },
  'albergue de peregrinos de tui': { plazas: '36 plazas', price: '10 €', phone: '+34 638 27 68 55', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: 'Junto a la Catedral, cocina equipada, lavadora, secadora, wifi, bicis' },
  'albergue de peregrinos de o porriño': { plazas: '48 plazas', price: '10 €', phone: '+34 986 33 54 28', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: 'Junto al río Louro, cocina, lavadora/secadora, wifi, guarda-bicis' },
  'casa da torre': { plazas: '36–42 plazas', price: '10 €', phone: '+34 618 33 80 45', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: 'Casona del s. XVI, microondas, nevera, lavadora/secadora, patio, bicis' },
  'virgen peregrina': { plazas: '56–86 plazas', price: '10 €', phone: '+34 986 84 40 45', open: 'Todo el año', reserve: 'Sin reserva previa (orden de llegada)', services: 'Cocina completa, lavadora, secadora, wifi, jardín, taquillas' },
  'urraca': { plazas: '28 plazas', price: '15 – 20 €', phone: '+34 683 60 53 35', open: 'Marzo – Octubre (consultar invierno)', reserve: 'Admite reserva por teléfono/web', services: 'Habitaciones y literas, wifi, lavandería, cocina, patio exterior' },
  'albergue de peregrinos de padrón': { plazas: '48 plazas', price: '10 €', phone: '+34 673 65 61 73', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: 'Convento rehabilitado, cocina/microondas, lavadero, wifi, bicis' },
  'albergue de peregrinos de neda': { plazas: '28 plazas', price: '8 – 10 €', phone: '+34 629 22 46 22', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: 'Frente a la ría, sábanas desechables, cocina básica, lavadero, wifi' },
  'albergue de peregrinos de pontedeume': { plazas: '20 plazas', price: '8 €', phone: '+34 682 46 90 04', open: 'Todo el año', reserve: 'Sin reserva previa (municipal)', services: 'Junto al muelle y puente medieval, literas, duchas, wifi' },
  'hospital de bruma': { plazas: '22 plazas', price: '10 €', phone: '+34 649 58 03 09', open: 'Todo el año (13:00 – 22:00h)', reserve: 'Sin reserva previa (orden de llegada)', services: '3 dormitorios, microondas, lavadora, mantas, zona de descanso' },
  'camiño real': { plazas: '23 plazas', price: '19 – 22 € (desayuno incl.)', phone: '+34 648 74 60 23', open: 'Marzo – Noviembre (privadas todo el año)', reserve: 'Admite reserva telefónica/online', services: 'Literas con cortina, desayuno incluido, wifi, lavandería, taquillas' },
  'mirás': { plazas: '14 plazas', price: '15 €', phone: '+34 619 26 56 93', open: 'Semana Santa – 15 Octubre', reserve: 'Admite reserva previa', services: 'Familiar y céntrico, cocina, lavadora/secadora, wifi' }
};
