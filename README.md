# Package Analyzer

CLI + API that scans a project and shows dependency size breakdowns locally.

## Features

- Analyzes installed dependency sizes in `node_modules`
- Shows sorted list of dependencies by size
- Works as both a CLI tool and importable API
- Formatted table output or JSON
- Fast local analysis without external API calls

## Installation

```bash
npm install -g @onamfc/pkg-inspect
```

Or use directly with npx:

```bash
npx @onamfc/pkg-inspect
```

## CLI Usage

Analyze the current directory:

```bash
pkg-inspect
```

Analyze a specific project:

```bash
pkg-inspect /path/to/project
```

Output as JSON:

```bash
pkg-inspect --json
```

Disable colored output:

```bash
pkg-inspect --no-color
```

## API Usage

```javascript
import { analyzeProject, formatSize, formatResults } from '@onamfc/pkg-inspect';

// Analyze a project
const results = await analyzeProject('./my-project');

console.log(`Total size: ${formatSize(results.total)}`);
console.log(`Dependencies found: ${results.dependencies.length}`);

// Format and display results
console.log(formatResults(results));

// Access individual dependency data
results.dependencies.forEach(dep => {
  console.log(`${dep.name}: ${formatSize(dep.size)}`);
});
```

## API Reference

### `analyzeProject(projectPath)`

Analyzes dependencies in a project.

**Parameters:**
- `projectPath` (string, optional) - Path to project directory. Defaults to current working directory.

**Returns:** Promise that resolves to:
```javascript
{
  total: 258254,                    // Total size in bytes
  dependencies: [
    {
      name: "package-name",
      version: "^1.0.0",
      size: 123456                  // Size in bytes
    }
  ],
  projectPath: "/path/to/project"
}
```

### `formatSize(bytes)`

Formats byte size to human-readable string.

**Parameters:**
- `bytes` (number) - Size in bytes

**Returns:** String (e.g., "1.23 MB", "456.78 KB")

### `formatResults(results)`

Formats analysis results as a readable table.

**Parameters:**
- `results` (object) - Results from `analyzeProject()`

**Returns:** Formatted string ready to display

## Example Output

```
📦 Package Size Analysis

────────────────────────────────────────────────────────────
Total Size: 252.20 KB

Package                                             Size
────────────────────────────────────────────────────────────
commander                                      182.03 KB
picocolors                                      15.20 KB
ora                                             26.87 KB
────────────────────────────────────────────────────────────

💡 Top 3 largest dependencies:
   1. commander
   2. ora
   3. picocolors
```

## How It Works

Unlike other packages that fetch data from npm, `pkg-inspect` analyzes your actual installed `node_modules` directory. This gives you:

- Real sizes after installation (not theoretical npm package sizes)
- Analysis of your specific version and dependencies
- No network requests needed
- Fast local analysis

## License
MIT
