import conventionalRecommendedBump from 'conventional-recommended-bump';
import { valid, inc } from 'semver';
import { execSync } from 'child_process';
import { appendFileSync } from 'fs';

async function calculateVersion() {
  try {
    let currentVersion = '0.0.0';
    try {
      const latestTag = execSync('git describe --tags --abbrev=0 2>/dev/null || echo "v0.0.0"')
        .toString().trim().replace(/^v/, '');
      currentVersion = valid(latestTag) || '0.0.0';
    } catch (e) {
      console.log('No tags found, defaulting to 0.0.0');
    }

    const result = await conventionalRecommendedBump({
      preset: 'conventionalcommits',
      tagPrefix: 'v'
    });

    const releaseType = result.releaseType;
    const newVersion = inc(currentVersion, releaseType);
    
    // Check for breaking changes in the diff
    const baseRef = process.env.BASE_REF || 'main';
    const commits = execSync(`git log origin/${baseRef}..HEAD --format=%B`).toString();
    const hasBreakingChange = commits.includes('BREAKING CHANGE:') || commits.includes('!:');

    // Output to GitHub Actions
    const output = `current=${currentVersion}\nnext=${newVersion}\nrelease_type=${releaseType}\nbreaking=${hasBreakingChange}\n`;
    appendFileSync(process.env.GITHUB_OUTPUT, output);

    console.log(`Summary: ${currentVersion} -> ${newVersion} (${releaseType})`);
  } catch (error) {
    console.error('Error calculating version:', error);
    process.exit(1);
  }
}

calculateVersion();