-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.activity_logs (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id uuid,
  user_id uuid,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text,
  old_values jsonb,
  new_values jsonb,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT activity_logs_pkey PRIMARY KEY (id),
  CONSTRAINT activity_logs_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id),
  CONSTRAINT activity_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.categories (
  id integer NOT NULL DEFAULT nextval('categories_id_seq'::regclass),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  description text,
  parent_id integer,
  level integer DEFAULT 0,
  path text DEFAULT ''::text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT categories_pkey PRIMARY KEY (id),
  CONSTRAINT categories_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.categories(id),
  CONSTRAINT categories_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.order_items (
  id integer NOT NULL DEFAULT nextval('order_items_id_seq'::regclass),
  order_id integer NOT NULL,
  product_id uuid,
  product_reference text NOT NULL,
  product_name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit_price numeric NOT NULL,
  total_price numeric NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT order_items_pkey PRIMARY KEY (id),
  CONSTRAINT order_items_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT order_items_order_id_fkey FOREIGN KEY (order_id) REFERENCES public.orders(id)
);
CREATE TABLE public.orders (
  id integer NOT NULL DEFAULT nextval('orders_id_seq'::regclass),
  tenant_id uuid NOT NULL,
  user_id uuid,
  order_number text NOT NULL,
  status USER-DEFINED DEFAULT 'draft'::order_status,
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
  CONSTRAINT orders_pkey PRIMARY KEY (id),
  CONSTRAINT orders_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT orders_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.product_categories (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  category_id integer NOT NULL,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_categories_pkey PRIMARY KEY (id),
  CONSTRAINT product_categories_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id),
  CONSTRAINT product_categories_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id)
);
CREATE TABLE public.product_field_display (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  field_name text NOT NULL,
  field_type text NOT NULL CHECK (field_type = ANY (ARRAY['system'::text, 'custom'::text])),
  display_name text NOT NULL,
  show_in_catalog boolean DEFAULT true,
  show_in_product boolean DEFAULT true,
  catalog_order integer DEFAULT 0,
  product_order integer DEFAULT 0,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_field_display_pkey PRIMARY KEY (id),
  CONSTRAINT product_field_display_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.product_field_values (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  product_id uuid NOT NULL,
  field_id uuid NOT NULL,
  value text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_field_values_pkey PRIMARY KEY (id),
  CONSTRAINT product_field_values_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
  CONSTRAINT product_field_values_field_id_fkey FOREIGN KEY (field_id) REFERENCES public.product_fields(id)
);
CREATE TABLE public.product_fields (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL,
  name text NOT NULL,
  label text NOT NULL,
  type USER-DEFINED NOT NULL,
  required boolean DEFAULT false,
  options jsonb,
  default_value text,
  is_active boolean DEFAULT true,
  sort_order integer DEFAULT 0,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT product_fields_pkey PRIMARY KEY (id),
  CONSTRAINT product_fields_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.products (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
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
  CONSTRAINT products_pkey PRIMARY KEY (id),
  CONSTRAINT products_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.startup_invoices (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  subscription_id uuid,
  invoice_number text NOT NULL UNIQUE,
  status USER-DEFINED DEFAULT 'draft'::invoice_status,
  amount_ht numeric NOT NULL,
  amount_ttc numeric NOT NULL,
  tax_rate numeric DEFAULT 20.0,
  tax_amount numeric NOT NULL,
  currency text DEFAULT 'EUR'::text,
  due_date date NOT NULL,
  paid_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT startup_invoices_pkey PRIMARY KEY (id),
  CONSTRAINT startup_invoices_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.startup_users(id),
  CONSTRAINT startup_invoices_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.startup_subscriptions(id)
);
CREATE TABLE public.startup_payment_methods (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  type USER-DEFINED NOT NULL,
  is_default boolean DEFAULT false,
  card_last4 text,
  card_brand text,
  card_exp_month integer,
  card_exp_year integer,
  stripe_payment_method_id text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT startup_payment_methods_pkey PRIMARY KEY (id),
  CONSTRAINT startup_payment_methods_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.startup_users(id)
);
CREATE TABLE public.startup_payment_transactions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  subscription_id uuid,
  invoice_id uuid,
  amount numeric NOT NULL,
  currency text DEFAULT 'EUR'::text,
  status USER-DEFINED DEFAULT 'pending'::payment_status,
  payment_method_id uuid,
  processed_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT startup_payment_transactions_pkey PRIMARY KEY (id),
  CONSTRAINT startup_payment_transactions_subscription_id_fkey FOREIGN KEY (subscription_id) REFERENCES public.startup_subscriptions(id),
  CONSTRAINT startup_payment_transactions_invoice_id_fkey FOREIGN KEY (invoice_id) REFERENCES public.startup_invoices(id),
  CONSTRAINT startup_payment_transactions_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.startup_payment_methods(id),
  CONSTRAINT startup_payment_transactions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.startup_users(id)
);
CREATE TABLE public.startup_subscription_plans (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
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
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT startup_subscription_plans_pkey PRIMARY KEY (id)
);
CREATE TABLE public.startup_subscriptions (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  customer_id uuid NOT NULL,
  plan_id uuid NOT NULL,
  tenant_id uuid,
  status USER-DEFINED DEFAULT 'trial'::subscription_status,
  billing_cycle USER-DEFINED DEFAULT 'monthly'::billing_cycle,
  current_period_start timestamp with time zone,
  current_period_end timestamp with time zone,
  trial_end timestamp with time zone,
  cancelled_at timestamp with time zone,
  payment_method_id uuid,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT startup_subscriptions_pkey PRIMARY KEY (id),
  CONSTRAINT startup_subscriptions_plan_id_fkey FOREIGN KEY (plan_id) REFERENCES public.startup_subscription_plans(id),
  CONSTRAINT startup_subscriptions_customer_id_fkey FOREIGN KEY (customer_id) REFERENCES public.startup_users(id),
  CONSTRAINT startup_subscriptions_payment_method_id_fkey FOREIGN KEY (payment_method_id) REFERENCES public.startup_payment_methods(id),
  CONSTRAINT startup_subscriptions_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.startup_users (
  id uuid NOT NULL,
  email text NOT NULL UNIQUE,
  first_name text NOT NULL,
  last_name text NOT NULL,
  company_name text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text DEFAULT 'France'::text,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT startup_users_pkey PRIMARY KEY (id),
  CONSTRAINT startup_users_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id)
);
CREATE TABLE public.system_settings (
  key text NOT NULL,
  value jsonb NOT NULL,
  description text,
  is_public boolean DEFAULT false,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT system_settings_pkey PRIMARY KEY (key)
);
CREATE TABLE public.tenant_settings (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  tenant_id uuid NOT NULL UNIQUE,
  company_name text NOT NULL,
  logo_url text,
  primary_color text DEFAULT '#10b981'::text,
  show_prices boolean DEFAULT true,
  show_stock boolean DEFAULT true,
  show_categories boolean DEFAULT true,
  public_access boolean DEFAULT true,
  contact_email text,
  contact_phone text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenant_settings_pkey PRIMARY KEY (id),
  CONSTRAINT tenant_settings_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.tenant_users (
  tenant_id uuid NOT NULL,
  user_id uuid NOT NULL,
  role USER-DEFINED DEFAULT 'client'::user_role,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenant_users_pkey PRIMARY KEY (tenant_id, user_id),
  CONSTRAINT tenant_users_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT tenant_users_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);
CREATE TABLE public.tenants (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  name text NOT NULL,
  subdomain text UNIQUE,
  custom_domain text UNIQUE,
  custom_domain_verified boolean DEFAULT false,
  owner_id uuid NOT NULL,
  subscription_status USER-DEFINED DEFAULT 'trial'::subscription_status,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT tenants_pkey PRIMARY KEY (id),
  CONSTRAINT tenants_owner_id_fkey FOREIGN KEY (owner_id) REFERENCES public.startup_users(id)
);
CREATE TABLE public.user_profiles (
  id uuid NOT NULL,
  tenant_id uuid NOT NULL,
  email text NOT NULL,
  first_name text,
  last_name text,
  company_name text,
  phone text,
  address text,
  city text,
  postal_code text,
  country text DEFAULT 'France'::text,
  role USER-DEFINED DEFAULT 'client'::user_role,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
  CONSTRAINT user_profiles_id_fkey FOREIGN KEY (id) REFERENCES auth.users(id),
  CONSTRAINT user_profiles_tenant_id_fkey FOREIGN KEY (tenant_id) REFERENCES public.tenants(id)
);