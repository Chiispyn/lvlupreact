// level-up-gaming-backend/src/data/blogData.ts

export interface BlogPost {
    id: string;
    title: string;
    excerpt: string;
    content: string; // Contenido completo y detallado
    imageUrl: string;
    author: string;
    createdAt: string;
}

export let mockBlogPosts: BlogPost[] = [
    {
        id: '1', 
        title: 'Los 5 Mejores Juegos de 2025: La Batalla Final por el GotY.',
        excerpt: 'Analizamos los lanzamientos más explosivos de la nueva era. Desde el épico regreso de sagas de rol hasta los shooters que dominarán la escena competitiva. ¿Vale la pena la espera? ¡Te lo contamos todo!',
        content: `
            <p class="text-white">La industria del gaming está entrando en una era dorada, y el 2025 promete ser un año de lanzamientos que redefinirán el género. Aquí, en Level-Up Gaming, hemos seleccionado los títulos que tienen el potencial de competir por el premio más grande: el Juego del Año (GotY).</p>
            
            <h4 class="mt-4" style="color: #1E90FF;">1. Chronos Gate: La Nueva Fantasía Épica</h4>
            <p class="text-white">Este RPG de mundo abierto no solo promete gráficos fotorrealistas, sino un sistema de combate que fusiona la acción rápida con la estrategia por turnos. La narrativa ramificada y las 300 horas de contenido principal lo convierten en el principal contendiente del género.</p>
            
            <h4 class="mt-4" style="color: #1E90FF;">2. Midnight Protocol (Shooter Táctico)</h4>
            <p class="text-white">El FPS que está revolucionando la escena competitiva. Su nuevo motor de destrucción y un sistema de clanes persistente aseguran una comunidad activa por años. Si buscas adrenalina y estrategia de equipo, esta es la elección.</p>

            <h4 class="mt-4" style="color: #1E90FF;">3. Elden Ring: Shadow of the Erdtree (Expansión)</h4>
            <p class="text-white">Aunque es una expansión, su tamaño y ambición superan a muchos juegos completos. FromSoftware ha prometido nuevos biomas, jefes de dificultad legendaria y una profundización en la historia que dejará a los fans sin aliento.</p>
            
            <p class="mt-4">
            <strong style="color: #39FF14;">Conclusión:</strong> El 2025 no es solo de secuelas; es de experiencias que exigen el máximo de tu hardware. ¡Prepara tus componentes!
            </p>
        `,
        imageUrl: '/images/mejores.png', 
        author: 'Leo "The Analyst"',
        createdAt: new Date(new Date().setMonth(new Date().getMonth() - 2)).toISOString(),
    },
    {
        id: '2',
        title: 'Guía Definitiva: Arma tu PC por Menos de $500K CLP (¡Potencia Garantizada!).',
        excerpt: 'Te enseñamos a maximizar el rendimiento con un presupuesto ajustado. La clave está en el procesador y encontrar componentes de segunda mano de calidad que te darán un rendimiento sorprendente.',
        content: `
            <p class="text-white">Armar un PC Gamer por menos de $500.000 CLP es un desafío que requiere astucia y conocimiento del mercado. Nuestro objetivo es alcanzar los 60 FPS estables en títulos AAA con configuraciones medias.</p>
            
            <h4 class="mt-4" style="color: #1E90FF;">Componentes Clave y Trucos de Ahorro</h4>
            <ul>
                <li class="text-white"><strong>CPU (Ahorro Inteligente):</strong> Un AMD Ryzen 5 3600 (usado, perfecto para 1080p) o un Core i3-12100F (nuevo) son ideales. No te excedas aquí.</li>
                <li class="text-white"><strong>GPU (La Inversión Principal):</strong> Busca tarjetas gráficas de segunda mano, como una NVIDIA GTX 1660 Super o una AMD RX 580. Son las reinas del presupuesto.</li>
                <li class="text-white"><strong>RAM:</strong> 16GB DDR4 a 3200MHz. Menos de esto es inaceptable para el gaming moderno.</li>
                <li class="text-white"><strong>Almacenamiento:</strong> 500GB SSD NVMe. La velocidad es más importante que la capacidad inicial.</li>
            </ul>
            
            <h4 class="mt-4" style="color: #1E90FF;">Errores a Evitar y Consejos de Montaje</h4>
            <p class="text-white">El error más común es comprar la fuente de poder (PSU) más barata. Una PSU certificada (80+ Bronze, 550W) es vital para la estabilidad. Además, asegúrate de que tu gabinete tenga buen flujo de aire, ¡o tus componentes se freirán en verano!</p>
            
            <p class="mt-4">
            <strong style="color: #39FF14;">Consejo Final:</strong> Si tu presupuesto es estricto, prioriza la CPU y la RAM; siempre puedes mejorar la tarjeta gráfica más adelante.
            </p>
        `,
        imageUrl: '/images/partes.png', 
        author: 'Dani "The Builder"',
        createdAt: new Date(new Date().setDate(new Date().getDate() - 10)).toISOString(),
    },
    {
        id: '3',
        title: 'PS5 Slim vs. Xbox Series X: ¿Cuál Consola Deberías Comprar en 2026?',
        excerpt: 'Comparamos el poder bruto, la librería exclusiva y el valor del servicio Game Pass frente a la retroalimentación háptica de Sony. El veredicto que necesitas antes de invertir.',
        content: `
            <p class="text-white">Ambas consolas representan el pináculo del gaming de salón, pero se dirigen a jugadores con prioridades distintas. La diferencia ya no es tanto de potencia bruta (ambas son excelentes), sino de ecosistema.</p>
            
            <h4 class="mt-4" style="color: #1E90FF;">Ventaja de Catálogo: PlayStation 5</h4>
            <p class="text-white">PS5 mantiene la corona de los exclusivos de un jugador, como *God of War*, *Horizon* y *Final Fantasy XVI*. El DualSense (con su gatillo adaptativo y retroalimentación háptica) ofrece una inmersión que Xbox aún no iguala.</p>
            
            <h4 class="mt-4" style="color: #1E90FF;">Ventaja de Valor: Xbox Series X</h4>
            <p class="text-white">Xbox se enfoca en el valor a largo plazo gracias a su Game Pass, que incluye todos los juegos de Microsoft desde el día de lanzamiento. Para el jugador que quiere la biblioteca más grande sin gastar una fortuna, Xbox es el ganador indiscutible.</p>
            
            <p class="mt-4">
            <strong style="color: #39FF14;">Veredicto Final:</strong> Si tu foco es la narrativa cinematográfica y las innovaciones del control, elige PS5. Si priorizas la cantidad de juegos disponibles y el juego online con amigos, Xbox Series X es la mejor opción.
            </p>
        `,
        imageUrl: '/images/tendencias.png',
        author: 'Sistema',
        createdAt: new Date().toISOString(),
    },
];