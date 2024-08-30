#!/usr/bin/env node

const inquirer = require("inquirer");
const shell = require("shelljs");
const fs = require("fs");

async function setupProject() {
	const answers = await inquirer.prompt([
		{
			type: "list",
			name: "framework",
			message: "What project framework would you like to set up?",
			choices: ["Vite"],
		},
		{
			type: "input",
			name: "appName",
			message: "App name: ",
		},
		{
			type: "list",
			name: "template",
			message: "Which Vite template would you like to use?",
			choices: ["react"],
			when: (answers) => answers.framework === "Vite",
		},
		{
			type: "list",
			name: "language",
			message: "Which language and bundler setup would you like to use?",
			choices: ["JavaScript"],
			when: (answers) => answers.framework === "Vite",
		},
		{
			type: "confirm",
			name: "tailwind",
			message: "Would you like to setup Tailwind CSS?",
		},
	]);

	if (answers.framework === "Vite") {
		let command = `npm create vite@latest ${answers.appName} -- --template ${answers.template}`;

		// Append the language choice to the command
		switch (answers.language) {
			case "JavaScript":
				// No additional template needed
				break;
			case "JavaScript + SWC":
				command += "-swc";
				break;
			case "TypeScript":
				command += "-ts";
				break;
		}

		console.log(`Running command: ${command}`);
		shell.exec(command);

		if (answers.tailwind) {
			shell.cd(answers.appName);
			shell.exec("npm install tailwindcss postcss autoprefixer");
			shell.exec("npx tailwindcss init -p");

			const cssPath = "src/index.css";
			const tailwindImports = `@tailwind base;\n@tailwind components;\n@tailwind utilities;\n`;
			fs.writeFileSync(cssPath, tailwindImports);

			const tailwindConfigPath = "tailwind.config.js";
			let tailwindConfig = fs.readFileSync(tailwindConfigPath, "utf8");
			tailwindConfig = tailwindConfig.replace(
				"content: [],",
				`content: ["./src/**/*.{html,js,jsx,ts,tsx}"],`
			);

			fs.writeFileSync(tailwindConfigPath, tailwindConfig);

			console.log("Tailwind CSS setup complete!");
		}
	}
}

setupProject();
