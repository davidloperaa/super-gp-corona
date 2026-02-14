#!/usr/bin/env python3
"""
Script para actualizar las categorías en producción.
Ejecutar en el servidor de producción después de desplegar los cambios.

Uso:
  python3 update_production_categories.py
"""

import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
from pathlib import Path

# Cargar variables de entorno
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / 'backend/.env')

MONGO_URL = os.environ.get('MONGO_URL')
DB_NAME = os.environ.get('DB_NAME')

# Definir las nuevas categorías según la lista del usuario
CATEGORIAS = [
    # VELOCIDAD TOP (1-5)
    "115cc Elite",
    "150cc 2T",
    "SuperMoto",
    "115cc Novatos",
    "Hasta 220 4T Elite",
    # VELOCIDAD (6-14)
    "115cc Master",
    "115cc Principiantes",
    "Infantil hasta 150 4T y 100cc 2T no racer",
    "Hasta 220 4T Novatos",
    "Ax 100 Novatos",
    "(GP1) motos 4T hasta 160cc",
    "Ax100, NKD, Scooter Novatos",
    "Minimotard",
    "Libre Cilindraje (No Supermoto)",
    # VELOCIDAD RECREATIVAS (15-24)
    "Clientes Liquimoly hasta 200cc 4T (promo compra mínima)",
    "Clientes LiquiMoly Libre cilindraje 4T (promo compra mínima)",
    "Fórmula Colombia motos carenadas",
    "Alto cilindraje + 300cc 4T",
    "Pilotos LICAMO (Inscripción $40.000)",
    "Crypton Original Novatos (llantas no Slick)",
    "Boxer CT 100/ NKD 125 Recreativa RPDD",
    "150cc 4T Stock Multimarca Recreativa RPDD",
    "200 4T Stock Multimarca No Slick Recreativa RPDD",
    "Femenina libre 4t hasta 200cc",
    # KARTS (25-26)
    "Directos (sin cambios)",
    "Shifter, Dd2 (con cambios)",
    # VELOTIERRA (27-28)
    "Velotierra hasta 85cc 2T o 150cc 4T",
    "Velotierra Libre desde 125cc 2T y 250 4T",
    # MOTOCROSS (29-30)
    "Motocross hasta 85cc 2T o 150cc 4T",
    "Motocross Libre desde 125cc 2T y 250 4T"
]

GRUPOS = {
    "VELOCIDAD TOP": [
        "115cc Elite",
        "150cc 2T",
        "SuperMoto",
        "115cc Novatos",
        "Hasta 220 4T Elite"
    ],
    "VELOCIDAD": [
        "115cc Master",
        "115cc Principiantes",
        "Infantil hasta 150 4T y 100cc 2T no racer",
        "Hasta 220 4T Novatos",
        "Ax 100 Novatos",
        "(GP1) motos 4T hasta 160cc",
        "Ax100, NKD, Scooter Novatos",
        "Minimotard",
        "Libre Cilindraje (No Supermoto)"
    ],
    "VELOCIDAD RECREATIVAS": [
        "Clientes Liquimoly hasta 200cc 4T (promo compra mínima)",
        "Clientes LiquiMoly Libre cilindraje 4T (promo compra mínima)",
        "Fórmula Colombia motos carenadas",
        "Alto cilindraje + 300cc 4T",
        "Pilotos LICAMO (Inscripción $40.000)",
        "Crypton Original Novatos (llantas no Slick)",
        "Boxer CT 100/ NKD 125 Recreativa RPDD",
        "150cc 4T Stock Multimarca Recreativa RPDD",
        "200 4T Stock Multimarca No Slick Recreativa RPDD",
        "Femenina libre 4t hasta 200cc"
    ],
    "KARTS": [
        "Directos (sin cambios)",
        "Shifter, Dd2 (con cambios)"
    ],
    "VELOTIERRA": [
        "Velotierra hasta 85cc 2T o 150cc 4T",
        "Velotierra Libre desde 125cc 2T y 250 4T"
    ],
    "MOTOCROSS": [
        "Motocross hasta 85cc 2T o 150cc 4T",
        "Motocross Libre desde 125cc 2T y 250 4T"
    ]
}

# Precios - 100,000 por defecto, excepto LICAMO
PRECIOS = {cat: 100000 for cat in CATEGORIAS}
PRECIOS["Pilotos LICAMO (Inscripción $40.000)"] = 40000

async def update_categories():
    print(f"Conectando a MongoDB: {MONGO_URL[:30]}...")
    client = AsyncIOMotorClient(MONGO_URL)
    db = client[DB_NAME]
    
    print("\n1. Actualizando lista de categorías...")
    result1 = await db.categories.update_one(
        {"_id": "categories_list"},
        {"$set": {"categories": CATEGORIAS}},
        upsert=True
    )
    print(f"   ✓ Categorías: {result1.modified_count} modificadas")
    
    print("\n2. Actualizando grupos...")
    result2 = await db.category_groups.update_one(
        {"_id": "groups"},
        {"$set": {"groups": GRUPOS}},
        upsert=True
    )
    print(f"   ✓ Grupos: {result2.modified_count} modificados")
    
    print("\n3. Actualizando precios...")
    result3 = await db.category_prices.update_one(
        {"_id": "prices"},
        {"$set": {"prices": PRECIOS}},
        upsert=True
    )
    print(f"   ✓ Precios: {result3.modified_count} modificados")
    
    # Verificar
    print("\n--- VERIFICACIÓN ---")
    cats = await db.categories.find_one({"_id": "categories_list"})
    print(f"Total categorías guardadas: {len(cats.get('categories', []))}")
    
    groups_doc = await db.category_groups.find_one({"_id": "groups"})
    if groups_doc and groups_doc.get('groups'):
        total_in_groups = sum(len(v) for v in groups_doc.get('groups', {}).values())
        print(f"Total categorías en grupos: {total_in_groups}")
        for g, cats_list in groups_doc['groups'].items():
            print(f"  - {g}: {len(cats_list)} categorías")
    
    client.close()
    print("\n¡Actualización completada!")

if __name__ == "__main__":
    asyncio.run(update_categories())
