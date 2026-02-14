import requests
import sys
from datetime import datetime
import json

class CoronaXPAPITester:
    def __init__(self, base_url="https://racing-championship-2.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.admin_token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        default_headers = {'Content-Type': 'application/json'}
        if headers:
            default_headers.update(headers)

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=default_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=default_headers, timeout=10)
            else:
                print(f"❌ Unsupported method: {method}")
                return False, {}

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - {name}")
                return True, response.json() if response.text else {}
            else:
                print(f"❌ Failed - {name}")
                print(f"   Expected {expected_status}, got {response.status_code}")
                if response.text:
                    print(f"   Response: {response.text[:200]}")
                self.failed_tests.append(f"{name}: Expected {expected_status}, got {response.status_code}")
                return False, {}

        except requests.exceptions.RequestException as e:
            print(f"❌ Failed - {name} - Network Error: {str(e)}")
            self.failed_tests.append(f"{name}: Network error - {str(e)}")
            return False, {}
        except Exception as e:
            print(f"❌ Failed - {name} - Error: {str(e)}")
            self.failed_tests.append(f"{name}: Error - {str(e)}")
            return False, {}

    def test_categories_api(self):
        """Test GET /api/categories"""
        success, response = self.run_test(
            "Get Categories",
            "GET", 
            "categories",
            200
        )
        
        if success:
            categorias = response.get('categorias', [])
            precios = response.get('precios', {})
            print(f"   Found {len(categorias)} categories and {len(precios)} prices")
            
            # Check if we have expected 32 categories
            if len(categorias) != 32:
                print(f"   ⚠️  Expected 32 categories, got {len(categorias)}")
            
            # Check some sample categories
            expected_cats = ['INFANTIL', '115 2T Élite', 'Karts', 'Alto Cilindraje mas de 300cc']
            for cat in expected_cats:
                if cat in categorias:
                    precio = precios.get(cat, 0)
                    print(f"   ✓ {cat}: COP {precio:,}")
                else:
                    print(f"   ⚠️  Missing category: {cat}")
                    
        return success

    def test_price_calculation(self):
        """Test POST /api/registrations/calculate"""
        # Test without coupon
        success, response = self.run_test(
            "Calculate Price (No Coupon)",
            "POST",
            "registrations/calculate",
            200,
            data={
                "categorias": ["INFANTIL", "115 2T Élite"],
                "codigo_cupon": None
            }
        )
        
        if success:
            print(f"   Base Price: COP {response.get('precio_base', 0):,}")
            print(f"   Final Price: COP {response.get('precio_final', 0):,}")
            print(f"   Phase: {response.get('fase_actual', 'N/A')}")
            
        # Test with coupon
        success2, response2 = self.run_test(
            "Calculate Price (With Coupon)",
            "POST",
            "registrations/calculate",
            200,
            data={
                "categorias": ["INFANTIL"],
                "codigo_cupon": "PREVENTA30"
            }
        )
        
        if success2:
            print(f"   With Coupon - Discount: COP {response2.get('descuento', 0):,}")
            print(f"   With Coupon - Final: COP {response2.get('precio_final', 0):,}")
            
        return success and success2

    def test_coupon_validation(self):
        """Test POST /api/coupons/validate"""
        # Test valid coupon
        success, response = self.run_test(
            "Validate Coupon (PREVENTA30)",
            "POST",
            "coupons/validate",
            200,
            data={"codigo": "PREVENTA30"}
        )
        
        if success:
            print(f"   Valid: {response.get('valido', False)}")
            print(f"   Discount: {response.get('tipo_descuento', 0)}%")
        
        # Test invalid coupon
        success2, response2 = self.run_test(
            "Validate Invalid Coupon",
            "POST",
            "coupons/validate",
            404,  # Expected to fail
            data={"codigo": "INVALID123"}
        )
        
        return success  # Only first test should pass

    def test_admin_login(self):
        """Test POST /api/admin/login"""
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "admin/login",
            200,
            data={
                "email": "admin@coronaxp.com",
                "password": "Admin123"
            }
        )
        
        if success:
            self.admin_token = response.get('access_token')
            print(f"   Token obtained: {self.admin_token[:20]}..." if self.admin_token else "   No token received")
            
        return success

    def test_registration_creation(self):
        """Test POST /api/registrations"""
        success, response = self.run_test(
            "Create Registration",
            "POST",
            "registrations",
            200,
            data={
                "nombre": "Test",
                "apellido": "Piloto",
                "cedula": "123456789",
                "numero_competicion": "99",
                "celular": "3001234567",
                "correo": "test@example.com",
                "categorias": ["INFANTIL"],
                "codigo_cupon": None
            }
        )
        
        if success:
            registration_id = response.get('id')
            print(f"   Registration ID: {registration_id}")
            print(f"   Final Price: COP {response.get('precio_final', 0):,}")
            
        return success

    def test_admin_endpoints(self):
        """Test admin protected endpoints"""
        if not self.admin_token:
            print("❌ Skipping admin tests - no token available")
            return False
            
        auth_headers = {'Authorization': f'Bearer {self.admin_token}'}
        
        # Test get registrations
        success1, response1 = self.run_test(
            "Get Registrations (Admin)",
            "GET",
            "registrations",
            200,
            headers=auth_headers
        )
        
        if success1:
            registrations = response1.get('registrations', [])
            print(f"   Found {len(registrations)} registrations")
            
        # Test create coupon
        success2, response2 = self.run_test(
            "Create Coupon (Admin)",
            "POST",
            "admin/coupons",
            200,
            data={
                "codigo": f"TEST{datetime.now().strftime('%H%M%S')}",
                "tipo_descuento": 30,
                "usos_maximos": 10
            },
            headers=auth_headers
        )
        
        if success2:
            print(f"   Created coupon: {response2.get('codigo')}")
            
        # Test create news
        success3, response3 = self.run_test(
            "Create News (Admin)",
            "POST",
            "admin/news",
            200,
            data={
                "titulo": "Test News",
                "contenido": "This is a test news article",
                "imagen_url": "https://example.com/image.jpg"
            },
            headers=auth_headers
        )
        
        if success3:
            print(f"   Created news: {response3.get('titulo')}")
            
        return success1 and success2 and success3

    def test_news_endpoint(self):
        """Test GET /api/news"""
        success, response = self.run_test(
            "Get News",
            "GET",
            "news",
            200
        )
        
        if success:
            news_list = response.get('news', [])
            print(f"   Found {len(news_list)} news articles")
            
        return success

def main():
    print("🏁 Starting Corona XP 2026 API Testing...")
    print("=" * 50)
    
    tester = CoronaXPAPITester()
    
    # Test basic endpoints
    print("\n🔸 Testing Public Endpoints")
    tester.test_categories_api()
    tester.test_price_calculation()
    tester.test_coupon_validation()
    tester.test_registration_creation()
    tester.test_news_endpoint()
    
    # Test admin endpoints
    print("\n🔸 Testing Admin Endpoints")
    admin_login_success = tester.test_admin_login()
    if admin_login_success:
        tester.test_admin_endpoints()
    
    # Print final results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.failed_tests:
        print("\n❌ Failed Tests:")
        for failed_test in tester.failed_tests:
            print(f"   • {failed_test}")
    else:
        print("\n✅ All tests passed!")
    
    print("=" * 50)
    return 0 if len(tester.failed_tests) == 0 else 1

if __name__ == "__main__":
    sys.exit(main())