export interface Task {
  id: string;
  title: string;
  description: string;
  emotion: number; // 0–100
  urgency: number; // 0–100
  deadlineISO: string | null;
  isCompleted: boolean;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}
