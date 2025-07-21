import { Client } from '@notionhq/client';
import { Router } from 'express';

const router = Router();

// Notion Integration Service
class NotionIntegration {
  private notion: Client | null = null;
  private pageId: string | null = null;

  constructor() {
    if (process.env.NOTION_INTEGRATION_SECRET) {
      this.notion = new Client({
        auth: process.env.NOTION_INTEGRATION_SECRET,
      });
      this.pageId = this.extractPageIdFromUrl(process.env.NOTION_PAGE_URL || '');
    }
  }

  private extractPageIdFromUrl(pageUrl: string): string | null {
    if (!pageUrl) return null;
    const match = pageUrl.match(/([a-f0-9]{32})(?:[?#]|$)/i);
    return match ? match[1] : null;
  }

  async getDatabases() {
    if (!this.notion || !this.pageId) {
      throw new Error('Notion not configured');
    }

    const databases = [];
    let hasMore = true;
    let startCursor: string | undefined = undefined;

    while (hasMore) {
      const response = await this.notion.blocks.children.list({
        block_id: this.pageId,
        start_cursor: startCursor,
      });

      for (const block of response.results) {
        if (block.type === 'child_database') {
          try {
            const databaseInfo = await this.notion.databases.retrieve({
              database_id: block.id,
            });
            databases.push(databaseInfo);
          } catch (error) {
            console.error(`Error retrieving database ${block.id}:`, error);
          }
        }
      }

      hasMore = response.has_more;
      startCursor = response.next_cursor || undefined;
    }

    return databases;
  }

  async createDatabase(title: string, properties: any) {
    if (!this.notion || !this.pageId) {
      throw new Error('Notion not configured');
    }

    const database = await this.notion.databases.create({
      parent: {
        type: 'page_id',
        page_id: this.pageId,
      },
      title: [
        {
          type: 'text',
          text: { content: title },
        },
      ],
      properties,
    });

    return database;
  }

  async queryDatabase(databaseId: string, filter?: any) {
    if (!this.notion) {
      throw new Error('Notion not configured');
    }

    const response = await this.notion.databases.query({
      database_id: databaseId,
      filter,
    });

    return response.results;
  }

  async createPage(databaseId: string, properties: any) {
    if (!this.notion) {
      throw new Error('Notion not configured');
    }

    const page = await this.notion.pages.create({
      parent: { database_id: databaseId },
      properties,
    });

    return page;
  }

  async updatePage(pageId: string, properties: any) {
    if (!this.notion) {
      throw new Error('Notion not configured');
    }

    const page = await this.notion.pages.update({
      page_id: pageId,
      properties,
    });

    return page;
  }

  isConfigured() {
    return this.notion !== null && this.pageId !== null;
  }
}

const notionService = new NotionIntegration();

// Routes
router.get('/status', (req, res) => {
  res.json({ 
    connected: notionService.isConfigured()
  });
});

router.get('/databases', async (req, res) => {
  try {
    const databases = await notionService.getDatabases();
    res.json(databases);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/databases', async (req, res) => {
  try {
    const { title, properties } = req.body;
    const database = await notionService.createDatabase(title, properties);
    res.json(database);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.get('/databases/:id/pages', async (req, res) => {
  try {
    const { id } = req.params;
    const { filter } = req.query;
    const pages = await notionService.queryDatabase(id, filter ? JSON.parse(filter as string) : undefined);
    res.json(pages);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/databases/:id/pages', async (req, res) => {
  try {
    const { id } = req.params;
    const { properties } = req.body;
    const page = await notionService.createPage(id, properties);
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

router.patch('/pages/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { properties } = req.body;
    const page = await notionService.updatePage(id, properties);
    res.json(page);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export { notionService };
export default router;