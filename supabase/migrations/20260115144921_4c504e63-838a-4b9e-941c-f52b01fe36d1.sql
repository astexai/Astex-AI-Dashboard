-- Update varnix_projects to have development_cost, additional_cost columns
ALTER TABLE public.varnix_projects 
ADD COLUMN IF NOT EXISTS development_cost numeric NOT NULL DEFAULT 0,
ADD COLUMN IF NOT EXISTS additional_cost numeric NOT NULL DEFAULT 0;

-- Rename cost to total if needed (cost will be total now)
-- cost column already exists and will serve as total

-- Update varnix_payments to have mode column
ALTER TABLE public.varnix_payments 
ADD COLUMN IF NOT EXISTS mode text NOT NULL DEFAULT 'upi';