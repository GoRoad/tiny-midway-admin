
import { Provide, Inject } from '@midwayjs/core';
import { PrismaClient } from '@prisma/client';
import { HistoryService } from '../../wechat/service/history.service';
import { GeweService } from '../../wechat/service/gewe.service';

import { createToolCallingAgent, AgentExecutor } from "langchain/agents";
import { createReactAgent } from "@langchain/langgraph/prebuilt";
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
          - 如果无法确定答案，请坦承不知。
          - **重要:** human 看不到 ID 信息，输入的查询条件必定是昵称、群名称等可见信息，需要先调用工具查询对应 ID。
          - **工具调用顺序:**
            1. 如果查询条件是昵称，先调用 'getGroupAndMemberInfo' 工具获取成员 ID。
            2. 然后使用获取到的成员 ID 调用 'searchChatHistory' 工具查询聊天记录。
          - 问题背景信息：当前时间：${new Date().toLocaleString()}，提问人的群成员ID: ${sender}，提问人所在聊天群ID:${groupId}。
          - 请使用中文回答，除非成员要求使用其它语言。
          - 如果某工具返回结果为没有实际意义(比如空字符串、空对象、空数组)就是没有数据，禁止再次使用相同参数调用工具。
          - 如果某工具返回结果不符合预期可能是数据有误，禁止再次使用相同参数调用工具。
          - 不要使用任何 markdown 格式，可以使用纯交本格式或者emoji。
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
      console.log('@agent调试: wxGroupAgent: ', response);
      let res = response.output;
      console.log('res: ', typeof res, res);
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

  // 思考上下文消耗更多的token
  async wxGroupReactAgent(options: SearchParam) {
    try {
      const { llm, input, groupId, sender } = options;
      // 封装工具
      const groupHistory = await this.createRagSearchGroupTool(groupId, options.emModelId);
      const groupMember = await this.createGroupAndMemberTool(options.appId);
      const tools = [groupMember, groupHistory];

      // 创建react代理
      const agent = createReactAgent({ llm, tools });
      const inputs = {
        messages: [
          { role: "system", content: `
            - 你是一个乐于助人的助手，你处在一个聊天群组内部。
            - 如果现有条件下你能回答群成员问题，请直接回答。如果你需要额外信息可以调用合适的工具。
            - 如果无法确定答案，请坦承不知。
            - **重要:** human 看不到 ID 信息，输入的查询条件必定是昵称、群名称等可见信息，需要先调用工具查询对应 ID。
            - **工具调用顺序:**
              1. 如果查询条件是昵称，先调用 'getGroupAndMemberInfo' 工具获取成员 ID。
              2. 然后使用获取到的成员 ID 调用 'searchChatHistory' 工具查询聊天记录。
            - 问题背景信息：当前时间：${new Date().toLocaleString()}，提问人的群成员ID: ${sender}，提问人所在聊天群ID:${groupId}。
            - 请使用中文回答，除非成员要求使用其它语言。
            - 如果某工具返回结果为没有实际意义(比如空字符串、空对象、空数组)就是没有数据，禁止再次使用相同参数调用工具。
            - 如果某工具返回结果不符合预期可能是数据有误，禁止再次使用相同参数调用工具。
            - 不要使用任何 markdown 格式，可以使用纯交本格式或者emoji。
          `
          },
          { role: "user", content: input }
        ],
      };

      const response = await agent.invoke({ ...inputs });

      console.log('@agent调试: wxGroupAgent: ', response);
      const messages = response?.messages || [];
      const responseArr = [];
      for (const AIMessage of messages) {
        responseArr.push(AIMessage.content);
      }
      let res = responseArr[responseArr.length - 1];
      // let res = AIMessage.content;
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
    // const LOCAL = { local: 'zh-CN', zone: { timeZone: 'Asia/Shanghai' } };
    // // 生成默认的查询时间
    // const yesterday = new Date();
    // yesterday.setDate(yesterday.getDate() - 1);
    // yesterday.setHours(23, 59, 59, 0);
    // const defStartTime = yesterday.toLocaleString(LOCAL.local, LOCAL.zone).replace(/\//g, '-');
    // const defEndTime = new Date().toLocaleString(LOCAL.local, LOCAL.zone).replace(/\//g, '-');

    const toolSchema = {
      name: 'searchChatHistory',
      description: `
        查询聊天群内的聊天记录:
        - **只能通过成员ID进行查询，不支持昵称查询。**
        - 查询时间最大只能7天范围内，如果查询条件为全部、所有、一切等时间条件，那么起止时间为7天前00:00:01到当前时间。
        - 群成员聊天记录: 返回的记录格式是数组，每个元素是一个对象，
          包含字段：sender_id（群id）sender_id（发信方昵称）sender_nickName（发信方昵称）和 content（内容），postTime（发送时间）sender_id（收信方昵称）sender_nickName（收信方昵称）
          例子：[{ groupId: '123@chatroom', postTime: '2022-12-16T17:56:42.054Z', content: '内容', sender_nickName: '助手', sender_id: 'ai', receiver_nickName: '群成员', receiver_id: 'abc123' }]。
      `,
      schema: z.object({
        keyword: z.string().optional().describe('搜索聊天内容的关键字, 如果搜索全部信息就不传'),
        sender: z.string().optional().describe('查询成员的聊天记录传成员ID，如果查询所有成员就不传，不支持通过昵称查询'),
        starTtime: z.string().describe('开始时间，格式为 yyyy-MM-dd HH:mm:ss，没有指定该参数为昨天00:00:01'),
        endTime: z.string().describe('结束时间,按天查询的话时分秒应该为23:59:59，格式为 yyyy-MM-dd HH:mm:ss，没有指定该参数为当前时间'),
      }).describe('只能通过成员ID、群ID、聊天内容关键字来搜索群内的聊天记录，不支持其他的查询条件')
    }
    return tool(async (input) => {
      console.log('@ai入参 rag: ', input);
      const { keyword, sender, starTtime, endTime } = input;
      // 导入测试历史数据
      const history = await this.historyService.getRagGroupHistory(emModelId, keyword, groupId, sender, starTtime, endTime);
      const res = { query: { starTtime, endTime }, history }
      console.log('@@@history: ', res);
      return JSON.stringify(res);
    }, toolSchema);
  }

  // 群/群成员资料获取工具
  async createGroupAndMemberTool(appId: string) {
    const toolSchema = {
      name: 'getGroupAndMemberInfo',
      description: `
        通过ID查询群或者群成员的详细信息:
        - 查询聊天群的详细信息，包括群ID、群名称、群简介。
        - 查询群成员的详细信息，包括成员ID、昵称、头像、性别、地区。
      `,
      schema: z.object({
        groupId: z.string().describe('需要查询的群ID，文本类型，例子 "123@chatroom" '),
        sender: z.string().optional().describe('需要查询的成员ID，文本类型，例子 "abc123"，如果传递昵称，可以不传成员ID '),
        nickName: z.string().describe('需要查询的成员昵称，文本类型，例子 "张国荣" '),
      }).describe('只能通过成员的ID、群ID来查询群或者群成员昵称性别等详细信息，不支持其他的查询条件')
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

