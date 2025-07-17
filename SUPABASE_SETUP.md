# Supabase Database Setup Guide

## Step 1: Create Supabase Project

1. Go to [https://app.supabase.com](https://app.supabase.com)
2. Sign up/login with GitHub
3. Click "New Project"
4. Choose organization and give your project a name (e.g., "chalan-inventory")
5. Create a strong database password
6. Choose region closest to you
7. Click "Create new project"

## Step 2: Get Your Project Credentials

1. In your Supabase dashboard, go to Settings > API
2. Copy the "Project URL" 
3. Copy the "anon public" key from "Project API keys"

## Step 3: Create Environment Variables

Create a file called `.env.local` in your project root with:

```
VITE_SUPABASE_URL=your_project_url_here
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

## Step 4: Create Database Tables

In your Supabase dashboard, go to SQL Editor and run this SQL:

```sql
-- Create products table
CREATE TABLE products (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  category TEXT NOT NULL,
  brand TEXT NOT NULL,
  country TEXT NOT NULL,
  purchase_price DECIMAL(10,2) NOT NULL,
  selling_price DECIMAL(10,2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create sales table
CREATE TABLE sales (
  id TEXT PRIMARY KEY,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  buyer_name TEXT NOT NULL,
  total_profit DECIMAL(10,2) NOT NULL,
  total_revenue DECIMAL(10,2) NOT NULL,
  items JSONB NOT NULL,
  credit_info JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create standalone credits table
CREATE TABLE standalone_credits (
  id TEXT PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  credit_amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  is_standalone BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table
CREATE TABLE payments (
  id TEXT PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  description TEXT,
  related_sale_id TEXT,
  related_credit_id TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_products_name ON products(name);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_sales_date ON sales(date);
CREATE INDEX idx_sales_buyer ON sales(buyer_name);
CREATE INDEX idx_standalone_credits_buyer ON standalone_credits(buyer_name);
CREATE INDEX idx_standalone_credits_date ON standalone_credits(date);
CREATE INDEX idx_payments_buyer ON payments(buyer_name);
CREATE INDEX idx_payments_date ON payments(date);

-- Enable Row Level Security (optional but recommended)
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE standalone_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies to allow all operations (since it's single-user)
CREATE POLICY "Allow all operations on products" ON products FOR ALL USING (true);
CREATE POLICY "Allow all operations on sales" ON sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on standalone_credits" ON standalone_credits FOR ALL USING (true);
CREATE POLICY "Allow all operations on payments" ON payments FOR ALL USING (true);
```

## Step 5: Test Connection

After setting up the environment variables and tables, your app should automatically start using the database instead of localStorage.

## Troubleshooting

- If you see "Missing Supabase environment variables" error, check your `.env.local` file
- If database operations fail, the app will fallback to localStorage
- Check the browser console for any connection errors 