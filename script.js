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

  if ('IntersectionObserver' in window) {
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

    var ANIM_CLASSES = ['anim-forward', 'anim-back', 'anim-spin', 'anim-scan', 'anim-wave'];
    var COMMANDS = {
      forward: { anim: 'anim-forward', reply: 'Rolling forward one meter. No excuses.' },
      back:    { anim: 'anim-back',    reply: "Backing up. Even robots check their blind spots." },
      spin:    { anim: 'anim-spin',    reply: "Full 360\u00B0. That's one rotation of confidence." },
      scan:    { anim: 'anim-scan',    reply: 'Scan complete \u2014 path is clear. Build on, Detroit.' },
      wave:    { anim: 'anim-wave',    reply: 'Hello, Detroit. Good to meet a builder.' }
    };

    function clearAnims() {
      ANIM_CLASSES.forEach(function (c) { bot.classList.remove(c); });
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

    function run(raw) {
      var cmd = (raw || '').trim().toLowerCase();
      if (!cmd) return;
      printLine('demo-line-in', cmd);
      if (cmd === 'help') {
        printLine('demo-line-out', 'Commands: forward \u00B7 back \u00B7 spin \u00B7 scan \u00B7 wave');
        return;
      }
      var def = COMMANDS[cmd];
      if (!def) {
        printLine('demo-line-out', 'Unknown command \u2014 try: forward, back, spin, scan, wave, help.');
        return;
      }
      clearAnims();
      void bot.getBoundingClientRect(); // restart the animation
      if (!reduced) bot.classList.add(def.anim);
      printLine('demo-line-ok', def.reply);
    }

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      run(input.value);
      input.value = '';
      input.focus();
    });

    document.querySelectorAll('.demo-chip').forEach(function (chip) {
      chip.addEventListener('click', function () {
        run(chip.getAttribute('data-cmd'));
        input.focus();
      });
    });

    bot.addEventListener('animationend', function (e) {
      if (e.target.classList && (e.target.classList.contains('bot-body') || e.target.classList.contains('bot-arm-wave'))) {
        clearAnims();
      }
    });

    printLine('demo-line-out', 'Training bot online. Type "help" or tap a command.');
  })();
