#!/usr/bin/env python3
"""
Script para probar la configuración de emails con Resend
Ejecutar: python3 test_email.py
"""

import os
import requests
from dotenv import load_dotenv

load_dotenv()

RESEND_API_KEY = os.getenv('RESEND_API_KEY', 're_TX9cFVwg_9FW31Dgr2wy733MRLwfzXfvN')
TEST_EMAIL = input("Ingresa tu email para recibir un email de prueba: ")

def test_resend_email():
    """Prueba el envío de email con Resend"""
    
    print("\n🧪 Probando configuración de Resend...")
    print(f"📧 Enviando email de prueba a: {TEST_EMAIL}")
    
    headers = {
        "Authorization": f"Bearer {RESEND_API_KEY}",
        "Content-Type": "application/json"
    }
    
    payload = {
        "from": "onboarding@resend.dev",
        "to": [TEST_EMAIL],
        "subject": "✅ Prueba de Email - Super GP Corona XP 2026",
        "html": """
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 20px; }
                .container { max-width: 600px; margin: 0 auto; background: white; padding: 40px; border-radius: 10px; }
                .header { background: #FF0000; color: white; padding: 20px; text-align: center; border-radius: 5px; }
                .content { padding: 30px 0; }
                .success { background: #00CED1; color: white; padding: 15px; border-radius: 5px; margin: 20px 0; }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>🏍️ Super GP Corona XP 2026</h1>
                </div>
                <div class="content">
                    <h2>¡Email de Prueba Exitoso! ✅</h2>
                    <p>Este es un email de prueba para verificar que la configuración de Resend está funcionando correctamente.</p>
                    
                    <div class="success">
                        <strong>✓ Configuración Correcta</strong><br>
                        Tu sistema de emails está listo para enviar confirmaciones de inscripción.
                    </div>
                    
                    <h3>Características Verificadas:</h3>
                    <ul>
                        <li>✅ Conexión con Resend API</li>
                        <li>✅ Envío de HTML templates</li>
                        <li>✅ Formato de email correcto</li>
                        <li>✅ Deliverability funcionando</li>
                    </ul>
                    
                    <h3>Próximos Pasos:</h3>
                    <ol>
                        <li>Verificar dominio personalizado en Resend (opcional)</li>
                        <li>Probar inscripción completa</li>
                        <li>Verificar recepción de QR code</li>
                    </ol>
                    
                    <p style="margin-top: 30px; color: #666; font-size: 12px;">
                        Este email fue enviado desde el sistema de pruebas de Super GP Corona XP 2026.
                    </p>
                </div>
            </div>
        </body>
        </html>
        """
    }
    
    try:
        response = requests.post(
            "https://api.resend.com/emails",
            json=payload,
            headers=headers
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"\n✅ EMAIL ENVIADO EXITOSAMENTE!")
            print(f"📨 ID del Email: {data.get('id')}")
            print(f"\n🎉 ¡Revisa tu bandeja de entrada!")
            print(f"📬 Destinatario: {TEST_EMAIL}")
            print(f"\n💡 Si no lo ves, revisa la carpeta de SPAM/Correo no deseado")
            return True
        else:
            print(f"\n❌ ERROR al enviar email")
            print(f"Status Code: {response.status_code}")
            print(f"Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"\n❌ EXCEPCIÓN: {str(e)}")
        return False

if __name__ == "__main__":
    print("="*60)
    print("🧪 TEST DE CONFIGURACIÓN DE EMAILS")
    print("   Super GP Corona XP 2026")
    print("="*60)
    
    success = test_resend_email()
    
    print("\n" + "="*60)
    if success:
        print("✅ CONFIGURACIÓN CORRECTA")
        print("   Tu sistema de emails está listo para producción")
    else:
        print("❌ HAY PROBLEMAS CON LA CONFIGURACIÓN")
        print("   Verifica:")
        print("   1. RESEND_API_KEY en .env")
        print("   2. Conexión a internet")
        print("   3. Límites de Resend no excedidos")
    print("="*60)
