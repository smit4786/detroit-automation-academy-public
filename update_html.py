import os
import re

header_content = """    <header>
        <nav>
            <div class="logo">
                <a href="index.html">
                    <svg viewBox="0 0 1000 250" width="180" height="45" xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(25, 25)">
                            <circle cx="100" cy="100" r="75" fill="none" stroke="#0066CC" stroke-width="4" />
                            <polygon points="100,30 130,40 140,70 130,100 140,130 100,170 70,160 60,130 70,100 60,70 100,30" fill="none" stroke="#0066CC" stroke-width="3" stroke-linejoin="round" />
                            <g stroke="#66CC00" stroke-width="3" fill="none" stroke-linecap="round">
                                <path d="M 100 30 L 100 15 L 85 10" />
                                <path d="M 130 70 L 155 50 L 170 55" />
                                <path d="M 140 130 L 160 155 L 165 170" />
                                <path d="M 60 160 L 30 180 L 20 175" />
                                <path d="M 60 70 L 35 50 L 25 60" />
                            </g>
                            <g fill="#66CC00" opacity="0.9">
                                <circle cx="100" cy="15" r="4" />
                                <circle cx="170" cy="55" r="4" />
                                <circle cx="165" cy="170" r="4" />
                                <circle cx="20" cy="175" r="4" />
                                <circle cx="25" cy="60" r="4" />
                            </g>
                        </g>
                        <g transform="translate(260, 110)">
                            <text font-family="'Poppins', sans-serif" font-weight="800" font-size="64">
                                <tspan id="logo-text-main" x="0" y="0">DETROIT</tspan>
                                <tspan id="logo-text-sub" x="0" y="75" font-size="54" font-weight="700">AUTOMATION ACADEMY</tspan>
                            </text>
                        </g>
                    </svg>
                </a>
            </div>
            <ul class="nav-links">
                <li><a href="blog/">📝 Blog</a></li>
                <li><a href="dashboard.html">📊 Dashboard</a></li>
                <li><a href="students.html">👨‍🎓 Students</a></li>
                <li><a href="instructors.html">👨‍🏫 Instructors</a></li>
                <li><a href="partners.html">💼 Partners</a></li>
                <li><a href="subscriptions.html">💎 Subscriptions</a></li>
            </ul>
            <button id="theme-toggle">☀️ Light Mode</button>
        </nav>
    </header>

    <script>
        (function () {
            const saved = localStorage.getItem('daa-theme');
            const body = document.body;
            const btn = document.getElementById('theme-toggle');
            if (saved === 'light') {
                body.classList.add('light-mode');
                if (btn) btn.textContent = '🌙 Dark Mode';
            }
            document.addEventListener('DOMContentLoaded', function () {
                const toggle = document.getElementById('theme-toggle');
                if (!toggle) return;
                toggle.addEventListener('click', function () {
                    const isLight = document.body.classList.toggle('light-mode');
                    this.textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
                    localStorage.setItem('daa-theme', isLight ? 'light' : 'dark');
                    const main = document.getElementById('logo-text-main');
                    const sub = document.getElementById('logo-text-sub');
                    if (main) main.setAttribute('fill', isLight ? '#1A1F2E' : '#E6EDF3');
                    if (sub) sub.setAttribute('fill', isLight ? '#0055BB' : '#0066CC');
                });
            });
        })();
    </script>"""

footer_content = """    <footer>
        <div class="footer-links">
            <a href="blog/">Blog</a>
            <a href="dashboard.html">Dashboard</a>
            <a href="https://github.com/smit4786/DetroitAutomationAcademy" target="_blank">GitHub</a>
            <a href="mailto:info@detroitautomationacademy.com">Contact</a>
        </div>
        <p>© 2026 Detroit Automation Academy. All rights reserved. | Automation skills for Detroit's future, built by Detroiters.</p>
    </footer>"""

files_to_update = [
    "students.html",
    "instructors.html",
    "partners.html",
    "subscriptions.html",
    "dashboard.html",
]


def update_file(filepath):
    with open(filepath, "r") as f:
        content = f.read()

    # Replace header and script
    header_pattern = re.compile(
        r"<header>.*?</header>\s*(<script>.*?</script>)?", re.DOTALL
    )
    if header_pattern.search(content):
        content = header_pattern.sub(header_content, content, count=1)

    # Replace footer
    footer_pattern = re.compile(r"<footer>.*?</footer>", re.DOTALL)
    content = footer_pattern.sub(footer_content, content)

    with open(filepath, "w") as f:
        f.write(content)


for f in files_to_update:
    if os.path.exists(f):
        update_file(f)
        print(f"Updated {f}")
