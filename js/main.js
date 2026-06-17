/* =================================================
   SQUEAKY CLEAN — Interactions + calm 3D hero
   ================================================= */

/* ---------- 3D HERO: drifting soap bubbles ---------- */
(function scene() {
  const canvas = document.getElementById('scene');
  if (!canvas || typeof THREE === 'undefined') return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  let W = window.innerWidth, H = window.innerHeight;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setSize(W, H);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

  const sc = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(50, W / H, 0.1, 100);
  cam.position.z = 16;

  // Soft, warm light to match the bone palette
  sc.add(new THREE.AmbientLight(0xffffff, 1.1));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(6, 8, 10);
  sc.add(key);
  const teal = new THREE.PointLight(0x15a8a3, 4, 40);
  teal.position.set(-8, -2, 6);
  sc.add(teal);

  // Bubbles — translucent, iridescent, calm
  const group = new THREE.Group();
  sc.add(group);
  const bubbles = [];
  const N = W < 720 ? 9 : 16;

  for (let i = 0; i < N; i++) {
    const r = 0.5 + Math.random() * 1.7;
    const geo = new THREE.SphereGeometry(r, 48, 48);
    const col = new THREE.Color().setHSL(0.48 + Math.random() * 0.08, 0.55, 0.6);
    const mat = new THREE.MeshPhysicalMaterial({
      color: col,
      transparent: true,
      opacity: 0.32,
      roughness: 0.05,
      metalness: 0,
      transmission: 0.6,
      clearcoat: 1,
      clearcoatRoughness: 0.1,
      reflectivity: 0.6,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(
      (Math.random() - 0.5) * 26,
      (Math.random() - 0.5) * 18,
      (Math.random() - 0.5) * 10 - 3
    );
    m.userData = {
      baseX: m.position.x,
      baseY: m.position.y,
      drift: 0.12 + Math.random() * 0.2,
      sp: 0.2 + Math.random() * 0.35,
      ph: Math.random() * Math.PI * 2,
      sc: r,
    };
    group.add(m);
    bubbles.push(m);
  }

  // subtle sparkle dust
  const dustN = W < 720 ? 90 : 220;
  const dpos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    dpos[i * 3]     = (Math.random() - 0.5) * 30;
    dpos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    dpos[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({
    color: 0x15a8a3, size: 0.05, transparent: true, opacity: 0.5,
  }));
  sc.add(dust);

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => {
    if (window.scrollY > H) return;
    tx = (e.clientX / W - 0.5);
    ty = (e.clientY / H - 0.5);
  });

  const clock = new THREE.Clock();
  function loop() {
    requestAnimationFrame(loop);
    const t = reduce ? 0 : clock.getElapsedTime();

    bubbles.forEach(b => {
      const u = b.userData;
      b.position.y = u.baseY + Math.sin(t * u.sp + u.ph) * u.drift * 6;
      b.position.x = u.baseX + Math.cos(t * u.sp * 0.7 + u.ph) * u.drift * 3;
      b.rotation.y = t * 0.15;
      const pulse = 1 + Math.sin(t * 0.8 + u.ph) * 0.03;
      b.scale.setScalar(pulse);
    });
    dust.rotation.y = t * 0.03;

    mx += (tx - mx) * 0.05;
    my += (ty - my) * 0.05;
    group.rotation.y = mx * 0.4;
    group.rotation.x = my * 0.3;
    cam.position.x = mx * 2;
    cam.position.y = -my * 1.4;
    cam.lookAt(sc.position);

    renderer.render(sc, cam);
  }
  loop();

  window.addEventListener('resize', () => {
    W = window.innerWidth; H = window.innerHeight;
    cam.aspect = W / H; cam.updateProjectionMatrix();
    renderer.setSize(W, H);
  });
})();


/* ---------- NAV scroll state ---------- */
const nav = document.getElementById('nav');
const onScroll = () => nav.classList.toggle('scrolled', window.scrollY > 30);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();


/* ---------- Mobile menu ---------- */
const burger = document.getElementById('burger');
const links = document.getElementById('navLinks');
burger.addEventListener('click', () => links.classList.toggle('open'));
links.querySelectorAll('a').forEach(a =>
  a.addEventListener('click', () => links.classList.remove('open'))
);


/* ---------- Reveal on scroll ---------- */
const io = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    const sibs = Array.from(
      entry.target.parentElement.querySelectorAll(':scope > [data-reveal]')
    );
    const i = Math.max(0, sibs.indexOf(entry.target));
    setTimeout(() => entry.target.classList.add('in'), i * 90);
    io.unobserve(entry.target);
  });
}, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });

document.querySelectorAll('[data-reveal]').forEach(el => io.observe(el));
