import { Message } from "./types.js";
/**
 * 把 Message[] 转成 Hexo `{% chat %}` 语法的 Markdown
 */
export declare function list2md(list: Message[]): string;
export declare function cleanMessages(list: Message[]): Message[];
export declare function sortByCreateTime(list: Message[]): Message[];
/**
 * 2. 排序：先保证 parent 在 child 之前，再按时间升序
 * 排序规则：
 *   1) 先保证 parent 在 child 之前（拓扑顺序）
 *   2) 同一个 parent 的多个子节点：
 *        · 若两条都有 create_time → 按时间升序
 *        · 其它情况 → 保留原出现顺序 (stable)
 */
export declare function sortByParentThenTime(list: Message[]): Message[];
