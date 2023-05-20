#!/usr/bin/env node
const axios = require('axios');
const yargs = require('yargs/yargs');
const { hideBin } = require('yargs/helpers');

// Function to fetch commands.md from GitHub repo
const fetchCommands = async (user, repo) => {
    try {
        const url = `https://api.github.com/repos/${user}/${repo}/contents/commands.md`;
        const response = await axios.get(url, {
            headers: {
                'Accept': 'application/vnd.github.v3.raw',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Error fetching commands: ${error}`);
    }
};

// Function to parse commands into an object
const parseCommands = (commands) => {
    const lines = commands.split('\n');
    let commandDict = {};
    lines.forEach(line => {
        // Matches "- `command`: Description"
        const match = line.match(/- `(.+?)`: (.+)/);
        if (match) {
            const [ , command, description ] = match;
            commandDict[command.trim()] = description.trim();
        }
    });
    return commandDict;
};

// Define CLI commands
yargs(hideBin(process.argv))
    .command('get-help [command]', 'get help text from a GitHub repo', {}, async (argv) => {
        const commands = await fetchCommands('princerajpoot20', 'CustomCLI');
        const commandDict = parseCommands(commands);

        if (argv.command) {
            // If a command was specified, show help for that command
            if (commandDict[argv.command]) {
                console.log(`${argv.command}: ${commandDict[argv.command]}`);
            } else {
                console.log(`No help available for command: ${argv.command}`);
            }
        } else {
            // If no command was specified, show help for all commands
            Object.entries(commandDict).forEach(([command, description]) => {
                console.log(`${command}: ${description}`);
            });
        }
    })
    .argv;
