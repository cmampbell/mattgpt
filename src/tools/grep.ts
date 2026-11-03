import Anthropic from "@anthropic-ai/sdk";
import { execSync } from "node:child_process";

const grep: Anthropic.Tool = ({
  name: "grep",
  input_schema: {
    type: "object",
    properties: {
      pattern: { type: "string", description: "The pattern to find. May be word(s) or a regular expression" },
      dir: { type: "string", description: "Directory to search. Default: working dir" },
    },
    required: ["pattern"]
  },
  description: `Match a pattern in a file. Returns the matching lines.
    WHEN TO USE: Searching across files for a pattern.
    WHEN NOT TO USE: When asked about file information. Running commands.
    EXAMPLES: "Find all TODO comments.", "Where do we define the testList variable?"`,
})

function grepDir(pattern: string, dir: string = ".") {

  console.log(pattern)
  const cmd = `grep -rni --exclude-dir=node_modules --exclude-dir=.git "${pattern}" '${dir}' 2>/dev/null`;

  try {
    const stdout = execSync(cmd, { encoding: "utf-8", timeout: 10_000 });
    const lines = stdout.trim().split("\\n").filter(Boolean);

    const MAX_MATCHES = 50;
    const truncated = lines.length > MAX_MATCHES;
    const result = truncated ? lines.slice(0, MAX_MATCHES) : lines;

    return truncated
      ? result.join("\\n") + `\\n... (${lines.length} total, showing first ${MAX_MATCHES})`
      : result.join("\\n") || "No matches found.";
  } catch (error: any) {
    const stdout = String(error?.stdout || "").trim();
    if (stdout) {
      const lines = stdout.split("\\n").filter(Boolean);
      const MAX_MATCHES = 50;
      const truncated = lines.length > MAX_MATCHES;
      const result = truncated ? lines.slice(0, MAX_MATCHES) : lines;
      return truncated
        ? result.join("\\n") + `\\n... (${lines.length} total, showing first ${MAX_MATCHES})`
        : result.join("\\n");
    }
    return "No matches found.";
  }
}

export { grep, grepDir };
