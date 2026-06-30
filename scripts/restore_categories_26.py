#!/usr/bin/env python3
"""
Restaurar las 26 categorías oficiales del campeonato a $100.000
(excepto Pilotos LICAMO a $40.000).

Uso:
    BACKEND_URL=https://corona-backend.dhvxzc.easypanel.host \\
    ADMIN_EMAIL=admin@coronaxp.com \\
    ADMIN_PASS=Admin2026! \\
        python3 scripts/restore_categories_26.py
"""

import os
import sys
import requests

BACKEND_URL = os.environ.get("BACKEND_URL")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@coronaxp.com")
ADMIN_PASS = os.environ.get("ADMIN_PASS")

if not BACKEND_URL or not ADMIN_PASS:
    print("ERROR: define BACKEND_URL, ADMIN_EMAIL y ADMIN_PASS")
    sys.exit(1)

API = f"{BACKEND_URL.rstrip('/')}/api"

GRUPOS = {
    "VELOCIDAD TOP": [
        "115cc Elite",
        "150cc 2T",
        "SuperMoto",
        "115cc Novatos",
        "Hasta 220 4T Elite",
    ],
    "VELOCIDAD": [
        "115cc Master",
        "115cc Principiantes",
        "Infantil hasta 150 4T y 100cc 2T no racer",
        "Hasta 220 4T Novatos",
        "Ax 100 Novatos",
        "(GP1) motos 4T hasta 160cc",
        "Ax100, NKD, Scooter Novatos",
        "Libre Cilindraje (No Supermoto)",
    ],
    "VELOCIDAD RECREATIVAS": [
        "Clientes Liquimoly hasta 200cc 4T (promo compra mínima)",
        "Clientes LiquiMoly Libre cilindraje 4T (promo compra mínima)",
        "Fórmula Colombia motos carenadas",
        "Alto cilindraje + 300cc 4T",
        "Pilotos LICAMO (Inscripción $40.000)",
        "Crypton Original Novatos (llantas no Slick)",
        "Hasta 125cc 4T Multimarca RPDD",
    ],
    "KARTS": [
        "Directos (sin cambios)",
        "Shifter, Dd2 (con cambios)",
    ],
    "VELOTIERRA": [
        "Velotierra hasta 85cc 2T o 150cc 4T",
        "Velotierra Libre desde 125cc 2T y 250 4T",
    ],
    "MOTOCROSS": [
        "Motocross hasta 85cc 2T o 150cc 4T",
        "Motocross Libre desde 125cc 2T y 250 4T",
    ],
}

# Flatten in order
CATEGORIAS = [c for cats in GRUPOS.values() for c in cats]

# Precios: todos a 100.000 excepto LICAMO a 40.000
PRECIOS = {}
for c in CATEGORIAS:
    if "LICAMO" in c:
        PRECIOS[c] = 40000
    else:
        PRECIOS[c] = 100000


def main():
    print(f">>> Restaurando categorías en: {API}")
    print(f">>> Total: {len(CATEGORIAS)} categorías\n")

    # Login
    r = requests.post(f"{API}/admin/login",
                      json={"email": ADMIN_EMAIL, "password": ADMIN_PASS},
                      timeout=20)
    r.raise_for_status()
    H = {"Authorization": f"Bearer {r.json()['access_token']}"}
    print("[OK] Login admin")

    # Bulk update categorías
    r = requests.put(f"{API}/admin/categories-bulk", headers=H, json={
        "categorias": CATEGORIAS,
        "precios": PRECIOS,
        "grupos": GRUPOS,
    }, timeout=30)
    r.raise_for_status()
    print(f"[OK] Categorías actualizadas: {r.json()}")

    # Etapas de precios: reset a UNA sola etapa $100.000 (sin multiplicadores)
    NEW_STAGES = [{
        "etapa": "Inscripción única",
        "precio": 100000,
        "fecha": "Hasta el día del evento",
        "color": "green",
    }]
    r = requests.put(f"{API}/admin/pricing-stages", headers=H, json={
        "stages": NEW_STAGES,
        "nota_devolucion": "Devoluciones con excusa según términos y condiciones del evento",
    }, timeout=15)
    r.raise_for_status()
    print(f"[OK] Etapas de precios reseteadas a una sola de $100.000")

    # Verificación
    cats = requests.get(f"{API}/categories", timeout=15).json()
    print(f"\n=== VERIFICACIÓN ===")
    print(f"Total: {len(cats['categorias'])} categorías\n")
    for grupo, lista in cats.get("grupos", {}).items():
        print(f"  [{grupo}] ({len(lista)})")
        for c in lista:
            precio = cats["precios"].get(c, "?")
            print(f"    - {c}: ${precio:,}" if isinstance(precio, int) else f"    - {c}: ?")
        print()

    print("✓ Listo. Refresca el sitio (Ctrl+F5) para ver los cambios.")


if __name__ == "__main__":
    main()
