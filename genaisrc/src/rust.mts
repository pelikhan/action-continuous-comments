import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";

const dbg = host.logger("script:rust");

import type { EntityKind, LanguageOps } from "./langops.mts";

class Rust implements LanguageOps {
  getCommentableNodesMatcher(
    entityKinds: EntityKind[],
    withComments: boolean,
    exportsOnly: boolean
  ) {
    const declKindsRaw: SgRule = {
      any: [
        // Functions
        entityKinds.includes("function") ? { kind: "function_item" } : null,
        // Types (structs, enums, type aliases, traits)
        entityKinds.includes("type") ? { kind: "struct_item" } : null,
        entityKinds.includes("type") ? { kind: "enum_item" } : null,
        entityKinds.includes("type") ? { kind: "type_item" } : null,
        entityKinds.includes("type") ? { kind: "trait_item" } : null,
        entityKinds.includes("type") ? { kind: "impl_item" } : null,
        // Module items
        entityKinds.includes("module") ? { kind: "mod_item" } : null,
        // Constants and static variables
        entityKinds.includes("variable") ? { kind: "const_item" } : null,
        entityKinds.includes("variable") ? { kind: "static_item" } : null,
      ].filter(Boolean) as SgRule[],
    };

    // Rust has public/private visibility, so we can filter by pub if exportsOnly is true
    const declKinds: SgRule = exportsOnly
      ? {
          any: [
            {
              any: declKindsRaw.any,
              has: { kind: "visibility_modifier" },
            },
          ],
        }
      : {
          any: [declKindsRaw],
        };

    const inside: SgRule = {
      inside: {
        any: [
          { kind: "source_file" }, // Rust files have source_file as root
          { kind: "mod_item" }, // Or inside modules
          { kind: "impl_item" }, // Or inside impl blocks
        ],
      },
    };

    const withDocComment: SgRule = {
      follows: {
        kind: "line_comment",
        regex: "^///",
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
    // Collect all preceding doc comment nodes (///)
    while (
      current &&
      current.kind() === "line_comment" &&
      current.text().startsWith("///")
    ) {
      commentNodes.unshift(current); // Add to beginning to maintain order
      current = current.prev();
    }
    return commentNodes.length > 0 ? commentNodes : null;
  }

  getCommentInsertionNode(node: SgNode) {
    return node;
  }

  getLanguageSystemPromptName() {
    return "";
  }

  getCommentText(docs: string) {
    docs = parsers.unfence(docs, "/");

    // Check if it's already properly formatted Rust doc comments
    if (/^\/\/\//.test(docs.trim())) {
      return docs;
    }

    // Format as Rust doc comments
    const lines = docs
      .split(/\r?\n/g)
      .map((line) => line.trim())
      .filter((line) => line);

    return lines.map((line) => `/// ${line}`).join("\n");
  }

  addGenerateDocPrompt(
    _: ChatGenerationContext,
    declKind: any,
    declRef: string,
    fileRef: string
  ) {
    return _.$`Generate a Rust documentation comment for the ${declKind} ${declRef}.
- Make sure parameters, return types, and errors are documented if relevant.
- Be concise. Use a technical tone.
- Use Rust doc comment syntax with triple slashes (///).
- Use standard Rust documentation conventions.
- Do NOT include types in parameter descriptions, this is for Rust.
The full source of the file is in ${fileRef} for reference.`;
  }

  addUpdateDocPrompt(_: ChatGenerationContext, declKind: any, declRef: string) {
    return _.$`Update the Rust documentation comment <DOCSTRING> to match the code in ${declKind} ${declRef}.
- If the docstring is up to date, return /NO/. It's ok to leave it as is.
- Do not rephrase an existing sentence if it is correct.
- Make sure parameters, return types, and errors are documented.
- Use Rust doc comment syntax with triple slashes (///).
- Use standard Rust documentation conventions.
- Do NOT include types in parameter descriptions, this is for Rust.
- Minimize updates to the existing docstring.

The full source of the file is in <FILE> for reference.
The source of the function is in ${declRef}.
The current docstring is <DOCSTRING>.`;
  }
}

export const rustOps = new Rust();
