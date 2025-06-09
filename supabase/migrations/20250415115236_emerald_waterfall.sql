/*
  # Chat System Schema

  1. New Tables
    - chats
      - id (uuid, primary key)
      - created_at (timestamptz)
      - updated_at (timestamptz)
      - participants (text[], for user IDs)
      - last_message (text)
      - last_message_at (timestamptz)

    - messages
      - id (uuid, primary key)
      - chat_id (uuid, references chats)
      - sender_id (text, references users)
      - content (text)
      - created_at (timestamptz)

  2. Security
    - Enable RLS on both tables
    - Users can only access chats they're part of
    - Users can only read/write messages in their chats
*/

-- Create chats table
CREATE TABLE IF NOT EXISTS chats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  participants text[] NOT NULL,
  last_message text,
  last_message_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id uuid REFERENCES chats(id) ON DELETE CASCADE NOT NULL,
  sender_id text REFERENCES users(uid) NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Chat policies
CREATE POLICY "Users can access their chats"
  ON chats
  FOR ALL
  TO authenticated
  USING (auth.uid() = ANY(participants));

-- Message policies
CREATE POLICY "Users can access messages in their chats"
  ON messages
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM chats
      WHERE chats.id = messages.chat_id
      AND auth.uid() = ANY(chats.participants)
    )
  );

-- Function to update chat's last message
CREATE OR REPLACE FUNCTION update_chat_last_message()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chats
  SET last_message = NEW.content,
      last_message_at = NEW.created_at,
      updated_at = now()
  WHERE id = NEW.chat_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update chat's last message
CREATE TRIGGER update_chat_last_message_trigger
AFTER INSERT ON messages
FOR EACH ROW
EXECUTE FUNCTION update_chat_last_message();