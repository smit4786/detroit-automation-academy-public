// Detroit Automation Academy — procedural architecture kit.
// SimCity 3000 design bar: no flat boxes. Canvas-painted textures at real
// scale (brick, glass, concrete, roofing) + true-to-scale THREE geometry.
// Classic script; exposes window.DAAArchKit. Replaces the flat OpenSCAD STLs.
(function () {
  'use strict';

  var PXM = 64; // texture pixels per meter

  function cv(wM, hM) {
    var c = document.createElement('canvas');
    c.width = Math.max(2, Math.round(wM * PXM));
    c.height = Math.max(2, Math.round(hM * PXM));
    return [c, c.getContext('2d')];
  }

  // deterministic PRNG so textures are stable across loads
  function rnd(seed) {
    var s = seed >>> 0;
    return function () {
      s = (s * 1664525 + 1013904223) >>> 0;
      return s / 4294967296;
    };
  }

  function shade(rgb, f) {
    var r = Math.max(0, Math.min(255, Math.round(rgb[0] * f)));
    var g = Math.max(0, Math.min(255, Math.round(rgb[1] * f)));
    var b = Math.max(0, Math.min(255, Math.round(rgb[2] * f)));
    return 'rgb(' + r + ',' + g + ',' + b + ')';
  }

  // canvas y for a height measured in meters from the wall base
  // (canvas row 0 is the wall top; flipY puts it at v=1)
  function Y(hM, yFromBase) { return (hM - yFromBase) * PXM; }

  function paintBrick(g, W, H, seed, base) {
    var R = rnd(seed);
    var bh = 0.075 * PXM, bw = 0.23 * PXM;
    g.fillStyle = shade(base, 0.55);
    g.fillRect(0, 0, W, H);
    for (var y = 0, row = 0; y < H; y += bh, row++) {
      var off = (row % 2) * bw / 2;
      for (var x = -bw; x < W + bw; x += bw) {
        g.fillStyle = shade(base, 0.8 + R() * 0.4);
        g.fillRect(x + off + 1, y + 1, bw - 2, bh - 2);
      }
    }
  }

  function paintWindow(g, x, y, w, h) {
    // concrete sill + dark soldier-course header
    g.fillStyle = '#c9c2b4';
    g.fillRect(x - 5, y + h, w + 10, Math.max(3, 0.1 * PXM));
    g.fillStyle = 'rgba(0,0,0,0.28)';
    g.fillRect(x - 5, y - Math.max(3, 0.12 * PXM), w + 10, Math.max(3, 0.12 * PXM));
    // steel sash frame
    g.fillStyle = '#24282d';
    g.fillRect(x, y, w, h);
    var cols = 3, rows = 4, m = Math.max(2, 0.05 * PXM);
    var pw = (w - m * (cols + 1)) / cols, ph = (h - m * (rows + 1)) / rows;
    for (var c = 0; c < cols; c++) {
      for (var r = 0; r < rows; r++) {
        var px = x + m + c * (pw + m), py = y + m + r * (ph + m);
        var gr = g.createLinearGradient(px, py, px, py + ph);
        gr.addColorStop(0, '#a9c2cf');
        gr.addColorStop(0.55, '#7d939f');
        gr.addColorStop(1, '#54666f');
        g.fillStyle = gr;
        g.fillRect(px, py, pw, ph);
      }
    }
    // diagonal sheen
    g.fillStyle = 'rgba(255,255,255,0.10)';
    g.beginPath();
    g.moveTo(x, y + h);
    g.lineTo(x + w * 0.45, y);
    g.lineTo(x + w * 0.7, y);
    g.lineTo(x + w * 0.25, y + h);
    g.closePath();
    g.fill();
  }

  function inOpenings(openings, x, y) {
    if (!openings) return false;
    for (var i = 0; i < openings.length; i++) {
      var o = openings[i];
      if (x >= o.x0 && x <= o.x1 && y >= o.y0 && y <= o.y1) return true;
    }
    return false;
  }

  // Full industrial wall: brick, water table, window band, low windows.
  // openings: [{x0,x1,y0,y1}] in meters from the wall's west/bottom corner.
  function wallCanvas(wM, hM, seed, openings) {
    var p = cv(wM, hM), g = p[1], W = p[0].width, H = p[0].height;
    paintBrick(g, W, H, seed, [122, 62, 44]);
    // water table: darker base + concrete cap
    var wt = 0.9 * PXM;
    g.fillStyle = 'rgba(28,12,8,0.5)';
    g.fillRect(0, H - wt, W, wt);
    g.fillStyle = '#b9b2a4';
    g.fillRect(0, H - wt - 0.12 * PXM, W, 0.12 * PXM);
    // main window band: 2.4 x 3.0 m steel-sash units, sill at 5.4 m
    var ww = 2.4, wh = 3.0, sill = 5.4;
    for (var x = 2.0; x + ww <= wM - 1.5; x += 4.0) {
      if (inOpenings(openings, x + ww / 2, sill + wh / 2)) continue;
      paintWindow(g, x * PXM, Y(hM, sill + wh), ww * PXM, wh * PXM);
    }
    // small square windows low on the wall
    var sw = 1.2, ssill = 3.2;
    for (var x2 = 4.0; x2 + sw <= wM - 3.0; x2 += 8.0) {
      if (inOpenings(openings, x2 + sw / 2, ssill + sw / 2)) continue;
      paintWindow(g, x2 * PXM, Y(hM, ssill + sw), sw * PXM, sw * PXM);
    }
    // concrete band at the top (sits behind the 3D cornice)
    g.fillStyle = '#b9b2a4';
    g.fillRect(0, 0, W, 0.45 * PXM);
    // grime at the base
    var gr = g.createLinearGradient(0, H - 2 * PXM, 0, H);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(1, 'rgba(0,0,0,0.3)');
    g.fillStyle = gr;
    g.fillRect(0, H - 2 * PXM, W, 2 * PXM);
    return p[0];
  }

  // Vertical sawtooth glazing: dense mullion/transom grid, sky glass.
  function glassCanvas(wM, hM, seed) {
    var p = cv(wM, hM), g = p[1], W = p[0].width, H = p[0].height;
    var R = rnd(seed);
    var gr = g.createLinearGradient(0, 0, 0, H);
    gr.addColorStop(0, '#bcd4e0');
    gr.addColorStop(0.6, '#8ba2ae');
    gr.addColorStop(1, '#667983');
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    // per-pane tone variation
    var mw = 1.25 * PXM, th = 1.5 * PXM;
    for (var x = 0; x < W; x += mw) {
      for (var y = 0; y < H; y += th) {
        g.fillStyle = 'rgba(' + (140 + R() * 40 | 0) + ',' + (170 + R() * 30 | 0) + ',' +
          (185 + R() * 30 | 0) + ',0.18)';
        g.fillRect(x + 2, y + 2, mw - 4, th - 4);
      }
    }
    // sheen
    g.fillStyle = 'rgba(255,255,255,0.12)';
    g.beginPath();
    g.moveTo(0, H); g.lineTo(W * 0.4, 0); g.lineTo(W * 0.62, 0); g.lineTo(W * 0.22, H);
    g.closePath(); g.fill();
    // mullions + transoms
    g.fillStyle = '#2a2d31';
    for (var mx = 0; mx <= W + 1; mx += mw) g.fillRect(mx - 2, 0, 4, H);
    for (var my = 0; my <= H + 1; my += th) g.fillRect(0, my - 2, W, 4);
    // head + sill
    g.fillStyle = '#1e2124';
    g.fillRect(0, 0, W, 5);
    g.fillStyle = '#c9c2b4';
    g.fillRect(0, H - 6, W, 6);
    return p[0];
  }

  function roofCanvas() {
    var p = cv(6, 6), g = p[1], W = p[0].width, H = p[0].height;
    var R = rnd(77);
    g.fillStyle = '#3a3d40';
    g.fillRect(0, 0, W, H);
    for (var i = 0; i < 900; i++) {
      g.fillStyle = 'rgba(255,255,255,' + (R() * 0.05) + ')';
      g.fillRect(R() * W, R() * H, 2, 2);
      g.fillStyle = 'rgba(0,0,0,' + (R() * 0.08) + ')';
      g.fillRect(R() * W, R() * H, 2, 2);
    }
    g.fillStyle = 'rgba(0,0,0,0.35)';
    for (var x = 0; x < W; x += PXM) g.fillRect(x, 0, 2, H);
    for (var y = 0; y < H; y += PXM) g.fillRect(0, y, W, 2);
    return p[0];
  }

  function concreteCanvas(wM, hM, seed) {
    var p = cv(wM, hM), g = p[1], W = p[0].width, H = p[0].height;
    var R = rnd(seed);
    g.fillStyle = '#b5aea1';
    g.fillRect(0, 0, W, H);
    for (var i = 0; i < W * H / 900; i++) {
      g.fillStyle = R() > 0.5 ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)';
      g.fillRect(R() * W, R() * H, 3, 3);
    }
    return p[0];
  }

  // tileable 4x4 m brick patch for gables / chimney
  function brickPatchCanvas() {
    var p = cv(4, 4), g = p[1];
    paintBrick(g, p[0].width, p[0].height, 9, [122, 62, 44]);
    return p[0];
  }

  function rollupCanvas(wM, hM) {
    var p = cv(wM, hM), g = p[1], W = p[0].width, H = p[0].height;
    var slat = 0.18 * PXM;
    for (var y = 0; y < H; y += slat) {
      var gr = g.createLinearGradient(0, y, 0, y + slat);
      gr.addColorStop(0, '#a7adb3');
      gr.addColorStop(0.8, '#848b91');
      gr.addColorStop(1, '#5f656b');
      g.fillStyle = gr;
      g.fillRect(0, y, W, slat - 2);
    }
    g.fillStyle = '#2b2e33';
    g.fillRect(0, H - 0.25 * PXM, W, 0.25 * PXM); // rubber seal
    g.fillStyle = '#c96a1e';
    g.fillRect(W / 2 - 30, H / 2 - 8, 60, 16); // handle plate
    return p[0];
  }

  function pedDoorCanvas(wM, hM) {
    var p = cv(wM, hM), g = p[1], W = p[0].width, H = p[0].height;
    var gr = g.createLinearGradient(0, 0, W, 0);
    gr.addColorStop(0, '#31363c');
    gr.addColorStop(0.5, '#3d434a');
    gr.addColorStop(1, '#2b3036');
    g.fillStyle = gr;
    g.fillRect(0, 0, W, H);
    // narrow vertical lite
    g.fillStyle = '#24282d';
    g.fillRect(W * 0.36, H * 0.12, W * 0.28, H * 0.5);
    var gg = g.createLinearGradient(0, H * 0.12, 0, H * 0.62);
    gg.addColorStop(0, '#a9c2cf');
    gg.addColorStop(1, '#5f737e');
    g.fillStyle = gg;
    g.fillRect(W * 0.36 + 4, H * 0.12 + 4, W * 0.28 - 8, H * 0.5 - 8);
    // kick plate + handle
    g.fillStyle = '#7c8288';
    g.fillRect(6, H - 0.3 * PXM, W - 12, 0.3 * PXM - 6);
    g.fillStyle = '#c8ccd0';
    g.fillRect(W - 16, H * 0.52, 8, 26);
    return p[0];
  }

  function signCanvas(wM, hM) {
    var p = cv(wM, hM), g = p[1], W = p[0].width, H = p[0].height;
    g.fillStyle = '#0e141b';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = '#E85D1A';
    g.lineWidth = 4;
    g.strokeRect(6, 6, W - 12, H - 12);
    g.textAlign = 'center';
    g.fillStyle = '#FFB000';
    g.font = '700 ' + Math.round(H * 0.42) + 'px system-ui, sans-serif';
    g.fillText('THE WORKSHOP', W / 2, H * 0.5);
    g.fillStyle = '#F5F2EA';
    g.font = '600 ' + Math.round(H * 0.2) + 'px system-ui, sans-serif';
    g.fillText('DETROIT AUTOMATION ACADEMY', W / 2, H * 0.8);
    return p[0];
  }

  // ---------------- builders ----------------

  function tex(THREE, canvas, srgb) {
    var t = new THREE.CanvasTexture(canvas);
    if (srgb !== false) t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 4;
    return t;
  }

  function std(THREE, map, roughness, metalness, extra) {
    var o = { map: map, roughness: roughness == null ? 0.9 : roughness, metalness: metalness || 0 };
    if (extra) for (var k in extra) o[k] = extra[k];
    return new THREE.MeshStandardMaterial(o);
  }

  function rod(THREE, mat, ax, ay, az, bx, by, bz) {
    var a = new THREE.Vector3(ax, ay, az), b = new THREE.Vector3(bx, by, bz);
    var d = new THREE.Vector3().subVectors(b, a);
    var m = new THREE.Mesh(new THREE.CylinderGeometry(0.025, 0.025, d.length(), 8), mat);
    m.position.copy(a).addScaledVector(d, 0.5);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize());
    return m;
  }

  // The Workshop: 26 x 20 x 10 m industrial hall, 3 sawtooth teeth (+4.5 m),
  // entrance on the south (+z) face. Matches cad/world.scad massing.
  function buildWorkshop(THREE) {
    var g = new THREE.Group();
    var W = 26, D = 20, H = 10;

    var southOpen = [{ x0: -2.9, x1: 5.0, y0: 0, y1: 5.4 }];
    var mSouth = std(THREE, tex(THREE, wallCanvas(W, H, 11, southOpen)));
    var mNorth = std(THREE, tex(THREE, wallCanvas(W, H, 12)));
    var mEast = std(THREE, tex(THREE, wallCanvas(D, H, 13)));
    var mWest = std(THREE, tex(THREE, wallCanvas(D, H, 14)));
    var mRoof = std(THREE, tex(THREE, roofCanvas()), 0.95);
    mRoof.map.wrapS = mRoof.map.wrapT = THREE.RepeatWrapping;
    var mDark = new THREE.MeshStandardMaterial({ color: 0x14171b, roughness: 1 });
    var mConcrete = std(THREE, tex(THREE, concreteCanvas(4, 1, 21)), 0.9);
    var mSteel = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.6, metalness: 0.5 });

    // hall: BoxGeometry faces [+x, -x, +y, -y, +z, -z]
    var hall = new THREE.Mesh(
      new THREE.BoxGeometry(W, H, D),
      [mEast, mWest, mRoof, mDark, mSouth, mNorth]
    );
    hall.position.y = H / 2;
    g.add(hall);

    // cornice: proud concrete band at the wall head
    var cornice = new THREE.Mesh(new THREE.BoxGeometry(W + 0.6, 0.5, D + 0.6), mConcrete);
    cornice.position.y = H - 0.2;
    g.add(cornice);

    // sawtooth teeth: vertical glazed east face + sloped roof plane + gables
    var teeth = 3, tw = W / teeth, rise = 4.5;
    var slopeLen = Math.sqrt(tw * tw + rise * rise);
    var slopeAng = Math.atan2(rise, tw);
    var patch = tex(THREE, brickPatchCanvas());
    patch.wrapS = patch.wrapT = THREE.RepeatWrapping;
    patch.repeat.set(0.25, 0.25); // ShapeGeometry UVs are in meters -> 4 m tiles
    var mGable = std(THREE, patch, 0.9, 0, { side: THREE.DoubleSide });
    var mGlass = std(THREE, tex(THREE, glassCanvas(D, rise, 31)), 0.35, 0.15,
      { side: THREE.DoubleSide });
    var mSlope = std(THREE, tex(THREE, roofCanvas()), 0.95, 0, { side: THREE.DoubleSide });
    mSlope.map.wrapS = mSlope.map.wrapT = THREE.RepeatWrapping;
    mSlope.map.repeat.set(slopeLen / 3, D / 3);

    for (var i = 0; i < teeth; i++) {
      var x0 = -W / 2 + i * tw, x1 = x0 + tw;
      // glazed vertical face (east side of the tooth)
      var gf = new THREE.Mesh(new THREE.PlaneGeometry(D, rise), mGlass);
      gf.rotation.y = Math.PI / 2;
      gf.position.set(x1 - 0.02, H + rise / 2, 0);
      g.add(gf);
      // dark frame behind the glass
      var fr = new THREE.Mesh(new THREE.BoxGeometry(0.14, rise + 0.15, D + 0.15), mSteel);
      fr.position.set(x1 - 0.1, H + rise / 2, 0);
      g.add(fr);
      // sloped roof plane
      var sg = new THREE.PlaneGeometry(slopeLen, D);
      sg.rotateX(-Math.PI / 2);
      sg.rotateZ(slopeAng);
      var sp = new THREE.Mesh(sg, mSlope);
      sp.position.set((x0 + x1) / 2, H + rise / 2, 0);
      g.add(sp);
      // ridge cap
      var rc = new THREE.Mesh(new THREE.BoxGeometry(0.35, 0.18, D + 0.1), mConcrete);
      rc.position.set(x1, H + rise + 0.05, 0);
      g.add(rc);
      // triangular gable ends
      var sh = new THREE.Shape();
      sh.moveTo(x0, H); sh.lineTo(x1, H); sh.lineTo(x1, H + rise); sh.closePath();
      var gg = new THREE.ShapeGeometry(sh);
      var g1 = new THREE.Mesh(gg, mGable);
      g1.position.z = D / 2 + 0.01;
      g.add(g1);
      var g2 = new THREE.Mesh(gg, mGable);
      g2.position.z = -D / 2 - 0.01;
      g.add(g2);
    }

    // chimney: brick stack through the roof slope + concrete cap + dark flue
    var mChim = std(THREE, tex(THREE, brickPatchCanvas()), 0.9);
    mChim.map.wrapS = mChim.map.wrapT = THREE.RepeatWrapping;
    mChim.map.repeat.set(1, 1);
    var chim = new THREE.Mesh(new THREE.CylinderGeometry(0.6, 0.68, 4.0, 20), mChim);
    chim.position.set(8, 12.5, 0);
    g.add(chim);
    var cap = new THREE.Mesh(new THREE.CylinderGeometry(0.78, 0.78, 0.28, 20), mConcrete);
    cap.position.set(8, 14.62, 0);
    g.add(cap);
    var flue = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.42, 0.18, 20), mDark);
    flue.position.set(8, 14.72, 0);
    g.add(flue);

    // valley vent on the tooth boundary x = -W/6
    var vent = new THREE.Mesh(new THREE.BoxGeometry(1.2, 1.0, 1.4), mSteel);
    vent.position.set(-W / 6, H + 0.5, 3);
    g.add(vent);
    var ventCap = new THREE.Mesh(new THREE.BoxGeometry(1.45, 0.14, 1.65), mConcrete);
    ventCap.position.set(-W / 6, H + 1.05, 3);
    g.add(ventCap);

    // downspouts at the four corners
    [[-12.95, -9.95], [12.95, -9.95], [-12.95, 9.95], [12.95, 9.95]].forEach(function (p) {
      var ds = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 9.6, 8), mSteel);
      ds.position.set(p[0], 4.8, p[1]);
      g.add(ds);
    });

    // ---- entrance, south face (z = +D/2) ----
    var zf = D / 2;
    var mRoll = std(THREE, tex(THREE, rollupCanvas(4, 4.5)), 0.7, 0.3);
    var mPed = std(THREE, tex(THREE, pedDoorCanvas(1.2, 2.4)), 0.6, 0.4);
    var surround = new THREE.Mesh(new THREE.PlaneGeometry(5.0, 5.2), mConcrete);
    surround.position.set(0, 2.6, zf + 0.02);
    g.add(surround);
    var roll = new THREE.Mesh(new THREE.PlaneGeometry(4.0, 4.5), mRoll);
    roll.position.set(0, 2.25, zf + 0.05);
    g.add(roll);
    var psur = new THREE.Mesh(new THREE.PlaneGeometry(1.9, 3.0), mConcrete);
    psur.position.set(3.8, 1.5, zf + 0.02);
    g.add(psur);
    var ped = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 2.4), mPed);
    ped.position.set(3.8, 1.2, zf + 0.05);
    g.add(ped);
    // canopy + tie rods
    var can = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.14, 1.1), mSteel);
    can.position.set(3.8, 2.62, zf + 0.55);
    g.add(can);
    g.add(rod(THREE, mSteel, 3.15, 3.5, zf + 0.05, 3.15, 2.66, zf + 1.0));
    g.add(rod(THREE, mSteel, 4.45, 3.5, zf + 0.05, 4.45, 2.66, zf + 1.0));
    // stoop
    var stoop = new THREE.Mesh(new THREE.BoxGeometry(7.0, 0.18, 1.7), mConcrete);
    stoop.position.set(0.9, 0.09, zf + 0.85);
    g.add(stoop);
    // sign band above the window line
    var signTex = tex(THREE, signCanvas(8, 1.1));
    var sign = new THREE.Mesh(
      new THREE.PlaneGeometry(8, 1.1),
      new THREE.MeshStandardMaterial({
        map: signTex, roughness: 0.6,
        emissive: 0xffffff, emissiveMap: signTex,
        emissiveIntensity: 0.25
      })
    );
    sign.position.set(-1, 9.0, zf + 0.03);
    g.add(sign);

    g.traverse(function (o) {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });
    return g;
  }

  // ---- Corktown: Academy HQ + rowhouses + pocket park ----
  // Flexible brick facade: punched steel-sash windows floor by floor.
  // base: [r,g,b]; floors: [{sill, h, w}]; bay: window spacing (m).
  function facadeCanvas(wM, hM, seed, base, floors, bay, openings) {
    var p = cv(wM, hM), g = p[1], W = p[0].width, H = p[0].height;
    paintBrick(g, W, H, seed, base);
    var wt = 0.9 * PXM;
    g.fillStyle = 'rgba(28,12,8,0.5)';
    g.fillRect(0, H - wt, W, wt);
    g.fillStyle = '#b9b2a4';
    g.fillRect(0, H - wt - 0.12 * PXM, W, 0.12 * PXM);
    for (var f = 0; f < floors.length; f++) {
      var sill = floors[f].sill, wh = floors[f].h, ww = floors[f].w || 1.8;
      for (var x = bay / 2; x + ww <= wM - 1.0; x += bay) {
        if (inOpenings(openings, x + ww / 2, sill + wh / 2)) continue;
        paintWindow(g, x * PXM, Y(hM, sill + wh), ww * PXM, wh * PXM);
      }
    }
    g.fillStyle = '#b9b2a4';
    g.fillRect(0, 0, W, 0.45 * PXM);
    var gr = g.createLinearGradient(0, H - 2 * PXM, 0, H);
    gr.addColorStop(0, 'rgba(0,0,0,0)');
    gr.addColorStop(1, 'rgba(0,0,0,0.3)');
    g.fillStyle = gr;
    g.fillRect(0, H - 2 * PXM, W, 2 * PXM);
    return p[0];
  }

  function signTextCanvas(wM, hM, line1, line2) {
    var p = cv(wM, hM), g = p[1], W = p[0].width, H = p[0].height;
    g.fillStyle = '#10161d';
    g.fillRect(0, 0, W, H);
    g.strokeStyle = '#E85D1A';
    g.lineWidth = 4;
    g.strokeRect(6, 6, W - 12, H - 12);
    g.textAlign = 'center';
    g.fillStyle = '#FFB000';
    g.font = '700 ' + Math.round(H * (line2 ? 0.32 : 0.42)) + 'px system-ui, sans-serif';
    g.fillText(line1, W / 2, H * (line2 ? 0.4 : 0.58));
    if (line2) {
      g.fillStyle = '#F5F2EA';
      g.font = '600 ' + Math.round(H * 0.19) + 'px system-ui, sans-serif';
      g.fillText(line2, W / 2, H * 0.72);
    }
    return p[0];
  }

  // simple street tree: trunk + 3 canopy blobs, ~6 m
  function tree(THREE, x, z, s, mTrunk, mLeaf) {
    var t = new THREE.Group();
    var trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.14 * s, 0.2 * s, 2.6 * s, 8), mTrunk);
    trunk.position.y = 1.3 * s;
    t.add(trunk);
    [[0, 3.4, 0, 1.7], [0.7, 2.8, 0.3, 1.2], [-0.6, 2.9, -0.3, 1.1]].forEach(function (b) {
      var m = new THREE.Mesh(new THREE.IcosahedronGeometry(b[3] * s, 1), mLeaf);
      m.position.set(b[0] * s, b[1] * s, b[2] * s);
      t.add(m);
    });
    t.position.set(x, 0, z);
    return t;
  }

  function bench(THREE, mWood, mSteel) {
    var b = new THREE.Group();
    var seat = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.08, 0.5), mWood);
    seat.position.y = 0.45; b.add(seat);
    var back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.5, 0.07), mWood);
    back.position.set(0, 0.75, -0.25); b.add(back);
    [-0.8, 0.8].forEach(function (lx) {
      var leg = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.45, 0.5), mSteel);
      leg.position.set(lx, 0.225, 0); b.add(leg);
    });
    return b;
  }

  // Detroit Automation Academy HQ: imagined state-of-the-art headquarters.
  // 4-story brick podium (34 x 24 x 14 m) + set-back 6-story glass tower
  // (20 x 18 x 20 m), rooftop terrace, entrance plaza. Local origin at the
  // podium center, ground level; south (+z) face fronts the street.
  function buildAcademyHQ(THREE) {
    var g = new THREE.Group();
    var PW = 34, PD = 24, PH = 14;
    var TW = 20, TD = 18, TH = 20;
    var mConcrete = std(THREE, tex(THREE, concreteCanvas(4, 1, 41)), 0.9);
    var mRoof = std(THREE, tex(THREE, roofCanvas()), 0.95);
    mRoof.map.wrapS = mRoof.map.wrapT = THREE.RepeatWrapping;
    var mDark = new THREE.MeshStandardMaterial({ color: 0x14171b, roughness: 1 });
    var mSteel = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.6, metalness: 0.5 });
    var mOrange = new THREE.MeshStandardMaterial({ color: 0xE85D1A, roughness: 0.55, metalness: 0.25 });
    var mGlass = std(THREE, tex(THREE, glassCanvas(12, 7, 55)), 0.35, 0.15);

    // podium: 4 floors of punched windows; lobby opening on the south face
    var floors = [];
    for (var f = 0; f < 4; f++) floors.push({ sill: 1.6 + f * 3.2, h: 2.0, w: 1.9 });
    var lobby = [{ x0: PW / 2 - 6, x1: PW / 2 + 6, y0: 0, y1: 7.2 }];
    var mPodS = std(THREE, tex(THREE, facadeCanvas(PW, PH, 51, [128, 66, 48], floors, 3.4, lobby)));
    var mPodN = std(THREE, tex(THREE, facadeCanvas(PW, PH, 52, [128, 66, 48], floors, 3.4)));
    var mPodE = std(THREE, tex(THREE, facadeCanvas(PD, PH, 53, [122, 62, 46], floors, 3.4)));
    var mPodW = std(THREE, tex(THREE, facadeCanvas(PD, PH, 54, [122, 62, 46], floors, 3.4)));
    var podium = new THREE.Mesh(
      new THREE.BoxGeometry(PW, PH, PD),
      [mPodE, mPodW, mRoof, mDark, mPodS, mPodN]
    );
    podium.position.y = PH / 2;
    g.add(podium);

    // limestone base + cornice
    var base = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.3, 1.1, PD + 0.3), mConcrete);
    base.position.y = 0.55;
    g.add(base);
    var cornice = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.7, 0.6, PD + 0.7), mConcrete);
    cornice.position.y = PH - 0.25;
    g.add(cornice);
    // forge-orange brand band between 2nd and 3rd floor
    var bandS = new THREE.Mesh(new THREE.BoxGeometry(PW + 0.15, 0.5, 0.12), mOrange);
    bandS.position.set(0, 6.9, PD / 2 + 0.06); g.add(bandS);
    var bandN = bandS.clone(); bandN.position.z = -PD / 2 - 0.06; g.add(bandN);
    var bandE = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.5, PD + 0.15), mOrange);
    bandE.position.set(PW / 2 + 0.06, 6.9, 0); g.add(bandE);
    var bandW = bandE.clone(); bandW.position.x = -PW / 2 - 0.06; g.add(bandW);

    // glass tower, set back 6 m from the podium's south face
    var mTowS = std(THREE, tex(THREE, glassCanvas(TW, TH, 56)), 0.3, 0.2);
    var mTowE = std(THREE, tex(THREE, glassCanvas(TD, TH, 57)), 0.3, 0.2);
    var tower = new THREE.Mesh(
      new THREE.BoxGeometry(TW, TH, TD),
      [mTowE, mTowE, mRoof, mDark, mTowS, mTowS]
    );
    tower.position.set(0, PH + TH / 2, -3);
    g.add(tower);
    // tower crown: orange fin + parapet
    var fin = new THREE.Mesh(new THREE.BoxGeometry(0.5, 3.2, TD * 0.7), mOrange);
    fin.position.set(TW / 2 + 0.2, PH + TH + 1.0, -3);
    g.add(fin);
    var crown = new THREE.Mesh(new THREE.BoxGeometry(TW + 0.4, 1.0, TD + 0.4), mSteel);
    crown.position.set(0, PH + TH + 0.4, -3);
    g.add(crown);

    // rooftop terrace on the podium roof, south of the tower
    var terr = new THREE.Mesh(new THREE.BoxGeometry(PW - 2, 0.12, 5.4), mConcrete);
    terr.position.set(0, PH + 0.06, PD / 2 - 3.1);
    g.add(terr);
    // railing around the podium roof edge
    var railY = PH + 1.0;
    function railRun(w, x, z, alongX) {
      var top = new THREE.Mesh(new THREE.BoxGeometry(alongX ? w : 0.06, 0.06, alongX ? 0.06 : w), mSteel);
      top.position.set(x, railY, z); g.add(top);
      var mid = top.clone(); mid.position.y = railY - 0.45; g.add(mid);
      var n = Math.max(2, Math.round(w / 2));
      for (var i = 0; i <= n; i++) {
        var post = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.0, 0.06), mSteel);
        var off = -w / 2 + (w * i) / n;
        post.position.set(alongX ? x + off : x, PH + 0.5, alongX ? z : z + off);
        g.add(post);
      }
    }
    railRun(PW, 0, PD / 2 - 0.1, true);
    railRun(PW, 0, -PD / 2 + 0.1, true);
    railRun(PD, PW / 2 - 0.1, 0, false);
    railRun(PD, -PW / 2 + 0.1, 0, false);
    // pergola + planters on the terrace
    [[-6], [6]].forEach(function (px) {
      [-1.5, 1.5].forEach(function (pz) {
        var post = new THREE.Mesh(new THREE.BoxGeometry(0.18, 2.6, 0.18), mSteel);
        post.position.set(px[0], PH + 1.3, PD / 2 - 3.1 + pz);
        g.add(post);
      });
    });
    for (var s = 0; s < 6; s++) {
      var slat = new THREE.Mesh(new THREE.BoxGeometry(13.5, 0.1, 0.24), mSteel);
      slat.position.set(0, PH + 2.65, PD / 2 - 5.2 + s * 0.85);
      g.add(slat);
    }
    var mLeaf = new THREE.MeshStandardMaterial({ color: 0x3f7d44, roughness: 1 });
    [-10, 10].forEach(function (px) {
      var planter = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.7, 1.0), mConcrete);
      planter.position.set(px, PH + 0.45, PD / 2 - 1.4);
      g.add(planter);
      var shrub = new THREE.Mesh(new THREE.IcosahedronGeometry(0.75, 1), mLeaf);
      shrub.position.set(px, PH + 1.2, PD / 2 - 1.4);
      shrub.scale.y = 0.75;
      g.add(shrub);
    });
    // rooftop equipment, north of the tower
    var eq1 = new THREE.Mesh(new THREE.BoxGeometry(2.4, 1.4, 1.6), mSteel);
    eq1.position.set(-8, PH + 0.7, -PD / 2 + 3); g.add(eq1);
    var eq2 = new THREE.Mesh(new THREE.BoxGeometry(1.8, 1.1, 1.4), mSteel);
    eq2.position.set(-4.5, PH + 0.55, -PD / 2 + 3.2); g.add(eq2);
    var fan = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 1.0, 16), mSteel);
    fan.position.set(8, PH + 0.5, -PD / 2 + 3); g.add(fan);
    var fanCap = new THREE.Mesh(new THREE.CylinderGeometry(0.7, 0.7, 0.15, 16), mConcrete);
    fanCap.position.set(8, PH + 1.05, -PD / 2 + 3); g.add(fanCap);

    // ---- lobby: double-height glass, doors, canopy ----
    var zf = PD / 2;
    var lobbyGlass = new THREE.Mesh(new THREE.PlaneGeometry(12, 7.2), mGlass);
    lobbyGlass.position.set(0, 3.6, zf + 0.04);
    g.add(lobbyGlass);
    for (var mi = -5; mi <= 5; mi += 2) {
      var mull = new THREE.Mesh(new THREE.BoxGeometry(0.1, 7.2, 0.1), mSteel);
      mull.position.set(mi, 3.6, zf + 0.08);
      g.add(mull);
    }
    var transom = new THREE.Mesh(new THREE.BoxGeometry(12, 0.12, 0.12), mSteel);
    transom.position.set(0, 3.4, zf + 0.08);
    g.add(transom);
    var mDoor = std(THREE, tex(THREE, pedDoorCanvas(1.4, 2.6)), 0.6, 0.4);
    [-1.6, 1.6].forEach(function (dx) {
      var door = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.6), mDoor);
      door.position.set(dx, 1.3, zf + 0.1);
      g.add(door);
    });
    // canopy on orange-trimmed columns
    var can = new THREE.Mesh(new THREE.BoxGeometry(15, 0.22, 3.6), mSteel);
    can.position.set(0, 7.5, zf + 1.8);
    g.add(can);
    var canTrim = new THREE.Mesh(new THREE.BoxGeometry(15.2, 0.14, 0.14), mOrange);
    canTrim.position.set(0, 7.42, zf + 3.55);
    g.add(canTrim);
    [-6.5, -2.2, 2.2, 6.5].forEach(function (cx) {
      var col = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 7.5, 12), mOrange);
      col.position.set(cx, 3.75, zf + 3.2);
      g.add(col);
    });
    // sign band on the south frieze
    var signTex = tex(THREE, signTextCanvas(20, 1.7, 'DETROIT AUTOMATION ACADEMY', 'CORKTOWN · DETROIT'));
    var sign = new THREE.Mesh(
      new THREE.PlaneGeometry(20, 1.7),
      new THREE.MeshStandardMaterial({
        map: signTex, roughness: 0.6,
        emissive: 0xffffff, emissiveMap: signTex, emissiveIntensity: 0.3
      })
    );
    sign.position.set(0, PH - 1.6, zf + 0.08);
    g.add(sign);

    // ---- forecourt: pavers, trees, benches, flags ----
    var fore = new THREE.Mesh(new THREE.BoxGeometry(PW - 2, 0.1, 4), mConcrete);
    fore.position.set(0, 0.05, zf + 2);
    g.add(fore);
    var mTrunk = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 });
    var mWood = new THREE.MeshStandardMaterial({ color: 0x8a6a48, roughness: 0.9 });
    [-14, 0, 14].forEach(function (tx) { g.add(tree(THREE, tx, zf + 2.6, 0.9, mTrunk, mLeaf)); });
    [-9, 9].forEach(function (bx) {
      var b = bench(THREE, mWood, mSteel);
      b.position.set(bx, 0.1, zf + 1.2);
      b.rotation.y = Math.PI;
      g.add(b);
    });
    [-11, 11].forEach(function (fx) {
      var pole = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 8, 8), mSteel);
      pole.position.set(fx, 4, zf + 3.2);
      g.add(pole);
      var flagShape = new THREE.Shape();
      flagShape.moveTo(0, 0); flagShape.lineTo(1.4, -0.35); flagShape.lineTo(0, -0.7); flagShape.closePath();
      var flag = new THREE.Mesh(new THREE.ShapeGeometry(flagShape),
        new THREE.MeshStandardMaterial({ color: 0xE85D1A, side: THREE.DoubleSide, roughness: 0.8 }));
      flag.position.set(fx + 0.06, 7.9, zf + 3.2);
      g.add(flag);
    });

    g.traverse(function (o) {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });
    return g;
  }

  // Corktown rowhouse: brick townhouse with cornice, parapet, stoop + door.
  function buildRowhouse(THREE, seed, base, w, d, h) {
    var g = new THREE.Group();
    var floors = [];
    var fh = (h - 1.6) / 3;
    for (var f = 0; f < 3; f++) floors.push({ sill: 1.6 + f * fh, h: fh - 1.1, w: 1.4 });
    var door = [{ x0: w / 2 - 2.2, x1: w / 2 - 0.6, y0: 0, y1: 2.8 }];
    var mFront = std(THREE, tex(THREE, facadeCanvas(w, h, seed, base, floors, 2.6, door)));
    var mBack = std(THREE, tex(THREE, facadeCanvas(w, h, seed + 1, base, floors, 2.6)));
    var mSide = std(THREE, tex(THREE, brickPatchCanvas()), 0.9);
    mSide.map.wrapS = mSide.map.wrapT = THREE.RepeatWrapping;
    mSide.map.repeat.set(w / 4, h / 4);
    var mRoof = std(THREE, tex(THREE, roofCanvas()), 0.95);
    var mDark = new THREE.MeshStandardMaterial({ color: 0x14171b, roughness: 1 });
    var mConcrete = std(THREE, tex(THREE, concreteCanvas(4, 1, 71)), 0.9);
    var body = new THREE.Mesh(
      new THREE.BoxGeometry(w, h, d),
      [mSide, mSide, mRoof, mDark, mFront, mBack]
    );
    body.position.y = h / 2;
    g.add(body);
    // cornice + parapet cap
    var cor = new THREE.Mesh(new THREE.BoxGeometry(w + 0.4, 0.35, d + 0.4), mConcrete);
    cor.position.y = h - 0.15;
    g.add(cor);
    var par = new THREE.Mesh(new THREE.BoxGeometry(w + 0.15, 0.5, d + 0.15), mSide);
    par.position.y = h + 0.2;
    g.add(par);
    // door + stoop on the south face
    var zf = d / 2;
    var mDoor = std(THREE, tex(THREE, pedDoorCanvas(1.4, 2.6)), 0.6, 0.4);
    var dr = new THREE.Mesh(new THREE.PlaneGeometry(1.4, 2.6), mDoor);
    dr.position.set(-w / 2 + 1.4, 1.3, zf + 0.04);
    g.add(dr);
    var stoop = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.5, 1.4), mConcrete);
    stoop.position.set(-w / 2 + 1.4, 0.25, zf + 0.7);
    g.add(stoop);
    g.traverse(function (o) {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });
    return g;
  }

  // Pocket park (Roosevelt Park nod): lawn, path cross, tree rows, benches.
  function buildPocketPark(THREE) {
    var g = new THREE.Group();
    var W = 32, D = 16;
    var mGrass = new THREE.MeshStandardMaterial({ color: 0x3f7d44, roughness: 1 });
    var mConcrete = std(THREE, tex(THREE, concreteCanvas(4, 1, 81)), 0.9);
    var mSteel = new THREE.MeshStandardMaterial({ color: 0x2b2e33, roughness: 0.6, metalness: 0.5 });
    var lawn = new THREE.Mesh(new THREE.BoxGeometry(W, 0.12, D), mGrass);
    lawn.position.y = 0.06;
    g.add(lawn);
    var pathEW = new THREE.Mesh(new THREE.BoxGeometry(W, 0.14, 2), mConcrete);
    pathEW.position.y = 0.07;
    g.add(pathEW);
    var pathNS = new THREE.Mesh(new THREE.BoxGeometry(2, 0.14, D), mConcrete);
    pathNS.position.y = 0.07;
    g.add(pathNS);
    var mTrunk = new THREE.MeshStandardMaterial({ color: 0x5a4632, roughness: 1 });
    var mLeaf = new THREE.MeshStandardMaterial({ color: 0x3f7d44, roughness: 1 });
    var mWood = new THREE.MeshStandardMaterial({ color: 0x8a6a48, roughness: 0.9 });
    [-12, -6, 0, 6, 12].forEach(function (tx) {
      g.add(tree(THREE, tx, -6, 1.0, mTrunk, mLeaf));
      g.add(tree(THREE, tx + 2, 6, 0.85, mTrunk, mLeaf));
    });
    [[-4, 1.6, 0], [4, 1.6, Math.PI], [-1.6, -4, Math.PI / 2], [1.6, 4, -Math.PI / 2]].forEach(function (bp) {
      var b = bench(THREE, mWood, mSteel);
      b.position.set(bp[0], 0.12, bp[1]);
      b.rotation.y = bp[2];
      g.add(b);
    });
    // park sign
    var post = new THREE.Mesh(new THREE.BoxGeometry(0.12, 1.6, 0.12), mSteel);
    post.position.set(-W / 2 + 2, 0.8, -D / 2 + 1.2);
    g.add(post);
    var signTex = tex(THREE, signTextCanvas(3.2, 0.9, 'CORKTOWN'));
    var psign = new THREE.Mesh(new THREE.PlaneGeometry(3.2, 0.9),
      new THREE.MeshStandardMaterial({ map: signTex, roughness: 0.7 }));
    psign.position.set(-W / 2 + 2, 1.9, -D / 2 + 1.26);
    g.add(psign);
    g.traverse(function (o) {
      if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; }
    });
    return g;
  }

  // Corktown district: Academy HQ + brick rowhouses + pocket park.
  // Replaces the old station STL.
  function buildCorktown(THREE) {
    var g = new THREE.Group();
    var hq = buildAcademyHQ(THREE);
    hq.position.set(47, 0, -20);
    g.add(hq);
    [
      { x: 31.5, seed: 61, base: [139, 69, 50], h: 9.0 },
      { x: 40.0, seed: 62, base: [110, 72, 52], h: 10.0 },
      { x: 48.5, seed: 63, base: [122, 62, 44], h: 9.0 },
      { x: 57.0, seed: 64, base: [96, 104, 96], h: 9.5 }
    ].forEach(function (hh) {
      var r = buildRowhouse(THREE, hh.seed, hh.base, 8, 10, hh.h);
      r.position.set(hh.x, 0, -40);
      g.add(r);
    });
    var park = buildPocketPark(THREE);
    park.position.set(44, 0, 14);
    g.add(park);
    return g;
  }

  window.DAAArchKit = {
    buildWorkshop: buildWorkshop,
    buildAcademyHQ: buildAcademyHQ,
    buildCorktown: buildCorktown
  };
})();
