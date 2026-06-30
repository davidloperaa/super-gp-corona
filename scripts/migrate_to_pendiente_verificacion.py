#!/usr/bin/env python3
"""
Script de migración: marca todas las inscripciones que tienen comprobante adjunto
como 'pendiente_verificacion' (Pendiente por verificar).

Usar después de añadir el volumen persistente para 'limpiar' las inscripciones
cuyo archivo de comprobante se perdió por redeploys previos. El admin contactará
a esos pilotos para que reenvíen el comprobante.

Uso:
    BACKEND_URL=https://corona-backend.dhvxzc.easypanel.host \\
    ADMIN_EMAIL=admin@coronaxp.com \\
    ADMIN_PASS=Admin2026! \\
        python3 scripts/migrate_to_pendiente_verificacion.py

Opciones:
    DRY_RUN=1   → muestra qué se cambiaría pero NO actualiza nada
    ONLY_COMPLETADO=1  → solo cambia las que están en estado 'completado' (recomendado).
                         Si se omite, cambia TODAS las que tienen comprobante.
"""

import os
import sys
import requests

BACKEND_URL = os.environ.get("BACKEND_URL")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@coronaxp.com")
ADMIN_PASS = os.environ.get("ADMIN_PASS")
DRY_RUN = os.environ.get("DRY_RUN") == "1"
ONLY_COMPLETADO = os.environ.get("ONLY_COMPLETADO") == "1"

if not BACKEND_URL or not ADMIN_PASS:
    print("ERROR: define BACKEND_URL, ADMIN_EMAIL y ADMIN_PASS")
    print("Ejemplo:")
    print("  BACKEND_URL=https://corona-backend.dhvxzc.easypanel.host \\")
    print("  ADMIN_EMAIL=admin@coronaxp.com \\")
    print("  ADMIN_PASS=Admin2026! \\")
    print("    python3 scripts/migrate_to_pendiente_verificacion.py")
    sys.exit(1)

API = f"{BACKEND_URL.rstrip('/')}/api"


def main():
    print(f">>> Backend: {API}")
    print(f">>> DRY_RUN: {DRY_RUN}")
    print(f">>> ONLY_COMPLETADO: {ONLY_COMPLETADO}\n")

    # 1. Login
    r = requests.post(f"{API}/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASS},
                      timeout=20)
    r.raise_for_status()
    token = r.json()["access_token"]
    H = {"Authorization": f"Bearer {token}"}
    print("[OK] Admin login")

    # 2. Traer todas las inscripciones
    r = requests.get(f"{API}/registrations", headers=H, timeout=30)
    r.raise_for_status()
    regs = r.json().get("registrations", [])
    print(f"[OK] Total inscripciones: {len(regs)}\n")

    # 3. Filtrar las que tienen comprobante
    to_update = [
        r for r in regs
        if r.get("tiene_comprobante") is True
        and r.get("estado_pago") != "pendiente_verificacion"
        and (not ONLY_COMPLETADO or r.get("estado_pago") == "completado")
    ]

    print(f"[INFO] Inscripciones a actualizar: {len(to_update)}\n")
    if not to_update:
        print("Nada que hacer. Saliendo.")
        return

    print(f"{'#':<3} {'NOMBRE':<35} {'ESTADO ACTUAL':<25} {'COMPROBANTE'}")
    print("-" * 110)
    for i, r in enumerate(to_update, 1):
        nombre = f"{r.get('nombre','')} {r.get('apellido','')}".strip()[:33]
        estado = r.get("estado_pago", "?")
        comp = r.get("comprobante_filename", "(sin nombre)")[:40]
        print(f"{i:<3} {nombre:<35} {estado:<25} {comp}")
    print()

    if DRY_RUN:
        print(">>> DRY_RUN activo. No se aplicó ningún cambio.")
        return

    # 4. Aplicar cambios
    ok = 0
    fail = 0
    for r in to_update:
        try:
            resp = requests.put(
                f"{API}/admin/registrations/{r['id']}/status",
                headers=H,
                json={"estado_pago": "pendiente_verificacion"},
                timeout=15,
            )
            resp.raise_for_status()
            ok += 1
        except Exception as e:
            fail += 1
            print(f"  [ERROR] {r.get('nombre')} {r.get('apellido')}: {e}")

    print(f"\n[OK] Actualizadas: {ok}")
    if fail:
        print(f"[!!] Fallidas:    {fail}")
    print("\nListo. Refresca el panel admin (Ctrl+F5) para ver los nuevos estados.")


if __name__ == "__main__":
    main()
