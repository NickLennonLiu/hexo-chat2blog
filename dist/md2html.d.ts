export interface ChatProps {
    role?: 'user' | 'assistant' | 'system';
    time?: string;
    ct?: string;
    lang?: string;
}
/**
 * Turn `{% chat … %}` tag parameters into the opening `<div …>` that
 * wraps one chat message.
 * Example call from the Hexo tag plugin:
 *   md2htmltag(['role:user', 'time:"2025-05-04T14:13:45.366Z"', 'ct:thoughts'])
 * ➜
 *   <div class="chat chat-user chat-thoughts" data-time="2025-05-04T14:13:45.366Z">
 */
export declare function md2htmltag(rawArgs: string[]): string;
