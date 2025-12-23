/* --- 1. Loading Screen --- */
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    loader.style.opacity = '0';
    setTimeout(() => {
        loader.style.display = 'none';
        initThreeJS(); // Start 3D animation after load
    }, 500);
});

/* --- 2. Custom Cursor Logic --- */
const cursor = document.querySelector('.cursor');
const follower = document.querySelector('.cursor-follower');
const links = document.querySelectorAll('a, button, .close-modal, input, textarea');

document.addEventListener('mousemove', (e) => {
    cursor.style.left = e.clientX + 'px';
    cursor.style.top = e.clientY + 'px';
    
    // Slight delay for follower
    setTimeout(() => {
        follower.style.left = e.clientX + 'px';
        follower.style.top = e.clientY + 'px';
    }, 50);
});

links.forEach(link => {
    link.addEventListener('mouseenter', () => {
        follower.classList.add('cursor-hover');
    });
    link.addEventListener('mouseleave', () => {
        follower.classList.remove('cursor-hover');
    });
});

/* --- 3. Three.js 3D Hero Section --- */
function initThreeJS() {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    
    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Create Particles
    const particleCount = 100; // Fewer particles, but connected
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(particleCount * 3);
    const velocities = [];

    for(let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 15; // Spread
        velocities.push((Math.random() - 0.5) * 0.02); // Random movement speed
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    
    // Material for Dots
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x64ffda,
        size: 0.05,
        transparent: true,
        opacity: 0.8
    });

    const particlesMesh = new THREE.Points(geometry, particlesMaterial);
    scene.add(particlesMesh);

    // Lines Material
    const lineMaterial = new THREE.LineBasicMaterial({
        color: 0x64ffda,
        transparent: true,
        opacity: 0.15
    });

    camera.position.z = 3;

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);

        const positions = particlesMesh.geometry.attributes.position.array;

        // Move Particles
        for(let i = 0; i < particleCount; i++) {
            // Update X, Y, Z
            positions[i*3] += velocities[i];     // X
            positions[i*3+1] += velocities[i];   // Y
            
            // Boundary Check (Bounce back)
            if(positions[i*3] > 7 || positions[i*3] < -7) velocities[i] = -velocities[i];
            if(positions[i*3+1] > 4 || positions[i*3+1] < -4) velocities[i] = -velocities[i];
        }
        particlesMesh.geometry.attributes.position.needsUpdate = true;

        // Draw Connecting Lines
        // Remove old lines
        scene.children.forEach(child => {
            if (child.type === "LineSegments") scene.remove(child);
        });

        const lineGeometry = new THREE.BufferGeometry();
        const linePositions = [];

        // Connect particles that are close
        for (let i = 0; i < particleCount; i++) {
            for (let j = i + 1; j < particleCount; j++) {
                const dist = Math.sqrt(
                    Math.pow(positions[i*3] - positions[j*3], 2) +
                    Math.pow(positions[i*3+1] - positions[j*3+1], 2) +
                    Math.pow(positions[i*3+2] - positions[j*3+2], 2)
                );

                if (dist < 1.5) { // Threshold for connection
                    linePositions.push(
                        positions[i*3], positions[i*3+1], positions[i*3+2],
                        positions[j*3], positions[j*3+1], positions[j*3+2]
                    );
                }
            }
        }

        lineGeometry.setAttribute('position', new THREE.Float32BufferAttribute(linePositions, 3));
        const lines = new THREE.LineSegments(lineGeometry, lineMaterial);
        scene.add(lines);

        // Gentle rotation
        scene.rotation.y += 0.001;

        renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });
}

/* --- 4. Scroll Animations & Skill Bars --- */
const observerOptions = { threshold: 0.2 };

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            
            // Animate Progress Bars if the skills section is visible
            if (entry.target.querySelector('.progress')) {
                const bars = entry.target.querySelectorAll('.skill-bar-container');
                bars.forEach(bar => {
                    const percent = bar.getAttribute('data-percent');
                    bar.querySelector('.progress').style.width = percent;
                });
            }
        }
    });
}, observerOptions);

document.querySelectorAll('.hidden-element, #skills').forEach((el) => {
    observer.observe(el);
});

/* --- 5. Project Filtering --- */
const filterBtns = document.querySelectorAll('.filter-btn');
const projectCards = document.querySelectorAll('.project-card');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class
        document.querySelector('.filter-btn.active').classList.remove('active');
        btn.classList.add('active');

        const filterValue = btn.getAttribute('data-filter');

        projectCards.forEach(card => {
            if (filterValue === 'all' || card.getAttribute('data-category') === filterValue) {
                card.style.display = 'block';
                setTimeout(() => card.style.opacity = '1', 100);
            } else {
                card.style.opacity = '0';
                setTimeout(() => card.style.display = 'none', 300);
            }
        });
    });
});

/* --- 6. Modals --- */
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    modal.style.display = 'flex';
}

function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Close modal if clicked outside content
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

/* --- 7. Leaflet Map (Hamilton, ON) --- */
// Centered roughly on McMaster University/Hamilton area
const map = L.map('map').setView([43.2609, -79.9192], 13);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

L.marker([43.2609, -79.9192]).addTo(map)
    .bindPopup('Kenil Sachapara<br>Hamilton, ON')
    .openPopup();

/* --- 8. Contact Form Validation --- */
document.getElementById('contactForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    
    if(name && email) {
        // Here you would typically send data to a backend
        // For demo, we show an alert
        const btn = this.querySelector('button');
        const originalText = btn.innerText;
        
        btn.innerText = 'Sent!';
        btn.style.background = 'var(--primary)';
        btn.style.color = 'var(--bg-color)';
        
        setTimeout(() => {
            this.reset();
            btn.innerText = originalText;
            btn.style.background = '';
            btn.style.color = '';
            alert(`Thanks ${name}! I'll get back to you at ${email} soon.`);
        }, 2000);
    }
});

/* --- 9. Mobile Menu --- */
const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');

hamburger.addEventListener('click', () => {
    navLinks.classList.toggle('nav-active');
});
