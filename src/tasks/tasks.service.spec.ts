import { Test } from '@nestjs/testing';
import { TasksService } from './tasks.service';
import { TaskRespository } from './task.repository';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskStatus } from './task-status.enum';
import { NotFoundException } from '@nestjs/common';
import { async } from 'rxjs';

const mockUser = { id: '12', username: 'Test User' };
const mockTask = {
  title: 'Test task',
  description: 'Test desc',
  status: 'IN_PROGRESS',
};
const mockCreateTaskDto = { title: 'Test', description: 'with jest' };
const mockTaskRepository = () => ({
  getTasks: jest.fn(),
  findOne: jest.fn(),
  createTask: jest.fn(),
  delete: jest.fn(),
  updateTask: jest.fn(),
});

describe('TaskService', () => {
  let taskService;
  let taskRepository;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TasksService,
        { provide: TaskRespository, useFactory: mockTaskRepository },
      ],
    }).compile();

    taskService = await module.get<TasksService>(TasksService);
    taskRepository = await module.get<TaskRespository>(TaskRespository);
  });

  describe('getTasks', () => {
    it('gets all task from the repository', async () => {
      taskRepository.getTasks.mockResolvedValue('someValue');

      expect(taskRepository.getTasks).not.toHaveBeenCalled();
      const filters: GetTasksFilterDto = {
        status: TaskStatus.IN_PROGRESS,
        search: 'Some search query',
      };
      const result = await taskService.getTasks(filters, mockUser);
      expect(taskRepository.getTasks).toHaveBeenCalled();
      expect(result).toEqual('someValue');
    });
  });

  describe('getTaskById', () => {
    it('calls taskRepository.findOne() and successfully retrieve and return the task', async () => {
      taskRepository.findOne.mockResolvedValue(mockTask);
      const result = await taskService.getTaskById(1, mockUser);
      expect(result).toEqual(mockTask);
      expect(taskRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1, userId: mockUser.id },
      });
    });

    it('throws an error as task is not found', async () => {
      taskRepository.findOne.mockResolvedValue(null);
      expect(taskService.getTaskById(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('createTask', () => {
    it('calls taskrespository.create() and returns the result', async () => {
      taskRepository.createTask.mockResolvedValue('someTask');
      const result = await taskService.createTask(mockCreateTaskDto, mockUser);
      expect(taskRepository.createTask).toHaveBeenCalledWith(
        mockCreateTaskDto,
        mockUser,
      );
      expect(result).toEqual('someTask');
    });
  });

  describe('deleteTask', () => {
    it('calls taskrespository.deleteTask() to delete a task', async () => {
      taskRepository.delete.mockResolvedValue({ affect: 1 });
      expect(taskRepository.delete).not.toHaveBeenCalled();
      await taskService.deleteTask(1, mockUser);
      expect(taskRepository.delete).toHaveBeenCalledWith({
        id: 1,
        userId: mockUser.id,
      });
    });

    it('throws an error as task could not be found', async () => {
      taskRepository.delete.mockResolvedValue({ affected: 0 });
      await expect(taskService.deleteTask(1, mockUser)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateTaskStatus', () => {
    it('updates a task statu', async () => {
      const save = jest.fn().mockResolvedValue(true);
      taskService.getTaskById = jest.fn().mockResolvedValue({
        status: TaskStatus.OPEN,
        save,
      });

      expect(taskService.getTaskById).not.toHaveBeenCalled();
      const result = await taskService.updateTaskStatus(
        1,
        TaskStatus.DONE,
        mockUser,
      );
      expect(taskService.getTaskById).toHaveBeenCalled();
      expect(save).toHaveBeenCalled();
      expect(result.status).toEqual(TaskStatus.DONE);
    });
  });
});
