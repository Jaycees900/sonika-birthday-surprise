document.addEventListener('DOMContentLoaded', () => {
    const bgMusic = document.getElementById('bg-music');
    bgMusic.volume = 0.3; // Low volume
    bgMusic.play().catch(() => {}); // Autoplay may be blocked

    const form = document.getElementById('wish-form');
    const wishDisplay = document.getElementById('wish-display');
    const cakeSection = document.getElementById('cake-section');
    const blowBtn = document.getElementById('blow-btn');
    const micStatus = document.getElementById('mic-status');
    const cake = document.getElementById('cake');
    const knife = document.getElementById('knife');
    const candles = document.querySelectorAll('.candle');

    let audioContext, analyser, microphone, dataArray;
    let candlesBlown = false;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('name').value;
        const message = document.getElementById('message').value;
        
        document.getElementById('display-name').textContent = name;
        document.getElementById('display-message').textContent = message;
        
        gsap.to(form, { opacity: 0, duration: 0.5, onComplete: () => {
            form.classList.add('hidden');
            wishDisplay.classList.remove('hidden');
            gsap.from(wishDisplay, { opacity: 0, y: 50, duration: 1 });
        }});
        
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
    });

    document.getElementById('next-btn').addEventListener('click', () => {
        gsap.to(wishDisplay, { opacity: 0, duration: 0.5, onComplete: () => {
            wishDisplay.classList.add('hidden');
            cakeSection.classList.remove('hidden');
            gsap.from(cakeSection, { opacity: 0, scale: 0.8, duration: 1 });
        }});
    });

    blowBtn.addEventListener('click', async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            audioContext = new (window.AudioContext || window.webkitAudioContext)();
            analyser = audioContext.createAnalyser();
            microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            
            micStatus.textContent = 'Blow into the mic to extinguish candles!';
            blowBtn.disabled = true;
            
            const checkVolume = () => {
                if (candlesBlown) return;
                analyser.getByteFrequencyData(dataArray);
                const volume = dataArray.reduce((a, b) => a + b) / dataArray.length;
                if (volume > 50) { // Threshold for "blow"
                    extinguishCandles();
                }
                requestAnimationFrame(checkVolume);
            };
            checkVolume();
        } catch (err) {
            micStatus.textContent = 'Mic access denied. Try again!';
        }
    });

    function extinguishCandles() {
        candlesBlown = true;
        candles.forEach(candle => candle.classList.add('blown'));
        micStatus.textContent = 'Candles blown! Now cutting the cake...';
        setTimeout(cutCake, 1000);
    }

    function cutCake() {
        knife.classList.remove('hidden');
        gsap.to(knife, { className: 'cut', duration: 1, ease: 'power2.inOut' });
        gsap.to(cake, { scaleX: 1.2, duration: 1, yoyo: true, repeat: 1, ease: 'bounce' });
        setTimeout(() => {
            confetti({ particleCount: 200, spread: 100 });
            micStatus.textContent = 'Cake cut! Happy Birthday, Sanuu! 🎂';
        }, 1500);
    }
});
