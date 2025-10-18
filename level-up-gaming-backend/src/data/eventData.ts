// level-up-gaming-backend/src/data/eventData.ts

export interface Event {
    id: string;
    title: string;
    date: string; // YYYY-MM-DD
    time: string; // HH:MM
    location: string;
    mapEmbed: string;
}

export let mockEvents: Event[] = [
    {
        id: 'e1',
        title: 'Torneo de eSports Level-Up (League of Legends)',
        date: '2025-11-10',
        time: '18:00',
        location: 'Auditorio Duoc UC Sede Concepción', // 🚨 UBICACIÓN ACTUALIZADA
        // 🚨 URL de ejemplo para el iframe (usaremos una URL de incrustación de ejemplo)
        mapEmbed: 'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3192.179836934415!2d-73.0647610255395!3d-36.79547359546272!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9669b61405e6b0a7%3A0xf6398909890a5d5!2sAuditorio%20Duoc%20UC!5e0!3m2!1ses-419!2scl!4v1678822000000!5m2!1ses-419!2scl',
    },
    {
        id: 'e2',
        title: 'Feria de Tecnología Gaming (LAN Party)',
        date: '2025-12-05',
        time: '10:00',
        location: 'Estadio O’Higgins, Concepción',
        mapEmbed: '', // Simulación de campo vacío
    },
];