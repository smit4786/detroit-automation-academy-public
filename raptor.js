/* raptor.js — client-side RAPTOR trip planner for Live Transit.
 *
 * Data: ddot-timetable-<version>.json (built by build-timetable.py from
 * DDOT GTFS S1000182). Lazily imported only when the rider opens trip
 * planning; the map's first load is untouched.
 *
 * Honesty: Phase 1 runs on scheduled times only. Every leg is tagged
 * scheduled; interpolated stop times are flagged per leg. No live fusion yet.
 */
var TT = null;
var K_ROUNDS = 3; // max trips per journey => at most 2 transfers
var INF = 1e15;

export async function loadTimetable(url) {
  if (TT && TT.url === url) return TT;
  var res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error('timetable fetch failed: HTTP ' + res.status);
  var data = await res.json();
  TT = buildIndex(data);
  TT.url = url;
  TT.meta = data.meta;
  return TT;
}

function buildIndex(data) {
  var patterns = [];
  var pkey = new Map();
  var trips = data.trips;
  for (var ti = 0; ti < trips.length; ti++) {
    var t = trips[ti];
    var key = t.r + '|' + t.stops.join(',');
    var pi = pkey.get(key);
    if (pi === undefined) {
      pi = patterns.length;
      pkey.set(key, pi);
      patterns.push({ route: t.r, stops: t.stops, trips: [] });
    }
    patterns[pi].trips.push(t);
  }
  for (var p = 0; p < patterns.length; p++) {
    patterns[p].trips.sort(function (a, b) { return a.dep[0] - b.dep[0]; });
  }
  var nStops = 0, i, s;
  for (i = 0; i < trips.length; i++) {
    var st = trips[i].stops;
    for (var j = 0; j < st.length; j++) if (st[j] + 1 > nStops) nStops = st[j] + 1;
  }
  for (i = 0; i < data.transfers.length; i++) {
    var tr = data.transfers[i];
    if (tr[0] + 1 > nStops) nStops = tr[0] + 1;
    if (tr[1] + 1 > nStops) nStops = tr[1] + 1;
  }
  var stopPat = new Array(nStops);
  patterns.forEach(function (pat, pi) {
    for (var pos = 0; pos < pat.stops.length; pos++) {
      s = pat.stops[pos];
      (stopPat[s] || (stopPat[s] = [])).push([pi, pos]);
    }
  });
  var adj = new Array(nStops);
  for (i = 0; i < data.transfers.length; i++) {
    var a = data.transfers[i][0], b = data.transfers[i][1], w = data.transfers[i][2];
    (adj[a] || (adj[a] = [])).push([b, w]);
    (adj[b] || (adj[b] = [])).push([a, w]);
  }
  return {
    meta: data.meta, routes: data.routes, services: data.services,
    exceptions: data.service_exceptions || [],
    patterns: patterns, stopPat: stopPat, adj: adj, nStops: nStops
  };
}

function fmtYMD(d) {
  return d.getFullYear() * 10000 + (d.getMonth() + 1) * 100 + d.getDate() + '';
}

function serviceFor(tt, ymd, dow) {
  var mi = (dow + 6) % 7; // mask is Mon..Sun
  var best = -1, i;
  for (i = 0; i < tt.services.length; i++) {
    var s = tt.services[i];
    if (ymd >= s.start && ymd <= s.end && s.mask[mi]) best = i;
  }
  for (i = 0; i < tt.exceptions.length; i++) {
    var e = tt.exceptions[i];
    if (e.date === ymd) {
      var si = -1;
      for (var j = 0; j < tt.services.length; j++) {
        if (tt.services[j].id === e.service) { si = j; break; }
      }
      if (e.added) best = si; else if (si === best) best = -1;
    }
  }
  return best;
}

function relaxWalk(tt, arr, wpar, seeds) {
  var improved = new Set();
  var q = seeds.slice(), inQ = new Set(seeds);
  while (q.length) {
    var s = q.shift(); inQ.delete(s);
    var edges = tt.adj[s];
    if (!edges) continue;
    for (var i = 0; i < edges.length; i++) {
      var t = edges[i][0], w = edges[i][1];
      var na = arr[s] + w;
      if (na < arr[t]) {
        arr[t] = na; wpar[t] = s; improved.add(t);
        if (!inQ.has(t)) { q.push(t); inQ.add(t); }
      }
    }
  }
  return improved;
}

function fmtClock(sec) {
  sec = Math.floor(sec) % 86400;
  var h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60);
  var ap = h >= 12 ? 'PM' : 'AM', h12 = h % 12;
  if (h12 === 0) h12 = 12;
  return h12 + ':' + (m < 10 ? '0' : '') + m + ' ' + ap;
}

export function plan(tt, fromIdx, toIdx, when) {
  var nS = tt.nStops;
  var ymd = fmtYMD(when), dow = when.getDay();
  var pd = new Date(when.getTime() - 86400000);
  var svc = serviceFor(tt, ymd, dow);
  var prevSvc = serviceFor(tt, fmtYMD(pd), pd.getDay());
  var nowSec = when.getHours() * 3600 + when.getMinutes() * 60 + when.getSeconds();
  if (svc < 0 && prevSvc < 0) {
    return { journeys: [], meta: { reason: 'no-service', when: when } };
  }
  if (fromIdx === toIdx) {
    return { journeys: [], meta: { reason: 'same-stop', when: when } };
  }

  var arrR = [], alight = [], walkPar = [];
  // round 0: origin + walking
  var arr0 = new Float64Array(nS).fill(INF);
  arr0[fromIdx] = nowSec;
  var w0 = new Array(nS).fill(null);
  var imp0 = relaxWalk(tt, arr0, w0, [fromIdx]);
  imp0.add(fromIdx);
  arrR[0] = arr0; walkPar[0] = w0;
  var markedPrev = imp0;

  for (var k = 1; k <= K_ROUNDS; k++) {
    var prevArr = arrR[k - 1];
    var arr = Float64Array.from(prevArr);
    var wpar = new Array(nS).fill(null);
    var ali = new Array(nS).fill(null);
    var improved = new Set();
    markedPrev.forEach(function (p) {
      var sps = tt.stopPat[p];
      if (!sps) return;
      for (var q = 0; q < sps.length; q++) {
        var pi = sps[q][0], pos = sps[q][1];
        var pat = tt.patterns[pi];
        var trips = pat.trips;
        for (var ti = 0; ti < trips.length; ti++) {
          var t = trips[ti];
          if (t.s !== svc && t.s !== prevSvc) continue;
          if (t.dep[pos] < prevArr[p]) continue; // cannot catch
          for (var j = pos + 1; j < pat.stops.length; j++) {
            var s = pat.stops[j];
            if (t.arr[j] < arr[s]) {
              arr[s] = t.arr[j];
              ali[s] = { trip: t, board: p, boardPos: pos, alightPos: j };
              improved.add(s);
            }
          }
        }
      }
    });
    var wImp = relaxWalk(tt, arr, wpar, Array.from(improved));
    wImp.forEach(function (s) { improved.add(s); });
    arrR[k] = arr; alight[k] = ali; walkPar[k] = wpar;
    markedPrev = improved;
  }

  // reconstruct up to 3 journeys (best arrival per transfer count)
  var journeys = [], seen = new Set();
  for (var kk = 1; kk <= K_ROUNDS; kk++) {
    if (arrR[kk][toIdx] >= INF / 2) continue;
    var legs = buildJourney(tt, kk, toIdx, fromIdx, alight, walkPar);
    if (!legs || !legs.length) continue;
    var nBus = legs.filter(function (l) { return l.type === 'bus'; }).length;
    var key = Math.round(arrR[kk][toIdx]) + '|' + nBus;
    if (seen.has(key)) continue;
    seen.add(key);
    journeys.push(summarize(tt, legs, nowSec, arrR[kk][toIdx]));
    if (journeys.length >= 3) break;
  }
  return {
    journeys: journeys,
    meta: {
      when: when, service: svc >= 0 ? tt.services[svc].id : null,
      feedVersion: tt.meta.feed_version, nowSec: nowSec
    }
  };
}

function walkSecs(tt, a, b) {
  var edges = tt.adj[a] || [];
  for (var i = 0; i < edges.length; i++) {
    if (edges[i][0] === b) return edges[i][1];
  }
  return null;
}

function buildJourney(tt, k, target, fromIdx, alight, walkPar) {
  var legs = [], cur = target, kk = k, guard = 0;
  while (cur !== fromIdx && guard++ < 200) {
    var a = (alight[kk] || [])[cur];
    if (a) {
      var t = a.trip, r = tt.routes[t.r];
      var interp = t.interp.indexOf(a.boardPos) >= 0 || t.interp.indexOf(a.alightPos) >= 0;
      legs.unshift({
        type: 'bus', routeId: r.id, routeName: r.name, color: r.color,
        board: a.board, alight: cur,
        boardSec: t.dep[a.boardPos], alightSec: t.arr[a.alightPos],
        headsign: t.h || '', interp: interp, provenance: 'scheduled'
      });
      cur = a.board; kk--;
      if (kk < 0) return null;
      continue;
    }
    var w = (walkPar[kk] || [])[cur];
    if (w !== null && w !== undefined) {
      legs.unshift({ type: 'walk', from: w, to: cur, secs: walkSecs(tt, w, cur) || 0 });
      cur = w;
      continue;
    }
    if (kk > 0) { kk--; continue; }
    return null;
  }
  return guard < 200 ? legs : null;
}

function summarize(tt, legs, nowSec, arriveSec) {
  var busLegs = legs.filter(function (l) { return l.type === 'bus'; });
  var walkSecs = legs.reduce(function (s, l) { return s + (l.type === 'walk' ? l.secs : 0); }, 0);
  var interp = busLegs.some(function (l) { return l.interp; });
  return {
    legs: legs,
    departSec: nowSec,
    arriveSec: arriveSec,
    durationMin: Math.max(1, Math.round((arriveSec - nowSec) / 60)),
    transfers: Math.max(0, busLegs.length - 1),
    walkMin: Math.round(walkSecs / 60),
    hasInterp: interp,
    departClock: fmtClock(nowSec),
    arriveClock: fmtClock(arriveSec)
  };
}

export function fmtClockSec(sec) { return fmtClock(sec); }
