import os
import mysql.connector


def get_db_connection():
    password = os.getenv("MYSQL_PASSWORD") or os.getenv("MYSQL_ROOT_PASSWORD")
    return mysql.connector.connect(
        database=os.getenv("MYSQL_DATABASE"),
        user=os.getenv("MYSQL_USER"),
        password=password,
        port=int(os.getenv("MYSQL_PORT", "3306")),
        host=os.getenv("MYSQL_HOST", "db"),
    )
