import { getDb } from "./db";
import { v4 as uuidv4 } from 'uuid';

export interface Skill {
  id: string;
  name: string;
  original_description: string;
  chinese_notes: string;
  path: string;
  created_at: string;
  enabled?: boolean;
  categories?: string[];
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color: string;
  count?: number;
}

export async function getAllSkills(platformId: string = 'claude'): Promise<Skill[]> {
  const db = await getDb();
  const skills = await db.select<any[]>(`
    SELECT s.*, 
    (SELECT enabled FROM skill_platform_status WHERE skill_id = s.id AND platform_id = ?) as enabled
    FROM skills s
  `, [platformId]);

  for (const skill of skills) {
    const cats = await db.select<any[]>(
      "SELECT category_id FROM skill_categories WHERE skill_id = ?",
      [skill.id]
    );
    skill.categories = cats.map(c => c.category_id);
    skill.enabled = skill.enabled === 1;
  }

  return skills;
}

export async function getSkillsByCategory(categoryId: string, platformId: string = 'claude'): Promise<Skill[]> {
  const db = await getDb();
  let query = "";
  let params: any[] = [platformId];

  if (categoryId === 'all') {
    query = `
      SELECT s.*, 
      (SELECT enabled FROM skill_platform_status WHERE skill_id = s.id AND platform_id = ?) as enabled
      FROM skills s
    `;
  } else {
    query = `
      SELECT s.*, 
      (SELECT enabled FROM skill_platform_status WHERE skill_id = s.id AND platform_id = ?) as enabled
      FROM skills s
      JOIN skill_categories sc ON s.id = sc.skill_id
      WHERE sc.category_id = ?
    `;
    params.push(categoryId);
  }

  const skills = await db.select<any[]>(query, params);
  
  for (const skill of skills) {
    const cats = await db.select<any[]>(
      "SELECT category_id FROM skill_categories WHERE skill_id = ?",
      [skill.id]
    );
    skill.categories = cats.map(c => c.category_id);
    skill.enabled = skill.enabled === 1;
  }

  return skills;
}

export async function toggleSkillStatus(skillId: string, platformId: string, enabled: boolean) {
  const db = await getDb();
  await db.execute(`
    INSERT INTO skill_platform_status (skill_id, platform_id, enabled)
    VALUES (?, ?, ?)
    ON CONFLICT(skill_id, platform_id) DO UPDATE SET enabled = excluded.enabled
  `, [skillId, platformId, enabled ? 1 : 0]);
}

export async function getAllCategories(): Promise<Category[]> {
  const db = await getDb();
  const categories = await db.select<any[]>("SELECT * FROM categories");
  
  for (const cat of categories) {
    const countResult = await db.select<any[]>(
      "SELECT COUNT(*) as count FROM skill_categories WHERE category_id = ?",
      [cat.id]
    );
    cat.count = countResult[0].count;
  }
  
  return categories;
}

export async function addCategory(name: string, description: string = "", color: string = "") {
  const db = await getDb();
  const id = uuidv4();
  await db.execute(
    "INSERT INTO categories (id, name, description, color) VALUES (?, ?, ?, ?)",
    [id, name, description, color]
  );
  return id;
}

export async function importSkill(name: string, desc: string, path: string, categoryIds: string[] = ['unclassified']) {
  const db = await getDb();
  const id = uuidv4();
  
  await db.execute(
    "INSERT INTO skills (id, name, original_description, path) VALUES (?, ?, ?, ?)",
    [id, name, desc, path]
  );
  
  for (const catId of categoryIds) {
    await db.execute(
      "INSERT INTO skill_categories (skill_id, category_id) VALUES (?, ?)",
      [id, catId]
    );
  }
  
  return id;
}
