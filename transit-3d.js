/* Forge Line 3D live transit map — dedicated view, not the stylized district.
 *
 * Renders the ACTUAL DDOT route shapes (GTFS shapes.txt, equirectangular
 * projection around the network centroid) as 3D ribbons, plus live bus
 * markers polled from the Forge Line proxy every 60s. Projection params
 * ship in data/ddot-routes-3d.json so markers use the identical transform.
 *
 * Degrades gracefully: routes render from static data; if the live feed
 * fails, a note appears and polling keeps retrying.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function () {
  'use strict';

  var STAMP = '20261002-1915';
  var POLL_MS = 60000;
  var MAX_BUS = 240;
  var DEG = Math.PI / 180;

  var container = document.getElementById('transit-3d');
  var statusEl = document.getElementById('transit-3d-status');
  if (!container) return;

  function fail(msg) {
    if (statusEl) statusEl.textContent = msg;
    container.innerHTML = '<p class="transit-3d-fallback">' + msg + '</p>';
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch (e) {
    fail('3D is not available in this browser — the live bus count above still works.');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c1116);
  scene.fog = new THREE.Fog(0x0c1116, 30000, 70000);

  var camera = new THREE.PerspectiveCamera(42, 1, 100, 120000);
  camera.position.set(0, 11800, 13800);

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = 1.35;
  controls.minDistance = 3500;
  controls.maxDistance = 50000;

  scene.add(new THREE.HemisphereLight(0xf5f2ea, 0x0c1116, 0.95));
  var sun = new THREE.DirectionalLight(0xffffff, 0.85);
  sun.position.set(9000, 14000, 5000);
  scene.add(sun);

  // Ground + faint survey grid.
  var ground = new THREE.Mesh(
    new THREE.PlaneGeometry(26000, 26000),
    new THREE.MeshBasicMaterial({ color: 0x0e141b })
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);
  var grid = new THREE.GridHelper(24000, 24, 0x2a3542, 0x182029);
  grid.position.y = 0.5;
  grid.material.transparent = true;
  grid.material.opacity = 0.3;
  scene.add(grid);

  function ribbonGeometry(pts, width, y) {
    // pts: [[x,z],...] -> flat ribbon triangle strip facing up
    var n = pts.length;
    var pos = new Float32Array(n * 2 * 3);
    var idx = [];
    for (var i = 0; i < n; i++) {
      var p = pts[i];
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      var dx = b[0] - a[0], dz = b[1] - a[1];
      var len = Math.hypot(dx, dz) || 1;
      var nx = -dz / len, nz = dx / len;
      var hw = width / 2;
      pos.set([p[0] + nx * hw, y, p[1] + nz * hw], i * 6);
      pos.set([p[0] - nx * hw, y, p[1] - nz * hw], i * 6 + 3);
      if (i < n - 1) {
        var k = i * 2;
        idx.push(k, k + 1, k + 2, k + 1, k + 3, k + 2);
      }
    }
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  function makeLabel(text, color) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 128;
    var x = c.getContext('2d');
    x.fillStyle = 'rgba(12,17,22,0.82)';
    x.beginPath();
    if (x.roundRect) x.roundRect(6, 14, 500, 100, 50); else x.rect(6, 14, 500, 100);
    x.fill();
    x.strokeStyle = color; x.lineWidth = 4; x.stroke();
    x.fillStyle = color;
    x.font = '600 52px "Space Grotesk", sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, 256, 66);
    var tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sp.scale.set(1500, 375, 1);
    return sp;
  }

  var routeColors = {};   // route_id -> THREE.Color
  var proj = null;        // {lat0, lon0, mLat, mLon}

  function project(lat, lon) {
    return [(lon - proj.lon0) * proj.mLon, -(lat - proj.lat0) * proj.mLat];
  }

  var busMesh = new THREE.InstancedMesh(
    new THREE.BoxGeometry(60, 42, 150),
    new THREE.MeshLambertMaterial({ color: 0xffffff, emissive: 0x222222 }),
    MAX_BUS
  );
  busMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  busMesh.count = 0;
  busMesh.frustumCulled = false;
  scene.add(busMesh);
  var dummy = new THREE.Object3D();
  var tmpColor = new THREE.Color();

  function updateBuses(vehicles) {
    var n = 0;
    for (var i = 0; i < vehicles.length && n < MAX_BUS; i++) {
      var v = vehicles[i];
      if (v.lat == null || v.lon == null) continue;
      var p = project(v.lat, v.lon);
      dummy.position.set(p[0], 75, p[1]);
      dummy.rotation.set(0, Math.PI - (v.bearing || 0) * DEG, 0);
      dummy.updateMatrix();
      busMesh.setMatrixAt(n, dummy.matrix);
      var c = routeColors[v.route_id];
      busMesh.setColorAt(n, c ? tmpColor.copy(c) : tmpColor.set(0xf5f2ea));
      n++;
    }
    busMesh.count = n;
    busMesh.instanceMatrix.needsUpdate = true;
    if (busMesh.instanceColor) busMesh.instanceColor.needsUpdate = true;
    return n;
  }

  function setStatus(html) { if (statusEl) statusEl.innerHTML = html; }

  function poll() {
    var proxy = (window.FORGE_LIVE_PROXY || '').replace(/\/$/, '');
    if (!proxy) { setStatus('Live feed not configured — showing scheduled routes.'); return; }
    fetch(proxy + '/api/vehicles', { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
      .then(function (d) {
        if (!d || !Array.isArray(d.vehicles)) throw new Error('bad payload');
        var n = updateBuses(d.vehicles);
        var when = d.generated_at ? new Date(d.generated_at) : null;
        setStatus('<strong>' + n + '</strong> buses tracked live' +
          (when && !isNaN(when) ? ' · updated ' + when.toLocaleTimeString() : ''));
      })
      .catch(function () {
        setStatus('Live positions unavailable right now — showing scheduled routes. Retrying…');
      });
  }

  function resize() {
    var w = container.clientWidth || 800;
    var h = container.clientHeight || 480;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  fetch('ddot-routes-3d.json?v=' + STAMP, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(function (data) {
      proj = {
        lat0: data.projection.lat0,
        lon0: data.projection.lon0,
        mLat: 111320,
        mLon: 111320 * Math.cos(data.projection.lat0 * DEG)
      };
      var casingMat = new THREE.MeshBasicMaterial({ color: 0x0c1116, transparent: true, opacity: 0.9 });
      data.routes.forEach(function (route) {
        var color = new THREE.Color(route.color);
        routeColors[route.id] = color;
        var mat = new THREE.MeshBasicMaterial({ color: color });
        var longest = null;
        route.paths.forEach(function (path) {
          if (path.length < 2) return;
          scene.add(new THREE.Mesh(ribbonGeometry(path, 95, 5), casingMat));
          scene.add(new THREE.Mesh(ribbonGeometry(path, 58, 6), mat));
          if (!longest || path.length > longest.length) longest = path;
        });
        if (longest) {
          var mid = longest[Math.floor(longest.length / 2)];
          var label = makeLabel(route.id + ' · ' + route.name, route.color);
          label.position.set(mid[0], 520, mid[1]);
          scene.add(label);
        }
      });
      resize();
      setStatus('Loading live positions…');
      poll();
      setInterval(poll, POLL_MS);
      renderer.setAnimationLoop(function () { controls.update(); renderer.render(scene, camera); });
    })
    .catch(function () {
      fail('Could not load route data — the live bus count above still works.');
    });

  resize();
})();
