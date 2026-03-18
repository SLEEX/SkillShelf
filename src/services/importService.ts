import { open } from "@tauri-apps/plugin-dialog";
import { readFile, writeFile, mkdir } from "@tauri-apps/plugin-fs";
import JSZip from "jszip";
import { getDb } from "./db";
import { importSkill } from "./skillService";
import { join, basename } from "@tauri-apps/api/path";

export async function pickAndImportSkill() {
  const db = await getDb();
  const settings = await db.select<any[]>(
    "SELECT value FROM settings WHERE key = 'base_path'",
  );

  if (settings.length === 0 || !settings[0].value) {
    throw new Error("请先在设置中配置本地存储目录");
  }

  const basePath = settings[0].value;

  const selected = await open({
    multiple: false,
    filters: [
      {
        name: "Skill Archive",
        extensions: ["zip"],
      },
    ],
  });

  if (!selected || Array.isArray(selected)) return null;

  const zipPath = selected;
  const zipName = await basename(zipPath, ".zip");
  const zipData = await readFile(zipPath);

  const zip = await JSZip.loadAsync(zipData);

  let name = zipName;
  let description = "";

  // Try to find SKILL.md or README.md
  const skillFile = zip.file(/SKILL\.md$/i)[0] || zip.file(/README\.md$/i)[0];
  if (!skillFile) {
    throw new Error(
      "导入失败：请导入带有 SKILL.md 或 README.md 的 Skill 压缩包",
    );
  }

  const content = await skillFile.async("string");
  const nameMatch = content.match(/^#\s+(.*)$/m);
  if (nameMatch) name = nameMatch[1].trim();
  const lines = content
    .split("\n")
    .filter((l) => l.trim() && !l.startsWith("#"));
  if (lines.length > 0) description = lines[0].trim();

  // Create target directory
  const targetDir = await join(basePath, zipName);
  await mkdir(targetDir, { recursive: true });

  // Extract all files
  for (const [filename, file] of Object.entries(zip.files)) {
    if (file.dir) {
      await mkdir(await join(targetDir, filename), { recursive: true });
    } else {
      const data = await file.async("uint8array");
      await writeFile(await join(targetDir, filename), data);
    }
  }

  // Add to DB
  const id = await importSkill(name, description, targetDir);

  return { id, name };
}
