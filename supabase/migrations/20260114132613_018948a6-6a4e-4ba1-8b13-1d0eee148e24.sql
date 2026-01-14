
-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS username TEXT,
ADD COLUMN IF NOT EXISTS company_name TEXT;

-- Add new columns to projects table
ALTER TABLE public.projects 
ADD COLUMN IF NOT EXISTS project_type TEXT DEFAULT 'custom',
ADD COLUMN IF NOT EXISTS custom_type TEXT,
ADD COLUMN IF NOT EXISTS client TEXT,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS cost NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS assigned_to TEXT;

-- Add new columns to todos table
ALTER TABLE public.todos 
ADD COLUMN IF NOT EXISTS assigned_to TEXT;

-- Drop old expenses table and recreate with proper structure
DROP TABLE IF EXISTS public.expenses;

-- Create expenses table with new structure
CREATE TABLE public.expenses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  expense_type TEXT NOT NULL DEFAULT 'business',
  description TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on expenses
ALTER TABLE public.expenses ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for expenses
CREATE POLICY "Users can view their own expenses" 
ON public.expenses FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own expenses" 
ON public.expenses FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own expenses" 
ON public.expenses FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own expenses" 
ON public.expenses FOR DELETE USING (auth.uid() = user_id);

-- Create payments_received table
CREATE TABLE public.payments_received (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  client TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on payments_received
ALTER TABLE public.payments_received ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for payments_received
CREATE POLICY "Users can view their own payments" 
ON public.payments_received FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own payments" 
ON public.payments_received FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own payments" 
ON public.payments_received FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own payments" 
ON public.payments_received FOR DELETE USING (auth.uid() = user_id);

-- Create varnix_projects table for invoice management
CREATE TABLE public.varnix_projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE SET NULL,
  project_name TEXT NOT NULL,
  cost NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on varnix_projects
ALTER TABLE public.varnix_projects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for varnix_projects
CREATE POLICY "Users can view their own varnix projects" 
ON public.varnix_projects FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own varnix projects" 
ON public.varnix_projects FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own varnix projects" 
ON public.varnix_projects FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own varnix projects" 
ON public.varnix_projects FOR DELETE USING (auth.uid() = user_id);

-- Create varnix_payments table for invoice payments
CREATE TABLE public.varnix_payments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  amount NUMERIC NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on varnix_payments
ALTER TABLE public.varnix_payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for varnix_payments
CREATE POLICY "Users can view their own varnix payments" 
ON public.varnix_payments FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own varnix payments" 
ON public.varnix_payments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own varnix payments" 
ON public.varnix_payments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own varnix payments" 
ON public.varnix_payments FOR DELETE USING (auth.uid() = user_id);
