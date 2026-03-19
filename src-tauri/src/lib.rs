use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use std::fs;
use std::path::PathBuf;

// ============================================================
// Data Models
// ============================================================

#[derive(Serialize, Deserialize, Clone)]
pub struct McpServer {
    pub name: String,
    pub command: Option<String>,
    #[serde(rename = "serverUrl")]
    pub server_url: Option<String>,
    pub args: Option<Vec<String>>,
    pub env: Option<HashMap<String, String>>,
    pub headers: Option<HashMap<String, String>>,
    pub disabled: Option<bool>,
}

#[derive(Serialize, Deserialize)]
pub struct McpConfig {
    #[serde(rename = "mcpServers")]
    pub mcp_servers: HashMap<String, serde_json::Value>,
}

#[derive(Serialize, Clone)]
pub struct SkillInfo {
    pub name: String,
    pub description: String,
    pub path: String,
    pub has_skill_md: bool,
    pub size_bytes: u64,
}

#[derive(Serialize, Clone)]
pub struct WorkflowInfo {
    pub name: String,
    pub filename: String,
    pub path: String,
    pub size_bytes: u64,
    pub scope: String,
}

#[derive(Serialize, Clone)]
pub struct KnowledgeBaseInfo {
    pub name: String,
    pub path: String,
    pub artifact_count: usize,
    pub total_size_bytes: u64,
}

#[derive(Serialize, Clone)]
pub struct AgentInfo {
    pub name: String,
    pub path: String,
    pub category: String,
}

#[derive(Serialize, Clone)]
pub struct HookInfo {
    pub name: String,
    pub path: String,
    pub size_bytes: u64,
}

#[derive(Serialize)]
pub struct SystemHealth {
    pub hostname: String,
    pub os: String,
    pub mcp_server_count: usize,
    pub skill_count: usize,
    pub workflow_count: usize,
    pub knowledge_base_count: usize,
    pub agent_count: usize,
    pub hook_count: usize,
    pub conversation_count: usize,
    pub conversation_size_mb: f64,
    pub antigravity_exists: bool,
    pub agent_dir_exists: bool,
}

#[derive(Serialize, Deserialize)]
pub struct BrainSyncConfig {
    pub project_name: Option<String>,
    pub notebook_id: Option<String>,
    pub notebook_url: Option<String>,
    pub notebook_name: Option<String>,
    pub auto_sync: Option<bool>,
    pub sync_mode: Option<String>,
    pub last_sync: Option<String>,
    pub sync_count: Option<u32>,
}

#[derive(Serialize, Clone)]
pub struct GitStats {
    pub commits_this_week: usize,
    pub files_changed: usize,
    pub lines_added: usize,
    pub lines_removed: usize,
}

#[derive(Serialize, Clone)]
pub struct DocHealth {
    pub name: String,
    pub path: String,
    pub size_bytes: u64,
    pub last_modified: String,
    pub days_stale: i64,
}

#[derive(Serialize, Clone)]
pub struct MemoryFileInfo {
    pub name: String,
    pub size_bytes: u64,
    pub last_modified: String,
}

// ============================================================
// Path Helpers
// ============================================================

fn get_home_dir() -> PathBuf {
    dirs::home_dir().unwrap_or_else(|| PathBuf::from("C:\\Users\\Default"))
}

fn get_antigravity_dir() -> PathBuf {
    get_home_dir().join(".gemini").join("antigravity")
}

fn get_project_dir() -> PathBuf {
    let home = get_home_dir();
    let candidate = home.join("Documents").join("GitHub").join("AppXDevKit");
    if candidate.exists() {
        return candidate;
    }
    std::env::current_dir().unwrap_or(home)
}

// ============================================================
// Internal Helpers
// ============================================================

fn read_mcp_config_internal(ag_dir: &PathBuf) -> Option<McpConfig> {
    let path = ag_dir.join("mcp_config.json");
    let content = fs::read_to_string(&path).ok()?;
    serde_json::from_str(&content).ok()
}

fn count_dirs(dir: &PathBuf) -> usize {
    if !dir.exists() { return 0; }
    fs::read_dir(dir)
        .map(|entries| entries.filter_map(|e| e.ok()).filter(|e| e.path().is_dir()).count())
        .unwrap_or(0)
}

fn count_files_with_ext(dir: &PathBuf, ext: &str) -> usize {
    if !dir.exists() { return 0; }
    fs::read_dir(dir)
        .map(|entries| entries.filter_map(|e| e.ok())
            .filter(|e| e.path().extension().map(|ex| ex == ext).unwrap_or(false))
            .count())
        .unwrap_or(0)
}

fn count_non_md_files(dir: &PathBuf) -> usize {
    if !dir.exists() { return 0; }
    fs::read_dir(dir)
        .map(|entries| entries.filter_map(|e| e.ok())
            .filter(|e| e.path().is_file())
            .count())
        .unwrap_or(0)
}

fn count_files_recursive(dir: &PathBuf) -> usize {
    if !dir.exists() { return 0; }
    let mut count = 0;
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                count += 1;
            } else if path.is_dir() {
                count += count_files_recursive(&path);
            }
        }
    }
    count
}

fn dir_size(dir: &PathBuf) -> u64 {
    if !dir.exists() { return 0; }
    let mut size = 0u64;
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                size += entry.metadata().map(|m| m.len()).unwrap_or(0);
            } else if path.is_dir() {
                size += dir_size(&path);
            }
        }
    }
    size
}

fn extract_skill_description(path: &PathBuf) -> String {
    if let Ok(content) = fs::read_to_string(path) {
        if content.starts_with("---") {
            if let Some(end) = content[3..].find("---") {
                let frontmatter = &content[3..3 + end];
                for line in frontmatter.lines() {
                    if line.starts_with("description:") {
                        return line[12..].trim().to_string();
                    }
                }
            }
        }
        for line in content.lines().skip(1) {
            let trimmed = line.trim();
            if !trimmed.is_empty() && !trimmed.starts_with('#') && !trimmed.starts_with("---") {
                return trimmed.chars().take(120).collect();
            }
        }
    }
    String::new()
}

fn add_workflows_from_dir(dir: &PathBuf, scope: &str, workflows: &mut Vec<WorkflowInfo>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.extension().map(|e| e == "md").unwrap_or(false) {
                let filename = path.file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                let name = filename.trim_end_matches(".md").to_string();
                let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
                workflows.push(WorkflowInfo {
                    name: name.clone(),
                    filename: filename.clone(),
                    path: path.to_string_lossy().to_string(),
                    size_bytes: size,
                    scope: scope.to_string(),
                });
            }
        }
    }
}

fn collect_agents(dir: &PathBuf, category: &str, agents: &mut Vec<AgentInfo>) {
    if let Ok(entries) = fs::read_dir(dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() && path.extension().map(|e| e == "md").unwrap_or(false) {
                let name = path.file_stem()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                agents.push(AgentInfo {
                    name,
                    path: path.to_string_lossy().to_string(),
                    category: category.to_string(),
                });
            } else if path.is_dir() {
                let subcat = path.file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                collect_agents(&path, &subcat, agents);
            }
        }
    }
}

// ============================================================
// Tauri Commands  
// ============================================================

#[tauri::command]
fn get_system_health() -> Result<SystemHealth, String> {
    let ag_dir = get_antigravity_dir();
    let proj_dir = get_project_dir();
    let hostname = hostname::get()
        .map(|h| h.to_string_lossy().to_string())
        .unwrap_or_else(|_| "unknown".to_string());

    let mcp_count = read_mcp_config_internal(&ag_dir)
        .map(|c| c.mcp_servers.len())
        .unwrap_or(0);

    let skill_count = count_dirs(&ag_dir.join("skills"));

    let global_wf = count_files_with_ext(&ag_dir.join("global_workflows"), "md");
    let project_wf = count_files_with_ext(&proj_dir.join(".agent").join("workflows"), "md");

    let kb_count = count_dirs(&ag_dir.join("knowledge"));

    let agent_count = count_files_with_ext(&proj_dir.join(".agent").join("agents"), "md");

    let hook_count = count_non_md_files(&proj_dir.join(".agent").join("hooks"));

    let conv_dir = ag_dir.join("conversations");
    let (conv_count, conv_size) = if conv_dir.exists() {
        let entries: Vec<_> = fs::read_dir(&conv_dir)
            .map(|r| r.filter_map(|e| e.ok()).collect())
            .unwrap_or_default();
        let count = entries.iter().filter(|e| {
            e.path().extension().map(|ext| ext == "pb").unwrap_or(false)
        }).count();
        let size: u64 = entries.iter()
            .filter_map(|e| e.metadata().ok().map(|m| m.len()))
            .sum();
        (count, size as f64 / (1024.0 * 1024.0))
    } else {
        (0, 0.0)
    };

    Ok(SystemHealth {
        hostname,
        os: std::env::consts::OS.to_string(),
        mcp_server_count: mcp_count,
        skill_count,
        workflow_count: global_wf + project_wf,
        knowledge_base_count: kb_count,
        agent_count,
        hook_count,
        conversation_count: conv_count,
        conversation_size_mb: (conv_size * 100.0).round() / 100.0,
        antigravity_exists: ag_dir.exists(),
        agent_dir_exists: proj_dir.join(".agent").exists(),
    })
}

#[tauri::command]
fn get_mcp_config() -> Result<String, String> {
    let ag_dir = get_antigravity_dir();
    let path = ag_dir.join("mcp_config.json");
    fs::read_to_string(&path).map_err(|e| format!("Failed to read MCP config: {}", e))
}

#[tauri::command]
fn save_mcp_config(content: String) -> Result<(), String> {
    serde_json::from_str::<serde_json::Value>(&content)
        .map_err(|e| format!("Invalid JSON: {}", e))?;

    let ag_dir = get_antigravity_dir();
    let path = ag_dir.join("mcp_config.json");

    let backup_path = ag_dir.join("mcp_config.json.bak");
    if path.exists() {
        let _ = fs::copy(&path, &backup_path);
    }

    fs::write(&path, &content).map_err(|e| format!("Failed to save: {}", e))
}

#[tauri::command]
fn toggle_mcp_server(server_name: String, enabled: bool) -> Result<String, String> {
    let ag_dir = get_antigravity_dir();
    let path = ag_dir.join("mcp_config.json");
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read: {}", e))?;
    
    let mut config: serde_json::Value = serde_json::from_str(&content)
        .map_err(|e| format!("Invalid JSON: {}", e))?;

    if let Some(servers) = config.get_mut("mcpServers") {
        if let Some(server) = servers.get_mut(&server_name) {
            if !enabled {
                server.as_object_mut()
                    .ok_or("Server is not an object")?
                    .insert("disabled".to_string(), serde_json::Value::Bool(true));
            } else {
                server.as_object_mut()
                    .ok_or("Server is not an object")?
                    .remove("disabled");
            }
        }
    }

    let result = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize: {}", e))?;

    let backup_path = ag_dir.join("mcp_config.json.bak");
    let _ = fs::copy(&path, &backup_path);

    fs::write(&path, &result).map_err(|e| format!("Failed to save: {}", e))?;
    Ok(result)
}

#[tauri::command]
fn get_rule_file(filename: String) -> Result<String, String> {
    let proj_dir = get_project_dir();
    let path = proj_dir.join(&filename);
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read {}: {}", filename, e))
}

#[tauri::command]
fn save_rule_file(filename: String, content: String) -> Result<(), String> {
    let proj_dir = get_project_dir();
    let path = proj_dir.join(&filename);

    if path.exists() {
        let backup = proj_dir.join(format!("{}.bak", filename));
        let _ = fs::copy(&path, &backup);
    }

    fs::write(&path, &content)
        .map_err(|e| format!("Failed to save {}: {}", filename, e))
}

#[tauri::command]
fn list_skills() -> Result<Vec<SkillInfo>, String> {
    let ag_dir = get_antigravity_dir();
    let skills_dir = ag_dir.join("skills");
    let mut skills = Vec::new();

    if !skills_dir.exists() {
        return Ok(skills);
    }

    if let Ok(entries) = fs::read_dir(&skills_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_dir() {
                let name = path.file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();

                let skill_md_path = path.join("SKILL.md");
                let has_skill = skill_md_path.exists();
                let description = if has_skill {
                    extract_skill_description(&skill_md_path)
                } else {
                    String::new()
                };
                let size = dir_size(&path);

                skills.push(SkillInfo {
                    name,
                    description,
                    path: path.to_string_lossy().to_string(),
                    has_skill_md: has_skill,
                    size_bytes: size,
                });
            }
        }
    }

    skills.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(skills)
}

#[tauri::command]
fn get_skill_content(name: String) -> Result<String, String> {
    let ag_dir = get_antigravity_dir();
    let path = ag_dir.join("skills").join(&name).join("SKILL.md");
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read skill {}: {}", name, e))
}

#[tauri::command]
fn list_workflows() -> Result<Vec<WorkflowInfo>, String> {
    let ag_dir = get_antigravity_dir();
    let proj_dir = get_project_dir();
    let mut workflows = Vec::new();

    let global_dir = ag_dir.join("global_workflows");
    if global_dir.exists() {
        add_workflows_from_dir(&global_dir, "global", &mut workflows);
    }

    let project_dir = proj_dir.join(".agent").join("workflows");
    if project_dir.exists() {
        add_workflows_from_dir(&project_dir, "project", &mut workflows);
    }

    workflows.sort_by(|a, b| a.name.cmp(&b.name));
    workflows.dedup_by(|a, b| a.name == b.name);
    Ok(workflows)
}

#[tauri::command]
fn get_workflow_content(name: String, scope: String) -> Result<String, String> {
    let dir = if scope == "global" {
        get_antigravity_dir().join("global_workflows")
    } else {
        get_project_dir().join(".agent").join("workflows")
    };
    let path = dir.join(&name);
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read workflow {}: {}", name, e))
}

#[tauri::command]
fn list_knowledge_bases() -> Result<Vec<KnowledgeBaseInfo>, String> {
    let ag_dir = get_antigravity_dir();
    let kb_dir = ag_dir.join("knowledge");
    let mut kbs = Vec::new();

    if !kb_dir.exists() {
        return Ok(kbs);
    }

    if let Ok(entries) = fs::read_dir(&kb_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_dir() {
                let name = path.file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();

                let artifacts_dir = path.join("artifacts");
                let artifact_count = if artifacts_dir.exists() {
                    count_files_recursive(&artifacts_dir)
                } else {
                    0
                };

                let total_size = dir_size(&path);

                kbs.push(KnowledgeBaseInfo {
                    name,
                    path: path.to_string_lossy().to_string(),
                    artifact_count,
                    total_size_bytes: total_size,
                });
            }
        }
    }

    kbs.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(kbs)
}

#[tauri::command]
fn get_brain_sync_config() -> Result<String, String> {
    let proj_dir = get_project_dir();
    let path = proj_dir.join(".agent").join("brain-sync.json");
    if path.exists() {
        fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read brain-sync.json: {}", e))
    } else {
        Ok("{}".to_string())
    }
}

#[tauri::command]
fn list_agents() -> Result<Vec<AgentInfo>, String> {
    let proj_dir = get_project_dir();
    let agents_dir = proj_dir.join(".agent").join("agents");
    let mut agents = Vec::new();

    if !agents_dir.exists() {
        return Ok(agents);
    }

    collect_agents(&agents_dir, "root", &mut agents);
    agents.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(agents)
}

#[tauri::command]
fn list_hooks() -> Result<Vec<HookInfo>, String> {
    let proj_dir = get_project_dir();
    let hooks_dir = proj_dir.join(".agent").join("hooks");
    let mut hooks = Vec::new();

    if !hooks_dir.exists() {
        return Ok(hooks);
    }

    if let Ok(entries) = fs::read_dir(&hooks_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                let name = path.file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                let size = entry.metadata().map(|m| m.len()).unwrap_or(0);
                hooks.push(HookInfo {
                    name,
                    path: path.to_string_lossy().to_string(),
                    size_bytes: size,
                });
            }
        }
    }

    hooks.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(hooks)
}

#[tauri::command]
fn get_memory_file(filename: String) -> Result<String, String> {
    let proj_dir = get_project_dir();
    let path = proj_dir.join(".agent").join("memory").join(&filename);
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read {}: {}", filename, e))
}

#[tauri::command]
fn save_memory_file(filename: String, content: String) -> Result<(), String> {
    let proj_dir = get_project_dir();
    let mem_dir = proj_dir.join(".agent").join("memory");
    if !mem_dir.exists() {
        fs::create_dir_all(&mem_dir).map_err(|e| format!("Failed to create dir: {}", e))?;
    }
    let path = mem_dir.join(&filename);
    // backup
    if path.exists() {
        let backup = mem_dir.join(format!("{}.bak", filename));
        let _ = fs::copy(&path, &backup);
    }
    fs::write(&path, &content).map_err(|e| format!("Failed to save {}: {}", filename, e))
}

#[tauri::command]
fn list_memory_files() -> Result<Vec<MemoryFileInfo>, String> {
    let proj_dir = get_project_dir();
    let mem_dir = proj_dir.join(".agent").join("memory");
    let mut files = Vec::new();

    if let Ok(entries) = fs::read_dir(&mem_dir) {
        for entry in entries.filter_map(|e| e.ok()) {
            let path = entry.path();
            if path.is_file() {
                let name = path.file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                let meta = entry.metadata().ok();
                let size = meta.as_ref().map(|m| m.len()).unwrap_or(0);
                let modified = meta.and_then(|m| m.modified().ok())
                    .map(|t| {
                        let duration = t.duration_since(std::time::UNIX_EPOCH).unwrap_or_default();
                        let secs = duration.as_secs();
                        format!("{}", secs)
                    })
                    .unwrap_or_default();
                files.push(MemoryFileInfo {
                    name,
                    size_bytes: size,
                    last_modified: modified,
                });
            }
        }
    }

    files.sort_by(|a, b| a.name.cmp(&b.name));
    Ok(files)
}

#[tauri::command]
fn get_agent_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read agent: {}", e))
}

#[tauri::command]
fn get_hook_content(path: String) -> Result<String, String> {
    fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read hook: {}", e))
}

#[tauri::command]
fn get_design_md() -> Result<String, String> {
    let proj_dir = get_project_dir();
    let path = proj_dir.join(".agent").join("memory").join("DESIGN.md");
    if path.exists() {
        fs::read_to_string(&path)
            .map_err(|e| format!("Failed to read DESIGN.md: {}", e))
    } else {
        Ok(String::new())
    }
}

#[tauri::command]
fn save_design_md(content: String) -> Result<(), String> {
    let proj_dir = get_project_dir();
    let mem_dir = proj_dir.join(".agent").join("memory");
    if !mem_dir.exists() {
        fs::create_dir_all(&mem_dir).map_err(|e| format!("Failed to create dir: {}", e))?;
    }
    let path = mem_dir.join("DESIGN.md");
    if path.exists() {
        let backup = mem_dir.join("DESIGN.md.bak");
        let _ = fs::copy(&path, &backup);
    }
    fs::write(&path, &content).map_err(|e| format!("Failed to save DESIGN.md: {}", e))
}

#[tauri::command]
fn get_git_stats() -> Result<GitStats, String> {
    let proj_dir = get_project_dir();
    // Try to run git log for this week
    let output = std::process::Command::new("git")
        .args(["log", "--since=1 week ago", "--oneline"])
        .current_dir(&proj_dir)
        .output();

    let commits = match &output {
        Ok(o) => String::from_utf8_lossy(&o.stdout).lines().count(),
        Err(_) => 0,
    };

    let diff_output = std::process::Command::new("git")
        .args(["diff", "--stat", "HEAD~10", "--", "."])
        .current_dir(&proj_dir)
        .output();

    let (mut files, mut added, mut removed) = (0usize, 0usize, 0usize);
    if let Ok(o) = &diff_output {
        let text = String::from_utf8_lossy(&o.stdout);
        for line in text.lines() {
            if line.contains("|") && (line.contains("+") || line.contains("-")) {
                files += 1;
            }
            if let Some(summary) = text.lines().last() {
                if summary.contains("insertion") {
                    if let Some(num) = summary.split_whitespace().nth(3) {
                        added = num.parse().unwrap_or(0);
                    }
                }
                if summary.contains("deletion") {
                    for (i, word) in summary.split_whitespace().enumerate() {
                        if word.contains("deletion") {
                            if let Some(num) = summary.split_whitespace().nth(i - 1) {
                                removed = num.parse().unwrap_or(0);
                            }
                        }
                    }
                }
            }
        }
    }

    Ok(GitStats {
        commits_this_week: commits,
        files_changed: files,
        lines_added: added,
        lines_removed: removed,
    })
}

#[tauri::command]
fn list_docs_health() -> Result<Vec<DocHealth>, String> {
    let proj_dir = get_project_dir();
    let mut docs = Vec::new();

    // Check common doc locations
    let doc_paths = vec![
        proj_dir.join("README.md"),
        proj_dir.join("CHANGELOG.md"),
        proj_dir.join(".agent").join("docs").join("progress").join("current-status.md"),
        proj_dir.join(".agent").join("docs").join("progress").join("changelog.md"),
        proj_dir.join(".agent").join("docs").join("progress").join("decisions.md"),
        proj_dir.join(".agent").join("memory").join("DESIGN.md"),
        proj_dir.join(".agent").join("memory").join("active_context.md"),
        proj_dir.join("PROJECT_KNOWLEDGE.md"),
    ];

    let now = std::time::SystemTime::now();

    for path in doc_paths {
        if path.exists() {
            if let Ok(meta) = fs::metadata(&path) {
                let name = path.file_name()
                    .map(|n| n.to_string_lossy().to_string())
                    .unwrap_or_default();
                let modified = meta.modified().unwrap_or(now);
                let elapsed = now.duration_since(modified).unwrap_or_default();
                let days = (elapsed.as_secs() / 86400) as i64;
                let modified_str = format!("{} days ago", days);

                docs.push(DocHealth {
                    name,
                    path: path.to_string_lossy().to_string(),
                    size_bytes: meta.len(),
                    last_modified: modified_str,
                    days_stale: days,
                });
            }
        }
    }

    docs.sort_by(|a, b| b.days_stale.cmp(&a.days_stale));
    Ok(docs)
}

// ============================================================
// Tauri App Entry Point
// ============================================================

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_process::init())
        .invoke_handler(tauri::generate_handler![
            get_system_health,
            get_mcp_config,
            save_mcp_config,
            toggle_mcp_server,
            get_rule_file,
            save_rule_file,
            list_skills,
            get_skill_content,
            list_workflows,
            get_workflow_content,
            list_knowledge_bases,
            get_brain_sync_config,
            list_agents,
            list_hooks,
            get_memory_file,
            save_memory_file,
            list_memory_files,
            get_agent_content,
            get_hook_content,
            get_design_md,
            save_design_md,
            get_git_stats,
            list_docs_health,
        ])
        .run(tauri::generate_context!())
        .expect("error while running AG Tower");
}
