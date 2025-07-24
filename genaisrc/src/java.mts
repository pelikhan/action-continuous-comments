import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";

const dbg = host.logger("script:java");

import type { EntityKind, LanguageOps } from "./langops.mts";

/**
 * Implements LanguageOps for Java, providing methods to manage documentation comments
 * and AST-related operations specific to Java code.
 *
 * @method getCommentableNodesMatcher
 *   Returns a matcher object to find Java AST nodes eligible for documentation.
 *   @param entityKinds Array of entity kinds to match (e.g., type, function, property).
 *   @param withComments Whether to include only nodes with comments.
 *   @param exportsOnly Whether to restrict to nodes with public modifier.
 *   @return Matcher rule for use with AST-grep.
 *
 * @method getCommentNodes
 *   Retrieves contiguous preceding comment nodes (block or line) for a given AST node.
 *   @param node Java AST node to find comments for.
 *   @return Array of comment nodes, or null if none.
 *
 * @method getCommentInsertionNode
 *   Returns the node where a new comment should be inserted.
 *   @param node AST node under consideration.
 *   @return The insertion node.
 *
 * @method getLanguageSystemPromptName
 *   Returns the identifier for the language/system prompt, if any.
 *   @return The prompt name string.
 *
 * @method getCommentText
 *   Formats a string as a Java Javadoc comment, converting raw input if necessary.
 *   @param docs Raw documentation text.
 *   @return Formatted Javadoc string.
 *
 * @method addGenerateDocPrompt
 *   Prepares a prompt string for generating Javadoc for a declaration.
 *   @param _ Prompt context.
 *   @param declKind Declaration kind for documentation.
 *   @param declRef Declaration reference/location.
 *   @param fileRef Reference to the file containing the declaration.
 *   @return Prompt string for documentation generation.
 *
 * @method addUpdateDocPrompt
 *   Prepares a prompt for updating an existing Javadoc comment to reflect code changes.
 *   @param _ Prompt context.
 *   @param declKind Declaration kind.
 *   @param declRef Declaration reference.
 *   @return Prompt string for documentation update.
 */
class Java implements LanguageOps {
  /**
   * Constructs an AST matcher rule for Java nodes that can be documented.
   *
   * @param entityKinds Array of entity kinds (e.g., "type", "function", "property") to match.
   * @param withComments If true, selects only nodes that are preceded by a comment; if false, selects nodes without a leading comment.
   * @param exportsOnly If true, limits matches to nodes with the "public" modifier.
   * @returns An AST matcher rule for selecting commentable Java code entities.
   */
  getCommentableNodesMatcher(
    entityKinds: EntityKind[],
    withComments: boolean,
    exportsOnly: boolean
  ) {
    const declKindsRaw: SgRule = {
      any: [
        entityKinds.includes("type") ? { kind: "class_declaration" } : null,
        entityKinds.includes("type") ? { kind: "interface_declaration" } : null,
        entityKinds.includes("type") ? { kind: "enum_declaration" } : null,
        entityKinds.includes("type")
          ? { kind: "annotation_type_declaration" }
          : null,
        entityKinds.includes("function")
          ? { kind: "method_declaration" }
          : null,
        entityKinds.includes("function")
          ? { kind: "constructor_declaration" }
          : null,
        entityKinds.includes("property") ? { kind: "field_declaration" } : null,
        entityKinds.includes("property") ? { kind: "enum_constant" } : null,
      ].filter(Boolean) as SgRule[],
    };

    // Java doesn't have explicit exports like TypeScript, but we can filter by public modifier
    const declKinds: SgRule = exportsOnly
      ? {
          all: [
            declKindsRaw,
            {
              has: {
                kind: "modifiers",
                has: {
                  kind: "public",
                },
              },
            },
          ],
        }
      : declKindsRaw;

    const inside: SgRule = {
      inside: {
        any: [
          {
            kind: "program",
          },
          {
            kind: "class_body",
          },
          {
            kind: "interface_body",
          },
          {
            kind: "enum_body",
          },
        ],
      },
    };

    // In Java, comments might be called differently in the AST
    const withDocComment: SgRule = {
      follows: {
        any: [{ kind: "block_comment" }, { kind: "line_comment" }],
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
   * Retrieves all consecutive preceding comment nodes (block or line comments) for the given node.
   * @param node The AST node to search for preceding comments.
   * @returns An array of comment nodes if found; otherwise, null.
   */
  getCommentNodes(node: SgNode) {
    const commentNodes = [];
    let current = node.prev();
    while (
      current &&
      (current.kind() === "block_comment" || current.kind() === "line_comment")
    ) {
      commentNodes.unshift(current);
      current = current.prev();
    }
    return commentNodes.length > 0 ? commentNodes : null;
  }

  /**
   * Returns the node at which a documentation comment should be inserted.
   *
   * @param node The AST node for which to determine the comment insertion position.
   * @returns The node to use as the insertion point for a documentation comment.
   */
  getCommentInsertionNode(node: SgNode) {
    return node;
  }

  /**
   * Returns the system prompt name for the Java language.
   * @returns An empty string indicating no specific system prompt name.
   */
  getLanguageSystemPromptName() {
    return "";
  }

  /**
   * Formats the provided documentation string as a Java Javadoc comment.
   *
   * @param docs Documentation content to format.
   * @returns The input string as a properly formatted Javadoc comment block.
   */
  getCommentText(docs: string) {
    docs = parsers.unfence(docs, "*");

    if (!/^\s*\/\*\*.*.*\*\/\s*$/s.test(docs)) {
      docs = `/**\n * ${docs.split(/\r?\n/g).join("\n * ")}\n */`;
    }
    return docs;
  }

  /**
   * Generates a Java documentation comment prompt for a given declaration.
   *
   * @param _ - Chat generation context used for constructing the prompt.
   * @param declKind - The kind of the declaration (e.g., class, method).
   * @param declRef - Reference to the declaration to document.
   * @param fileRef - Reference to the file containing the declaration.
   * @returns A template string containing instructions for generating a Javadoc comment.
   */
  addGenerateDocPrompt(
    _: ChatGenerationContext,
    declKind: any,
    declRef: string,
    fileRef: string
  ) {
    return _.$`Generate a Java documentation comment for the ${declKind} ${declRef}.
- Make sure parameters, type parameters, and return types are documented if relevant.
- Be concise. Use a technical tone.
- Use Javadoc syntax (https://docs.oracle.com/javase/8/docs/technotes/tools/windows/javadoc.html). Do not wrap in markdown code section.
- Start the comment with "/**" and end with "*/".
- Use @param for parameters, @return for return values, @throws for exceptions.
The full source of the file is in ${fileRef} for reference.`;
  }

  /**
   * Generates a prompt for updating an existing Java Javadoc comment to reflect the current implementation of a given declaration.
   *
   * @param _ Chat generation context used for template string interpolation.
   * @param declKind The kind of the declaration (e.g., method, class).
   * @param declRef The identifier or reference string for the declaration.
   * @returns A string containing instructions for updating the Javadoc comment, including formatting guidelines and contextual information.
   */
  addUpdateDocPrompt(_: ChatGenerationContext, declKind: any, declRef: string) {
    return _.$`Update the Java Javadoc comment <DOCSTRING> to match the code in ${declKind} ${declRef}.
- If the docstring is up to date, return /NO/. It's ok to leave it as is.
- do not rephrase an existing sentence if it is correct.
- Make sure parameters are documented with @param tags.
- Use Javadoc syntax. do not wrap in markdown code section.
- Minimize updates to the existing docstring.

The full source of the file is in <FILE> for reference.
The source of the function is in ${declRef}.
The current docstring is <DOCSTRING>.

javadoc:

/**
 * description
 * @param param1 description
 * @param param2 description
 * @return description
 * @throws ExceptionType description
 */
`;
  }
}

export const javaOps = new Java();
