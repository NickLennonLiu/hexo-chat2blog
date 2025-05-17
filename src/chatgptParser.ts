// conversationParser.ts
import {
    Conversation,
    ConversationNode,
    Message,
    Author,
    // BaseContent,
    Content,
    TextContent,
    CodeContent,
    ThoughtsContent,
    UserEditableContextContent,
    ModelEditableContextContent,
    ReasoningRecapContent,
    UnknownContent,
  } from "./types.js";
  
  /* ---------- 入口 ---------- */
  
  /**
   * 将 backend-api/conversation/<uuid> 的响应反序列化为 Conversation
   * @param raw 后端 JSON
   */
  export function parseBackendConversation(raw: any): Conversation {
    if (!raw || !raw.mapping) {
      throw new Error("无效的 conversation 数据：缺少 mapping 字段");
    }
  
    /** 逐条解析节点 */
    const mapping: Record<string, ConversationNode> = {};
    for (const [id, nodeRaw] of Object.entries<any>(raw.mapping)) {
      mapping[id] = {
        id,
        parent: nodeRaw.parent ?? null,
        children: Array.isArray(nodeRaw.children) ? nodeRaw.children : [],
        message: parseMessage(nodeRaw.message),
      };
    }
  
    return {
      title: raw.title ?? "",
      create_time: raw.create_time ?? 0,
      update_time: raw.update_time ?? 0,
      mapping,
    };
  }
  
  /* ---------- 工具函数 ---------- */
  
  /**
   * 按时间升序展开整棵树
   */
  export function flattenConversation(conv: Conversation): Message[] {
    const nodes = Object.values(conv.mapping);
    return nodes
      .filter((n) => !!n.message)
      .sort(
        (a, b) =>
          (a.message.create_time ?? 0) - (b.message.create_time ?? 0)
      )
      .map((n) => n.message);
  }
  
  /* ---------- 解析细节 ---------- */
  
  function parseMessage(raw: any): Message {
    if (!raw) {
      // 某些占位节点 message 可能为空
      return {
        id: "",
        author: { role: "system" },
        create_time: null,
        update_time: null,
        content: { content_type: "unknown" } as UnknownContent,
        status: "unknown",
        end_turn: false,
        weight: 0,
        metadata: {},
        recipient: null,
        channel: null,
      };
    }
  
    return {
      id: raw.id ?? "",
      author: parseAuthor(raw.author),
      create_time: raw.create_time ?? null,
      update_time: raw.update_time ?? null,
      content: parseContent(raw.content),
      status: raw.status ?? "unknown",
      end_turn:
        typeof raw.end_turn === "boolean" ? raw.end_turn : Boolean(raw.end_turn),
      weight: raw.weight ?? 0,
      metadata: raw.metadata ?? {},
      recipient: raw.recipient ?? null,
      channel: raw.channel ?? null,
    };
  }
  
  function parseAuthor(raw: any): Author {
    return {
      role: raw?.role ?? "system",
      name: raw?.name ?? null,
      metadata: raw?.metadata ?? {},
    };
  }
  
  function parseContent(raw: any): Content {
    if (!raw || typeof raw !== "object") {
      return { content_type: "unknown" } as UnknownContent;
    }
  
    switch (raw.content_type) {
      case "text":
        return {
          content_type: "text",
          parts: Array.isArray(raw.parts) ? raw.parts : [],
        } as TextContent;
  
      case "code":
        return {
          content_type: "code",
          language: raw.language ?? "unknown",
          text: raw.text ?? "",
          response_format_name: raw.response_format_name ?? null,
        } as CodeContent;
  
      case "thoughts":
        return {
          content_type: "thoughts",
          thoughts: raw.thoughts ?? [],
          source_analysis_msg_id: raw.source_analysis_msg_id ?? undefined,
        } as ThoughtsContent;
  
      case "user_editable_context":
        return {
          content_type: "user_editable_context",
          user_profile: raw.user_profile ?? "",
          user_instructions: raw.user_instructions ?? "",
        } as UserEditableContextContent;
  
      case "model_editable_context":
        return {
          content_type: "model_editable_context",
          model_set_context: raw.model_set_context ?? "",
          repository: raw.repository ?? null,
          repo_summary: raw.repo_summary ?? null,
          structured_context: raw.structured_context ?? null,
        } as ModelEditableContextContent;
  
      case "reasoning_recap":
        return {
          content_type: "reasoning_recap",
          content: raw.content ?? "",
        } as ReasoningRecapContent;
  
      default:
        return {
          content_type: raw.content_type ?? "unknown",
          ...raw,
        } as UnknownContent;
    }
  }
  