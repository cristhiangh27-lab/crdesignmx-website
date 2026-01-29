#!/usr/bin/env python3
import os
import re
from pathlib import Path

SITE_ROOT = "https://crcollective.mx"

SITEMAP_URLS = [
    f"{SITE_ROOT}/",
    f"{SITE_ROOT}/index.html",
    f"{SITE_ROOT}/projects.html",
    f"{SITE_ROOT}/services.html",
    f"{SITE_ROOT}/about.html",
    f"{SITE_ROOT}/contact.html",
    f"{SITE_ROOT}/projects/casa-lomas/",
    f"{SITE_ROOT}/projects/casa-carmona/",
    f"{SITE_ROOT}/projects/t2-aicm/",
    f"{SITE_ROOT}/projects/aicm-t2/",
    f"{SITE_ROOT}/projects/algarin-heights-commerce/",
    f"{SITE_ROOT}/projects/penthouse-jaime-torres-bodet/",
    f"{SITE_ROOT}/projects/aurora-house/",
    f"{SITE_ROOT}/projects/mirador-360/",
    f"{SITE_ROOT}/projects/pasaje-algarin/",
    f"{SITE_ROOT}/projects/coyoacan-retail/",
    f"{SITE_ROOT}/projects/alfareria-lofts/",
    f"{SITE_ROOT}/projects/lago-atelier/",
    f"{SITE_ROOT}/projects/brisa-pavilion/",
    f"{SITE_ROOT}/projects/prisma-office/",
    f"{SITE_ROOT}/projects/cantera-courtyard/",
    f"{SITE_ROOT}/projects/delta-residence/",
]


def build_sitemap() -> str:
    lines = [
        "<?xml version=\"1.0\" encoding=\"UTF-8\"?>",
        "<urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\">",
    ]
    for url in SITEMAP_URLS:
        lines.append("  <url>")
        lines.append(f"    <loc>{url}</loc>")
        lines.append("  </url>")
    lines.append("</urlset>")
    return "\n".join(lines) + "\n"


def write_file(path: Path, content: str) -> None:
    path.write_text(content, encoding="utf-8")


def canonical_for_path(path: Path) -> str:
    if path.name == "index.html" and path.parent == Path("."):
        return f"{SITE_ROOT}/"
    if path.parent == Path("."):
        return f"{SITE_ROOT}/{path.name}"
    if path.parts[0] == "projects" and path.name == "index.html":
        slug = path.parts[1]
        return f"{SITE_ROOT}/projects/{slug}/"
    return f"{SITE_ROOT}/{path.as_posix()}"


def ensure_head_structure(content: str) -> str:
    if re.search(r"<head\b", content, flags=re.IGNORECASE):
        return content
    return "\n".join(
        [
            "<!DOCTYPE html>",
            "<html>",
            "<head>",
            "</head>",
            "<body>",
            content,
            "</body>",
            "</html>",
            "",
        ]
    )


def insert_canonical(content: str, canonical_url: str) -> str:
    content = ensure_head_structure(content)
    head_match = re.search(
        r"(<head\b[^>]*>)(.*?)(</head>)", content, flags=re.IGNORECASE | re.DOTALL
    )
    if not head_match:
        return content
    head_open, head_body, head_close = head_match.groups()
    head_body = re.sub(
        r"\s*<link\b[^>]*rel=[\"']canonical[\"'][^>]*>\s*",
        "\n",
        head_body,
        flags=re.IGNORECASE,
    )
    canonical_tag = f"    <link rel=\"canonical\" href=\"{canonical_url}\" />"
    new_head_body = f"\n{canonical_tag}\n{head_body.strip()}\n" if head_body.strip() else f"\n{canonical_tag}\n"
    new_head = f"{head_open}{new_head_body}{head_close}"
    return content[: head_match.start()] + new_head + content[head_match.end() :]


def update_html_files(root: Path) -> int:
    html_files = sorted(root.rglob("*.html"))
    count = 0
    for html_file in html_files:
        rel_path = html_file.relative_to(root)
        canonical_url = canonical_for_path(rel_path)
        original = html_file.read_text(encoding="utf-8")
        updated = insert_canonical(original, canonical_url)
        if updated != original:
            html_file.write_text(updated, encoding="utf-8")
        count += 1
    return count


def main() -> None:
    repo_root = Path(__file__).resolve().parent.parent
    sitemap_path = repo_root / "sitemap.xml"
    robots_path = repo_root / "robots.txt"
    write_file(sitemap_path, build_sitemap())
    robots_content = "\n".join(
        [
            "User-agent: *",
            "Allow: /",
            f"Sitemap: {SITE_ROOT}/sitemap.xml",
            "",
        ]
    )
    write_file(robots_path, robots_content)
    update_html_files(repo_root)


if __name__ == "__main__":
    main()
