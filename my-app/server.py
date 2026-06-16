import mysql.connector
import os
from datetime import date
from fastapi import FastAPI
from fastapi import HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

app = FastAPI()
origins = ["*"]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def get_db_connection():
    password = os.getenv("MYSQL_PASSWORD") or os.getenv("MYSQL_ROOT_PASSWORD")
    return mysql.connector.connect(
        database=os.getenv("MYSQL_DATABASE"),
        user=os.getenv("MYSQL_USER"),
        password=password,
        port=int(os.getenv("MYSQL_PORT", "3306")),
        host=os.getenv("MYSQL_HOST", "db"),
    )


class UserPayload(BaseModel):
    nom: str
    prenom: str
    email: str
    dateNaissance: date
    ville: str
    codePostal: str


@app.get("/users")
async def get_users():
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        sql_select_query = """
        SELECT id, last_name, first_name, email, birth_date, city, zip_code
        FROM utilisateur
        ORDER BY id DESC
        """
        cursor.execute(sql_select_query)
        records = cursor.fetchall()
        users = [
            {
                "id": row["id"],
                "nom": row["last_name"],
                "prenom": row["first_name"],
                "email": row["email"],
                "dateNaissance": row["birth_date"].isoformat()
                if row["birth_date"]
                else None,
                "ville": row["city"],
                "codePostal": row["zip_code"],
            }
            for row in records
        ]
        return {"utilisateurs": users}
    except mysql.connector.Error as error:
        raise HTTPException(status_code=500, detail=f"Database error: {error}") from error
    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals() and conn.is_connected():
            conn.close()


@app.post("/users")
async def create_user(payload: UserPayload):
    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        insert_query = """
        INSERT INTO utilisateur (last_name, first_name, email, birth_date, city, zip_code)
        VALUES (%s, %s, %s, %s, %s, %s)
        """
        cursor.execute(
            insert_query,
            (
                payload.nom,
                payload.prenom,
                payload.email,
                payload.dateNaissance.isoformat(),
                payload.ville,
                payload.codePostal,
            ),
        )
        conn.commit()
        return {"id": cursor.lastrowid}
    except mysql.connector.Error as error:
        raise HTTPException(status_code=500, detail=f"Database error: {error}") from error
    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals() and conn.is_connected():
            conn.close()