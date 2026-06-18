from datetime import date
from pydantic import BaseModel


class UserPayload(BaseModel):
    nom: str
    prenom: str
    email: str
    dateNaissance: date
    ville: str
    codePostal: str


class AdminLoginPayload(BaseModel):
    username: str
    password: str
