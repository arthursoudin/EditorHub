import io
import os
import re
import sys
import xml.etree.ElementTree as ET

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PAGES = [
    os.path.join("src", "client", "index.html"),
    os.path.join("src", "client", "portfolio.html"),
    os.path.join("src", "client", "contact.html"),
    os.path.join("src", "admin", "dashboard.html"),
]
CSS = os.path.join("src", "client", "style.css")
LOGO = os.path.join("public", "assets", "logo.svg")

SKIP = ("http://", "https://", "mailto:", "tel:", "javascript:", "#", "data:", "//")

ATTR = re.compile(r"""(?:src|href)\s*=\s*["']([^"']+)["']""", re.I)
URL_CSS = re.compile(r"""url\(\s*["']?([^"')]+)["']?\s*\)""", re.I)


def is_external(ref):
    return ref.strip().lower().startswith(SKIP)


missing = []
checked = 0


def check(page_rel, ref):
    global checked
    if is_external(ref):
        return
    pure = ref.split("?")[0].split("#")[0].strip()
    if not pure:
        return
    base = os.path.dirname(os.path.join(ROOT, page_rel))
    target = os.path.normpath(os.path.join(base, pure.replace("/", os.sep)))
    checked += 1
    if not os.path.isfile(target):
        missing.append("%s -> %s (nao encontrado)" % (page_rel, ref))


for page in PAGES:
    html = io.open(os.path.join(ROOT, page), encoding="utf-8").read()
    for ref in ATTR.findall(html):
        check(page, ref)

css = io.open(os.path.join(ROOT, CSS), encoding="utf-8").read()
for ref in URL_CSS.findall(css):
    check(CSS, ref)

try:
    ET.parse(os.path.join(ROOT, LOGO))
    svg_ok = True
except ET.ParseError as exc:
    svg_ok = False
    missing.append("%s invalido: %s" % (LOGO, exc))

lines = [
    "assets verificados: %d" % checked,
    "logo.svg XML valido: %s" % ("OK" if svg_ok else "FALHOU"),
    "quebrados: %s" % ("nenhum" if not missing else "; ".join(missing)),
]
lines.append("RESULTADO: %s" % ("OK" if not missing else "FALHOU"))

io.open(os.path.join(ROOT, "tests", "asset-check.txt"), "w", encoding="utf-8").write(
    "\n".join(lines)
)
print("\n".join(lines))
sys.exit(0 if not missing else 1)
