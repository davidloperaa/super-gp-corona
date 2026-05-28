#!/usr/bin/env python3
"""
Script para migrar el evento a JUNIO 2026 con las 13 categorías a $100.000.

Uso:
    BACKEND_URL=https://tu-dominio.com ADMIN_EMAIL=admin@coronaxp.com ADMIN_PASS=Admin2026! \\
        python3 scripts/seed_june_event.py

Nota: Esto se conecta a la API admin del backend, NO toca la base de datos directamente.
Requiere que el backend esté corriendo y accesible. Necesita un admin válido para autenticarse.
"""

import os
import sys
import requests

BACKEND_URL = os.environ.get("BACKEND_URL")
ADMIN_EMAIL = os.environ.get("ADMIN_EMAIL", "admin@coronaxp.com")
ADMIN_PASS = os.environ.get("ADMIN_PASS")

if not BACKEND_URL or not ADMIN_PASS:
    print("ERROR: define las variables BACKEND_URL, ADMIN_EMAIL y ADMIN_PASS")
    print("Ejemplo: BACKEND_URL=https://supergpcoronaxp.com ADMIN_EMAIL=admin@coronaxp.com ADMIN_PASS=Admin2026! python3 scripts/seed_june_event.py")
    sys.exit(1)

API = f"{BACKEND_URL.rstrip('/')}/api"


def main():
    print(f">>> Migrando evento en: {API}\n")

    # 1. Login admin
    r = requests.post(f"{API}/admin/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASS}, timeout=15)
    r.raise_for_status()
    token = r.json()["access_token"]
    H = {"Authorization": f"Bearer {token}"}
    print("[1/5] Admin login OK")

    # 2. Categorías + precios + grupos
    NEW_CATS = [
        "115 Principiantes",
        "AX100 / Hasta 180cc 4t / Scooter (2t-4t) / Pitbike hasta 160cc 4t Novatos",
        "AX Elite",
        "220 4t Novatos",
        "220 4t Elite",
        "GP1 Hasta 160cc 4t Novatos",
        "Libre pilotos afiliados a la liga del Cauca",
        "Libre Motos (No Super Motos) — 2t y 4t",
        "Karts Libre",
        "Disegraff — Crypton Original Recreativa",
        "Liquimoly — Libre Stock",
        "Motocross Libre",
        "Veloarena Libre",
    ]
    PRECIOS = {c: 100000 for c in NEW_CATS}
    GRUPOS = {
        "VELOCIDAD": [
            "115 Principiantes",
            "AX100 / Hasta 180cc 4t / Scooter (2t-4t) / Pitbike hasta 160cc 4t Novatos",
            "AX Elite",
            "220 4t Novatos",
            "220 4t Elite",
            "GP1 Hasta 160cc 4t Novatos",
            "Libre Motos (No Super Motos) — 2t y 4t",
            "Libre pilotos afiliados a la liga del Cauca",
        ],
        "RECREATIVAS": [
            "Disegraff — Crypton Original Recreativa",
            "Liquimoly — Libre Stock",
        ],
        "KARTS": ["Karts Libre"],
        "MOTOCROSS": ["Motocross Libre"],
        "VELOARENA": ["Veloarena Libre"],
    }
    r = requests.put(f"{API}/admin/categories-bulk", headers=H, json={
        "categorias": NEW_CATS, "precios": PRECIOS, "grupos": GRUPOS,
    }, timeout=20)
    r.raise_for_status()
    print(f"[2/5] Categorías actualizadas: {r.json()}")

    # 3. Settings (fechas)
    s = requests.get(f"{API}/settings", timeout=15).json()["settings"]
    s.pop("_id", None); s.pop("updated_at", None)
    s["event_start_date"] = "5 de Junio 2026"
    s["event_end_date"] = "7 de Junio 2026"
    s["hero_description"] = "El evento de motociclismo más emocionante del año. 13 categorías, 3 días de adrenalina pura."
    r = requests.put(f"{API}/admin/settings", headers=H, json=s, timeout=15)
    r.raise_for_status()
    print(f"[3/5] Fechas/settings: {s['event_start_date']} → {s['event_end_date']}")

    # 4. Calendario
    NEW_CAL = [
        {"id": "dia-1", "dia": "Viernes 5", "fecha": "5 de Junio 2026", "actividades": [
            {"hora": "19:00", "titulo": "Aguapanelazo", "descripcion": "Recepción y acreditación de pilotos"}
        ]},
        {"id": "dia-2", "dia": "Sábado 6", "fecha": "6 de Junio 2026", "actividades": [
            {"hora": "09:00 - 18:00", "titulo": "Entrenamientos", "descripcion": "Sesión de entrenamientos libres todas las categorías"},
            {"hora": "19:00", "titulo": "Reconocimiento y Premiación 2025", "descripcion": "Reconocimiento y premiación Pilotos campeones y subcampeones"}
        ]},
        {"id": "dia-3", "dia": "Domingo 7", "fecha": "7 de Junio 2026", "actividades": [
            {"hora": "08:00 - 17:00", "titulo": "CARRERAS", "descripcion": "Carreras - Todas las categorías"},
            {"hora": "18:00", "titulo": "Premiación", "descripcion": "Ceremonia de premiación y entrega de trofeos"}
        ]}
    ]
    DISC = [
        {"id": "1", "nombre": "MOTOVELOCIDAD", "ubicacion": "Pista Principal"},
        {"id": "2", "nombre": "MOTOCROSS", "ubicacion": "Track Motocross"},
        {"id": "3", "nombre": "VELOARENA", "ubicacion": "Arena Indoor"},
        {"id": "4", "nombre": "KARTS", "ubicacion": "Kartodromo"},
    ]
    r = requests.put(f"{API}/admin/calendar", headers=H, json={"eventos": NEW_CAL, "disciplinas": DISC}, timeout=15)
    r.raise_for_status()
    print("[4/5] Calendario actualizado")

    # 5. Etapas de precios
    NEW_STAGES = [
        {"etapa": "Inscripción única", "precio": 100000, "fecha": "Hasta el Domingo 7 de Junio 2026", "color": "green"}
    ]
    r = requests.put(f"{API}/admin/pricing-stages", headers=H, json={
        "stages": NEW_STAGES,
        "nota_devolucion": "Devoluciones con excusa hasta el Jueves 4 de Junio 2026"
    }, timeout=15)
    r.raise_for_status()
    print("[5/5] Etapas de precios actualizadas")

    # Verificación final
    cats = requests.get(f"{API}/categories", timeout=15).json()
    settings = requests.get(f"{API}/settings", timeout=15).json()["settings"]
    print("\n=== VERIFICACIÓN ===")
    print(f"Total categorías: {len(cats['categorias'])}")
    print(f"Fechas: {settings['event_start_date']} → {settings['event_end_date']}")
    print("\n✓ Migración completada. Recuerda vaciar caché del navegador (Ctrl+F5).")


if __name__ == "__main__":
    main()
