"""Erzeugt den vereinfachten Sachsen-Umriss fuer die Karte (einmaliger Bauschritt).

Quelle der Rohdaten: Natural Earth, Admin 1 – States, Provinces (1:10 Mio.),
gemeinfrei (public domain), https://www.naturalearthdata.com/
Aufruf: python3 sachsen_umriss.py <pfad/zu/ne_10m_admin_1_states_provinces.geojson>
Ausgabe: js/grafik/karte-daten.js (Pfad + projizierte Orte)
"""
import json, math, sys, pathlib

SRC = sys.argv[1]
OUT = pathlib.Path(__file__).resolve().parents[2] / "js" / "grafik" / "karte-daten.js"

with open(SRC, encoding="utf-8") as f:
    data = json.load(f)
feat = next(ft for ft in data["features"] if ft["properties"].get("iso_3166_2") == "DE-SN")
geom = feat["geometry"]
polys = geom["coordinates"] if geom["type"] == "MultiPolygon" else [geom["coordinates"]]
# groesstes Polygon (Sachsen hat keine Exklaven von Bedeutung)
ring = max((p[0] for p in polys), key=len)

LAT0 = 51.0
KX = math.cos(math.radians(LAT0))
def proj(lon, lat):
    return lon * KX, -lat

pts = [proj(lon, lat) for lon, lat in ring]
minx = min(p[0] for p in pts); maxx = max(p[0] for p in pts)
miny = min(p[1] for p in pts); maxy = max(p[1] for p in pts)
W, H, PAD = 1000, 0, 40
scale = (W - 2 * PAD) / (maxx - minx)
H = round((maxy - miny) * scale + 2 * PAD)

def to_svg(lon, lat):
    x, y = proj(lon, lat)
    return (round((x - minx) * scale + PAD, 1), round((y - miny) * scale + PAD, 1))

def dp(points, eps):
    if len(points) < 3:
        return points
    (x1, y1), (x2, y2) = points[0], points[-1]
    dmax, idx = 0, 0
    for i in range(1, len(points) - 1):
        x0, y0 = points[i]
        num = abs((y2 - y1) * x0 - (x2 - x1) * y0 + x2 * y1 - y2 * x1)
        den = math.hypot(y2 - y1, x2 - x1) or 1e-9
        d = num / den
        if d > dmax:
            dmax, idx = d, i
    if dmax > eps:
        a = dp(points[: idx + 1], eps)
        b = dp(points[idx:], eps)
        return a[:-1] + b
    return [points[0], points[-1]]

svgpts = [to_svg(lon, lat) for lon, lat in ring]
if svgpts[0] == svgpts[-1]:
    svgpts = svgpts[:-1]
# geschlossener Ring: am entferntesten Punkt teilen, beide Haelften vereinfachen
far = max(range(len(svgpts)), key=lambda i: math.hypot(svgpts[i][0] - svgpts[0][0], svgpts[i][1] - svgpts[0][1]))
simp = dp(svgpts[: far + 1], 2.2)[:-1] + dp(svgpts[far:] + [svgpts[0]], 2.2)[:-1]
d = "M" + " L".join(f"{x},{y}" for x, y in simp) + " Z"

orte = {
    "leipzig": (12.3747, 51.3397),
    "meissen": (13.4737, 51.1634),
    "freiberg": (13.3430, 50.9119),
    "dresden": (13.7373, 51.0504),
}
# Elbe (vereinfachter Verlauf durch Sachsen, ungefaehre Stuetzpunkte)
elbe = [(14.25, 50.875), (14.20, 50.905), (14.10, 50.925), (13.98, 50.945), (13.94, 50.965),
        (13.84, 51.02), (13.74, 51.055), (13.64, 51.10), (13.52, 51.13), (13.47, 51.165),
        (13.40, 51.22), (13.29, 51.31), (13.23, 51.36), (13.20, 51.43), (13.12, 51.48),
        (13.01, 51.56), (12.92, 51.62), (12.86, 51.67)]
out = {
    "breite": W,
    "hoehe": H,
    "umriss": d,
    "orte": {k: to_svg(*v) for k, v in orte.items()},
    "elbe": [to_svg(*p) for p in elbe],
    "punkte": len(simp),
}
OUT.parent.mkdir(parents=True, exist_ok=True)
OUT.write_text(
    "// Automatisch erzeugt von tools/karte/sachsen_umriss.py – nicht von Hand bearbeiten.\n"
    "// Umriss: Natural Earth (gemeinfrei), vereinfacht (Douglas-Peucker).\n"
    "export const KARTE = " + json.dumps(out, ensure_ascii=False) + ";\n",
    encoding="utf-8",
)
print("Punkte:", len(ring), "->", len(simp), "Groesse", W, "x", H)
print(out["orte"])
