CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(100),
    avatar_url TEXT,
    role VARCHAR(20) DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.f1_schedule (
    id SERIAL PRIMARY KEY,
    year INTEGER NOT NULL,
    grand_prix VARCHAR(100) NOT NULL,
    country VARCHAR(100) NOT NULL,
    circuit_name VARCHAR(150) NOT NULL,
    q1_start TIMESTAMP,
    q2_start TIMESTAMP,
    q3_start TIMESTAMP,
    sprint_qualify_start TIMESTAMP,
    sprint_start TIMESTAMP,
    qualify_start TIMESTAMP,
    race_start TIMESTAMP,
    CONSTRAINT unique_race UNIQUE (year, grand_prix, circuit_name)
);

-- trigger to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
   NEW.updated_at = NOW();
   RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_users_updated_at
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
