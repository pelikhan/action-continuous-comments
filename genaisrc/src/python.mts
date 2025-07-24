import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";
import type { EntityKind, LanguageOps } from "./langops.mts";

const dbg = host.logger("script:python");

/**
 * Implements LanguageOps for Python source analysis and docstring generation.
 *
 * Provides methods to:
 * - Identify commentable nodes such as functions and classes.
 * - Extract or locate docstrings within code declarations.
 * - Determine where Python docstrings should be inserted.
 * - Generate system prompts for updating and generating Python docstrings, following PEP 257 guidelines.
 *
 * Methods:
 * @param entityKinds Array of entity kinds to match (e.g., "function", "type").
 * @param withComments Whether to filter nodes that already have comments or docstrings.
 * @returns Matcher rules for commentable nodes.
 *
 * @param decl Node representing the Python declaration.
 * @returns Array of found docstring nodes, or null if absent.
 *
 * @param node Target node to locate insertion point for a docstring.
 * @returns Node where docstring can be inserted.
 *
 * @returns System prompt name for Python documentation.
 *
 * @param docs Raw documentation string.
 * @returns Formatted Python docstring, wrapped as needed.
 *
 * @param _ Chat generation context object.
 * @param declKind Kind of the code declaration (e.g., function, class).
 * @param declRef Reference string for the declaration.
 * @returns Prompt string for updating a Python docstring.
 *
 * @param _ Chat generation context object.
 * @param declKind Kind of the code declaration.
 * @param declRef Reference string for the declaration.
 * @param fileRef Reference for the source file.
 * @returns Prompt string for generating a Python docstring.
 */
class Python implements LanguageOps {
  /**
   * Constructs a matcher rule for identifying Python AST nodes that are eligible for documentation comments.
   *
   * @param entityKinds - Array of entity kinds (e.g., "function", "type") to match.
   * @param withComments - Whether to match only entities with an associated docstring.
   * @returns Matcher rule object for AST node selection.
   */
  getCommentableNodesMatcher(entityKinds: EntityKind[], withComments: boolean) {
    const declKinds: SgRule = {
      any: [
        entityKinds.includes("function")
          ? { kind: "function_definition" }
          : null,
        entityKinds.includes("type") ? { kind: "class_definition" } : null,
      ].filter(Boolean) as SgRule[],
    };
    const inside: SgRule = {
      inside: {
        any: [
          {
            kind: "module",
          },
          {
            kind: "block",
          },
        ],
      },
    };
    const withDocstring: SgRule = {
      has: {
        kind: "block",
        has: {
          nthChild: 1,
          kind: "expression_statement",
          has: {
            nthChild: 1,
            kind: "string",
          },
        },
      },
    };
    const docsRule: SgRule = withComments
      ? withDocstring
      : {
          not: withDocstring,
        };

    return { ...declKinds, ...inside, ...docsRule };
  }
  /**
   * Retrieves the docstring node associated with the given declaration node.
   *
   * @param decl - The declaration node to search for its related docstring.
   * @returns An array containing the docstring node if found, or null if no docstring exists.
   */
  getCommentNodes(decl: SgNode) {
    // Find the comment that follows the declaration
    const docnode = decl
      .find({ rule: { kind: "block" } })
      ?.find({ rule: { kind: "expression_statement" } })
      ?.find({ rule: { kind: "string" } });
    if (!docnode) {
      dbg(`no docstring found for %s`, decl.text());
      return null;
    }
    dbg(`found docnode: %s`, docnode.text());
    return [docnode];
  }
  /**
   * Returns the insertion node for a comment associated with the given AST node.
   * @param node The AST node representing the declaration.
   * @returns The block node where a docstring can be inserted, or undefined if not found.
   */
  getCommentInsertionNode(node: SgNode) {
    return node.find({ rule: { kind: "block" } });
  }

  /**
   * Returns the system prompt name used for Python language operations.
   * @returns The identifier string for the Python system prompt.
   */
  getLanguageSystemPromptName() {
    return "system.python";
  }
  /**
   * Formats the given documentation string as a Python docstring.
   * Ensures the string is wrapped in triple quotes if not already.
   *
   * @param docs - The documentation string to format.
   * @returns The formatted Python docstring.
   */
  getCommentText(docs: string) {
    docs = parsers.unfence(docs, '"');
    if (!/^\s*""".*.*"""$/s.test(docs)) {
      docs = `"""${docs.split(/\r?\n/g).join("\n")}${
        docs.includes("\n") ? "\n" : ""
      }"""`;
    }
    return docs;
  }

  /**
   * Generates a prompt to update the Python docstring for the specified declaration.
   *
   * @param _ - Chat generation context for template interpolation.
   * @param declKind - The kind of code entity (e.g., function, class).
   * @param declRef - Reference or name of the target declaration.
   * @returns The prompt instructing how to update the docstring based on PEP 257 guidelines.
   */
  addUpdateDocPrompt(_: ChatGenerationContext, declKind: any, declRef: string) {
    return _.$`Update the Python docstring <DOCSTRING> to match the code in ${declKind} ${declRef}.
- If the docstring is up to date, return /NO/. It's ok to leave it as is.
- do not rephrase an existing sentence if it is correct.
- Make sure parameters are documented.
- Use docstring syntax (https://peps.python.org/pep-0257/). Do not wrap in markdown code section.
- Minimize updates to the existing docstring.

The full source of the file is in <FILE> for reference.
The source of the function is in ${declRef}.
The current docstring is <DOCSTRING>.

docstring:

"""
description
:param param1: description
:param param2: description
:return: description
"""
`;
  }
  /**
   * Generates a prompt for creating a Python documentation comment for a specified declaration.
   *
   * @param _ - Chat generation context utility.
   * @param declKind - The kind of declaration (e.g., function, class) to document.
   * @param declRef - The reference identifier of the declaration.
   * @param fileRef - The source file containing the declaration.
   * @returns A templated string instructing on Python docstring generation.
   */
  addGenerateDocPrompt(
    _: ChatGenerationContext,
    declKind: string,
    declRef: string,
    fileRef: string
  ) {
    return _.$`Generate a Python documentation comment for the ${declKind} ${declRef}.
- Make sure parameters, type parameters, and return types are documented if relevant.
- Be concise. Use a technical tone.
- Use docstring syntax (https://peps.python.org/pep-0257/). Do not wrap in markdown code section.
The full source of the file is in ${fileRef} for reference.`;
  }
}

export const pythonOps = new Python();
