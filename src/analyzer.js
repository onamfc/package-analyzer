import fs from 'fs/promises';
import path from 'path';
import { execSync } from 'child_process';

export async function analyzeProject(projectPath = process.cwd()) {
  const packageJsonPath = path.join(projectPath, 'package.json');

  try {
    const packageJson = JSON.parse(await fs.readFile(packageJsonPath, 'utf-8'));
    const dependencies = {
      ...packageJson.dependencies,
      ...packageJson.devDependencies
    };

    if (!dependencies || Object.keys(dependencies).length === 0) {
      return { total: 0, dependencies: [], error: 'No dependencies found' };
    }

    const results = [];

    for (const [name, version] of Object.entries(dependencies)) {
      const size = await getPackageSize(name, projectPath);
      results.push({ name, version, size });
    }

    results.sort((a, b) => b.size - a.size);

    const total = results.reduce((sum, pkg) => sum + pkg.size, 0);

    return {
      total,
      dependencies: results,
      projectPath
    };
  } catch (error) {
    throw new Error(`Failed to analyze project: ${error.message}`);
  }
}

async function getPackageSize(packageName, projectPath) {
  const nodeModulesPath = path.join(projectPath, 'node_modules', packageName);

  try {
    await fs.access(nodeModulesPath);
    const size = await getDirectorySize(nodeModulesPath);
    return size;
  } catch {
    return 0;
  }
}

async function getDirectorySize(dirPath) {
  let totalSize = 0;

  try {
    const entries = await fs.readdir(dirPath, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);

      if (entry.isDirectory()) {
        totalSize += await getDirectorySize(fullPath);
      } else if (entry.isFile()) {
        const stats = await fs.stat(fullPath);
        totalSize += stats.size;
      }
    }
  } catch (error) {
    return 0;
  }

  return totalSize;
}

export function formatSize(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function formatResults(results) {
  const lines = [];

  lines.push('\n📦 Package Size Analysis\n');
  lines.push('─'.repeat(60));
  lines.push(`Total Size: ${formatSize(results.total)}\n`);

  if (results.dependencies.length === 0) {
    lines.push('No dependencies installed.');
    return lines.join('\n');
  }

  lines.push(`${'Package'.padEnd(40)} ${'Size'.padStart(15)}`);
  lines.push('─'.repeat(60));

  for (const dep of results.dependencies) {
    const name = dep.name.length > 38 ? dep.name.substring(0, 35) + '...' : dep.name;
    const size = formatSize(dep.size);
    lines.push(`${name.padEnd(40)} ${size.padStart(15)}`);
  }

  lines.push('─'.repeat(60));

  return lines.join('\n');
}
