// controllers/userController.js
import Task from '../models/Task.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import SubmittedTask from '../models/SubmittedTask.js';
import { calculateAccuracy } from '../utils/accuracy.js';
import { checkPlagiarismForFile } from '../plagiarism/sss.js';
import User from '../models/User.js';
import { extractTextFromImage } from '../utils/ocr.js';
import { generateReportPdf } from '../utils/reportGenerator.js';
import { sendEmailWithAttachment } from '../utils/mailer.js';

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

    if (task.type === 'text') {
      const filePath = `./uploads/${task.filename}`;
      content = fs.readFileSync(filePath, 'utf-8');
    } else if (task.type === 'image') {
      if (task.ocrText && task.ocrText.trim().length > 0) {
        content = task.ocrText;
      } else {
        content = await extractTextFromImage(task.filename);
        task.ocrText = content;
        await task.save(); // ✅ cache it
      }
    }

    res.json({
      _id: task._id,
      pageName: task.pageName,
      type: task.type,
      filename: task.filename,
      content,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('ServerError');
  }
};
  


export const  saveTask = async (req, res) => {
  const { inputText } = req.body;
  const { id } = req.params;
  const userId = req.user._id;

  if (!inputText || !inputText.trim()) {
    return res.status(400).json({ message: 'Please provide valid input text.' });
  }

  try {
    let submission = await SubmittedTask.findOne({ taskId: id, userId });

    if (submission && submission.status === 'submitted') {
      return res.status(403).json({ message: 'This task has already been submitted and cannot be edited.' });
    }

    const trimmedText = inputText.trim();

    if (submission) {
      submission.inputText = trimmedText;
      submission.status = 'draft'; // force status to draft on save
    } else {
      submission = new SubmittedTask({
        taskId: id,
        userId,
        inputText: trimmedText,
        status: 'draft',
      });
    }

    await submission.save();

    res.json({ message: '✅ Draft saved successfully.' });

  } catch (err) {
    console.error('Save Task Error:', err);
    res.status(500).json({ message: 'Error saving draft. Please try again.' });
  }
};

  export const getTask = async (req, res) => {
    const { id } = req.params;
    const userId = req.user._id;
  
    try {
      const draft = await SubmittedTask.findOne({ taskId: id, userId });
      if (!draft) return res.json({ inputText: '' });
  
      res.json({ inputText: draft.inputText, status: draft.status });
    } catch (err) {
      res.status(500).json({ message: 'Error fetching draft' });
    }
  };

  // POST /api/user/submit-all
  export const submitAllTasks = async (req, res) => {
    const userId = req.user._id;
    const userEmail = req.user.email;
  
    try {
      const drafts = await SubmittedTask.find({ userId, status: 'draft' }).populate('taskId');
  
      if (!drafts.length) {
        return res.status(400).json({ message: 'No draft tasks found' });
      }
  
      const finalResults = [];
  
      for (const submission of drafts) {
        const task = submission.taskId;
        let referenceText = '';
  
        if (task.type === 'text') {
          referenceText = task.content;
        } else if (task.type === 'image') {
          if (task.ocrText && task.ocrText.trim().length > 0) {
            referenceText = task.ocrText;
          } else {
            referenceText = await extractTextFromImage(task.filename);
            task.ocrText = referenceText;
            await task.save(); // ✅ cache the OCR result
          }
        }
  
        const inputText = submission.inputText || '';
        const accuracy = referenceText ? calculateAccuracy(referenceText, inputText) : 0;
  
        if (accuracy < 80) {
          return res.status(422).json({
            message: `❌ Accuracy for "${task.pageName}" is only ${accuracy}%. Must be ≥ 80%.`,
          });
        }
  
        // Save input to file for plagiarism check
        const fileName = `${userId}_${task._id}.txt`;
        const filePath = path.join(__dirname, `../plagiarism/${fileName}`);
        fs.writeFileSync(filePath, inputText);
  
        // Run plagiarism check
        const plagiarismResult = checkPlagiarismForFile(fileName);
  
        // Finalize submission
        submission.accuracy = accuracy;
        submission.plagiarism = plagiarismResult;
        submission.status = 'submitted';
        await submission.save();
  
        finalResults.push({
          pageName: task.pageName,
          accuracy,
          plagiarism: plagiarismResult,
        });
      }
  
      // Generate PDF report
      const reportPath = await generateReportPdf(finalResults, userEmail);
  
      // Send email
      await sendEmailWithAttachment(userEmail, reportPath);
  
      res.json({
        message: '✅ All tasks submitted successfully. Report emailed to you.',
      });
  
    } catch (err) {
      console.error('submitAllTasks error:', err);
      res.status(500).json({ message: 'Server error while submitting tasks.' });
    }
  };

  

  export const getPlanExpiry = async (req, res) => {
    try {
      const user = await User.findById(req.user._id);
      if (!user) return res.status(404).send('UserNotFound');
  
      const expiry = user.planExpireDate;
      const expired = new Date() > new Date(expiry);
  
      res.json({
        planExpireDate: expiry,
        expired,
      });
    } catch (err) {
      console.error(err);
      res.status(500).send('ServerError');
    }
  };

  
  
