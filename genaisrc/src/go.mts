import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";

const dbg = host.logger("script:go");

import type { EntityKind, LanguageOps } from "./langops.mts";

class Go implements LanguageOps {
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

  getCommentNodes(node: SgNode) {
    const commentNodes = [];
    let current = node.prev();
    // Collect all preceding comment nodes (//)
    while (current && current.kind() === "comment" && current.text().startsWith("//")) {
      commentNodes.unshift(current); // Add to beginning to maintain order
      current = current.prev();
    }
    return commentNodes.length > 0 ? commentNodes : null;
  }

  getCommentInsertionNode(node: SgNode) {
    return node;
  }

  getLanguageSystemPromptName() {
    return "system.go";
  }

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

    return lines
      .map((line) => `// ${line}`)
      .join("\n");
  }

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