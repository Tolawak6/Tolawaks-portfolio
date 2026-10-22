#!/usr/bin/env python3
"""
Generates a clean, ATS-readable, 1-page vector PDF CV at:
  client/public/cv/Tolawak_Merga_Abetu_CV.pdf

Zero external dependencies (pure Python 3 stdlib PDF 1.4 writer using standard
Type1 Helvetica & Courier fonts). Contains ONLY verified facts from Tolawak's CV
and provided contact links — zero invented metrics or claims.

Replace `client/public/cv/Tolawak_Merga_Abetu_CV.pdf` with your own PDF anytime.
"""

from pathlib import Path

PAGE_W = 595.28  # A4 width in pt
PAGE_H = 841.89  # A4 height in pt
MARGIN_X = 48.0


def pdf_escape(text: str) -> str:
    return (
        text.replace("\\", "\\\\")
        .replace("(", "\\(")
        .replace(")", "\\)")
        .replace("–", "-")
        .replace("—", "-")
        .replace("·", "|")
    )


def wrap_line(text: str, max_chars: int) -> list[str]:
    words = text.split()
    lines: list[str] = []
    cur = ""
    for w in words:
        cand = f"{cur} {w}".strip()
        if len(cand) <= max_chars:
            cur = cand
        else:
            if cur:
                lines.append(cur)
            cur = w
    if cur:
        lines.append(cur)
    return lines


def build_content_stream() -> bytes:
    ops: list[str] = []

    def rect_fill(x: float, y: float, w: float, h: float, r: float, g: float, b: float) -> None:
        ops.append(f"q {r:.3f} {g:.3f} {b:.3f} rg {x:.2f} {y:.2f} {w:.2f} {h:.2f} re f Q")

    def line(x1: float, y1: float, x2: float, y2: float, width: float, r: float, g: float, b: float) -> None:
        ops.append(
            f"q {width:.2f} w {r:.3f} {g:.3f} {b:.3f} RG {x1:.2f} {y1:.2f} m {x2:.2f} {y2:.2f} l S Q"
        )

    def text(
        x: float,
        y: float,
        value: str,
        font: str = "F1",
        size: float = 10.0,
        rgb: tuple[float, float, float] = (0.08, 0.08, 0.08),
    ) -> None:
        r, g, b = rgb
        ops.append(
            f"BT /{font} {size:.2f} Tf {r:.3f} {g:.3f} {b:.3f} rg {x:.2f} {y:.2f} Td ({pdf_escape(value)}) Tj ET"
        )

    # Top header banner (#000000 with #FDBF2D accent stripe)
    header_h = 116.0
    rect_fill(0, PAGE_H - header_h, PAGE_W, header_h, 0.0, 0.0, 0.0)
    rect_fill(0, PAGE_H - header_h - 4.0, PAGE_W, 4.0, 0.992, 0.749, 0.176)  # #FDBF2D

    text(MARGIN_X, PAGE_H - 46.0, "TOLAWAK M. ABETU", font="F2", size=22.0, rgb=(0.97, 0.96, 0.94))
    text(
        MARGIN_X,
        PAGE_H - 66.0,
        "FULL-STACK WEB DEVELOPER",
        font="F3",
        size=10.0,
        rgb=(0.992, 0.749, 0.176),
    )
    text(
        MARGIN_X,
        PAGE_H - 86.0,
        "Addis Ababa, Ethiopia  |  tolawak6@gmail.com  |  0909689044 (+251 909 689 044)",
        font="F1",
        size=9.2,
        rgb=(0.84, 0.83, 0.80),
    )
    text(
        MARGIN_X,
        PAGE_H - 101.0,
        "github.com/Tolawak6  |  linkedin.com/in/tolawak-merga  |  instagram.com/t_o_l_a_w_a_k",
        font="F1",
        size=9.2,
        rgb=(0.84, 0.83, 0.80),
    )

    y = PAGE_H - header_h - 34.0

    def section_heading(title: str) -> None:
        nonlocal y
        rect_fill(MARGIN_X, y - 2.0, 18.0, 3.0, 0.992, 0.749, 0.176)
        text(MARGIN_X + 24.0, y - 3.0, title.upper(), font="F2", size=10.5, rgb=(0.0, 0.0, 0.0))
        y -= 12.0
        line(MARGIN_X, y, PAGE_W - MARGIN_X, y, 0.6, 0.82, 0.82, 0.80)
        y -= 16.0

    # 1. Summary
    section_heading("Profile")
    summary = (
        "Computer Science graduate based in Addis Ababa building full-stack web applications end to end — "
        "responsive React interfaces on the frontend, Node.js/Express and Python (Django, FastAPI) APIs on "
        "the backend, and PostgreSQL, MySQL, or MongoDB data layers, alongside machine learning and data analysis."
    )
    for ln in wrap_line(summary, 95):
        text(MARGIN_X, y, ln, font="F1", size=9.8, rgb=(0.16, 0.16, 0.15))
        y -= 14.0
    y -= 10.0

    # 2. Education
    section_heading("Education")
    text(MARGIN_X, y, "B.Sc. in Computer Science", font="F2", size=10.8, rgb=(0.0, 0.0, 0.0))
    text(PAGE_W - MARGIN_X - 66.0, y, "2021 - 2025", font="F3", size=9.2, rgb=(0.35, 0.34, 0.31))
    y -= 14.0
    text(
        MARGIN_X,
        y,
        "Haramaya University  |  Haramaya, Ethiopia",
        font="F1",
        size=9.6,
        rgb=(0.28, 0.27, 0.25),
    )
    y -= 24.0

    # 3. Experience
    section_heading("Experience")

    text(MARGIN_X, y, "Freelance Developer", font="F2", size=10.8, rgb=(0.0, 0.0, 0.0))
    text(PAGE_W - MARGIN_X - 82.0, y, "2024 - Present", font="F3", size=9.2, rgb=(0.35, 0.34, 0.31))
    y -= 14.0
    text(
        MARGIN_X,
        y,
        "Independent  |  Addis Ababa, Ethiopia",
        font="F1",
        size=9.6,
        rgb=(0.28, 0.27, 0.25),
    )
    y -= 20.0

    text(MARGIN_X, y, "Web Developer Intern", font="F2", size=10.8, rgb=(0.0, 0.0, 0.0))
    text(PAGE_W - MARGIN_X - 102.0, y, "Jul 2024 - Aug 2024", font="F3", size=9.2, rgb=(0.35, 0.34, 0.31))
    y -= 14.0
    text(
        MARGIN_X,
        y,
        "Ethiopian Statistical Service  |  Addis Ababa, Ethiopia",
        font="F1",
        size=9.6,
        rgb=(0.28, 0.27, 0.25),
    )
    y -= 24.0

    # 4. Technical Stack
    section_heading("Technical Stack")
    stack_rows = [
        ("Languages", "JavaScript, Python, PHP, C++, HTML5, CSS3"),
        ("Frontend", "React, Vite, Tailwind CSS, Bootstrap, Responsive UI"),
        ("Backend & APIs", "Node.js, Express.js, Django, FastAPI, RESTful APIs, JSON"),
        ("Databases", "PostgreSQL, MySQL, MongoDB"),
        ("AI, Data & Mobile", "Machine Learning, Data Analysis, Flutter, React Native"),
        ("Tools & Workflow", "Git, GitHub"),
    ]
    for label, items in stack_rows:
        text(MARGIN_X, y, f"{label}:", font="F2", size=9.8, rgb=(0.0, 0.0, 0.0))
        text(MARGIN_X + 112.0, y, items, font="F1", size=9.8, rgb=(0.18, 0.18, 0.16))
        y -= 16.0
    y -= 10.0

    # 5. Languages
    section_heading("Spoken Languages")
    text(
        MARGIN_X,
        y,
        "Amharic (Native)    |    English (Proficient)    |    Afan Oromo (Proficient)",
        font="F1",
        size=9.8,
        rgb=(0.16, 0.16, 0.15),
    )

    # Subtle footer note
    line(MARGIN_X, 46.0, PAGE_W - MARGIN_X, 46.0, 0.5, 0.85, 0.85, 0.83)
    text(
        MARGIN_X,
        32.0,
        "Tolawak M. Abetu  |  Full-Stack Web Developer  |  github.com/Tolawak6",
        font="F3",
        size=8.2,
        rgb=(0.45, 0.44, 0.41),
    )

    return "\n".join(ops).encode("latin-1")


def write_pdf(dest: Path) -> None:
    stream = build_content_stream()

    objects: list[bytes] = [
        b"<< /Type /Catalog /Pages 2 0 R >>",
        b"<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
        (
            f"<< /Type /Page /Parent 2 0 R /MediaBox [0 0 {PAGE_W:.2f} {PAGE_H:.2f}] "
            f"/Resources << /Font << /F1 4 0 R /F2 5 0 R /F3 6 0 R >> >> /Contents 7 0 R >>"
        ).encode("ascii"),
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>",
        b"<< /Type /Font /Subtype /Type1 /BaseFont /Courier-Bold /Encoding /WinAnsiEncoding >>",
        b"<< /Length " + str(len(stream)).encode("ascii") + b" >>\nstream\n" + stream + b"\nendstream",
        (
            b"<< /Title (Tolawak M. Abetu - Curriculum Vitae) "
            b"/Author (Tolawak M. Abetu) "
            b"/Subject (Full-Stack Web Developer CV) >>"
        ),
    ]

    out = bytearray(b"%PDF-1.4\n%\xe2\xe3\xcf\xd3\n")
    offsets: list[int] = []
    for idx, obj in enumerate(objects, start=1):
        offsets.append(len(out))
        out.extend(f"{idx} 0 obj\n".encode("ascii"))
        out.extend(obj)
        out.extend(b"\nendobj\n")

    xref_pos = len(out)
    out.extend(f"xref\n0 {len(objects) + 1}\n".encode("ascii"))
    out.extend(b"0000000000 65535 f \n")
    for off in offsets:
        out.extend(f"{off:010d} 00000 n \n".encode("ascii"))

    out.extend(
        (
            f"trailer\n<< /Size {len(objects) + 1} /Root 1 0 R /Info 8 0 R >>\n"
            f"startxref\n{xref_pos}\n%%EOF\n"
        ).encode("ascii")
    )

    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_bytes(bytes(out))
    print(f"[cv] wrote {dest} ({len(out)} bytes)")


if __name__ == "__main__":
    target = Path(__file__).resolve().parent.parent / "client" / "public" / "cv" / "Tolawak_Merga_Abetu_CV.pdf"
    write_pdf(target)
