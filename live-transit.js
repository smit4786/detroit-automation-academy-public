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

  var STAMP = '20261004-2105';
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
  // Pinch/wheel zoom anchors to the fingers/cursor, not the orbit target —
  // otherwise the point you meant to zoom into drifts away mid-gesture.
  // (r160 already implements this; it just ships disabled by default.)
  controls.zoomToCursor = true;
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

  // Street-map coverage bounds (WGS84). Streets are drawn as vector
  // geometry from U.S. Census TIGER/Line 2025 (see build scripts); no raster tiles.
  var STREET_BOUNDS = { lonW: -83.3431083, lonE: -82.8992288, latN: 42.47997522924901, latS: 42.25539743550126 };

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
  var streetData = null; // vector streets (assets/detroit-streets.json)
  var streetNameData = null; // street name anchors (assets/detroit-street-names.json)
  var stopData = null;   // raw stops array from ddot-routes-3d.json

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

  // Per-bus route badges: number-only chips. Destinations live in the bus
  // card (title + Destination row) — the floating badge stays compact.
  var badgeTexCache = {};
  function titleCase(s) {
    return String(s || '').toLowerCase().replace(/(?:^|\s)\S/g, function (m) { return m.toUpperCase(); });
  }
  function formatDest(rid, dest) {
    if (!dest) return '';
    // BusTime destination signs often repeat the route ("10 to Fairlane") — strip it.
    var dRaw = String(dest).trim().replace(new RegExp('^' + rid + '\\s*(to\\s+)?', 'i'), '');
    var dShort = titleCase(dRaw);
    if (dShort.length > 24) dShort = dShort.slice(0, 23) + '…';
    return dShort;
  }
  function routeBadgeTexture(rid) {
    var t = badgeTexCache[rid];
    if (t) return t;
    var rc = routeColors[rid];
    var col = '#' + (rc ? rc.getHexString() : '9aa0a6');
    var label = String(rid);
    var c = document.createElement('canvas');
    var mc = c.getContext('2d');
    mc.font = '700 36px system-ui, -apple-system, sans-serif';
    var tw = Math.ceil(mc.measureText(label).width);
    c.width = tw + 60; c.height = 72;
    var x = c.getContext('2d');
    x.fillStyle = 'rgba(9,13,17,0.88)';
    x.beginPath();
    if (x.roundRect) x.roundRect(4, 4, c.width - 8, 64, 16); else x.rect(4, 4, c.width - 8, 64);
    x.fill();
    x.lineWidth = 4; x.strokeStyle = col; x.stroke();
    x.fillStyle = '#ffffff';
    x.font = '700 36px system-ui, -apple-system, sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(label, c.width / 2, 38);
    var tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    t = { tex: tex, aspect: c.width / c.height };
    badgeTexCache[rid] = t;
    return t;
  }
  var badgePool = [];
  for (var _bi = 0; _bi < BUS_MAX; _bi++) {
    var _sp = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, depthWrite: false, transparent: true }));
    _sp.scale.set(480, 240, 1);
    _sp.visible = false;
    _sp.renderOrder = 40;
    scene.add(_sp);
    badgePool.push(_sp);
  }

  // In-scene info label for the tapped bus: route + destination up top,
  // vehicle + speed + data age below. Drawn on demand (not cached — the
  // age text goes stale), parked beside the bus so it never covers it.
  var busInfoSprite = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, depthWrite: false, transparent: true }));
  busInfoSprite.visible = false;
  busInfoSprite.renderOrder = 41;
  scene.add(busInfoSprite);
  function busAgeText(v) {
    if (!v.updated_at) return '–';
    var s = Math.max(0, Math.round((Date.now() - new Date(v.updated_at).getTime()) / 1000));
    return s < 60 ? s + 's ago' : Math.floor(s / 60) + 'm ago';
  }
  function drawBusInfo(v) {
    var col = routeColors[v.route_id] ? '#' + routeColors[v.route_id].getHexString() : '#9aa0a6';
    var dest = formatDest(v.route_id, v.destination);
    var line1 = v.route_id + ' · ' + (routeNames[v.route_id] || 'DDOT') + (dest ? ' → ' + dest : '');
    var spd = (v.speed_mph != null && !isNaN(v.speed_mph)) ? Math.round(v.speed_mph) + ' mph' : '–';
    var line2 = 'Bus ' + (v.vehicle_id || '–') + ' · ' + spd + ' · ' + busAgeText(v);
    var c = document.createElement('canvas');
    var m = c.getContext('2d');
    m.font = '700 34px system-ui, -apple-system, sans-serif';
    var w1 = Math.ceil(m.measureText(line1).width);
    m.font = '500 28px system-ui, -apple-system, sans-serif';
    var w2 = Math.ceil(m.measureText(line2).width);
    c.width = Math.max(w1, w2) + 72; c.height = 128;
    var x = c.getContext('2d');
    x.fillStyle = 'rgba(9,13,17,0.92)';
    x.beginPath();
    if (x.roundRect) x.roundRect(4, 4, c.width - 8, c.height - 8, 20); else x.rect(4, 4, c.width - 8, c.height - 8);
    x.fill();
    x.lineWidth = 4; x.strokeStyle = col; x.stroke();
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillStyle = '#ffffff';
    x.font = '700 34px system-ui, -apple-system, sans-serif';
    x.fillText(line1, c.width / 2 - 14, 42);
    x.fillStyle = '#c9ced4';
    x.font = '500 28px system-ui, -apple-system, sans-serif';
    x.fillText(line2, c.width / 2 - 14, 88);
    // Dismiss × — the whole pill is tappable, this is the affordance.
    x.strokeStyle = '#9AA0A6'; x.lineWidth = 5; x.lineCap = 'round';
    var xx = c.width - 36, xy = 34;
    x.beginPath(); x.arc(xx, xy, 16, 0, Math.PI * 2); x.stroke();
    x.beginPath();
    x.moveTo(xx - 6, xy - 6); x.lineTo(xx + 6, xy + 6);
    x.moveTo(xx + 6, xy - 6); x.lineTo(xx - 6, xy + 6);
    x.stroke();
    if (busInfoSprite.material.map) busInfoSprite.material.map.dispose();
    var tex = new THREE.CanvasTexture(c);
    tex.anisotropy = 4;
    busInfoSprite.material.map = tex;
    busInfoSprite.material.needsUpdate = true;
    busInfoSprite.userData.aspect = c.width / c.height;
    var h = badgeHeight() * 1.15;
    busInfoSprite.scale.set(h * busInfoSprite.userData.aspect, h, 1);
  }
  function placeBusInfo() {
    if (!busInfoSprite.visible || !selectedVehicleId) return;
    for (var i = 0; i < busSlots.length; i++) {
      var s = busSlots[i];
      if (s.vehicle && s.vehicle.vehicle_id === selectedVehicleId) {
        // Upper third of the column, clear of the route badge (y=430):
        // reads as a unit with the badge without covering the pillar.
        var y = busMode ? 150 : 540;
        busInfoSprite.position.set(s.x + 420, y, s.z);
        return;
      }
    }
    busInfoSprite.visible = false; // bus left the visible set
  }
  function refreshBusInfo() {    if (!selectedVehicleId) { busInfoSprite.visible = false; return; }
    for (var i = 0; i < busSlots.length; i++) {
      var s = busSlots[i];
      if (s.vehicle && s.vehicle.vehicle_id === selectedVehicleId) {
        drawBusInfo(s.vehicle);
        busInfoSprite.visible = true;
        placeBusInfo();
        return;
      }
    }
    busInfoSprite.visible = false;
  }

  // Shared temps.
  var _e3 = new THREE.Euler();

  // Street name labels: pooled sprites fed from detroit-street-names.json.
  // Freeway/arterial names under 20 km, local names under 6 km, deduped by
  // name within view, nearest 14 win.
  var streetLabelCache = {};
  function streetLabelTexture(name) {
    var t = streetLabelCache[name];
    if (t) return t;
    var c = document.createElement('canvas');
    var mc = c.getContext('2d');
    mc.font = '600 36px system-ui, -apple-system, sans-serif';
    var tw = Math.ceil(mc.measureText(name).width);
    c.width = tw + 44; c.height = 56;
    var x = c.getContext('2d');
    x.fillStyle = 'rgba(12,17,22,0.85)';
    x.beginPath();
    if (x.roundRect) x.roundRect(2, 2, c.width - 4, 52, 14); else x.rect(2, 2, c.width - 4, 52);
    x.fill();
    x.lineWidth = 3; x.strokeStyle = 'rgba(245,242,234,0.35)'; x.stroke();
    x.fillStyle = '#F5F2EA';
    x.font = '600 36px system-ui, -apple-system, sans-serif';
    x.textAlign = 'center'; x.textBaseline = 'middle';
    x.fillText(name, c.width / 2, 29);
    t = new THREE.CanvasTexture(c);
    t.anisotropy = 4;
    var o = { tex: t, aspect: c.width / c.height };
    streetLabelCache[name] = o;
    return o;
  }
  var streetLabelPool = [];
  for (var _sli = 0; _sli < 14; _sli++) {
    var _sl = new THREE.Sprite(new THREE.SpriteMaterial({ depthTest: false, depthWrite: false, transparent: true, opacity: 0.95 }));
    _sl.visible = false;
    _sl.renderOrder = 35;
    scene.add(_sl);
    streetLabelPool.push(_sl);
  }
  var lastStreetLabelUpdate = 0;
  var MAX_STREET_LABELS = 6;
  // Street-label stability: without memory the picker churns — the nearest
  // anchor per street jumps as you pan and the nearest-N set reshuffles, so
  // labels pop and swap. We keep the previously shown anchor per street
  // (within a 1.3x radius hysteresis) and place previously shown streets
  // first, so the set only changes when it has to.
  var prevStreetNames = []; // names shown last update, in placement order
  var streetAnchorIdx = {}; // name -> index into streetNameData.labels
  function updateStreetLabels() {
    var now = performance.now();
    if (now - lastStreetLabelUpdate < 350) return;
    lastStreetLabelUpdate = now;
    function clearLabels() {
      for (var i = 0; i < streetLabelPool.length; i++) streetLabelPool[i].visible = false;
      prevStreetNames = [];
      streetAnchorIdx = {};
    }
    var labels = streetNameData && streetNameData.labels;
    var camDist = camera.position.distanceTo(controls.target);
    var showMajor = camDist < 10000, showLocal = camDist < 5000;
    if (!labels || (!showMajor && !showLocal)) { clearLabels(); return; }
    var tx = controls.target.x, tz = controls.target.z;
    var R = camDist * 0.55, R2 = R * R, keepR2 = R2 * 1.69; // 1.3x hysteresis
    var best = {};
    for (var j = 0; j < labels.length; j++) {
      var l = labels[j];
      if (l[3] === 2 ? !showLocal : !showMajor) continue;
      // Stable anchor: keep showing the same point for this street while
      // it's still reasonably close, instead of jumping anchor to anchor.
      var kj = streetAnchorIdx[l[0]];
      if (kj !== undefined && labels[kj] && labels[kj][0] === l[0] &&
          (labels[kj][3] === 2 ? showLocal : showMajor)) {
        var kdx = labels[kj][1] - tx, kdz = labels[kj][2] - tz;
        var kd2 = kdx * kdx + kdz * kdz;
        if (kd2 < keepR2 && !best[l[0]]) {
          best[l[0]] = { d2: kd2, l: labels[kj], j: kj };
          continue;
        }
      }
      var dx = l[1] - tx, dz = l[2] - tz;
      var d2 = dx * dx + dz * dz;
      if (d2 > R2) continue;
      var e = best[l[0]];
      if (!e || d2 < e.d2) best[l[0]] = { d2: d2, l: l, j: j };
    }
    var arr = [];
    for (var k in best) arr.push(best[k]);
    // Stable order: streets already on screen keep their slots; newcomers
    // fill by distance. Kills the reshuffle when the camera drifts.
    var prevPos = {};
    for (var pi = 0; pi < prevStreetNames.length; pi++) prevPos[prevStreetNames[pi]] = pi;
    arr.sort(function (a, b) {
      var pa = (a.l[0] in prevPos) ? prevPos[a.l[0]] : 1e9;
      var pb = (b.l[0] in prevPos) ? prevPos[b.l[0]] : 1e9;
      if (pa !== pb) return pa - pb;
      return a.d2 - b.d2;
    });
    // Nearest-first placement with screen-space collision: no overlapping labels.
    var placed = [];
    var h = camDist * 0.02;
    var rw = renderer.domElement.clientWidth, rh = renderer.domElement.clientHeight;
    var pxPerM = rh / (2 * camDist * Math.tan(camera.fov * 0.5 * DEG));
    clearLabels();
    var shown = 0;
    for (var q = 0; q < arr.length && shown < MAX_STREET_LABELS; q++) {
      var lt = streetLabelTexture(arr[q].l[0]);
      var lw = h * lt.aspect * pxPerM, lh = h * pxPerM;
      _p3.set(arr[q].l[1], 34, arr[q].l[2]).project(camera);
      if (_p3.z > 1 || _p3.z < -1) continue;
      var cxp = (_p3.x * 0.5 + 0.5) * rw, cyp = (-_p3.y * 0.5 + 0.5) * rh;
      var clash = false;
      for (var c = 0; c < placed.length; c++) {
        var pr = placed[c];
        if (Math.abs(cxp - pr.x) < (lw + pr.w) / 2 + 10 &&
            Math.abs(cyp - pr.y) < (lh + pr.h) / 2 + 8) { clash = true; break; }
      }
      if (clash) continue;
      placed.push({ x: cxp, y: cyp, w: lw, h: lh });
      var sp = streetLabelPool[shown++];
      if (sp.material.map !== lt.tex) { sp.material.map = lt.tex; sp.material.needsUpdate = true; }
      sp.scale.set(h * lt.aspect, h, 1);
      sp.position.set(arr[q].l[1], 34, arr[q].l[2]);
      sp.visible = true;
      // Remember what's on screen so the next pass prefers stability.
      prevStreetNames.push(arr[q].l[0]);
      streetAnchorIdx[arr[q].l[0]] = arr[q].j;
    }
  }
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
  var selectedVehicleId = null; // tapped bus; its indicator renders expanded

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

  // Pulse rate shared with the user-location ring: 1 + 0.22*sin(t/420).
  function busPulse() { return 1 + 0.22 * Math.sin(performance.now() / 420); }

  function writeBusMatrices(k, b, pulse) {
    var isSel = !!selectedVehicleId && b.vehicle.vehicle_id === selectedVehicleId;
    var exz = (isSel ? 1.55 : 1) * (isSel ? pulse : 1); // selected bus expands + pulses
    _p3.set(b.x, PILLAR_H / 2, b.z);
    _q3.identity();
    _s3.set(exz, 1, exz);
    _m4.compose(_p3, _q3, _s3);
    pillarGlowIM.setMatrixAt(k, _m4);
    pillarCoreIM.setMatrixAt(k, _m4);
    _p3.set(b.x, PILLAR_H + 40, b.z);
    _m4.compose(_p3, _q3, _s3);
    pillarBeaconIM.setMatrixAt(k, _m4);
    _p3.set(b.x, 6, b.z);
    _s3.set(exz * 1.35, exz * 1.35, 1);
    _m4.compose(_p3, _ringQ, _s3);
    pillarRingIM.setMatrixAt(k, _m4);
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
          var isSelD = !!selectedVehicleId && s.vehicle.vehicle_id === selectedVehicleId;
          var dsc = isSelD ? 1.45 : 1; // selected bus expands
          d.group.scale.set(dsc, dsc, dsc);
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
      updateBusBadges(n, 430);
      return;
    }
    // Pillar mode: hide detail models, fill instances.
    for (var j = 0; j < DETAIL_MAX; j++) {
      if (detailPool[j]) { detailPool[j].group.visible = false; detailPool[j].vehicle = null; }
    }
    pillarMeshes.forEach(function (im) { im.visible = true; });
    for (var k = 0; k < n; k++) {
      var b = busSlots[k];
      writeBusMatrices(k, b, 1);
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
    updateBusBadges(n, PILLAR_H + 360);
  }

  // Per-bus route badges: one sprite per bus, shown only at close street-level zooms.
  // Badge size tracks zoom (constant screen presence) via updateBadgeScales.
  function badgeHeight() {
    var camDist = camera.position.distanceTo(controls.target);
    return Math.max(60, Math.min(170, camDist * 0.045));
  }
  function updateBusBadges(n, yBase) {
    var show = camera.position.distanceTo(controls.target) < 7000;
    var h = badgeHeight();
    for (var bi = 0; bi < BUS_MAX; bi++) {
      var sp = badgePool[bi];
      if (bi < n && show) {
        var bs = busSlots[bi];
        var bt = routeBadgeTexture(bs.vehicle.route_id);
        if (sp.material.map !== bt.tex) { sp.material.map = bt.tex; sp.material.needsUpdate = true; }
        sp.userData.aspect = bt.aspect;
        sp.scale.set(h * bt.aspect, h, 1);
        sp.position.set(bs.x, yBase, bs.z);
        sp.visible = true;
      } else {
        sp.visible = false;
      }
    }
  }
  var lastBadgeScaleUpdate = 0;
  function updateBadgeScales() {
    var now = performance.now();
    if (now - lastBadgeScaleUpdate < 500) return;
    lastBadgeScaleUpdate = now;
    var h = badgeHeight();
    for (var i = 0; i < badgePool.length; i++) {
      var sp = badgePool[i];
      if (!sp.visible || !sp.userData.aspect) continue;
      sp.scale.set(h * sp.userData.aspect, h, 1);
    }
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
  // Nearest bus within a touch-friendly screen radius (fingers are imprecise).
  // Pillar mode: distance to the pillar's full screen segment (base -> beacon),
  // so tapping anywhere along the visible column selects the bus. Bus mode:
  // distance to the model position on the ground.
  function pickNearestScreen(cx, cy, r) {
    var best = null, bestD2 = 48 * 48;
    for (var i = 0; i < busSlots.length; i++) {
      var s = busSlots[i];
      var d2;
      if (busMode) {
        _p3.set(s.x, 40, s.z).project(camera);
        if (_p3.z > 1 || _p3.z < -1) continue;
        var sx = (_p3.x * 0.5 + 0.5) * r.width + r.left;
        var sy = (-_p3.y * 0.5 + 0.5) * r.height + r.top;
        var ddx = sx - cx, ddy = sy - cy;
        d2 = ddx * ddx + ddy * ddy;
      } else {
        _p3.set(s.x, 0, s.z).project(camera);
        if (_p3.z > 1 || _p3.z < -1) continue;
        var ax = (_p3.x * 0.5 + 0.5) * r.width + r.left;
        var ay = (-_p3.y * 0.5 + 0.5) * r.height + r.top;
        _p3.set(s.x, PILLAR_H + 40, s.z).project(camera);
        if (_p3.z > 1 || _p3.z < -1) continue;
        var bx = (_p3.x * 0.5 + 0.5) * r.width + r.left;
        var by = (-_p3.y * 0.5 + 0.5) * r.height + r.top;
        var vx = bx - ax, vy = by - ay;
        var len2 = vx * vx + vy * vy;
        var tt = len2 ? ((cx - ax) * vx + (cy - ay) * vy) / len2 : 0;
        tt = tt < 0 ? 0 : (tt > 1 ? 1 : tt);
        var px = ax + tt * vx - cx, py = ay + tt * vy - cy;
        d2 = px * px + py * py;
      }
      if (d2 < bestD2) { bestD2 = d2; best = s.vehicle; }
    }
    return best;
  }
  // Tap a stop pylon: raycast the instanced markers, report name + routes.
  // Touch gets a 44px screen-space nearest fallback so finger taps are
  // forgiving at far zooms (mirrors the bus pillar fallback).
  var _stopV3 = null;
  function pickStop(cx, cy, isTouch) {
    if (!stopGroup || !stopGroup.visible || !stopPickList.length) return null;
    var r = renderer.domElement.getBoundingClientRect();
    pointerNDC.set(
      ((cx - r.left) / r.width) * 2 - 1,
      -(((cy - r.top) / r.height) * 2 - 1)
    );
    raycaster.setFromCamera(pointerNDC, camera);
    var hits = raycaster.intersectObject(stopIM);
    if (hits.length && hits[0].instanceId != null) {
      return stopPickList[hits[0].instanceId] || null;
    }
    if (!isTouch) return null;
    if (!_stopV3) _stopV3 = new THREE.Vector3();
    var sx = cx - r.left, sy = cy - r.top;
    var best = null, bestD = 44;
    for (var i = 0; i < stopPickList.length; i++) {
      var s = stopPickList[i];
      _stopV3.set(s.x, STOP_BASE_Y + stopHeight(s.r.length) / 2, s.z).project(camera);
      if (_stopV3.z > 1) continue;
      var px = (_stopV3.x * 0.5 + 0.5) * r.width;
      var py = (-_stopV3.y * 0.5 + 0.5) * r.height;
      var d = Math.hypot(px - sx, py - sy);
      if (d < bestD) { bestD = d; best = s; }
    }
    return best;
  }
  function pickBus(cx, cy, touchSlop) {
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
      if (hits.length) return hits[0].object.userData.detail.vehicle;
    } else {
      // Beacon heads, the visible glow column, then thin cores.
      var ih = raycaster.intersectObjects([pillarBeaconIM, pillarGlowIM, pillarCoreIM]);
      if (ih.length && ih[0].instanceId != null && busSlots[ih[0].instanceId]) {
        return busSlots[ih[0].instanceId].vehicle;
      }
    }
    if (touchSlop) return pickNearestScreen(cx, cy, r);
    return null;
  }
  renderer.domElement.addEventListener('pointerdown', function (e) {
    downPos = [e.clientX, e.clientY];
  });
  // Tapping the info pill dismisses it (the × is the affordance; the
  // whole pill is the target — fingers are imprecise).
  function tapHitsBusInfo(cx, cy) {
    if (!busInfoSprite.visible) return false;
    var r = renderer.domElement.getBoundingClientRect();
    pointerNDC.set(
      ((cx - r.left) / r.width) * 2 - 1,
      -(((cy - r.top) / r.height) * 2 - 1)
    );
    raycaster.setFromCamera(pointerNDC, camera);
    return raycaster.intersectObject(busInfoSprite).length > 0;
  }
  renderer.domElement.addEventListener('pointerup', function (e) {
    if (!downPos) return;
    var dx = e.clientX - downPos[0], dy = e.clientY - downPos[1];
    downPos = null;
    var isTouch = e.pointerType === 'touch';
    if (dx * dx + dy * dy > (isTouch ? 169 : 36)) return; // was a drag (13px touch slop)
    if (tapHitsBusInfo(e.clientX, e.clientY)) { hideBus(); return; }
    var v = pickBus(e.clientX, e.clientY, isTouch);
    if (v) { showBus(v); return; }
    var st = pickStop(e.clientX, e.clientY, isTouch);
    if (st) showStop(st);
    else { hideBus(); hideStop(); }
  });
  renderer.domElement.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse' || downPos) return;
    renderer.domElement.style.cursor = pickBus(e.clientX, e.clientY) ? 'pointer' : 'grab';
  });

  function compass(bearing) {
    if (bearing == null || isNaN(bearing)) return '–';
    return COMPASS[Math.round(bearing / 45) % 8] + ' (' + Math.round(bearing) + '°)';
  }

  function tapBuzz() { try { if (navigator.vibrate) navigator.vibrate(10); } catch (e) {} }
  function showBus(v) {
    if (!v) return;
    tapBuzz();
    selectedVehicleId = v.vehicle_id;
    renderBusInstances(); // expand the selected indicator
    var sn = v.route_id;
    var dest = formatDest(sn, v.destination);
    $('bus-chip').style.background = routeColors[sn] ? '#' + routeColors[sn].getHexString() : '#F5F2EA';
    $('bus-title').textContent = sn + ' · ' + (routeNames[sn] || 'DDOT') + (dest ? ' → ' + dest : '');
    $('bus-id').textContent = v.vehicle_id || '–';
    $('bus-dest').textContent = formatDest(sn, v.destination) || '–';
    $('bus-speed').textContent = (v.speed_mph != null && !isNaN(v.speed_mph)) ? Math.round(v.speed_mph) + ' mph' : '–';
    $('bus-heading').textContent = compass(v.bearing);
    var fi = fleetLookup(v.vehicle_id);
    $('bus-model').textContent = fi.model + ' · ' + fi.detail;
    $('bus-cap').textContent = (fi.seats != null ? fi.seats + ' seats · ' : '') + fi.length_m.toFixed(1) + ' m long';
    var when = v.updated_at ? new Date(v.updated_at) : null;
    $('bus-card-updated').textContent = (when && !isNaN(when)) ? when.toLocaleTimeString() : '–';
    $('bus-card').hidden = false;
    refreshBusInfo(); // in-scene label beside the bus
  }
  function hideBus() {
    selectedVehicleId = null;
    $('bus-card').hidden = true;
    busInfoSprite.visible = false;
    renderBusInstances(); // shrink the indicator back
  }
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
      hint.innerHTML = 'drag&nbsp;·&nbsp;move&nbsp;&nbsp;&nbsp;pinch&nbsp;·&nbsp;zoom&nbsp;&nbsp;&nbsp;tap bus or stop&nbsp;·&nbsp;details';
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
    syncFsLock();
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
  function onFsChange() { setFsBtn(); syncFsLock(); notifyMapResize(); }
  function syncFsLock() { document.body.classList.toggle('fs-lock', fsActive()); }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && stage.classList.contains('pseudo-full')) setPseudoFull(false);
  });
  // Keyboard selection: arrows cycle buses/stops when a card is open,
  // Escape clears. (OrbitControls doesn't bind arrows — no conflict.)
  document.addEventListener('keydown', function (e) {
    var tag = (e.target && e.target.tagName) || '';
    if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'BUTTON') return;
    if (e.key === 'Escape') { hideBus(); hideStop(); return; }
    if (e.key !== 'ArrowRight' && e.key !== 'ArrowLeft') return;
    var dir = e.key === 'ArrowRight' ? 1 : -1;
    if (selectedVehicleId && busSlots.length) {
      var bi = -1;
      for (var i = 0; i < busSlots.length; i++) {
        if (busSlots[i].vehicle && busSlots[i].vehicle.vehicle_id === selectedVehicleId) { bi = i; break; }
      }
      var nb = busSlots[(bi + dir + busSlots.length) % busSlots.length];
      if (nb && nb.vehicle) { showBus(nb.vehicle); e.preventDefault(); }
    } else if (selectedStop && stopPickList.length && selectedStopIndex >= 0) {
      var ns = stopPickList[(selectedStopIndex + dir + stopPickList.length) % stopPickList.length];
      if (ns) { showStop(ns); e.preventDefault(); }
    }
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
    userXZ = p;
    var off = camera.position.clone().sub(controls.target);
    controls.target.set(p[0], 0, p[1]);
    camera.position.copy(controls.target).add(off);
    youMarker.group.position.set(p[0], 0, p[1]);
    youMarker.setAccuracy(accMeters);
    youMarker.group.visible = true;
    locateBtn.setAttribute('aria-pressed', 'true');
    if (pendingNearMe) {
      setNearMe(true);
    } else if (filterState.nearMe) {
      computeNearMe();
      applyFilters();
      syncFilterUI();
      refreshFilterCounts();
    }
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
        pendingNearMe = false;
        if (err && err.code === 1) showToast('Location access denied — allow it in your browser settings to use this.');
        else showToast('Could not get your location — please try again.');
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });

  // Soft location prompt at load: one quiet toast offering the locate flow,
  // never the raw system dialog uninvited. Silent when already located,
  // unsupported, or previously denied.
  var locPrompted = false;
  function maybePromptLocation() {
    if (locPrompted || userXZ || !('geolocation' in navigator)) return;
    locPrompted = true;
    var show = function () {
      var t = $('map-toast');
      t.innerHTML = '';
      var s = document.createElement('span');
      s.textContent = 'See routes near you?';
      var go = document.createElement('button');
      go.textContent = 'Enable location';
      go.className = 'toast-btn';
      go.addEventListener('click', function (e) { e.stopPropagation(); hideToast(); locateBtn.click(); });
      var no = document.createElement('button');
      no.textContent = 'Not now';
      no.className = 'toast-btn toast-btn-quiet';
      no.addEventListener('click', function (e) { e.stopPropagation(); hideToast(); });
      t.appendChild(s); t.appendChild(go); t.appendChild(no);
      t.hidden = false;
    };
    try {
      if (navigator.permissions && navigator.permissions.query) {
        navigator.permissions.query({ name: 'geolocation' }).then(function (res) {
          if (res.state === 'granted') locateBtn.click();
          else if (res.state === 'prompt') show();
        }, function () { show(); });
      } else { show(); }
    } catch (e) { show(); }
  }

  // --- stops ---------------------------------------------------------------
  // Stops follow individual route filters (not groups). Single-route stops
  // take their route's color; multi-route stops ("hubs") draw paper-white
  // and larger so transfer points read at a glance. Two draw calls total.
  var stopGroup = new THREE.Group();
  stopGroup.visible = false; // LOD-gated in the animation loop
  scene.add(stopGroup);
  var STOP_LOD_DIST = 20000; // above the ~18.6km default home view: stops visible on load

  // Stop markers: one instanced pylon per stop. Height encodes importance:
  // 75m + 28m per serving route, so a 13-route mega-hub towers over a
  // single-route stop the way it should. Single-route pylons take their
  // route's color; multi-route hubs draw paper-white. One draw call.
  var STOP_MAX = 5120;
  var stopIM = new THREE.InstancedMesh(
    new THREE.CylinderGeometry(14, 18, 1, 8),
    new THREE.MeshLambertMaterial({ color: 0xffffff }), STOP_MAX);
  stopIM.frustumCulled = false;
  stopIM.count = 0;
  stopGroup.add(stopIM);
  var stopPickList = [];
  var STOP_BASE_Y = 18; // street level: above the street lines, below casing

  var lastStopSig = null;
  var _stopTmpColor = new THREE.Color();
  function stopHeight(nRoutes) { return 75 + 28 * nRoutes; }
  function rebuildStops() {
    // Stops only depend on route toggles: skip the full rebuild when the
    // visible route set hasn't changed (e.g. polls that only flip dimming).
    var sig = routeOrder.map(function (rid) { return routeIsOn(rid) ? '1' : '0'; }).join('') +
      '|nm:' + (filterState.nearMe ? Object.keys(nearMeSet || {}).sort().join(',') : 'off');
    if (sig === lastStopSig) return;
    lastStopSig = sig;
    var list = [];
    if (stopData && stopData.length) {
      stopData.forEach(function (s) {
        if (!s.r || !s.r.length) return;
        var on = s.r.some(function (rid) { return routeIsOn(rid) && routeNearOk(rid); });
        if (!on) return;
        list.push(s);
      });
    }
    stopPickList = list;
    for (var i = 0; i < list.length; i++) {
      var s = list[i];
      var h = stopHeight(s.r.length);
      _p3.set(s.x, STOP_BASE_Y + h / 2, s.z);
      _q3.identity();
      _s3.set(1, h, 1);
      _m4.compose(_p3, _q3, _s3);
      stopIM.setMatrixAt(i, _m4);
      if (s.r.length > 1) {
        _stopTmpColor.set(0xf5f2ea);
      } else {
        var rc = routeColors[s.r[0]];
        if (rc) _stopTmpColor.copy(rc); else _stopTmpColor.set(0xf5f2ea);
      }
      stopIM.setColorAt(i, _stopTmpColor);
    }
    stopIM.count = list.length;
    stopIM.instanceMatrix.needsUpdate = true;
    if (stopIM.instanceColor) stopIM.instanceColor.needsUpdate = true;
    // Rebuilds recolor every instance: re-apply the selection highlight.
    selectedStopIndex = selectedStop ? list.indexOf(selectedStop) : -1;
    if (selectedStopIndex < 0 && selectedStop) hideStop();
    else setStopSelectedColor(selectedStopIndex, true);
  }

  // Selected-stop highlight: a narrow pulsing ring hugging the pylon base
  // plus the pylon itself painted white — unambiguous at any zoom.
  var selectedStop = null;
  var selectedStopIndex = -1;
  var stopHighlight = new THREE.Mesh(
    new THREE.RingGeometry(30, 52, 40),
    new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.75, side: THREE.DoubleSide, depthWrite: false })
  );
  stopHighlight.rotation.x = -Math.PI / 2;
  stopHighlight.visible = false;
  scene.add(stopHighlight);

  // Paint the selected pylon white (restore its route/paper color after).
  // Called on select, deselect, and rebuild (toggles recolor everything).
  function setStopSelectedColor(idx, on) {
    if (idx < 0 || idx >= stopPickList.length || !stopIM.instanceColor) return;
    var s = stopPickList[idx];
    if (on) {
      _stopTmpColor.set(0xffffff);
    } else if (s.r.length > 1) {
      _stopTmpColor.set(0xf5f2ea);
    } else {
      var rc = routeColors[s.r[0]];
      if (rc) _stopTmpColor.copy(rc); else _stopTmpColor.set(0xf5f2ea);
    }
    stopIM.setColorAt(idx, _stopTmpColor);
    stopIM.instanceColor.needsUpdate = true;
  }
  function showStop(st) {
    if (!st) return;
    if (typeof tripMode !== 'undefined' && tripMode) tripTapStop(st);
    tapBuzz();
    setStopSelectedColor(selectedStopIndex, false);
    selectedStop = st;
    selectedStopIndex = stopPickList.indexOf(st);
    setStopSelectedColor(selectedStopIndex, true);
    $('stop-title').textContent = st.n || 'Stop';
    $('stop-id').textContent = st.id || '–';
    $('stop-nroutes').textContent = (st.r || []).length + ((st.r || []).length === 1 ? ' route' : ' routes');
    var host = $('stop-routes');
    host.innerHTML = '';
    (st.r || []).forEach(function (rid) {
      var chip = document.createElement('span');
      chip.className = 'stop-route';
      var dot = document.createElement('i');
      var rc = routeColors[rid];
      dot.style.background = rc ? '#' + rc.getHexString() : '#F5F2EA';
      chip.appendChild(dot);
      var b = document.createElement('b');
      b.textContent = rid + ' · ' + (routeNames[rid] || 'DDOT');
      chip.appendChild(b);
      host.appendChild(chip);
    });
    $('stop-card').hidden = false;
    stopHighlight.position.set(st.x, 20, st.z);
    stopHighlight.visible = true;
    renderStopLive();
  }
  // Live arrivals on the selected stop's routes, refreshed on every poll.
  function renderStopLive() {
    var host = $('stop-live'), list = $('stop-live-list');
    if (!host || !list) return;
    if (!selectedStop || !lastVehicles || !lastVehicles.length) {
      host.hidden = true; return;
    }
    var rows = [];
    for (var i = 0; i < lastVehicles.length; i++) {
      var v = lastVehicles[i];
      if (selectedStop.r.indexOf(v.route_id) >= 0) rows.push(v);
    }
    if (!rows.length) { host.hidden = true; return; }
    host.hidden = false;
    list.innerHTML = '';
    var now = Date.now();
    rows.slice(0, 5).forEach(function (v) {
      var row = document.createElement('div');
      row.className = 'stop-live-row';
      var dot = document.createElement('i');
      var rc = routeColors[v.route_id];
      dot.style.background = rc ? '#' + rc.getHexString() : '#F5F2EA';
      row.appendChild(dot);
      var b = document.createElement('b');
      b.textContent = v.route_id + ' · ' + (formatDest(v.route_id, v.destination) || (routeNames[v.route_id] || 'DDOT'));
      row.appendChild(b);
      var t = document.createElement('span');
      var when = v.updated_at ? new Date(v.updated_at) : null;
      var mins = (when && !isNaN(when)) ? Math.max(0, Math.round((now - when.getTime()) / 60000)) : null;
      t.textContent = mins == null ? '' : (mins < 1 ? 'just now' : mins + 'm ago');
      row.appendChild(t);
      list.appendChild(row);
    });
  }
  function hideStop() {
    setStopSelectedColor(selectedStopIndex, false);
    selectedStopIndex = -1;
    selectedStop = null;
    $('stop-card').hidden = true;
    stopHighlight.visible = false;
  }
  $('stop-close').addEventListener('click', hideStop);

  // --- trip planning (RAPTOR, scheduled times) -------------------------------
  // Phase 1: client-side RAPTOR over the compact timetable
  // (ddot-timetable-<feed>.json, built by build-timetable.py from DDOT GTFS).
  // Lazily imported only when the rider opens the planner; origin and
  // destination never leave the device. Every result is labeled scheduled.
  //
  // Phase 2 scaffold: live-fusion.js annotates scheduled journeys with live
  // vehicle context (per-route live counts now; delay propagation designed
  // next — see that module). Phase 3 (multimodal) is scoped in
  // raptor-concept.md; the leg model already supports it: a new leg type
  // only needs a renderer in renderTripDetail() and legPoints3D().
  var tripMode = false;
  var tripFrom = null;      // {kind:'stop', idx} | {kind:'loc', x, z}
  var tripTo = null;        // {kind:'stop', idx}
  var tripMapPick = null;   // 'from' | 'to' — the next map tap sets this field
  var tripView = 'planner'; // 'planner' | 'search'
  var tripSearchFor = 'from';
  var tripLeaveMode = 'now';// 'now' | 'at'
  var tripLeaveTime = '';
  var tripTT = null, tripRaptor = null, tripFusion = null;
  var tripJourneys = [], tripSel = -1, tripLoading = false;
  var tripFly = null;
  var tripGroup = new THREE.Group();
  tripGroup.visible = false;
  scene.add(tripGroup);
  var tripMats = []; // highlight materials, pulsed at the shared rate
  var _flyUp = new THREE.Vector3(0, 550, 0);
  var _flyDir = new THREE.Vector3();
  var SVC_NAMES = { '1': 'Sunday', '2': 'Saturday', '3': 'Weekday' };
  function tripEsc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function tripClock(sec) {
    sec = Math.floor(sec) % 86400;
    var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
    var ap = h >= 12 ? 'PM' : 'AM', h12 = h % 12;
    if (h12 === 0) h12 = 12;
    return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
  }
  function tripStopName(idx) {
    if (idx === -1) return 'Your location';
    var s = stopData && stopData[idx];
    return s ? (s.n || 'Stop ' + (s.id || '')) : 'Stop';
  }
  function tripMarker(color) {
    var m = new THREE.Mesh(
      new THREE.RingGeometry(34, 58, 40),
      new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false })
    );
    m.rotation.x = -Math.PI / 2;
    m.visible = false;
    scene.add(m);
    return m;
  }
  var tripOriginMark = tripMarker(0xffb000); // Amber = origin
  var tripDestMark = tripMarker(0xffffff);   // Paper = destination
  var HINT_DEFAULT = 'drag&nbsp;·&nbsp;orbit&nbsp;&nbsp;&nbsp;scroll&nbsp;·&nbsp;zoom&nbsp;&nbsp;&nbsp;tap bus or stop&nbsp;·&nbsp;details';

  function setTripMode(on) {
    tripMode = on;
    $('trip-btn').setAttribute('aria-pressed', on ? 'true' : 'false');
    if (on) {
      hideBus(); hideStop();
      cancelTripFly();
      // Default origin: your location when known — the standard pattern.
      if (!tripFrom && typeof userXZ !== 'undefined' && userXZ) {
        tripFrom = { kind: 'loc', x: userXZ[0], z: userXZ[1] };
      }
      showTripView('planner');
      $('trip-card').hidden = false;
      renderTripFields();
      updateTripMarkers();
      maybeReplan();
    } else {
      cancelTripFly();
      clearTrip();
    }
  }
  function clearTripHighlight() {
    for (var i = tripGroup.children.length - 1; i >= 0; i--) {
      var c = tripGroup.children[i];
      tripGroup.remove(c);
      if (c.geometry) c.geometry.dispose();
      if (c.material) c.material.dispose();
    }
    tripMats.length = 0;
    tripGroup.visible = false;
  }
  function clearTrip() {
    tripFrom = null; tripTo = null;
    tripMapPick = null;
    tripJourneys = []; tripSel = -1;
    tripOriginMark.visible = false;
    tripDestMark.visible = false;
    clearTripHighlight();
    $('trip-card').hidden = true;
    $('map-hint').innerHTML = HINT_DEFAULT;
  }
  function cancelTripFly() {
    if (tripFly) { tripFly = null; controls.enabled = true; }
  }
  // Map taps in trip mode: an explicit "choose on map" target wins;
  // otherwise first tap = origin, second = destination, third restarts.
  function tripStopTapped(st) {
    var idx = stopData ? stopData.indexOf(st) : -1;
    if (idx < 0) return;
    tapBuzz();
    cancelTripFly();
    if (tripMapPick === 'to' || (!tripMapPick && tripFrom && !tripTo)) {
      setTripTo({ kind: 'stop', idx: idx });
    } else {
      setTripFrom({ kind: 'stop', idx: idx });
      if (!tripMapPick) tripTo = null;
    }
    tripMapPick = null;
    if (tripView === 'search') showTripView('planner');
    else { renderTripFields(); updateTripMarkers(); }
    maybeReplan();
  }
  function setTripFrom(f) {
    tripFrom = f;
    renderTripFields();
    updateTripMarkers();
  }
  function setTripTo(t) {
    tripTo = t;
    renderTripFields();
    updateTripMarkers();
  }
  function updateTripMarkers() {
    if (tripFrom) {
      var p = tripFrom.kind === 'stop' ? stopData[tripFrom.idx] : tripFrom;
      if (p) { tripOriginMark.position.set(p.x, 20, p.z); tripOriginMark.visible = true; }
      else tripOriginMark.visible = false;
    } else tripOriginMark.visible = false;
    if (tripTo && tripTo.kind === 'stop' && stopData[tripTo.idx]) {
      var s = stopData[tripTo.idx];
      tripDestMark.position.set(s.x, 20, s.z);
      tripDestMark.visible = true;
    } else tripDestMark.visible = false;
  }
  function renderTripFields() {
    $('trip-from-label').textContent = tripFrom
      ? (tripFrom.kind === 'loc' ? 'Your location' : tripStopName(tripFrom.idx)) : 'From';
    $('trip-from-label').classList.toggle('placeholder', !tripFrom);
    $('trip-to-label').textContent = tripTo ? tripStopName(tripTo.idx) : 'Where to?';
    $('trip-to-label').classList.toggle('placeholder', !tripTo);
    $('trip-now-btn').setAttribute('aria-pressed', tripLeaveMode === 'now' ? 'true' : 'false');
    if (tripLeaveMode === 'now') $('trip-time-input').value = '';
  }
  function showTripView(v) {
    tripView = v;
    $('trip-planner').hidden = v !== 'planner';
    $('trip-search').hidden = v !== 'search';
    if (v === 'search') {
      var inp = $('trip-search-input');
      inp.value = '';
      renderTripSearchOpts();
      renderTripSearchResults('');
      setTimeout(function () { inp.focus(); }, 50);
    }
  }
  function openTripSearch(forField) {
    tripSearchFor = forField;
    tapBuzz();
    showTripView('search');
  }
  function renderTripSearchOpts() {
    var host = $('trip-search-opts');
    host.innerHTML = '';
    if (tripSearchFor === 'from') {
      var loc = document.createElement('button');
      loc.className = 'trip-search-opt';
      var hasLoc = (typeof userXZ !== 'undefined' && userXZ);
      loc.innerHTML = '<b>' + (hasLoc ? 'Use my location' : 'Locate me') + '</b><span>' +
        (hasLoc ? 'nearest stops within a short walk' : 'finds your position first') + '</span>';
      loc.addEventListener('click', function () {
        if (typeof userXZ !== 'undefined' && userXZ) {
          setTripFrom({ kind: 'loc', x: userXZ[0], z: userXZ[1] });
          showTripView('planner');
          renderTripFields(); updateTripMarkers(); maybeReplan();
        } else {
          var lb = $('view-locate');
          if (lb) lb.click();
          showToast('Locating… tap "Use my location" again once found.');
        }
      });
      host.appendChild(loc);
    }
    var map = document.createElement('button');
    map.className = 'trip-search-opt';
    map.innerHTML = '<b>Choose on map</b><span>tap a stop in the 3D view</span>';
    map.addEventListener('click', function () {
      tripMapPick = tripSearchFor;
      showTripView('planner');
      renderTripFields();
      $('map-hint').innerHTML = 'tap a stop for <b>' +
        (tripSearchFor === 'from' ? 'origin' : 'destination') + '</b>';
    });
    host.appendChild(map);
  }
  function searchStops(q) {
    q = (q || '').trim().toLowerCase();
    if (q.length < 2 || !stopData) return [];
    var seen = {}, out = [];
    for (var i = 0; i < stopData.length; i++) {
      var s = stopData[i];
      var n = (s.n || '').toLowerCase();
      if (n.indexOf(q) < 0) continue;
      var e = seen[n];
      if (e) {
        e.count++;
        if ((s.r || []).length > (e.stop.r || []).length) { e.stop = s; e.idx = i; }
        continue;
      }
      e = { stop: s, idx: i, count: 1, prefix: n.indexOf(q) === 0 };
      seen[n] = e;
      out.push(e);
    }
    out.sort(function (a, b) {
      return (b.prefix - a.prefix) || (b.count - a.count) || ((b.stop.r || []).length - (a.stop.r || []).length);
    });
    return out.slice(0, 8);
  }
  function renderTripSearchResults(q) {
    var host = $('trip-search-results');
    host.innerHTML = '';
    var hits = searchStops(q);
    if (!hits.length) {
      if ((q || '').trim().length >= 2) {
        host.innerHTML = '<p class="trip-note">No stops match. Try a street or landmark name.</p>';
      }
      return;
    }
    hits.forEach(function (h) {
      var b = document.createElement('button');
      b.className = 'trip-search-hit';
      var t = document.createElement('b');
      t.textContent = h.stop.n || 'Stop';
      b.appendChild(t);
      var r = document.createElement('span');
      r.textContent = (h.stop.r || []).slice(0, 4).join(' · ') + ((h.stop.r || []).length > 4 ? ' +' + ((h.stop.r || []).length - 4) : '');
      b.appendChild(r);
      b.addEventListener('click', function () {
        tapBuzz();
        var val = { kind: 'stop', idx: h.idx };
        if (tripSearchFor === 'from') setTripFrom(val); else setTripTo(val);
        showTripView('planner');
        renderTripFields(); updateTripMarkers(); maybeReplan();
      });
      host.appendChild(b);
    });
  }
  function tripSeeds() {
    if (!tripFrom) return [];
    if (tripFrom.kind === 'stop') return [{ stop: tripFrom.idx, walk: 0 }];
    // Virtual origin: nearest stops within a 400 m walk of your position.
    var seeds = [];
    for (var i = 0; i < stopData.length; i++) {
      var s = stopData[i];
      var d = Math.hypot(s.x - tripFrom.x, s.z - tripFrom.z);
      if (d <= 400) seeds.push({ stop: i, walk: Math.max(60, Math.round(d / 1.4)) });
    }
    seeds.sort(function (a, b) { return a.walk - b.walk; });
    return seeds.slice(0, 12);
  }
  function tripWhen() {
    if (tripLeaveMode === 'at' && tripLeaveTime) {
      var p = tripLeaveTime.split(':');
      var d = new Date();
      d.setHours(parseInt(p[0], 10) || 0, parseInt(p[1], 10) || 0, 0, 0);
      return d;
    }
    return new Date();
  }
  function maybeReplan() {
    if (tripMode && tripFrom && tripTo && !tripLoading) runTripPlan();
    else if (tripMode && (!tripFrom || !tripTo)) {
      tripJourneys = []; tripSel = -1;
      clearTripHighlight();
      renderTripEmpty();
    }
  }
  function renderTripEmpty() {
    var host = $('trip-results');
    host.innerHTML = '<p class="trip-note">Pick an origin and destination to see scheduled trips.</p>';
  }
  function mergeWalkLegs(legs) {
    var out = [];
    legs.forEach(function (l) {
      var p = out[out.length - 1];
      if (l.type === 'walk' && p && p.type === 'walk') { p.to = l.to; p.secs += l.secs; }
      else out.push(Object.assign({}, l));
    });
    return out;
  }
  function runTripPlan() {
    if (tripLoading) return;
    tripLoading = true;
    tapBuzz();
    cancelTripFly();
    $('trip-prov').textContent = 'scheduled';
    var host = $('trip-results');
    host.innerHTML = '<p class="trip-note">Planning…</p>';
    var go = function (R) {
      tripRaptor = R;
      var loaded = tripTT ? Promise.resolve(tripTT)
        : R.loadTimetable('ddot-timetable-S1000182.json?v=' + STAMP).then(function (tt) { tripTT = tt; return tt; });
      var seeds = tripSeeds();
      var dest = tripTo.idx;
      var when = tripWhen();
      var oF = tripFrom, oT = tripTo; // capture; ignore if the user moved on
      return loaded.then(function (tt) {
        var res = R.plan(tt, seeds, dest, when);
        if (oF !== tripFrom || oT !== tripTo) return; // stale
        tripJourneys = res.journeys;
        tripSel = tripJourneys.length ? 0 : -1;
        applyTripFusion();
        renderTripResults(res);
        if (tripSel >= 0) { highlightJourney(tripJourneys[0]); }
        else clearTripHighlight();
      });
    };
    var boot = (tripRaptor && tripFusion) ? Promise.resolve({ R: tripRaptor, F: tripFusion })
      : Promise.all([
          tripRaptor ? Promise.resolve(tripRaptor) : import('./raptor.js?v=' + STAMP),
          tripFusion ? Promise.resolve(tripFusion) : import('./live-fusion.js?v=' + STAMP)
        ]).then(function (ms) { return { R: ms[0].default || ms[0], F: ms[1].default || ms[1] }; })
        .then(function (m) { tripFusion = m.F; return m; });
    // Note: raptor.js uses named exports; the .default fallback keeps this
    // working if the module shape ever changes.
    boot.then(function (m) { return go(m.R); }).catch(function (err) {
      $('trip-results').innerHTML = '<p class="trip-note">Could not plan the trip (' +
        tripEsc((err && err.message) || String(err)) + '). Check your connection and try again.</p>';
    }).then(function () { tripLoading = false; });
  }
  function applyTripFusion() {
    if (!tripFusion || !tripJourneys.length) return;
    try { tripFusion.fuseJourneys(tripJourneys, (typeof lastVehicles !== 'undefined' && lastVehicles) || []); }
    catch (e) { /* fusion never breaks planning */ }
  }
  // Called from the vehicle poll so live counts stay fresh while a trip is open.
  function refreshTripFusion() {
    if (!tripMode || !tripJourneys.length || !tripFusion) return;
    applyTripFusion();
    if (tripSel >= 0) renderTripDetail();
  }
  function renderTripResults(res) {
    var host = $('trip-results');
    host.innerHTML = '';
    var meta = document.createElement('p');
    meta.className = 'trip-note';
    var svcName = res.meta.service && SVC_NAMES[res.meta.service] ? SVC_NAMES[res.meta.service] : 'DDOT';
    var whenLbl = tripLeaveMode === 'at' && tripLeaveTime ? 'depart ' + tripLeaveTime : 'leave now';
    meta.textContent = 'Scheduled times · ' + svcName + ' service · ' + whenLbl + ' · feed ' + (res.meta.feedVersion || '');
    host.appendChild(meta);
    if (!tripJourneys.length) {
      var none = document.createElement('p');
      none.className = 'trip-note';
      none.textContent = res.meta.reason === 'no-service'
        ? 'No scheduled DDOT service at this time.'
        : 'No scheduled trip found between these stops right now. Try a different pair or time.';
      host.appendChild(none);
      return;
    }
    var list = document.createElement('div');
    list.id = 'trip-opt-list';
    tripJourneys.forEach(function (j, i) { list.appendChild(tripOptionEl(j, i)); });
    host.appendChild(list);
    var det = document.createElement('div');
    det.id = 'trip-detail';
    host.appendChild(det);
    renderTripDetail();
  }
  function tripOptionEl(j, i) {
    var b = document.createElement('button');
    b.className = 'trip-opt' + (i === tripSel ? ' sel' : '');
    b.setAttribute('aria-pressed', i === tripSel ? 'true' : 'false');
    var top = document.createElement('div');
    top.className = 'trip-opt-top';
    var mins = document.createElement('b');
    mins.textContent = j.durationMin + ' min';
    top.appendChild(mins);
    var times = document.createElement('span');
    times.textContent = j.departClock + ' → ' + j.arriveClock;
    top.appendChild(times);
    b.appendChild(top);
    var sub = document.createElement('div');
    sub.className = 'trip-opt-sub';
    var liveN = j.legs.reduce(function (n, l) { return n + (l.liveVehicles || 0); }, 0);
    sub.textContent = (j.nBus === 0 ? 'Walk' : (j.transfers === 0 ? 'Direct' : j.transfers + (j.transfers === 1 ? ' transfer' : ' transfers'))) +
      ' · ' + j.walkMin + ' min walk' + (liveN > 0 ? ' · ' + liveN + ' live' : '') + ' · scheduled';
    b.appendChild(sub);
    var legs = document.createElement('div');
    legs.className = 'trip-legs';
    mergeWalkLegs(j.legs).forEach(function (l) {
      var chip = document.createElement('span');
      chip.className = 'trip-leg-chip';
      if (l.type === 'bus') {
        var dot = document.createElement('i');
        dot.style.background = l.color || '#F5F2EA';
        chip.appendChild(dot);
        var lbl = document.createElement('b');
        lbl.textContent = l.routeId;
        chip.appendChild(lbl);
      } else {
        var w = document.createElement('b');
        w.className = 'walk';
        w.textContent = 'walk ' + Math.max(1, Math.round(l.secs / 60)) + 'm';
        chip.appendChild(w);
      }
      legs.appendChild(chip);
    });
    b.appendChild(legs);
    b.addEventListener('click', function () {
      tripSel = i;
      tapBuzz();
      var opts = document.querySelectorAll('#trip-opt-list .trip-opt');
      for (var k = 0; k < opts.length; k++) {
        opts[k].classList.toggle('sel', k === tripSel);
        opts[k].setAttribute('aria-pressed', k === tripSel ? 'true' : 'false');
      }
      renderTripDetail();
      highlightJourney(tripJourneys[i]);
      flyJourney(tripJourneys[i]); // the perspective is the interface
    });
    return b;
  }
  function renderTripDetail() {
    var det = $('trip-detail');
    if (!det) return;
    det.innerHTML = '';
    if (tripSel < 0 || !tripJourneys[tripSel]) return;
    mergeWalkLegs(tripJourneys[tripSel].legs).forEach(function (l) {
      var row = document.createElement('div');
      row.className = 'trip-leg-row';
      var dot = document.createElement('i');
      var body = document.createElement('div');
      if (l.type === 'bus') {
        dot.style.background = l.color || '#F5F2EA';
        var t = document.createElement('b');
        t.textContent = l.routeId + ' · ' + (l.headsign || l.routeName || 'DDOT');
        body.appendChild(t);
        var s = document.createElement('span');
        s.textContent = tripStopName(l.board) + ' → ' + tripStopName(l.alight);
        body.appendChild(s);
        var tm = document.createElement('span');
        tm.className = 'trip-leg-time';
        tm.textContent = tripClock(l.boardSec) + ' → ' + tripClock(l.alightSec) + ' · scheduled' +
          (l.interp ? ' · estimated' : '') + (l.liveVehicles > 0 ? ' · ' + l.liveVehicles + ' live' : '');
        body.appendChild(tm);
      } else {
        dot.className = 'walk';
        var wt = document.createElement('b');
        wt.textContent = 'Walk ' + Math.max(1, Math.round(l.secs / 60)) + ' min';
        body.appendChild(wt);
        var ws = document.createElement('span');
        ws.textContent = tripStopName(l.from) + ' → ' + tripStopName(l.to);
        body.appendChild(ws);
      }
      row.appendChild(dot);
      row.appendChild(body);
      det.appendChild(row);
    });
  }
  function nearestOnPath(path, x, z) {
    var bi = 0, bd = Infinity;
    for (var i = 0; i < path.length; i++) {
      var dx = path[i][0] - x, dz = path[i][1] - z;
      var d = dx * dx + dz * dz;
      if (d < bd) { bd = d; bi = i; }
    }
    return bi;
  }
  // Slice of a route's guideway between two stops, for highlight + fly-through.
  function busLegSlice(leg) {
    var route = routeById[leg.routeId];
    if (!route || !route.paths || !route.paths.length) return null;
    var ri = routeOrder.indexOf(leg.routeId);
    var y = 66 + ri * 1.2 + 3; // just above this route's deck
    var a = stopData[leg.board], b = stopData[leg.alight];
    if (!a || !b) return null;
    var best = null;
    route.paths.forEach(function (path) {
      if (!path || path.length < 2) return;
      var ia = nearestOnPath(path, a.x, a.z), ib = nearestOnPath(path, b.x, b.z);
      var d = Math.pow(path[ia][0] - a.x, 2) + Math.pow(path[ia][1] - a.z, 2) +
              Math.pow(path[ib][0] - b.x, 2) + Math.pow(path[ib][1] - b.z, 2);
      if (!best || d < best.d) best = { path: path, ia: ia, ib: ib, d: d };
    });
    if (!best) return null;
    var i0 = Math.min(best.ia, best.ib), i1 = Math.max(best.ia, best.ib);
    if (i1 - i0 < 1) return null;
    return { pts: best.path.slice(i0, i1 + 1), y: y };
  }
  function legPoints3D(leg) {
    if (leg.type === 'walk') {
      var a = leg.fromLoc ? { x: tripFrom.x, z: tripFrom.z } : stopData[leg.from];
      var b = stopData[leg.to];
      if (!a || !b) return [];
      return [new THREE.Vector3(a.x, 80, a.z), new THREE.Vector3(b.x, 80, b.z)];
    }
    var sl = busLegSlice(leg);
    if (!sl) return [];
    return sl.pts.map(function (p) { return new THREE.Vector3(p[0], sl.y, p[1]); });
  }
  function highlightJourney(j) {
    clearTripHighlight();
    if (!j) return;
    mergeWalkLegs(j.legs).forEach(function (leg) {
      if (leg.type === 'bus') {
        var sl = busLegSlice(leg);
        if (!sl) return;
        var mat = new THREE.MeshBasicMaterial({
          color: new THREE.Color(leg.color || '#F5F2EA'), transparent: true,
          opacity: 0.85, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.DoubleSide
        });
        mat.userData.baseOpacity = 0.85;
        tripGroup.add(new THREE.Mesh(ribbonGeometry(sl.pts, 46, sl.y), mat));
        tripMats.push(mat);
      } else {
        var pts3 = legPoints3D(leg);
        if (pts3.length < 2) return;
        pts3[0].y = 30; pts3[1].y = 30;
        var g = new THREE.BufferGeometry().setFromPoints(pts3);
        var wm = new THREE.LineDashedMaterial({ color: 0xf5f2ea, transparent: true, opacity: 0.8, dashSize: 60, gapSize: 40 });
        var line = new THREE.Line(g, wm);
        line.computeLineDistances();
        wm.userData.baseOpacity = 0.8;
        tripGroup.add(line);
        tripMats.push(wm);
      }
    });
    tripGroup.visible = true;
  }
  // Cinematic fly-through of the selected journey: the perspective is the
  // interface. Chase-cam along the journey path; any pointerdown hands
  // control straight back to the rider.
  function flyJourney(j) {
    if (!j) return;
    var pts = [];
    mergeWalkLegs(j.legs).forEach(function (leg) {
      var lp = legPoints3D(leg);
      for (var i = 0; i < lp.length; i++) {
        if (pts.length && i === 0) continue;
        pts.push(lp[i]);
      }
    });
    if (pts.length < 2) return;
    if (pts.length > 80) {
      var step = (pts.length - 1) / 79, dp = [];
      for (var k = 0; k < 80; k++) dp.push(pts[Math.round(k * step)]);
      pts = dp;
    }
    tripFly = {
      curve: new THREE.CatmullRomCurve3(pts),
      t0: performance.now(),
      dur: Math.min(6500, 2600 + pts.length * 45)
    };
    controls.enabled = false;
  }
  function stepTripFly(now) {
    if (!tripFly) return;
    var t = Math.min(1, (now - tripFly.t0) / tripFly.dur);
    var e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
    var pos = tripFly.curve.getPoint(e);
    var ahead = tripFly.curve.getPoint(Math.min(1, e + 0.03));
    _flyDir.copy(ahead).sub(pos);
    if (_flyDir.lengthSq() > 1e-6) _flyDir.normalize();
    camera.position.copy(pos).addScaledVector(_flyDir, -450).add(_flyUp);
    controls.target.copy(ahead);
    if (t >= 1) { tripFly = null; controls.enabled = true; }
  }
  $('trip-btn').addEventListener('click', function () { tapBuzz(); setTripMode(!tripMode); });
  $('trip-close').addEventListener('click', function () { setTripMode(false); });
  $('trip-from-btn').addEventListener('click', function () { openTripSearch('from'); });
  $('trip-to-btn').addEventListener('click', function () { openTripSearch('to'); });
  $('trip-search-back').addEventListener('click', function () { showTripView('planner'); renderTripFields(); });
  $('trip-search-input').addEventListener('input', function (e) { renderTripSearchResults(e.target.value); });
  $('trip-swap').addEventListener('click', function () {
    tapBuzz();
    cancelTripFly();
    var f = tripFrom, t = tripTo;
    // A location origin can't become a destination; it yields its slot.
    tripFrom = (t && t.kind === 'stop') ? t : null;
    tripTo = (f && f.kind === 'stop') ? f : null;
    renderTripFields(); updateTripMarkers(); maybeReplan();
  });
  $('trip-now-btn').addEventListener('click', function () {
    tripLeaveMode = 'now'; tripLeaveTime = '';
    renderTripFields(); maybeReplan();
  });
  $('trip-time-input').addEventListener('change', function (e) {
    if (e.target.value) { tripLeaveMode = 'at'; tripLeaveTime = e.target.value; }
    else { tripLeaveMode = 'now'; tripLeaveTime = ''; }
    renderTripFields(); maybeReplan();
  });
  renderer.domElement.addEventListener('pointerdown', function () { cancelTripFly(); });

  // --- filters ---------------------------------------------------------------
  // filterState.routes[rid] is the ONLY visibility gate: any route can be
  // toggled on its own, no group header required. Group headers are bulk
  // setters (all on / all off); they never gate individual routes.
  // filterState.hideIdle (default ON): fully hide routes confirmed not-running.
  // filterState.nearMe: only routes with a stop within NEAR_ME_M of you.
  var filterState = { groups: {}, routes: {}, hideIdle: true, nearMe: false };
  var NEAR_ME_M = 1250;
  var nearMeSet = null;   // rid -> true, rebuilt when you move or toggle
  var userXZ = null;      // your projected position, set by onLocated
  var pendingNearMe = false;

  // True when the near-me filter lets this route through (or is off).
  function routeNearOk(rid) {
    return !filterState.nearMe || !!(nearMeSet && nearMeSet[rid]);
  }

  function routeIsOn(rid) {
    var r = routeById[rid];
    return !!(r && filterState.routes[rid]);
  }

  // 'all' | 'none' | 'mixed' — derived from the routes, never stored.
  function groupSelState(gid) {
    var rids = groupRoutes[gid] || [];
    if (!rids.length) return 'none';
    var on = 0;
    rids.forEach(function (rid) { if (filterState.routes[rid]) on++; });
    if (on === 0) return 'none';
    if (on === rids.length) return 'all';
    return 'mixed';
  }

  // Smart disabling: non-running routes are hidden when hideIdle is on,
  // dimmed when it is off. 'unknown' (pre-first-poll) never hides.
  function routeShown(rid) {
    if (!routeIsOn(rid)) return false;
    if (!routeNearOk(rid)) return false;
    if (filterState.hideIdle && runningState[rid] === 'not-running') return false;
    return true;
  }

  function computeNearMe() {
    nearMeSet = {};
    if (!userXZ || !stopData) return;
    var r2 = NEAR_ME_M * NEAR_ME_M;
    for (var i = 0; i < stopData.length; i++) {
      var s = stopData[i];
      var dx = s.x - userXZ[0], dz = s.z - userXZ[1];
      if (dx * dx + dz * dz > r2) continue;
      for (var j = 0; j < s.r.length; j++) nearMeSet[s.r[j]] = true;
    }
  }

  function setNearMe(on) {
    filterState.nearMe = on;
    pendingNearMe = false;
    var t = $('nearme-toggle');
    if (t) t.setAttribute('aria-pressed', String(on));
    if (on) computeNearMe();
    applyFilters();
    syncFilterUI();
    refreshFilterCounts();
    if (on) {
      var n = nearMeSet ? Object.keys(nearMeSet).length : 0;
      showToast(n ? n + ' routes within ' + NEAR_ME_M + ' m of you.' : 'No routes within ' + NEAR_ME_M + ' m of you.', !n);
    } else {
      hideToast();
    }
  }

  function applyDim(rid) {
    var g = routeGroups[rid];
    if (!g || !g.userData.guideMats) return;
    var dim = runningState[rid] === 'not-running' && !filterState.hideIdle && g.visible;
    g.userData.guideMats.forEach(function (e) {
      if (e.dimmed === dim) return; // unchanged: never touch the material (needsUpdate forces a shader recompile)
      e.dimmed = dim;
      e.mat.transparent = dim ? true : false;
      e.mat.opacity = dim ? DIM_OPACITY : e.opacity;
    });
  }

  function applyFilters() {
    routeOrder.forEach(function (rid) {
      if (routeGroups[rid]) routeGroups[rid].visible = routeShown(rid);
      applyDim(rid);
    });
    groupOrder.forEach(function (gid) {
      if (groupObjs[gid]) groupObjs[gid].visible = groupSelState(gid) !== 'none';
    });
    rebuildStops();
    if (lastVehicles) updateBuses(lastVehicles);
    refreshHeaderCount();
  }

  function syncFilterUI() {
    groupOrder.forEach(function (gid) {
      var st = groupSelState(gid);
      var check = document.querySelector('.f-group-head[data-group="' + gid + '"] .f-check');
      var sec = document.querySelector('.f-group[data-group="' + gid + '"]');
      if (check) check.setAttribute('aria-pressed', st === 'mixed' ? 'mixed' : String(st === 'all'));
      if (sec) sec.classList.toggle('off', st === 'none');
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
      // Calm default: only the ConnectTen core network is on. The panel
      // opens as an accordion (3 rows); route chips expand per group.
      var gOn = (g.id === 'connect-ten');
      filterState.groups[g.id] = gOn;
      var sec = document.createElement('div');
      sec.className = 'f-group';
      sec.dataset.group = g.id;
      var head = document.createElement('div');
      head.className = 'f-group-head';
      head.dataset.group = g.id;
      var check = document.createElement('button');
      check.className = 'f-check';
      check.setAttribute('aria-label', 'Toggle all ' + g.name + ' routes');
      check.innerHTML = '<span class="f-box"></span>';
      check.addEventListener('click', function () {
        var on = groupSelState(g.id) !== 'all'; // all-on -> switch off; else switch on
        filterState.groups[g.id] = on;
        g.routes.forEach(function (rid) { filterState.routes[rid] = on; });
        applyFilters();
        syncFilterUI();
      });
      var label = document.createElement('button');
      label.className = 'f-label';
      label.setAttribute('aria-expanded', 'false');
      label.setAttribute('aria-label', 'Expand ' + g.name + ' routes');
      label.innerHTML = '<b>' + g.name + '</b>' +
        '<span class="f-count" id="fgc-' + g.id + '">–</span><span class="f-chev">▾</span>';
      label.addEventListener('click', function () {
        var open = sec.classList.toggle('open');
        label.setAttribute('aria-expanded', String(open));
      });
      head.appendChild(check);
      head.appendChild(label);
      var list = document.createElement('div');
      list.className = 'f-routes';
      g.routes.forEach(function (rid) {
        var route = routeById[rid];
        if (!route) return;
        filterState.routes[rid] = gOn;
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
    $('nearme-toggle').addEventListener('click', function () {
      if (filterState.nearMe) { setNearMe(false); return; }
      if (userXZ) { setNearMe(true); return; }
      // No fix yet: run the locate flow; it enables near-me on success.
      pendingNearMe = true;
      locateBtn.click();
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

  var lastHeaderText = '', lastHeaderWarn = false;
  function setHeader(total, text, warn) {
    lastHeaderText = text; lastHeaderWarn = !!warn;
    $('bus-total').textContent = (total != null) ? total : '–';
    var el = $('bus-updated');
    el.textContent = text;
    el.className = warn ? 'feed-warn' : '';
  }
  // The header count must follow filters immediately — a toggle that
  // empties the map while the header still claims "13 buses" is a lie.
  function refreshHeaderCount() {
    if (!lastVehicles) return;
    setHeader(busSlots.length, lastHeaderText, lastHeaderWarn);
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
      var run = 0, shownNear = 0, nearTot = 0;
      var tot = (groupRoutes[gid] || []).length;
      (groupRoutes[gid] || []).forEach(function (rid) {
        if (runningState[rid] === 'running') run++;
        if (filterState.nearMe && nearMeSet && nearMeSet[rid]) {
          nearTot++;
          if (routeShown(rid)) shownNear++;
        }
      });
      // When near-me is on, say what is actually on the map — the global
      // "N of M running" no longer describes the view.
      el.textContent = filterState.nearMe
        ? shownNear + ' of ' + tot + ' shown near you'
        : run + ' of ' + tot + ' running';
    });
  }

  // Near-me scope label on the toggle itself, kept fresh wherever the
  // near set changes (toggle, locate, poll).
  function refreshFilterCounts() {
    updateCounts();
    var sub = $('nearme-sub');
    if (sub) {
      var n = (filterState.nearMe && nearMeSet) ? Object.keys(nearMeSet).length : 0;
      sub.textContent = NEAR_ME_M + ' m' + (filterState.nearMe ? ' · ' + n + ' near you' : '');
    }
  }

  var groupRoutes = {}; // gid -> [route ids]
  var lastVehicles = null;

  // Recompute per-route running state from the latest live counts.
  // Returns true if any route flipped between running/not-running.
  // Running-state engine. Asymmetric by design: a visible bus means
  // 'running' immediately (certain); a disappearance needs 3 quiet polls
  // (uncertain — could be a feed gap). A route never seen running has no
  // prior state to protect from flicker, so the first poll marks zero-bus
  // routes 'not-running' at once — otherwise "hide non-running" is a lie
  // for ~3 minutes after every load.
  var runningPrimed = false;
  function updateRunningState() {
    var changed = false;
    routeOrder.forEach(function (rid) {
      var buses = liveCounts[rid] || 0;
      if (buses > 0) {
        quietStreak[rid] = 0;
        if (runningState[rid] !== 'running') { runningState[rid] = 'running'; changed = true; }
      } else {
        quietStreak[rid] = (quietStreak[rid] || 0) + 1;
        var need = runningPrimed ? 3 : 1;
        if (quietStreak[rid] >= need && runningState[rid] !== 'not-running') {
          runningState[rid] = 'not-running'; changed = true;
        }
      }
    });
    runningPrimed = true;
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
    if (selectedStop) renderStopLive();
    if (typeof refreshTripFusion === 'function') refreshTripFusion(); // live counts on trip legs
    if (selectedVehicleId) refreshBusInfo(); // tapped bus moved / new data
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
        refreshFilterCounts();
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
      .catch(function () { return null; }),
    fetch('assets/detroit-streets.json?v=' + STAMP, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; }),
    fetch('assets/detroit-street-names.json?v=' + STAMP, { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; })
  ])
    .then(function (all) {
      var data = all[0];
      fleetData = all[1];
      streetData = all[2];
      streetNameData = all[3];
      proj = {
        lat0: data.projection.lat0,
        lon0: data.projection.lon0,
        mLat: 111320,
        mLon: 111320 * Math.cos(data.projection.lat0 * DEG)
      };

      // Vector street map, drawn ourselves: dark ground + tiered OSM
      // highway geometry. Crisp at every zoom; no raster tiles.
      var streetLocal = null;
      (function buildStreets() {
        var nw = project(STREET_BOUNDS.latN, STREET_BOUNDS.lonW);
        var se = project(STREET_BOUNDS.latS, STREET_BOUNDS.lonE);
        var w = se[0] - nw[0], h = se[1] - nw[1];
        var ground = new THREE.Mesh(
          new THREE.PlaneGeometry(w, h),
          new THREE.MeshBasicMaterial({ color: 0x0d1319 })
        );
        ground.rotation.x = -Math.PI / 2;
        ground.position.set(nw[0] + w / 2, 0, nw[1] + h / 2);
        scene.add(ground);
        // Safe-zone border: dashed amber perimeter at the coverage bounds so the
        // edge of the mapped area stays visible while panning/scrolling. Floats
        // at y=20 — above the street tiers (14-16), below the route decks (~66).
        // Brand: Amber #FFB000, the academy's signal accent.
        (function addBoundsBorder() {
          var x0 = nw[0], x1 = se[0], z0 = nw[1], z1 = se[1], yB = 20;
          var g = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(x0, yB, z0),
            new THREE.Vector3(x1, yB, z0),
            new THREE.Vector3(x1, yB, z1),
            new THREE.Vector3(x0, yB, z1)
          ]);
          var border = new THREE.LineLoop(g, new THREE.LineDashedMaterial({
            color: 0xFFB000, dashSize: 220, gapSize: 140,
            transparent: true, opacity: 0.55, depthWrite: false
          }));
          border.computeLineDistances();
          border.renderOrder = 5;
          border.name = 'safe-zone-border';
          scene.add(border);
        })();
        if (!streetData) return; // ground still renders; streets absent
        function addTier(arr, color, opacity, y) {
          if (!arr || !arr.length) return null;
          var n = arr.length / 4;
          var pos = new Float32Array(n * 6);
          for (var i = 0; i < n; i++) {
            pos[i * 6]     = arr[i * 4];
            pos[i * 6 + 1] = y;
            pos[i * 6 + 2] = arr[i * 4 + 1];
            pos[i * 6 + 3] = arr[i * 4 + 2];
            pos[i * 6 + 4] = y;
            pos[i * 6 + 5] = arr[i * 4 + 3];
          }
          var g = new THREE.BufferGeometry();
          g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
          var lines = new THREE.LineSegments(g,
            new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: opacity }));
          lines.frustumCulled = false;
          scene.add(lines);
          return lines;
        }
        addTier(streetData.freeway, 0x8a94a0, 0.95, 16);
        addTier(streetData.arterial, 0x4d5763, 0.9, 15);
        streetLocal = addTier(streetData.local, 0x333c46, 0.8, 14);
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

      data.routes.forEach(function (route, ri) {
        var color = new THREE.Color(route.color);
        routeColors[route.id] = color;
        routeNames[route.id] = route.name;
        routeById[route.id] = route;
        routeOrder.push(route.id);
        var grp = new THREE.Group();
        // Stagger ribbon heights per route: coplanar overlapping guideways
        // at crossings z-fight and flicker; a few meters of separation is
        // invisible but kills the shimmer.
        // Deliberate layer cake (meters): every route owns a unique level —
        // 37 routes, no shared slots, so crossing/overlapping decks can never
        // z-fight. Crossings read as clean overpasses, higher route over lower.
        var yDeck = 66 + ri * 1.2;
        var yGlow = 2 + ri * 0.25;
        var yCase = 24 + ri * 0.15;
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
          grp.add(new THREE.Mesh(ribbonGeometry(path, 230, yGlow), glowMat));
          grp.add(new THREE.Mesh(ribbonGeometry(path, 95, yCase), casingMat));
          var deckGeo = ribbonGeometry(path, 72, yDeck);
          deckGeo.computeVertexNormals();
          grp.add(new THREE.Mesh(deckGeo, deckMat));
          grp.add(new THREE.Mesh(skirtGeometry(path, 72, yDeck), skirtMat));
          if (!longest || path.length > longest.length) longest = path;
        });
        if (longest) {
          var mid = longest[Math.floor(longest.length / 2)];
          var label = makeLabel(route.id + ' · ' + route.name, route.color);
          label.position.set(mid[0], 1050, mid[1]);
          grp.add(label);
          var tetherGeo = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(mid[0], yDeck, mid[1]),
            new THREE.Vector3(mid[0], 980, mid[1])
          ]);
          var tether = new THREE.Line(tetherGeo, new THREE.LineBasicMaterial({ color: color, transparent: true, opacity: 0.45 }));
          grp.add(tether);
          labelSprites.push({ sprite: label, routeId: route.id, tether: tether });
        }
        scene.add(grp);
        routeGroups[route.id] = grp;
      });

      // Stops are rebuilt from stopData by rebuildStops() (per-route colors,
      // paper-white hubs) whenever filters change; see the stops section.
      stopData = data.stops || [];

      buildFilterPanel(data.groups);
      applyFilters();
      syncFilterUI();
      rebuildStops();
      // Soft location ask, once the map has settled. The old first-time
      // popup is gone — "?" is the help hub now.
      setTimeout(maybePromptLocation, 4000);
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
        if (typeof stepTripFly === 'function') stepTripFly(performance.now());
        if (youMarker.group.visible) {
          var t = performance.now();
          var s = 1 + 0.22 * Math.sin(t / 420);
          youMarker.ring.scale.set(s, s, s);
          youMarker.badge.position.y = YOU_BADGE_Y + YOU_BADGE_BOB * Math.sin(t / 650);
        }
        // Selected bus pulses at the same rate as the user-location ring.
        // Trip-journey highlight breathes at the same shared rate.
        if (tripGroup.visible && tripMats.length) {
          var tp = 0.72 + 0.28 * Math.sin(performance.now() / 420);
          for (var tmi = 0; tmi < tripMats.length; tmi++) {
            tripMats[tmi].opacity = tripMats[tmi].userData.baseOpacity * tp;
          }
        }
        if (selectedVehicleId) {
          placeBusInfo(); // info label tracks the bus every frame
          var pulse = busPulse();
          if (busMode) {
            for (var pi = 0; pi < DETAIL_MAX; pi++) {
              var pd = detailPool[pi];
              if (pd && pd.group.visible && pd.vehicle && pd.vehicle.vehicle_id === selectedVehicleId) {
                pd.group.scale.set(1.45 * pulse, 1.45 * pulse, 1.45 * pulse);
              }
            }
          } else {
            for (var si = 0; si < busSlots.length; si++) {
              if (busSlots[si].vehicle.vehicle_id === selectedVehicleId) {
                writeBusMatrices(si, busSlots[si], pulse);
                break;
              }
            }
            pillarMeshes.forEach(function (im) { im.instanceMatrix.needsUpdate = true; });
          }
        }
        if (busMode !== lastBusMode) {
          lastBusMode = busMode;
          renderBusInstances();
        }
        // Label rule: route enabled, not confirmed not-running, AND (live buses
        // on the route OR zoomed far out). Midpoint labels hide at street zoom
        // (< 7 km) where bus badges and street names take over.
        var camDist = camera.position.distanceTo(controls.target);
        // LOD: local streets and stops declutter at city-scale zooms.
        if (streetLocal) streetLocal.visible = camDist < 22000;
        if (stopGroup) stopGroup.visible = camDist < STOP_LOD_DIST;
        for (var i = 0; i < labelSprites.length; i++) {
          var L = labelSprites[i];
          var lvis = runningState[L.routeId] !== 'not-running' &&
            ((liveCounts[L.routeId] > 0) || camDist > 15000) && camDist > 7000 &&
            routeNearOk(L.routeId);
          L.sprite.visible = lvis;
          if (L.tether) L.tether.visible = lvis;
        }
        if (stopHighlight.visible) {
          var shp = busPulse();
          stopHighlight.scale.set(shp, shp, 1);
        }
        updateStreetLabels();
        updateBadgeScales();
        renderer.render(scene, camera);
      });
    })
    .catch(function () {
      fail('Could not load route data. Please check your connection and reload.');
    });

  resize();
})();
