/*
  # Appointment System Schema

  1. New Tables
    - appointments
      - id (uuid, primary key)
      - client_id (text, references users)
      - artist_id (text, references users)
      - date (date)
      - time (time)
      - description (text)
      - status (text: pending, approved, rejected)
      - created_at (timestamptz)

  2. Security
    - Enable RLS
    - Clients can create appointments and read their own appointments
    - Artists can read and update appointments where they are the artist
*/

-- Create appointments table
CREATE TABLE IF NOT EXISTS appointments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id text REFERENCES users(uid) NOT NULL,
  artist_id text REFERENCES users(uid) NOT NULL,
  date date NOT NULL,
  time time NOT NULL,
  description text NOT NULL,
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE appointments ENABLE ROW LEVEL SECURITY;

-- Appointment policies
CREATE POLICY "Clients can create appointments"
  ON appointments
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE uid = auth.uid()
      AND role = 'client'
    )
    AND client_id = auth.uid()
  );

CREATE POLICY "Users can read their own appointments"
  ON appointments
  FOR SELECT
  TO authenticated
  USING (
    client_id = auth.uid()
    OR artist_id = auth.uid()
  );

CREATE POLICY "Artists can update their appointments"
  ON appointments
  FOR UPDATE
  TO authenticated
  USING (
    artist_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM users
      WHERE uid = auth.uid()
      AND role = 'artist'
    )
  );