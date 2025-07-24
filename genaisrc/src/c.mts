import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";

const dbg = host.logger("script:c");

import type { EntityKind, LanguageOps } from "./langops.mts";

/**
 * Implements LanguageOps for C language support, providing methods to identify commentable code nodes, extract comments, and generate or update Doxygen-style documentation.
 *
 * @method getCommentableNodesMatcher
 *   Builds a matcher rule to select functions, types, and variable declarations for documentation based on entity kinds, comment presence, and export status.
 *   @param entityKinds Array of entity kinds to filter code nodes.
 *   @param withComments Whether to match only nodes with existing comments.
 *   @param exportsOnly Whether to match only exported entities.
 *   @returns Matcher rule object for AST queries.
 *
 * @method getCommentNodes
 *   Collects preceding comment nodes for the given AST node.
 *   @param node The reference node to search from.
 *   @returns Array of comment nodes found before the node.
 *
 * @method getCommentInsertionNode
 *   Returns the node where a comment should be inserted.
 *   @param node The code node for documentation.
 *   @returns The node itself as the insertion point.
 *
 * @method getLanguageSystemPromptName
 *   @returns The internal name of the documentation generation prompt for C.
 *
 * @method getCommentText
 *   Formats the given documentation string as a C Doxygen-style comment.
 *   @param docs The raw docstring content.
 *   @returns Formatted docstring for insertion into code.
 *
 * @method addGenerateDocPrompt
 *   Constructs a prompt for generating a Doxygen-style comment for a given code declaration.
 *   @param _ Chat context object.
 *   @param declKind The kind of declaration being documented.
 *   @param declRef Reference to the code element.
 *   @param fileRef Reference to the source file.
 *   @returns Prompt string for code generation.
 *
 * @method addUpdateDocPrompt
 *   Constructs a prompt for updating an existing Doxygen-style docstring.
 *   @param _ Chat context object.
 *   @param declKind The kind of declaration being updated.
 *   @param declRef Reference to the code element.
 *   @returns Prompt string for updating documentation.
 */
class C implements LanguageOps {
  /**
   * Returns a matcher rule for commentable C nodes based on the specified entity kinds and comment presence.
   *
   * @param entityKinds Array of entity kinds to match (e.g., function, type, variable).
   * @param withComments If true, restricts to nodes preceded by a documentation comment.
   * @param exportsOnly Ignored for C, included for interface consistency.
   * @returns Matcher rule for use with AST-grep to find nodes eligible for documentation.
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
          ? { kind: "function_definition" }
          : null,
        // Types (structs, enums, typedefs)
        entityKinds.includes("type") ? { kind: "type_definition" } : null,
        entityKinds.includes("type") ? { kind: "struct_specifier" } : null,
        entityKinds.includes("type") ? { kind: "enum_specifier" } : null,
        // Global variables and declarations
        entityKinds.includes("variable")
          ? {
              kind: "declaration",
              // Only match top-level declarations (not local variables)
              inside: { kind: "translation_unit" },
            }
          : null,
      ].filter(Boolean) as SgRule[],
    };

    const declKinds: SgRule = {
      any: [declKindsRaw],
    };

    const inside: SgRule = {
      inside: {
        kind: "translation_unit", // C files have translation_unit as root
      },
    };

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

    return { ...declKinds, ...inside, ...docsRule };
  }

  /**
   * Retrieves all contiguous preceding comment nodes before the given node.
   *
   * @param node The AST node whose preceding comments are collected.
   * @returns An array of preceding comment nodes in source order.
   */
  getCommentNodes(node: SgNode) {
    const commentNodes = [];
    let current = node.prev();
    // Collect all preceding comment nodes
    while (current && current.kind() === "comment") {
      commentNodes.unshift(current); // Add to beginning to maintain order
      current = current.prev();
    }
    return commentNodes;
  }

  /**
   * Returns the node where a documentation comment should be inserted.
   *
   * @param node The AST node to annotate with a comment.
   * @returns The node appropriate for comment insertion.
   */
  getCommentInsertionNode(node: SgNode) {
    return node;
  }

  /**
   * Returns the identifier for the C language system prompt.
   * @returns The system prompt name for C language.
   */
  getLanguageSystemPromptName() {
    return "system.c";
  }

  /**
   * Formats documentation text into a Doxygen-style C comment block.
   *
   * @param docs Documentation string to convert into a properly formatted C comment.
   * @returns A string containing a Doxygen-style C comment, using @brief for summaries and appropriate tags for parameters and return values.
   */
  getCommentText(docs: string) {
    docs = parsers.unfence(docs, "*");

    // Check if it's already a properly formatted C comment
    if (/^\/\*\*.*\*\/$/s.test(docs.trim())) {
      return docs;
    }

    // Format as Doxygen-style comment
    const lines = docs
      .split(/\r?\n/g)
      .map((line) => line.trim())
      .filter((line) => line);

    if (lines.length === 1) {
      // Single line comment - check if it needs @brief
      const line = lines[0];
      if (line.startsWith("@")) {
        return `/** ${line} */`;
      } else {
        return `/** @brief ${line} */`;
      }
    } else {
      // Multi-line comment
      const formatted = lines
        .map((line, index) => {
          if (index === 0 && !line.startsWith("@")) {
            return ` * @brief ${line}`;
          } else if (
            line.startsWith("@param") ||
            line.startsWith("@return") ||
            line.startsWith("@")
          ) {
            return ` * ${line}`;
          } else if (line) {
            return ` * ${line}`;
          } else {
            return " *";
          }
        })
        .join("\n");
      return `/**\n${formatted}\n */`;
    }
  }

  /**
   * Generates a prompt to create a C documentation comment for a declaration.
   *
   * @param _ - Chat generation context used for template creation.
   * @param declKind - The kind of the declaration (e.g., function, type).
   * @param declRef - The reference identifier of the declaration.
   * @param fileRef - The file path containing the declaration source.
   * @returns A formatted prompt for generating a Doxygen-style C docstring.
   */
  addGenerateDocPrompt(
    _: ChatGenerationContext,
    declKind: any,
    declRef: string,
    fileRef: string
  ) {
    return _.$`Generate a C documentation comment for the ${declKind} ${declRef}.
- Make sure parameters and return types are documented if relevant.
- Be concise. Use a technical tone.
- Use Doxygen-style comments with @brief, @param, @return tags.
- Start with /** and end with */.
- Do NOT include types in parameter descriptions, this is for C.
The full source of the file is in ${fileRef} for reference.`;
  }

  /**
   * Generates a prompt for updating a C documentation comment to match the implementation.
   *
   * @param _ The chat generation context.
   * @param declKind The kind of code entity being documented.
   * @param declRef Reference to the declaration whose documentation needs updating.
   * @returns A prompt instructing how to update the documentation comment.
   */
  addUpdateDocPrompt(_: ChatGenerationContext, declKind: any, declRef: string) {
    return _.$`Update the C documentation comment <DOCSTRING> to match the code in ${declKind} ${declRef}.
- If the docstring is up to date, return /NO/. It's ok to leave it as is.
- Do not rephrase an existing sentence if it is correct.
- Make sure parameters and return types are documented.
- Use Doxygen-style comments with @brief, @param, @return tags.
- Start with /** and end with */.
- Do NOT include types in parameter descriptions, this is for C.
- Minimize updates to the existing docstring.

The full source of the file is in <FILE> for reference.
The source of the function is in ${declRef}.
The current docstring is <DOCSTRING>.`;
  }
}

export const cOps = new C();
