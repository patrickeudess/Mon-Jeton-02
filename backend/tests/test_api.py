"""Tests d'intégration de l'API Mon Jeton.

Exécution : depuis backend/, `pytest -v`
La base de test est un fichier SQLite jetable, recréé à chaque session.
"""
import os
import sys

TEST_DB = "test_mon_jeton.db"
if os.path.exists(TEST_DB):
    os.remove(TEST_DB)
os.environ["DATABASE_URL"] = f"sqlite:///./{TEST_DB}"

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi.testclient import TestClient  # noqa: E402
from app.main import app  # noqa: E402

client = TestClient(app)

USER = {
    "email": "test@monjeton.ci",
    "username": "test@monjeton.ci",
    "full_name": "Utilisateur Test",
    "password": "motdepasse123",
}


def auth_headers():
    response = client.post(
        "/auth/token",
        data={"username": USER["username"], "password": USER["password"]},
    )
    assert response.status_code == 200, response.text
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}


def test_health():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_register():
    response = client.post("/auth/register", json=USER)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["email"] == USER["email"]
    assert "hashed_password" not in data


def test_register_duplicate_rejected():
    response = client.post("/auth/register", json=USER)
    assert response.status_code == 400


def test_login_wrong_password_rejected():
    response = client.post(
        "/auth/token",
        data={"username": USER["username"], "password": "mauvais_mot_de_passe"},
    )
    assert response.status_code == 401


def test_me():
    response = client.get("/auth/me", headers=auth_headers())
    assert response.status_code == 200
    assert response.json()["email"] == USER["email"]


def test_me_requires_token():
    response = client.get("/auth/me")
    assert response.status_code == 401


def test_transactions_crud():
    headers = auth_headers()

    created = client.post(
        "/transactions/",
        json={"amount": 50000, "type": "revenu", "category": "Salaire"},
        headers=headers,
    )
    assert created.status_code == 200, created.text
    transaction_id = created.json()["id"]

    client.post(
        "/transactions/",
        json={"amount": 12000, "type": "depense", "category": "Nourriture",
              "payment_method": "Orange Money"},
        headers=headers,
    )

    listed = client.get("/transactions/", headers=headers)
    assert listed.status_code == 200
    assert len(listed.json()) == 2

    filtered = client.get("/transactions/?transaction_type=depense", headers=headers)
    assert len(filtered.json()) == 1
    assert filtered.json()[0]["category"] == "Nourriture"

    updated = client.put(
        f"/transactions/{transaction_id}",
        json={"amount": 55000},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["amount"] == 55000


def test_analytics():
    headers = auth_headers()
    response = client.get("/transactions/summary/analytics?months=3", headers=headers)
    assert response.status_code == 200, response.text
    data = response.json()
    assert data["total_revenues"] == 55000
    assert data["total_expenses"] == 12000
    assert data["balance"] == 43000
    assert len(data["monthly_trends"]) == 3
    assert data["top_expense_categories"][0]["category"] == "Nourriture"


def test_budgets_and_alerts():
    headers = auth_headers()
    month = __import__("datetime").datetime.now().strftime("%Y-%m")

    created = client.post(
        "/budgets/",
        json={"category": "Nourriture", "amount": 40000, "month": month},
        headers=headers,
    )
    assert created.status_code == 200, created.text

    alerts = client.get(f"/budgets/alerts?month={month}", headers=headers)
    assert alerts.status_code == 200
    alert = alerts.json()[0]
    assert alert["category"] == "Nourriture"
    assert alert["spent_amount"] == 12000
    assert alert["status"] == "good"


def test_goals():
    headers = auth_headers()

    created = client.post(
        "/goals/",
        json={"title": "Épargne Tabaski", "target_amount": 100000},
        headers=headers,
    )
    assert created.status_code == 200, created.text
    goal_id = created.json()["id"]

    updated = client.put(
        f"/goals/{goal_id}",
        json={"current_amount": 25000},
        headers=headers,
    )
    assert updated.status_code == 200
    assert updated.json()["current_amount"] == 25000

    listed = client.get("/goals/", headers=headers)
    assert len(listed.json()) == 1


def test_categories_seeded():
    response = client.get("/categories/")
    assert response.status_code == 200
    categories = response.json()
    assert len(categories) >= 10
    names = [c["name"] for c in categories]
    assert "Aide familiale" in names

    depenses = client.get("/categories/?category_type=depense").json()
    assert all(c["type"] == "depense" for c in depenses)


def test_user_isolation():
    """Un utilisateur ne voit pas les données d'un autre."""
    other = {
        "email": "autre@monjeton.ci",
        "username": "autre@monjeton.ci",
        "password": "autremotdepasse",
    }
    client.post("/auth/register", json=other)
    response = client.post(
        "/auth/token",
        data={"username": other["username"], "password": other["password"]},
    )
    headers = {"Authorization": f"Bearer {response.json()['access_token']}"}

    listed = client.get("/transactions/", headers=headers)
    assert listed.status_code == 200
    assert listed.json() == []
