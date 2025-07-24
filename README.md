# AI-Powered Code Documentation Tool

This tool automatically scans your codebase for functions that are missing documentation or have existing documentation, and intelligently generates or improves them using AI.

**Two ways to use it:**
- 🔄 **GitHub Action**: Continuously improve documentation in your CI/CD pipeline
- 🚀 **CLI Tool**: Run directly on any codebase without setup (perfect for large existing projects)

The action uses [GenAIScript](https://microsoft.github.io/genaiscript/) and [AST-GREP](https://ast-grep.github.io/).

> [!NOTE]
> This action uses GitHub Models for LLM inference. It really assumes you are using [GitHub Models at scale](https://docs.github.com/en/github-models/github-models-at-scale/use-models-at-scale).

You must set "Allow GitHub Actions to create and approve pull requests" in your repository settings to allow the action to create pull requests with documentation updates.

## Supported languages:

- TypeScript: `.ts`, `.tsx`, `.mts`, `.cts`
- Python: `.py`
- C#: `.cs`

## Inputs

- `github_token`: GitHub token with `models: read` permission at least. (required)
- `model`: The model to use for generating documentation. (default: `github:openai/gpt-4.1-mini`)
- `files`: The files to process, in glob format. (default: `**/src/**/*.{,py}`)
- `kinds`: Comma-separated list of kinds of entities to process: module,type,function,property,variable. (default: all but variable)
- `exports_only`: If true, only process exported entities. (default: `false`)
- `update_existing`: Update existing docs (increases cost). (default: `false`)
- `instructions`: Additional prompting instructions for the LLM.
- `max_context`: Maximum number of tokens to build content of requests. (default: `6000`)
- `max_edits`: Maximum number of new or updated comments total. (default: `50`)
- `judge`: If true, the script will judge the quality of generated comments. (default: `false`)
- `dry_run`: If true, the script will not modify files. (default: `false`)
- `mock`: If true, the script will insert a mock comment instead of actual documentation. (default: `false`)
- `debug`: Enable debug logging.

## Usage

### Option 1: GitHub Action (Recommended for CI/CD)

Add the following to your step in your workflow file:

```yaml
uses: pelikhan/action-continuous-comments@v0
with:
  github_token: ${{ secrets.GITHUB_TOKEN }}
  files: "**/src/**/*.{ts,tsx,mts,cts,py}"
```

### Option 2: Direct CLI Usage (Great for Large Existing Codebases)

You can run the commentor directly on any codebase without setting up a GitHub Action using GenAIScript's remote repository feature:

```bash
# Install GenAIScript globally (one time setup)
npm install -g genaiscript

# Run the commentor on your codebase
genaiscript run "github:pelikhan/action-continuous-comments" "src/**/*.{ts,py,cs}" \
  --vars dryRun=true maxEdits=10
```

#### Quick Start Examples

**Option A: Clone and run locally (recommended for development):**
```bash
# One-time setup
git clone https://github.com/pelikhan/action-continuous-comments.git
cd action-continuous-comments
npm install

# Test on a few files first (dry run with mock data)
npx genaiscript run action "src/index.ts" --vars dryRun=true mock=true

# Generate real documentation
npx genaiscript run action "src/**/*.ts" --vars dryRun=false maxEdits=50
```

**Option B: Direct remote execution (when available):**
```bash
# Install GenAIScript globally
npm install -g genaiscript

# Run directly from GitHub (replace with your files)
genaiscript run "github:pelikhan/action-continuous-comments" "src/**/*.{ts,py,cs}" \
  --vars dryRun=true maxEdits=10
```

**Language-specific examples:**
```bash
# TypeScript/JavaScript projects
npx genaiscript run action "src/**/*.{ts,tsx,mts}" --vars exportsOnly=true

# Python projects  
npx genaiscript run action "src/**/*.py" --vars kinds="function,class" maxEdits=30

# C# projects
npx genaiscript run action "src/**/*.cs" --vars kinds="class,method,property" 

# Mixed codebases
npx genaiscript run action "src/**/*.{ts,py,cs}" --vars maxEdits=100 updateExisting=false
```
```bash
# 1. Test on a small subset first
npx genaiscript run action "src/utils/*.ts" --vars dryRun=true mock=true

# 2. Run on a larger set with dry run to preview
npx genaiscript run action "src/**/*.ts" --vars dryRun=true maxEdits=100

# 3. Apply changes incrementally
npx genaiscript run action "src/components/**/*.ts" --vars dryRun=false maxEdits=20

# 4. Update existing docs (higher cost, but improves quality)
npx genaiscript run action "src/api/**/*.ts" --vars updateExisting=true maxEdits=10
```

#### CLI Parameters

All GitHub Action inputs are available as `--vars` parameters:

- `dryRun=true` - Preview changes without modifying files
- `mock=true` - Use mock documentation for testing
- `maxEdits=N` - Limit the number of documentation additions/updates
- `updateExisting=true` - Update existing documentation (increases cost)
- `exportsOnly=true` - Only document exported entities
- `kinds="function,class"` - Specify which entity types to document
- `model="github:openai/gpt-4o-mini"` - Choose the AI model to use
- `judge=true` - Enable quality validation of generated docs

#### Benefits of CLI Usage

- **No setup required** - Run immediately on any existing codebase
- **Test before committing** - Try it out with `dryRun=true` first  
- **Flexible targeting** - Process specific files or directories
- **One-time improvements** - Perfect for large legacy codebases
- **Local development** - Run during development without CI/CD overhead
- **Cost control** - Use `maxEdits` to limit API usage and costs

#### Performance Tips for Large Codebases

- **Start small**: Use `maxEdits=10` for initial testing
- **Use dry run**: Always test with `dryRun=true` first to preview changes
- **Target strategically**: Focus on public APIs with `exportsOnly=true`
- **Incremental approach**: Process directories one at a time rather than entire codebase
- **Cache benefits**: GenAIScript caches LLM responses, so re-running is faster
- **Monitor costs**: Each documentation generation uses AI tokens - start conservative

#### Authentication

For GitHub Models (default), ensure you have:
```bash
export GITHUB_TOKEN="your_github_token_with_models_read_permission"
```

For other providers, see the [GenAIScript authentication docs](https://microsoft.github.io/genaiscript/reference/providers/).

#### Troubleshooting CLI Usage

**Script not found error:**
If you get "script github:pelikhan/action-continuous-comments not found", try:
1. Ensure you have the latest version of GenAIScript: `npm install -g genaiscript@latest`
2. Use the specific script name: `genaiscript run "github:pelikhan/action-continuous-comments/action"`
3. For development/testing, clone the repository and run locally:
   ```bash
   git clone https://github.com/pelikhan/action-continuous-comments.git
   cd action-continuous-comments
   npm install
   npx genaiscript run action "path/to/your/files/**/*.ts" --vars dryRun=true
   ```

**No changes made:**
- Check if your files match the supported extensions: `.ts`, `.tsx`, `.mts`, `.cts`, `.py`, `.cs`
- Verify files contain undocumented functions/classes/interfaces
- Try with `mock=true` first to see where documentation would be added

**Authentication issues:**
- Ensure your GitHub token has `models: read` permission
- For other AI providers, see [GenAIScript provider configuration](https://microsoft.github.io/genaiscript/reference/providers/)

## Example

```yaml
name: Improve Code Comments
on:
  push:
    branches:
      - main
  workflow_dispatch:

permissions:
  contents: write
  pull-requests: write
  models: read

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true

jobs:
  improve-comments:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      # This is the cache used by "improve comments"
      - uses: actions/cache@v4
        with:
          path: .genaiscript/cache/**
          key: genaiscript-${{ github.run_id }}
          restore-keys: genaiscript-

      # Improve the comments in the codebase
      - name: improve comments
        uses: pelikhan/action-continuous-comments@v0
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          max_edits: 20

      # Create a pull request with the changes
      - name: create pull request
        uses: peter-evans/create-pull-request@v7
        with:
          token: ${{ secrets.GITHUB_TOKEN }}
          title: "genai-commentor: Suggested comment improvements"
          body: "Hi! 👋 I'm a Code Commentor 🤖.\n\nThis pull request was automatically generated by the genai-commentor action to write and update code comments.\n\n> ⚠️ AI can make mistakes — please review carefully before merging. ✅"
          branch: genai-commentor/updates
          commit-message: "Code Commentor: Suggested comment improvements"
```

## Development

This action was automatically generated by GenAIScript from the script metadata.
We recommend updating the script metadata instead of editing the action files directly.

- the action inputs are inferred from the script parameters
- the action outputs are inferred from the script output schema
- the action description is the script title
- the readme description is the script description
- the action branding is the script branding

To **regenerate** the action files (`action.yml`), run:

```bash
npm run configure
```

To lint script files, run:

```bash
npm run lint
```

To typecheck the scripts, run:

```bash
npm run typecheck
```

## Upgrade

The GenAIScript version is pinned in the `package.json` file. To upgrade it, run:

```bash
npm run upgrade
```

## Release

To release a new version of this action, run the release script on a clean working directory.

```bash
npm run release
```
