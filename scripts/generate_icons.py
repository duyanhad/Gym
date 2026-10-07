"""Generate the app icon set for the GYM app.

Usage:  python scripts/generate_icons.py

Outputs to assets/:
    icon.png                     1024x1024  app icon (dumbbell + GYM wordmark)
    android-icon-background.png  1024x1024  adaptive icon background (solid dark)
    android-icon-foreground.png  1024x1024  adaptive icon foreground (mark inside safe zone)
    android-icon-monochrome.png  1024x1024  adaptive icon monochrome (white mark, transparent)
    splash-icon.png              1024x1024  transparent mark for splash screen
    favicon.png                  64x64      web favicon

The mark is drawn as vector shapes and supersampled 4x so it stays crisp at every size.
"""

from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ASSETS = Path(__file__).resolve().parent.parent / "assets"

ACCENT = (198, 241, 53)  # #C6F135
DARK = (14, 17, 22)  # #0E1116
SURFACE = (25, 30, 38)  # #191E26
WHITE = (255, 255, 255)
TRANSPARENT = (0, 0, 0, 0)

SCALE = 4  # supersampling factor
ARIAL_BOLD = "C:/Windows/Fonts/arialbd.ttf"


def s(value: float) -> int:
    """Scale a logical (final-image) coordinate/size to the supersampled canvas."""
    return int(round(value * SCALE))


def rounded_bar(draw: ImageDraw.ImageDraw, cx: float, cy: float, width: float, height: float,
                radius: float, fill) -> None:
    draw.rounded_rectangle(
        [s(cx - width / 2), s(cy - height / 2), s(cx + width / 2), s(cy + height / 2)],
        radius=s(radius),
        fill=fill,
    )


def draw_dumbbell(draw: ImageDraw.ImageDraw, cx: float, cy: float, size: float, color) -> None:
    """Draw a dumbbell whose overall width is `size`, centered on (cx, cy)."""
    bar_w = size * 0.52
    bar_h = size * 0.105
    inner_w = size * 0.085
    inner_h = size * 0.235
    outer_w = size * 0.080
    outer_h = size * 0.375
    gap = size * 0.012

    rounded_bar(draw, cx, cy, bar_w, bar_h, bar_h / 2, color)

    inner_offset = bar_w / 2 + inner_w / 2 + gap
    outer_offset = inner_offset + inner_w / 2 + outer_w / 2 + gap

    for direction in (-1, 1):
        rounded_bar(draw, cx + direction * inner_offset, cy, inner_w, inner_h, inner_w / 2.4, color)
        rounded_bar(draw, cx + direction * outer_offset, cy, outer_w, outer_h, outer_w / 2.4, color)


def draw_centered_text(draw: ImageDraw.ImageDraw, text: str, font, cx: float, cy: float, fill) -> None:
    left, top, right, bottom = draw.textbbox((0, 0), text, font=font)
    draw.text(
        (s(cx) - (right - left) / 2 - left, s(cy) - (bottom - top) / 2 - top),
        text,
        font=font,
        fill=fill,
    )


def canvas(size: int, background) -> Image.Image:
    return Image.new("RGBA", (size * SCALE, size * SCALE), background)


def output(image: Image.Image, size: int) -> Image.Image:
    return image.resize((size, size), Image.LANCZOS)


def build_mark(size: int, background, mark_color, wordmark: str | None = None, mark_scale: float = 1.0) -> Image.Image:
    """Full square mark: dumbbell (slightly above center when there is a wordmark)."""
    image = canvas(size, background)
    draw = ImageDraw.Draw(image)

    center_x = size / 2
    dumbbell_width = size * 0.62 * mark_scale
    center_y = size * 0.45 if wordmark else size / 2

    draw_dumbbell(draw, center_x, center_y, dumbbell_width, mark_color)

    if wordmark:
        font = ImageFont.truetype(ARIAL_BOLD, s(size * 0.165))
        draw_centered_text(draw, wordmark, font, center_x, size * 0.745, mark_color)

    return image


def main() -> None:
    ASSETS.mkdir(parents=True, exist_ok=True)

    # 1. App icon: khung bo góc tối + viền accent + dumbbell + chữ GYM
    icon = canvas(1024, TRANSPARENT)
    draw = ImageDraw.Draw(icon)
    draw.rounded_rectangle([0, 0, s(1024) - 1, s(1024) - 1], radius=s(1024 * 0.22), fill=SURFACE)
    draw.rounded_rectangle(
        [s(28), s(28), s(1024) - s(28) - 1, s(1024) - s(28) - 1],
        radius=s(1024 * 0.20),
        outline=ACCENT,
        width=s(6),
    )
    icon.alpha_composite(build_mark(1024, TRANSPARENT, ACCENT, "GYM", mark_scale=0.95))
    output(icon, 1024).save(ASSETS / "icon.png")

    # 2. Adaptive icon background (màu đặc, không bo góc - hệ điều hành tự cắt)
    output(canvas(1024, DARK), 1024).save(ASSETS / "android-icon-background.png")

    # 3. Adaptive icon foreground: giữ trong safe zone (~66% ở giữa)
    output(build_mark(1024, TRANSPARENT, ACCENT, mark_scale=0.60), 1024).save(
        ASSETS / "android-icon-foreground.png"
    )

    # 4. Adaptive icon monochrome: mark trắng trên nền trong suốt
    output(build_mark(1024, TRANSPARENT, WHITE, mark_scale=0.60), 1024).save(
        ASSETS / "android-icon-monochrome.png"
    )

    # 5. Splash / logo trong suốt (dùng cho màn hình đăng nhập, splash)
    output(build_mark(1024, TRANSPARENT, ACCENT, "GYM", mark_scale=0.95), 1024).save(
        ASSETS / "splash-icon.png"
    )

    # 6. Favicon web
    output(build_mark(1024, DARK, ACCENT, mark_scale=0.70), 64).convert("RGB").save(
        ASSETS / "favicon.png"
    )

    for name in ("icon.png", "android-icon-background.png", "android-icon-foreground.png",
                 "android-icon-monochrome.png", "splash-icon.png", "favicon.png"):
        path = ASSETS / name
        with Image.open(path) as opened:
            print(f"{name:32} {opened.size[0]}x{opened.size[1]}  {opened.mode}  {path.stat().st_size} bytes")


if __name__ == "__main__":
    main()
