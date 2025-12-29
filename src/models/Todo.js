import mongoose from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Todo title is required'],
      trim: true,
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    completed: {
      type: Boolean,
      default: false,
    },
    userId: {
      type: String,
      required: [true, 'User ID is required'],
    },
  },
  {
    timestamps: true,
  }
);

todoSchema.index({ userId: 1, completed: 1 });

const Todo = mongoose.model('Todo', todoSchema);

export default Todo;
