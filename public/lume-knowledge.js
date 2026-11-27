/* ==========================================================================
 * LUME — BASE DE CONOCIMIENTO OFFLINE DEL CAMINO DE SANTIAGO Y SMARTVIEIRA
 * Sin jerga técnica. Lenguaje claro, cálido y práctico para peregrinos.
 * ========================================================================== */

window.LUME_KNOWLEDGE = [
  // ── 1. USO DE LA APLICACIÓN SMARTVIEIRA ─────────────────────────────────
  {
    id: 'app_tabs_guide',
    phrases: [
      'para que sirve cada pestana', 'como funciona la app', 'como funciona la aplicacion',
      'como uso la app', 'como se usa la app', 'que puedo hacer aqui', 'guia de la app',
      'explicame la app', 'que significa cada boton', 'pestanas de la app', 'help', 'how does the app work'
    ],
    keywords: ['pestana', 'pestanas', 'menu', 'botones', 'aplicacion', 'app', 'tutorial', 'empezar'],
    answer:
      "🧭 **Guía rápida de tu app SmartVieira (5 pestañas abajo):**\n\n" +
      "• **Inicio:** Tu resumen del día. Aquí ves el estado real de tu mochila (*Pendiente*, *En camino* o *Entregada*) y el botón para ver el mapa del reparto.\n" +
      "• **Reservar:** Para contratar el transporte de tu mochila etapa a etapa (eliges ruta, albergue de salida, albergue de llegada, transportista y fecha).\n" +
      "• **Guía:** Toda la información del Camino sin necesidad de internet (etapas, kilómetros, pueblos, mapa de alojamientos, consejos y este chat conmigo).\n" +
      "• **Vieira:** El mando de tu concha física. Desde aquí la enciendes, eliges el color, activas el parpadeo para encontrar tu mochila o la luz nocturna.\n" +
      "• **Perfil:** Tus datos, tu concha vinculada, idioma y cierre de sesión."
  },
  {
    id: 'app_status_meaning',
    phrases: [
      'que significa pendiente', 'que significa en camino', 'que significa entregada',
      'que significa pagada', 'estados de la mochila', 'que significan los estados',
      'no se actualiza el estado', 'cuando cambia el estado'
    ],
    keywords: ['significa', 'pendiente', 'en camino', 'entregada', 'pagada', 'estados', 'actualiza'],
    answer:
      "📋 **¿Qué significa cada estado de tu mochila?**\n\n" +
      "• 🟡 **Pendiente / Pagada:** Tu reserva está confirmada. Solo tienes que dejar tu mochila en recepción del albergue de salida antes de las 08:00 con tu concha bien visible.\n" +
      "• 🚚 **En camino:** El transportista ya ha recogido tu mochila en el albergue de origen y va en furgoneta hacia tu destino. Puedes pulsar **«Ver ubicación en tiempo real»** en la pestaña Inicio.\n" +
      "• ✅ **Entregada:** Tu mochila ya está a buen recaudo en el albergue de destino. Al llegar, usa el parpadeo de tu concha en la pestaña **«Vieira»** para localizarla en un segundo.\n\n" +
      "🔄 *El estado se actualiza solo cada pocos segundos sin que tengas que cerrar ni volver a abrir la app.*"
  },
  {
    id: 'app_cutoff_time',
    phrases: [
      'hora limite', 'a partir de las 8', 'para manana', 'disponible hoy', 'desde manana',
      'no me deja elegir hoy', 'por que me pone manana', 'hasta que hora puedo reservar',
      'cuando puedo contratar', 'reservar para hoy', 'reservar para otro dia', 'fecha del transporte'
    ],
    keywords: ['limite', 'manana', 'hoy', 'fecha', 'plazo', 'corte', 'adelantado', 'antelacion'],
    answer:
      "⏰ **Hora límite de reserva y fecha del transporte:**\n\n" +
      "Cada empresa de transporte fija su propia **hora límite** para aceptar mochilas en el mismo día (normalmente las **08:00 de la mañana**, cuando salen las furgonetas).\n\n" +
      "• **🟢 Disponible HOY (hasta HH:MM):** Todavía estás a tiempo de contratar para hoy mismo (o elegir cualquier día futuro).\n" +
      "• **📅 Desde MAÑANA (límite HH:MM):** Ya ha pasado la hora de salida de hoy para esa empresa, así que la app selecciona **mañana automáticamente** para que no haya errores.\n\n" +
      "💡 *Si ya son más de las 08:00 pero otra empresa tiene límite a las 09:00, te aparecerá primero arriba en verde como disponible para hoy.*"
  },
  {
    id: 'app_prepare_backpack_morning',
    phrases: [
      'como dejo la mochila', 'donde dejo la mochila', 'donde pongo la concha',
      'preparar la mochila para el transporte', 'que hago por la manana',
      'a que hora bajo la mochila', 'peso maximo', 'cuanto puede pesar', 'cuantos kilos'
    ],
    keywords: ['dejar', 'recepcion', 'atar', 'colocar', 'peso', 'kilos', 'kg', 'maleta', 'fragil'],
    answer:
      "🎒 **Cómo dejar tu mochila lista por la mañana:**\n\n" +
      "1. **Antes de las 08:00 h:** Baja tu mochila a la recepción o zona de mochilas del albergue de salida.\n" +
      "2. **Concha bien visible:** Ata tu SmartVieira en el asa superior o exterior de la mochila (no la metas dentro) para que el repartidor vea la luz al instante.\n" +
      "3. **Sin sobres ni efectivo:** Como ya reservaste y pagaste en la app, no necesitas imprimir nada ni dejar dinero en sobres.\n" +
      "4. **Peso y objetos de valor:** El límite habitual es de **15–20 kg** por bulto. Lleva siempre contigo en una mochilita pequeña tu documentación, dinero, móvil, medicamentos y la Credencial."
  },
  {
    id: 'app_link_qr',
    phrases: [
      'como vinculo', 'vincular concha', 'vincular qr', 'escanear qr', 'no funciona la camara',
      'no lee el qr', 'codigo qr', 'introducir id a mano', 'donde esta el id', 'id de la concha'
    ],
    keywords: ['vincular', 'escanear', 'qr', 'camara', 'codigo', 'manual', 'enlazar'],
    answer:
      "📷 **Cómo vincular tu concha SmartVieira:**\n\n" +
      "1. Al abrir la app (o desde **Perfil**), pulsa **«Escanear QR»**, acepta el permiso de cámara y apunta al código QR de tu concha.\n" +
      "2. **¿No te lee el QR o prefieres escribirlo?** Pulsa en **«Introducir ID manualmente»** y escribe el código impreso justo debajo del QR (ejemplo: *VIEIRA-S3-XXXXXX*).\n" +
      "3. Una vez vinculada, esa concha queda asociada en exclusiva a tu cuenta para que solo tú y el transportista que contrates podáis iluminarla."
  },
  {
    id: 'app_demo_and_buy',
    phrases: [
      'modo demo', 'no tengo concha', 'donde compro la concha', 'comprar smartvieira',
      'comprar vieira', 'cuanto cuesta la concha', 'envio de la concha', 'como conseguir la concha'
    ],
    keywords: ['demo', 'comprar', 'tienda', 'adquirir', 'conseguir', 'envio', 'domicilio'],
    answer:
      "🛍️ **Modo Demo y cómo conseguir tu SmartVieira:**\n\n" +
      "• **Modo Demo (gratis, sin registro):** Te permite explorar toda la Guía del Camino, consultar etapas, buscar alojamientos en el mapa y hablar conmigo (LUME).\n" +
      "• **Comprar tu SmartVieira:** Para contratar transporte de mochilas y controlar las luces necesitas tu concha física (**15,00 € + 2,00 € de envío**). Puedes pedirla directamente desde la pestaña **«Reservar»** con tarjeta o Google Pay y te llega lista para usar.\n" +
      "• Si ya tienes una concha física, pulsa **«Vincular QR»** y entra con tu cuenta."
  },
  {
    id: 'app_vieira_troubleshoot',
    phrases: [
      'no conecta la concha', 'no se enciende la concha', 'no brilla', 'no parpadea',
      'no encuentra mi concha', 'problema bluetooth', 'falla la luz', 'linterna nocturna',
      'temporizador', 'cambiar color'
    ],
    keywords: ['conecta', 'conectar', 'enciende', 'brilla', 'color', 'colores', 'linterna', 'temporizador', 'nocturna'],
    answer:
      "✨ **Uso y solución rápida para las luces de tu SmartVieira:**\n\n" +
      "• **Cómo encenderla:** Entra en la pestaña **«Vieira»**, asegúrate de tener el **Bluetooth encendido** en tu móvil y acércate a menos de 10 metros de tu mochila. Elige el color y el tiempo (por ejemplo 30 segundos para moverte de noche por el albergue sin molestar).\n" +
      "• **¿No responde a la primera?** Espera 5 segundos y vuelve a pulsar (la concha entra en modo ahorro automático para que la batería te dure todo el Camino, y tarda un par de segundos en despertar).\n" +
      "• **¿Acaba de recogerla o entregarla el repartidor?** Espera unos 10 segundos a que se libere la señal y podrás volver a controlarla desde tu móvil."
  },
  {
    id: 'app_offline_mode',
    phrases: [
      'sin internet', 'sin cobertura', 'funciona offline', 'sin datos', 'modo avion', 'no tengo internet'
    ],
    keywords: ['offline', 'internet', 'cobertura', 'datos', 'wifi', 'senal'],
    answer:
      "📶 **¿Qué funciona sin cobertura en el Camino?**\n\n" +
      "• **Funciona 100% sin internet:** Toda la pestaña **Guía** (caminos, etapas, kilómetros, consejos), este chat con **LUME**, y las **luces/parpadeo de tu concha SmartVieira** (van directas por Bluetooth entre tu móvil y la concha).\n" +
      "• **Necesita algo de conexión:** Reservar un transporte nuevo, pagar, ver el mapa de alojamientos o consultar en directo por dónde va la furgoneta en el mapa."
  },
  {
    id: 'app_hostels_map',
    phrases: [
      'buscar albergue', 'reservar albergue', 'mapa de alojamientos', 'donde dormir',
      'buscar hotel', 'buscar pension', 'stay22', 'alojamiento cerca'
    ],
    keywords: ['alojamiento', 'alojamientos', 'dormir', 'cama', 'hotel', 'pension', 'hostal', 'habitacion'],
    answer:
      "🛏️ **Cómo buscar alojamiento desde la app:**\n\n" +
      "1. Entra en la pestaña **«Guía»** → **«Albergues»**.\n" +
      "2. Elige tu **fecha de entrada, salida y número de personas**.\n" +
      "3. Abre el **mapa interactivo** para ver albergues privados, pensiones y hoteles con precios y disponibilidad real en tu localidad de destino.\n\n" +
      "💡 *Consejo: en los últimos 100 km (Sarria–Santiago) entre mayo y septiembre, conviene reservar al menos con 1 o 2 días de antelación.*"
  },
  {
    id: 'app_language_password',
    phrases: [
      'cambiar idioma', 'poner en ingles', 'poner en espanol', 'olvide mi contrasena',
      'cambiar contrasena', 'recuperar contrasena', 'cerrar sesion', 'mi cuenta'
    ],
    keywords: ['idioma', 'idiomas', 'lengua', 'contrasena', 'clave', 'sesion', 'perfil', 'cuenta'],
    answer:
      "⚙️ **Idioma, contraseña y cuenta:**\n\n" +
      "• **Cambiar idioma:** Pulsa el botón de idioma arriba a la derecha (tienes Español, Inglés, Francés, Alemán, Italiano, Portugués, Coreano y Chino).\n" +
      "• **Cambiar contraseña:** Entra en la pestaña **«Perfil»** y despliega **«Cambiar contraseña»**.\n" +
      "• **¿Olvidaste tu contraseña?** En la pantalla de acceso pulsa **«¿Olvidaste tu contraseña?»** y te enviaremos una clave temporal a tu correo."
  },

  // ── 2. ENCICLOPEDIA PRÁCTICA DEL CAMINO DE SANTIAGO ─────────────────────
  {
    id: 'camino_credencial_sellos',
    phrases: [
      'que es la credencial', 'donde consigo la credencial', 'donde comprar la credencial',
      'cuantos sellos', 'sellos al dia', 'como funciona la credencial', 'pasaporte del peregrino'
    ],
    keywords: ['credencial', 'sello', 'sellos', 'sellar', 'pasaporte'],
    answer:
      "📜 **La Credencial del Peregrino y los Sellos:**\n\n" +
      "• **Qué es:** Tu «pasaporte» oficial del Camino. Te da acceso a albergues públicos y acredita los kilómetros recorridos para pedir la Compostela.\n" +
      "• **Dónde conseguirla:** En albergues de inicio (Saint-Jean, Roncesvalles, Sarria, Tui, Ferrol, Oviedo...), iglesias, oficinas de turismo y Asociaciones de Amigos del Camino (cuesta unos **2–3 €**).\n" +
      "• **Cuántos sellos necesitas:** En los **últimos 100 km a pie** (o 200 km en bici) es obligatorio poner **al menos 2 sellos al día con fecha** (en albergues, bares, iglesias, ayuntamientos o farmacias). Antes de los últimos 100 km basta con 1 sello diario."
  },
  {
    id: 'camino_compostela',
    phrases: [
      'que es la compostela', 'como conseguir la compostela', 'oficina del peregrino',
      'cuantos kilometros para la compostela', 'certificado de distancia', 'recoger la compostela'
    ],
    keywords: ['compostela', 'diploma', 'certificado', 'oficina', '100 km', '100km'],
    answer:
      "🎓 **La Compostela y el Certificado de Distancia:**\n\n" +
      "• **Requisitos:** Haber recorrido al menos los **últimos 100 km continuos a pie** (o a caballo) o **200 km en bicicleta** hasta Santiago, con **2 sellos diarios** en tu Credencial.\n" +
      "• **Dónde recogerla:** En la **Oficina de Acogida al Peregrino** (Rúa das Carretas, 33 — a 3 minutos de la Catedral).\n" +
      "• **Truco para ahorrar cola:** Regístrate antes en la web oficial de la Oficina del Peregrino para llevar tu código QR ya generado; la entrega es gratuita.\n" +
      "• **Certificado de Distancia:** Si además quieres un diploma donde pongan el punto exacto donde empezaste y los kilómetros totales (ej. 780 km), puedes pedirlo allí mismo por ~3 €."
  },
  {
    id: 'camino_catedral_botafumeiro',
    phrases: [
      'misa del peregrino', 'botafumeiro', 'catedral de santiago', 'abrazo al apostol',
      'entrar con mochila a la catedral', 'consigna en santiago', 'plaza del obradoiro'
    ],
    keywords: ['misa', 'botafumeiro', 'catedral', 'obradoiro', 'apostol', 'consigna'],
    answer:
      "⛪ **Catedral de Santiago, Misa del Peregrino y Botafumeiro:**\n\n" +
      "• **Misa del Peregrino:** Se celebra todos los días (horarios habituales: **12:00 h** y **19:30 h**, más misas adicionales en temporada alta). Llega al menos 30–45 min antes para coger sitio.\n" +
      "• **Botafumeiro:** Vuela en las grandes festividades litúrgicas (25 de julio, 30 de diciembre, Semana Santa, etc.) y en días en los que algún grupo lo reserva.\n" +
      "• **¡Ojo con la mochila!** No se permite entrar a la Catedral con mochilas grandes ni bastones. Tienes consignas justo al lado (en la Oficina del Peregrino o en Rúa do Franco/Rúa das Carretas por ~3–4 €)."
  },
  {
    id: 'camino_albergues_normas',
    phrases: [
      'albergue publico o privado', 'diferencia albergue publico privado', 'normas de albergue',
      'hora de cierre albergue', 'a que hora cierran los albergues', 'reservar albergue publico',
      'sabanas en albergues', 'saco de dormir'
    ],
    keywords: ['publico', 'publicos', 'privado', 'privados', 'hospitalero', 'litera', 'ronquidos', 'normas', 'silencio'],
    answer:
      "🏠 **Albergues Públicos vs. Privados y normas clave:**\n\n" +
      "• **Públicos (Xunta / Municipales / Parroquiales):** ~10 € (o donativo). **No admiten reserva previa** (por orden de llegada), dan prioridad a caminantes a pie y muchos **no aceptan entrega de mochilas por transporte**.\n" +
      "• **Privados / Pensiones:** ~14–22 €. **Sí admiten reserva**, aceptan transporte de mochilas SmartVieira, suelen tener cocina/lavadora y horarios más flexibles.\n" +
      "• **Convivencia de oro:** Silencio y luces apagadas a las **22:00 h**; salida antes de las **08:00 h**. Lleva **tapones para los oídos** (imprescindibles), chanclas para la ducha y usa la **luz suave de tu SmartVieira** si te levantas de noche para no despertar al dormitorio."
  },
  {
    id: 'camino_que_llevar',
    phrases: [
      'que llevar en la mochila', 'lista de equipaje', 'que ropa llevar', 'cuanto debe pesar la mochila',
      'que meto en la mochila', 'equipaje para el camino', 'necesito saco', 'que calzado llevar'
    ],
    keywords: ['llevar', 'equipaje', 'ropa', 'calzado', 'botas', 'zapatillas', 'saco', 'poncho', 'chubasquero', 'lista'],
    answer:
      "🎒 **Qué llevar en la mochila (regla de oro: nunca más del 10% de tu peso):**\n\n" +
      "• **Calzado:** Zapatillas de trail o botas ligeras **ya domadas** (nunca las estrenes en el Camino) + chanclas para la ducha y descansar por la tarde.\n" +
      "• **Ropa (sistema de capas):** 2–3 camisetas técnicas, 2 pantalones cómodos, 3 mudas y **3 pares de calcetines técnicos sin costuras**, un forro polar ligero y un **poncho/chubasquero** amplio.\n" +
      "• **Descanso:** Saco ligero (en verano basta sábana saco) + tapones para los oídos + toalla de microfibra.\n" +
      "• **Básicos:** Cantimplora (1 L), protector solar, gorra, vaselina para los pies, 4 pinzas para tender, crema antiinflamatoria y cargador.\n\n" +
      "💡 *Si contratas el transporte de mochila con SmartVieira, puedes llevar una maleta o mochila más cómoda y caminar solo con una mochilita ligera de 2–3 kg.*"
  },
  {
    id: 'camino_pies_ampollas',
    phrases: [
      'tengo ampollas', 'evitar ampollas', 'curar ampolla', 'dolor de pies', 'me duelen las rodillas',
      'tendinitis', 'rozaduras', 'vaselina', 'bastones', 'como cuidar los pies'
    ],
    keywords: ['ampolla', 'ampollas', 'pies', 'pie', 'rodilla', 'rodillas', 'tendinitis', 'rozadura', 'bastones', 'compeed', 'vaselina'],
    answer:
      "🩹 **Cuidado de pies, ampollas y rodillas en el Camino:**\n\n" +
      "• **Prevención (lo más importante):** Aplica **vaselina abundante** entre los dedos y plantas antes de ponerte calcetines técnicos sin costuras. Usa calzado media o una talla mayor (el pie se hincha al caminar) y quítate zapatillas y calcetines 10 min en cada descanso para airearlos.\n" +
      "• **Si ya tienes una ampolla:** Nunca arranques la piel. Si es pequeña, desinfecta con clorhexidina y protégela. Si es grande y duele al pisar, acude a una farmacia del Camino (están súper acostumbradas a curar peregrinos!).\n" +
      "• **Rodillas y tendinitis:** Usa **dos bastones de trekking** (descargan hasta un 25% del impacto en bajadas), no fuerces el ritmo los 3 primeros días y aplica frío + estiramientos suaves al acabar la etapa."
  },
  {
    id: 'camino_comida_agua',
    phrases: [
      'menu del peregrino', 'donde comer', 'agua potable', 'fuentes en el camino',
      'comida tipica gallega', 'que comer en galicia', 'desayuno', 'cuanto cuesta comer'
    ],
    keywords: ['comer', 'comida', 'menu', 'agua', 'fuente', 'fuentes', 'pulpo', 'desayuno', 'cena', 'bar', 'restaurante'],
    answer:
      "🍲 **Comida, agua y Menú del Peregrino:**\n\n" +
      "• **Agua:** Bebe pequeños sorbos cada 20–30 minutos aunque no tengas sed. Hay fuentes en casi todos los pueblos; si ves un cartel de *«Agua no tratada / no potable»*, no rellenes ahí.\n" +
      "• **Menú del Peregrino:** Casi todos los bares y restaurantes ofrecen primero, segundo, pan, bebida y postre por **12 € – 16 €**.\n" +
      "• **Imprescindibles en Galicia:** Pulpo á feira (famosísimo en Melide!), caldo gallego, empanada, pimientos de Padrón, queso de Arzúa-Ulloa y tarta de Santiago."
  },
  {
    id: 'camino_clima_epoca',
    phrases: [
      'mejor epoca para hacer el camino', 'cuando hacer el camino', 'llueve mucho en galicia',
      'tiempo en el camino', 'hace frio', 'hacer el camino en verano', 'hacer el camino en invierno'
    ],
    keywords: ['clima', 'tiempo', 'lluvia', 'llueve', 'epoca', 'verano', 'invierno', 'primavera', 'otono', 'nieve', 'calor', 'frio'],
    answer:
      "🌦️ **Clima y mejor época para el Camino:**\n\n" +
      "• **Primavera (abril–junio) y Otoño (septiembre–octubre):** Las mejores épocas: temperaturas suaves, paisajes verdes y menos masificación.\n" +
      "• **Verano (julio–agosto):** Mucho ambiente peregrino, pero calor fuerte en la Meseta (sal a las 06:30 h) y alta ocupación en Sarria–Santiago (reserva alojamiento con antelación).\n" +
      "• **Invierno (noviembre–marzo):** Muy tranquilo y especial, pero varios albergues cierran y puede haber nieve en Pirineos u O Cebreiro.\n" +
      "• **Galicia:** Puede llover en cualquier mes — lleva siempre un poncho ligero que cubra cuerpo y mochila."
  },
  {
    id: 'camino_senales_flechas',
    phrases: [
      'como no perderse', 'flechas amarillas', 'mojones del camino', 'como seguir el camino',
      'senalizacion del camino', 'hacia donde apunta la concha'
    ],
    keywords: ['flecha', 'flechas', 'mojon', 'mojones', 'senal', 'senales', 'perderse', 'perderme', 'orientacion'],
    answer:
      "💛 **Cómo orientarte: Flechas Amarillas y Mojones:**\n\n" +
      "• **Flechas amarillas:** Son la señal universal del Camino (pintadas en árboles, paredes, suelos y postes). Si llevas más de 10 minutos sin ver una flecha en un cruce, retrocede al último desvío.\n" +
      "• **Mojones de Galicia:** Cada 500 metros encontrarás un hito de piedra con la concha y los **kilómetros exactos que te faltan hasta la Plaza del Obradoiro**.\n" +
      "• **Truco con la concha en las placas:** En Galicia, la dirección correcta es hacia donde **se abren los rayos** (o sigue siempre la flecha amarilla pintada junto a ella)."
  },
  {
    id: 'camino_presupuesto_dinero',
    phrases: [
      'cuanto dinero llevar', 'presupuesto del camino', 'cuanto cuesta hacer el camino',
      'hay cajeros', 'aceptan tarjeta', 'llevar efectivo'
    ],
    keywords: ['presupuesto', 'dinero', 'efectivo', 'cajero', 'cajeros', 'gasto', 'gastos', 'barato'],
    answer:
      "💶 **Presupuesto diario y dinero en el Camino:**\n\n" +
      "• **Presupuesto medio realista:** Entre **35 € y 55 € al día** (albergue público ~10 € o privado ~16–22 €, comidas ~18–25 €, café/extras ~5 €, y transporte de mochila desde 6,50 € si lo necesitas).\n" +
      "• **Efectivo y tarjeta:** Hoy casi todos los bares y albergues privados aceptan tarjeta, pero lleva siempre **30–50 € en efectivo** (billetes pequeños y monedas) para albergues públicos, donativos, máquinas de lavandería y bares de aldeas pequeñas donde no haya datáfono ni cajero."
  },
  {
    id: 'camino_transporte_llegar_volver',
    phrases: [
      'como llegar a sarria', 'como llegar a saint jean', 'como volver de santiago',
      'aeropuerto de santiago', 'tren a santiago', 'autobus a fisterra', 'bus a finisterre'
    ],
    keywords: ['aeropuerto', 'avion', 'tren', 'autobus', 'bus', 'volver', 'regreso', 'llegar', 'taxi'],
    answer:
      "🚆 **Cómo llegar al inicio y volver desde Santiago:**\n\n" +
      "• **Llegar a Sarria (últimos 100 km Francés):** Tren directo desde Madrid/Barcelona/A Coruña, o autobús Monbus desde Lugo o el aeropuerto de Santiago.\n" +
      "• **Llegar a Saint-Jean-Pied-de-Port:** Bus diario desde Pamplona (ALSA/Conda) o tren desde Bayona (Francia).\n" +
      "• **Volver desde Santiago:** La estación intermodal (tren AVE/Alvia y autobuses) está a 12 min a pie de la Catedral. Para el **Aeropuerto de Santiago-Rosalía de Castro**, el bus urbano **línea 6A** sale cada 20–30 min desde el centro (~1 €).\n" +
      "• **Ir o volver de Fisterra / Muxía:** Hay autobuses diarios de la compañía Monbus desde la estación intermodal de Santiago."
  },
  {
    id: 'camino_solo_seguridad',
    phrases: [
      'hacer el camino solo', 'hacer el camino sola', 'es seguro el camino', 'viajar sola',
      'seguridad en el camino', 'caminar de noche'
    ],
    keywords: ['solo', 'sola', 'seguro', 'seguridad', 'mujeres', 'peligro', 'peligroso', 'noche'],
    answer:
      "🛡️ **Hacer el Camino solo o sola (Seguridad):**\n\n" +
      "• El Camino de Santiago es **uno de los viajes más seguros y solidarios de Europa**; miles de personas (más de la mitad mujeres en muchas rutas) lo hacen solas cada año y hacen amistades desde el primer día.\n" +
      "• **Consejos básicos:** Evita caminar completamente a oscuras por bosques solitarios, camina siempre por la **izquierda** en tramos de carretera para ver los coches de frente, lleva la app **AlertCops** instalada y recuerda que el **112** y la **Guardia Civil (062)** funcionan incluso sin cobertura de tu operador."
  },
  {
    id: 'camino_bici_perro',
    phrases: [
      'camino en bicicleta', 'bicigrino', 'hacer el camino en bici', 'enviar bicicleta',
      'camino con perro', 'perregrino', 'albergues con perro', 'mascotas'
    ],
    keywords: ['bici', 'bicicleta', 'bicigrino', 'perro', 'perros', 'mascota', 'mascotas', 'perregrino'],
    answer:
      "🚲🐾 **Camino en Bicicleta o con Perro:**\n\n" +
      "• **En bicicleta (Bicigrinos):** Necesitas los **últimos 200 km** (2 sellos diarios) para la Compostela. En los albergues públicos de la Xunta tienen prioridad los peregrinos a pie hasta las 19:00–20:00 h, así que los albergues privados con guarda-bicis son muy cómodos.\n" +
      "• **Con perro (Perregrinos):** Los albergues públicos no admiten mascotas, pero cada vez hay más **albergues privados, pensiones y casas rurales pet-friendly** (llama siempre antes para confirmar). Lleva cartilla sanitaria, crema protectora para sus almohadillas y agua extra."
  },
  {
    id: 'camino_lavanderia_enchufes',
    phrases: [
      'lavar ropa', 'lavanderia', 'donde lavar', 'enchufes', 'cargar el movil', 'chinches'
    ],
    keywords: ['lavar', 'lavadora', 'secadora', 'lavanderia', 'tendedero', 'enchufe', 'enchufes', 'chinches', 'bichos'],
    answer:
      "🧺 **Trucos de vida diaria en los albergues:**\n\n" +
      "• **Lavar ropa:** Casi todos los albergues tienen pilas para lavar a mano (lleva una pastilla pequeña de jabón y 4 pinzas) y lavadora/secadora compartida (~4–5 € cada una; compártela con otro peregrino para dividir el coste).\n" +
      "• **Enchufes:** Llevar un pequeño **cargador con 2–3 puertos USB** te hará el mejor amigo del dormitorio.\n" +
      "• **Prevención de chinches:** No pongas nunca la mochila encima de la cama (déjala en el suelo o en una silla), usa tu sábana saco y revisa rápidamente las esquinas del colchón."
  },
  {
    id: 'camino_tradiciones_xacobeo',
    phrases: [
      'que significa ultreia', 'cruz de ferro', 'monte do gozo', 'ano xacobeo', 'ano santo',
      'puerta santa', 'fisterrana', 'muxiana', 'buen camino'
    ],
    keywords: ['ultreia', 'suseia', 'ferro', 'gozo', 'xacobeo', 'santo', 'puerta', 'fisterrana', 'muxiana', 'tradicion'],
    answer:
      "✨ **Tradiciones y palabras mágicas del Camino:**\n\n" +
      "• **¡Ultreia et Suseia!:** Saludo medieval que significa *«¡Más allá y más arriba!»* (ánimo para seguir adelante).\n" +
      "• **Cruz de Ferro (León):** El punto más alto del Camino Francés (~1.500 m). La tradición es dejar una pequeña piedra traída desde tu casa simbolizando una carga que sueltas.\n" +
      "• **Monte do Gozo:** La colina a 4,5 km de Santiago desde donde los peregrinos ven por primera vez las torres de la Catedral.\n" +
      "• **Año Santo Xacobeo:** Cuando el 25 de julio (Día de Santiago) cae en domingo y se abre la Puerta Santa. **¡El próximo Año Xacobeo es 2027!**\n" +
      "• **Fisterrana y Muxiana:** Certificados que obtienes si sigues caminando ~90 km desde Santiago hasta el «Fin del Mundo» (Fisterra) y Muxía."
  }
];

window.matchLumeKnowledge = function(normQuery) {
  if (!normQuery || !window.LUME_KNOWLEDGE) return null;
  const padded = ' ' + normQuery.replace(/\s+/g, ' ').trim() + ' ';
  let bestItem = null;
  let bestScore = 0;

  for (let i = 0; i < window.LUME_KNOWLEDGE.length; i++) {
    const item = window.LUME_KNOWLEDGE[i];
    let score = 0;

    if (item.phrases) {
      for (const p of item.phrases) {
        if (normQuery.includes(p)) {
          score += 12 + Math.min(p.length / 4, 6);
        }
      }
    }
    if (item.keywords) {
      for (const kw of item.keywords) {
        if (kw.includes(' ')) {
          if (normQuery.includes(kw)) score += 6;
        } else {
          if (padded.includes(' ' + kw + ' ')) score += 5;
          else if (kw.length >= 5 && normQuery.includes(kw)) score += 3;
        }
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestItem = item;
    }
  }

  // Require a meaningful match threshold so guide/route queries aren't hijacked by weak hits
  return bestScore >= 5 ? { item: bestItem, score: bestScore } : null;
};
