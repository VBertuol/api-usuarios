-- Cria o banco (rode este comando conectado ao postgres)
CREATE DATABASE app_usuarios;

-- Conecte-se ao banco app_usuarios antes de rodar o restante:
-- \c app_usuarios

CREATE SCHEMA IF NOT EXISTS app;

CREATE TABLE IF NOT EXISTS app.usuarios (
    id          SERIAL PRIMARY KEY,
    nome        VARCHAR(100) NOT NULL,
    sobrenome   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) NOT NULL,
    usuario     VARCHAR(50)  NOT NULL,
    senha       VARCHAR(255) NOT NULL,
    ativo       BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_usuarios_email   UNIQUE (email),
    CONSTRAINT uq_usuarios_usuario UNIQUE (usuario)
);

CREATE INDEX IF NOT EXISTS idx_usuarios_email   ON app.usuarios (email);
CREATE INDEX IF NOT EXISTS idx_usuarios_usuario ON app.usuarios (usuario);
