// Detroit Automation Academy — interactive 3D training district.
// Lazy-loaded Three.js viewer. STL geometry is modeled parametrically in
// cad/world.scad (OpenSCAD) and exported per part. Exposes window.DAAWorld
// so the terminal in script.js can drive the 3D bot; if WebGL/CDN fails,
// the caller falls back to the SVG bot and nothing breaks.
(function () {
  'use strict';

  var stage = document.getElementById('demoStage');
  var mount = document.getElementById('world3d');
  if (!stage || !mount) return;

  var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // three.js coords: x = east, z = south (OpenSCAD +y/north maps to -z).
  // pos values are road-side approach points, kept clear of building
  // footprints so the bot is never occluded inside a mesh.
  var DISTRICT = {
    workshop:   { pos: [20, 0],   name: 'The Workshop',     color: 0xE85D1A,
      desc: 'Home base. Workbenches, spare servos, the smell of solder.' },
    techtown:   { pos: [0, -28],  name: 'TechTown Detroit', color: 0x8a94a6,
      desc: 'Startups, mentors, whiteboards full of impossible.' },
    station:    { pos: [19, 0],   name: 'Michigan Central', color: 0xF5F2EA,
      desc: 'The old train station, reborn as an innovation hub.' },
    riverfront: { pos: [0, 30],   name: 'Detroit Riverfront', color: 0x9AA0A6,
      desc: 'Wind off the water, skyline at your back.' },
    thinkabit:  { pos: [-26, 0],  name: 'Thinkabit Lab',    color: 0xFFB000,
      desc: 'A STEM lab buzzing with kits and big questions.' }
  };
  var PARTS = [
    ['ground', 0x11161c, 1.0, 0.0], ['roads', 0x3a4046, 1.0, 0.0],
    ['water', 0x1a6f8f, 0.35, 0.4], ['workshop', 0xE85D1A, 0.85, 0.0],
    ['techtown', 0x8a94a6, 0.5, 0.6], ['station', 0xF5F2EA, 0.9, 0.0],
    ['riverfront', 0x9AA0A6, 0.9, 0.0], ['thinkabit', 0xFFB000, 0.85, 0.0],
    ['trees', 0x2f7d4f, 1.0, 0.0], ['street', 0x6a7076, 0.6, 0.4]
  ];

  function fallback() {
    stage.classList.add('world-fallback');
  }

  // Only boot when the demo scrolls into view; never block page load.
  var booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    Promise.all([
      import('three'),
      import('three/addons/controls/OrbitControls.js'),
      import('three/addons/loaders/STLLoader.js')
    ]).then(function (m) { init(m[0], m[1].OrbitControls, m[2].STLLoader); })
      .catch(fallback);
  }

  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (es) {
      es.forEach(function (e) { if (e.isIntersecting) { boot(); io.disconnect(); } });
    }, { rootMargin: '400px' });
    io.observe(mount);
  } else {
    boot();
  }

  function init(THREE, OrbitControls, STLLoader) {
    var W = mount.clientWidth || 600, H = mount.clientHeight || 420;
    var renderer;
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (e) { fallback(); return; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    mount.appendChild(renderer.domElement);

    var scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0c1116, 140, 320);
    var camera = new THREE.PerspectiveCamera(46, W / H, 0.5, 800);
    camera.position.set(58, 52, 58);

    var controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.08;
    controls.maxPolarAngle = Math.PI * 0.46;
    controls.minDistance = 18;
    controls.maxDistance = 220;
    controls.target.set(0, 2, 0);

    scene.add(new THREE.HemisphereLight(0xf5f2ea, 0x0c1116, 0.85));
    var sun = new THREE.DirectionalLight(0xfff2df, 1.6);
    sun.position.set(60, 90, 30);
    sun.castShadow = true;
    sun.shadow.mapSize.set(1024, 1024);
    sun.shadow.camera.left = -80; sun.shadow.camera.right = 80;
    sun.shadow.camera.top = 80; sun.shadow.camera.bottom = -80;
    scene.add(sun);

    var manager = new THREE.LoadingManager();
    var loader = new STLLoader(manager);
    var base = 'assets/world/';
    var clickTargets = [];

    PARTS.forEach(function (p) {
      loader.load(base + p[0] + '.stl', function (geo) {
        geo.rotateX(-Math.PI / 2); // OpenSCAD z-up -> three y-up
        geo.computeVertexNormals();
        var mat = new THREE.MeshStandardMaterial({
          color: p[1], roughness: p[2], metalness: p[3]
        });
        var mesh = new THREE.Mesh(geo, mat);
        mesh.receiveShadow = true;
        mesh.castShadow = p[0] !== 'ground' && p[0] !== 'roads' && p[0] !== 'water';
        scene.add(mesh);
      }, undefined, fallback);
    });

    // clickable district markers (invisible hit discs at each stop)
    var hitGeo = new THREE.CylinderGeometry(13, 13, 6, 12);
    Object.keys(DISTRICT).forEach(function (key) {
      var d = DISTRICT[key];
      var hit = new THREE.Mesh(hitGeo, new THREE.MeshBasicMaterial({ visible: false }));
      hit.position.set(d.pos[0], 3, d.pos[1]);
      hit.userData.district = key;
      scene.add(hit);
      clickTargets.push(hit);
    });

    // the bot
    var botGroup = new THREE.Group();
    var botMesh = null;
    loader.load(base + 'bot.stl', function (geo) {
      geo.rotateX(-Math.PI / 2);
      geo.computeVertexNormals();
      botMesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: 0xE85D1A, roughness: 0.6, metalness: 0.25, emissive: 0x000000
      }));
      botMesh.castShadow = true;
      botGroup.add(botMesh);
      botGroup.position.set(20, 0.35, 0); // workshop approach point (clear of the building)
      scene.add(botGroup);
      ready();
    }, undefined, fallback);

    // info card
    var card = document.createElement('div');
    card.className = 'world-card';
    card.style.display = 'none';
    mount.appendChild(card);
    function showCard(key) {
      var d = DISTRICT[key];
      card.innerHTML = '<strong>' + d.name + '</strong><span>' + d.desc + '</span>';
      card.style.display = 'block';
      clearTimeout(card._t);
      card._t = setTimeout(function () { card.style.display = 'none'; }, 6000);
    }

    var ray = new THREE.Raycaster();
    var ptr = new THREE.Vector2();
    renderer.domElement.addEventListener('pointerdown', function (e) {
      var r = renderer.domElement.getBoundingClientRect();
      ptr.x = ((e.clientX - r.left) / r.width) * 2 - 1;
      ptr.y = -((e.clientY - r.top) / r.height) * 2 + 1;
      ray.setFromCamera(ptr, camera);
      var hits = ray.intersectObjects(clickTargets);
      if (hits.length) {
        var key = hits[0].object.userData.district;
        showCard(key);
        api.goTo(key); // tap a stop and the bot rolls over
      }
    });

    // ---- bot motion ----
    var tween = null;      // {x, z, done}
    var anim = null;       // {kind, t0, dur}
    var keys = {};
    var driveArmed = false;
    mount.addEventListener('pointerenter', function () { driveArmed = true; });
    mount.addEventListener('pointerleave', function () { driveArmed = false; keys = {}; });
    window.addEventListener('keydown', function (e) {
      var t = e.target;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')) return;
      keys[e.key.toLowerCase()] = true;
    });
    window.addEventListener('keyup', function (e) { keys[e.key.toLowerCase()] = false; });

    function face(x, z) {
      if (Math.abs(x) + Math.abs(z) < 0.001) return;
      var target = Math.atan2(-x, -z); // eyes rest toward -z
      var cur = botGroup.rotation.y;
      var d = target - cur;
      while (d > Math.PI) d -= Math.PI * 2;
      while (d < -Math.PI) d += Math.PI * 2;
      botGroup.rotation.y = cur + d * 0.18;
    }

    function playAnim(kind, dur) {
      if (reduced) return;
      anim = { kind: kind, t0: performance.now(), dur: dur || 1100 };
    }

    // scan radar ring
    var ring = new THREE.Mesh(
      new THREE.RingGeometry(2, 2.6, 40),
      new THREE.MeshBasicMaterial({ color: 0xFFB000, transparent: true, opacity: 0, side: THREE.DoubleSide })
    );
    ring.rotation.x = -Math.PI / 2;
    scene.add(ring);
    var ringT = -1;

    var clock = new THREE.Clock();
    function tick() {
      requestAnimationFrame(tick);
      var dt = Math.min(clock.getDelta(), 0.05);
      var now = performance.now();

      // keyboard drive
      var mx = (keys['d'] || keys['arrowright'] ? 1 : 0) - (keys['a'] || keys['arrowleft'] ? 1 : 0);
      var mz = (keys['s'] || keys['arrowdown'] ? 1 : 0) - (keys['w'] || keys['arrowup'] ? 1 : 0);
      if (driveArmed && (mx || mz)) {
        tween = null;
        var sp = 26 * dt;
        var nx = THREE.MathUtils.clamp(botGroup.position.x + mx * sp, -58, 58);
        var nz = THREE.MathUtils.clamp(botGroup.position.z + mz * sp, -58, 58);
        face(mx, mz);
        botGroup.position.x = nx;
        botGroup.position.z = nz;
        botGroup.position.y = 0.35 + Math.abs(Math.sin(now * 0.02)) * 0.25;
      } else if (tween) {
        var dx = tween.x - botGroup.position.x, dz = tween.z - botGroup.position.z;
        var dist = Math.hypot(dx, dz);
        if (dist < 0.4) {
          botGroup.position.y = 0.35;
          var done = tween.done; tween = null;
          if (done) done();
        } else {
          var step = Math.min(dist, 30 * dt);
          face(dx, dz);
          botGroup.position.x += dx / dist * step;
          botGroup.position.z += dz / dist * step;
          botGroup.position.y = 0.35 + Math.abs(Math.sin(now * 0.02)) * 0.25;
        }
      } else {
        botGroup.position.y += (0.35 - botGroup.position.y) * 0.2;
      }

      // procedural animations
      if (anim && botMesh) {
        var t = (now - anim.t0) / anim.dur;
        if (t >= 1) { anim = null; botMesh.position.y = 0; botMesh.rotation.set(0, 0, 0); }
        else if (anim.kind === 'dance') {
          botMesh.position.y = Math.abs(Math.sin(t * Math.PI * 6)) * 1.4;
          botMesh.rotation.z = Math.sin(t * Math.PI * 6) * 0.22;
        } else if (anim.kind === 'jump') {
          botMesh.position.y = Math.sin(t * Math.PI) * 5;
        } else if (anim.kind === 'spin') {
          botMesh.rotation.y = t * Math.PI * 2;
        } else if (anim.kind === 'wave') {
          botMesh.rotation.z = Math.sin(t * Math.PI * 4) * 0.18;
        } else if (anim.kind === 'charge') {
          var e = 0.25 + 0.55 * Math.abs(Math.sin(t * Math.PI * 3));
          botMesh.material.emissive.setRGB(e * 0.9, e * 0.45, e * 0.08);
          if (t >= 0.99) botMesh.material.emissive.setRGB(0, 0, 0);
        }
      }

      // scan ring
      if (ringT >= 0) {
        ringT += dt;
        var rt = ringT / 1.4;
        if (rt >= 1) { ringT = -1; ring.material.opacity = 0; }
        else {
          ring.position.set(botGroup.position.x, 0.6, botGroup.position.z);
          var s = 2 + rt * 26;
          ring.scale.set(s / 2.6, s / 2.6, 1);
          ring.material.opacity = 0.5 * (1 - rt);
        }
      }

      // camera follows the bot loosely
      controls.target.lerp(new THREE.Vector3(botGroup.position.x, 2, botGroup.position.z), 0.04);
      controls.update();
      renderer.render(scene, camera);
    }
    tick();

    window.addEventListener('resize', function () {
      var w2 = mount.clientWidth || 600, h2 = mount.clientHeight || 420;
      camera.aspect = w2 / h2;
      camera.updateProjectionMatrix();
      renderer.setSize(w2, h2);
    });

    // ---- public API for the terminal ----
    var isReady = false;
    function ready() {
      if (isReady) return;
      isReady = true;
      mount.classList.add('world-on');
      stage.classList.add('world-live'); // hides the SVG fallback
      var l = mount.querySelector('.world3d-loading');
      if (l) l.style.display = 'none';
    }

    var api = {
      goTo: function (key, done) {
        var d = DISTRICT[key];
        if (!d) { if (done) done(); return; }
        showCard(key);
        if (reduced) {
          botGroup.position.x = d.pos[0]; botGroup.position.z = d.pos[1];
          if (done) done();
        } else {
          tween = { x: d.pos[0], z: d.pos[1], done: done };
        }
      },
      nudge: function (dir) { // forward/back relative to facing
        var f = botGroup.rotation.y;
        var dx = -Math.sin(f) * 5 * dir, dz = -Math.cos(f) * 5 * dir;
        tween = {
          x: THREE.MathUtils.clamp(botGroup.position.x + dx, -58, 58),
          z: THREE.MathUtils.clamp(botGroup.position.z + dz, -58, 58),
          done: null
        };
      },
      dance: function () { playAnim('dance', 1300); },
      jump: function () { playAnim('jump', 900); },
      spin: function () { playAnim('spin', 950); },
      wave: function () { playAnim('wave', 1200); },
      charge: function () { playAnim('charge', 1700); },
      scan: function () { ringT = 0; },
      look: function (key) { if (key && DISTRICT[key]) showCard(key); }
    };
    window.DAAWorld = api;

    manager.onLoad = ready;
    setTimeout(ready, 12000); // don't hang on a stalled part
  }
})();
