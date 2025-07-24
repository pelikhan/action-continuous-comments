import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";

const dbg = host.logger("script:go");

import type { EntityKind, LanguageOps } from "./langops.mts";

/**
 * Provides language operations for Go, implementing the LanguageOps interface.
 *
 * Methods:
 * - getCommentableNodesMatcher: Returns a matching rule for commentable Go AST nodes based on entity kinds, inclusion of comments, and export status.
 *   @param entityKinds Array of entity kinds to match (e.g., function, type, variable).
 *   @param withComments Whether to include nodes with existing comments.
 *   @param exportsOnly Whether to match only exported declarations.
 *   @returns A rule object for commentable nodes.
 *
 * - getCommentNodes: Retrieves preceding single-line comment nodes for a given AST node.
 *   @param node The AST node to check for comments.
 *   @returns List of associated comment nodes or null if none found.
 *
 * - getCommentInsertionNode: Returns the node where a new comment should be inserted.
 *   @param node The AST node for insertion.
 *   @returns The insertion node.
 *
 * - getLanguageSystemPromptName: Returns the identifier for a system prompt for Go.
 *   @returns Empty string.
 *
 * - getCommentText: Formats input documentation as a Go single-line comment block.
 *   @param docs The documentation text to format.
 *   @returns Formatted Go comment text.
 *
 * - addGenerateDocPrompt: Generates a prompt for creating Go documentation comments.
 *   @param _ The chat generation context.
 *   @param declKind Declaration kind (e.g., function, type).
 *   @param declRef Reference name of the declaration.
 *   @param fileRef Reference to the source file.
 *   @returns Documentation generation prompt string.
 *
 * - addUpdateDocPrompt: Generates a prompt for updating Go documentation comments to match code.
 *   @param _ The chat generation context.
 *   @param declKind Declaration kind.
 *   @param declRef Declaration reference.
 *   @returns Documentation update prompt string.
 */
class Go implements LanguageOps {
  /**
   * Constructs a matcher rule for AST nodes in Go source files that are eligible for documentation comments.
   *
   * @param entityKinds - Array of entity kinds to match (e.g., "function", "type", "variable").
   * @param withComments - If true, matches only nodes that already have documentation comments.
   * @param exportsOnly - If true, limits matching to exported entities (names starting with a capital letter).
   * @returns An object representing the AST grep rule to select commentable nodes according to the specified criteria.
   */
  getCommentableNodesMatcher(
    entityKinds: EntityKind[],
    withComments: boolean,
    exportsOnly: boolean
  ) {
    const declKindsRaw: SgRule = {
      any: [
        // Functions
        entityKinds.includes("function")
          ? { kind: "function_declaration" }
          : null,
        entityKinds.includes("function")
          ? { kind: "method_declaration" }
          : null,
        // Types (structs, interfaces, type aliases)
        entityKinds.includes("type") ? { kind: "type_declaration" } : null,
        // Variables and constants
        entityKinds.includes("variable") ? { kind: "var_declaration" } : null,
        entityKinds.includes("variable") ? { kind: "const_declaration" } : null,
      ].filter(Boolean) as SgRule[],
    };

    // Go has capitalized names for exported items
    const declKinds: SgRule = exportsOnly
      ? {
          any: [
            {
              any: declKindsRaw.any,
              has: {
                kind: "identifier",
                regex: "^[A-Z]", // Exported items start with capital letter
              },
            },
          ],
        }
      : {
          any: [declKindsRaw],
        };

    const inside: SgRule = {
      inside: {
        kind: "source_file", // Go files have source_file as root
      },
    };

    const withDocComment: SgRule = {
      follows: {
        kind: "comment",
        regex: "^//",
        stopBy: "neighbor",
      },
    };

    const docsRule: SgRule = withComments
      ? withDocComment
      : {
          not: withDocComment,
        };

    return { ...declKinds, ...inside, ...docsRule };
  }

  /**
   * Retrieves all contiguous preceding single-line comment nodes (with //) directly before the given node.
   * @param node The AST node from which to search for preceding comment nodes.
   * @returns An array of comment nodes if found; otherwise, null.
   */
  getCommentNodes(node: SgNode) {
    const commentNodes = [];
    let current = node.prev();
    // Collect all preceding comment nodes (//)
    while (
      current &&
      current.kind() === "comment" &&
      current.text().startsWith("//")
    ) {
      commentNodes.unshift(current); // Add to beginning to maintain order
      current = current.prev();
    }
    return commentNodes.length > 0 ? commentNodes : null;
  }

  /**
   * Returns the node at which a documentation comment should be inserted.
   *
   * @param node - The AST node for which to determine the comment insertion point.
   * @returns The insertion node.
   */
  getCommentInsertionNode(node: SgNode) {
    return node;
  }

  /**
   * Returns the language system prompt name specific to Go.
   *
   * @returns The system prompt name as a string.
   */
  getLanguageSystemPromptName() {
    return "";
  }

  /**
   * Formats documentation text as Go single-line comments.
   *
   * @param docs The documentation text to format.
   * @returns The formatted Go doc comment string.
   */
  getCommentText(docs: string) {
    docs = parsers.unfence(docs, "/");

    // Check if it's already properly formatted Go comments
    if (/^\/\//.test(docs.trim())) {
      return docs;
    }

    // Format as Go comments
    const lines = docs
      .split(/\r?\n/g)
      .map((line) => line.trim())
      .filter((line) => line);

    return lines.map((line) => `// ${line}`).join("\n");
  }

  /**
   * Generates a prompt to instruct a language model to create a Go documentation comment for a specified declaration.
   *
   * @param _ - Context object for prompt generation.
   * @param declKind - The kind of declaration (e.g., function, type) to be documented.
   * @param declRef - Reference or name of the declaration.
   * @param fileRef - Path or reference to the file containing the declaration.
   * @returns A prompt string guiding the generation of a Go doc comment according to Go conventions.
   */
  addGenerateDocPrompt(
    _: ChatGenerationContext,
    declKind: any,
    declRef: string,
    fileRef: string
  ) {
    return _.$`Generate a Go documentation comment for the ${declKind} ${declRef}.
- Make sure parameters, return values, and behavior are documented if relevant.
- Be concise. Use a technical tone.
- Use Go doc comment syntax with double slashes (//).
- Follow Go documentation conventions (start with the name of the item being documented).
- Do NOT include types in parameter descriptions, this is for Go.
The full source of the file is in ${fileRef} for reference.`;
  }

  /**
   * Generates a prompt instructing to update an existing Go documentation comment based on the code in the given declaration reference.
   *
   * @param _ - The chat generation context.
   * @param declKind - The kind of code declaration (e.g., function, type).
   * @param declRef - The reference identifier for the declaration to be documented.
   * @returns A prompt string for updating the Go doc comment to match the code, following Go documentation conventions.
   */
  addUpdateDocPrompt(_: ChatGenerationContext, declKind: any, declRef: string) {
    return _.$`Update the Go documentation comment <DOCSTRING> to match the code in ${declKind} ${declRef}.
- If the docstring is up to date, return /NO/. It's ok to leave it as is.
- Do not rephrase an existing sentence if it is correct.
- Make sure parameters, return values, and behavior are documented.
- Use Go doc comment syntax with double slashes (//).
- Follow Go documentation conventions (start with the name of the item being documented).
- Do NOT include types in parameter descriptions, this is for Go.
- Minimize updates to the existing docstring.

The full source of the file is in <FILE> for reference.
The source of the function is in ${declRef}.
The current docstring is <DOCSTRING>.`;
  }
}

export const goOps = new Go();
