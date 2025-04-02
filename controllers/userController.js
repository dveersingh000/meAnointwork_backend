// controllers/userController.js
import Task from '../models/Task.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SubmittedTask from '../models/SubmittedTask.js';
import { calculateAccuracy } from '../utils/accuracy.js';
import { checkPlagiarismForFile } from '../plagiarism/sss.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const getUserTasks = async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (err) {
    console.error(err);
    res.status(500).send('ServerError');
  }
};

export const getTaskDetail = async (req, res) => {
    try {
      const task = await Task.findById(req.params.id);
      if (!task) return res.status(404).send('TaskNotFound');
  
      let content = '';
  
      // if it's a text file, read content from file
      if (task.type === 'text') {
        const filePath = `./uploads/${task.filename}`;
        content = fs.readFileSync(filePath, 'utf-8');
      }
  
      res.json({
        _id: task._id,
        pageName: task.pageName,
        type: task.type,
        filename: task.filename,
        content: task.type === 'text' ? content : null,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('ServerError');
    }
  };
  


  export const submitTask = async (req, res) => {
    const { id } = req.params;
    const { inputText } = req.body;
    const userId = req.user._id;
  
    if (!inputText || !inputText.trim()) {
      return res.status(400).send('Missing inputText');
    }
  
    try {
      const task = await Task.findById(id);
      if (!task) return res.status(404).send('Task not found');
  
      let referenceText = '';
      if (task.type === 'text') {
        referenceText = task.content;
      } else if (task.type === 'image') {
        // Optional: If OCR is used, fetch that text instead
        referenceText = ''; // Placeholder
      }
  
      // ✅ Calculate accuracy
      const accuracy = referenceText
        ? calculateAccuracy(referenceText, inputText)
        : 0;
  
      // ❌ Require minimum 80% accuracy (optional)
      if (accuracy < 80) {
        return res.status(422).json({
          message: 'Accuracy too low',
          accuracy,
        });
      }
  
      // ✅ Save input as file for plagiarism
      const fileName = `${userId}_${Date.now()}.txt`;
      const filePath = path.join(__dirname, `../plagiarism/${fileName}`);
      fs.writeFileSync(filePath, inputText);
  
      // ✅ Run plagiarism check using JS script
      const plagiarismResult = checkPlagiarismForFile(fileName);
  
      // ✅ Save to DB
      const submission = new SubmittedTask({
        taskId: id,
        userId,
        inputText,
        accuracy,
        plagiarism: plagiarismResult,
      });
  
      await submission.save();
  
      res.json({
        message: 'Task submitted successfully',
        accuracy,
        plagiarism: plagiarismResult,
      });
  
    } catch (err) {
      console.error('Submit Task Error:', err);
      res.status(500).send('ServerError');
    }
  };
