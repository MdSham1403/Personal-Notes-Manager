const express = require("express");
const router = express.Router();
const Note = require("../models/Note");

// Create a new note
router.post("/", async (req, res) => {
  const { title, description, category } = req.body;
  try {
    const note = new Note({
      title,
      description,
      category,
    });
    await note.save();
    res.status(201).json(note);
  } catch (error) {
    res.status(500).json({ message: "Error creating note", error });
  }
});

// Get all notes
router.get("/", async (req, res) => {
  try {
    const notes = await Note.find().sort({ created_at: -1 });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ message: "Error fetching notes", error });
  }
});

module.exports = router;
