export const QUICKSTART = `liminaldb — CLI for prompt & skill management

Auth:
  liminaldb login                       OAuth device flow (opens browser)
  liminaldb logout                      Clear stored credentials
  liminaldb whoami                      Show current user
  LIMINALDB_API_KEY=<key>               Skip OAuth, use API key

Prompts:
  liminaldb prompts list                List all prompts (ranked)
  liminaldb prompts list --tags code    Filter by tag
  liminaldb prompts search <query>      Full-text search
  liminaldb prompts get <slug>          Get prompt by slug
  liminaldb prompts save --slug my-prompt --name "My Prompt" \\
    --description "Does X" --content "..." --tags code,workflow
  liminaldb prompts save --stdin        Read prompt JSON from stdin
  liminaldb prompts update <slug> --name "New Name"
  liminaldb prompts delete <slug>       Delete prompt
  liminaldb prompts use <slug>          Track usage

Import/Export:
  liminaldb prompts export              Export all as YAML
  liminaldb prompts import <file.yaml>  Import from YAML
  liminaldb prompts import --preview <file.yaml>

Tags:
  liminaldb tags list                   List all available tags

Preferences:
  liminaldb prefs get                   Get theme preference
  liminaldb prefs set --surface vscode --theme dark-1

Health:
  liminaldb health                      Check service status

Global flags:
  --json      Structured JSON output
  --verbose   Detailed output
  --url       Override API base URL
  --help      Full help for any command

Env vars:
  LIMINALDB_API_KEY        Bearer token (skips OAuth)
  LIMINALDB_URL            API base URL (default: https://liminaldb.com)
  LIMINALDB_OUTPUT_FORMAT  "json" or "human"
  LIMINALDB_VERBOSE        "1" or "true"

Config files: .liminaldbrc, .liminaldbrc.json, liminaldb.config.ts
Token storage: ~/.config/liminaldb/tokens.json
`;
