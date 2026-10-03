/* Live Transit · Detroit — dedicated 3D page.
 *
 * Real DDOT route shapes + stops (GTFS) rendered in 3D, with live bus
 * positions polled from the Forge Line proxy every 60s. Includes route
 * toggles, per-route live counts, and click-a-bus detail cards.
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

(function () {
  'use strict';

  var STAMP = '20261002-2225';
  var POLL_MS = 60000;
  var DOT_MAX = 240;
  var DEG = Math.PI / 180;
  var COMPASS = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];

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
  controls.minDistance = 3000;
  controls.maxDistance = 55000;

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
  var STREET_BOUNDS = { lonW: -83.3203125, lonE: -82.96875, latN: 42.48830197960225, latS: 42.293564192170074 };
  var streetTex = new THREE.TextureLoader().load('assets/detroit-streets-z12.png?v=' + STAMP);
  streetTex.anisotropy = 8;
  streetTex.colorSpace = THREE.SRGBColorSpace;

  var grid = new THREE.GridHelper(24000, 24, 0x2a3542, 0x1a2330);
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
  var routeGroups = {};   // id -> THREE.Group
  var routeOrder = [];
  var proj = null;

  function project(lat, lon) {
    return [(lon - proj.lon0) * proj.mLon, -(lat - proj.lat0) * proj.mLat];
  }

  // --- bus markers: real 3D pillars, not camera-facing billboards ---------------
  var PILLAR_H = 620;
  var glowPillarGeo = new THREE.CylinderGeometry(58, 58, PILLAR_H, 12, 1, true);
  var corePillarGeo = new THREE.CylinderGeometry(20, 27, PILLAR_H, 10);
  var beaconGeo = new THREE.SphereGeometry(64, 16, 12);
  var ringGeo = new THREE.RingGeometry(72, 124, 28);

  var busMats = {};
  function busMatsFor(routeId) {
    if (!busMats[routeId]) {
      var c = routeColors[routeId] || new THREE.Color(0xf5f2ea);
      busMats[routeId] = {
        glow: new THREE.MeshBasicMaterial({ color: c.clone(), transparent: true, opacity: 0.30, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide }),
        core: new THREE.MeshLambertMaterial({ color: c.clone() }),
        beacon: new THREE.MeshBasicMaterial({ color: c.clone() }),
        ring: new THREE.MeshBasicMaterial({ color: c.clone(), transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide })
      };
    }
    return busMats[routeId];
  }

  function makeBusMarker() {
    var g = new THREE.Group();
    var dm = busMatsFor('__default');
    var glow = new THREE.Mesh(glowPillarGeo, dm.glow);
    glow.position.y = PILLAR_H / 2;
    var core = new THREE.Mesh(corePillarGeo, dm.core);
    core.position.y = PILLAR_H / 2;
    var beacon = new THREE.Mesh(beaconGeo, dm.beacon);
    beacon.position.y = PILLAR_H + 40;
    var ring = new THREE.Mesh(ringGeo, dm.ring);
    ring.rotation.x = -Math.PI / 2;
    ring.position.y = 6;
    g.add(glow); g.add(core); g.add(beacon); g.add(ring);
    g.visible = false;
    g.userData.vehicle = null;
    g.userData.hit = core;
    g.userData.parts = [glow, core, beacon, ring];
    core.userData.markerGroup = g;
    scene.add(g);
    return g;
  }

  var busPool = [];
  for (var di = 0; di < DOT_MAX; di++) busPool.push(makeBusMarker());

  function visibleHitMeshes() {
    var arr = [];
    for (var i = 0; i < busPool.length; i++) {
      if (busPool[i].visible) arr.push(busPool[i].userData.hit);
    }
    return arr;
  }

  var raycaster = new THREE.Raycaster();
  var pointerNDC = new THREE.Vector2();
  var downPos = null;
  renderer.domElement.addEventListener('pointerdown', function (e) {
    downPos = [e.clientX, e.clientY];
  });
  renderer.domElement.addEventListener('pointerup', function (e) {
    if (!downPos) return;
    var dx = e.clientX - downPos[0], dy = e.clientY - downPos[1];
    downPos = null;
    if (dx * dx + dy * dy > 36) return; // was a drag
    var r = renderer.domElement.getBoundingClientRect();
    pointerNDC.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
    raycaster.setFromCamera(pointerNDC, camera);
    var hits = raycaster.intersectObjects(visibleHitMeshes());
    if (hits.length) showBus(hits[0].object.userData.markerGroup.userData.vehicle);
    else hideBus();
  });
  renderer.domElement.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || downPos) return;
    var r = renderer.domElement.getBoundingClientRect();
    pointerNDC.set(
      ((e.clientX - r.left) / r.width) * 2 - 1,
      -((e.clientY - r.top) / r.height) * 2 + 1
    );
    raycaster.setFromCamera(pointerNDC, camera);
    renderer.domElement.style.cursor =
      raycaster.intersectObjects(visibleHitMeshes()).length ? 'pointer' : 'grab';
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
    var when = v.updated_at ? new Date(v.updated_at) : null;
    $('bus-updated').textContent = (when && !isNaN(when)) ? when.toLocaleTimeString() : '–';
    $('bus-card').hidden = false;
  }
  function hideBus() { $('bus-card').hidden = true; }
  $('bus-close').addEventListener('click', hideBus);

  // --- route chips -----------------------------------------------------------
  function buildChips(routes) {
    var bar = $('route-bar');
    bar.innerHTML = '';
    routes.forEach(function (route) {
      var b = document.createElement('button');
      b.className = 'route-chip';
      b.setAttribute('aria-pressed', 'true');
      b.dataset.route = route.id;
      b.innerHTML = '<i style="background:' + route.color + '"></i><b>' +
        route.id + ' · ' + route.name + '</b><span class="cnt" id="cnt-' + route.id + '">–</span>';
      b.addEventListener('click', function () {
        var on = b.getAttribute('aria-pressed') === 'true';
        b.setAttribute('aria-pressed', on ? 'false' : 'true');
        routeGroups[route.id].visible = !on;
      });
      bar.appendChild(b);
    });
  }

  // --- live poll ---------------------------------------------------------------
  var feedOk = true;
  function setHeader(total, when, ok) {
    $('bus-total').textContent = (total != null) ? total : '–';
    var el = $('bus-updated');
    if (ok && when && !isNaN(when)) {
      el.textContent = 'updated ' + when.toLocaleTimeString();
      el.className = '';
    } else if (!ok) {
      el.textContent = 'live feed retrying…';
      el.className = 'feed-warn';
    } else {
      el.textContent = 'connecting…';
      el.className = '';
    }
  }

  function updateBuses(vehicles) {
    var n = 0, perRoute = {};
    for (var i = 0; i < vehicles.length && n < DOT_MAX; i++) {
      var v = vehicles[i];
      if (v.lat == null || v.lon == null) continue;
      var grp = routeGroups[v.route_id];
      if (grp && !grp.visible) continue;
      var p = project(v.lat, v.lon);
      var m = busPool[n];
      m.position.set(p[0], 0, p[1]);
      var bm = busMatsFor(v.route_id);
      var parts = m.userData.parts;
      parts[0].material = bm.glow;
      parts[1].material = bm.core;
      parts[2].material = bm.beacon;
      parts[3].material = bm.ring;
      m.userData.vehicle = v;
      m.visible = true;
      perRoute[v.route_id] = (perRoute[v.route_id] || 0) + 1;
      n++;
    }
    for (var j = n; j < DOT_MAX; j++) { busPool[j].visible = false; busPool[j].userData.vehicle = null; }
    routeOrder.forEach(function (id) {
      var el = $('cnt-' + id);
      if (el) el.textContent = (perRoute[id] || 0) + ' buses';
    });
    return n;
  }

  function poll() {
    var proxy = (window.FORGE_LIVE_PROXY || '').replace(/\/$/, '');
    if (!proxy) { setHeader(null, null, true); return; }
    var ctrl = new AbortController();
    var timer = setTimeout(function () { ctrl.abort(); }, 20000);
    fetch(proxy + '/api/vehicles', { cache: 'no-store', signal: ctrl.signal })
      .then(function (r) { clearTimeout(timer); if (!r.ok) throw new Error('http ' + r.status); return r.json(); },
            function (e) { clearTimeout(timer); throw e; })
      .then(function (d) {
        if (!d || !Array.isArray(d.vehicles)) throw new Error('bad payload');
        var n = updateBuses(d.vehicles);
        feedOk = true;
        setHeader(n, d.generated_at ? new Date(d.generated_at) : null, true);
      })
      .catch(function () {
        feedOk = false;
        setHeader($('bus-total').textContent === '–' ? null : $('bus-total').textContent, null, false);
      });
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

  fetch('ddot-routes-3d.json?v=' + STAMP, { cache: 'no-store' })
    .then(function (r) { if (!r.ok) throw new Error('http ' + r.status); return r.json(); })
    .then(function (data) {
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

      data.routes.forEach(function (route) {
        var color = new THREE.Color(route.color);
        routeColors[route.id] = color;
        routeNames[route.id] = route.name;
        routeOrder.push(route.id);
        var grp = new THREE.Group();
        // Elevated guideway: the ribbon deck floats at y=66 with solid
        // skirts to the ground, so routes read as 3D structures. Lambert
        // materials let the directional light shade deck vs. sides.
        var deckMat = new THREE.MeshLambertMaterial({ color: color, side: THREE.DoubleSide });
        var skirtMat = new THREE.MeshLambertMaterial({ color: color.clone().multiplyScalar(0.38), side: THREE.DoubleSide });
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
          var tetherGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(mid[0], 70, mid[1]),
            new THREE.Vector3(mid[0], 980, mid[1])
          ]);
          grp.add(new THREE.Line(tetherGeo, new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.45 })));
        }
        scene.add(grp);
        routeGroups[route.id] = grp;
      });

      // Stops, one Points cloud per route (toggleable with its route).
      var stopTex = glowTex;
      routeOrder.forEach(function (id) {
        var pts = (data.stops || []).filter(function (s) { return s.r.indexOf(id) !== -1; });
        if (!pts.length) return;
        var pos = new Float32Array(pts.length * 3);
        pts.forEach(function (s, i) { pos.set([s.x, 14, s.z], i * 3); });
        var g = new THREE.BufferGeometry();
        g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
        var m = new THREE.PointsMaterial({
          size: 130, map: stopTex, transparent: true, opacity: 0.7,
          color: 0xcfd6dd, depthWrite: false, sizeAttenuation: true
        });
        routeGroups[id].add(new THREE.Points(g, m));
      });

      buildChips(data.routes);
      resize();
      setHeader(null, null, true);
      poll();
      setInterval(poll, POLL_MS);
      renderer.setAnimationLoop(function () { controls.update(); renderer.render(scene, camera); });
    })
    .catch(function () {
      fail('Could not load route data. Please check your connection and reload.');
    });

  resize();
})();
