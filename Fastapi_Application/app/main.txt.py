from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers import user_router
from app.routers import user_role_router
from app.routers import user_right_router
from app.routers import candidate_router
from app.routers import cover_letter_router
from app.routers import forgot_password_router
from app.routers import global_setting_router

from app.database.session import Base, engine
from app.models.audit_trace_model import AuditTrace
from app.models.candidate_model import Candidate
from app.models.cover_letter_model import CoverLetter
from app.models.user_model import User
from app.models.forgot_password_model import ForgotPassword
from app.models.global_setting_model import GlobalSetting
# import other models similarly...

def create_tables():
    print("Creating database tables (if not exist)...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully.")

# Call this once on app startup or standalone
create_tables()

app = FastAPI(title="FastAPI CRUD Example")

origins = [
    "http://localhost:3000",  # React dev server
    "http://127.0.0.1:3000",  # Alternate
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,  # mandatory for cookies
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routers
app.include_router(user_router.router)
app.include_router(user_role_router.router)
app.include_router(user_right_router.router)
app.include_router(candidate_router.router)
app.include_router(cover_letter_router.router)
app.include_router(forgot_password_router.router)
app.include_router(global_setting_router.router)