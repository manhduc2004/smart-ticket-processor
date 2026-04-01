from app.crud.user    import user_crud
from app.schemas.user import UserCreate


def test_create_user(db):
    user = user_crud.create(db, obj_in=UserCreate(
        email="a@b.com", username="alice", password="password123"
    ))
    assert user.id is not None
    assert user.hashed_password != "password123"


def test_get_by_email(db):
    user_crud.create(db, obj_in=UserCreate(email="b@b.com", username="bob", password="password123"))
    found = user_crud.get_by_email(db, email="b@b.com")
    assert found is not None and found.username == "bob"


def test_authenticate_ok(db):
    user_crud.create(db, obj_in=UserCreate(email="c@b.com", username="carol", password="password123"))
    assert user_crud.authenticate(db, email="c@b.com", password="password123") is not None


def test_authenticate_wrong(db):
    user_crud.create(db, obj_in=UserCreate(email="d@b.com", username="dave", password="password123"))
    assert user_crud.authenticate(db, email="d@b.com", password="wrong") is None


def test_refresh_token_lifecycle(db):
    user = user_crud.create(db, obj_in=UserCreate(email="e@b.com", username="eve", password="password123"))

    user_crud.save_refresh_token(db, user=user, token="fake-token")
    db.refresh(user)
    assert user.refresh_token == "fake-token"

    user_crud.clear_refresh_token(db, user=user)
    db.refresh(user)
    assert user.refresh_token is None