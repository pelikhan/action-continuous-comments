/**
 * / **
 *  * Options for configuring the cowsay output.
 *  *
 *  * @property text - The message to be displayed by the cow.
 *  * @property mode - The mode of speech: "say" uses speech bubbles, "think" uses thought bubbles. Defaults to "say".
 *  * @property eyes - Custom eye characters for the cow. Defaults to "oo".
 *  * @property tongue - Custom tongue characters for the cow. Defaults to two spaces.
 *  * /
 */
export interface CowsayOptions {
  text: string;
  mode?: "say" | "think";
  eyes?: string;
  tongue?: string;
}

/**
 * / **
 *  * Generates a cowsay ASCII art string with a speech or thought bubble.
 *  *
 *  * @param options - The options for the cowsay output or a string as the message text.
 *  *   - text: The message to display inside the bubble.
 *  *   - mode: Either "say" for a speech bubble or "think" for a thought bubble (optional).
 *  *   - eyes: Custom eyes string for the cow's face (optional).
 *  *   - tongue: Custom tongue string for the cow's face (optional).
 *  * @returns The complete cowsay ASCII art string.
 *  */
 */
export function cowsay(options: CowsayOptions | string): string {
  // Handle string argument
  const opts: CowsayOptions =
    typeof options === "string" ? { text: options } : options;

  // Default options
  const { text = "", mode = "say", eyes = "oo", tongue = "  " } = opts;

  // Split text into lines
  const lines = formatText(text);

  // Create the speech bubble
  const bubble = createBubble(lines, mode);

  // Create the cow
  const cow = createCow(eyes, tongue, mode);

  // Combine the bubble and cow
  return bubble + cow;
}

/**
 * / **
 *  * Splits a given text into multiple lines with a specified maximum width.
 *  *
 *  * @param text - The input string to be split into lines.
 *  * @param maxWidth - The maximum width of each line, defaulting to 40.
 *  * @returns An array of strings, each representing a line of text not exceeding maxWidth.
 *  * /
 */
function formatText(text: string, maxWidth: number = 40): string[] {
  if (!text) return [""];

  const words = text.split(" ");
  const lines: string[] = [];
  let currentLine = "";

  for (const word of words) {
    if (currentLine.length + word.length + 1 <= maxWidth) {
      currentLine += (currentLine ? " " : "") + word;
    } else {
      lines.push(currentLine);
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * Generates a speech or thought bubble around the provided lines of text.
 *
 * @param lines The array of text lines to include in the bubble.
 * @param mode Determines the style of the bubble, either "say" for speech or "think" for thought.
 * @returns The constructed bubble as a string.
 */
function createBubble(lines: string[], mode: "say" | "think"): string {
  if (lines.length === 0) return "";

  const maxLength = Math.max(...lines.map((line) => line.length));
  let result = " " + "_".repeat(maxLength + 2) + "\n";

  if (lines.length === 1) {
    const line = lines[0];
    const padding = " ".repeat(maxLength - line.length);
    result +=
      mode === "say" ? `< ${line}${padding} >\n` : `( ${line}${padding} )\n`;
  } else {
    lines.forEach((line, i) => {
      const padding = " ".repeat(maxLength - line.length);
      let prefix, suffix;

      if (i === 0) {
        prefix = mode === "say" ? "/ " : "( ";
        suffix = mode === "say" ? " \\" : " )";
      } else if (i === lines.length - 1) {
        prefix = mode === "say" ? "\\ " : "( ";
        suffix = mode === "say" ? " /" : " )";
      } else {
        prefix = mode === "say" ? "| " : "( ";
        suffix = mode === "say" ? " |" : " )";
      }

      result += `${prefix}${line}${padding}${suffix}\n`;
    });
  }

  result += " " + "-".repeat(maxLength + 2) + "\n";
  return result;
}

// Create the ASCII cow
function createCow(
  eyes: string,
  tongue: string,
  mode: "say" | "think"
): string {
  return `        \\   ^__^
           \\  (${eyes})\\_______
              (__)\\       )\\/\\
               ${tongue}||----w |
                  ||     ||
  `;
}

/**
 * Generates a cow saying or thinking the given text in ASCII art.
 *
 * @param options - Text to display or configuration options for the cowthink.
 * @returns The ASCII art string of a cow thinking the provided text.
 */
export function cowthink(options: CowsayOptions | string): string {
  const opts = typeof options === "string" ? { text: options } : options;
  return cowsay({ ...opts, mode: "think" });
}
