DO $$ BEGIN
    CREATE TYPE public.user_role AS ENUM ('ADMIN','MANAGER','OPERATOR','VIEWER');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.location_type AS ENUM ('internal','vendor','customer','loss','production');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.tracking_type AS ENUM ('none','lot','serial');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.partner_type AS ENUM ('supplier','customer','both');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.operation_type AS ENUM ('receipt','delivery','internal','adjustment');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.operation_status AS ENUM ('draft','waiting','ready','done','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.move_status AS ENUM ('draft','reserved','done','cancelled');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.reservation_status AS ENUM ('active','released','expired','consumed');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.alert_type AS ENUM ('low_stock','out_of_stock','expiry_warning','reorder_triggered');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.alert_priority AS ENUM ('low','medium','high','critical');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
    CREATE TYPE public.audit_action AS ENUM ('create','update','delete','login','logout','approve','cancel','complete','reserve','release');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
