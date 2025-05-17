import { program } from "commander";
import { chat2json } from "./chat2json.js";
import { list2md } from "./list2md.js";
import fs from "fs";
program
    .command("chat2json <convUrl> <outFile>")
    .description("Turn ChatGPT conversation to JSON file")
    .option("-t, --token [token]", "OpenAI Bearer token", "")
    .action(async (convUrl, outFile, opts) => {
    const messages = await chat2json(convUrl, opts.token);
    await fs.writeFile(outFile, JSON.stringify(messages, null, 2), err => {
        if (err)
            throw err;
        console.log(`Saved to ${outFile}`);
    });
});
program
    .command("list2md <jsonFile> <outFile>")
    .description("Turn ChatGPT conversation to Markdown file")
    .action(async (jsonFile, outFile) => {
    const messages = JSON.parse(fs.readFileSync(jsonFile, "utf-8"));
    const md = list2md(messages);
    await fs.writeFile(outFile, md, err => {
        if (err)
            throw err;
        console.log(`Saved to ${outFile}`);
    });
});
program.parse();
