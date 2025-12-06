import pytest
from passlib.context import CryptContext
from backend import auth

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def test_verify_password():    
    password = "testpassword"
    hashed = auth.get_password_hash(password)
    assert auth.verify_password(password, hashed) == True
    assert auth.verify_password("wrongpassword", hashed) == False

def test_get_password_hash():
    password = "testpassword"
    hashed = auth.get_password_hash(password)
    assert isinstance(hashed, str)

def test_create_access_token():
    token = auth.create_access_token({"sub": "testuser"})
    assert isinstance(token, str)

@pytest.mark.asyncio
async def test_get_user_by_email(mocker):
    mock_db = mocker.MagicMock()
    mock_db.users.find_one = mocker.AsyncMock(return_value={"email": "testuser"})
    user = await auth.get_user_by_email(mock_db, "testuser")
    assert user["email"] == "testuser"

@pytest.mark.asyncio
async def test_authenticate_user(mocker):
    mock_db = mocker.MagicMock()
    password = "testpassword"
    hashed = auth.get_password_hash(password)
    mock_db.users.find_one = mocker.AsyncMock(return_value={"email": "testuser", "password_hash": hashed})
    
    user = await auth.authenticate_user(mock_db, "testuser", password)
    assert user["email"] == "testuser"
    
    user = await auth.authenticate_user(mock_db, "testuser", "wrongpassword")
    assert user == False
    
    mock_db.users.find_one = mocker.AsyncMock(return_value=None)
    user = await auth.authenticate_user(mock_db, "nonexistent", password)
    assert user == False    