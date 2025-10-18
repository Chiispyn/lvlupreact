// level-up-gaming-backend/src/data/videoData.ts

export interface Video {
    id: string;
    title: string;
    embedUrl: string; // Almacenará el código <iframe> completo
    isFeatured: boolean; 
}

// 🚨 Lista final de videos destacados para la Experiencia 2
export let mockVideos: Video[] = [
    { 
        id: 'v1', 
        title: '7 trucos para optimizar tu PC Gamer', 
        embedUrl: '<iframe width="560" height="315" src="https://www.youtube.com/embed/Hg_RGhCqqcM?si=0Ya-uLxbGLM1G7Ka" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>', 
        isFeatured: true 
    },
    { 
        id: 'v2', 
        title: 'Como armar tu PC Gamer 2025', 
        embedUrl: '<iframe width="560" height="315" src="https://www.youtube.com/embed/VhUyEgSiUaw?si=lXKV8RrmRn9DDg4C" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>', 
        isFeatured: true 
    },
    // Mantenemos un video no destacado para la gestión CRUD
    { 
        id: 'v3', 
        title: 'Top 5: Auriculares Gaming 2025', 
        embedUrl: '<iframe width="560" height="315" src="https://www.youtube.com/embed/6iW_iM-4T_0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>', 
        isFeatured: false 
    },
];