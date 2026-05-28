"""
Tests for the Comprobante de Pago (Payment Proof) flow.

Covers:
- POST /api/registrations creates registration with estado_pago='pendiente' and tiene_comprobante=false
- POST /api/registrations/{id}/upload-comprobante updates state to 'completado'
- The uploaded file is publicly accessible via its returned URL
- Admin login returns access_token and GET /api/registrations returns the new fields
"""
import io
import os
import time
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://moto-race-2026.preview.emergentagent.com").rstrip("/")

ADMIN_EMAIL = "admin@coronaxp.com"
ADMIN_PASSWORD = "Admin2026!"


# -------- Fixtures --------
@pytest.fixture(scope="session")
def api_client():
    s = requests.Session()
    s.headers.update({"Accept": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(api_client):
    r = api_client.post(
        f"{BASE_URL}/api/admin/login",
        json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD},
        timeout=30,
    )
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    data = r.json()
    assert "access_token" in data, f"access_token missing in response: {data}"
    return data["access_token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


def _unique_payload(suffix=""):
    rid = uuid.uuid4().hex[:8]
    return {
        "nombre": f"TEST_Nombre_{rid}",
        "apellido": f"TEST_Apellido_{rid}",
        "cedula": f"99{rid[:6]}",
        "numero_competicion": str(int(time.time()) % 9999),
        "celular": "3001234567",
        "correo": f"test_{rid}@example.com",
        "liga": "Liga Test",
        "categorias": ["Senior A"],
    }


# -------- Tests --------
class TestComprobanteFlow:
    created_ids = []

    def test_admin_login_returns_access_token(self, admin_token):
        assert isinstance(admin_token, str)
        assert len(admin_token) > 10

    def test_create_registration_default_state_pendiente(self, api_client):
        payload = _unique_payload()
        r = api_client.post(f"{BASE_URL}/api/registrations", json=payload, timeout=30)
        assert r.status_code == 200, f"Create failed: {r.status_code} {r.text}"
        data = r.json()
        assert data.get("estado_pago") == "pendiente"
        # tiene_comprobante should be missing or False
        assert not data.get("tiene_comprobante", False)
        assert data.get("comprobante_url") in (None, "", False)
        assert data.get("id")
        TestComprobanteFlow.created_ids.append(data["id"])

    def test_upload_comprobante_updates_state(self, api_client, admin_headers):
        # Create new registration
        payload = _unique_payload()
        r = api_client.post(f"{BASE_URL}/api/registrations", json=payload, timeout=30)
        assert r.status_code == 200
        reg = r.json()
        reg_id = reg["id"]
        TestComprobanteFlow.created_ids.append(reg_id)

        # Upload a small PDF
        pdf_content = b"%PDF-1.4\n%TEST\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF\n"
        files = {"file": ("comprobante_test.pdf", io.BytesIO(pdf_content), "application/pdf")}
        up = api_client.post(
            f"{BASE_URL}/api/registrations/{reg_id}/upload-comprobante",
            files=files,
            timeout=60,
        )
        assert up.status_code == 200, f"Upload failed: {up.status_code} {up.text}"
        up_data = up.json()
        assert "comprobante_url" in up_data
        comprobante_url = up_data["comprobante_url"]
        assert comprobante_url.startswith("/api/uploads/")

        # The file should be accessible publicly
        file_url = f"{BASE_URL}{comprobante_url}"
        fr = requests.get(file_url, timeout=30)
        assert fr.status_code == 200, f"File not accessible: {fr.status_code} {file_url}"
        assert fr.content.startswith(b"%PDF")

        # GET registrations as admin and verify the entity is updated
        list_r = requests.get(f"{BASE_URL}/api/registrations", headers=admin_headers, timeout=30)
        assert list_r.status_code == 200, f"List registrations failed: {list_r.status_code} {list_r.text}"
        body = list_r.json()
        regs = body.get("registrations", body) if isinstance(body, dict) else body
        match = next((x for x in regs if x.get("id") == reg_id), None)
        assert match is not None, "Registration not found in admin list"
        assert match.get("estado_pago") == "completado"
        assert match.get("tiene_comprobante") is True
        assert match.get("comprobante_url") == comprobante_url

    def test_upload_comprobante_invalid_id_returns_404(self, api_client):
        files = {"file": ("x.pdf", io.BytesIO(b"%PDF-1.4\n"), "application/pdf")}
        r = api_client.post(
            f"{BASE_URL}/api/registrations/non-existent-id/upload-comprobante",
            files=files,
            timeout=30,
        )
        assert r.status_code == 404

    def test_upload_comprobante_invalid_type_rejected(self, api_client):
        payload = _unique_payload()
        r = api_client.post(f"{BASE_URL}/api/registrations", json=payload, timeout=30)
        assert r.status_code == 200
        rid = r.json()["id"]
        TestComprobanteFlow.created_ids.append(rid)

        files = {"file": ("bad.exe", io.BytesIO(b"MZ\x00"), "application/x-msdownload")}
        up = requests.post(
            f"{BASE_URL}/api/registrations/{rid}/upload-comprobante",
            files=files,
            timeout=30,
        )
        assert up.status_code == 400


@pytest.fixture(scope="session", autouse=True)
def _cleanup(admin_headers):
    yield
    # Cleanup TEST-created registrations
    for rid in TestComprobanteFlow.created_ids:
        try:
            requests.delete(
                f"{BASE_URL}/api/admin/registrations/{rid}",
                headers=admin_headers,
                timeout=15,
            )
        except Exception:
            pass
