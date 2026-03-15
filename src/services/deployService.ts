import { invoke } from "@tauri-apps/api/core";
import { getDb } from "./db";
import { join, basename } from "@tauri-apps/api/path";
import { getSkillsByCategory } from "./skillService";

export async function deployCategoryToPlatform(categoryId: string, platformId: string) {
  const db = await getDb();
  
  // 1. Get platform path from settings
  const settings = await db.select<any[]>(
    "SELECT value FROM settings WHERE key = ?",
    [`${platformId}_path`]
  );
  
  if (settings.length === 0 || !settings[0].value) {
    throw new Error(`请先在设置中配置 ${platformId} 的 Skill 目录`);
  }
  
  const platformPath = settings[0].value;

  // 2. Get all skills in this category
  const skills = await getSkillsByCategory(categoryId, platformId);
  
  // 3. Get category enabled status
  const catStatus = await db.select<any[]>(
    "SELECT enabled FROM category_platform_status WHERE category_id = ? AND platform_id = ?",
    [categoryId, platformId]
  );
  const isCategoryEnabled = catStatus.length > 0 && catStatus[0].enabled === 1;

  // 4. Process each skill
  for (const skill of skills) {
    const skillName = await basename(skill.path);
    const linkPath = await join(platformPath, skillName);
    
    if (isCategoryEnabled && skill.enabled) {
      // Create symlink
      await invoke("create_skill_symlink", { 
        target: skill.path, 
        link: linkPath 
      });
    } else {
      // Remove symlink
      await invoke("remove_skill_symlink", { 
        link: linkPath 
      });
    }
  }
}

export async function toggleCategoryDeployment(categoryId: string, platformId: string, enabled: boolean) {
  const db = await getDb();
  await db.execute(`
    INSERT INTO category_platform_status (category_id, platform_id, enabled)
    VALUES (?, ?, ?)
    ON CONFLICT(category_id, platform_id) DO UPDATE SET enabled = excluded.enabled
  `, [categoryId, platformId, enabled ? 1 : 0]);
  
  await deployCategoryToPlatform(categoryId, platformId);
}
