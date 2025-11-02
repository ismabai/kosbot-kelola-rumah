-- Fix circular reference by removing tenant_id from rooms table
-- The relationship should be: tenant belongs to room, not room belongs to tenant

-- Drop the problematic foreign key
ALTER TABLE public.rooms
DROP CONSTRAINT IF EXISTS rooms_tenant_id_fkey;

-- Remove the tenant_id column from rooms as it creates circular dependency
ALTER TABLE public.rooms
DROP COLUMN IF EXISTS tenant_id;