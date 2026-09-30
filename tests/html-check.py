import io
import re
import sys

VOID = {
    "area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta",
    "param", "source", "track", "wbr",
}

ROOT = r"C:\Users\20260026-IEG\.skales-data\workspace\editor-hub"
FILES = [
    r"\src\client\index.html",
    r"\src\client\portfolio.html",
    r"\src\client\contact.html",
    r"\src\admin\dashboard.html",
]

report = []

for rel in FILES:
    html = io.open(ROOT + rel, encoding="utf-8").read()
    html = re.sub(r"<!--.*?-->", "", html, flags=re.S)
    html = re.sub(r"<script.*?</script>", "", html, flags=re.S)
    html = re.sub(r"<svg.*?</svg>", "", html, flags=re.S)
    html = re.sub(r"<noscript.*?</noscript>", "", html, flags=re.S)

    stack = []
    errors = []

    for match in re.finditer(r"<(/?)([a-zA-Z][a-zA-Z0-9]*)([^>]*)>", html):
        closing, tag, attrs = match.group(1), match.group(2).lower(), match.group(3)
        if tag in VOID or attrs.rstrip().endswith("/"):
            continue
        if not closing:
            stack.append(tag)
        else:
            if not stack:
                errors.append("fechamento sem abertura: </%s>" % tag)
            elif stack[-1] != tag:
                errors.append("esperado </%s>, encontrado </%s>" % (stack[-1], tag))
                if tag in stack:
                    while stack and stack.pop() != tag:
                        pass
            else:
                stack.pop()

    if stack:
        errors.append("tags nao fechadas: " + ", ".join(stack))

    report.append("%s -> %s" % (rel, "OK" if not errors else "; ".join(errors)))

io.open(ROOT + r"\tests\html-structure.txt", "w", encoding="utf-8").write("\n".join(report))
print("\n".join(report))
