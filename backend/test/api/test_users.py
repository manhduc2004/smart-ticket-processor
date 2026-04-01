from app.crud.user    import user_crud
from app.schemas.user import UserCreate


# ── register ──────────────────────────────────────────────────────
def test_register_success(client):
    res = client.post("/api/v1/auth/register", json={
        "email": "new@test.com", "username": "newuser", "password": "password123"
    })
    assert res.status_code == 200
    assert res.json()["email"] == "new@test.com"


def test_register_duplicate(client, db):
    user_crud.create(db, obj_in=UserCreate(email="dup@test.com", username="dup", password="password123"))
    res = client.post("/api/v1/auth/register", json={
        "email": "dup@test.com", "username": "dup2", "password": "password123"
    })
    assert res.status_code == 400


# ── login ─────────────────────────────────────────────────────────
def test_login_success(client, db):
    user_crud.create(db, obj_in=UserCreate(email="login@test.com", username="loginuser", password="password123"))
    res = client.post("/api/v1/auth/login", json={
        "email": "login@test.com", "password": "password123"
    })
    assert res.status_code == 200
    assert "access_token" in res.json()
    assert "refresh_token" in res.cookies


def test_login_wrong_password(client, db):
    user_crud.create(db, obj_in=UserCreate(email="wp@test.com", username="wpuser", password="password123"))
    res = client.post("/api/v1/auth/login", json={
        "email": "wp@test.com", "password": "wrong"
    })
    assert res.status_code == 401


# ── refresh ───────────────────────────────────────────────────────
def test_refresh_success(client, db):
    user_crud.create(db, obj_in=UserCreate(email="ref@test.com", username="refuser", password="password123"))
    client.post("/api/v1/auth/login", json={"email": "ref@test.com", "password": "password123"})
    # cookie đã set → client tự gửi
    res = client.post("/api/v1/auth/refresh")
    assert res.status_code == 200
    assert "access_token" in res.json()


def test_refresh_no_cookie(client):
    client.cookies.clear()
    res = client.post("/api/v1/auth/refresh")
    assert res.status_code == 401


# ── /me ───────────────────────────────────────────────────────────
def test_get_me_ok(client, db):
    user_crud.create(db, obj_in=UserCreate(email="me@test.com", username="meuser", password="password123"))
    token = client.post("/api/v1/auth/login", json={
        "email": "me@test.com", "password": "password123"
    }).json()["access_token"]

    res = client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert res.status_code == 200
    assert res.json()["email"] == "me@test.com"


def test_get_me_no_token(client):
    res = client.get("/api/v1/auth/me")
    assert res.status_code == 401