import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRespository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from '../auth/user.entity';

// business logic

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRespository)
    private taskRespository: TaskRespository,
  ) {}

  getTasks(filterDtO: GetTasksFilterDto): Promise<Task[]> {
    return this.taskRespository.getTasks(filterDtO);
  }

  async getTaskById(id: number): Promise<Task> {
    const found = await this.taskRespository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Task with "${id}" not found.`);
    }

    return found;
  }

  async createTask(createTaskDto: CreateTaskDTO, user: User): Promise<Task> {
    return this.taskRespository.createTask(createTaskDto, user);
  }

  async deleteTask(id: number): Promise<void> {
    const deleted = await this.taskRespository.delete(id);

    if (deleted.affected === 0) {
      throw new NotFoundException(`Task with "${id}" not found.`);
    }
  }

  async updateTaskStatus(id: number, status: TaskStatus) {
    const task = await this.getTaskById(id);
    task.status = status;
    await task.save();
    return task;
  }
}
