import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";
import type { EntityKind, LanguageOps } from "./langops.mts";

const dbg = host.logger("script:ruby");

/**
 * Implements LanguageOps for Ruby source analysis and documentation generation.
 *
 * Provides methods to:
 * - Identify commentable nodes such as methods, classes, and modules.
 * - Extract or locate Ruby documentation comments.
 * - Determine where Ruby documentation comments should be inserted.
 * - Generate system prompts for updating and generating Ruby documentation comments, following YARD conventions.
 *
 * Methods:
 * @param entityKinds Array of entity kinds to match (e.g., "function", "type", "module").
 * @param withComments Whether to filter nodes that already have comments or documentation.
 * @param exportsOnly Whether to filter to only public/exported entities (not strictly applicable to Ruby).
 * @returns Matcher rules for commentable nodes.
 *
 * @param decl Node representing the Ruby declaration.
 * @returns Array of found comment nodes, or null if absent.
 *
 * @param node Target node to locate insertion point for a comment.
 * @returns Node where comment can be inserted.
 *
 * @returns System prompt name for Ruby documentation.
 *
 * @param docs Raw documentation string.
 * @returns Formatted Ruby comment block, using # syntax.
 *
 * @param _ Chat generation context object.
 * @param declKind Kind of the code declaration (e.g., method, class, module).
 * @param declRef Reference string for the declaration.
 * @returns Prompt string for updating a Ruby comment.
 *
 * @param _ Chat generation context object.
 * @param declKind Kind of the code declaration.
 * @param declRef Reference string for the declaration.
 * @param fileRef Reference for the source file.
 * @returns Prompt string for generating a Ruby comment.
 */
class Ruby implements LanguageOps {
  /**
   * Constructs a matcher rule for identifying Ruby AST nodes that are eligible for documentation comments.
   *
   * @param entityKinds - Array of entity kinds (e.g., "function", "type", "module") to match.
   * @param withComments - Whether to match only entities with associated comments.
   * @param exportsOnly - Whether to match only exported entities (not strictly applicable to Ruby).
   * @returns Matcher rule object for AST node selection.
   */
  getCommentableNodesMatcher(
    entityKinds: EntityKind[],
    withComments: boolean,
    exportsOnly: boolean
  ) {
    const declKinds: SgRule = {
      any: [
        entityKinds.includes("function") ? { kind: "method" } : null,
        entityKinds.includes("type") ? { kind: "class" } : null,
        entityKinds.includes("module") ? { kind: "module" } : null,
      ].filter(Boolean) as SgRule[],
    };

    // Ruby comments precede declarations, so we look for comment nodes before the declaration
    const withDocComment: SgRule = {
      follows: {
        kind: "comment",
        stopBy: "neighbor",
      },
    };

    const docsRule: SgRule = withComments
      ? withDocComment
      : {
          not: withDocComment,
        };

    return { ...declKinds, ...docsRule };
  }

  /**
   * Retrieves the comment nodes associated with the given declaration node.
   *
   * @param decl - The declaration node to search for its related comments.
   * @returns An array containing the comment nodes if found, or null if no comments exist.
   */
  getCommentNodes(decl: SgNode): SgNode[] | null {
    // Find comments that precede the declaration
    const comments: SgNode[] = [];
    let current = decl.prev();
    
    // Walk backwards through siblings to find contiguous comments
    while (current && current.kind() === "comment") {
      comments.unshift(current);
      current = current.prev();
    }

    if (comments.length === 0) {
      dbg(`no comments found for %s`, decl.text());
      return null;
    }

    dbg(`found ${comments.length} comment nodes: %s`, comments.map(c => c.text()).join("\\n"));
    return comments;
  }

  /**
   * Returns the insertion node for a comment associated with the given AST node.
   * For Ruby, comments are inserted before the method/class/module declaration.
   * 
   * @param node The AST node representing the declaration.
   * @returns The same node, as comments are inserted before it.
   */
  getCommentInsertionNode(node: SgNode): SgNode {
    return node;
  }

  /**
   * Returns the system prompt name used for Ruby language operations.
   * @returns The identifier string for the Ruby system prompt.
   */
  getLanguageSystemPromptName(): string {
    return "system.ruby";
  }

  /**
   * Formats the given documentation string as Ruby comments.
   * Ensures each line is prefixed with # and follows YARD conventions.
   *
   * @param docs - The documentation string to format.
   * @returns The formatted Ruby comment block.
   */
  getCommentText(docs: string): string {
    docs = parsers.unfence(docs, "#");
    
    // If it's already properly formatted Ruby comments, return as-is
    if (/^(\s*#.*\n?)+$/m.test(docs.trim())) {
      return docs;
    }

    // Format as Ruby comments
    const lines = docs
      .split(/\\r?\\n/g)
      .map((line) => line.trim())
      .filter((line) => line || docs.includes("\\n")); // Keep empty lines if original had line breaks

    if (lines.length === 0) {
      return "# TODO: Add documentation";
    }

    const formatted = lines
      .map((line) => {
        if (!line) return "#";
        if (line.startsWith("#")) return line;
        return `# ${line}`;
      })
      .join("\\n");

    return formatted;
  }

  /**
   * Generates a prompt to update the Ruby comment for the specified declaration.
   *
   * @param _ - Chat generation context for template interpolation.
   * @param declKind - The kind of code entity (e.g., method, class, module).
   * @param declRef - Reference or name of the target declaration.
   * @returns The prompt instructing how to update the comment following YARD conventions.
   */
  addUpdateDocPrompt(_: ChatGenerationContext, declKind: any, declRef: string) {
    return _.$`Update the Ruby comment <DOCSTRING> to match the code in ${declKind} ${declRef}.
- If the comment is up to date, return /NO/. It's ok to leave it as is.
- Do not rephrase an existing sentence if it is correct.
- Make sure parameters and return values are documented if relevant.
- Use Ruby comment syntax with # for each line.
- Use YARD tags like @param, @return, @example when appropriate.
- Minimize updates to the existing comment.

The full source of the file is in <FILE> for reference.
The source of the ${declKind} is in ${declRef}.
The current comment is <DOCSTRING>.

Example format:
# Brief description of the method
# @param param_name [Type] description
# @return [Type] description
# @example
#   example_usage
`;
  }

  /**
   * Generates a prompt for creating a Ruby documentation comment for a specified declaration.
   *
   * @param _ - Chat generation context utility.
   * @param declKind - The kind of declaration (e.g., method, class, module) to document.
   * @param declRef - The reference identifier of the declaration.
   * @param fileRef - The source file containing the declaration.
   * @returns A templated string instructing on Ruby comment generation.
   */
  addGenerateDocPrompt(
    _: ChatGenerationContext,
    declKind: string,
    declRef: string,
    fileRef: string
  ) {
    return _.$`Generate a Ruby documentation comment for the ${declKind} ${declRef}.
- Make sure parameters and return types are documented if relevant.
- Be concise. Use a technical tone.
- Use Ruby comment syntax with # for each line.
- Use YARD tags like @param, @return, @example when appropriate.
- Do not wrap in markdown code blocks.

The full source of the file is in ${fileRef} for reference.

Example format:
# Brief description of the method
# @param param_name [Type] description
# @return [Type] description`;
  }
}

export const rubyOps = new Ruby();