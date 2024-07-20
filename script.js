const canvas = document.getElementById('biome');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let entities = [];
let currentEmotion = null;
let evolutionStage = 1;
let balance = 50; // 0-100, 50 is perfect balance

const emotions = {
    joy: { color: '#FFD700', speed: 2, size: 1.2, particleColor: '#FFFF00' },
    sadness: { color: '#4169E1', speed: 0.5, size: 0.8, particleColor: '#87CEEB' },
    anger: { color: '#FF4500', speed: 3, size: 1.5, particleColor: '#FF6347' },
    fear: { color: '#800080', speed: 4, size: 0.6, particleColor: '#9370DB' },
    love: { color: '#FF69B4', speed: 1, size: 1, particleColor: '#FF1493' }
};

class Entity {
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

        entities.forEach(other => {
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
                        if (Math.random() < 0.001) this.evolve();
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

    evolve() {
        this.size *= 1.5;
        this.lifespan = this.maxLifespan;
        createParticleExplosion(this.x, this.y, this.emotion);
        showAchievement("Entity Evolved!");
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.03)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    entities = entities.filter(entity => entity.lifespan > 0);

    entities.forEach(entity => {
        entity.update();
        entity.draw();
    });

    updateBalance();
    updateDominantEmotion();
    checkEvolutionStage();

    document.getElementById('entity-count').textContent = entities.length;
    document.getElementById('evolution-stage').textContent = evolutionStage;

    requestAnimationFrame(animate);
}

function updateBalance() {
    const emotionCounts = {};
    entities.forEach(entity => {
        emotionCounts[entity.emotion] = (emotionCounts[entity.emotion] || 0) + 1;
    });

    const totalEntities = entities.length;
    const idealCount = totalEntities / Object.keys(emotions).length;
    
    let maxDifference = 0;
    for (const count of Object.values(emotionCounts)) {
        maxDifference = Math.max(maxDifference, Math.abs(count - idealCount));
    }

    balance = 100 - (maxDifference / idealCount) * 100;
    balance = Math.max(0, Math.min(100, balance));

    const balanceMeter = document.getElementById('balance-meter');
    balanceMeter.style.setProperty('--balance', `${balance}%`);
    balanceMeter.style.background = `linear-gradient(to right, 
        #ff0000 0%, #ff0000 ${balance}%, 
        #00ff00 ${balance}%, #00ff00 100%)`;
}

function updateDominantEmotion() {
    const emotionCounts = {};
    entities.forEach(entity => {
        emotionCounts[entity.emotion] = (emotionCounts[entity.emotion] || 0) + 1;
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

function checkEvolutionStage() {
    const newStage = Math.floor(entities.length / 100) + 1;
    if (newStage > evolutionStage) {
        evolutionStage = newStage;
        showAchievement(`Evolution Stage ${evolutionStage} Reached!`);
        updateGoal();
    }
}

function updateGoal() {
    const goals = [
        "Create a balanced ecosystem",
        "Evolve 10 entities",
        "Achieve perfect balance (100%)",
        "Reach 1000 entities",
        "Maintain balance above 80% for 1 minute"
    ];
    document.getElementById('current-goal').textContent = goals[Math.min(evolutionStage - 1, goals.length - 1)];
}

canvas.addEventListener('mousemove', (event) => {
    if (currentEmotion && Math.random() < 0.1) {
        spawnEntity(event.clientX, event.clientY);
    }
});

canvas.addEventListener('click', (event) => {
    if (currentEmotion) {
        for (let i = 0; i < 10; i++) {
            spawnEntity(event.clientX, event.clientY);
        }
        createParticleExplosion(event.clientX, event.clientY, currentEmotion);
    }
});

function spawnEntity(x, y) {
    const entity = new Entity(x, y, currentEmotion);
    entities.push(entity);
    gsap.from(entity, {
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
    });
});

function createParticleExplosion(x, y, emotion) {
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.classList.add('particle');
        document.body.appendChild(particle);

        const size = Math.random() * 10 + 5;
        const angle = Math.random() * Math.PI * 2;
        const velocity = Math.random() * 5 + 2;

        gsap.set(particle, {
            x: x,
            y: y,
            width: size,
            height: size,
            backgroundColor: emotions[emotion].particleColor
        });

        gsap.to(particle, {
            x: x + Math.cos(angle) * 100 * velocity,
            y: y + Math.sin(angle) * 100 * velocity,
            opacity: 0,
            duration: Math.random() * 1 + 0.5,
            ease: "power2.out",
            onComplete: () => {
                document.body.removeChild(particle);
            }
        });
    }
}

function showAchievement(message) {
    const achievementPopup = document.getElementById('achievement-popup');
    achievementPopup.textContent = message;
    achievementPopup.style.opacity = 1;
    setTimeout(() => {
        achievementPopup.style.opacity = 0;
    }, 3000);
}

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

updateGoal();
animate();