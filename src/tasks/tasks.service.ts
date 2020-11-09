import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDTO } from './dto/create-task.dto';
import { GetTasksFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRespository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { create } from 'domain';
import { TaskStatus } from './task-status.enum';

// business logic

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRespository)
    private taskRespository: TaskRespository,
  ) {}
  // private tasks: Task[] = [];
  // getAllTasks(): Task[] {
  //   return this.tasks;
  // }
  // getTasksWithFilters(filterDto: GetTasksFilterDto): Task[] {
  //   const { status, search } = filterDto;
  //   let tasks = this.getAllTasks();
  //   if (status) {
  //     tasks = tasks.filter((task) => task.status == status);
  //   }
  //   if (search) {
  //     tasks = tasks.filter((task) => {
  //       return task.title.includes(search) || task.description.includes(search);
  //     });
  //   }
  //   return tasks;
  // }
  async getTaskById(id: number): Promise<Task> {
    const found = await this.taskRespository.findOne(id);

    if (!found) {
      throw new NotFoundException(`Task with "${id}" not found.`);
    }

    return found;
  }

  async createTask(createTaskDto: CreateTaskDTO): Promise<Task> {
    return this.taskRespository.createTask(createTaskDto);
  }

  async deleteTask(id: number): Promise<Task> {
    const found = await this.getTaskById(id);
    if (found) return await this.taskRespository.remove(found);
  }

  // deleteTask(id: string): void {
  //   const found = this.getTaskById(id);
  //   this.tasks.splice(this.tasks.indexOf(found), 1);
  // }

  // updateTaskStatus(id: string, status: TaskStatus): Task {
  //   const foundTask = this.getTaskById(id);
  //   if (foundTask) {
  //     foundTask.status = status;
  //     return foundTask;
  //   }
  // }
}
