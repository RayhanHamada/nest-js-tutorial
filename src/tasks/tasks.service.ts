import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateTaskDto } from './dto/create-task.dto';
import { GetTaskFilterDto } from './dto/get-tasks-filter.dto';
import { TaskRepository } from './task.repository';
import { InjectRepository } from '@nestjs/typeorm';
import { Task } from './task.entity';
import { TaskStatus } from './task-status.enum';
import { User } from 'src/auth/user.entity';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(TaskRepository) private taskRepo: TaskRepository
  ) {}

  async getTask(filterDto: GetTaskFilterDto, user: User): Promise<Task[]> {
    return this.taskRepo.getTasks(filterDto, user);
  }

  async getTaskById(id: number, user: User): Promise<Task> {
    const found = await this.taskRepo.findOne({
      where: {
        id,
        userId: user.id,
      },
    });

    if (!found) {
      throw new NotFoundException(`Task with id ${id} not found !`);
    }

    return found;
  }

  async createTasks(createTaskDto: CreateTaskDto, user: User): Promise<Task> {
    return this.taskRepo.createTask(createTaskDto, user);
  }

  async deleteTask(id: number, user: User): Promise<void> {
    /**
     * pake metode Base Entity
     */
    // const task = await this.getTaskById(id);

    // if (!task) {
    //   throw new NotFoundException(`Task with id of ${id} not found !`);
    // }

    // await task.remove()

    /**
     * pake metode repository
     */
    const result = await this.taskRepo.delete({
      id,
      userId: user.id,
    });
    if (result.affected === 0) {
      throw new NotFoundException(`Task with id of ${id} not found !`);
    }
  }

  async updateTaskStatus(
    id: number,
    status: TaskStatus,
    user: User
  ): Promise<Task> {
    const task = await this.getTaskById(id, user);

    task.status = status;
    await task.save();
    return task;
  }
}
