import asyncHandler from 'express-async-handler';
import Todo from '../models/Todo.js';

export const getTodos = asyncHandler(async (req, res) => {
  const filter = { userId: req.clerk.userId };
  // const filter = {};

  const todos = await Todo.find(filter).sort({ createdAt: -1 });

  res.status(200).json({ todos });
});

export const createTodo = asyncHandler(async (req, res) => {
  const { title } = req.body;

  if (!title || title.trim() === '') {
    return res.status(400).json({ error: 'Title is required' });
  }

  const todo = await Todo.create({
    title,
    completed: false,
    userId: req.clerk.userId,
  });

  res.status(201).json({ todo });
});

export const updateTodo = asyncHandler(async (req, res) => {
  const { title, completed } = req.body;

  const todo = await Todo.findOne({
    _id: req.params.id,
    userId: req.clerk.userId,
  });

  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  if (title !== undefined) todo.title = title;
  if (completed !== undefined) todo.completed = completed;

  await todo.save();

  res.status(200).json({ todo });
});

export const deleteTodo = asyncHandler(async (req, res) => {
  const todo = await Todo.findOneAndDelete({
    _id: req.params.id,
    userId: req.clerk.userId,
  });

  if (!todo) return res.status(404).json({ error: 'Todo not found' });

  res.status(200).json({ message: 'Todo deleted successfully' });
});
