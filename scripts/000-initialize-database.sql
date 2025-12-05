-- Create agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  avatar TEXT DEFAULT '🤖',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create conversations table
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT,
  agent_id UUID REFERENCES agents(id),
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES conversations(id) ON DELETE CASCADE,
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Create policies for anonymous access (demo mode)
CREATE POLICY "Allow anonymous read agents" ON agents FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert agents" ON agents FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous read conversations" ON conversations FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert conversations" ON conversations FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Allow anonymous read messages" ON messages FOR SELECT TO anon USING (true);
CREATE POLICY "Allow anonymous insert messages" ON messages FOR INSERT TO anon WITH CHECK (true);

-- Seed demo agents
INSERT INTO agents (name, role, avatar) VALUES
  ('Quantum Researcher', 'Research & Analysis', '🔬'),
  ('Ethics Advisor', 'Ethical Guidance', '⚖️'),
  ('Strategy Sage', 'Strategic Planning', '🎯'),
  ('Code Architect', 'Software Development', '💻'),
  ('Creative Muse', 'Creative Writing', '✨')
ON CONFLICT DO NOTHING;
