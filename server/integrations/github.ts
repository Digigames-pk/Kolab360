import { Octokit } from '@octokit/rest';
import { Router } from 'express';

const router = Router();

// GitHub Integration Service
class GitHubIntegration {
  private octokit: Octokit | null = null;

  constructor() {
    if (process.env.GITHUB_TOKEN) {
      this.octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN,
      });
    }
  }

  async getRepositories(username?: string) {
    if (!this.octokit) {
      throw new Error('GitHub not configured');
    }

    const result = username 
      ? await this.octokit.repos.listForUser({ username })
      : await this.octokit.repos.listForAuthenticatedUser();

    return result.data;
  }

  async getRepoCommits(owner: string, repo: string) {
    if (!this.octokit) {
      throw new Error('GitHub not configured');
    }

    const result = await this.octokit.repos.listCommits({
      owner,
      repo,
      per_page: 10,
    });

    return result.data;
  }

  async getPullRequests(owner: string, repo: string) {
    if (!this.octokit) {
      throw new Error('GitHub not configured');
    }

    const result = await this.octokit.pulls.list({
      owner,
      repo,
      state: 'open',
    });

    return result.data;
  }

  async getIssues(owner: string, repo: string) {
    if (!this.octokit) {
      throw new Error('GitHub not configured');
    }

    const result = await this.octokit.issues.listForRepo({
      owner,
      repo,
      state: 'open',
    });

    return result.data;
  }

  async createWebhook(owner: string, repo: string, webhookUrl: string) {
    if (!this.octokit) {
      throw new Error('GitHub not configured');
    }

    const result = await this.octokit.repos.createWebhook({
      owner,
      repo,
      config: {
        url: webhookUrl,
        content_type: 'json',
      },
      events: ['push', 'pull_request', 'issues'],
    });

    return result.data;
  }

  isConfigured() {
    return this.octokit !== null;
  }
}

const githubService = new GitHubIntegration();

// Routes
router.get('/status', (req, res) => {
  res.json({ 
    connected: githubService.isConfigured()
  });
});

router.get('/repositories', async (req, res) => {
  try {
    const { username } = req.query;
    const repos = await githubService.getRepositories(username as string);
    res.json(repos);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/repositories/:owner/:repo/commits', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const commits = await githubService.getRepoCommits(owner, repo);
    res.json(commits);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/repositories/:owner/:repo/pulls', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const pulls = await githubService.getPullRequests(owner, repo);
    res.json(pulls);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/repositories/:owner/:repo/issues', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const issues = await githubService.getIssues(owner, repo);
    res.json(issues);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/repositories/:owner/:repo/webhook', async (req, res) => {
  try {
    const { owner, repo } = req.params;
    const { webhookUrl } = req.body;
    const webhook = await githubService.createWebhook(owner, repo, webhookUrl);
    res.json(webhook);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { githubService };
export default router;