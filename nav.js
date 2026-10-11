/* Detroit Automation Academy — platform navigation, single source.
 * v2.0 (2026-10-10): audience lanes (Watch / Read / Do / About / Subscribe).
 * Renders the site header into #daa-nav. Works from any host serving this
 * file at site root (detroitautomationacademy.com, Netlify dev/uat).
 * data-audience hooks (viewer|reader|user|visitor|subscriber) are stable
 * attributes for future subscriber/user-state personalization. No auth here.
 */
(function () {
  'use strict';

  var NEWSLETTER_URL = 'https://www.linkedin.com/newsletters/7508391258638311424/';

  /* Audience lanes. Order is the nav order. */
  var LANES = [
    { label: 'Watch', href: '/watch/', audience: 'viewer' },
    {
      label: 'Read', audience: 'reader', children: [
        { label: 'The Signal', href: '/signal/' },
        { label: 'The Press', href: '/press/' },
        { label: 'Live Transit Detroit', href: '/live-transit-detroit/' },
        { label: 'Blog', href: '/blog/' },
        { label: 'Voter Guide', href: '/voter-guide.html' }
      ]
    },
    {
      label: 'Do', audience: 'user', children: [
        { label: 'Live Transit Map', href: '/live-transit.html' },
        { label: '3D Training District', href: '/district.html' },
        { label: 'Programs', href: '/#programs' }
      ]
    },
    { label: 'About', href: '/#mission', audience: 'visitor' },
    { label: 'Subscribe', href: NEWSLETTER_URL, audience: 'subscriber', external: true }
  ];

  /* Map the current path to its lane for the active state. */
  function activeLane(path) {
    if (/^\/watch\//.test(path)) return 'Watch';
    if (/^\/(signal|press|live-transit-detroit|blog)\//.test(path) || /^\/voter-guide/.test(path)) return 'Read';
    if (/^\/(live-transit\.html|district\.html)/.test(path)) return 'Do';
    return null;
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function renderLane(lane, active) {
    var isActive = active === lane.label;
    var act = isActive ? ' data-active="true"' : '';
    if (!lane.children) {
      var ext = lane.external ? ' target="_blank" rel="noopener"' : '';
      return '<a class="lane"' + act + ' data-audience="' + lane.audience +
        '" href="' + esc(lane.href) + '"' + ext + '>' + esc(lane.label) + '</a>';
    }
    var kids = lane.children.map(function (c) {
      return '<a href="' + esc(c.href) + '">' + esc(c.label) + '</a>';
    }).join('');
    return '<div class="lane-group"' + act + ' data-audience="' + lane.audience + '">' +
      '<button class="lane-label" type="button" aria-haspopup="true" aria-expanded="false"' +
      (isActive ? ' data-active="true"' : '') + '>' + esc(lane.label) + '</button>' +
      '<div class="lane-items">' + kids + '</div></div>';
  }

  function build() {
    var mount = document.getElementById('daa-nav');
    if (!mount) return;

    var path = window.location.pathname || '/';
    var active = activeLane(path);
    var isHome = path === '/' || /\/index\.html$/.test(path);
    var brandHref = isHome ? '#top' : '/';

    var lanesHtml = LANES.map(function (l) { return renderLane(l, active); }).join('');

    mount.innerHTML =
      '<header class="nav">' +
      '<a class="brand" href="' + brandHref + '" aria-label="Detroit Automation Academy home">' +
      '<img src="/assets/logo.webp" alt="" class="brand-mark">' +
      '<span class="brand-word">Detroit Automation <em>Academy</em></span></a>' +
      '<nav class="nav-links" id="daaNavLinks" aria-label="Primary">' + lanesHtml + '</nav>' +
      '<button class="nav-toggle" id="daaNavToggle" aria-label="Toggle navigation" aria-expanded="false">' +
      '<span></span><span></span><span></span></button></header>';

    /* Mobile toggle — self-contained (ids are daa*-namespaced so the legacy
     * script.js navToggle wiring never double-binds). */
    var toggle = document.getElementById('daaNavToggle');
    var links = document.getElementById('daaNavLinks');
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

    /* Touch dropdown toggles for lane groups (desktop hover / focus-within
     * is CSS-driven; this covers tap). */
    var groups = mount.querySelectorAll('.lane-group');
    Array.prototype.forEach.call(groups, function (g) {
      var btn = g.querySelector('.lane-label');
      if (!btn) return;
      btn.addEventListener('click', function () {
        var willOpen = !g.classList.contains('open');
        Array.prototype.forEach.call(groups, function (o) {
          o.classList.remove('open');
          var b = o.querySelector('.lane-label');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
        if (willOpen) {
          g.classList.add('open');
          btn.setAttribute('aria-expanded', 'true');
        }
      });
    });

    /* Close open dropdowns on outside tap / Escape. */
    document.addEventListener('click', function (e) {
      if (!e.target.closest || !e.target.closest('.lane-group')) {
        Array.prototype.forEach.call(groups, function (g) {
          g.classList.remove('open');
          var b = g.querySelector('.lane-label');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') {
        Array.prototype.forEach.call(groups, function (g) {
          g.classList.remove('open');
          var b = g.querySelector('.lane-label');
          if (b) b.setAttribute('aria-expanded', 'false');
        });
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', build);
  } else {
    build();
  }
})();
