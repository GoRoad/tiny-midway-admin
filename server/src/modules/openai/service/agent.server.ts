
import { Provide, Inject } from '@midwayjs/core';
import { PrismaClient } from '@prisma/client';
import { HistoryService } from '../../wechat/service/history.service';

import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { tool } from "@langchain/core/tools";
import { z } from "zod";

import { SearchParam } from "../dto/dto";

@Provide()
export class AgentService {
  @Inject()
  prisma: PrismaClient;
  @Inject()
  historyService: HistoryService;

  // 微信群助手
  async wxGroupAgent(options: SearchParam) {
    try {
      const { llm, input, sender } = options;
      // 封装工具
      const groupHistory = await this.createRagSearchGroup(options.groupId, options.emModelId, sender);
      const tools = [groupHistory];
      // 创建代理方法
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system', `
          - 你是一个乐于助人的助手。
          - 你现在是一个聊天群组内部。
          - 如果你能回答用户问题，请直接回答。如果你需要额外信息可以调用合适的工具。
          - 如果无法确定答案，请坦承不知。
          - 当前的时间是${new Date().toLocaleString()}。
          - 请使用中文回答，除非用户要求使用其它语言。`
        ],
        ['placeholder', '{chat_history}'],
        ['human', '{input}'],
        ['placeholder', '{agent_scratchpad}'],
      ]);
      const agent = createToolCallingAgent({ llm, tools, prompt });
      const agentExecutor = new AgentExecutor({ agent, tools, returnIntermediateSteps: true });
      const response = await agentExecutor.invoke({ input });
      console.log('@agent调试: intermediateSteps: ', response);
      return response.output;
    } catch (error) {
      console.error('@agent error: ', error);
      return error;
    }
  }

  // 群搜索工具
  async createRagSearchGroup(groupId: string, emModelId: number, wxId: string) {
    console.log('groupId, emModelId, wxId: ', groupId, emModelId, wxId);
    const LOCAL = { local: 'zh-CN', zone: { timeZone: 'Asia/Shanghai' } };
    // 生成默认的查询时间
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(23, 59, 59, 0);
    const defStartTime = yesterday.toLocaleString(LOCAL.local, LOCAL.zone).replace(/\//g, '-');
    const defEndTime = new Date().toLocaleString(LOCAL.local, LOCAL.zone).replace(/\//g, '-');

    const toolSchema = {
      name: 'searchChatHistory',
      description: `
        查询当前群信息和当前群成员聊天记录的工具:
        - 不要杜撰信息，请坦诚不知。
        - 一个任务只能查询一次，严禁重复查询。
        - 当前发起查询的用户ID: ${wxId}。
        - 群基础信息: 群昵称、群封面、群主信息、群简介、群成员列表（成员昵称，成员头像）。
        - 群成员聊天记录: 可以用群昵称查询记录，返回的记录格式是数组，每个元素是一个对象，包含两个字段：sender（昵称）和 content（内容），例子：[{"sender": "Tom", "content": "Hello"}]。
      `,
      schema: z.object({
        keyword: z.string().describe('搜索聊天内容的关键字, 如果搜索全部信息就不传'),
        sender: z.string().optional().describe('查询用户的聊天记录传用户ID，如果查询所有用户就不传'),
        starTtime: z.string().default(defStartTime).describe('开始时间，格式为 yyyy-MM-dd HH:mm:ss'),
        endTime: z.string().default(defEndTime).describe('结束时间,按天查询的话时分秒应该为23:59:59，格式为 yyyy-MM-dd HH:mm:ss'),
      }).describe('搜索的关键信息')
    }
    return tool(async (input) => {
      console.log('@tool入参: ', input);
      const { keyword, sender, starTtime, endTime } = input;
      // 导入测试历史数据
      const history = await this.historyService.getRagGroupHistory(emModelId, keyword, groupId, sender, starTtime, endTime);
      console.log('history: ', history);
      return JSON.stringify(history);
    }, toolSchema);
  }
}

