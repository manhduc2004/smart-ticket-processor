from fastapi        import APIRouter, Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session

from app.core.config     import settings
from app.core.security   import create_access_token, create_refresh_token, decode_token
from app.core.exception import (
    InvalidCredentialsException,
    TokenExpiredException,
    TokenRevokedException,
    UserNotFoundException,
    InactiveUserException,
    UserAlreadyExistsException,
)
from app.db.session   import get_db
from app.crud.user    import user_crud
from app.schemas.user import (
    UserCreate,
    LoginRequest,
    LoginResponse,
    RefreshResponse,
    UserResponse,
)
from app.api.deps     import get_current_user
from app.models.user  import User

router = APIRouter()


# ── cookie helpers ──────────────────────────────────────────────────
def _set_refresh_cookie(response: Response, token: str) -> None:
    response.set_cookie(
        key="refresh_token",
        value=token,
        httponly=True,                              # JS không đọc được
        samesite="lax",
        secure=not settings.DEBUG,                  # Secure chỉ khi HTTPS
        max_age=settings.REFRESH_TOKEN_EXPIRE_DAYS * 86400,
    )


def _clear_refresh_cookie(response: Response) -> None:
    response.delete_cookie(key="refresh_token", samesite="lax")


def _get_refresh_cookie(refresh_token: str = Cookie(default=None)) -> str:
    if not refresh_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing refresh token")
    return refresh_token


# ── POST /register ──────────────────────────────────────────────────
@router.post("/register", response_model=UserResponse)
def register(
    body: UserCreate,
    db:   Session = Depends(get_db),
):
    if user_crud.get_by_email(db, email=body.email):
        raise UserAlreadyExistsException()
    return user_crud.create(db, obj_in=body)


# ── POST /login ─────────────────────────────────────────────────────
@router.post("/login", response_model=LoginResponse)
def login(
    body:     LoginRequest,
    response: Response,
    db:       Session = Depends(get_db),
):
    """
    1. Xác thực email + password
    2. Tạo access token (ngắn hạn) → body
    3. Tạo refresh token (dài hạn) → lưu DB + HttpOnly cookie
    """
    user = user_crud.authenticate(db, email=body.email, password=body.password)
    if not user:
        raise InvalidCredentialsException()

    access  = create_access_token(user_id=user.id)
    refresh = create_refresh_token(user_id=user.id)

    user_crud.save_refresh_token(db, user=user, token=refresh)
    _set_refresh_cookie(response, refresh)

    return LoginResponse(
        access_token=access,
        user=UserResponse.model_validate(user),
    )


# ── POST /refresh ───────────────────────────────────────────────────
@router.post("/refresh", response_model=RefreshResponse)
def refresh(
    response:      Response,
    db:            Session = Depends(get_db),
    refresh_token: str     = Depends(_get_refresh_cookie),
):
    """
    Frontend interceptor gọi khi access token hết hạn.
    1. decode refresh token
    2. so sánh với DB (chống theft + đã logout)
    3. rotation: tạo access + refresh mới
    """
    payload = decode_token(refresh_token, expected_type="refresh")
    if payload is None:
        raise TokenExpiredException()

    user = user_crud.get(db, id=payload["sub"])
    if user is None:
        raise UserNotFoundException()
    if not user.is_active:
        raise InactiveUserException()

    if user.refresh_token != refresh_token:
        raise TokenRevokedException()

    new_access  = create_access_token(user_id=user.id)
    new_refresh = create_refresh_token(user_id=user.id)

    user_crud.save_refresh_token(db, user=user, token=new_refresh)
    _set_refresh_cookie(response, new_refresh)

    return RefreshResponse(access_token=new_access)


# ── POST /logout ────────────────────────────────────────────────────
@router.post("/logout")
def logout(
    response:     Response,
    db:           Session = Depends(get_db),
    current_user: User    = Depends(get_current_user),
):
    user_crud.clear_refresh_token(db, user=current_user)
    _clear_refresh_cookie(response)
    return {"message": "Logged out"}


# ── GET /me ─────────────────────────────────────────────────────────
@router.get("/me", response_model=UserResponse)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user