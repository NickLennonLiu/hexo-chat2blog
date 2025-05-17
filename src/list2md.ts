import {
    Message,
    TextContent,
    CodeContent,
    CallContent,
    ThoughtsContent, 
    UnknownContent,
  } from "./types.js";
  
  /**
   * 把 Message[] 转成 Hexo `{% chat %}` 语法的 Markdown
   */
  export function list2md(list: Message[]): string {
    return cleanMessages(sortByParentThenTime(list))
      .map(renderMsg)
      .join("\n\n");
  }
  
  /* ----------------- helpers ----------------- */
  
  
  /* -------------------------------------------------- */
  /* 1. 过滤无效消息                                     */
  /* -------------------------------------------------- */
  
  export function cleanMessages(list: Message[]): Message[] {
    return list.filter((m) => {
      // (1) 隐藏标记
      if ((m.metadata as any)?.is_visually_hidden_from_conversation) return false;
  
      // (2) 可渲染的 content_type
      const ct = (m.content as any).content_type;
      if (ct === "text") {
        const parts = (m.content as TextContent).parts ?? [];
        if (parts.every((p) => p.trim() === "" && m.author.role !== "tool")) return false;
      } else if (ct === "code") {
        const text = (m.content as CodeContent).text ?? "";
        if (text.trim() === "" && m.author.role !== "tool") return false;
      } else if (ct === "thoughts") {
        const thoughts = (m.content as ThoughtsContent).thoughts ?? [];
        if (thoughts.every((t) => t.content.trim() === "")) return false;
      } else {
        return false; // 其他类型丢弃
      }

      // Temporary: remove all tool messages
      if (m.author.role === "tool") return false;
      if (m.recipient === "web.run") return false;
  
      // (3) 角色限制
      return ["user", "assistant", "tool"].includes(m.author.role);
    });
  }
  
  /* -------------------------------------------------- */
  /* (Deprecated)                                       */
  /* 2. 排序：仅调整有 create_time 的消息顺序             */
  /* -------------------------------------------------- */
  
  export function sortByCreateTime(list: Message[]): Message[] {
    // 收集带时间戳的消息及其原始索引
    const timed = list
      .map((m, i) => ({ m, i }))
      .filter(({ m }) => m.create_time !== null);
  
    // 稳定排序：先按时间戳，再按原次序
    timed.sort((a, b) => {
      const diff = (a.m.create_time! as number) - (b.m.create_time! as number);
      return diff !== 0 ? diff : a.i - b.i;
    });
  
    // 结果数组 = 原数组拷贝
    const out = list.slice();
    // 依次写回排序后的消息
    timed.forEach(({ i }, k) => {
      out[i] = timed[k].m;
    });
    return out;
  }
  
  /**
   * 2. 排序：先保证 parent 在 child 之前，再按时间升序
   * 排序规则：
   *   1) 先保证 parent 在 child 之前（拓扑顺序）
   *   2) 同一个 parent 的多个子节点：
   *        · 若两条都有 create_time → 按时间升序
   *        · 其它情况 → 保留原出现顺序 (stable)
   */
  export function sortByParentThenTime(list: Message[]): Message[] {
    // =========== 预处理 ===========
    const pos = new Map<string, number>();                // 记录原位置
    const id2msg = new Map<string, Message>();
    list.forEach((m, i) => {
      if (m.id) pos.set(m.id, i);
      id2msg.set(m.id, m);
    });
  
    // parent_id 可能放在 metadata 里
    function parentIdOf(m: Message): string | null {
      return ((m as any).metadata?.parent_id as string) ?? null;
    }
  
    // children 映射表
    const children: Map<string, Message[]> = new Map();
    const roots: Message[] = [];
    for (const m of list) {
      const pid = parentIdOf(m);
    //   console.log(`the pid of ${m.id.slice(0, 5)} is: ${pid?.slice(0, 5)}` )
      if (pid && id2msg.has(pid)) {
        (children.get(pid) ?? children.set(pid, []).get(pid)!).push(m);
      } else {
        roots.push(m);            // 没 parent ⇒ 视为根
      }
    }
  
    // 辅助：对子列表做稳定排序
    function sortSiblings(arr: Message[]) {
      arr.sort((a, b) => {
        const at = a.create_time;
        const bt = b.create_time;
        if (at != null && bt != null && at !== bt) return at - bt;
        return pos.get(a.id)! - pos.get(b.id)!;   // 原顺序兜底
      });
    }
    roots.forEach(() => sortSiblings(roots));
    [...children.values()].forEach(sortSiblings);
  
    // =========== DFS 输出 ===========
    const out: Message[] = [];
    const visit = (m: Message) => {
      out.push(m);
      const kids = children.get(m.id);
      if (kids) kids.forEach(visit);
    };
    roots.forEach(visit);
    return out;
  }
  
  function renderMsg(msg: Message): string {
    const p: string[] = [];
  
    // 必要参数
    p.push(`role:${msg.author.role}`);
    // if (msg.id) p.push(`id:${q(msg.id)}`);
  
    // 可选参数
    if (msg.author.name) p.push(`name:${q(msg.author.name)}`);
    if (msg.create_time !== null) {
      // Format create time to ISO 8601
      const time = new Date(msg.create_time * 1000).toISOString();
      p.push(`time:${q(time)}`);
    }

    // if recipient is web.run, change the content_type to 'call'
    if (msg.recipient === "web.run") {
      (msg.content as any).content_type = "call";
    }
  
    const ct = (msg.content as any).content_type;
    if (ct && ct !== "text") p.push(`ct:${ct}`);
    if (ct === "code" && (msg.content as CodeContent).language)
      p.push(`lang:${(msg.content as CodeContent).language}`);
  
    // Special case with Tool Use: the information are in metadata, not content
    if (msg.author.role === "tool") {
      p.push(`tool:${q(msg.author.name ?? "undefined" as string)}`);
      
    }

    // console.log(`Rendering: ${msg.id.slice(0, 5)}` )
  
    const head = `{% chat ${p.join(" ")} %}`;
    const body = msg.author.role === "tool" 
      ? renderMetadata(msg)
      : renderContent(msg.content);
    const tail = "{% endchat %}";
    return [head, body, tail].join("\n");
  }
  
  
  type Renderer<C extends { content_type: string }> = (c: C) => string;
  
  const renderText: Renderer<TextContent> = ({ parts }) => {
    return parts.join("\n");
  }
  
  const renderCode: Renderer<CodeContent> = ({ language, text }) => {
    return "```" + language + "\n" + text + "\n```";
  }
  
  const renderThoughts: Renderer<ThoughtsContent> = ({ thoughts }) => {
    // each paragraph: <summary>:<content>
    return thoughts.map(({ summary, content }) => {
      return summary ? `${summary}: ${content}` : content;
    }).join("\n\n");
  }

  const renderCall: Renderer<CallContent> = ({ text }) => {
    // actions:
    // - search_query
    // - open
    // - image_query
    // - find

    const data = JSON.parse(text);

    const search_query_data = data.search_query;
    if (search_query_data) {
      return search_query_data.map((q: any) => {
        return `- Searching for ${q.q}...`;
      }).join("\n");
    }

    const open_data = data.open;
    if (open_data) {
      return open_data.map((o: any) => {
        return `- Opening ${o.ref_id}...`;
      }).join("\n");
    }

    const image_query_data = data.image_query;
    if (image_query_data) {
      return image_query_data.map((i: any) => {
        return `- Searching for ${i.q}...`;
      }).join("\n");
    }

    const find_data = data.find;
    if (find_data) {
      return find_data.map((f: any) => {
        return `- Finding ${f.pattern ?? "[...]"} in ${f.ref_id}...`;
      }).join("\n");
    }
    
    return "";
  }
  
  const renderUnknown: Renderer<UnknownContent> = (c) => {
    return JSON.stringify(c, null, 2);
  }
  
  const CONTENT_RENDERER: Record<string, Renderer<any>> = {
    text: renderText,
    code: renderCode,
    thoughts: renderThoughts,
    call: renderCall,
    unknown: renderUnknown,
  }
  
  
  function renderContent(c: Message["content"]): string {
    // console.log(`Rendering: ${c.content_type}` )
    return (CONTENT_RENDERER[c.content_type] ?? renderUnknown)(c as any);
  }
  
  function renderMetadata(msg: Message) : string {
    console.log(`Rendering metadata: ${msg.author.role}` )

    if (msg.author.role !== "tool") return "";
  
    const groups = (msg.metadata as any)?.search_result_groups ?? [];
    if (!Array.isArray(groups) || groups.length === 0) return "";
  
    const lines: string[] = [];
  
    for (const g of groups) {
      // 分组标题（域名）
      const domain = g.domain ?? "";
      if (domain) lines.push(`**${domain}**`);
  
      // 每条搜索结果
      for (const e of g.entries ?? []) {
        if (e.type !== "search_result") continue;
  
        const url     = e.url as string;
        const title   = (e.title as string)   || url;
        const snippet = (e.snippet as string) || "";
  
        // pub_date 以秒为单位的时间戳 → YYYY-MM-DD
        let dateStr = "";
        if (typeof e.pub_date === "number") {
          dateStr = " (" + new Date(e.pub_date * 1000).toISOString().slice(0, 10) + ")";
        }
  
        lines.push(`- [${title}](${url})${dateStr}`);
        if (snippet) lines.push(`  - ${snippet}`);
      }
  
      lines.push("");           // 组之间空行
    }
  
    return lines.join("\n");
  }
  
  /** 参数值含空格或冒号时，加双引号并转义 */
  function q(s: string): string {
    return /[\s:]/.test(s) ? `"${s.replace(/"/g, '\\"')}"` : s;
  }
  