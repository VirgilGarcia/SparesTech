-- SparesTech PostgreSQL Schema
-- Version PostgreSQL propre sans Supabase

-- Extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Types énumérés
CREATE TYPE order_status AS ENUM ('draft', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled');
CREATE TYPE invoice_status AS ENUM ('draft', 'sent', 'paid', 'overdue', 'cancelled');
CREATE TYPE payment_method_type AS ENUM ('card', 'bank_transfer', 'paypal');
CREATE TYPE payment_status AS ENUM ('pending', 'completed', 'failed', 'cancelled', 'refunded');
CREATE TYPE subscription_status AS ENUM ('trial', 'active', 'past_due', 'cancelled', 'unpaid');
CREATE TYPE billing_cycle AS ENUM ('monthly', 'yearly');
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'client');
CREATE TYPE field_type AS ENUM ('text', 'number', 'boolean', 'date', 'select', 'textarea');

-- Table des utilisateurs (remplace auth.users de Supabase)
CREATE TABLE users (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  email text NOT NULL UNIQUE,
  password_hash text NOT NULL,
  email_confirmed boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Table startup_users (utilisateurs startup)
CREATE TABLE startup_users (
  id uuid PRIMARY KEY,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text DEFAULT 'France',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT startup_users_id_fkey FOREIGN KEY (id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table des tenants (marketplaces SaaS)
CREATE TABLE tenants (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  subdomain text UNIQUE,
  custom_domain text UNIQUE,
  custom_domain_verified boolean DEFAULT false,
  owner_id uuid NOT NULL,
  subscription_status subscription_status DEFAULT 'trial',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenants_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES startup_users(id)
);

-- Table des catégories
CREATE TABLE categories (
  id serial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  parent_id integer,
  level integer DEFAULT 0,
  path text DEFAULT '',
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES categories(id),
  CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table des produits
CREATE TABLE products (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  reference text NOT NULL,
  name text NOT NULL,
  description text,
  price numeric NOT NULL DEFAULT 0,
  stock_quantity integer NOT NULL DEFAULT 0,
  is_visible boolean DEFAULT true,
  is_sellable boolean DEFAULT true,
  featured_image_url text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table des champs de produits personnalisés
CREATE TABLE product_fields (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  label text NOT NULL,
  type field_type NOT NULL,
  required boolean DEFAULT false,
  options jsonb,
  default_value text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_fields_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table des valeurs des champs de produits
CREATE TABLE product_field_values (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  field_id uuid NOT NULL,
  value text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_field_values_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT product_field_values_field_id_fkey FOREIGN KEY (field_id) REFERENCES product_fields(id)
);

-- Table de liaison produits-catégories
CREATE TABLE product_categories (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  category_id integer NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES categories(id),
  CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Table des commandes
CREATE TABLE orders (
  id serial PRIMARY KEY,
  tenant_id uuid NOT NULL,
  user_id uuid,
  order_number text NOT NULL,
  status order_status DEFAULT 'draft',
  customer_email text NOT NULL,
  customer_first_name text,
  customer_last_name text,
  customer_company text,
  customer_phone text,
  customer_address text,
  customer_city text,
  customer_postal_code text,
  subtotal numeric NOT NULL DEFAULT 0,
  tax_amount numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table des éléments de commande
CREATE TABLE order_items (
  id serial PRIMARY KEY,
  order_id integer NOT NULL,
  product_id uuid,
  product_reference text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES orders(id)
);

-- Table des profils utilisateurs SaaS
CREATE TABLE user_profiles (
  id uuid PRIMARY KEY,
  tenant_id uuid NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  company_name text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text DEFAULT 'France',
  role user_role DEFAULT 'client',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES users(id),
  CONSTRAINT user_profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Table de liaison utilisateurs-tenants
CREATE TABLE tenant_users (
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role user_role DEFAULT 'client',
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenant_users_pkey PRIMARY KEY (tenant_id, user_id),
  CONSTRAINT tenant_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id),
  CONSTRAINT tenant_users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Plans d'abonnement startup
CREATE TABLE startup_subscription_plans (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name text NOT NULL UNIQUE,
  display_name text NOT NULL,
  description text,
  price_monthly numeric NOT NULL,
  price_yearly numeric,
  features jsonb DEFAULT '[]'::jsonb,
  limits jsonb DEFAULT '{}'::jsonb,
  custom_domain_allowed boolean DEFAULT false,
  priority_support boolean DEFAULT false,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Abonnements startup
CREATE TABLE startup_subscriptions (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  tenant_id uuid,
  status subscription_status DEFAULT 'trial',
  billing_cycle billing_cycle DEFAULT 'monthly',
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_end timestamp with time zone,
  cancelled_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT startup_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES startup_subscription_plans(id),
  CONSTRAINT startup_subscriptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES startup_users(id),
  CONSTRAINT startup_subscriptions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Logs d'activité
CREATE TABLE activity_logs (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid,
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Paramètres système
CREATE TABLE system_settings (
  key text PRIMARY KEY,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Paramètres des tenants
CREATE TABLE tenant_settings (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL UNIQUE,
  company_name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#10b981',
  show_prices boolean DEFAULT true,
  show_stock boolean DEFAULT true,
  show_categories boolean DEFAULT true,
  public_access boolean DEFAULT true,
  contact_email text,
  contact_phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenant_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Affichage des champs de produits
CREATE TABLE product_field_display (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  field_name text NOT NULL,
  field_type text NOT NULL CHECK (field_type IN ('system', 'custom')),
  display_name text NOT NULL,
  show_in_catalog boolean DEFAULT true,
  show_in_product boolean DEFAULT true,
  catalog_order integer DEFAULT 0,
  product_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_field_display_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES tenants(id)
);

-- Index pour performance
CREATE INDEX idx_products_tenant_id ON products(tenant_id);
CREATE INDEX idx_orders_tenant_id ON orders(tenant_id);
CREATE INDEX idx_categories_tenant_id ON categories(tenant_id);
CREATE INDEX idx_startup_users_email ON startup_users(email);
CREATE INDEX idx_users_email ON users(email);