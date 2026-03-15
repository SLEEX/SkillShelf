use std::path::Path;

#[tauri::command]
fn create_skill_symlink(target: String, link: String) -> Result<(), String> {
    let target_path = Path::new(&target);
    let link_path = Path::new(&link);

    // Remove existing link if it exists
    if link_path.exists() {
        if link_path.is_dir() {
            std::fs::remove_dir(link_path).map_err(|e| e.to_string())?;
        } else {
            std::fs::remove_file(link_path).map_err(|e| e.to_string())?;
        }
    }

    #[cfg(target_os = "windows")]
    {
        use std::os::windows::fs::symlink_dir;
        symlink_dir(target_path, link_path).map_err(|e| e.to_string())?;
    }

    #[cfg(not(target_os = "windows"))]
    {
        use std::os::unix::fs::symlink;
        symlink(target_path, link_path).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
fn remove_skill_symlink(link: String) -> Result<(), String> {
    let link_path = Path::new(&link);
    if link_path.exists() {
        if link_path.is_dir() {
            std::fs::remove_dir(link_path).map_err(|e| e.to_string())?;
        } else {
            std::fs::remove_file(link_path).map_err(|e| e.to_string())?;
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .plugin(tauri_plugin_sql::Builder::default().build())
    .plugin(tauri_plugin_shell::init())
    .plugin(tauri_plugin_fs::init())
    .plugin(tauri_plugin_dialog::init())
    .invoke_handler(tauri::generate_handler![create_skill_symlink, remove_skill_symlink])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
