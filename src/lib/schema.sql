-- Schema do banco (Neon PostgreSQL). Pode rodar varias vezes sem problema.

CREATE TABLE IF NOT EXISTS products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price DECIMAL(10, 2) NOT NULL,
  category TEXT NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS neighborhoods (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  number SERIAL UNIQUE,
  customer_name TEXT NOT NULL,
  address TEXT,
  neighborhood_name TEXT,
  delivery_fee DECIMAL(10, 2) NOT NULL DEFAULT 0,
  subtotal DECIMAL(10, 2) NOT NULL,
  total DECIMAL(10, 2) NOT NULL,
  items JSONB NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_orders_status_created ON orders(status, created_at DESC);

INSERT INTO categories (id, name) VALUES
  ('cat-capas', 'Capas'),
  ('cat-acessorios', 'Acessórios'),
  ('cat-perfumes', 'Perfumes'),
  ('cat-carregadores', 'Carregadores')
ON CONFLICT DO NOTHING;
