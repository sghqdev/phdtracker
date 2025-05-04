import express from 'express';
import { 
  getStudentNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  markNoteAsRead 
} from '../controllers/noteControllers.js';
import { verifyToken } from '../middleware/verifyToken.js';

const router = express.Router();

// Get all notes for a student
router.get('/student/:studentId', verifyToken, getStudentNotes);

// Create a new note
router.post('/', verifyToken, createNote);

// Update a note
router.put('/:noteId', verifyToken, updateNote);

// Delete a note
router.delete('/:noteId', verifyToken, deleteNote);

// Mark note as read
router.put('/:noteId/read', verifyToken, markNoteAsRead);

export default router; 