# GitHub Action: Continuous Comments

This GitHub Action automatically generates and updates code documentation using GenAIScript and AST-grep. It's a TypeScript-based project that combines LLM generation with AST parsing for precise comment insertion.

## Architecture Overview

**Core Components:**

- `genaisrc/action.genai.mts` - Main script that orchestrates the documentation generation
- `genaisrc/src/langops.mts` - Abstract interface defining language-specific operations
- `genaisrc/src/{typescript,python,csharp}.mts` - Language-specific implementations
- `genaisrc/src/classify.mts` - AI-powered classification utility

**Data Flow:**

1. AST-grep parses source files to find documentable entities (functions, classes, etc.)
2. Language-specific operations determine comment insertion points and formats
3. LLM generates documentation based on code context
4. Optional judge step validates generated documentation quality
5. Comments are inserted/updated directly in source files

## Key Development Patterns

**GenAIScript Runtime:** All `.genai.mts` files run in GenAIScript's Node.js runtime, not standard Node.js:

- Use GenAIScript APIs from `genaiscript.d.ts` instead of Node.js imports
- Ambient types are globally available - no explicit imports needed
- ESM modules with TypeScript support built-in

**Language Extension Pattern:** Each language implements the `LanguageOps` interface:

```typescript
// Example from typescript.mts
getCommentableNodesMatcher(entityKinds, withComments, exportsOnly); // AST rules
getCommentNodes(decl); // Find existing comment nodes
getCommentInsertionNode(node); // Where to insert new comments
getCommentText(docs); // Format documentation as language-specific comments
```

**AST-grep Integration:** Uses declarative AST matching instead of imperative parsing:

- Rules defined as JSON objects targeting specific node types
- Combines filters like `kind`, `inside`, `follows`, `not` for precise matching
- Language grammars loaded via `@ast-grep/lang-{typescript,python,csharp}`

## Critical Developer Workflows

**Testing Language Support:**

```bash
# Test with mock LLM (fast iteration)
npm run mock-typescript-write-docs
npm run mock-python-update-docs
npm run mock-csharp-write-docs

# Test with real LLM (limited edits)
npm run mini-typescript-write-docs
npm run mini-python-update-docs
```

**Development Scripts:**

- `npm test` - Run on test files with dry-run enabled
- `npm run typecheck` - Compile GenAIScript files
- `npm run configure` - Regenerate action.yml from script metadata
- `npm start` - Production entry point used by GitHub Actions

**Docker Context:** Action runs in Alpine Linux container with Node.js, git, and GitHub CLI pre-installed.

## Integration Points

**GitHub Models:** Requires `models: read` permission for LLM inference via GitHub's model API. Uses `github:openai/gpt-4.1-mini` by default.

**AST-grep Plugin:** Core dependency `@genaiscript/plugin-ast-grep` provides the `astGrep()` function and AST node types.

**Action Inputs:** All script parameters automatically map to GitHub Action inputs via the `script()` metadata declaration.

## Entity Processing Logic

**Supported Entity Types:** `module`, `type`, `function`, `property`, `variable` (configurable via `kinds` parameter)

**Comment Strategies:**

- **Generate:** Find undocumented entities, generate new comments
- **Update:** Find documented entities, improve existing comments (increases LLM cost)
- **Judge:** Validate generated comments for quality (optional)

**Cost Controls:**

- `maxEdits` limits total comment changes per run
- `maxContext` caps tokens sent to LLM
- `exportsOnly` reduces scope to public APIs only

## File Naming Conventions

- `.genai.mts` - GenAIScript files (TypeScript with special runtime)
- Test files follow pattern: `{language}-{with|without}-docs.{ext}`
- Language operations in `src/{language}.mts` format
