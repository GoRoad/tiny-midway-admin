
import { Provide, Inject } from '@midwayjs/core';
import { PrismaClient } from '@prisma/client';
import { HistoryService } from '../../wechat/service/history.service';
import { GeweService } from '../../wechat/service/gewe.service';

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
  @Inject()
  geweService: GeweService;

  // 微信群助手
  async wxGroupAgent(options: SearchParam) {
    try {
      const { llm, input, groupId, sender } = options;
      // 封装工具
      const groupHistory = await this.createRagSearchGroupTool(groupId, options.emModelId);
      const groupMember = await this.createGroupAndMemberTool(options.appId);
      const tools = [groupMember, groupHistory];
      // 创建代理方法
      const prompt = ChatPromptTemplate.fromMessages([
        [
          'system', `
          - 你是一个乐于助人的助手，你处在一个聊天群组内部。
          - 如果现有条件下你能回答群成员问题，请直接回答。如果你需要额外信息可以调用合适的工具。
          - 如果缺少需要查询的成员ID信息，你可以先调用 getGroupAndMemberInfo 工具查询成员ID、昵称等详细信息，然后调用 searchChatHistory 再来查询他的聊天记录。
          - 如果无法确定答案，请坦承不知。
          - 问题背景信息：当前时间：${new Date().toLocaleString()}，提问人的群成员ID: ${sender}，提问人所在聊天群ID:${groupId}。
          - 请使用中文回答，除非成员要求使用其它语言。
          - 如果某工具返回结果为没有实际意义(比如空字符串、空对象、空数组)就是没有数据，禁止再次使用相同参数调用工具。
          - 如果某工具返回结果不符合预期可能是数据有误，禁止再次使用相同参数调用工具。
          - 返回的数据格式化成Markdown
          `
        ],
        ['placeholder', '{chat_history}'],
        ['human', '{input}'],
        ['placeholder', '{agent_scratchpad}'],
      ]);
      const agent = createToolCallingAgent({ llm, tools, prompt });
      const agentExecutor = new AgentExecutor({
        agent,
        tools,
        verbose: false,
        handleParsingErrors: 'Please try again, paying close attention to the allowed enum values',
        returnIntermediateSteps: true
      });
      const response = await agentExecutor.invoke({ input });
      console.log('@agent调试: intermediateSteps: ', response);
      let res = response.output;
      // 返回的消息转成string类型
      if (typeof res === 'string') {
        return res;
      } else {
        return JSON.stringify(res);
      }
    } catch (error) {
      console.error('@agent error: ', error);
      return error;
    }
  }

  // 群搜索工具
  async createRagSearchGroupTool(groupId: string, emModelId: number) {
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
        查询聊天群内的聊天记录的工具:
        - 查询条件不变数据也不会有变化，禁止重复查询。
        - 如果查询结果为空就是没有数据不能重复查询，必须终止退出。
        - 群成员聊天记录: 返回的记录格式是数组，每个元素是一个对象，
          包含字段：sender_id（群id）sender_id（发信方昵称）sender_nickName（发信方昵称）和 content（内容），postTime（发送时间）sender_id（收信方昵称）sender_nickName（收信方昵称）
          例子：[{ groupId: '123@chatroom', postTime: '2022-12-16T17:56:42.054Z', content: '内容', sender_nickName: '助手', sender_id: 'ai', receiver_nickName: '群成员', receiver_id: 'abc123' }]。
      `,
      schema: z.object({
        keyword: z.string().optional().describe('搜索聊天内容的关键字, 如果搜索全部信息就不传'),
        sender: z.string().optional().describe('查询成员的聊天记录传成员ID，如果查询所有成员就不传'),
        starTtime: z.string().optional().default(defStartTime).describe('开始时间，格式为 yyyy-MM-dd HH:mm:ss，没有指定时间不传'),
        endTime: z.string().optional().default(defEndTime).describe('结束时间,按天查询的话时分秒应该为23:59:59，格式为 yyyy-MM-dd HH:mm:ss，没有指定时间不传'),
      }).describe('通过成员ID，聊天内容关键字，群ID来搜索群内的聊天记录，不支持其他的查询条件')
    }
    return tool(async (input) => {
      console.log('@ai入参 rag: ', input);
      const { keyword, sender, starTtime, endTime } = input;
      // 导入测试历史数据
      const history = await this.historyService.getRagGroupHistory(emModelId, keyword, groupId, sender, starTtime, endTime);
      console.log('@@@history: ', history);
      return JSON.stringify(history);
    }, toolSchema);
  }

  // 群/群成员资料获取工具
  async createGroupAndMemberTool(appId: string) {
    const toolSchema = {
      name: 'getGroupAndMemberInfo',
      description: `
        查询群或者群成员详细信息的工具:
        - 查询聊天群的详细信息，包括群ID、群名称、群简介、群ID。
        - 查询群成员的详细信息，包括成员ID、昵称、头像、性别、地区。
      `,
      schema: z.object({
        groupId: z.string().describe('需要查询的群ID，文本类型，例子 "123@chatroom" '),
        sender: z.string().optional().describe('需要查询的成员ID，文本类型，例子 "abc123"，如果传递昵称，可以不传成员ID '),
        nickName: z.string().describe('需要查询的成员昵称，文本类型，例子 "张国荣" '),
      }).describe('使用已知信息来查询群或者群成员详细信息')
    }
    return tool(async (input) => {
      console.log('@ai入参 info: ', input);
      const { groupId, sender, nickName } = input;
      let data = {};
      if (nickName) {
        data = await this.prisma.wxContact.findFirst({
          where: {
            nickName: {
            contains: nickName, // 模糊匹配 nickName
            mode: 'insensitive', // 可选：忽略大小写
            },
          },
        });
      } else {
        data = await this.geweService.contactsInfo(appId, [groupId, sender]);
      }
      console.log('@@@info: ', data);
      return JSON.stringify(data);
    }, toolSchema);
  }
}

