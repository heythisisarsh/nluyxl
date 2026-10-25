import os
import base64
from cryptography.hazmat.primitives.ciphers.aead import AESGCM
from app.config import settings

def _get_master_key() -> bytes:
    try:
        return base64.b64decode(settings.KMS_DATA_KEY_BASE64)
    except Exception:
        # Fallback 32-byte key for local development
        return b"\x00" * 32

def encrypt_token(plain_token: str) -> dict:
    """
    Encrypts sensitive OAuth access and refresh tokens using AES-256-GCM.
    Returns ciphertext, iv, and auth tag.
    """
    key = _get_master_key()
    aesgcm = AESGCM(key)
    iv = os.urandom(12)  # 96-bit initialization vector
    ciphertext = aesgcm.encrypt(iv, plain_token.encode("utf-8"), None)
    return {
        "ciphertext": base64.b64encode(ciphertext).decode("utf-8"),
        "iv": base64.b64encode(iv).decode("utf-8")
    }

def decrypt_token(encrypted_data: dict) -> str:
    """
    Decrypts token inside worker memory on-demand.
    """
    key = _get_master_key()
    aesgcm = AESGCM(key)
    iv = base64.b64decode(encrypted_data["iv"])
    ciphertext = base64.b64decode(encrypted_data["ciphertext"])
    plaintext = aesgcm.decrypt(iv, ciphertext, None)
    return plaintext.decode("utf-8")
