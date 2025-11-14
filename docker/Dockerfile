# bd/Dockerfile
FROM mariadb:11

# Opcional: asegura UTF8 completo por defecto
ENV MARIADB_CHARACTER_SET_SERVER=utf8mb4 \
    MARIADB_COLLATION_SERVER=utf8mb4_unicode_ci

# Copia los scripts de creación / datos iniciales
COPY init/*.sql /docker-entrypoint-initdb.d/

