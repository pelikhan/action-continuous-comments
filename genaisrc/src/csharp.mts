import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";

const dbg = host.logger("script:csharp");

import type { EntityKind, LanguageOps } from "./langops.mts";

/**
 * Provides C#-specific implementations of language operations for automated documentation workflows.
 *
 * Implements matching logic for commentable nodes, extraction of comment nodes, handling of doc comment formatting, and prompt generation for doc comment tasks.
 *
 * @implements LanguageOps
 *
 * @method getCommentableNodesMatcher
 *   Returns a match rule for AST nodes that can be documented based on entity kinds, comment presence, and export status.
 *   @param entityKinds An array of entity kinds to match (e.g., "module", "type", "property", "function").
 *   @param withComments Whether to match nodes with existing comments.
 *   @param exportsOnly Whether to restrict matches to exported nodes only.
 *   @returns An object representing the matching rule for commentable nodes.
 *
 * @method getCommentNodes
 *   Retrieves contiguous comment nodes preceding a given node.
 *   @param node The AST node from which to collect preceding comments.
 *   @returns An array of comment nodes.
 *
 * @method getCommentInsertionNode
 *   Identifies the node at which to insert comments.
 *   @param node The AST node under consideration.
 *   @returns The node for comment insertion.
 *
 * @method getLanguageSystemPromptName
 *   Returns the system prompt name for C# language tasks.
 *   @returns The prompt name as a string.
 *
 * @method getCommentText
 *   Formats documentation text as a C# XML doc comment.
 *   @param docs The documentation content.
 *   @returns The formatted doc comment string.
 *
 * @method addGenerateDocPrompt
 *   Constructs a prompt for generating a new C# doc comment.
 *   @param _ Chat generation context.
 *   @param declKind The kind of declaration.
 *   @param declRef Reference identifier of the declaration.
 *   @param fileRef File reference containing the declaration.
 *   @returns The generated prompt string.
 *
 * @method addUpdateDocPrompt
 *   Constructs a prompt for updating an existing C# doc comment to reflect code changes.
 *   @param _ Chat generation context.
 *   @param declKind The kind of declaration.
 *   @param declRef Reference identifier of the declaration.
 *   @returns The generated update prompt string.
 */
class CSharp implements LanguageOps {
  /**
   * Constructs an AST-Grep rule to match commentable C# nodes based on provided entity kinds, comment presence, and export status.
   *
   * @param entityKinds Array of entity kinds to match (e.g., module, type, property, function).
   * @param withComments If true, only nodes with preceding comments are matched; otherwise, only nodes without.
   * @param exportsOnly If true, restricts matches to exported entities.
   * @returns An SgRule object representing the match criteria.
   */
  getCommentableNodesMatcher(
    entityKinds: EntityKind[],
    withComments: boolean,
    exportsOnly: boolean
  ) {
    const declKindsRaw: SgRule = {
      any: [
        entityKinds.includes("module")
          ? { kind: "namespace_declaration" }
          : null,
        entityKinds.includes("type") ? { kind: "delegate_declaration" } : null,
        entityKinds.includes("type") ? { kind: "struct_declaration" } : null,
        entityKinds.includes("type") ? { kind: "class_declaration" } : null,
        entityKinds.includes("type") ? { kind: "interface_declaration" } : null,
        entityKinds.includes("type") ? { kind: "enum_declaration" } : null,
        entityKinds.includes("property") ? { kind: "field_declaration" } : null,
        entityKinds.includes("property")
          ? { kind: "event_field_declaration" }
          : null,
        entityKinds.includes("property")
          ? { kind: "property_declaration" }
          : null,
        entityKinds.includes("property")
          ? { kind: "indexer_declaration" }
          : null,
        entityKinds.includes("property")
          ? { kind: "enum_member_declaration" }
          : null,
        entityKinds.includes("function")
          ? { kind: "method_declaration" }
          : null,
        entityKinds.includes("function")
          ? { kind: "constructor_declaration" }
          : null,
        entityKinds.includes("function")
          ? { kind: "operator_declaration" }
          : null,
      ].filter(Boolean) as SgRule[],
    };
    // If export only then require an 'export'
    const declKinds: SgRule = {
      any: [
        declKindsRaw,
        // exportsOnly ? { any: [] } : declKindsRaw,
        // {
        //   kind: "export_statement",
        //   has: declKindsRaw,
        // },
      ],
    };
    const inside: SgRule = {
      inside: {
        all: [],
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
   * Retrieves all consecutive comment nodes preceding the given node.
   *
   * @param node The AST node from which to start collecting preceding comments.
   * @returns An array of comment nodes found directly before the given node.
   */
  getCommentNodes(node: SgNode) {
    const commentNodes = [];
    while (node && node.prev() && node.prev().kind() === "comment") {
      node = node.prev();
      commentNodes.push(node);
    }
    return commentNodes;
  }

  /**
   * Returns the node where a documentation comment should be inserted.
   *
   * @param node The AST node for which a comment insertion point is determined.
   * @returns The node to use as the target for inserting a comment.
   */
  getCommentInsertionNode(node: SgNode) {
    return node;
  }

  /**
   * Returns the system prompt name for the language.
   * @returns The language system prompt name as a string.
   */
  getLanguageSystemPromptName() {
    return "";
  }
  /**
   * Formats the given documentation string as a C# XML documentation comment.
   *
   * @param docs - The raw documentation string to format.
   * @returns The formatted documentation comment with line prefixes.
   */
  getCommentText(docs: string) {
    docs = parsers.unfence(docs, "*");

    docs = `/// ${docs
      .split(/\r?\n/g)
      .map((s) => s.trim())
      .join("/// ")}`;
    return docs;
  }
  /**
   * Generates a prompt for creating a C# XML documentation comment for a code declaration.
   *
   * @param _ - The chat generation context.
   * @param declKind - The kind of declaration (e.g., class, method).
   * @param declRef - The reference or name of the declaration.
   * @param fileRef - The file path containing the declaration.
   * @returns A string prompt instructing how to generate the documentation comment.
   */
  addGenerateDocPrompt(
    _: ChatGenerationContext,
    declKind: any,
    declRef: string,
    fileRef: string
  ) {
    return _.$`Generate a C# documentation comment for the ${declKind} ${declRef}.
- Make sure parameters, type parameters, and return types are documented if relevant.
- Be concise. Use a technical tone.
- Do NOT include types, this is for C#.
- Use XML doc syntax.
The full source of the file is in ${fileRef} for reference.`;
  }

  /**
   * Generates a prompt instructing an AI to update a C# docstring for a given declaration.
   *
   * @param _ - The chat generation context.
   * @param declKind - The kind of declaration to document.
   * @param declRef - Reference/source code of the declaration.
   * @returns A string prompt for updating the C# XML docstring.
   */
  addUpdateDocPrompt(_: ChatGenerationContext, declKind: any, declRef: string) {
    return _.$`Update the C# docstring <DOCSTRING> to match the code in ${declKind} ${declRef}.
- If the docstring is up to date, return /NO/. It's ok to leave it as is.
- do not rephrase an existing sentence if it is correct.
- Make sure parameters are documented.
- Do NOT include types, this is for C#.
- Use docstring syntax. do not wrap in markdown code section.
- Minimize updates to the existing docstring.

The full source of the file is in <FILE> for reference.
The source of the function is in ${declRef}.
The current docstring is <DOCSTRING>.`;
  }
}
export const csharpOps = new CSharp();
