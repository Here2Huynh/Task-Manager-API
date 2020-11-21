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

  getTasks(filterDto: GetTasksFilterDto, user: User): Promise<Task[]> {
    return this.taskRespository.getTasks(filterDto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRespository.findOne({
      where: { id, userId: user.id },
    });

    if (!found) {
      throw new NotFoundException(`Task with "${id}" not found.`);
    }

    return found;
  }

  async createTask(createTaskDto: CreateTaskDTO, user: User): Promise<Task> {
    return this.taskRespository.createTask(createTaskDto, user);
  }

  async deleteTask(id: number, user: User): Promise<void> {
    const deleted = await this.taskRespository.delete({ id, userId: user.id });

    if (deleted.affected === 0) {
      throw new NotFoundException(`Task with "${id}" not found.`);
    }
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User,
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);
    task.status = status;
    await task.save();
    return task;
  }
}
