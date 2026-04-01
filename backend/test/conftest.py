import pytest
from fastapi.testclient import TestClient
from sqlalchemy          import create_engine
from sqlalchemy.orm      import sessionmaker
import tempfile
from app.main       import app
from app.db.base_model    import Base
from app.db.session import get_db

SQLALCHEMY_TEST_URL = "sqlite:///./test.db"

test_engine         = create_engine(SQLALCHEMY_TEST_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=test_engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


app.dependency_overrides[get_db] = override_get_db


@pytest.fixture(autouse=True)
def setup_db():
    Base.metadata.create_all(bind=test_engine)
    yield
    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture()
def client():
    return TestClient(app)


@pytest.fixture()
def db():
    session = TestingSessionLocal()
    yield session
    session.close()

@pytest.fixture()
def sample_ticket_text_1a():
    """Mẫu text vé format 1A."""
    return """472785 738 3087295991 12486000 38140T 0 0 CA DO/HOANG X3 D5JIXB TKTT.DHCCM
472787 738 3087295992 25229000 38140T 0 0 CA NGUYEN/X X3 D623F9 TKTT.DHCCM
472801 297 3087296004 6618000 19930T 0 231250 XA BUI/THI X3 EYK82Z TKTT.LIÊN MINH"""


@pytest.fixture()
def sample_ticket_text_1b():
    """Mẫu text vé format 1B."""
    return """PNR-LKXPUT AZMI/FAHRUL MR AGT SINE-AHV TIME 0812
COMM AMT- 0 TKT AMT - VND 9590000CA
2323007215202 VN ETR.TIKET/VND9684000 + 1048000XT

PNR-NREOZK TAI/LUYANG MR AGT SINE-AHV TIME 0813
COMM AMT- 0 TKT AMT - VND 7517000CA
7383007215204 VN ETR.GLORY"""


@pytest.fixture()
def sample_ticket_text_1g():
    """Mẫu text vé format 1G."""
    return """HAN/LIFEN MS-/4795604834486/-VND/3576000/ET.GLORY
LEDAI/MAY VIET M-/1895604834491/-VND/13636000/ET.ZY/NET + SERVICE FEE
KONG/LINGGUI MR-/1575604834533/-VND/3603000/ET.GLORY"""


@pytest.fixture()
def sample_tickets_json():
    """Sample parsed tickets JSON."""
    return [
        {
            "airlines": "VNA",
            "ticket_number": "7383007215202",
            "cust_id": "TIKET",
            "selling": None,
            "commission_selling": None,
            "buying": 9590000,
            "commission_buying": 0,
            "currency": "VND",
            "fare": 9684000,
            "admin_amount": None,
            "service": None,
            "note": None
        },
        {
            "airlines": "VNA",
            "ticket_number": "7383007215204",
            "cust_id": "GLORY",
            "selling": 7517000,
            "commission_selling": None,
            "buying": 7517000,
            "commission_buying": 0,
            "currency": "VND",
            "fare": None,
            "admin_amount": None,
            "service": None,
            "note": None
        }
    ]


# ══════════════════════════════════════════════════════════════════════
# Temporary file fixtures
# ══════════════════════════════════════════════════════════════════════

@pytest.fixture()
def temp_export_dir():
    """Temporary directory cho Excel exports."""
    with tempfile.TemporaryDirectory() as tmpdir:
        yield tmpdir

from app.core.security import create_access_token
from app.crud.user import user_crud
from app.schemas.user import UserCreate
# --- Thêm fixture này vào cuối file ---
@pytest.fixture()
def auth_headers(db):
    """
    Tạo một user test, cấp token và trả về Header xác thực.
    """
    email = "test_auth@example.com"
    password = "password123"
    
    # 1. Đảm bảo user tồn tại
    user = user_crud.get_by_email(db, email=email)
    if not user:
        user = user_crud.create(db, obj_in=UserCreate(
            username="test_auth_user",
            email=email, 
            password=password
        ))
    
    # 2. Tạo Access Token
    access_token = create_access_token(user.id)
    
    # 3. Trả về Header chuẩn
    return {"Authorization": f"Bearer {access_token}"}