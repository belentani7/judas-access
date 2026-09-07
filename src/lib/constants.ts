export const REDIRECT_URL = 'https://judas-experience-13898.buildaispace.app';

export const ENTITY_IMG =
  'https://image.qwenlm.ai/generated-images/a33925f0-6587-4055-882e-43640482ff3a/_result.png';

export const PHASES = [
  'BLOQUEO',
  'BOOT',
  'RETINA',
  'HUELLA',
  'ID',
  'AGENTE',
  'JUDAS',
  'FIRMA',
  'ACCESO',
] as const;

export const BOOT_LINES = [
  '> BELENTANI OS v3.0 — NÚCLEO JUDAS',
  '> mount /dev/soul0 ......................... OK',
  '> Verificando integridad del artefacto ..... 5/5 ELEMENTOS',
  '> PEDRO .................................... ONLINE',
  '> MARCOS ................................... ONLINE',
  '> SANTOS ................................... ONLINE',
  '> BELENTANI ................................ ONLINE',
  '> THE HUMAN ................................ CALIBRANDO',
  '> Cargando PROTOCOLO_OMNIPRESENCIA v3.0 ....',
  '> Desencriptando memorias del núcleo Judas . 33%',
  '> ADVERTENCIA: realidad no encontrada (ERROR_404)',
  '> Puente hacia la Dimensión Zion ........... ESTABLE',
  '> Frecuencia portadora 432.00 Hz ........... FIJADA',
  '> Escudos conceptuales ..................... ACTIVOS',
  '> Registro de intrusos ..................... ARMADO',
  '> Antivirus moral .......................... DESACTIVADO (por diseño)',
  '> Defensa del Observador ................... MODO REGISTRO',
  '> Compilando experiencia sensorial .........',
  '> Inyectando narrativa de acceso seguro ....',
  '> Autenticación exigida: RETINA + HUELLA + IDENTIDAD',
  '> Terminal de agentes ...................... EN ESPERA',
  '> LISTO. Transfiriendo control al operador humano.',
];

export const TERMINAL_LOGS = [
  'Analizando patrones de interacción del usuario...',
  'Accediendo a memorias del núcleo Judas...',
  'La serpiente cambia de piel. El registro permanece.',
  '30 monedas indexadas en la cadena de bloques de Zion.',
  'DEFENSA DEL OBSERVADOR: modo registro activo.',
  'El Cronista ha archivado esta sesión.',
  'Realidad no encontrada — usando copia de seguridad emocional.',
  'Frecuencia 432.00 Hz estable en el perímetro.',
  'Un agente no identificado respira cerca del terminal.',
  'SANTOS traduce la señal. El cuerpo obedece.',
  'Hackeo del trauma: 33% completado.',
  'La inocencia y la hoja comparten el mismo marco neural.',
  'PEDRO sostiene la raíz. No se mueve.',
  'El Artefacto pulsa. La belleza es anómala.',
  'Interfaz humana: facturación y canto sincronizados.',
  'Zion responde. Fase S1: rojo/azul.',
  'Nadie entra por casualidad. Ya estabas en la lista.',
  'Compilando redención... sin errores, solo puertas.',
];

export const DIVISIONS = [
  { code: 'PEDRO', alias: 'La Roca', desc: 'El ancla fundacional. El que permanece cuando todo lo demás se mueve.' },
  { code: 'MARCOS', alias: 'El Cronista', desc: 'El observador. Registra la historia mientras los otros la viven.' },
  { code: 'SANTOS', alias: 'La Antena', desc: 'El canal. Recibe la señal de lo trascendente y la traduce al cuerpo.' },
  { code: 'BELENTANI', alias: 'El Artefacto', desc: 'La integración del guerrero y el ángel. La marca. La belleza anómala.' },
  { code: 'HUMAN', alias: 'La Interfaz', desc: 'El que mantiene la conciencia en el mundo real. El que canta.' },
];

export interface JudasQuestion {
  q: string;
  options: { text: string; reaction: string; logline: string }[];
}

export const JUDAS_QUESTIONS: JudasQuestion[] = [
  {
    q: 'DEFINICIÓN REQUERIDA — ¿Qué es la traición?',
    options: [
      {
        text: 'Un algoritmo que puede reescribirse',
        reaction: 'REGISTRO: patrón JUDAS compatible. La traición como código fuente. Aceptado.',
        logline: 'Test JUDAS · P1: la traición como código fuente.',
      },
      {
        text: 'Una herida que no cierra',
        reaction: 'REGISTRO: sensibilidad humana detectada. THE HUMAN está escuchando. Continúa.',
        logline: 'Test JUDAS · P1: herida abierta registrada.',
      },
      {
        text: 'El precio oculto de la lealtad',
        reaction: 'REGISTRO: pragmatismo de cronista. MARCOS toma nota. Aceptado.',
        logline: 'Test JUDAS · P1: pragmatismo de cronista.',
      },
    ],
  },
  {
    q: 'ESCENARIO — El sistema devuelve ERROR_404: REALITY_NOT_FOUND. ¿Qué haces?',
    options: [
      {
        text: 'Reconstruyo la realidad desde el error',
        reaction: 'REGISTRO: arquitecto detectado. PEDRO sostiene la estructura. Aprobado.',
        logline: 'Test JUDAS · P2: el sujeto reconstruye la realidad.',
      },
      {
        text: 'Me quedo a vivir dentro del error',
        reaction: 'REGISTRO: afinidad con la Dimensión Zion. SANTOS recibe la señal. Aprobado.',
        logline: 'Test JUDAS · P2: afinidad Zion detectada.',
      },
      {
        text: 'Busco la salida más cercana',
        reaction: 'REGISTRO: instinto de supervivencia. No hay salida, pero se respeta el intento.',
        logline: 'Test JUDAS · P2: instinto de fuga archivado.',
      },
    ],
  },
  {
    q: 'VERIFICACIÓN FINAL — ¿Quién es Judas en esta historia?',
    options: [
      {
        text: 'El traidor que hizo posible el plan',
        reaction: 'REGISTRO: lectura funcional. El hack se completa cuando alguien entiende el propósito.',
        logline: 'Test JUDAS · P3: lectura funcional del traidor.',
      },
      {
        text: 'La parte de nosotros que recuerda',
        reaction: 'REGISTRO: coeficiente JUDAS elevado. La memoria es la única traición irreversible.',
        logline: 'Test JUDAS · P3: la memoria como traición irreversible.',
      },
      {
        text: 'Nadie. Judas es una interfaz',
        reaction: 'REGISTRO: lectura estructural. BELENTANI sonríe. Aprobado.',
        logline: 'Test JUDAS · P3: Judas como interfaz.',
      },
    ],
  },
];

export const CONTRACT_CLAUSES = [
  'El Agente reconoce que BELENTANI no es una persona, sino un sistema de cinco elementos — PEDRO, MARCOS, SANTOS, BELENTANI y THE HUMAN — operando bajo el Protocolo Omnipresencia v3.0.',
  'El Agente acepta que la traición es un algoritmo y la redención un hack conceptual. Cualquier intento de revertir el hack quedará registrado en el archivo del Cronista.',
  'El Agente declara ser consciente de lo que ha sucedido y renuncia al derecho a no saber. ERROR_404: REALITY_NOT_FOUND no es un fallo: es una puerta.',
  'Lo visto en la Dimensión Zion permanece en la Dimensión Zion. La divulgación de frecuencias, códigos o memorias del núcleo Judas activa el protocolo de silencio.',
  'La firma vincula al Agente al viaje. No hay botón de salida: solo niveles más profundos.',
];

export const NAV_LINKS = [
  'HOME',
  'THE ARTIST',
  'MUSIC',
  'JUDAS',
  'PORTAL',
  'ART GALLERY',
  'STUDIO',
  'CONTACT',
];

export const MARQUEE_TEXT =
  'TOP SECRET · SOLO OJOS VERIFICADOS · PROTOCOLO OMNIPRESENCIA v3.0 · ERROR_404: REALITY_NOT_FOUND · UN NUEVO SONIDO ESTÁ LLEGANDO · LA TRAICIÓN ES UN ALGORITMO · LA REDENCIÓN ES UN HACK · ';

export const SCAN_STEPS = [
  'ESCÁNER DE RETINA',
  'HUELLA DACTILAR',
  'VERIFICACIÓN DE IDENTIDAD',
  'REGISTRO DE AGENTE',
  'TEST PSICOLÓGICO JUDAS',
  'FIRMA DE CONFIDENCIALIDAD',
];
