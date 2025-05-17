export interface ChatProps {
  role?: 'user' | 'assistant' | 'system';
  time?: string;          // ISO-8601
  ct?: string;            // content-type: thoughts | code | …
  lang?: string;          // language for ct:code
}

/**
 * Turn `{% chat … %}` tag parameters into the opening `<div …>` that
 * wraps one chat message.  
 * Example call from the Hexo tag plugin:
 *   md2htmltag(['role:user', 'time:"2025-05-04T14:13:45.366Z"', 'ct:thoughts'])
 * ➜
 *   <div class="chat chat-user chat-thoughts" data-time="2025-05-04T14:13:45.366Z">
 */
export function md2htmltag(rawArgs: string[]): string {
  const props: Record<string, string> = {};

  for (const arg of rawArgs) {
    const idx = arg.indexOf(':');
    if (idx === -1) continue;

    const key = arg.slice(0, idx).trim();
    let val = arg.slice(idx + 1).trim();

    // remove optional surrounding quotes
    if (val.startsWith('"') && val.endsWith('"')) {
      val = val.slice(1, -1);
    }
    props[key] = val;
  }

  const role = props.role ?? 'user';
  const ct   = props.ct   ?? '';
  const cls  = ['chat', `chat-${role}`];
  if (ct) cls.push(`chat-${ct}`);

  const timeAttr = props.time ? ` data-time="${props.time}"` : '';

  return `<div class="${cls.join(' ')}"${timeAttr}>`;
}
