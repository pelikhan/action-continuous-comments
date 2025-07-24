import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";
/**
 * Represents the kinds of entities that can be documented or processed within the language operations.
 * Can include modules, types, functions, properties, or variables.
 */
export type EntityKind =
  | "module"
  | "type"
  | "function"
  | "property"
  | "variable";

/**
 * Defines methods for manipulating language-specific documentation and comment nodes.
 *
 * @remarks
 * Provides operations to identify, retrieve, and insert documentation comments for AST nodes.
 *
 * @property getCommentableNodesMatcher - Returns a matcher rule for commentable entities.
 * @param entityKinds - Array of entity kinds to match.
 * @param withComments - If true, include entities with existing comments.
 * @param exportsOnly - If true, only match exported entities.
 * @returns Matcher rule for AST traversal.
 *
 * @property getCommentNodes - Retrieves the range of doc comment nodes for the given declaration.
 * @param decl - AST node representing a declaration.
 * @returns Array of comment nodes or null.
 *
 * @property getCommentInsertionNode - Identifies the node for inserting a new comment.
 * @param node - AST node to annotate.
 * @returns Node where a comment should be inserted.
 *
 * @property getCommentText - Formats documentation text for insertion as a comment.
 * @param docs - Raw documentation string.
 * @returns Formatted comment text.
 *
 * @property getLanguageSystemPromptName - Gets the system prompt identifier for the language.
 * @returns System prompt string.
 *
 * @property addUpdateDocPrompt - Provides a documentation update prompt template string.
 * @param _ - Chat context (unused).
 * @param declKind - Declaration kind.
 * @param declRef - Declaration reference.
 * @returns Prompt template string.
 *
 * @property addGenerateDocPrompt - Returns a documentation generation prompt template string.
 * @param _ - Chat context (unused).
 * @param declKind - Kind of the declaration node.
 * @param declRef - Declaration reference.
 * @param fileRef - File reference.
 * @returns Prompt template string.
 */
export interface LanguageOps {
  getCommentableNodesMatcher: (
    entityKinds: EntityKind[],
    withComments: boolean,
    exportsOnly: boolean
  ) => SgRule;

  /** Given a commentable node which already has a doc comment, find the range of comment nodes */
  getCommentNodes: (decl: SgNode) => SgNode[] | null;

  /** Given a commentable node without a doc comment, find the node where we insert the comment */
  getCommentInsertionNode: (node: SgNode) => SgNode;

  /** Given a string of documentation, return the text to insert as a comment */
  getCommentText: (docs: string) => string;

  getLanguageSystemPromptName: () => string;

  addUpdateDocPrompt: (
    _: ChatGenerationContext,
    declKind: any,
    declRef: string
  ) => PromptTemplateString;

  addGenerateDocPrompt: (
    _: ChatGenerationContext,
    declKind: ReturnType<SgNode["kind"]>,
    declRef: string,
    fileRef: string
  ) => PromptTemplateString;
}
