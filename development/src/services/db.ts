import Database from "@tauri-apps/plugin-sql";

let db: Database | null = null;

export async function getDb() {
  if (db) return db;
  db = await Database.load("sqlite:skillshelf.db");
  return db;
}

export async function initDb() {
  const database = await getDb();

  // 1. Create skills table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS skills (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      original_description TEXT,
      chinese_notes TEXT,
      path TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 2. Create categories table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      color TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Migration: Add icon column if it doesn't exist
  try {
    await database.execute("ALTER TABLE categories ADD COLUMN icon TEXT");
  } catch (e) {
    // Column might already exist, ignore error
  }

  // 3. Create skill_categories mapping table (Many-to-Many)
  await database.execute(`
    CREATE TABLE IF NOT EXISTS skill_categories (
      skill_id TEXT NOT NULL,
      category_id TEXT NOT NULL,
      PRIMARY KEY (skill_id, category_id),
      FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE,
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    )
  `);

  // 4. Create skill_platform_status table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS skill_platform_status (
      skill_id TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      enabled BOOLEAN DEFAULT 0,
      PRIMARY KEY (skill_id, platform_id),
      FOREIGN KEY (skill_id) REFERENCES skills (id) ON DELETE CASCADE
    )
  `);

  // 5. Create category_platform_status table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS category_platform_status (
      category_id TEXT NOT NULL,
      platform_id TEXT NOT NULL,
      enabled BOOLEAN DEFAULT 0,
      PRIMARY KEY (category_id, platform_id),
      FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE CASCADE
    )
  `);

  // 6. Create settings table
  await database.execute(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Insert default category "未分类"
  const unclassified = await database.select<any[]>(
    "SELECT * FROM categories WHERE id = 'unclassified'"
  );
  if (unclassified.length === 0) {
    await database.execute(
      "INSERT INTO categories (id, name, description) VALUES ('unclassified', '未分类', '默认分类')"
    );
  }

  return database;
}
