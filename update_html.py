import os
import re
import datetime

# Generate cache-busting version string (Hourly)
version = datetime.datetime.now().strftime("%Y%m%d%H")

header_content = f"""    <header>
        <nav>
            <div class="logo">
                <a href="index.html?v={version}">
                    <svg viewBox="0 0 1000 250" width="180" height="45"
                         xmlns="http://www.w3.org/2000/svg">
                        <g transform="translate(25, 25)">
                            <circle cx="100" cy="100" r="75" fill="none"
                                    stroke="#0066CC" stroke-width="4" />
                            <polygon points="100,30 130,40 140,70 130,100 140,130
                                            100,170 70,160 60,130 70,100 60,70
                                            100,30"
                                     fill="none" stroke="#0066CC" stroke-width="3"
                                     stroke-linejoin="round" />
                            <g stroke="#66CC00" stroke-width="3" fill="none"
                               stroke-linecap="round">
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
                            <text font-family="'Poppins', sans-serif"
                                  font-weight="800" font-size="64">
                                <tspan id="logo-text-main" x="0" y="0">
                                    DETROIT
                                </tspan>
                                <tspan id="logo-text-sub" x="0" y="75"
                                       font-size="54" font-weight="700">
                                    AUTOMATION ACADEMY
                                </tspan>
                            </text>
                        </g>
                    </svg>
                </a>
            </div>
            <ul class="nav-links">
                <li><a href="blog/">📝 Blog</a></li>
                <li><a href="dashboard.html?v={version}">📊 Dashboard</a></li>
                <li><a href="students.html?v={version}">👨‍🎓 Students</a></li>
                <li><a href="instructors.html?v={version}">👨‍🏫 Instructors</a></li>
                <li><a href="partners.html?v={version}">💼 Partners</a></li>
                <li><a href="subscriptions.html?v={version}">💎 Subscriptions</a></li>
            </ul>
            <button id="theme-toggle">☀️ Light Mode</button>
        </nav>
    </header>

    <script>
        (function () {{
            const saved = localStorage.getItem('daa-theme');
            const body = document.body;
            const btn = document.getElementById('theme-toggle');
            if (saved === 'light') {{
                body.classList.add('light-mode');
                if (btn) btn.textContent = '🌙 Dark Mode';
            }}
            document.addEventListener('DOMContentLoaded', function () {{
                const toggle = document.getElementById('theme-toggle');
                if (!toggle) return;
                toggle.addEventListener('click', function () {{
                    const isLight = document.body.classList.toggle('light-mode');
                    this.textContent = isLight ? '🌙 Dark Mode' : '☀️ Light Mode';
                    localStorage.setItem('daa-theme', isLight ? 'light' : 'dark');
                    // Update SVG logo text color
                    const main = document.getElementById('logo-text-main');
                    const sub = document.getElementById('logo-text-sub');
                    if (main) {{
                        main.setAttribute('fill', isLight ? '#1A1F2E' : '#E6EDF3');
                    }}
                    if (sub) {{
                        sub.setAttribute('fill', isLight ? '#0055BB' : '#0066CC');
                    }}
                }});
            }});
        }})();
    </script>"""

footer_content = f"""    <footer>
        <div class="footer-links">
            <a href="blog/">Blog</a>
            <a href="dashboard.html?v={version}">Dashboard</a>
            <a href="https://github.com/smit4786/detroit-automation-academy-public"
               target="_blank">GitHub</a>
            <a href="mailto:info@detroitautomationacademy.com">Contact</a>
        </div>
        <p>© 2026 Detroit Automation Academy. All rights reserved. |
           Automation skills for Detroit's future, built by Detroiters.</p>
    </footer>"""

standard_styles = """
        /* ── Standardized Header/Footer Styles ── */
        header {
            background: rgba(13, 17, 23, 0.88);
            backdrop-filter: blur(20px);
            -webkit-backdrop-filter: blur(20px);
            border-bottom: 1px solid var(--daa-border);
            position: sticky;
            top: 0;
            z-index: 100;
            transition: background 0.3s;
        }

        body.light-mode header {
            background: rgba(245, 247, 250, 0.92);
        }

        footer {
            background: var(--daa-bg-card);
            border-top: 1px solid var(--daa-border);
            color: var(--daa-fg-muted);
            padding: 32px;
            text-align: center;
            font-size: 13px;
        }

        .footer-links {
            margin-bottom: 14px;
        }

        .footer-links a {
            color: var(--daa-fg-muted);
            text-decoration: none;
            margin: 0 14px;
            transition: color 0.2s;
        }

        .footer-links a:hover {
            color: var(--daa-accent);
        }

        /* ── Circuit background ── */
        body::before {
            content: '';
            position: fixed;
            inset: 0;
            background-image:
                linear-gradient(var(--daa-border) 1px, transparent 1px),
                linear-gradient(90deg, var(--daa-border) 1px, transparent 1px);
            background-size: 52px 52px;
            pointer-events: none;
            z-index: 0;
            opacity: 0.6;
        }
"""

files_to_update = [
    "students.html",
    "instructors.html",
    "partners.html",
    "subscriptions.html",
    "dashboard.html",
    "admin.html",
    "landing.html",
]


def update_file(filepath):
    if not os.path.exists(filepath):
        return
    with open(filepath, "r") as f:
        content = f.read()

    # Standardize header/script
    header_pattern = re.compile(
        r"<header>.*?</header>\s*(<script>.*?</script>)?", re.DOTALL
    )
    if header_pattern.search(content):
        content = header_pattern.sub(header_content, content, count=1)

    # Standardize footer
    footer_pattern = re.compile(r"<footer>.*?</footer>", re.DOTALL)
    if footer_pattern.search(content):
        content = footer_pattern.sub(footer_content, content)

    # Standardize styles
    style_pattern = re.compile(r"<style>(.*?)</style>", re.DOTALL)
    match = style_pattern.search(content)
    if match:
        style_content = match.group(1)

        # Remove old header/footer styles if they exist to avoid duplication
        style_content = re.sub(r"header\s*\{.*?\}", "", style_content, flags=re.DOTALL)
        style_content = re.sub(r"footer\s*\{.*?\}", "", style_content, flags=re.DOTALL)
        style_content = re.sub(
            r"\.footer-links\s*\{.*?\}", "", style_content, flags=re.DOTALL
        )
        style_content = re.sub(
            r"\.footer-links a\s*\{.*?\}", "", style_content, flags=re.DOTALL
        )
        style_content = re.sub(
            r"body::before\s*\{.*?\}", "", style_content, flags=re.DOTALL
        )

        style_content = standard_styles + style_content
        content = content[: match.start(1)] + style_content + content[match.end(1) :]

    # Ensure body class
    if 'body class="light-mode"' not in content and "<body>" in content:
        content = content.replace("<body>", '<body class="light-mode">')

    with open(filepath, "w") as f:
        f.write(content)
    print(f"Standardized {filepath}")


if __name__ == "__main__":
    for f in files_to_update:
        update_file(f)
