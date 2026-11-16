# Gemini CLI from GitHub Issues (staging)

Status: **not active until this PR is merged and the secret is configured**.

## One-time setup
1. GitHub repo → Settings → Secrets and variables → Actions → New repository secret.
2. Name: `GEMINI_API_KEY`. Value: your Google AI Studio key. Never post it in issues, commits, or chats. Free API quotas and supported models vary.
3. Repo → Settings → Actions → General → Workflow permissions: ensure Actions can create pull requests. The workflow requires `contents: write` and `pull-requests: write`.
4. Create the issue label `gemini-run` (once).

## From GitHub mobile app
1. Create a new issue **as apotet** in `apotet/my-gemini-mirror-site`, with clear requirements and acceptance criteria.
2. Apply label `gemini-run` **as apotet** to start the workflow. Labeling an existing issue also triggers it.
3. Follow progress under Actions → Gemini from GitHub Issue.
4. If successful, Gemini opens a **draft PR** into staging `main`. Review and test it before merging. Production `apotet/netops` is never targeted.

## Safety and limits
- Only an issue authored and labeled by `apotet` can start a run.
- Each run uses a fresh GitHub-hosted runner and a new branch.
- The model is autonomous inside that runner (`--approval-mode yolo`); only submit trusted issue text. It does not get `GH_TOKEN` during generation; Git credentials are not persisted by checkout.
- GitHub workflow changes are rejected, and validation must pass before a draft PR is opened.
- No automatic merge or deployment is performed by this workflow, but **existing CI/CD triggered by PRs or merges may still run**.
- API key is available to the model's process as an environment variable: do not use this for untrusted issues or unreviewed third-party code.
- A failed run requires manual inspection; no PR may be created.
- Actions minutes, storage, and Gemini API have separate quotas. Codespaces need not be running.

## Troubleshooting
- No run: verify the workflow is merged to default branch, label spelling, issue author, and actor.
- Missing key: configure `GEMINI_API_KEY` repository secret.
- PR creation denied: enable repository Actions permission to create PRs.
- Model quota or model selection errors: inspect Actions logs and Gemini API project quotas.
