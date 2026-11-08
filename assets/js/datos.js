/* IncluSign - contenido del prototipo.
 * Los videos son de la serie oficial #UnaSeñaParaTi del Instituto Nacional para Sordos (INSOR),
 * publicados en su canal de YouTube y en https://conecta.insor.gov.co/contenidos-accesibles/
 */
const INSOR_PAGINA = "https://conecta.insor.gov.co/contenido-accesible/una-sena-para-ti-";

const CATEGORIAS = [
	{ id: "saludos", nombre: "Saludos y cortesía", icono: "👋" },
	{ id: "emociones", nombre: "Emociones", icono: "💛" },
	{ id: "cualidades", nombre: "Cualidades", icono: "✨" },
	{ id: "comunidad", nombre: "Trabajo y comunidad", icono: "🤝" },
];

/* id: identificador de la seña · video: identificador del video en YouTube · insor: página del video en INSOR */
const SENAS = [
	{ id: "hola", palabra: "Hola", categoria: "saludos", video: "fea5jK8t4Ng", insor: "hola", significado: "Saludo para iniciar una conversación." },
	{ id: "buenos-dias", palabra: "Buenos días", categoria: "saludos", video: "y1Baezm8n9k", insor: "buenos-dias", significado: "Saludo que se usa en la mañana." },
	{ id: "buenas-tardes", palabra: "Buenas tardes", categoria: "saludos", video: "2apesscJET4", insor: "buenas-tardes", significado: "Saludo que se usa después del mediodía." },
	{ id: "mucho-gusto", palabra: "Mucho gusto", categoria: "saludos", video: "v19ISk6QXTc", insor: "mucho-gusto", significado: "Expresión de cortesía al conocer a alguien." },
	{ id: "por-favor", palabra: "Por favor", categoria: "saludos", video: "x8UsgewqHjE", insor: "por-favor", significado: "Expresión para pedir algo con amabilidad." },
	{ id: "gracias", palabra: "Gracias", categoria: "saludos", video: "ACHyaxL-ogo", insor: "gracias", significado: "Expresión de agradecimiento." },
	{ id: "invitacion", palabra: "Invitación", categoria: "saludos", video: "KYYg5qVk_f0", insor: "invitacion", significado: "Acción de invitar a alguien a un lugar o actividad." },

	{ id: "feliz", palabra: "Feliz", categoria: "emociones", video: "kCdZolVunVk", insor: "feliz", significado: "Estado de alegría y bienestar." },
	{ id: "relajado", palabra: "Relajado", categoria: "emociones", video: "VuRsOLIIMdg", insor: "relajado", significado: "Estado de calma y tranquilidad." },
	{ id: "orgulloso", palabra: "Orgulloso", categoria: "emociones", video: "7FAC0mMGan0", insor: "orgulloso", significado: "Satisfacción por un logro propio o de otra persona." },
	{ id: "afortunado", palabra: "Afortunado", categoria: "emociones", video: "RZT-kR_oPtw", insor: "afortunado", significado: "Que tiene buena suerte." },
	{ id: "hambre", palabra: "Hambre", categoria: "emociones", video: "4tbKqbbKsgA", insor: "hambre", significado: "Sensación de necesitar comer." },
	{ id: "amor", palabra: "Amor", categoria: "emociones", video: "WdWLD7_BR-E", insor: "amor", significado: "Sentimiento de afecto profundo hacia alguien o algo." },
	{ id: "sonrie", palabra: "Sonríe", categoria: "emociones", video: "YZucWPLbY2g", insor: "sonrie", significado: "Invitación a sonreír." },
	{ id: "paciencia", palabra: "Paciencia", categoria: "emociones", video: "6BI8FXVi6Hc", insor: "paciencia", significado: "Capacidad de esperar con calma." },
	{ id: "chevere", palabra: "Chévere", categoria: "emociones", video: "Yj_ei_sTv5c", insor: "chevere", significado: "Expresión colombiana para algo agradable o muy bueno." },

	{ id: "decidido", palabra: "Decidido", categoria: "cualidades", video: "sc8awxkB_bI", insor: "decidido", significado: "Persona que actúa con firmeza y seguridad." },
	{ id: "sociable", palabra: "Sociable", categoria: "cualidades", video: "sG1vX2P5nro", insor: "sociable", significado: "Persona a quien le gusta relacionarse con los demás." },
	{ id: "creativo", palabra: "Creativo", categoria: "cualidades", video: "nMHqKEYIfOg", insor: "creativo", significado: "Persona que tiene ideas nuevas y originales." },
	{ id: "comprometido", palabra: "Comprometido", categoria: "cualidades", video: "jl9mGTBtjHU", insor: "comprometido", significado: "Persona que cumple con responsabilidad lo que asume." },
	{ id: "guapo", palabra: "Guapo", categoria: "cualidades", video: "acYgezlswg8", insor: "guapo", significado: "Cumplido sobre la apariencia de una persona." },
	{ id: "hermosa", palabra: "Hermosa", categoria: "cualidades", video: "C-AHGxh6L6A", insor: "hermosa", significado: "Cumplido para algo o alguien de gran belleza." },
	{ id: "bonita", palabra: "Bonita", categoria: "cualidades", video: "LPdH0Ap7yu4", insor: "bonita", significado: "Cumplido para algo o alguien agradable a la vista." },

	{ id: "ayuda", palabra: "Ayuda", categoria: "comunidad", video: "IdgElwNZUA8", insor: "ayuda", significado: "Pedir u ofrecer apoyo a otra persona." },
	{ id: "trabajo", palabra: "Trabajo", categoria: "comunidad", video: "xpAJ0vf0cfo", insor: "trabajo", significado: "Actividad laboral u ocupación." },
	{ id: "servicio", palabra: "Servicio", categoria: "comunidad", video: "KoIoMjvOAP0", insor: "servicio", significado: "Acción de atender o ayudar a otras personas." },
	{ id: "transformacion", palabra: "Transformación", categoria: "comunidad", video: "m6OMJuREhcI", insor: "transformacion", significado: "Cambio profundo de algo o alguien." },
];

const CURSOS = [
	{
		id: 1, titulo: "Fundamentos de LSC", nivel: "Principiante", etiqueta: "Curso inicial", icono: "✦",
		descripcion: "Aprende a saludar y a usar expresiones de cortesía para iniciar una conversación con respeto.",
		lecciones: [
			{ id: 1, titulo: "Saludos y presentaciones", minutos: 8, senas: ["hola", "buenos-dias", "buenas-tardes", "mucho-gusto"],
				resumen: "Aprende a saludar en distintos momentos del día.",
				contenido: "Saludar es el primer paso para iniciar cualquier interacción. En LSC el saludo va acompañado de contacto visual y expresión facial: la cara también comunica. Observa cada video, repite la seña frente a un espejo y practica hasta hacerla con naturalidad.",
				objetivos: ["Saludar en la mañana y en la tarde.", "Expresar gusto al conocer a alguien.", "Observar la expresión facial que acompaña cada seña."] },
			{ id: 2, titulo: "Expresiones de cortesía", minutos: 6, senas: ["por-favor", "gracias", "invitacion"],
				resumen: "Por favor, gracias e invitación.",
				contenido: "Las expresiones de cortesía facilitan una comunicación respetuosa. Recuerda que en LSC la expresión facial modifica el sentido: acompaña cada seña con un gesto amable.",
				objetivos: ["Pedir algo con amabilidad.", "Agradecer.", "Invitar a alguien."] },
		],
	},
	{
		id: 2, titulo: "Emociones y bienestar", nivel: "Básico", etiqueta: "Expresión", icono: "♡",
		descripcion: "Expresa cómo te sientes y comparte afecto con las personas que te rodean.",
		lecciones: [
			{ id: 3, titulo: "¿Cómo me siento?", minutos: 9, senas: ["feliz", "relajado", "orgulloso", "afortunado", "hambre"],
				resumen: "Comparte tu estado de ánimo.",
				contenido: "En las emociones la expresión facial es protagonista: la misma seña sin el gesto adecuado pierde su sentido. Fíjate en el rostro de la persona del video tanto como en sus manos.",
				objetivos: ["Expresar emociones y estados.", "Acompañar cada emoción con la expresión facial."] },
			{ id: 4, titulo: "Expresar afecto", minutos: 8, senas: ["amor", "sonrie", "paciencia", "chevere"],
				resumen: "Señas para animar y acompañar a otras personas.",
				contenido: "Aprende señas para transmitir cariño, ánimo y buena energía en una conversación.",
				objetivos: ["Expresar afecto.", "Animar a otra persona."] },
		],
	},
	{
		id: 3, titulo: "Describir a las personas", nivel: "Básico", etiqueta: "Vida diaria", icono: "◉",
		descripcion: "Describe la personalidad de alguien y aprende a hacer cumplidos.",
		lecciones: [
			{ id: 5, titulo: "Personalidad", minutos: 8, senas: ["decidido", "sociable", "creativo", "comprometido"],
				resumen: "Cualidades para describir a una persona.",
				contenido: "Describir cómo es una persona te permite presentar a tus amigos, compañeros o familiares.",
				objetivos: ["Describir la personalidad de alguien."] },
			{ id: 6, titulo: "Cumplidos", minutos: 6, senas: ["guapo", "hermosa", "bonita"],
				resumen: "Dile algo amable a alguien.",
				contenido: "Un cumplido es una forma sencilla de crear cercanía. Aprende algunas señas para expresar admiración.",
				objetivos: ["Hacer cumplidos con respeto."] },
		],
	},
	{
		id: 4, titulo: "Trabajo y comunidad", nivel: "Básico", etiqueta: "Entorno laboral", icono: "⌖",
		descripcion: "Vocabulario para el trabajo, el servicio y la vida en comunidad.",
		lecciones: [
			{ id: 7, titulo: "En el trabajo", minutos: 8, senas: ["trabajo", "servicio", "ayuda", "transformacion"],
				resumen: "Señas útiles en el entorno laboral y comunitario.",
				contenido: "La inclusión laboral de las personas sordas también depende de que sus compañeros oyentes conozcan señas básicas. Estas señas te ayudarán a comunicarte en el trabajo.",
				objetivos: ["Hablar del trabajo.", "Ofrecer y pedir ayuda."] },
		],
	},
	{
		id: 5, titulo: "Comunidad y cultura sorda", nivel: "Introducción", etiqueta: "Cultura", icono: "⌂",
		descripcion: "Acércate a la comunidad sorda, su cultura y las pautas para una interacción inclusiva.",
		lecciones: [
			{ id: 8, titulo: "Identidad y comunidad sorda", minutos: 8, senas: [],
				resumen: "Conoce la identidad y la cultura de la comunidad sorda.",
				contenido: "La comunidad sorda colombiana tiene una lengua propia, la LSC, reconocida por la Ley 324 de 1996. Hay personas sordas señantes, hablantes y bilingües. Referirse a ellas como “personas sordas” es la forma respetuosa; evita términos como “sordomudo”.",
				objetivos: ["Reconocer la LSC como lengua de la comunidad sorda.", "Usar términos respetuosos."] },
			{ id: 9, titulo: "Atención visual y turnos de conversación", minutos: 8, senas: [],
				resumen: "Cómo se organiza una conversación en LSC.",
				contenido: "En una conversación en LSC el contacto visual es indispensable: mirar a otro lado puede interpretarse como desinterés. Espera tu turno y asegúrate de que la otra persona te esté mirando antes de comenzar.",
				objetivos: ["Mantener el contacto visual.", "Respetar los turnos de conversación."] },
			{ id: 10, titulo: "Cómo llamar la atención con respeto", minutos: 6, senas: [],
				resumen: "Formas adecuadas de pedir la atención de una persona sorda.",
				contenido: "Para llamar la atención de una persona sorda puedes tocar suavemente su hombro o brazo, agitar la mano dentro de su campo visual o encender y apagar la luz en un salón. Evita gritar o tocarla de forma brusca. Recuerda también que la lengua de señas no es universal: cada país tiene la suya.",
				objetivos: ["Identificar formas respetuosas de llamar la atención.", "Evitar prácticas inadecuadas."] },
		],
	},
];
