// Detroit Automation Academy — site interactions
(function () {
  'use strict';

  // Mobile nav toggle
  var toggle = document.getElementById('navToggle');
  var links = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      var open = links.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') {
        links.classList.remove('open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Reveal-on-scroll
  var revealEls = document.querySelectorAll('.section .wrap, .hero-inner, .hero-stats, .card, .phase, .principle');
  revealEls.forEach(function (el) { el.classList.add('reveal'); });

  // Where CSS scroll-driven animations are supported, the stylesheet owns the
  // reveal and the observer below would only double-trigger. Skip it there.
  var scrollDriven = false;
  try { scrollDriven = ('animationTimeline' in document.body.style); } catch (e) {}

  if (scrollDriven) {
    /* CSS animation-timeline handles the reveal; nothing to observe. */
  } else if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el) { observer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('visible'); });
  }
})();

  // One-command demo: terminal drives the training bot
  (function () {
    var bot = document.getElementById('demoBot');
    var form = document.getElementById('demoForm');
    var input = document.getElementById('demoInput');
    var log = document.getElementById('demoLog');
    if (!bot || !form || !input || !log) return;

    var reduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    var ANIM_CLASSES = ['anim-forward', 'anim-back', 'anim-spin', 'anim-scan', 'anim-wave',
      'anim-dance', 'anim-jump', 'anim-charge'];
    var COMMANDS = {
      forward: { anim: 'anim-forward', reply: 'Rolling forward one meter. No excuses.' },
      back:    { anim: 'anim-back',    reply: "Backing up. Even robots check their blind spots." },
      spin:    { anim: 'anim-spin',    reply: "Full 360\u00B0. That's one rotation of confidence." },
      scan:    { anim: 'anim-scan',    reply: 'Scan complete \u2014 path is clear. Build on, Detroit.' },
      wave:    { anim: 'anim-wave',    reply: 'Hello, Detroit. Good to meet a builder.' },
      dance:   { anim: 'anim-dance',   reply: 'Servo shuffle. The workshop playlist is all Motown.' },
      jump:    { anim: 'anim-jump',    reply: 'Twelve centimeters of pure ambition.' },
      charge:  { anim: 'anim-charge',  reply: 'Topping up. A builder never runs on empty.',
                 fn: function () { battery = 100; } }
    };

    /* ---- Training district (world v1): five Detroit stops to explore.
          Moving costs battery; "charge" refills it. ---- */
    var WORLD = {
      workshop:   { name: 'The Workshop',
        desc: 'Home base. Workbenches, spare servos, the smell of solder. Every builder starts here.',
        exits: { north: 'innovation', east: 'hq', south: 'riverfront', west: 'thinkabit' } },
      innovation:   { name: 'UM Center for Innovation',
        desc: 'U-M\u2019s Detroit innovation hub \u2014 six stories of glass leaning into the future. The portal is open to everyone.',
        exits: { south: 'workshop' } },
      hq:         { name: 'Academy HQ',
        desc: 'The new Detroit Automation Academy headquarters in Corktown — glass, brick, and big plans.',
        exits: { west: 'workshop' } },
      riverfront: { name: 'Detroit Riverfront',
        desc: "Wind off the water, skyline at your back. The view never gets old.",
        exits: { north: 'workshop' } },
      thinkabit:  { name: 'Thinkabit Lab',
        desc: 'A STEM lab buzzing with kits and big questions. Young engineers at work.',
        exits: { east: 'workshop' } }
    };
    var DIRS = ['north', 'east', 'south', 'west'];
    var MOVE_COST = 5;
    var botLoc = 'workshop';
    var battery = 100;

    function clearAnims() {
      ANIM_CLASSES.forEach(function (c) { bot.classList.remove(c); });
    }

    /* 3D bridge: when the Three.js district is live, commands drive the 3D
       bot instead of the SVG one. Null until world3d.js finishes loading. */
    function world3d() {
      var live = document.getElementById('demoStage').classList.contains('world-live');
      return (live && window.DAAWorld) ? window.DAAWorld : null;
    }

    function printLine(kind, text) {
      var line = document.createElement('div');
      line.className = 'demo-line ' + kind;
      log.appendChild(line);
      log.scrollTop = log.scrollHeight;
      if (reduced || kind === 'demo-line-in') {
        line.textContent = text;
        return;
      }
      // Typewriter output for full-motion users
      var i = 0;
      var timer = setInterval(function () {
        i += 1;
        line.textContent = text.slice(0, i);
        log.scrollTop = log.scrollHeight;
        if (i >= text.length) clearInterval(timer);
      }, 14);
    }

    function exitsList() {
      return DIRS.filter(function (d) { return WORLD[botLoc].exits[d]; });
    }

    function look() {
      var w = WORLD[botLoc];
      var w3 = world3d();
      if (w3) w3.look(botLoc);
      printLine('demo-line-out', w.name + ' \u2014 ' + w.desc);
      printLine('demo-line-out', 'Exits: ' + exitsList().join(' \u00B7 '));
    }

    function showMap() {
      function cell(key, label) {
        var s = ' ' + label + ' ';
        return key === botLoc ? '[' + s + '*]' : '[' + s + ']';
      }
      printLine('demo-line-out', '              ' + cell('innovation', 'Innov'));
      printLine('demo-line-out', '                  |');
      printLine('demo-line-out',
        cell('thinkabit', 'Thinkabit') + '---' + cell('workshop', 'Workshop') + '---' + cell('hq', 'HQ'));
      printLine('demo-line-out', '                  |');
      printLine('demo-line-out', '              ' + cell('riverfront', 'Riverfront'));
      printLine('demo-line-out', '* marks where you are. Battery ' + battery + '%.');
    }

    function status() {
      printLine('demo-line-out',
        'Battery ' + battery + '%. Location: ' + WORLD[botLoc].name + '. Morale: Detroit.');
    }

    function travel(dest) {
      var here = WORLD[botLoc];
      var target = here.exits[dest] || null;
      if (!target && dest) {
        /* allow naming a place directly ("go innovation", "go hq") */
        var key = Object.keys(WORLD).filter(function (k) {
          return k === dest || WORLD[k].name.toLowerCase() === dest;
        })[0];
        if (key && exitsList().some(function (d) { return here.exits[d] === key; })) target = key;
      }
      if (!target) {
        printLine('demo-line-out', "Can't go that way from here. Try: " + exitsList().join(', ') + '.');
        return;
      }
      if (battery < MOVE_COST) {
        printLine('demo-line-out', 'Battery too low to travel. Type "charge".');
        return;
      }
      battery -= MOVE_COST;
      botLoc = target;
      printLine('demo-line-ok', 'Rolling to ' + WORLD[target].name + '.');
      var w3 = world3d();
      if (w3) {
        w3.goTo(target, look); // describe the stop when the bot arrives
      } else {
        clearAnims();
        void bot.getBoundingClientRect(); // restart the animation
        if (!reduced) bot.classList.add('anim-forward');
        look();
      }
    }

    function printHelp() {
      printLine('demo-line-out', 'Moves: forward \u00B7 back \u00B7 spin \u00B7 wave \u00B7 dance \u00B7 jump');
      printLine('demo-line-out', 'Explore: look \u00B7 go <north|east|south|west|place> \u00B7 map \u00B7 status');
      printLine('demo-line-out', 'Upkeep: scan \u00B7 charge');
    }

    function run(raw) {
      var cmd = (raw || '').trim().toLowerCase();
      if (!cmd) return;
      printLine('demo-line-in', cmd);
      if (cmd === 'help') { printHelp(); return; }
      if (cmd === 'look') { look(); return; }
      if (cmd === 'map') { showMap(); return; }
      if (cmd === 'status') { status(); return; }
      var parts = cmd.split(/\s+/);
      if (parts[0] === 'go') { travel(parts.slice(1).join(' ')); return; }
      if (parts.length === 1 && DIRS.indexOf(parts[0]) !== -1) { travel(parts[0]); return; }
      var def = COMMANDS[cmd];
      if (!def) {
        printLine('demo-line-out', 'Unknown command \u2014 try "help".');
        return;
      }
      var w3 = world3d();
      if (w3) {
        var act = { forward: function () { w3.nudge(1); }, back: function () { w3.nudge(-1); },
          spin: w3.spin, dance: w3.dance, jump: w3.jump, wave: w3.wave,
          scan: w3.scan, charge: w3.charge }[cmd];
        if (act) act();
      } else {
        clearAnims();
        void bot.getBoundingClientRect(); // restart the animation
        if (!reduced) bot.classList.add(def.anim);
      }
      if (def.fn) def.fn();
      printLine('demo-line-ok', def.reply);
    }

    // On touch devices, focusing the text input summons the software keyboard,
    // which covers the 3D scene (reported on iPadOS). Command chips must not
    // trigger it; the user can still tap the input deliberately to type.
    var coarsePointer = !!(window.matchMedia && window.matchMedia('(pointer: coarse)').matches);

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      run(input.value);
      input.value = '';
      input.focus();
    });

    document.querySelectorAll('.demo-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        run(chip.getAttribute('data-cmd'));
        if (!coarsePointer) input.focus();
      });
    });

    bot.addEventListener('animationend', function (e) {
      var c = e.target.classList;
      if (c && (c.contains('bot-body') || c.contains('bot-arm-wave') || c.contains('bot-light'))) {
        clearAnims();
      }
    });

    printLine('demo-line-out', 'Training bot online. Type "help" \u2014 or "look" to start exploring.');
  })();
