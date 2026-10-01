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
    workshop:   { pos: [0, 24],   name: 'The Workshop',     color: 0xE85D1A,
      desc: 'Home base. Workbenches, spare servos, the smell of solder.' },
    innovation:   { pos: [0, -16],  name: 'UM Center for Innovation', color: 0x2c5f8a,
      desc: 'U-M\u2019s Detroit innovation hub \u2014 six stories of glass leaning into the future.' },
    hq:         { pos: [19, 0],   name: 'Academy HQ', color: 0x9fc3d8,
      desc: 'The new Detroit Automation Academy headquarters in Corktown — glass, brick, and big plans.' },
    riverfront: { pos: [0, 30],   name: 'Detroit Riverfront', color: 0x9AA0A6,
      desc: 'Wind off the water, skyline at your back.' },
    thinkabit:  { pos: [-26, 0],  name: 'Thinkabit Lab',    color: 0xFFB000,
      desc: 'A STEM lab buzzing with kits and big questions.' }
  };
  var PARTS = [
    ['ground', 0x11161c, 1.0, 0.0], ['roads', 0x3a4046, 1.0, 0.0],
    ['water', 0x1a6f8f, 0.35, 0.4],
    ['trees', 0x2f7d4f, 1.0, 0.0], ['street', 0x6a7076, 0.6, 0.4]
  ];
  // NOTE: 'workshop', 'techtown', 'thinkabit' and 'riverfront' are no longer
  // STLs — the procedural SC3K-standard builds from window.DAAArchKit
  // (site/js/arch-kit.js) replace assets/world/workshop.stl,
  // assets/world/techtown.stl, assets/world/thinkabit.stl and
  // assets/world/riverfront.stl.

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
      .catch(function (e) {
        if (window.console && console.error) console.error('[world3d] init failed:', e);
        fallback();
      });
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
    // real load progress on the overlay: 5 STL district parts + the bot +
    // the procedural builds (workshop + corktown + innovation + thinkabit +
    // riverfront via window.DAAArchKit)
    var loadTotal = PARTS.length + 6;
    var loadDone = 0;
    var loadCountEl = mount.querySelector('.world3d-count');
    function paintLoadCount(done) {
      if (loadCountEl) loadCountEl.textContent = done + '/' + loadTotal;
    }
    function bumpLoadCount() {
      loadDone += 1;
      paintLoadCount(Math.min(loadDone, loadTotal));
    }
    paintLoadCount(0);
    manager.onProgress = function () { bumpLoadCount(); };
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
      }, undefined, partError(base + p[0] + '.stl'));
    });

    // The Workshop: procedural SC3K-standard build (replaces workshop.stl).
    // Synchronous and local; counts as one step on the loading overlay.
    try {
      if (window.DAAArchKit && window.DAAArchKit.buildWorkshop) {
        scene.add(window.DAAArchKit.buildWorkshop(THREE));
      }
    } catch (e) {
      // workshop stays absent rather than breaking the scene; log for diagnostics
      if (window.console && console.warn) console.warn('[world3d] workshop build failed:', e);
    }
    bumpLoadCount();

    // Corktown: procedural Academy HQ + rowhouses + pocket park
    // (replaces the old station STL). Synchronous and local; one overlay step.
    try {
      if (window.DAAArchKit && window.DAAArchKit.buildCorktown) {
        scene.add(window.DAAArchKit.buildCorktown(THREE));
      }
    } catch (e) {
      // corktown stays absent rather than breaking the scene; log for diagnostics
      if (window.console && console.warn) console.warn('[world3d] corktown build failed:', e);
    }
    bumpLoadCount();

    // UM Center for Innovation: procedural KPF-inspired build
    // (replaces the old techtown STL). Synchronous and local; one overlay step.
    try {
      if (window.DAAArchKit && window.DAAArchKit.buildInnovation) {
        scene.add(window.DAAArchKit.buildInnovation(THREE));
      }
    } catch (e) {
      // innovation stays absent rather than breaking the scene; log for diagnostics
      if (window.console && console.warn) console.warn('[world3d] innovation build failed:', e);
    }
    bumpLoadCount();

    // Thinkabit Lab: procedural makerspace rebuild
    // (replaces the old thinkabit STL). Synchronous and local; one overlay step.
    try {
      if (window.DAAArchKit && window.DAAArchKit.buildThinkabit) {
        scene.add(window.DAAArchKit.buildThinkabit(THREE));
      }
    } catch (e) {
      // thinkabit stays absent rather than breaking the scene; log for diagnostics
      if (window.console && console.warn) console.warn('[world3d] thinkabit build failed:', e);
    }
    bumpLoadCount();

    // Detroit Riverfront pavilion: procedural butterfly-roof rebuild
    // (replaces the old riverfront STL). Synchronous and local; one overlay step.
    try {
      if (window.DAAArchKit && window.DAAArchKit.buildRiverfront) {
        scene.add(window.DAAArchKit.buildRiverfront(THREE));
      }
    } catch (e) {
      // riverfront stays absent rather than breaking the scene; log for diagnostics
      if (window.console && console.warn) console.warn('[world3d] riverfront build failed:', e);
    }
    bumpLoadCount();

    // STL load failures: log which asset failed, then engage the 2D fallback.
    function partError(url) {
      return function (err) {
        if (window.console && console.error) console.error('[world3d] STL load failed: ' + url, err);
        fallback();
      };
    }

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

    // floating name labels (canvas sprites; positions are building centers
    // in three.js coords: x = east, z = south, y = just above the roofline)
    function makeLabel(text, hWorld) {
      var fs = 44, pad = 34;
      var c = document.createElement('canvas');
      var g = c.getContext('2d');
      g.font = '600 ' + fs + 'px system-ui, -apple-system, "Segoe UI", sans-serif';
      c.width = Math.ceil(g.measureText(text).width) + pad * 2;
      c.height = Math.ceil(fs + pad * 1.5);
      var g2 = c.getContext('2d');
      g2.fillStyle = 'rgba(12,17,22,0.80)';
      g2.beginPath();
      if (g2.roundRect) g2.roundRect(2, 2, c.width - 4, c.height - 4, (c.height - 4) / 2);
      else g2.rect(2, 2, c.width - 4, c.height - 4);
      g2.fill();
      g2.lineWidth = 3;
      g2.strokeStyle = 'rgba(232,93,26,0.95)';
      g2.stroke();
      g2.font = '600 ' + fs + 'px system-ui, -apple-system, "Segoe UI", sans-serif';
      g2.fillStyle = '#F5F2EA';
      g2.textBaseline = 'middle';
      g2.fillText(text, pad, c.height / 2 + 2);
      var tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      var sp = new THREE.Sprite(new THREE.SpriteMaterial({
        map: tex, transparent: true, depthTest: true
      }));
      var hWorld = hWorld || 3.4;
      sp.scale.set(hWorld * c.width / c.height, hWorld, 1);
      return sp;
    }
    var LABEL_AT = { // [x, z, y] per district, from cad/world.scad
      workshop:   [0, 0, 21], innovation: [0, -38, 27], hq: [47, -20, 42],
      riverfront: [0, 44, 12], thinkabit: [-44, 0, 17]
    };
    Object.keys(DISTRICT).forEach(function (key) {
      var p = LABEL_AT[key];
      var sp = makeLabel(DISTRICT[key].name);
      sp.position.set(p[0], p[2], p[1]);
      scene.add(sp);
    });

    // the bot
    var botGroup = new THREE.Group();
    var botTag = makeLabel('TRAINING BOT', 0.55);
    botTag.position.set(0, 1.9, 0);
    botGroup.add(botTag);
    // glowing eyes: emissive amber spheres over the STL eye positions.
    // OpenSCAD (±0.121, 0.181, 0.688) -> three.js (x, z, -y) = (±0.121, 0.688, -0.181).
    var eyeGeo = new THREE.SphereGeometry(0.066, 12, 12);
    var eyeMat = new THREE.MeshStandardMaterial({
      color: 0xFFB000, emissive: 0xFFB000, emissiveIntensity: 2.2, roughness: 0.4
    });
    [-0.121, 0.121].forEach(function (ex) {
      var eye = new THREE.Mesh(eyeGeo, eyeMat);
      eye.position.set(ex, 0.688, -0.181);
      botGroup.add(eye);
    });
    // headlight beam: translucent cone from the chest, facing -z (bot forward)
    var beamGeo = new THREE.ConeGeometry(0.30, 1.05, 20, 1, true);
    var beam = new THREE.Mesh(beamGeo, new THREE.MeshBasicMaterial({
      color: 0xfff2c0, transparent: true, opacity: 0.16,
      blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
    }));
    beam.rotation.x = Math.PI / 2; // apex -> +z so it sits at the chest
    beam.position.set(0, 0.40, -0.78); // apex lands at (0, 0.40, -0.255), base at z=-1.3
    botGroup.add(beam);
    var botMesh = null;
    loader.load(base + 'bot.stl', function (geo) {
      geo.rotateX(-Math.PI / 2);
      geo.computeVertexNormals();
      botMesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({
        color: 0xE85D1A, roughness: 0.6, metalness: 0.25, emissive: 0x000000
      }));
      botMesh.castShadow = true;
      botGroup.add(botMesh);
      botGroup.position.set(0, 0.35, 24); // workshop approach point (clear of the building)
      scene.add(botGroup);
      ready();
    }, undefined, partError(base + 'bot.stl'));

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
    var turnT = null;      // target rotation.y for in-place turns
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
      new THREE.RingGeometry(0.18, 0.24, 40),
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
        var sp = 3 * dt;
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
          var step = Math.min(dist, 3.5 * dt);
          face(dx, dz);
          botGroup.position.x += dx / dist * step;
          botGroup.position.z += dz / dist * step;
          botGroup.position.y = 0.35 + Math.abs(Math.sin(now * 0.02)) * 0.25;
        }
      } else {
        // in-place turn tween (left/right commands, D-pad turns)
        if (turnT !== null) {
          var dd = turnT - botGroup.rotation.y;
          while (dd > Math.PI) dd -= Math.PI * 2;
          while (dd < -Math.PI) dd += Math.PI * 2;
          if (Math.abs(dd) < 0.04) { turnT = null; }
          else botGroup.rotation.y += dd * Math.min(1, 8 * dt);
        }
        botGroup.position.y += (0.35 - botGroup.position.y) * 0.2;
      }

      // procedural animations
      if (anim && botMesh) {
        var t = (now - anim.t0) / anim.dur;
        if (t >= 1) { anim = null; botMesh.position.y = 0; botMesh.rotation.set(0, 0, 0); }
        else if (anim.kind === 'dance') {
          botMesh.position.y = Math.abs(Math.sin(t * Math.PI * 6)) * 0.16;
          botMesh.rotation.z = Math.sin(t * Math.PI * 6) * 0.22;
        } else if (anim.kind === 'jump') {
          botMesh.position.y = Math.sin(t * Math.PI) * 0.5;
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
          var s = 0.24 + rt * 2.4;
          ring.scale.set(s / 0.24, s / 0.24, 1);
          ring.material.opacity = 0.5 * (1 - rt);
        }
      }

      // camera follows the bot loosely
      controls.target.lerp(new THREE.Vector3(botGroup.position.x, 2, botGroup.position.z), 0.04);
      controls.update();
      try {
        renderer.render(scene, camera);
      } catch (e) {
        // one bad frame must never kill the loop silently; the ready backstop
        // (installed below, before the first frame) still fires.
        if (!tick._renderLogged && window.console && console.error) {
          tick._renderLogged = true;
          console.error('[world3d] render failed:', e);
        }
      }
    }
    // Ready backstop BEFORE the first frame: even if the render loop throws,
    // init completes and the loading overlay can never strand.
    manager.onLoad = ready;
    setTimeout(ready, 12000); // don't hang on a stalled part
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
        turnT = null;
        tween = {
          x: THREE.MathUtils.clamp(botGroup.position.x + dx, -58, 58),
          z: THREE.MathUtils.clamp(botGroup.position.z + dz, -58, 58),
          done: null
        };
      },
      drive: function (mx, mz) { // screen-relative step (D-pad), mirrors WASD
        turnT = null;
        var sp = 2.4;
        tween = {
          x: THREE.MathUtils.clamp(botGroup.position.x + mx * sp, -58, 58),
          z: THREE.MathUtils.clamp(botGroup.position.z + mz * sp, -58, 58),
          done: null
        };
      },
      turn: function (dir) { // -1 = left, +1 = right; smooth 45° in place
        tween = null;
        turnT = botGroup.rotation.y + dir * Math.PI / 4;
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
  }
})();
