import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

window.Pusher = Pusher;

const reverbKey    = import.meta.env.VITE_REVERB_APP_KEY;
const reverbHost   = import.meta.env.VITE_REVERB_HOST   ?? 'localhost';
const reverbPort   = import.meta.env.VITE_REVERB_PORT   ?? '8081';
const reverbScheme = import.meta.env.VITE_REVERB_SCHEME ?? 'http';

console.log('🔌 Initializing Laravel Echo:', {
    key: reverbKey,
    host: reverbHost,
    port: reverbPort,
    scheme: reverbScheme,
});

window.Echo = new Echo({
    broadcaster:       'reverb',
    key:               reverbKey,
    wsHost:            reverbHost,
    wsPort:            parseInt(reverbPort),
    wssPort:           parseInt(reverbPort),
    forceTLS:          reverbScheme === 'https',
    enabledTransports: ['ws', 'wss'],
    disableStats:      true,
});

window.Echo.connector.pusher.connection.bind('connecting',    () => console.log('⏳ Connecting to Reverb...'));
window.Echo.connector.pusher.connection.bind('connected',     () => console.log('✅ Reverb connected!', window.Echo.connector.pusher.connection.socket_id));
window.Echo.connector.pusher.connection.bind('disconnected',  () => console.log('❌ Reverb disconnected'));
window.Echo.connector.pusher.connection.bind('error',        (err) => console.error('❌ Reverb error:', err));