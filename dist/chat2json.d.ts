import { Message } from "./types.js";
/**
 * 解析共享 / conversation 链接并返回消息列表
 * @param uuid conversation UUID
 * @param token Bearer token；若为空则自动读取 process.env.OPENAI_ACCESS_TOKEN
 */
export declare function chat2json(uuid: string, token?: string): Promise<Message[]>;
