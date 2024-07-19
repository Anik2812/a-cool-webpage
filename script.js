const canvas = document.getElementById('ecosystem');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let lifeforms = [];
let currentEmotion = null;
const emotions = {
    joy: { color: '#FFD700', speed: 2, size: 1.2 },
    sadness: { color: '#4169E1', speed: 0.5, size: 0.8 },
    anger: { color: '#FF4500', speed: 3, size: 1.5 },
    fear: { color: '#800080', speed: 4, size: 0.6 },
    love: { color: '#FF69B4', speed: 1, size: 1 }
};

class Lifeform {
    constructor(x, y, emotion) {
        this.x = x;
        this.y = y;
        this.emotion = emotion;
        this.size = Math.random() * 20 + 10;
        this.speedX = (Math.random() - 0.5) * emotions[emotion].speed;
        this.speedY = (Math.random() - 0.5) * emotions[emotion].speed;
        this.lifespan = 600;
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;
        this.lifespan--;

        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1;
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1;

        this.size *= 0.999;
    }

    draw() {
        ctx.fillStyle = emotions[this.emotion].color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * emotions[this.emotion].size, 0, Math.PI * 2);
        ctx.fill();
    }
}

function animate() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    lifeforms = lifeforms.filter(life => life.lifespan > 0);

    lifeforms.forEach(life => {
        life.update();
        life.draw();
    });

    document.getElementById('lifeform-count').textContent = lifeforms.length;

    requestAnimationFrame(animate);
}

canvas.addEventListener('mousemove', (event) => {
    if (currentEmotion && Math.random() < 0.1) {
        lifeforms.push(new Lifeform(event.clientX, event.clientY, currentEmotion));
    }
});

canvas.addEventListener('click', (event) => {
    if (currentEmotion) {
        for (let i = 0; i < 5; i++) {
            lifeforms.push(new Lifeform(event.clientX, event.clientY, currentEmotion));
        }
    }
});

document.querySelectorAll('.emotion').forEach(button => {
    button.addEventListener('click', () => {
        currentEmotion = button.dataset.emotion;
        document.querySelectorAll('.emotion').forEach(btn => btn.classList.remove('active'));
        button.classList.add('active');
        document.getElementById('current-emotion').textContent = currentEmotion;
    });
});

window.addEventListener('resize', () => {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
});

animate();