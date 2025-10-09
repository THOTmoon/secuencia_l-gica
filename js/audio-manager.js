/**
 * audio-manager.js
 * 
 * Módulo encargado de la gestión de audio del juego.
 * - Carga y reproduce efectos de sonido (SFX)
 * - Controla la música de fondo
 * - Gestiona el estado de mute/unmute global
 * - Utiliza el Event Emitter para comunicación con otros módulos
 */

// Dependencia: event-emitter.js (debe cargarse antes)
class AudioManager {
    constructor(eventEmitter) {
        this.eventEmitter = eventEmitter;
        this.sounds = new Map(); // Almacena instancias de Audio
        this.music = null; // Instancia de música de fondo
        this.isMuted = false; // Estado global de mute
        this.volume = 1.0; // Volumen global (0.0 a 1.0)

        // Inicializa los sonidos del juego
        this.initSounds();
        
        // Escucha eventos globales de mute/unmute
        this.eventEmitter.on('toggle-mute', () => this.toggleMute());
        this.eventEmitter.on('set-volume', (newVolume) => this.setVolume(newVolume));
    }

    /**
     * Inicializa los sonidos del juego desde el HTML
     */
    initSounds() {
        // Sonidos SFX (Efectos de sonido)
        // Agregamos 'victoria-nivel' a la lista
        const sfxNames = ['inicio', 'acierto', 'error', 'voltear', 'victoria-nivel']; // <-- Añadido 'victoria-nivel'
        sfxNames.forEach(name => {
            const element = document.getElementById(`sonido-${name}`);
            if (element) {
                this.sounds.set(name, element);
                // --- CORRECCIÓN: Verificar si 'element' es null antes de aplicar settings ---
                if (element) {
                    this.applyGlobalSettings(element);
                }
                // --- FIN CORRECCIÓN ---
            } else {
                console.warn(`AudioManager: Elemento sonido-${name} no encontrado en el DOM.`);
                // Opcional: podrías crear un objeto de audio vacío o usar un fallback aquí
                // this.sounds.set(name, null); // o un audio dummy
            }
        });

        // Música de fondo
        const musicElement = document.getElementById('musica-fondo');
        if (musicElement) {
            this.music = musicElement;
            // --- CORRECCIÓN: Verificar si 'musicElement' es null antes de aplicar settings ---
            if (this.music) {
                 this.applyGlobalSettings(this.music);
            }
            // --- FIN CORRECCIÓN ---
        } else {
            console.warn('AudioManager: Elemento musica-fondo no encontrado en el DOM.');
        }
    }

    /**
     * Aplica configuraciones globales (volumen, mute) a un elemento de audio
     */
    applyGlobalSettings(audioElement) {
        // --- CORRECCIÓN: Verificar si 'audioElement' es null al inicio ---
        if (!audioElement) {
             console.warn('AudioManager: Intentando aplicar settings a un elemento de audio nulo.');
             return;
        }
        // --- FIN CORRECCIÓN ---
        audioElement.volume = this.volume;
        audioElement.muted = this.isMuted;
    }

    /**
     * Reproduce un sonido SFX
     * @param {string} name - Nombre del sonido (e.g., 'acierto', 'error', 'victoria-nivel')
     */
    playSound(name) {
        if (this.isMuted) return; // No reproduce si está muteado

        const sound = this.sounds.get(name);
        // --- CORRECCIÓN: Verificar si 'sound' es null antes de reproducir ---
        if (sound) {
            sound.currentTime = 0; // Reinicia el sonido desde el principio
            sound.play()
                .then(() => {
                    // console.log(`Sonido reproducido: ${name}`);
                })
                .catch(error => {
                    console.warn(`Error al reproducir sonido '${name}':`, error);
                });
        } else {
            console.warn(`Sonido no encontrado o no cargado: ${name}`);
        }
        // --- FIN CORRECCIÓN ---
    }

    /**
     * Reproduce o detiene la música de fondo
     * @param {boolean} play - true para reproducir, false para detener
     */
    toggleMusic(play = true) {
        // --- CORRECCIÓN: Verificar si 'this.music' es null antes de usarlo ---
        if (!this.music) {
             console.warn('AudioManager: Música de fondo no encontrada o no cargada.');
             return;
        }
        // --- FIN CORRECCIÓN ---
        if (play) {
            this.music.currentTime = 0; // Reinicia desde el principio
            this.music.play()
                .then(() => {
                    // console.log('Música de fondo iniciada');
                })
                .catch(error => {
                    console.warn('Error al reproducir música de fondo:', error);
                });
        } else {
            this.music.pause();
            this.music.currentTime = 0;
            // console.log('Música de fondo detenida');
        }
    }

    /**
     * Activa o desactiva el sonido global del juego
     */
    toggleMute() {
        this.isMuted = !this.isMuted;
        // Aplica el estado de mute a todos los elementos de audio
        this.sounds.forEach(sound => {
            // --- CORRECCIÓN: Verificar si 'sound' es null antes de usarlo ---
            if (sound) {
                sound.muted = this.isMuted;
            }
            // --- FIN CORRECCIÓN ---
        });
        // --- CORRECCIÓN: Verificar si 'this.music' es null antes de usarlo ---
        if (this.music) {
             this.music.muted = this.isMuted;
        }
        // --- FIN CORRECCIÓN ---

        // Emite evento para que otros módulos (UI) actualicen su estado
        this.eventEmitter.emit('mute-changed', this.isMuted);
        console.log(`AudioManager: Sonido ${this.isMuted ? 'MUTEADO' : 'ACTIVADO'}`);
    }

    initSounds() {
    // Sonidos SFX (Efectos de sonido)
    const sfxNames = ['inicio', 'acierto', 'error', 'voltear', 'victoria-nivel'];
    sfxNames.forEach(name => {
        const element = document.getElementById(`sonido-${name}`);
        if (element) {
            this.sounds.set(name, element);
            if (element) {
                this.applyGlobalSettings(element);
            }
        } else {
            console.warn(`AudioManager: Elemento sonido-${name} no encontrado en el DOM.`);
        }
    });

    // Música de fondo - VOLUMEN AL 50%
    const musicElement = document.getElementById('musica-fondo');
    if (musicElement) {
        this.music = musicElement;
        
        // PRIMERO aplica configuraciones globales (mute, etc.)
        this.applyGlobalSettings(this.music);
        
        // LUEGO establece el volumen específico para música (esto sobrescribe el volumen global)
        this.music.volume = 0.2;
        
        console.log('AudioManager: Volumen de música establecido al 20%');
    } else {
        console.warn('AudioManager: Elemento musica-fondo no encontrado en el DOM.');
    }
}

    /**
     * Devuelve el estado actual de mute
     */
    getMuteStatus() {
        return this.isMuted;
    }

    /**
     * Devuelve el volumen actual
     */
    getVolume() {
        return this.volume;
    }
}

// El módulo espera que Event Emitter esté disponible globalmente o previamente cargado
// Se exporta la clase para su uso en main.js
window.AudioManager = AudioManager;