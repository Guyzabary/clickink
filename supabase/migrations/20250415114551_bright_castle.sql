/*
  # Initial Schema Setup

  1. Tables
    - users
      - uid (text, primary key)
      - email (text, unique)
      - full_name (text)
      - role (text)
      - studio_name (text, nullable)
      - city (text, nullable)
      - address (text, nullable)
      - styles (text[], nullable)
      - followed_artists (text[], default '{}')
      - created_at (timestamptz)

    - posts
      - id (uuid, primary key)
      - artist_id (text, references users)
      - title (text)
      - description (text)
      - image_url (text)
      - created_at (timestamptz)
      - likes (text[], default '{}')
      - comments (jsonb[], default '[]')

  2. Security
    - Enable RLS on all tables
    - Set up policies for user access
    - Set up policies for post management
*/

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  uid text PRIMARY KEY,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  role text NOT NULL CHECK (role IN ('client', 'artist')),
  studio_name text,
  city text,
  address text,
  styles text[],
  followed_artists text[] DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Create posts table
CREATE TABLE IF NOT EXISTS posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  artist_id text REFERENCES users(uid) NOT NULL,
  title text NOT NULL,
  description text NOT NULL,
  image_url text NOT NULL,
  created_at timestamptz DEFAULT now(),
  likes text[] DEFAULT '{}',
  comments jsonb[] DEFAULT '[]'
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Users policies
CREATE POLICY "Users can read their own data"
  ON users
  FOR SELECT
  TO authenticated
  USING (auth.uid() = uid);

CREATE POLICY "Users can update their own data"
  ON users
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = uid);

-- Posts policies
CREATE POLICY "Anyone can read posts"
  ON posts
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Artists can create posts"
  ON posts
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE uid = auth.uid()
      AND role = 'artist'
    )
    AND artist_id = auth.uid()
  );

CREATE POLICY "Artists can update their own posts"
  ON posts
  FOR UPDATE
  TO authenticated
  USING (artist_id = auth.uid());

CREATE POLICY "Artists can delete their own posts"
  ON posts
  FOR DELETE
  TO authenticated
  USING (artist_id = auth.uid());