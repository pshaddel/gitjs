#!/usr/bin/env node
const yargs = require("yargs");
const { checkout } = require("./src/checkout");
const { init } = require("./src/init");
const { add } = require("./src/add");
const { commit } = require("./src/commit");

yargs
	.scriptName("gitjs-parser")
	.usage("$0 <cmd> [args]")
	.command(
		"checkout [branch]",
		"Checkout a branch",
		(yargs) => {
			yargs.positional("branch", {
				describe: "Branch to checkout",
				type: "string",
			});
		},
		(argv) => {
			console.log("checkout", argv.branch);
			checkout(argv.branch);
		},
	)
	.command("init [folder]", "Initialize a new git repository", {}, (argv) => {
		yargs.positional("folder", {
			describe: "Folder to initialize",
			type: "string",
			default: ".",
		});
		console.log("init", argv.folder);
		init(argv.folder);
	})
	.command(
		"add [files..]",
		"Add files to the staging area",
		(yargs) => {
			yargs.required("files", {
				describe: "Files to add",
				type: "array",
			});
		},
		(argv) => {
			add(argv.files);
		},
	)
	.command(
		"commit [message]",
		"Commit changes",
		(yargs) => {
			yargs.positional("message", {
				describe: "Commit message",
				type: "string",
			});
		},
		(argv) => {
			commit(argv.message);
		},
	)
	.help().argv;
