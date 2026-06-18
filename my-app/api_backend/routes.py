import secrets
from typing import Optional

import mysql.connector
from fastapi import APIRouter, Header, HTTPException

from api_backend.auth import ADMIN_TOKENS
from api_backend.database import get_db_connection
from api_backend.schemas import AdminLoginPayload, UserPayload

router = APIRouter()


@router.get("/users")
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


@router.post("/admin/login")
async def admin_login(payload: AdminLoginPayload):
    try:
        conn = get_db_connection()
        cursor = conn.cursor(dictionary=True)
        query = """
        SELECT id
        FROM admin_user
        WHERE username = %s AND password = %s
        LIMIT 1
        """
        cursor.execute(query, (payload.username, payload.password))
        admin = cursor.fetchone()
        if not admin:
            raise HTTPException(status_code=401, detail="Invalid admin credentials.")

        token = secrets.token_hex(16)
        ADMIN_TOKENS.add(token)
        return {"token": token}
    except mysql.connector.Error as error:
        raise HTTPException(status_code=500, detail=f"Database error: {error}") from error
    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals() and conn.is_connected():
            conn.close()


@router.post("/users")
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


@router.delete("/users/{user_id}")
async def delete_user(user_id: int, x_admin_token: Optional[str] = Header(default=None)):
    if not x_admin_token or x_admin_token not in ADMIN_TOKENS:
        raise HTTPException(status_code=401, detail="Admin authentication required.")

    try:
        conn = get_db_connection()
        cursor = conn.cursor()
        delete_query = "DELETE FROM utilisateur WHERE id = %s"
        cursor.execute(delete_query, (user_id,))
        conn.commit()

        if cursor.rowcount == 0:
            raise HTTPException(status_code=404, detail="User not found.")
        return {"deleted": True}
    except mysql.connector.Error as error:
        raise HTTPException(status_code=500, detail=f"Database error: {error}") from error
    finally:
        if "cursor" in locals():
            cursor.close()
        if "conn" in locals() and conn.is_connected():
            conn.close()
