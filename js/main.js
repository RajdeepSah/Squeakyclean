/* =============================================
   SQUEAKY CLEAN — Main JS
   Three.js 3D hero + UI interactions
   ============================================= */

/* --- THREE.JS HERO SCENE --- */
(function initThreeScene() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas || typeof THREE === 'undefined') return;

  const W = window.innerWidth;
  const H = window.innerHeight;

  /* Renderer */
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  /* Scene & Camera */
  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 200);
  camera.position.set(0, 0, 14);

  /* Lights */
  scene.add(new THREE.AmbientLight(0x0a1830, 2));

  const light1 = new THREE.PointLight(0x06b6d4, 5, 40);
  light1.position.set(10, 6, 6);
  scene.add(light1);

  const light2 = new THREE.PointLight(0x0284c7, 3, 35);
  light2.position.set(-10, -4, 4);
  scene.add(light2);

  const light3 = new THREE.PointLight(0x22d3ee, 2, 30);
  light3.position.set(0, 10, 2);
  scene.add(light3);

  /* ---- SOAP BUBBLES ---- */
  const bubbles = [];
  const bubbleCount = window.innerWidth < 768 ? 14 : 28;

  for (let i = 0; i < bubbleCount; i++) {
    const r   = 0.14 + Math.random() * 0.65;
    const geo = new THREE.SphereGeometry(r, 32, 32);

    const hsl  = new THREE.Color().setHSL(0.53 + Math.random() * 0.14, 0.9, 0.65);
    const mat  = new THREE.MeshPhongMaterial({
      color:       hsl,
      transparent: true,
      opacity:     0.12 + Math.random() * 0.22,
      shininess:   220,
      specular:    new THREE.Color(1, 1, 1),
      side:        THREE.DoubleSide,
    });

    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(
      (Math.random() - 0.5) * 26,
      (Math.random() - 0.5) * 16 - 8,
      (Math.random() - 0.5) * 10 - 2
    );
    mesh.userData = {
      rise:    0.006 + Math.random() * 0.013,
      wobX:    (Math.random() - 0.5) * 0.018,
      wobZ:    (Math.random() - 0.5) * 0.009,
      phase:   Math.random() * Math.PI * 2,
      rotX:    (Math.random() - 0.5) * 0.012,
      rotY:    (Math.random() - 0.5) * 0.009,
    };
    scene.add(mesh);
    bubbles.push(mesh);
  }

  /* ---- CYAN SPARKLE PARTICLES ---- */
  const pCount = window.innerWidth < 768 ? 300 : 700;
  const pPos   = new Float32Array(pCount * 3);
  for (let i = 0; i < pCount; i++) {
    pPos[i * 3]     = (Math.random() - 0.5) * 32;
    pPos[i * 3 + 1] = (Math.random() - 0.5) * 22;
    pPos[i * 3 + 2] = (Math.random() - 0.5) * 18 - 3;
  }
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
    color: 0x22d3ee, size: 0.055, transparent: true, opacity: 0.55, sizeAttenuation: true,
  }));
  scene.add(particles);

  /* ---- WHITE GLITTER PARTICLES ---- */
  const gCount = window.innerWidth < 768 ? 150 : 350;
  const gPos   = new Float32Array(gCount * 3);
  for (let i = 0; i < gCount; i++) {
    gPos[i * 3]     = (Math.random() - 0.5) * 30;
    gPos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    gPos[i * 3 + 2] = (Math.random() - 0.5) * 14;
  }
  const gGeo = new THREE.BufferGeometry();
  gGeo.setAttribute('position', new THREE.BufferAttribute(gPos, 3));
  const glitter = new THREE.Points(gGeo, new THREE.PointsMaterial({
    color: 0xffffff, size: 0.04, transparent: true, opacity: 0.45, sizeAttenuation: true,
  }));
  scene.add(glitter);

  /* ---- ORBITING RINGS ---- */
  function makeRing(r, tube, color, opacity) {
    const geo = new THREE.TorusGeometry(r, tube, 16, 120);
    const mat = new THREE.MeshPhongMaterial({
      color, transparent: true, opacity, shininess: 180, specular: new THREE.Color(1,1,1),
    });
    return new THREE.Mesh(geo, mat);
  }

  const ring1 = makeRing(3.2, 0.045, 0x06b6d4, 0.22);
  ring1.position.set(6, 0.5, -4);
  ring1.rotation.x = 0.4;
  scene.add(ring1);

  const ring2 = makeRing(2.2, 0.03, 0x22d3ee, 0.15);
  ring2.position.set(6, 0.5, -4);
  ring2.rotation.y = 0.6;
  scene.add(ring2);

  const ring3 = makeRing(1.3, 0.025, 0x0284c7, 0.28);
  ring3.position.set(-5, -1, -3);
  scene.add(ring3);

  /* ---- MOP / CLEANING TOOL (made from basic geometries) ---- */
  const toolGroup = new THREE.Group();

  // Handle
  const handleGeo = new THREE.CylinderGeometry(0.07, 0.07, 3.6, 12);
  const handleMat = new THREE.MeshPhongMaterial({ color: 0x1e6090, shininess: 80 });
  const handle    = new THREE.Mesh(handleGeo, handleMat);
  handle.position.y = 1.5;
  toolGroup.add(handle);

  // Mop head (flat disc)
  const headGeo = new THREE.CylinderGeometry(0.7, 0.55, 0.18, 20);
  const headMat = new THREE.MeshPhongMaterial({ color: 0x06b6d4, shininess: 120 });
  const head    = new THREE.Mesh(headGeo, headMat);
  head.position.y = -0.3;
  toolGroup.add(head);

  // Bucket
  const bucketGeo = new THREE.CylinderGeometry(0.5, 0.38, 0.75, 18, 1, true);
  const bucketMat = new THREE.MeshPhongMaterial({
    color: 0x0ea5e9, shininess: 150, side: THREE.DoubleSide,
  });
  const bucket    = new THREE.Mesh(bucketGeo, bucketMat);
  bucket.position.set(-1.3, -2.2, 0);
  toolGroup.add(bucket);

  const bucketBase = new THREE.Mesh(
    new THREE.CircleGeometry(0.38, 18),
    new THREE.MeshPhongMaterial({ color: 0x0ea5e9, shininess: 150 })
  );
  bucketBase.rotation.x = -Math.PI / 2;
  bucketBase.position.set(-1.3, -2.575, 0);
  toolGroup.add(bucketBase);

  toolGroup.position.set(5.5, 0, -2);
  toolGroup.rotation.z = -0.18;
  scene.add(toolGroup);

  /* ---- ANIMATION LOOP ---- */
  const clock = new THREE.Clock();
  let targetX = 0, targetY = 0;

  function animate() {
    requestAnimationFrame(animate);
    const t = clock.getElapsedTime();

    // Bubbles
    bubbles.forEach(b => {
      b.position.y += b.userData.rise;
      b.position.x += Math.sin(t * 0.55 + b.userData.phase) * b.userData.wobX;
      b.position.z += Math.cos(t * 0.35 + b.userData.phase) * b.userData.wobZ;
      b.rotation.x += b.userData.rotX;
      b.rotation.y += b.userData.rotY;
      if (b.position.y > 10) {
        b.position.y = -10;
        b.position.x = (Math.random() - 0.5) * 26;
      }
    });

    // Particles
    particles.rotation.y = t * 0.045;
    particles.rotation.x = t * 0.02;
    glitter.rotation.y   = -t * 0.032;
    glitter.rotation.x   =  t * 0.015;

    // Rings
    ring1.rotation.x = 0.4 + t * 0.22;
    ring1.rotation.z =       t * 0.16;
    ring2.rotation.y = 0.6 + t * 0.28;
    ring2.rotation.x =       t * 0.12;
    ring3.rotation.z =       t * 0.2;
    ring3.rotation.y =       t * 0.15;

    // Lights orbit
    light1.position.x = Math.sin(t * 0.5)  * 10;
    light1.position.y = Math.cos(t * 0.35) * 6;
    light2.position.x = Math.cos(t * 0.4)  * -10;
    light2.position.y = Math.sin(t * 0.55) * -4;

    // Mop tool float
    toolGroup.position.y = Math.sin(t * 0.9) * 0.4;
    toolGroup.rotation.z = -0.18 + Math.sin(t * 0.7) * 0.06;

    // Mouse parallax (smooth)
    camera.position.x += (targetX - camera.position.x) * 0.04;
    camera.position.y += (targetY - camera.position.y) * 0.04;
    camera.lookAt(scene.position);

    renderer.render(scene, camera);
  }
  animate();

  /* Resize */
  window.addEventListener('resize', () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  });

  /* Mouse parallax — only in hero viewport */
  document.addEventListener('mousemove', e => {
    if (window.scrollY > window.innerHeight) return;
    targetX =  (e.clientX / window.innerWidth  - 0.5) * 2.5;
    targetY = -(e.clientY / window.innerHeight - 0.5) * 1.8;
  });
})();


/* --- NAVBAR SCROLL --- */
const navbar = document.getElementById('navbar');
function updateNav() {
  if (window.scrollY > 60) navbar.classList.add('scrolled');
  else                      navbar.classList.remove('scrolled');
}
window.addEventListener('scroll', updateNav, { passive: true });
updateNav();


/* --- MOBILE MENU --- */
const navToggle = document.getElementById('nav-toggle');
const navLinks  = document.getElementById('nav-links');

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
});
navLinks.querySelectorAll('a').forEach(a => {
  a.addEventListener('click', () => navLinks.classList.remove('open'));
});


/* --- SCROLL-TRIGGERED ANIMATIONS --- */
const animateEls = document.querySelectorAll('[data-animate]');
const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (!entry.isIntersecting) return;
    /* stagger siblings */
    const siblings = Array.from(
      entry.target.parentElement.querySelectorAll('[data-animate]')
    );
    const idx = siblings.indexOf(entry.target);
    setTimeout(() => entry.target.classList.add('in'), idx * 110);
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.12 });

animateEls.forEach(el => revealObserver.observe(el));


/* --- 3D TILT EFFECT ON SERVICE CARDS --- */
document.querySelectorAll('[data-tilt]').forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    card.style.transform = `translateY(-8px) rotateX(${-y * 9}deg) rotateY(${x * 9}deg)`;
    card.style.transition = 'transform .08s ease';
  });
  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
    card.style.transition = 'transform .5s ease';
  });
});


/* --- STATS COUNTER ANIMATION --- */
function animateCount(el, target, duration) {
  let start = null;
  function step(ts) {
    if (!start) start = ts;
    const progress = Math.min((ts - start) / duration, 1);
    el.textContent  = Math.floor(progress * target);
    if (progress < 1) requestAnimationFrame(step);
    else              el.textContent = target;
  }
  requestAnimationFrame(step);
}

const statNums = document.querySelectorAll('.stat-num[data-count]');
const statsObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const el     = entry.target;
    const target = parseInt(el.dataset.count, 10);
    animateCount(el, target, 1400);
    statsObserver.unobserve(el);
  });
}, { threshold: 0.5 });

statNums.forEach(el => statsObserver.observe(el));


/* --- ABOUT CARD MOUSE-TILT --- */
const aboutCard = document.getElementById('about-card');
if (aboutCard) {
  const parent = aboutCard.parentElement;
  parent.addEventListener('mousemove', e => {
    const rect = aboutCard.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width  - 0.5;
    const y = (e.clientY - rect.top)  / rect.height - 0.5;
    aboutCard.style.transform = `perspective(800px) rotateY(${x * -12}deg) rotateX(${y * 8}deg)`;
    aboutCard.style.transition = 'transform .08s ease';
  });
  parent.addEventListener('mouseleave', () => {
    aboutCard.style.transform = '';
    aboutCard.style.transition = 'transform .5s ease';
  });
}


/* --- CONTACT FORM --- */
const form      = document.getElementById('contact-form');
const submitBtn = document.getElementById('submit-btn');

if (form) {
  form.addEventListener('submit', e => {
    e.preventDefault();
    submitBtn.textContent   = 'Request Sent! ✓';
    submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
    submitBtn.style.boxShadow  = '0 6px 24px rgba(16,185,129,.45)';
    submitBtn.disabled         = true;
    setTimeout(() => {
      submitBtn.textContent      = 'Send Request';
      submitBtn.style.background = '';
      submitBtn.style.boxShadow  = '';
      submitBtn.disabled         = false;
      form.reset();
    }, 3500);
  });
}
