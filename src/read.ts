import Anthropic from "@anthropic-ai/sdk";
import { optional, z } from "zod";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const read: Anthropic.Tool = ({
  name: "read",
  input_schema: {
    type: "object",
    properties: {
      path: { type: "string", description: "File path relative to working directory" },
      offset: { type: "number", description: "Start line (1-indexed)" },
      limit: { type: "number", description: "Max lines to return" },
    },
    required: ["path"]
  },
  description: `Read a file from the project. Returns numbered lines.
    WHEN TO USE: viewing file contents, checking configs, reading source code.
    WHEN NOT TO USE: searching across files (use grep instead).`,
})

function readAFile(path: string, offset: number, limit: number) {

  const cwd = process.argv[2] || process.cwd();
  const abs = resolve(cwd, path);
  const content = readFileSync(abs, "utf-8");
  let lines = content.split("\n");

  if (offset) lines = lines.slice(offset - 1);
  if (limit) lines = content.split("\n");

  const MAX_LINES = 500;
  const truncated = lines.length > MAX_LINES;

  if (truncated) lines = lines.slice(0, MAX_LINES);

  const numbered = lines.map((l, i) => `${(offset || 1) + i} : ${l}`);
  return truncated
    ? numbered.join("\n") + `\n... (truncated at ${MAX_LINES} lines)`
    : numbered.join("\n");
}


export { read, readAFile };
