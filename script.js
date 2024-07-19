const canvas = document.getElementById('ecosystem');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let lifeforms = [];
let currentEmotion = null;
let ecosystemHealth = 100;
const emotions = {
    joy: { color: '#FFD700', speed: 2, size: 1.2, particleColor: '#FFFF00' },
    sadness: { color: '#4169E1', speed: 0.5, size: 0.8, particleColor: '#87CEEB' },
    anger: { color: '#FF4500', speed: 3, size: 1.5, particleColor: '#FF6347' },
    fear: { color: '#800080', speed: 4, size: 0.6, particleColor: '#9370DB' },
    love: { color: '#FF69B4', speed: 1, size: 1, particleColor: '#FF1493' }
};

class Lifeform {
    constructor(x, y, emotion) {
        this.x = x;
        this.y = y;
        this.emotion = emotion;
        this.size = Math.random() * 30 + 15;
        this.speedX = (Math.random() - 0.5) * emotions[emotion].speed * 2;
        this.speedY = (Math.random() - 0.5) * emotions[emotion].speed * 2;
        this.lifespan = 1000;
        this.maxLifespan = 1000;
        this.angle = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.1;
    }

    update() {
        this.x += Math.sin(this.angle) * this.speedX;
        this.y += Math.cos(this.angle) * this.speedY;
        this.angle += this.rotationSpeed;
        this.lifespan--;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        this.size *= 0.999;

        // Interaction with other lifeforms
        lifeforms.forEach(other => {
            if (other !== this) {
                const dx = other.x - this.x;
                const dy = other.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < this.size + other.size) {
                    this.speedX -= dx * 0.001;
                    this.speedY -= dy * 0.001;
                    other.speedX += dx * 0.001;
                    other.speedY += dy * 0.001;

                    if (this.emotion !== other.emotion) {
                        this.lifespan -= 5;
                        other.lifespan -= 5;
                    } else {
                        this.lifespan += 2;
                        other.lifespan += 2;
                    }
                }
            }
        });
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.fillStyle = emotions[this.emotion].color;
        ctx.globalAlpha = this.lifespan / this.maxLifespan;

        // Draw a more complex shape
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2;
            const radius = i % 2 === 0 ? this.size : this.size / 2;
            ctx.lineTo(
                Math.cos(angle) * radius * emotions[this.emotion].size,
                Math.sin(angle) * radius * emotions[this.emotion].size
            );
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    lifeforms = lifeforms.filter(life => life.lifespan > 0);

    lifeforms.forEach(life => {
        life.update();
        life.draw();
    });

    updateEcosystemHealth();
    updateDominantEmotion();

    document.getElementById('lifeform-count').textContent = lifeforms.length;
    document.getElementById('ecosystem-health').textContent = `${Math.round(ecosystemHealth)}%`;

    requestAnimationFrame(animate);
}

function updateEcosystemHealth() {
    const idealLifeformCount = 100;
    const healthChange = (lifeforms.length - idealLifeformCount) * 0.1;
    ecosystemHealth = Math.max(0, Math.min(100, ecosystemHealth - healthChange));

    if (ecosystemHealth < 20) {
        addEventMessage("Ecosystem critical! Inject some positive emotions!");
    } else if (ecosystemHealth > 80) {
        addEventMessage("Ecosystem thriving! Well done!");
    }
}

function updateDominantEmotion() {
    const emotionCounts = {};
    lifeforms.forEach(life => {
        emotionCounts[life.emotion] = (emotionCounts[life.emotion] || 0) + 1;
    });

    let dominantEmotion = 'None';
    let maxCount = 0;
    for (const [emotion, count] of Object.entries(emotionCounts)) {
        if (count > maxCount) {
            maxCount = count;
            dominantEmotion = emotion;
        }
    }

    document.getElementById('dominant-emotion').textContent = dominantEmotion;
}

canvas.addEventListener('mousemove', (event) => {
    if (currentEmotion && Math.random() < 0.1) {
        spawnLifeform(event.clientX, event.clientY);
    }
});

canvas.addEventListener('click', (event) => {
    if (currentEmotion) {
        for (let i = 0; i < 10; i++) {
            spawnLifeform(event.clientX, event.clientY);
        }
        createParticleExplosion(event.clientX, event.clientY);
    }
});

function spawnLifeform(x, y) {
    const lifeform = new Lifeform(x, y, currentEmotion);
    lifeforms.push(lifeform);
    gsap.from(lifeform, {
        size: 0,
        duration: 0.5,
        ease: "elastic.out(1, 0.3)"
    });
}

document.querySelectorAll('.emotion').forEach(button => {
    button.addEventListener('click', () => {
        currentEmotion = button.dataset.emotion;
        document.querySelectorAll('.emotion').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        addEventMessage(`Selected emotion: ${currentEmotion}`);
    });
});

function addEventMessage(message) {
    const eventLog = document.getElementById('event-log');
    const messageElement = document.createElement('div');
    messageElement.classList.add('event-message');
    messageElement.textContent = message;
    eventLog.appendChild(messageElement);

    setTimeout(() => {
        messageElement.classList.add('show');
    }, 10);

    setTimeout(() => {
        messageElement.classList.remove('show');
        setTimeout(() => {
            eventLog.removeChild(messageElement);
        }, 500);
    }, 3000);
}

function createParticleExplosion(x, y) {
    const particleCount = 50;
    const container = document.getElementById('particle-container');

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        container.appendChild(particle);

        const size = Math.random() * 10 + 5;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 5 + 2;

        gsap.set(particle, {
            x: x,
            y: y,
            width: size,
            height: size,
            backgroundColor: emotions[currentEmotion].particleColor
        });

        gsap.to(particle, {
            x: x + Math.cos(angle) * 100 * velocity,
            y: y + Math.sin(angle) * 100 * velocity,
            opacity: 0,
            duration: Math.random() * 1 + 0.5,
            ease: "power2.out",
            onComplete: () => {
                container.removeChild(particle);
            }
        });
    }
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animate();