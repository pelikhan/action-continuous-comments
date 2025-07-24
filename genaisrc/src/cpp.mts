import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";

const dbg = host.logger("script:cpp");

import type { EntityKind, LanguageOps } from "./langops.mts";

/**
 * Provides C++-specific implementations for language operations used in documentation generation and analysis.
 *
 * Implements functions to:
 * - Build AST matchers for commentable C++ entities (functions, types, namespaces, variables).
 * - Retrieve associated comment nodes for documentation extraction.
 * - Determine insertion points for new documentation comments.
 * - Format text into valid Doxygen-style C++ comments, including proper tag handling.
 * - Generate prompts for AI-assisted documentation creation and updates, ensuring Doxygen conventions are followed.
 *
 * @implements LanguageOps for the C++ language.
 */
class Cpp implements LanguageOps {
  /**
   * Constructs a matcher rule for AST nodes that are suitable for documentation comments.
   *
   * @param entityKinds List of entity kinds (e.g., function, type, module, variable) to match.
   * @param withComments If true, matches nodes that already have documentation comments; otherwise, matches nodes without them.
   * @param exportsOnly If true, restricts to exported entities (not implemented in matcher here, but provided for API compatibility).
   * @returns An object describing a matcher rule for finding commentable nodes in C++ ASTs.
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
        entityKinds.includes("function")
          ? { kind: "function_declarator" }
          : null,
        // Types (classes, structs, enums, typedefs, etc.)
        entityKinds.includes("type") ? { kind: "class_specifier" } : null,
        entityKinds.includes("type") ? { kind: "struct_specifier" } : null,
        entityKinds.includes("type") ? { kind: "enum_specifier" } : null,
        entityKinds.includes("type") ? { kind: "type_definition" } : null,
        entityKinds.includes("type") ? { kind: "template_declaration" } : null,
        // Namespaces
        entityKinds.includes("module")
          ? { kind: "namespace_definition" }
          : null,
        // Variables and declarations
        entityKinds.includes("variable")
          ? {
              kind: "declaration",
              // Only match top-level declarations (not local variables)
              inside: {
                any: [
                  { kind: "translation_unit" },
                  { kind: "namespace_definition" },
                  { kind: "class_specifier" },
                ],
              },
            }
          : null,
      ].filter(Boolean) as SgRule[],
    };

    const declKinds: SgRule = {
      any: [declKindsRaw],
    };

    const inside: SgRule = {
      inside: {
        any: [
          { kind: "translation_unit" }, // C++ files have translation_unit as root
          { kind: "namespace_definition" },
          { kind: "class_specifier" },
        ],
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
   * Retrieves all consecutive comment nodes immediately preceding the specified node.
   *
   * @param node The node from which to start searching backwards for preceding comment nodes.
   * @returns An array of comment nodes in source order if found; otherwise, null.
   */
  getCommentNodes(node: SgNode) {
    const commentNodes = [];
    let current = node.prev();
    // Collect all preceding comment nodes
    while (current && current.kind() === "comment") {
      commentNodes.unshift(current); // Add to beginning to maintain order
      current = current.prev();
    }
    return commentNodes.length > 0 ? commentNodes : null;
  }

  /**
   * Returns the node where a new documentation comment should be inserted.
   *
   * @param node The AST node representing the code entity.
   * @returns The node for comment insertion.
   */
  getCommentInsertionNode(node: SgNode) {
    return node;
  }

  /**
   * Returns the name of the language system prompt for C++.
   * Used for providing specialized prompts or system instructions if required.
   * @returns The language system prompt name as a string.
   */
  getLanguageSystemPromptName() {
    return "";
  }

  /**
   * Generates a properly formatted Doxygen-style C++ documentation comment from the provided text.
   *
   * @param docs The raw documentation text, potentially already fenced or in Doxygen format.
   * @returns The formatted Doxygen-style comment block.
   */
  getCommentText(docs: string) {
    docs = parsers.unfence(docs, "*");

    // Check if it's already a properly formatted C++ comment
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
            line.startsWith("@throws") ||
            line.startsWith("@template") ||
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
   * Generates a prompt string instructing how to create a C++ documentation comment for the specified declaration.
   *
   * @param _ - The chat generation context.
   * @param declKind - The kind of C++ declaration to document (e.g., function, class).
   * @param declRef - The reference identifier for the declaration.
   * @param fileRef - The file path containing the full source for reference.
   * @returns A prompt string for generating a Doxygen-style C++ doc comment, outlining formatting and documentation requirements.
   */
  addGenerateDocPrompt(
    _: ChatGenerationContext,
    declKind: any,
    declRef: string,
    fileRef: string
  ) {
    return _.$`Generate a C++ documentation comment for the ${declKind} ${declRef}.
- Make sure parameters, template parameters, return types, and exceptions are documented if relevant.
- Be concise. Use a technical tone.
- Use Doxygen-style comments with @brief, @param, @tparam, @return, @throws tags.
- Start with /** and end with */.
- Do NOT include types in parameter descriptions, this is for C++.
The full source of the file is in ${fileRef} for reference.`;
  }

  /**
   * Generates a prompt for updating a C++ documentation comment for the specified declaration.
   *
   * @param _ Context object for prompt templating.
   * @param declKind The kind of declaration (e.g., function, class) being documented.
   * @param declRef A string reference to the specific declaration.
   * @returns A string containing the prompt with instructions for updating the docstring.
   */
  addUpdateDocPrompt(_: ChatGenerationContext, declKind: any, declRef: string) {
    return _.$`Update the C++ documentation comment <DOCSTRING> to match the code in ${declKind} ${declRef}.
- If the docstring is up to date, return /NO/. It's ok to leave it as is.
- Do not rephrase an existing sentence if it is correct.
- Make sure parameters, template parameters, return types, and exceptions are documented.
- Use Doxygen-style comments with @brief, @param, @tparam, @return, @throws tags.
- Start with /** and end with */.
- Do NOT include types in parameter descriptions, this is for C++.
- Minimize updates to the existing docstring.

The full source of the file is in <FILE> for reference.
The source of the function is in ${declRef}.
The current docstring is <DOCSTRING>.`;
  }
}

export const cppOps = new Cpp();
