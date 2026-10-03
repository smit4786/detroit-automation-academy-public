/* Live Transit · Detroit — dedicated 3D page.
 *
 * All 37 DDOT routes (GTFS shapes) rendered as elevated 3D guideways, with
 * live bus positions polled from the Forge Line proxy every 60s. Bus pillars
 * are InstancedMesh (4 draw calls total); zooming in swaps to true-scale bus
 * models built lazily. Instant paint from the logged history file, with
 * honest live/retry badge states. Route filters by group (ConnectTen /
 * Primary / Neighborhood) plus per-route chips.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function () {
  'use strict';

  var STAMP = '20261002-2405';
  var POLL_MS = 60000;
  var BUS_MAX = 400;
  var DETAIL_MAX = 48;
  var DEG = Math.PI / 180;
  var COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
  var HISTORY_URL = 'https://raw.githubusercontent.com/smit4786/forge-line-transit-data/main/data/latest.json';

  var container = document.getElementById('live-map');
  if (!container) return;
  var $ = function (id) { return document.getElementById(id); };

  function fail(msg) {
    container.innerHTML = '<div class="map-fallback"><p>' + msg + '</p></div>';
  }

  var renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias: true });
  } catch (e) {
    fail('3D is not available in this browser.');
    return;
  }
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  container.appendChild(renderer.domElement);

  var scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0c1116);
  scene.fog = new THREE.Fog(0x0c1116, 32000, 75000);

  var camera = new THREE.PerspectiveCamera(42, 1, 100, 140000);
  camera.position.set(0, 8500, 16500);

  var controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.08;
  controls.maxPolarAngle = 1.35;
  controls.minDistance = 1200;
  controls.maxDistance = 55000;

  // Touchscreen navigation: one finger drags the map (like a maps app),
  // pinch zooms and two-finger twist rotates. Desktop keeps drag-orbit.
  var homePos = camera.position.clone();
  var homeTarget = controls.target.clone();
  var isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  if (isTouch) {
    controls.touches.ONE = THREE.TOUCH.PAN;
    controls.touches.TWO = THREE.TOUCH.DOLLY_ROTATE;
  }

  scene.add(new THREE.HemisphereLight(0xf5f2ea, 0x0c1116, 0.9));
  var sun = new THREE.DirectionalLight(0xffffff, 0.7);
  sun.position.set(9000, 14000, 5000);
  scene.add(sun);

  // --- textures -----------------------------------------------------------
  function radialTex(inner, mid) {
    var c = document.createElement('canvas');
    c.width = c.height = 256;
    var x = c.getContext('2d');
    var g = x.createRadialGradient(128, 128, 8, 128, 128, 126);
    g.addColorStop(0, inner);
    g.addColorStop(0.45, mid);
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 256, 256);
    return new THREE.CanvasTexture(c);
  }
  var glowTex = radialTex('rgba(255,255,255,1)', 'rgba(255,255,255,0.35)');

  // Street-map underlay bounds (WGS84 corners of the z12 tile mosaic).
  var STREET_BOUNDS = { lonW: -83.3431083, lonE: -82.8992288, latN: 42.47997522924901, latS: 42.25539743550126 };
  var streetTex = new THREE.TextureLoader().load('assets/detroit-streets-z12.png?v=' + STAMP);
  streetTex.anisotropy = 8;
  streetTex.colorSpace = THREE.SRGBColorSpace;

  var grid = new THREE.GridHelper(40000, 40, 0x2a3542, 0x1a2330);
  grid.position.y = 0.5;
  grid.material.transparent = true;
  grid.material.opacity = 0.42;
  scene.add(grid);

  // --- geometry helpers ---------------------------------------------------
  function ribbonGeometry(pts, width, y) {
    var n = pts.length;
    var pos = new Float32Array(n * 2 * 3);
    var idx = [];
    for (var i = 0; i < n; i++) {
      var p = pts[i];
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      var dx = b[0] - a[0], dz = b[1] - a[1];
      var len = Math.hypot(dx, dz) || 1;
      var nx = -dz / len, nz = dx / len, hw = width / 2;
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
    return g;
  }

  // Vertical skirts under an elevated ribbon: turns a flat strip into a solid
  // 3D guideway. One skirt per edge, from y=0 up to yTop.
  function skirtGeometry(pts, width, yTop) {
    var n = pts.length;
    var pos = [];
    var idx = [];
    function edgePt(i, side, y) {
      var p = pts[i];
      var a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
      var dx = b[0] - a[0], dz = b[1] - a[1];
      var len = Math.hypot(dx, dz) || 1;
      var nx = -dz / len, nz = dx / len, hw = width / 2;
      return [p[0] + nx * hw * side, y, p[1] + nz * hw * side];
    }
    [1, -1].forEach(function (side) {
      var base = pos.length / 3;
      for (var i = 0; i < n; i++) {
        var b = edgePt(i, side, 0), t = edgePt(i, side, yTop);
        pos.push(b[0], b[1], b[2], t[0], t[1], t[2]);
        if (i < n - 1) {
          var k = base + i * 2;
          idx.push(k, k + 2, k + 1, k + 1, k + 2, k + 3);
        }
      }
    });
    var g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(pos), 3));
    g.setIndex(idx);
    g.computeVertexNormals();
    return g;
  }

  function makeLabel(text, colorHex) {
    var c = document.createElement('canvas');
    c.width = 512; c.height = 128;
    var x = c.getContext('2d');
    x.fillStyle = 'rgba(12,17,22,0.85)';
    x.beginPath();
    if (x.roundRect) x.roundRect(6, 14, 500, 100, 50); else x.rect(6, 14, 500, 100);
    x.fill();
    x.strokeStyle = colorHex; x.lineWidth = 4; x.stroke();
    x.fillStyle = colorHex;
    x.font = '600 52px "Space Grotesk", sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(text, 256, 68);
    var tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    var sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    sp.scale.set(1500, 375, 1);
    return sp;
  }

  // --- state ---------------------------------------------------------------
  var routeColors = {};   // id -> THREE.Color
  var routeNames = {};    // id -> name
  var routeById = {};     // id -> route record from JSON
  var routeGroups = {};   // route id -> THREE.Group (guideway + label + tether)
  var groupObjs = {};     // group id -> THREE.Group (stops cloud)
  var routeOrder = [];
  var groupOrder = [];
  var labelSprites = [];  // { sprite, routeId }
  var liveCounts = {};    // route id -> live bus count (raw, pre-filter)
  // Smart disabling: per-route running state. 'unknown' until the first live
  // poll (history paint never marks routes not-running). A route flips to
  // 'not-running' only after 3 consecutive polls with zero buses (grace
  // against brief feed dropouts); any bus resets the streak immediately.
  var runningState = {};  // rid -> 'unknown' | 'running' | 'not-running'
  var quietStreak = {};   // rid -> consecutive polls with zero buses
  var DIM_OPACITY = 0.22;
  var proj = null;

  function project(lat, lon) {
    return [(lon - proj.lon0) * proj.mLon, -(lat - proj.lat0) * proj.mLat];
  }

  // --- fleet data: vehicle number -> model, dimensions, seating ----------------
  var fleetData = null;
  function fleetLookup(vehicleId) {
    var fallback = { model: '40-ft transit bus', detail: 'model assumed', length_m: 12.19, width_m: 2.59, height_m: 3.3, seats: null, assumed: true };
    if (!fleetData || !fleetData.ranges) return fallback;
    var m = String(vehicleId == null ? '' : vehicleId).match(/^(\d+)/);
    if (!m) return fallback;
    var num = parseInt(m[1], 10);
    for (var i = 0; i < fleetData.ranges.length; i++) {
      var r = fleetData.ranges[i];
      if (num >= r.from && num <= r.to) {
        return {
          model: r.model,
          detail: r.year + (r.note ? ' · ' + r.note : ''),
          length_m: r.length_m, width_m: r.width_m, height_m: r.height_m,
          seats: r.seats, assumed: false
        };
      }
    }
    return fallback;
  }

  // --- bus pillars: InstancedMesh, 4 draw calls total --------------------------
  var PILLAR_H = 620;
  var pillarGlowIM = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(58, 58, PILLAR_H, 12, 1, true),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.30, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    BUS_MAX);
  var pillarCoreIM = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(20, 27, PILLAR_H, 10),
    new THREE.MeshLambertMaterial({}),
    BUS_MAX);
  var pillarBeaconIM = new THREE.InstancedMesh(
    new THREE.SphereGeometry(64, 16, 12),
    new THREE.MeshBasicMaterial({}),
    BUS_MAX);
  var pillarRingIM = new THREE.InstancedMesh(
    new THREE.RingGeometry(72, 124, 28),
    new THREE.MeshBasicMaterial({ transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
    BUS_MAX);
  var pillarMeshes = [pillarGlowIM, pillarCoreIM, pillarBeaconIM, pillarRingIM];
  pillarMeshes.forEach(function (im) {
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.count = 0;
    im.frustumCulled = false;
    scene.add(im);
  });

  // True-scale bus geometry (shared; detail groups built lazily for busMode).
  var busBodyGeo = new THREE.BoxGeometry(1, 1, 1);
  var busWinGeo = new THREE.BoxGeometry(1, 1, 1);
  var wheelGeo = new THREE.CylinderGeometry(0.55, 0.55, 0.4, 12);
  var busWinMat = new THREE.MeshBasicMaterial({ color: 0x10161c });
  var wheelMat = new THREE.MeshBasicMaterial({ color: 0x05070a });

  var detailPool = [];
  function getDetail(i) {
    if (!detailPool[i]) {
      var g = new THREE.Group();
      var body = new THREE.Mesh(busBodyGeo, new THREE.MeshLambertMaterial({ color: 0xffffff }));
      var wins = new THREE.Mesh(busWinGeo, busWinMat);
      var wheels = [];
      for (var k = 0; k < 4; k++) {
        var wh = new THREE.Mesh(wheelGeo, wheelMat);
        wh.rotation.x = Math.PI / 2;
        wheels.push(wh);
        g.add(wh);
      }
      g.add(body); g.add(wins);
      g.visible = false;
      body.userData.detail = null; // set below
      scene.add(g);
      var d = { group: g, body: body, wins: wins, wheels: wheels, vehicle: null };
      body.userData.detail = d;
      detailPool[i] = d;
    }
    return detailPool[i];
  }

  // busSlots[i]: one entry per currently visible bus (index == instance id).
  var busSlots = [];

  var _m4 = new THREE.Matrix4();
  var _p3 = new THREE.Vector3();
  var _q3 = new THREE.Quaternion();
  var _s3 = new THREE.Vector3(1, 1, 1);
  var _ringQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(-Math.PI / 2, 0, 0));

  function markColorsDirty() {
    pillarMeshes.forEach(function (im) {
      if (im.instanceColor) im.instanceColor.needsUpdate = true;
    });
  }

  function renderBusInstances() {
    var n = busSlots.length;
    if (busMode) {
      pillarMeshes.forEach(function (im) { im.visible = false; });
      var dn = Math.min(n, DETAIL_MAX);
      for (var i = 0; i < DETAIL_MAX; i++) {
        var d = getDetail(i);
        if (i < dn) {
          var s = busSlots[i];
          var fi = fleetLookup(s.vehicle.vehicle_id);
          d.group.position.set(s.x, 0, s.z);
          d.group.rotation.y = s.rotY;
          d.body.scale.set(fi.length_m, fi.height_m, fi.width_m);
          d.body.position.y = fi.height_m / 2 + 0.35;
          d.body.material.color.copy(s.color);
          d.wins.scale.set(fi.length_m * 0.88, fi.height_m * 0.32, fi.width_m * 1.02);
          d.wins.position.y = fi.height_m * 0.72 + 0.35;
          var wx = fi.length_m * 0.32, wz = fi.width_m / 2;
          d.wheels[0].position.set(wx, 0.55, wz);
          d.wheels[1].position.set(wx, 0.55, -wz);
          d.wheels[2].position.set(-wx, 0.55, wz);
          d.wheels[3].position.set(-wx, 0.55, -wz);
          d.vehicle = s.vehicle;
          d.group.visible = true;
        } else {
          d.group.visible = false;
          d.vehicle = null;
        }
      }
      return;
    }
    // Pillar mode: hide detail models, fill instances.
    for (var j = 0; j < DETAIL_MAX; j++) {
      if (detailPool[j]) { detailPool[j].group.visible = false; detailPool[j].vehicle = null; }
    }
    pillarMeshes.forEach(function (im) { im.visible = true; });
    for (var k = 0; k < n; k++) {
      var b = busSlots[k];
      _p3.set(b.x, PILLAR_H / 2, b.z);
      _q3.identity();
      _m4.compose(_p3, _q3, _s3);
      pillarGlowIM.setMatrixAt(k, _m4);
      pillarCoreIM.setMatrixAt(k, _m4);
      _p3.set(b.x, PILLAR_H + 40, b.z);
      _m4.compose(_p3, _q3, _s3);
      pillarBeaconIM.setMatrixAt(k, _m4);
      _p3.set(b.x, 6, b.z);
      _m4.compose(_p3, _ringQ, _s3);
      pillarRingIM.setMatrixAt(k, _m4);
      pillarGlowIM.setColorAt(k, b.color);
      pillarCoreIM.setColorAt(k, b.color);
      pillarBeaconIM.setColorAt(k, b.color);
      pillarRingIM.setColorAt(k, b.color);
    }
    pillarMeshes.forEach(function (im) {
      im.count = n;
      im.instanceMatrix.needsUpdate = true;
    });
    markColorsDirty();
  }

  // Zoom LOD: wide view shows the symbolic pillars; zoomed in past ~2.6 km
  // the markers resolve into true-scale bus models. Hysteresis avoids flicker.
  var busMode = false;
  function updateLOD() {
    var d = camera.position.distanceTo(controls.target);
    if (!busMode && d < 2600) busMode = true;
    else if (busMode && d > 3400) busMode = false;
  }

  var raycaster = new THREE.Raycaster();
  var pointerNDC = new THREE.Vector2();
  var downPos = null;
  function pickBus(cx, cy) {
    var r = renderer.domElement.getBoundingClientRect();
    pointerNDC.set(
      ((cx - r.left) / r.width) * 2 - 1,
      -((cy - r.top) / r.height) * 2 + 1
    );
    raycaster.setFromCamera(pointerNDC, camera);
    if (busMode) {
      var bodies = [];
      for (var i = 0; i < DETAIL_MAX; i++) {
        var d = detailPool[i];
        if (d && d.group.visible) bodies.push(d.body);
      }
      var hits = raycaster.intersectObjects(bodies);
      return hits.length ? hits[0].object.userData.detail.vehicle : null;
    }
    var ih = raycaster.intersectObject(pillarCoreIM);
    if (ih.length && ih[0].instanceId != null && busSlots[ih[0].instanceId]) {
      return busSlots[ih[0].instanceId].vehicle;
    }
    return null;
  }
  renderer.domElement.addEventListener('pointerdown', function (e) {
    downPos = [e.clientX, e.clientY];
  });
  renderer.domElement.addEventListener('pointerup', function (e) {
    if (!downPos) return;
    var dx = e.clientX - downPos[0], dy = e.clientY - downPos[1];
    downPos = null;
    if (dx * dx + dy * dy > 36) return; // was a drag
    var v = pickBus(e.clientX, e.clientY);
    if (v) showBus(v); else hideBus();
  });
  renderer.domElement.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || downPos) return;
    renderer.domElement.style.cursor = pickBus(e.clientX, e.clientY) ? 'pointer' : 'grab';
  });

  function compass(bearing) {
    if (bearing == null || isNaN(bearing)) return '–';
    return COMPASS[Math.round(bearing / 45) % 8] + ' (' + Math.round(bearing) + '°)';
  }

  function showBus(v) {
    if (!v) return;
    var sn = v.route_id;
    $('bus-chip').style.background = routeColors[sn] ? '#' + routeColors[sn].getHexString() : '#F5F2EA';
    $('bus-title').textContent = sn + ' · ' + (routeNames[sn] || 'DDOT');
    $('bus-id').textContent = v.vehicle_id || '–';
    $('bus-speed').textContent = (v.speed_mph != null && !isNaN(v.speed_mph)) ? Math.round(v.speed_mph) + ' mph' : '–';
    $('bus-heading').textContent = compass(v.bearing);
    var fi = fleetLookup(v.vehicle_id);
    $('bus-model').textContent = fi.model + ' · ' + fi.detail;
    $('bus-cap').textContent = (fi.seats != null ? fi.seats + ' seats · ' : '') + fi.length_m.toFixed(1) + ' m long';
    var when = v.updated_at ? new Date(v.updated_at) : null;
    $('bus-card-updated').textContent = (when && !isNaN(when)) ? when.toLocaleTimeString() : '–';
    $('bus-card').hidden = false;
  }
  function hideBus() { $('bus-card').hidden = true; }
  $('bus-close').addEventListener('click', hideBus);

  // --- map navigation tools ----------------------------------------------------
  function zoomStep(dir) {
    var off = camera.position.clone().sub(controls.target);
    var len = off.length() * (dir > 0 ? 0.8 : 1.25);
    len = Math.max(controls.minDistance, Math.min(controls.maxDistance, len));
    off.setLength(len);
    camera.position.copy(controls.target).add(off);
  }
  function resetView() {
    camera.position.copy(homePos);
    controls.target.copy(homeTarget);
  }
  $('zoom-in').addEventListener('click', function () { zoomStep(1); });
  $('zoom-out').addEventListener('click', function () { zoomStep(-1); });
  $('view-reset').addEventListener('click', resetView);
  if (isTouch) {
    var hint = document.querySelector('.map-hint');
    if (hint) {
      hint.innerHTML = 'drag&nbsp;·&nbsp;move&nbsp;&nbsp;&nbsp;pinch&nbsp;·&nbsp;zoom&nbsp;&nbsp;&nbsp;tap bus&nbsp;·&nbsp;details';
      hint.classList.add('touch');
    }
  }

  // --- navigation tutorial overlay ---------------------------------------------
  var ICO_FINDME = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="7"/><circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3"/></svg>';
  var ICO_FULL = '<svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg>';
  var NAV_STEPS_TOUCH = [
    ['\u2194', 'Drag', 'Move around the city'],
    ['+', 'Pinch', 'Zoom in and out'],
    ['\u27F3', 'Two-finger twist', 'Rotate the view'],
    ['\u25CF', 'Tap a bus', 'Vehicle number, model, speed and heading'],
    [ICO_FINDME, 'Find me', 'Center the map on your location'],
    [ICO_FULL, 'Fullscreen', 'Fill the screen with the map'],
    ['\u29E9', 'Routes', 'Filter by group or individual route'],
    ['\u2302', 'Reset view', 'Return to the full-system view']
  ];
  var NAV_STEPS_DESK = [
    ['\u27F3', 'Drag', 'Orbit the view'],
    ['+', 'Scroll', 'Zoom in and out'],
    ['\u2194', 'Right-drag', 'Pan across the city'],
    ['\u25CF', 'Click a bus', 'Vehicle number, model, speed and heading'],
    [ICO_FINDME, 'Find me', 'Center the map on your location'],
    [ICO_FULL, 'Fullscreen', 'Fill the screen with the map'],
    ['\u29E9', 'Routes', 'Filter by group or individual route'],
    ['\u2302', 'Reset view', 'Return to the full-system view']
  ];
  function buildNavOverlay() {
    var host = $('nav-steps');
    host.innerHTML = '';
    (isTouch ? NAV_STEPS_TOUCH : NAV_STEPS_DESK).forEach(function (s) {
      var d = document.createElement('div');
      d.className = 'nav-step';
      d.innerHTML = '<span class="ico">' + s[0] + '</span><div><b>' + s[1] + '</b><span>' + s[2] + '</span></div>';
      host.appendChild(d);
    });
  }
  function toggleNavOverlay(force) {
    var ov = $('nav-overlay');
    var show = (typeof force === 'boolean') ? force : ov.hidden;
    if (show) buildNavOverlay();
    ov.hidden = !show;
    $('nav-help').setAttribute('aria-expanded', String(show));
  }
  $('nav-help').addEventListener('click', function () { toggleNavOverlay(); });
  $('nav-close').addEventListener('click', function () { toggleNavOverlay(false); });
  $('nav-overlay').addEventListener('click', function (e) { if (e.target === this) toggleNavOverlay(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') toggleNavOverlay(false); });

  // --- routes panel: minimize + resize -----------------------------------------
  var panel = $('filter-panel');
  var PANEL_MIN_W = 240, PANEL_MAX_W = 560, PANEL_MIN_H = 140;
  function panelMaxH() { return Math.max(220, window.innerHeight - 140); }
  function setPanelMin(min) {
    panel.classList.toggle('minimized', min);
    var b = $('panel-min');
    b.textContent = min ? '+' : '\u2013';
    b.setAttribute('aria-label', min ? 'Expand routes panel' : 'Minimize routes panel');
    b.setAttribute('aria-expanded', String(!min));
    try { localStorage.setItem('lt-panel-min', min ? '1' : '0'); } catch (e) {}
  }
  (function applyPanelPrefs() {
    if (window.innerWidth <= 640) return;
    try {
      var w = parseInt(localStorage.getItem('lt-panel-w'), 10);
      var h = parseInt(localStorage.getItem('lt-panel-h'), 10);
      if (w >= PANEL_MIN_W && w <= PANEL_MAX_W) panel.style.width = w + 'px';
      if (h >= PANEL_MIN_H && h <= panelMaxH()) { panel.style.height = h + 'px'; panel.style.maxHeight = 'none'; }
      if (localStorage.getItem('lt-panel-min') === '1') setPanelMin(true);
    } catch (e) {}
  })();
  $('panel-min').addEventListener('click', function () { setPanelMin(!panel.classList.contains('minimized')); });
  var grip = $('panel-resize'), rsz = null;
  grip.addEventListener('pointerdown', function (e) {
    if (window.innerWidth <= 640) return;
    e.preventDefault();
    try { grip.setPointerCapture(e.pointerId); } catch (err) {}
    rsz = { x: e.clientX, y: e.clientY, w: panel.offsetWidth, h: panel.offsetHeight };
  });
  grip.addEventListener('pointermove', function (e) {
    if (!rsz) return;
    var w = Math.min(PANEL_MAX_W, Math.max(PANEL_MIN_W, rsz.w + (rsz.x - e.clientX)));
    var h = Math.min(panelMaxH(), Math.max(PANEL_MIN_H, rsz.h + (e.clientY - rsz.y)));
    panel.style.width = w + 'px';
    panel.style.height = h + 'px';
    panel.style.maxHeight = 'none';
  });
  function endResize(save) {
    if (!rsz) return;
    if (save) {
      try {
        localStorage.setItem('lt-panel-w', String(panel.offsetWidth));
        localStorage.setItem('lt-panel-h', String(panel.offsetHeight));
      } catch (e) {}
    }
    rsz = null;
  }
  grip.addEventListener('pointerup', function () { endResize(true); });
  grip.addEventListener('pointercancel', function () { endResize(false); });

  // --- fullscreen toggle (native API, CSS fallback for iOS Safari) -----------------
  var stage = document.querySelector('.map-stage');
  var fullBtn = $('view-full');
  function nativeFsEl() { return document.fullscreenElement || document.webkitFullscreenElement || null; }
  function fsActive() { return !!nativeFsEl() || stage.classList.contains('pseudo-full'); }
  function setFsBtn() {
    var on = fsActive();
    fullBtn.setAttribute('aria-pressed', String(on));
    fullBtn.setAttribute('aria-label', on ? 'Exit fullscreen' : 'Enter fullscreen');
  }
  function setPseudoFull(on) {
    stage.classList.toggle('pseudo-full', on);
    document.body.classList.toggle('pseudo-full-lock', on);
    setFsBtn();
    notifyMapResize();
  }
  fullBtn.addEventListener('click', function () {
    if (nativeFsEl()) {
      var exit = document.exitFullscreen || document.webkitExitFullscreen;
      if (exit) exit.call(document);
      return;
    }
    if (stage.classList.contains('pseudo-full')) { setPseudoFull(false); return; }
    var el = document.documentElement;
    var req = el.requestFullscreen || el.webkitRequestFullscreen;
    if (req) {
      try {
        var p = req.call(el);
        if (p && p.catch) p.catch(function () { setPseudoFull(true); });
      } catch (e) { setPseudoFull(true); }
    } else {
      setPseudoFull(true);
    }
    setFsBtn();
  });
  function notifyMapResize() {
    try { window.dispatchEvent(new Event('resize')); } catch (e) {}
  }
  function onFsChange() { setFsBtn(); notifyMapResize(); }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && stage.classList.contains('pseudo-full')) setPseudoFull(false);
  });

  // --- location services ---------------------------------------------------------
  // Coverage = the Detroit street mosaic bounds (DDOT's service area).
  function inCoverage(lat, lon) {
    return lat <= STREET_BOUNDS.latN && lat >= STREET_BOUNDS.latS &&
           lon >= STREET_BOUNDS.lonW && lon <= STREET_BOUNDS.lonE;
  }
  // --- 3D user representation (scaffold) -----------------------------------------
  // Branded "you are here" marker: Forge Orange beam + floating Forge D badge.
  // Built to extend: heading wedge, accuracy disc, and label hooks live here.
  var YOU_BADGE_Y = 1250, YOU_BADGE_BOB = 70;
  var youMarker = (function () {
    var g = new THREE.Group();

    var beam = new THREE.Mesh(
      new THREE.CylinderGeometry(30, 30, 1000, 12, 1, true),
      new THREE.MeshBasicMaterial({ color: 0xE85D1A, transparent: true, opacity: 0.45, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
    );
    beam.position.y = 500;
    g.add(beam);

    var ring = new THREE.Mesh(
      new THREE.RingGeometry(120, 170, 40),
      new THREE.MeshBasicMaterial({ color: 0xE85D1A, transparent: true, opacity: 0.65, side: THREE.DoubleSide, depthWrite: false })
    );
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 40;
    g.add(ring);

    var accDisc = new THREE.Mesh(
      new THREE.CircleGeometry(200, 40),
      new THREE.MeshBasicMaterial({ color: 0xE85D1A, transparent: true, opacity: 0.12, depthWrite: false })
    );
    accDisc.rotation.x = -Math.PI / 2;
    accDisc.position.y = 30;
    g.add(accDisc);

    var badge = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false }));
    badge.scale.set(760, 760, 1);
    badge.position.y = YOU_BADGE_Y;
    g.add(badge);

    g.visible = false;
    scene.add(g);

    // Paint the Forge D badge; falls back to a serif "D" if the logo can't load.
    function paintBadge(img) {
      var S = 256, c = document.createElement('canvas');
      c.width = c.height = S;
      var x = c.getContext('2d');
      x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 4, 0, Math.PI * 2);
      x.fillStyle = '#0C1116'; x.fill();
      x.save();
      x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 16, 0, Math.PI * 2); x.clip();
      if (img) { x.drawImage(img, 0, 0, S, S); }
      else {
        x.fillStyle = '#E85D1A';
        x.font = '700 150px Georgia, "Times New Roman", serif';
        x.textAlign = 'center'; x.textBaseline = 'middle';
        x.fillText('D', S / 2, S / 2 + 10);
      }
      x.restore();
      x.lineWidth = 10; x.strokeStyle = '#E85D1A';
      x.beginPath(); x.arc(S / 2, S / 2, S / 2 - 10, 0, Math.PI * 2); x.stroke();
      var tex = new THREE.CanvasTexture(c);
      tex.anisotropy = 4;
      badge.material.map = tex;
      badge.material.needsUpdate = true;
    }
    var logoImg = new Image();
    logoImg.onload = function () { paintBadge(logoImg); };
    logoImg.onerror = function () { paintBadge(null); };
    logoImg.src = 'assets/logo.webp?v=' + STAMP;

    return {
      group: g, badge: badge, ring: ring, beam: beam,
      setAccuracy: function (meters) {
        var r = Math.max(60, Math.min(2000, meters || 200));
        accDisc.scale.set(r / 200, r / 200, 1);
      }
    };
  })();
  var toastTimer = null;
  function hideToast() { $('map-toast').hidden = true; clearTimeout(toastTimer); }
  function showToast(msg, sticky) {
    var t = $('map-toast');
    t.innerHTML = '';
    var s = document.createElement('span');
    s.textContent = msg;
    t.appendChild(s);
    if (sticky) {
      var x = document.createElement('button');
      x.id = 'toast-x';
      x.setAttribute('aria-label', 'Dismiss');
      x.textContent = '\u00D7';
      x.addEventListener('click', function (e) { e.stopPropagation(); hideToast(); });
      t.appendChild(x);
    } else {
      clearTimeout(toastTimer);
      toastTimer = setTimeout(hideToast, 4500);
    }
    t.hidden = false;
  }
  $('map-toast').addEventListener('click', hideToast);
  var locateBtn = $('view-locate'), locating = false;
  function onLocated(lat, lon, accMeters) {
    if (!proj) { showToast('Map is still loading — try again in a moment.'); return; }
    if (!inCoverage(lat, lon)) {
      youMarker.group.visible = false;
      locateBtn.setAttribute('aria-pressed', 'false');
      showToast('Out of bounds — you are outside DDOT\u2019s Detroit coverage area.', true);
      return;
    }
    hideToast();
    var p = project(lat, lon);
    var off = camera.position.clone().sub(controls.target);
    controls.target.set(p[0], 0, p[1]);
    camera.position.copy(controls.target).add(off);
    youMarker.group.position.set(p[0], 0, p[1]);
    youMarker.setAccuracy(accMeters);
    youMarker.group.visible = true;
    locateBtn.setAttribute('aria-pressed', 'true');
  }
  locateBtn.addEventListener('click', function () {
    if (!('geolocation' in navigator)) { showToast('Location services are not available on this device.'); return; }
    if (locating) return;
    locating = true;
    showToast('Locating\u2026');
    navigator.geolocation.getCurrentPosition(
      function (pos) {
        locating = false;
        onLocated(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
      },
      function (err) {
        locating = false;
        if (err && err.code === 1) showToast('Location access denied — allow it in your browser settings to use this.');
        else showToast('Could not get your location — please try again.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });

  // --- filters ---------------------------------------------------------------
  // filterState.groups[gid] + filterState.routes[rid]; a route shows when both.
  // filterState.hideIdle (default ON): fully hide routes confirmed not-running.
  var filterState = { groups: {}, routes: {}, hideIdle: true };

  function routeIsOn(rid) {
    var r = routeById[rid];
    return !!(r && filterState.groups[r.group] && filterState.routes[rid]);
  }

  // Smart disabling: non-running routes are hidden when hideIdle is on,
  // dimmed when it is off. 'unknown' (pre-first-poll) never hides.
  function routeShown(rid) {
    if (!routeIsOn(rid)) return false;
    if (filterState.hideIdle && runningState[rid] === 'not-running') return false;
    return true;
  }

  function applyDim(rid) {
    var g = routeGroups[rid];
    if (!g || !g.userData.guideMats) return;
    var dim = runningState[rid] === 'not-running' && !filterState.hideIdle && g.visible;
    g.userData.guideMats.forEach(function (e) {
      e.mat.transparent = dim ? true : false;
      e.mat.opacity = dim ? DIM_OPACITY : e.opacity;
      e.mat.needsUpdate = true;
    });
  }

  function applyFilters() {
    routeOrder.forEach(function (rid) {
      if (routeGroups[rid]) routeGroups[rid].visible = routeShown(rid);
      applyDim(rid);
    });
    groupOrder.forEach(function (gid) {
      if (groupObjs[gid]) groupObjs[gid].visible = !!filterState.groups[gid];
    });
    if (lastVehicles) updateBuses(lastVehicles);
  }

  function syncFilterUI() {
    groupOrder.forEach(function (gid) {
      var head = document.querySelector('.f-group-head[data-group="' + gid + '"]');
      var sec = document.querySelector('.f-group[data-group="' + gid + '"]');
      if (head) head.setAttribute('aria-pressed', String(!!filterState.groups[gid]));
      if (sec) sec.classList.toggle('off', !filterState.groups[gid]);
    });
    routeOrder.forEach(function (rid) {
      var b = document.querySelector('.f-chip[data-route="' + rid + '"]');
      if (b) b.setAttribute('aria-pressed', String(!!filterState.routes[rid]));
    });
    var idle = $('hide-idle-toggle');
    if (idle) idle.setAttribute('aria-pressed', String(!!filterState.hideIdle));
  }

  function buildFilterPanel(groups) {
    var host = $('filter-groups');
    host.innerHTML = '';
    groups.forEach(function (g) {
      filterState.groups[g.id] = true;
      var sec = document.createElement('div');
      sec.className = 'f-group';
      sec.dataset.group = g.id;
      var head = document.createElement('button');
      head.className = 'f-group-head';
      head.dataset.group = g.id;
      head.setAttribute('aria-pressed', 'true');
      head.innerHTML = '<span class="f-box"></span><b>' + g.name + '</b>' +
        '<span class="f-count" id="fgc-' + g.id + '">–</span>';
      head.addEventListener('click', function () {
        var on = !filterState.groups[g.id];
        filterState.groups[g.id] = on;
        g.routes.forEach(function (rid) { filterState.routes[rid] = on; });
        applyFilters();
        syncFilterUI();
      });
      var list = document.createElement('div');
      list.className = 'f-routes';
      g.routes.forEach(function (rid) {
        var route = routeById[rid];
        if (!route) return;
        filterState.routes[rid] = true;
        var b = document.createElement('button');
        b.className = 'route-chip f-chip';
        b.setAttribute('aria-pressed', 'true');
        b.dataset.route = rid;
        b.innerHTML = '<i style="background:' + route.color + '"></i><b>' +
          rid + ' · ' + route.name + '</b><span class="cnt" id="cnt-' + rid + '">–</span>' +
          '<span class="idle-tag" id="idle-' + rid + '" hidden>not running</span>';
        b.addEventListener('click', function () {
          filterState.routes[rid] = !filterState.routes[rid];
          applyFilters();
          syncFilterUI();
        });
        list.appendChild(b);
      });
      sec.appendChild(head);
      sec.appendChild(list);
      host.appendChild(sec);
    });
    $('filter-all').addEventListener('click', function () {
      groupOrder.forEach(function (gid) { filterState.groups[gid] = true; });
      routeOrder.forEach(function (rid) { filterState.routes[rid] = true; });
      applyFilters();
      syncFilterUI();
    });
    $('filter-none').addEventListener('click', function () {
      groupOrder.forEach(function (gid) { filterState.groups[gid] = false; });
      routeOrder.forEach(function (rid) { filterState.routes[rid] = false; });
      applyFilters();
      syncFilterUI();
    });
    $('hide-idle-toggle').addEventListener('click', function () {
      filterState.hideIdle = !filterState.hideIdle;
      applyFilters();
      syncFilterUI();
    });
  }

  function togglePanel(force) {
    var panel = $('filter-panel');
    var btn = $('filter-btn');
    var show = (typeof force === 'boolean') ? force : panel.hidden;
    panel.hidden = !show;
    btn.setAttribute('aria-expanded', String(show));
  }

  // --- header badge ------------------------------------------------------------
  var liveEverOk = false;
  var historyOk = false;
  var lastTotal = null;

  function fmtTime(when) {
    return (when && !isNaN(when)) ? when.toLocaleTimeString() : '–';
  }

  function setHeader(total, text, warn) {
    $('bus-total').textContent = (total != null) ? total : '–';
    var el = $('bus-updated');
    el.textContent = text;
    el.className = warn ? 'feed-warn' : '';
  }

  function updateCounts() {
    routeOrder.forEach(function (rid) {
      var el = $('cnt-' + rid);
      if (el) el.textContent = String(liveCounts[rid] || 0);
      var nr = runningState[rid] === 'not-running';
      var chip = document.querySelector('.f-chip[data-route="' + rid + '"]');
      if (chip) chip.classList.toggle('not-running', nr);
      var tag = $('idle-' + rid);
      if (tag) tag.hidden = !nr;
    });
    groupOrder.forEach(function (gid) {
      var el = $('fgc-' + gid);
      if (!el) return;
      if (!liveEverOk) { el.textContent = '–'; return; }
      var run = 0;
      var tot = (groupRoutes[gid] || []).length;
      (groupRoutes[gid] || []).forEach(function (rid) {
        if (runningState[rid] === 'running') run++;
      });
      el.textContent = run + ' of ' + tot + ' running';
    });
  }

  var groupRoutes = {}; // gid -> [route ids]
  var lastVehicles = null;

  // Recompute per-route running state from the latest live counts.
  // Returns true if any route flipped between running/not-running.
  function updateRunningState() {
    var changed = false;
    routeOrder.forEach(function (rid) {
      var buses = liveCounts[rid] || 0;
      if (buses > 0) {
        quietStreak[rid] = 0;
        if (runningState[rid] !== 'running') { runningState[rid] = 'running'; changed = true; }
      } else {
        quietStreak[rid] = (quietStreak[rid] || 0) + 1;
        if (quietStreak[rid] >= 3 && runningState[rid] !== 'not-running') {
          runningState[rid] = 'not-running'; changed = true;
        }
      }
    });
    return changed;
  }

  // Raw per-route bus counts from the live feed, BEFORE any visibility
  // filtering. The running-state engine must see the street, not the render:
  // counting only visible routes meant a hidden route could never recover,
  // and user filtering ("All off") falsely marked running routes not-running.
  function countByRoute(vehicles) {
    var m = {};
    for (var i = 0; i < vehicles.length; i++) {
      var v = vehicles[i];
      if (v.lat == null || v.lon == null) continue;
      if (!routeById[v.route_id]) continue;
      m[v.route_id] = (m[v.route_id] || 0) + 1;
    }
    return m;
  }

  function updateBuses(vehicles) {
    busSlots = [];
    for (var i = 0; i < vehicles.length && busSlots.length < BUS_MAX; i++) {
      var v = vehicles[i];
      if (v.lat == null || v.lon == null) continue;
      var grp = routeGroups[v.route_id];
      if (!grp || !grp.visible) continue; // unknown or filtered route: skip
      var p = project(v.lat, v.lon);
      var rotY = (v.bearing != null && !isNaN(v.bearing)) ? (90 - v.bearing) * DEG : 0;
      busSlots.push({
        vehicle: v,
        x: p[0], z: p[1],
        rotY: rotY,
        color: routeColors[v.route_id] || new THREE.Color(0xf5f2ea)
      });
    }
    renderBusInstances();
    return busSlots.length;
  }

  function poll() {
    var proxy = (window.FORGE_LIVE_PROXY || '').replace(/\/$/, '');
    if (!proxy) { setHeader(null, 'connecting…', false); return; }
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 20000);
    fetch(proxy + '/api/vehicles', { cache: 'no-store', signal: ctrl.signal })
      .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error('http ' + r.status); return r.json(); },
            function (e) { clearTimeout(timer); throw e; })
      .then(function (d) {
        if (!d || !Array.isArray(d.vehicles)) throw new Error('bad payload');
        lastVehicles = d.vehicles;
        liveEverOk = true;
        liveCounts = countByRoute(d.vehicles); // raw counts first: filters must not starve the state engine
        var n = updateBuses(d.vehicles);
        if (updateRunningState()) {
          applyFilters();   // re-applies visibility + dimming, re-renders buses
          syncFilterUI();
        }
        updateCounts();
        lastTotal = n;
        setHeader(n, 'updated ' + fmtTime(d.generated_at ? new Date(d.generated_at) : null), false);
      })
      .catch(function () {
        var text = liveEverOk
          ? 'live feed retrying…'
          : (historyOk ? 'showing last logged positions · live feed retrying…' : 'live feed retrying…');
        setHeader(lastTotal, text, true);
      });
  }

  // --- instant paint from logged history ---------------------------------------
  var historyRendered = false;
  function maybeRenderHistory() {
    if (historyRendered || !proj || !historyVehicles) return;
    if (liveEverOk) return; // live data already won the race
    historyRendered = true;
    lastVehicles = historyVehicles;
    var n = updateBuses(historyVehicles);
    historyOk = true;
    lastTotal = n;
    setHeader(n, 'last logged ' + fmtTime(historyAt ? new Date(historyAt) : null) + ' — connecting live…', false);
  }
  var historyVehicles = null;
  var historyAt = null;
  function fetchHistory() {
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 10000);
    fetch(HISTORY_URL, { cache: 'no-store', signal: ctrl.signal })
      .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error('http ' + r.status); return r.json(); },
            function (e) { clearTimeout(timer); throw e; })
      .then(function (d) {
        if (!d || !Array.isArray(d.vehicles)) throw new Error('bad history payload');
        historyVehicles = d.vehicles;
        historyAt = d.polled_at ? new Date(d.polled_at) : null;
        maybeRenderHistory();
      })
      .catch(function () { /* history is a bonus; live poll proceeds regardless */ });
  }

  // --- boot --------------------------------------------------------------------
  function resize() {
    var w = container.clientWidth || 800;
    var h = container.clientHeight || 540;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize);

  Promise.all([
    fetch('ddot-routes-3d.json?v=' + STAMP, { cache: 'no-store' })
      .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); }),
    fetch('ddot-fleet.json?v=' + STAMP, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
  ])
    .then(function (all) {
      var data = all[0];
      fleetData = all[1];
      proj = {
        lat0: data.projection.lat0,
        lon0: data.projection.lon0,
        mLat: 111320,
        mLon: 111320 * Math.cos(data.projection.lat0 * DEG)
      };

      // Georeferenced street-map underlay: project the tile mosaic corners
      // through the same transform as the routes so streets sit true.
      (function addStreetUnderlay() {
        var nw = project(STREET_BOUNDS.latN, STREET_BOUNDS.lonW);
        var se = project(STREET_BOUNDS.latS, STREET_BOUNDS.lonE);
        var w = se[0] - nw[0], h = se[1] - nw[1];
        var ground = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ map: streetTex })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(nw[0] + w / 2, 0, nw[1] + h / 2);
        scene.add(ground);
      })();

      var casingMat = new THREE.MeshBasicMaterial({ color: 0x0c1116, transparent: true, opacity: 0.9, side: THREE.DoubleSide });

      // Per-group containers (stops clouds toggle with the group filter).
      groupOrder = data.groups.map(function (g) { return g.id; });
      data.groups.forEach(function (g) {
        groupRoutes[g.id] = g.routes.slice();
        var gr = new THREE.Group();
        scene.add(gr);
        groupObjs[g.id] = gr;
      });

      data.routes.forEach(function (route) {
        var color = new THREE.Color(route.color);
        routeColors[route.id] = color;
        routeNames[route.id] = route.name;
        routeById[route.id] = route;
        routeOrder.push(route.id);
        var grp = new THREE.Group();
        // Elevated guideway: the ribbon deck floats at y=66 with solid
        // skirts to the ground, so routes read as 3D structures. Lambert
        // materials let the directional light shade deck vs. sides.
        var deckMat = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide });
        var skirtMat = new THREE.MeshLambertMaterial({ color: color.clone().multiplyScalar(0.38), side: THREE.DoubleSide });
        // Kept for smart disabling: dim the guideway when the route is not running.
        grp.userData.guideMats = [
          { mat: deckMat, opacity: deckMat.opacity },
          { mat: skirtMat, opacity: skirtMat.opacity }
        ];
        var glowMat = new THREE.MeshBasicMaterial({
          color: color, transparent: true, opacity: 0.13,
          blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
        });
        var longest = null;
        route.paths.forEach(function (path) {
          if (path.length < 2) return;
          grp.add(new THREE.Mesh(ribbonGeometry(path, 230, 2), glowMat));
          grp.add(new THREE.Mesh(ribbonGeometry(path, 95, 4), casingMat));
          var deckGeo = ribbonGeometry(path, 72, 66);
          deckGeo.computeVertexNormals();
          grp.add(new THREE.Mesh(deckGeo, deckMat));
          grp.add(new THREE.Mesh(skirtGeometry(path, 72, 66), skirtMat));
          if (!longest || path.length > longest.length) longest = path;
        });
        if (longest) {
          var mid = longest[Math.floor(longest.length / 2)];
          var label = makeLabel(route.id + ' · ' + route.name, route.color);
          label.position.set(mid[0], 1050, mid[1]);
          grp.add(label);
          labelSprites.push({ sprite: label, routeId: route.id });
          var tetherGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(mid[0], 70, mid[1]),
            new THREE.Vector3(mid[0], 980, mid[1])
          ]);
          grp.add(new THREE.Line(tetherGeo, new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.45 })));
        }
        scene.add(grp);
        routeGroups[route.id] = grp;
      });

      // Stops: one Points cloud per group (3 draw calls), toggled with group.
      var stopTex = glowTex;
      data.groups.forEach(function (g) {
        var inGroup = {};
        g.routes.forEach(function (rid) { inGroup[rid] = true; });
        var pts = (data.stops || []).filter(function (s) {
          return s.r.some(function (rid) { return inGroup[rid]; });
        });
        if (!pts.length) return;
        var pos = new Float32Array(pts.length * 3);
        pts.forEach(function (s, i) { pos.set([s.x, 14, s.z], i * 3); });
        var gg = new THREE.BufferGeometry();
        gg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        var mm = new THREE.PointsMaterial({
          size: 130, map: stopTex, transparent: true, opacity: 0.7,
          color: 0xcfd6dd, depthWrite: false, sizeAttenuation: true
        });
        groupObjs[g.id].add(new THREE.Points(gg, mm));
      });

      buildFilterPanel(data.groups);
      $('filter-btn').addEventListener('click', function () { togglePanel(); });
      document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') togglePanel(false);
      });

      resize();
      setHeader(null, 'connecting…', false);
      fetchHistory();
      maybeRenderHistory();
      poll();
      setInterval(poll, POLL_MS);
      var lastBusMode = null;
      renderer.setAnimationLoop(function () {
        controls.update();
        updateLOD();
        if (youMarker.group.visible) {
          var t = performance.now();
          var s = 1 + 0.22 * Math.sin(t / 420);
          youMarker.ring.scale.set(s, s, s);
          youMarker.badge.position.y = YOU_BADGE_Y + YOU_BADGE_BOB * Math.sin(t / 650);
        }
        if (busMode !== lastBusMode) {
          lastBusMode = busMode;
          renderBusInstances();
        }
        // Label rule: route enabled, not confirmed not-running, AND (live buses
        // on the route OR zoomed far out). Tethers always follow the route.
        var camDist = camera.position.distanceTo(controls.target);
        for (var i = 0; i < labelSprites.length; i++) {
          var L = labelSprites[i];
          L.sprite.visible = runningState[L.routeId] !== 'not-running' &&
            ((liveCounts[L.routeId] > 0) || camDist > 15000);
        }
        renderer.render(scene, camera);
      });
    })
    .catch(function () {
      fail('Could not load route data. Please check your connection and reload.');
    });

  resize();
})();
