import { readDir, mkdir, copyFile, readFile, exists } from '@tauri-apps/plugin-fs';
import { join, basename } from '@tauri-apps/api/path';
import { getDb } from './db';
import { importSkill } from './skillService';

async function copyRecursive(src: string, dest: string) {
  await mkdir(dest, { recursive: true });
  const entries = await readDir(src);
  
  for (const entry of entries) {
    const srcPath = await join(src, entry.name);
    const destPath = await join(dest, entry.name);
    
    if (entry.isDirectory) {
      await copyRecursive(srcPath, destPath);
    } else {
      await copyFile(srcPath, destPath);
    }
  }
}

async function extractSkillMetadata(path: string) {
  let name = await basename(path);
  let description = "";
  
  // Try to find SKILL.md or README.md
  const files = ['SKILL.md', 'skill.md', 'README.md', 'readme.md'];
  for (const f of files) {
    const filePath = await join(path, f);
    if (await exists(filePath)) {
      const content = await readFile(filePath).then(b => new TextDecoder().decode(b));
      const nameMatch = content.match(/^#\s+(.*)$/m);
      if (nameMatch) name = nameMatch[1].trim();
      const lines = content.split('\n').filter(l => l.trim() && !l.startsWith('#'));
      if (lines.length > 0) description = lines[0].trim();
      break;
    }
  }
  
  return { name, description };
}

export async function scanLocalLibrary() {
  const db = await getDb();
  const settings = await db.select<any[]>("SELECT value FROM settings WHERE key = 'base_path'");
  if (settings.length === 0 || !settings[0].value) throw new Error("未配置本地存储目录");
  
  const basePath = settings[0].value;
  const entries = await readDir(basePath);
  let importedCount = 0;

  for (const entry of entries) {
    if (!entry.isDirectory) continue;
    
    const skillPath = await join(basePath, entry.name);
    
    // Check if already in DB
    const existing = await db.select<any[]>("SELECT id FROM skills WHERE path = ?", [skillPath]);
    if (existing.length > 0) continue;

    // Check if it's a valid skill
    const hasSkillMd = await exists(await join(skillPath, 'SKILL.md')) || 
                      await exists(await join(skillPath, 'skill.md')) ||
                      await exists(await join(skillPath, 'README.md'));
    
    if (hasSkillMd) {
      const { name, description } = await extractSkillMetadata(skillPath);
      await importSkill(name, description, skillPath);
      importedCount++;
    }
  }

  return importedCount;
}

export async function scanAndImportSkills() {
  const db = await getDb();
  const settings = await db.select<any[]>("SELECT * FROM settings");
  const settingsMap = settings.reduce((acc, curr) => ({ ...acc, [curr.key]: curr.value }), {});
  
  const basePath = settingsMap['base_path'];
  if (!basePath) throw new Error("未配置本地存储目录");

  const platformPaths = [
    { id: 'claude', path: settingsMap['claude_path'] },
    { id: 'codex', path: settingsMap['codex_path'] }
  ].filter(p => p.path);

  let importedCount = 0;

  for (const platform of platformPaths) {
    if (!platform.path) continue;
    
    try {
      if (!(await exists(platform.path))) continue;
      
      const entries = await readDir(platform.path);
      for (const entry of entries) {
        if (!entry.isDirectory) continue;
        
        const skillSrcPath = await join(platform.path, entry.name);
        
        // Check if it looks like a skill (contains SKILL.md or README.md)
        const hasSkillMd = await exists(await join(skillSrcPath, 'SKILL.md')) || 
                          await exists(await join(skillSrcPath, 'skill.md')) ||
                          await exists(await join(skillSrcPath, 'README.md'));
        
        if (hasSkillMd) {
          // Check if already imported (by path or name)
          const existing = await db.select<any[]>("SELECT id FROM skills WHERE name = ?", [entry.name]);
          if (existing.length > 0) continue;

          // 1. Copy to local storage
          const skillDestPath = await join(basePath, entry.name);
          await copyRecursive(skillSrcPath, skillDestPath);
          
          // 2. Extract metadata
          const { name, description } = await extractSkillMetadata(skillDestPath);
          
          // 3. Register in DB
          await importSkill(name, description, skillDestPath);
          importedCount++;
        }
      }
    } catch (err) {
      console.error(`Error scanning ${platform.id}:`, err);
    }
  }

  return importedCount;
}
