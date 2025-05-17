import { Conversation, Message } from "./types.js";
/**
 * 将 backend-api/conversation/<uuid> 的响应反序列化为 Conversation
 * @param raw 后端 JSON
 */
export declare function parseBackendConversation(raw: any): Conversation;
/**
 * 按时间升序展开整棵树
 */
export declare function flattenConversation(conv: Conversation): Message[];
