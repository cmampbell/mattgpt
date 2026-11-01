import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import { myReadFile, read } from './read.js';

const prompt = process.argv[3];
console.log(prompt);
const client = new Anthropic();

function runTool(name: string, input: Record<string, unknown>) {
  console.log(name)
  console.log(JSON.stringify(input))
  if (name === "read") {
    return myReadFile(input.path as string, input.options as number, input.callback as number);
  }
}
const messages: Anthropic.MessageParam[] = [
  {
    role: "user",
    content: prompt
  }
]

const params: Anthropic.MessageCreateParams = {
  max_tokens: 1024,
  messages: messages,
  model: "claude-haiku-5-5",
  tools: [read]
};

let response: Anthropic.Message = await client.messages.create(params);

while (response.stop_reason === "tool_use") {
  const toolResults: Anthropic.ToolResultBlockParam[] = [];
  for (const block of response.content) {
    if (block.type === "tool_use") {
      try {
        const result = runTool(block.name, block.input as Record<string, unknown>);
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: JSON.stringify(result)
        });
      } catch (err) {
        toolResults.push({
          type: "tool_result",
          tool_use_id: block.id,
          content: String(err),
          is_error: true
        });
      }
    }
  }
  messages.push({ role: "assistant", content: response.content });
  messages.push({ role: "user", content: toolResults });
  response = await client.messages.create(params);
}

for (const block of response.content) {
  if (block.type === "text") {
    console.log(block.text);
  } else if (block.type === "tool_use") {
    console.log("Claude wanted to use a tool");

  }
}
