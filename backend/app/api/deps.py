from fastapi          import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm   import Session

from app.core.security   import decode_token
from app.core.exception import TokenExpiredException, InactiveUserException
from app.db.session      import get_db
from app.crud.user       import user_crud
from app.models.user     import User

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


def get_current_user(
    token: str     = Depends(oauth2_scheme),
    db:    Session = Depends(get_db),
) -> User:
    """
    Protected-route dependency.
    Đọc access token từ Authorization: Bearer <token>.
    401 → frontend interceptor bắt → gọi /refresh → retry.
    """
    if not token:
        raise TokenExpiredException()

    payload = decode_token(token, expected_type="access")
    if payload is None:
        raise TokenExpiredException()

    user = user_crud.get(db, id=payload["sub"])
    if user is None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if not user.is_active:
        raise InactiveUserException()

    return user