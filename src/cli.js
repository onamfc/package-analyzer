import { Command } from 'commander';
import pc from 'picocolors';
import ora from 'ora';
import { analyzeProject, formatResults } from './analyzer.js';

export async function run() {
  const program = new Command();

  program
    .name('pkg-inspect')
    .description('CLI + API that scans a project and shows dependency size breakdowns')
    .version('1.0.1')
    .argument('[path]', 'Project path to analyze', process.cwd())
    .option('-j, --json', 'Output as JSON')
    .option('--no-color', 'Disable colored output')
    .action(async (projectPath, options) => {
      const spinner = options.json ? null : ora('Analyzing dependencies...').start();

      try {
        const results = await analyzeProject(projectPath);

        if (spinner) spinner.succeed('Analysis complete!');

        if (options.json) {
          console.log(JSON.stringify(results, null, 2));
        } else {
          const output = formatResults(results);
          console.log(output);

          if (results.dependencies.length > 0) {
            const topThree = results.dependencies.slice(0, 3);
            console.log(pc.yellow('\n💡 Top 3 largest dependencies:'));
            topThree.forEach((dep, i) => {
              console.log(pc.cyan(`   ${i + 1}. ${dep.name}`));
            });
          }
        }
      } catch (error) {
        if (spinner) spinner.fail('Analysis failed');
        console.error(pc.red(`Error: ${error.message}`));
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}
