import Note from '../models/note.js';

// Get all notes for a student
export const getStudentNotes = async (req, res) => {
  try {
    const notes = await Note.find({ studentId: req.params.studentId })
      .sort({ createdAt: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching notes', error: error.message });
  }
};

// Create a new note
export const createNote = async (req, res) => {
  try {
    const { studentId, content } = req.body;
    const note = new Note({
      studentId,
      content
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error creating note', error: error.message });
  }
};

// Update a note
export const updateNote = async (req, res) => {
  try {
    const { content } = req.body;
    const note = await Note.findByIdAndUpdate(
      req.params.noteId,
      { content },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error updating note', error: error.message });
  }
};

// Delete a note
export const deleteNote = async (req, res) => {
  try {
    const note = await Note.findByIdAndDelete(req.params.noteId);
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json({ message: 'Note deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting note', error: error.message });
  }
};

// Mark note as read
export const markNoteAsRead = async (req, res) => {
  try {
    const note = await Note.findByIdAndUpdate(
      req.params.noteId,
      { 
        isRead: true,
        readAt: new Date()
      },
      { new: true }
    );
    if (!note) {
      return res.status(404).json({ message: 'Note not found' });
    }
    res.json(note);
  } catch (error) {
    res.status(500).json({ message: 'Error marking note as read', error: error.message });
  }
}; 