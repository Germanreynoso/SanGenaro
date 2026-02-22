-- COPIA Y PEGA ESTO EN EL "SQL EDITOR" DE TU DASHBOARD DE SUPABASE

-- Habilitar extensión para IDs aleatorios
create extension if not exists "pgcrypto";

-- 1. Tabla de Salas (Rooms)
create table if not exists rooms (
  id uuid default gen_random_uuid() primary key,
  name text not null unique,
  drive_folder_id text,
  created_at timestamp with time zone default now() not null
);

-- 2. Tabla de Pacientes (Patients)
create table if not exists patients (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  dni text unique,
  dob date,
  social_security text,
  diagnosis text,
  room_id uuid references rooms(id) on delete set null,
  drive_folder_id text,
  created_at timestamp with time zone default now() not null
);

-- 3. Tabla de Informes (Reports)
create table if not exists reports (
  id uuid default gen_random_uuid() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  type text not null,
  content jsonb not null default '{}'::jsonb,
  created_by text,
  creator_name text,
  status text default 'draft',
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);

-- 4. Datos Iniciales
insert into rooms (name) values ('Sala A'), ('Sala B'), ('Sala C'), ('Pabellón Norte')
on conflict (name) do nothing;
