import 'dotenv/config'; 
import { query } from "@anthropic-ai/claude-agent-sdk";
import { z } from "zod";

const cwd = process.argv[2] || process.cwd();

const prompt = process.argv[3].slice(3);

for await ( const message of query({
	prompt: prompt,
	options: {
		allowedTools: []
	}
})) {
	if (message.type === "assistant" && message.message?.content) {
		for (const block of message.message.content) {
			if ("text" in block) {
				console.log(block.text);
			} else if ("name" in block) {
				console.log(`Tool: ${block.name}`);
			}
		}
	} else if (message.type === "result") {
		console.log(`Done: ${message.subtype}`);
	}
}

