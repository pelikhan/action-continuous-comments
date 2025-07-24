import { type SgNode, type SgRule } from "@genaiscript/plugin-ast-grep";

const dbg = host.logger("script:java");

import type { EntityKind, LanguageOps } from "./langops.mts";

class Java implements LanguageOps {
  getCommentableNodesMatcher(
    entityKinds: EntityKind[],
    withComments: boolean,
    exportsOnly: boolean,
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

  getCommentInsertionNode(node: SgNode) {
    return node;
  }

  getLanguageSystemPromptName() {
    return "system.java";
  }

  getCommentText(docs: string) {
    docs = parsers.unfence(docs, "*");

    if (!/^\s*\/\*\*.*.*\*\/\s*$/s.test(docs)) {
      docs = `/**\n * ${docs.split(/\r?\n/g).join("\n * ")}\n */`;
    }
    return docs;
  }

  addGenerateDocPrompt(
    _: ChatGenerationContext,
    declKind: any,
    declRef: string,
    fileRef: string,
  ) {
    return _.$`Generate a Java documentation comment for the ${declKind} ${declRef}.
- Make sure parameters, type parameters, and return types are documented if relevant.
- Be concise. Use a technical tone.
- Use Javadoc syntax (https://docs.oracle.com/javase/8/docs/technotes/tools/windows/javadoc.html). Do not wrap in markdown code section.
- Start the comment with "/**" and end with "*/".
- Use @param for parameters, @return for return values, @throws for exceptions.
The full source of the file is in ${fileRef} for reference.`;
  }

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
