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

  window.DAAArchKit = { buildWorkshop: buildWorkshop };
})();
