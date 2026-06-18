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

  // Lighting for pink-purple palette
  sc.add(new THREE.AmbientLight(0xfff0ff, 1.2));
  const key = new THREE.DirectionalLight(0xffffff, 1.4);
  key.position.set(6, 8, 10);
  sc.add(key);
  const pink = new THREE.PointLight(0xc026d3, 5, 40);
  pink.position.set(-8, -2, 6);
  sc.add(pink);
  const pink2 = new THREE.PointLight(0xe879f9, 3, 35);
  pink2.position.set(8, 4, 4);
  sc.add(pink2);

  // Bubbles — vivid pink-purple, highly visible
  const group = new THREE.Group();
  sc.add(group);
  const bubbles = [];
  const N = W < 720 ? 12 : 20;

  for (let i = 0; i < N; i++) {
    const r = 0.6 + Math.random() * 2.0;
    const geo = new THREE.SphereGeometry(r, 48, 48);
    const col = new THREE.Color().setHSL(0.78 + Math.random() * 0.14, 0.72, 0.72);
    const mat = new THREE.MeshPhysicalMaterial({
      color: col,
      transparent: true,
      opacity: 0.65,
      roughness: 0.04,
      metalness: 0,
      transmission: 0.35,
      clearcoat: 1,
      clearcoatRoughness: 0.08,
      reflectivity: 0.8,
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

  // sparkle dust — pink-purple shimmer
  const dustN = W < 720 ? 120 : 280;
  const dpos = new Float32Array(dustN * 3);
  for (let i = 0; i < dustN; i++) {
    dpos[i * 3]     = (Math.random() - 0.5) * 30;
    dpos[i * 3 + 1] = (Math.random() - 0.5) * 20;
    dpos[i * 3 + 2] = (Math.random() - 0.5) * 12;
  }
  const dgeo = new THREE.BufferGeometry();
  dgeo.setAttribute('position', new THREE.BufferAttribute(dpos, 3));
  const dust = new THREE.Points(dgeo, new THREE.PointsMaterial({
    color: 0xe879f9, size: 0.09, transparent: true, opacity: 0.65,
  }));
  sc.add(dust);

  let mx = 0, my = 0, tx = 0, ty = 0;
  window.addEventListener('mousemove', e => {
    if (window.scrollY > H) return;
    tx = (e.clientX / W - 0.5);
    ty = (e.clientY / H - 0.5);
  });
  window.addEventListener('touchmove', e => {
    if (window.scrollY > H) return;
    const touch = e.touches[0];
    tx = (touch.clientX / W - 0.5);
    ty = (touch.clientY / H - 0.5);
  }, { passive: true });

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
