from typing         import Optional
from sqlalchemy.orm import Session

from app.crud.base      import CRUDBase
from app.models.user    import User
from app.schemas.user   import UserCreate
from app.core.security  import get_password_hash, verify_password


class CRUDUser(CRUDBase[User, UserCreate, None]):

    # ── lookup ─────────────────────────────────────────────────────
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    # ── create (hash password) ─────────────────────────────────────
    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            email=obj_in.email,
            username=obj_in.username,
            hashed_password=get_password_hash(obj_in.password),
            full_name=obj_in.full_name,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    # ── authenticate ───────────────────────────────────────────────
    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        user = self.get_by_email(db, email=email)
        if not user or not verify_password(password, user.hashed_password):
            return None
        return user

    # ── refresh token ──────────────────────────────────────────────
    def save_refresh_token(self, db: Session, *, user: User, token: str) -> None:
        """Overwrite → token cũ vô hiệu (rotation)."""
        user.refresh_token = token
        db.commit()

    def clear_refresh_token(self, db: Session, *, user: User) -> None:
        """Logout: xóa refresh_token."""
        user.refresh_token = None
        db.commit()


user_crud = CRUDUser(User)   # singleton