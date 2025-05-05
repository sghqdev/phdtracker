import express from 'express';
import { 
  getStudentNotes, 
  createNote, 
  updateNote, 
  deleteNote, 
  markNoteAsRead 
} from '../controllers/noteControllers.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Get all notes for a student
router.get('/student/:studentId', protect, getStudentNotes);

// Create a new note
router.post('/', protect, createNote);

// Update a note
router.put('/:noteId', protect, updateNote);

// Delete a note
router.delete('/:noteId', protect, deleteNote);

// Mark note as read
router.put('/:noteId/read', protect, markNoteAsRead);

export default router; 