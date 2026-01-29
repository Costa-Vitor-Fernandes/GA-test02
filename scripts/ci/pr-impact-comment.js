module.exports = async ({ github, context }) => {

            const type = "${{ steps.lint.outputs.type }}"; // ex: feat
            const isBreaking = "${{ steps.lint.outputs.is_breaking }}" === "true";
            
            let impact = "Patch (Bug Fix) 🐛";
            if (isBreaking) impact = "Major (Breaking Change) 💥";
            else if (type === 'feat') impact = "Minor (New Feature) ✨";

            const body = `### 📦 Version Impact Analysis\n\n- **Type:** \`${type}\`\n- **Impact:** **${impact}**\n\n*🤖 Auto-calculated based on PR title.*`;
            
            const { data: comments } = await github.rest.issues.listComments({
              owner: context.repo.owner,
              repo: context.repo.repo,
              issue_number: context.issue.number,
            });

            const botComment = comments.find(c => c.body.includes('Version Impact Analysis'));

            if (botComment) {
              await github.rest.issues.updateComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                comment_id: botComment.id,
                body
              });
            } else {
              await github.rest.issues.createComment({
                owner: context.repo.owner,
                repo: context.repo.repo,
                issue_number: context.issue.number,
                body
              });
            }};