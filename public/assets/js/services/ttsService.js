// Enhanced TTS Service with multiple voice options and better reliability
class TTSService {
    constructor() {
        this.synth = window.speechSynthesis;
        this.currentUtterance = null;
        this.voices = [];
        this.initialized = false;
        
        // Initialize voices
        this.initializeVoices();
    }
    
    initializeVoices() {
        // Load voices immediately
        this.loadVoices();
        
        // Also listen for voice changes (some browsers load voices asynchronously)
        if (this.synth.onvoiceschanged !== undefined) {
            this.synth.onvoiceschanged = () => this.loadVoices();
        }
    }
    
    loadVoices() {
        this.voices = this.synth.getVoices();
        this.initialized = true;
        console.log('TTS: Loaded', this.voices.length, 'voices');
    }
    
    getBestEnglishVoice() {
        if (!this.initialized || this.voices.length === 0) {
            console.warn('TTS: No voices available');
            return null;
        }
        
        // Priority order for English voices
        const preferredVoices = [
            'Microsoft Zira Desktop', // Windows US English
            'Microsoft David Desktop', // Windows US English
            'Google US English',       // Chrome
            'Samantha',                // macOS US English
            'Alex',                    // macOS US English
            'Karen',                   // macOS US English
            'English (United States)', // Generic
            'English US',              // Generic
            'en-US',                   // Language code
            'en-GB',                   // UK English (fallback)
            'English'                  // Generic fallback
        ];
        
        // Try to find preferred voices first
        for (const preferred of preferredVoices) {
            const voice = this.voices.find(voice => 
                voice.name.includes(preferred) || 
                voice.lang.includes(preferred) ||
                voice.name.toLowerCase().includes('english')
            );
            if (voice) {
                console.log('TTS: Selected voice:', voice.name);
                return voice;
            }
        }
        
        // Fallback to any English voice
        const englishVoice = this.voices.find(voice => 
            voice.lang.startsWith('en-')
        );
        
        if (englishVoice) {
            console.log('TTS: Fallback voice:', englishVoice.name);
            return englishVoice;
        }
        
        // Last resort: use default voice
        console.warn('TTS: Using default voice, may not be English');
        return this.voices[0];
    }
    
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.synth) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }
            
            // Cancel any ongoing speech
            this.cancel();
            
            // Wait for voices to be loaded
            if (!this.initialized) {
                setTimeout(() => this.speak(text, options).then(resolve).catch(reject), 100);
                return;
            }
            
            const utterance = new SpeechSynthesisUtterance(text);
            
            // Configure utterance
            utterance.lang = 'en-US';
            utterance.rate = options.rate || 0.9;
            utterance.pitch = options.pitch || 1.0;
            utterance.volume = options.volume || 1.0;
            
            // Set the best available voice
            const voice = this.getBestEnglishVoice();
            if (voice) {
                utterance.voice = voice;
            }
            
            // Event handlers
            utterance.onstart = () => {
                console.log('TTS: Started speaking');
                if (options.onStart) options.onStart();
            };
            
            utterance.onend = () => {
                console.log('TTS: Finished speaking');
                this.currentUtterance = null;
                if (options.onEnd) options.onEnd();
                resolve();
            };
            
            utterance.onerror = (event) => {
                console.error('TTS: Error:', event);
                this.currentUtterance = null;
                if (options.onError) options.onError(event);
                reject(new Error('Speech synthesis failed'));
            };
            
            utterance.onpause = () => {
                console.log('TTS: Paused');
                if (options.onPause) options.onPause();
            };
            
            utterance.onresume = () => {
                console.log('TTS: Resumed');
                if (options.onResume) options.onResume();
            };
            
            // Store reference and speak
            this.currentUtterance = utterance;
            
            // Small delay to ensure proper initialization
            setTimeout(() => {
                try {
                    this.synth.speak(utterance);
                } catch (error) {
                    console.error('TTS: Failed to speak:', error);
                    reject(error);
                }
            }, 50);
        });
    }
    
    pause() {
        if (this.synth && this.synth.speaking) {
            this.synth.pause();
        }
    }
    
    resume() {
        if (this.synth && this.synth.paused) {
            this.synth.resume();
        }
    }
    
    cancel() {
        if (this.synth) {
            this.synth.cancel();
            this.currentUtterance = null;
        }
    }
    
    isSpeaking() {
        return this.synth && this.synth.speaking;
    }
    
    isPaused() {
        return this.synth && this.synth.paused;
    }
    
    getAvailableVoices() {
        return this.voices.map(voice => ({
            name: voice.name,
            lang: voice.lang,
            localService: voice.localService,
            isDefault: voice.default
        }));
    }
}

window.TTSService = TTSService;
