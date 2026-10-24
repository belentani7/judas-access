# BELENTANI — JUDAS ACCESS

**Un rito de entrada a THE JUDAS EXPERIENCE.** Interfaz audiovisual inmersiva de nueve fases: pantalla de bloqueo, arranque, pruebas de retina, huella y documento **ficticias**, creación de alias, test narrativo, sello dibujado y acceso al viaje de Zion.

Este repositorio es el módulo de **acceso artístico**, independiente del hub WebGL `judas-experience` y sus variantes antiguas. No se fusionan ni sustituyen otros productos.

## Funciones reales

- Nueve fases interactivas, transiciones, efectos audiovisuales, terminal escénico y viajes narrativos existentes.
- Escáneres de retina, huella e identidad que son **minijuegos visuales**. No capturan imágenes de cámara, huellas, retina ni datos biométricos.
- Generación de un alias artístico y selección de división narrativa. El nombre real es opcional, solo de sesión y **nunca se escribe al almacenamiento local**.
- Un sello dibujado con canvas como parte de la dramaturgia; **no es una firma legal ni se almacena después de cerrar sesión**.
- Continuidad artística de alias durante hasta 24 horas mediante `localStorage`; acceso directo o reinicio de la historia. No equivale a autenticación real.
- Preserva las escenas `Journey`, `PlanetViewer`, `Hyperspace`, `EscapeRoom`, `ArchiveScene`, `VoiceCore`.

## Inicio y pruebas

Node 22 recomendado; el proyecto contiene `package-lock.json`.

    npm ci --no-audit --no-fund
    npm run dev

Abrir el servidor local de Vite indicado en la consola. Para verificar la entrega:

    npm run test
    npm run typecheck
    npm run build

Los tests comprueban existencia de las nueve etapas, viajes y módulos, además de la reducción de datos persistidos y los textos de privacidad. CI exige ejecución de tests, compilación tipada y build Vite, **sin usar opciones que salten silenciosamente las pruebas**.

## Privacidad y límites

El almacenamiento del navegador se restringe a un alias artístico, división, ID narrativo, código de continuidad y fecha, por 24 horas. La nueva versión purga registros anteriores que contengan nombre real o firma dibujada, en lugar de reutilizar datos heredados sensibles. Puedes reiniciar el protocolo para borrar el registro local. Las ilustraciones y sonidos pueden proceder de recursos públicos identificados en el código y la página incluye tipografías externas: revisa sus propias políticas al alojar el sitio.

No se hace identificación facial, reconocimiento biométrico, análisis psicológico, firma electrónica válida, verificación de edad, control de acceso a servidores, seguimiento comercial ni envío de identidad a un backend en este módulo. La interfaz de acceso es **ficción interactiva**, no una barrera de seguridad para contenido protegido.

## Identidad y propuesta

Fondo casi negro, rojo Judas, señales frías y estética de terminal de ficción. La marca, sus escenarios y las fases existentes se conservan sin eliminar funcionalidades. Los nuevos avisos evitan que se confunda un ritual artístico con una autorización legal o con controles biométricos reales.

**Estado:** implementación de privacidad y contrato de pruebas guardados en una rama de publicación. No afirmar despliegue ni tests aprobados hasta tener un runner ejecutado y comprobar la experiencia completa sobre una URL accesible.


## Skin del universo (OMEGA v1.0)

El módulo carga `src/styles/artist-skin.css` tras `index.css` y opta al contrato
`data-bel-skin="omega"`. La copia procede de `belentani-design-system/artist-skin.css`.
Esto incorpora tokens de marca y componentes opt-in `bel-*` **sin cambiar** la
narrativa ni los nueve capítulos. `Syncopate` sigue siendo una variación teatral
local; se reserva `Orbitron` para nuevas piezas del sistema compartido. La migración
visual completa y la comprobación en navegador no se dan por concluidas.
