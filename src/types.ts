/* 会话整体 -------------------------------------------------------------- */

export interface Conversation {
    /** 标题（可能为空字符串） */
    title: string;
    /** 秒级时间戳 */
    create_time: number;
    update_time: number;
    /** 节点映射表：key 为节点 id，value 为节点本身 */
    mapping: Record<string, ConversationNode>;
  }
  
  /* 节点层级 -------------------------------------------------------------- */
  
  export interface ConversationNode {
    id: string;
    /** 具体消息体 */
    message: Message;
    /** 父节点 id（根节点为 null） */
    parent: string | null;
    /** 子节点 id 列表 */
    children: string[];
  }
  
  /* 消息基础 -------------------------------------------------------------- */
  
  export interface Message<
    C extends BaseContent = Content
  > {
    id: string;
    author: Author;
    create_time: number | null;
    update_time: number | null;
    content: C;                 // discriminated-union
    status: "finished_successfully" | "in_progress" | string;
    /** 模型是否认为这一 turn 结束 */
    end_turn: boolean | null;
    weight: number;
    metadata: Record<string, unknown>;
    /** assistant => user / all / web.run … */
    recipient: string | null;
    /** 多数情况下为 null；tool 调用链里偶尔填 "web.run" 等 */
    channel: string | null;
  }
  
  /* Author --------------------------------------------------------------- */
  
  export interface Author {
    role: "system" | "user" | "assistant" | "tool";
    name?: string | null;
    /** 任意扩展信息 */
    metadata?: Record<string, unknown>;
  }
  
  /* Content —— discriminated union --------------------------------------- */
  
  /* 所有具体内容类型的联合 ----------------------- */
  export type Content =
    | TextContent
    | CodeContent
    | ThoughtsContent
    | UserEditableContextContent
    | ModelEditableContextContent
    | ReasoningRecapContent
    | CallContent
    | UnknownContent;
  
  interface BaseContent {
    /** 判别字段 */
    content_type: string;
  }
  
  /** 常规纯文本（示例节点 id 796c…）:contentReference[oaicite:0]{index=0}:contentReference[oaicite:1]{index=1} */
  export interface TextContent extends BaseContent {
    content_type: "text";
    parts: string[];
  }
  
  /** 代码块（示例节点 id ffbc…）:contentReference[oaicite:2]{index=2}:contentReference[oaicite:3]{index=3} */
  export interface CodeContent extends BaseContent {
    content_type: "code";
    language: string;              // "typescript" | "python" | "unknown" …
    text: string;
    response_format_name?: string | null;
  }

  export interface CallContent extends BaseContent {
    content_type: "call";
    language: string;
    text: string;
  }
  
  /** 思考链 / 内部推理（示例节点 id b42d…）:contentReference[oaicite:4]{index=4}:contentReference[oaicite:5]{index=5} */
  export interface ThoughtsContent extends BaseContent {
    content_type: "thoughts";
    thoughts: {
      summary: string;
      content: string;
    }[];
    source_analysis_msg_id?: string;
  }
  
  /** 用户可编辑上下文（示例节点 id 8ffe…）:contentReference[oaicite:6]{index=6}:contentReference[oaicite:7]{index=7} */
  export interface UserEditableContextContent extends BaseContent {
    content_type: "user_editable_context";
    user_profile: string;
    user_instructions?: string;
  }
  
  /** 模型可编辑上下文（示例节点 id 3dfe…）:contentReference[oaicite:8]{index=8}:contentReference[oaicite:9]{index=9} */
  export interface ModelEditableContextContent extends BaseContent {
    content_type: "model_editable_context";
    model_set_context: string;
    repository: unknown | null;
    repo_summary: unknown | null;
    structured_context: unknown | null;
  }
  
  /** 推理时长 recap（示例节点 id e691…）:contentReference[oaicite:10]{index=10}:contentReference[oaicite:11]{index=11} */
  export interface ReasoningRecapContent extends BaseContent {
    content_type: "reasoning_recap";
    content: string;               // 例如 “已思考 11 秒”
  }
  
  
  
  /** 未知 / 未来新增类型兜底 */
  export interface UnknownContent extends BaseContent {
    /** 任何未列举到的 content_type */
    content_type: Exclude<string,
      | "text"
      | "code"
      | "thoughts"
      | "user_editable_context"
      | "model_editable_context"
      | "reasoning_recap"
    >;
    [key: string]: unknown;
  }
  