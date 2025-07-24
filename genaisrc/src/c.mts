import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";

const dbg = host.logger("script:c");

import type { EntityKind, LanguageOps } from "./langops.mts";

class C implements LanguageOps {
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

  getCommentInsertionNode(node: SgNode) {
    return node;
  }

  getLanguageSystemPromptName() {
    return "system.c";
  }

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
