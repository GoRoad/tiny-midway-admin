import { Scope, Provide, ScopeEnum } from '@midwayjs/core';

@Provide()
@Scope(ScopeEnum.Singleton)
export class QueueService {
  private queues: {
    [queueName: string]: Array<{
      task: () => Promise<any>;
      resolve: (value: any) => void;
      reject: (error: any) => void
    }>
  } = {};

  // 添加任务到指定队列
  public addTask(queueName: string, task: () => Promise<any>): Promise<any> {
    if (!this.queues[queueName]) {
      this.queues[queueName] = [];
    }
    return new Promise((resolve, reject) => {
      this.queues[queueName].push({ task, resolve, reject });
      this.processQueue(queueName);
    });
  }

  // 处理指定队列的任务
  private async processQueue(queueName: string): Promise<void> {
    if (!this.queues[queueName] || this.queues[queueName].length === 0) {
      return;
    }

    const taskItem = this.queues[queueName].shift();
    if (taskItem) {
      try {
        const result = await taskItem.task();
        taskItem.resolve(result);
      } catch (error) {
        taskItem.reject(error);
      } finally {
        this.processQueue(queueName);
      }
    }
  }
}
