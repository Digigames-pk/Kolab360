import { Router } from 'express';
import { storage } from '../storage';
import { insertWorkspaceMoodBoardSchema, insertMoodBoardVoteSchema } from '@shared/schema';

const router = Router();

// GET /api/mood-boards/:workspaceId - Get all mood boards for a workspace
router.get('/:workspaceId', async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const moodBoards = await storage.getWorkspaceMoodBoards(workspaceId);
    res.json(moodBoards);
  } catch (error) {
    console.error('Error fetching mood boards:', error);
    res.status(500).json({ error: 'Failed to fetch mood boards' });
  }
});

// GET /api/mood-boards/board/:id - Get a specific mood board
router.get('/board/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const moodBoard = await storage.getWorkspaceMoodBoard(id);
    
    if (!moodBoard) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    res.json(moodBoard);
  } catch (error) {
    console.error('Error fetching mood board:', error);
    res.status(500).json({ error: 'Failed to fetch mood board' });
  }
});

// POST /api/mood-boards - Create a new mood board
router.post('/', async (req, res) => {
  try {
    const validatedData = insertWorkspaceMoodBoardSchema.parse(req.body);
    
    // Get authenticated user ID
    const createdBy = (req as any).user?.id || 1;
    
    const moodBoard = await storage.createWorkspaceMoodBoard({
      ...validatedData,
      createdBy
    });
    
    res.status(201).json(moodBoard);
  } catch (error) {
    console.error('Error creating mood board:', error);
    res.status(500).json({ error: 'Failed to create mood board' });
  }
});

// PUT /api/mood-boards/:id - Update a mood board
router.put('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const updates = req.body;
    
    const moodBoard = await storage.updateWorkspaceMoodBoard(id, updates);
    
    if (!moodBoard) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    res.json(moodBoard);
  } catch (error) {
    console.error('Error updating mood board:', error);
    res.status(500).json({ error: 'Failed to update mood board' });
  }
});

// DELETE /api/mood-boards/:id - Delete a mood board
router.delete('/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const success = await storage.deleteWorkspaceMoodBoard(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    res.json({ message: 'Mood board deleted successfully' });
  } catch (error) {
    console.error('Error deleting mood board:', error);
    res.status(500).json({ error: 'Failed to delete mood board' });
  }
});

// POST /api/mood-boards/:id/activate - Activate a mood board
router.post('/:id/activate', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { workspaceId } = req.body;
    
    const moodBoard = await storage.activateWorkspaceMoodBoard(workspaceId, id);
    
    if (!moodBoard) {
      return res.status(404).json({ error: 'Mood board not found' });
    }
    
    res.json(moodBoard);
  } catch (error) {
    console.error('Error activating mood board:', error);
    res.status(500).json({ error: 'Failed to activate mood board' });
  }
});

// POST /api/mood-boards/:id/vote - Vote on a mood board
router.post('/:id/vote', async (req, res) => {
  try {
    const moodBoardId = parseInt(req.params.id);
    const voteData = insertMoodBoardVoteSchema.parse({
      ...req.body,
      moodBoardId
    });
    
    const vote = await storage.voteMoodBoard(voteData);
    res.status(201).json(vote);
  } catch (error) {
    console.error('Error voting on mood board:', error);
    res.status(500).json({ error: 'Failed to vote on mood board' });
  }
});

// GET /api/mood-boards/:id/votes - Get votes for a mood board
router.get('/:id/votes', async (req, res) => {
  try {
    const moodBoardId = parseInt(req.params.id);
    const votes = await storage.getMoodBoardVotes(moodBoardId);
    res.json(votes);
  } catch (error) {
    console.error('Error fetching mood board votes:', error);
    res.status(500).json({ error: 'Failed to fetch votes' });
  }
});

export default router;