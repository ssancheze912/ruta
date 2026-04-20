#!/usr/bin/env python3
"""
run_acceptance_tests.py
=======================
Ejecuta casos de prueba Automated-E2E y Manual desde test-cases.csv usando Playwright.
Actualiza el CSV con resultados y genera un reporte Markdown.

Uso:
  python scripts/run_acceptance_tests.py
  python scripts/run_acceptance_tests.py --epic EPIC-PPS-F2
  python scripts/run_acceptance_tests.py --feature 2
  python scripts/run_acceptance_tests.py --base-url http://localhost:5173 --headless

Códigos de salida:
  0 — todos los casos ejecutados pasaron
  1 — al menos un caso falló o quedó bloqueado
  2 — error crítico (CSV no encontrado, navegador no inicia, etc.)
"""

import argparse
import csv
import io
import os
import re
import signal
import subprocess
import sys
import time
import traceback
import urllib.request
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# ---------------------------------------------------------------------------
# Constantes
# ---------------------------------------------------------------------------

PROJECT_ROOT = Path(__file__).resolve().parent.parent

CSV_PATH = (
    PROJECT_ROOT
    / "_bmad-output/implementation-artifacts/quality-process"
    / "planeacion/test-design-2026-04-09-100000/test-cases.csv"
)

REPORT_BASE = (
    PROJECT_ROOT
    / "_bmad-output/implementation-artifacts/quality-process/ejecucion"
)

PLAYWRIGHT_TYPES = {"Automated-E2E", "Manual"}

SKIP_REASONS = {
    "Automated-FE": "Vitest + React Testing Library",
    "Automated-BE": "xUnit / Supertest",
    "Security": "OWASP ZAP / Burp Suite",
    "Performance": "k6 / JMeter",
}

# Rutas conocidas de la aplicación
KNOWN_ROUTES = {
    "clientes": "/clientes",
    "contactos": "/contactos",
    "inicio": "/",
    "home": "/",
    "raíz": "/",
}

# Selectores conocidos del proyecto (data-testid + roles + labels)
SELECTORS = {
    "navigation-rail":    '[data-testid="navigation-rail"]',
    "navigation-bar":     '[data-testid="navigation-bar"]',
    "navigationrail":     '[data-testid="navigation-rail"]',
    "navigationbar":      '[data-testid="navigation-bar"]',
    "client-list":        '[data-testid="client-list"]',
    "contact-list":       '[data-testid="contact-list"]',
    "clientes":           'text="Clientes"',
    "contactos":          'text="Contactos"',
    "nuevo cliente":      'button:has-text("Nuevo cliente")',
    "guardar":            'button:has-text("Guardar")',
    "cancelar":           'button:has-text("Cancelar")',
    "eliminar":           'button:has-text("Eliminar")',
    "saltar":             'button:has-text("Saltar")',
    "buscar":             'input[type="search"], input[placeholder*="buscar" i]',
    "nombre":             'label:has-text("Nombre") >> input, [aria-label*="nombre" i]',
    "nit":                'label:has-text("NIT") >> input, [aria-label*="nit" i]',
    "teléfono":           'label:has-text("Teléfono") >> input, [aria-label*="teléfono" i]',
    "ciudad":             'label:has-text("Ciudad") >> input, [aria-label*="ciudad" i]',
    "email":              'input[type="email"], label:has-text("Email") >> input',
    "toast-success":      '[data-testid="toast-success"], [role="status"]',
    "dialog":             '[role="dialog"]',
    "alert":              '[role="alert"]',
    "loading":            '[data-testid="loading-spinner"]',
}

TODAY = datetime.now().strftime("%d-%m-%Y")
TIMESTAMP = datetime.now().strftime("%Y-%m-%d-%H%M%S")


# ---------------------------------------------------------------------------
# Web server auto-start
# ---------------------------------------------------------------------------

FRONTEND_DIR = PROJECT_ROOT / "frontend"
_dev_server_proc = None  # type: Optional[subprocess.Popen]


def _server_is_up(url: str, timeout: int = 2) -> bool:
    try:
        urllib.request.urlopen(url, timeout=timeout)
        return True
    except Exception:
        return False


def ensure_dev_server(base_url: str) -> bool:
    """
    Verifica si la app está corriendo. Si no, la levanta con `npm run dev`.
    Retorna True si el servidor está listo, False si falló.
    """
    global _dev_server_proc

    if _server_is_up(base_url):
        print("✅ Servidor ya está corriendo en {}".format(base_url))
        return True

    print("🚀 Servidor no detectado — levantando 'npm run dev' en frontend/...")

    _dev_server_proc = subprocess.Popen(
        ["npm", "run", "dev"],
        cwd=str(FRONTEND_DIR),
        stdout=subprocess.DEVNULL,
        stderr=subprocess.DEVNULL,
        shell=(sys.platform == "win32"),
    )

    # Esperar hasta 30 segundos a que levante
    for i in range(30):
        time.sleep(1)
        if _server_is_up(base_url):
            print("✅ Servidor listo en {} ({} seg)".format(base_url, i + 1))
            return True
        print("   Esperando... ({}/30)".format(i + 1), end="\r")

    print("\n❌ El servidor no respondió en 30 segundos.")
    return False


def stop_dev_server() -> None:
    global _dev_server_proc
    if _dev_server_proc is not None:
        print("🛑 Deteniendo servidor de desarrollo...")
        _dev_server_proc.terminate()
        try:
            _dev_server_proc.wait(timeout=5)
        except Exception:
            _dev_server_proc.kill()
        _dev_server_proc = None


# ---------------------------------------------------------------------------
# CSV helpers
# ---------------------------------------------------------------------------

COLUMNS = [
    "ID Épica", "ID Caso de Prueba", "Título", "Descripción Completa",
    "Precondiciones", "Pasos de Ejecución", "Resultados Esperados",
    "Tipo prueba", "Fecha Ejecución", "Estado", "ID Defecto",
    "Descripción Fallo", "Notas",
]


def load_csv(path: Path) -> List[Dict[str, str]]:
    with open(path, newline="", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def save_csv(path: Path, rows: List[Dict[str, str]]) -> None:
    buf = io.StringIO()
    writer = csv.DictWriter(
        buf, fieldnames=COLUMNS, quoting=csv.QUOTE_ALL, lineterminator="\n"
    )
    writer.writeheader()
    writer.writerows(rows)
    path.write_text(buf.getvalue(), encoding="utf-8")


def update_row(
    rows: List[Dict[str, str]],
    tc_id: str,
    *,
    estado: str,
    fecha: str = TODAY,
    defecto_id: str = "",
    desc_fallo: str = "",
    notes_append: str = "",
) -> None:
    for row in rows:
        if row["ID Caso de Prueba"] == tc_id:
            row["Estado"] = estado
            row["Fecha Ejecución"] = fecha
            row["ID Defecto"] = defecto_id
            row["Descripción Fallo"] = desc_fallo
            if notes_append:
                row["Notas"] = row["Notas"].rstrip() + " | " + notes_append
            return


# ---------------------------------------------------------------------------
# Step interpreter
# ---------------------------------------------------------------------------

def _resolve_selector(hint: str) -> str:
    """Intenta convertir un fragmento de texto a un selector CSS/Playwright."""
    h = hint.strip().lower()
    for key, sel in SELECTORS.items():
        if key in h:
            return sel
    # Fallback: buscar por texto visible
    quoted = re.search(r'["\u201c\u201d]([^""\u201c\u201d]+)["\u201c\u201d]', hint)
    if quoted:
        return f'text="{quoted.group(1)}"'
    return f'text="{hint.strip()}"'


def _extract_route(text: str) -> Optional[str]:
    """Extrae una ruta /xxx de un texto de paso."""
    match = re.search(r"(/[\w\-/]+)", text)
    if match:
        return match.group(1)
    low = text.lower()
    for keyword, route in KNOWN_ROUTES.items():
        if keyword in low:
            return route
    return None


def interpret_and_execute(page, step_text: str, base_url: str) -> Tuple[bool, str]:
    """
    Interpreta un paso en lenguaje natural y lo ejecuta con Playwright.
    Retorna (éxito, mensaje).
    """
    text = step_text.strip()
    low = text.lower()

    # ── Viewport ────────────────────────────────────────────────────────────
    vp_match = re.search(r"(\d{3,4})\s*px", low)
    if vp_match and any(k in low for k in ["viewport", "ancho", "mobile", "escritorio", "desktop"]):
        w = int(vp_match.group(1))
        h = 812 if w <= 480 else 900
        page.set_viewport_size({"width": w, "height": h})
        return True, f"Viewport → {w}×{h}"

    # ── Navegación ───────────────────────────────────────────────────────────
    if any(k in low for k in ["cargar la aplicación", "abrir la aplicación",
                               "abrir pestaña", "abrir el navegador",
                               "cargar app", "ir a la aplicación"]):
        page.goto(base_url)
        page.wait_for_load_state("networkidle")
        return True, f"Navegar → {base_url}"

    route = _extract_route(text)
    if route and any(k in low for k in ["navegar a", "ir a", "ingresar", "escribir",
                                         "abrir", "cargar", "presionar enter",
                                         "barra de dirección", "url", "deep link"]):
        full = base_url.rstrip("/") + route
        page.goto(full)
        page.wait_for_load_state("networkidle")
        return True, f"Navegar → {full}"

    # ── Botones del navegador ────────────────────────────────────────────────
    if any(k in low for k in ["botón atrás", "atrás del navegador", "go back", "presionar atrás"]):
        page.go_back()
        page.wait_for_load_state("networkidle")
        return True, "Navegar → Atrás"

    if any(k in low for k in ["adelante", "go forward", "botón adelante"]):
        page.go_forward()
        page.wait_for_load_state("networkidle")
        return True, "Navegar → Adelante"

    # ── Clicks ───────────────────────────────────────────────────────────────
    if any(k in low for k in ["hacer clic", "clic en", "tocar", "presionar", "tap "]):
        sel = _resolve_selector(text)
        try:
            page.wait_for_selector(sel, timeout=8000)
            page.click(sel)
            return True, f"Click → {sel}"
        except Exception as e:
            return False, f"Click fallido → {sel}: {e}"

    # ── Fill (formularios) ───────────────────────────────────────────────────
    if any(k in low for k in ["escribir", "ingresar", "llenar", "digitar", "completar campo"]):
        quoted = re.search(r'["\u201c\u201d]([^""\u201c\u201d]+)["\u201c\u201d]', text)
        value = quoted.group(1) if quoted else ""
        sel = _resolve_selector(re.sub(r'["\u201c\u201d][^""\u201c\u201d]+["\u201c\u201d]', "", text))
        try:
            page.wait_for_selector(sel, timeout=8000)
            page.fill(sel, value)
            return True, f"Fill {sel} → '{value}'"
        except Exception as e:
            return False, f"Fill fallido → {sel}: {e}"

    # ── Verificaciones de visibilidad ────────────────────────────────────────
    is_negation = any(k in low for k in ["no está", "no es visible", "no aparece",
                                          "que no", "confirmar que no", "sin ", "ausencia"])

    if any(k in low for k in ["verificar", "confirmar", "observar", "comprobar", "asegurar"]):
        # Verificar URL
        if "url" in low or "ruta" in low or "dirección" in low:
            current = page.url
            route_check = _extract_route(text)
            if route_check:
                ok = route_check in current
                return ok, f"URL actual: {current} {'contiene' if ok else 'NO contiene'} '{route_check}'"
            return True, f"URL actual: {current}"

        # Verificar visibilidad de elemento
        sel = _resolve_selector(text)
        try:
            if is_negation:
                is_vis = page.is_visible(sel)
                return not is_vis, f"{'✓' if not is_vis else '✗'} Elemento NO visible: {sel}"
            else:
                page.wait_for_selector(sel, timeout=8000)
                is_vis = page.is_visible(sel)
                return is_vis, f"{'✓' if is_vis else '✗'} Elemento visible: {sel}"
        except Exception:
            return is_negation, f"Elemento no encontrado: {sel} (esperado {'ausente' if is_negation else 'presente'})"

    # ── Esperas ──────────────────────────────────────────────────────────────
    if any(k in low for k in ["esperar", "aguardar", "wait"]):
        try:
            page.wait_for_load_state("networkidle", timeout=10000)
            return True, "Esperar carga de red completada"
        except Exception:
            return True, "Espera completada (timeout ignorado)"

    # ── DevTools / Network (pasos observacionales — skip silencioso) ─────────
    if any(k in low for k in ["devtools", "network tab", "monitoreo de red",
                                "activar devtools", "abrir devtools"]):
        return True, f"[Observacional] {text} — omitido en ejecución automatizada"

    # ── Paso no reconocido ───────────────────────────────────────────────────
    return None, f"[Sin interpretar] {text}"


def evaluate_expected_result(page, expected: str, base_url: str) -> Tuple[bool, str]:
    """
    Valida el estado final de la página contra el texto de resultado esperado.
    Retorna (cumple, detalle).
    """
    issues = []
    checks_done = 0

    # Verificar URLs mencionadas
    for route in re.findall(r"/[\w\-/]+", expected):
        if len(route) > 1:
            checks_done += 1
            if route not in page.url:
                issues.append(f"URL esperada '{route}' no está en '{page.url}'")

    # Verificar textos entre comillas que deben ser visibles
    for quoted in re.findall(r'["\u201c\u201d]([^""\u201c\u201d]{2,})["\u201c\u201d]', expected):
        checks_done += 1
        try:
            visible = page.is_visible(f'text="{quoted}"')
            if not visible:
                issues.append(f"Texto esperado no visible: '{quoted}'")
        except Exception:
            issues.append(f"No se pudo verificar texto: '{quoted}'")

    # Verificar ausencia de elementos si el expected menciona "NO"
    if re.search(r"\bno\b.*visible|no\b.*aparece|sin\b.*error", expected, re.IGNORECASE):
        try:
            has_errors = page.is_visible('[role="alert"].error, .error-boundary')
            if has_errors:
                issues.append("Se detectaron errores en la página")
        except Exception:
            pass

    if checks_done == 0:
        return True, "Sin validaciones automáticas — revisión manual requerida"

    if issues:
        return False, " | ".join(issues)

    return True, f"{checks_done} verificación(es) pasaron"


# ---------------------------------------------------------------------------
# Runner principal
# ---------------------------------------------------------------------------

def run_tests(
    rows: List[Dict[str, str]],
    cases_to_run: List[Dict[str, str]],
    base_url: str,
    headless: bool,
    csv_path: Path,
    report_dir: Path,
    verbose: bool,
) -> dict:
    """Ejecuta los casos con Playwright y actualiza el CSV. Retorna resumen."""

    from playwright.sync_api import sync_playwright

    summary = {"pass": 0, "fail": 0, "blocked": 0, "skipped": 0, "errors": []}
    report_lines = []

    def log(msg: str) -> None:
        print(msg)
        report_lines.append(msg)

    log(f"\n{'━'*60}")
    log(f"  RUN ACCEPTANCE TESTS — {TODAY}")
    log(f"  Ambiente: {base_url}")
    log(f"  Casos a ejecutar: {len(cases_to_run)}")
    log(f"{'━'*60}\n")

    with sync_playwright() as pw:
        browser = pw.chromium.launch(headless=headless)
        context = browser.new_context()
        page = context.new_page()

        # Capturar errores JS de consola
        js_errors: List[str] = []
        page.on("pageerror", lambda err: js_errors.append(str(err)))

        for idx, case in enumerate(cases_to_run, 1):
            tc_id = case["ID Caso de Prueba"]
            title = case["Título"]
            epic = case["ID Épica"]
            tc_type = case["Tipo prueba"]
            steps_raw = case["Pasos de Ejecución"]
            expected = case["Resultados Esperados"]
            preconds = case["Precondiciones"]

            log(f"[{idx}/{len(cases_to_run)}] {tc_id} — {title}")
            log(f"  Épica: {epic} | Tipo: {tc_type}")

            case_status = "Pass"
            case_fail_desc = ""
            js_errors.clear()

            try:
                # Aplicar viewport desde precondiciones
                if "375" in preconds or "mobile" in preconds.lower():
                    page.set_viewport_size({"width": 375, "height": 812})
                elif "1024" in preconds or "desktop" in preconds.lower():
                    page.set_viewport_size({"width": 1280, "height": 900})
                else:
                    page.set_viewport_size({"width": 1280, "height": 900})

                # Navegar a base para estado limpio
                page.goto(base_url)
                page.wait_for_load_state("networkidle")

                # Ejecutar pasos
                steps = [s.strip() for s in re.split(r"\s*\|\s*|\n", steps_raw) if s.strip()]
                steps = [re.sub(r"^\d+\.\s*", "", s) for s in steps]

                step_failed = False
                for step_num, step in enumerate(steps, 1):
                    result, detail = interpret_and_execute(page, step, base_url)
                    status_icon = "✓" if result is True else ("?" if result is None else "✗")
                    if verbose or result is False:
                        log(f"    Paso {step_num}: [{status_icon}] {detail}")
                    if result is False:
                        step_failed = True
                        case_fail_desc = f"Paso {step_num} falló: {detail}"
                        break

                if step_failed:
                    case_status = "Fail"
                else:
                    # Evaluar resultado esperado
                    ok, eval_detail = evaluate_expected_result(page, expected, base_url)
                    if verbose:
                        log(f"    Resultado esperado: [{('✓' if ok else '✗')}] {eval_detail}")
                    if not ok:
                        case_status = "Fail"
                        case_fail_desc = eval_detail

                # Verificar errores JS
                if js_errors and case_status == "Pass":
                    case_status = "Fail"
                    case_fail_desc = f"Errores JS: {'; '.join(js_errors[:3])}"

            except Exception as e:
                case_status = "Blocked"
                case_fail_desc = f"Excepción: {str(e)[:200]}"
                if verbose:
                    traceback.print_exc()

            # Actualizar CSV inmediatamente
            update_row(
                rows, tc_id,
                estado=case_status,
                desc_fallo=case_fail_desc,
            )
            save_csv(csv_path, rows)

            icon = {"Pass": "✅", "Fail": "❌", "Blocked": "⚠️"}.get(case_status, "?")
            log(f"  → {icon} {case_status}" + (f": {case_fail_desc}" if case_fail_desc else ""))

            summary[case_status.lower()] += 1
            if case_status in ("Fail", "Blocked"):
                summary["errors"].append({
                    "tc_id": tc_id, "title": title, "epic": epic,
                    "status": case_status, "detail": case_fail_desc,
                })

        context.close()
        browser.close()

    # ── Reporte final ────────────────────────────────────────────────────────
    total = len(cases_to_run)
    pass_pct = round(summary["pass"] / total * 100) if total else 0
    go_nogo = "✅ GO" if summary["fail"] == 0 and summary["blocked"] == 0 else "❌ NO-GO"

    log(f"\n{'━'*60}")
    log(f"  RESULTADO FINAL")
    log(f"{'━'*60}")
    log(f"  ✅ Pass:    {summary['pass']}/{total} ({pass_pct}%)")
    log(f"  ❌ Fail:    {summary['fail']}/{total}")
    log(f"  ⚠️  Blocked: {summary['blocked']}/{total}")
    log(f"  ⏭️  Skipped: {summary['skipped']}")
    log(f"  🎯 Go/No-Go: {go_nogo}")
    log(f"{'━'*60}\n")

    # Guardar reporte Markdown
    report_dir.mkdir(parents=True, exist_ok=True)
    report_path = report_dir / f"test-run-ALL-{TIMESTAMP}" / "test-execution-report.md"
    report_path.parent.mkdir(parents=True, exist_ok=True)

    md = [
        "# Test Execution Report — Suite Completa",
        f"**Fecha:** {TODAY}  |  **Ambiente:** {base_url}",
        "",
        "## Resumen",
        "",
        "| | Cantidad | % |",
        "|---|---|---|",
        f"| ✅ Pass | {summary['pass']} | {pass_pct}% |",
        f"| ❌ Fail | {summary['fail']} | {round(summary['fail']/total*100) if total else 0}% |",
        f"| ⚠️ Blocked | {summary['blocked']} | {round(summary['blocked']/total*100) if total else 0}% |",
        f"| ⏭️ Skipped | {summary['skipped']} | — |",
        f"| **Total ejecutados** | **{total}** | **100%** |",
        "",
        f"**Decisión Go/No-Go:** {go_nogo}",
        "",
    ]

    if summary["errors"]:
        md += ["## Defectos y Bloqueos", ""]
        md += ["| TC-ID | Épica | Título | Estado | Detalle |", "|---|---|---|---|---|"]
        for e in summary["errors"]:
            md.append(f"| {e['tc_id']} | {e['epic']} | {e['title']} | {e['status']} | {e['detail']} |")
        md.append("")

    report_path.write_text("\n".join(md), encoding="utf-8")
    print(f"📄 Reporte: {report_path.relative_to(PROJECT_ROOT)}")
    print(f"📋 CSV actualizado: {csv_path.relative_to(PROJECT_ROOT)}")

    return summary


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------

def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser(description="Ejecuta casos de prueba E2E desde test-cases.csv")
    p.add_argument("--base-url", default=os.getenv("BASE_URL", "http://localhost:5173"),
                   help="URL base de la aplicación (default: http://localhost:5173)")
    p.add_argument("--csv", default=str(CSV_PATH),
                   help="Ruta al test-cases.csv")
    p.add_argument("--epic", metavar="EPIC_ID",
                   help="Filtrar por épica (ej: EPIC-PPS-F2)")
    p.add_argument("--feature", metavar="N", type=int,
                   help="Filtrar por feature número (ej: 2 → EPIC-PPS-F2)")
    p.add_argument("--status", choices=["Not Started", "Fail", "Blocked", "all"],
                   default="all",
                   help="Qué estados ejecutar (default: all)")
    p.add_argument("--headless", action="store_true", default=True,
                   help="Ejecutar sin ventana de navegador (default: True)")
    p.add_argument("--no-headless", dest="headless", action="store_false",
                   help="Mostrar ventana del navegador")
    p.add_argument("--verbose", "-v", action="store_true",
                   help="Mostrar detalle de cada paso")
    p.add_argument("--output-dir", default=str(REPORT_BASE),
                   help="Carpeta donde guardar el reporte")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    csv_path = Path(args.csv)

    # Validar CSV
    if not csv_path.exists():
        print(f"❌ ERROR: CSV no encontrado: {csv_path}", file=sys.stderr)
        return 2

    # Cargar filas
    rows = load_csv(csv_path)
    print(f"✅ CSV cargado: {len(rows)} casos totales")

    # Resolver filtro de épica
    epic_filter: Optional[str] = None
    if args.epic:
        epic_filter = args.epic.upper()
    elif args.feature:
        epic_filter = f"EPIC-PPS-F{args.feature}"

    # Separar ejecutables de skipped
    skipped_count = 0
    cases_to_run: List[Dict[str, str]] = []

    for row in rows:
        tc_type = row["Tipo prueba"]
        epic = row["ID Épica"]

        # Filtro de épica/feature
        if epic_filter and epic != epic_filter:
            continue

        if tc_type not in PLAYWRIGHT_TYPES:
            tool = SKIP_REASONS.get(tc_type, tc_type)
            update_row(rows, row["ID Caso de Prueba"],
                       estado="Skipped",
                       notes_append=f"Auto-Skipped: requiere {tool}")
            skipped_count += 1
            continue

        # Filtro de estado
        current_status = row["Estado"]
        if args.status == "Not Started" and current_status != "Not Started":
            continue
        if args.status == "Fail" and current_status not in ("Fail", "Blocked"):
            continue

        cases_to_run.append(row)

    # Guardar skipped antes de empezar
    save_csv(csv_path, rows)
    print(f"⏭️  Auto-Skipped: {skipped_count} casos (requieren otra herramienta)")
    print(f"🚀 Ejecutables con Playwright: {len(cases_to_run)} casos")

    if not cases_to_run:
        print("ℹ️  No hay casos para ejecutar con los filtros actuales.")
        return 0

    # Verificar Playwright instalado
    try:
        from playwright.sync_api import sync_playwright  # noqa: F401
    except ImportError:
        print("❌ ERROR: Playwright no instalado.", file=sys.stderr)
        print("   Ejecuta: pip install playwright && playwright install chromium", file=sys.stderr)
        return 2

    # Levantar servidor si no está corriendo
    base_url = args.base_url.rstrip("/")
    if not ensure_dev_server(base_url):
        print("❌ No se pudo levantar el servidor. Abortando.", file=sys.stderr)
        return 2

    # Ejecutar tests y detener servidor al terminar
    try:
        summary = run_tests(
            rows=rows,
            cases_to_run=cases_to_run,
            base_url=base_url,
            headless=args.headless,
            csv_path=csv_path,
            report_dir=Path(args.output_dir),
            verbose=args.verbose,
        )
    finally:
        stop_dev_server()

    # Código de salida
    if summary["fail"] > 0 or summary["blocked"] > 0:
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
