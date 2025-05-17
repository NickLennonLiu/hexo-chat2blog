import fs from "fs";
import { Message } from "./types.js";
import { parseBackendConversation, flattenConversation } from "./chatgptParser.js"

import fetch from "node-fetch";
import { HttpsProxyAgent } from "https-proxy-agent";
import dotenv from "dotenv";

dotenv.config();

/**
 * 解析共享 / conversation 链接并返回消息列表
 * @param uuid conversation UUID
 * @param token Bearer token；若为空则自动读取 process.env.OPENAI_ACCESS_TOKEN
 */
export async function chat2json(
  uuid: string,
  token?: string
): Promise<Message[]> {

  const accessToken = token || process.env.OPENAI_ACCESS_TOKEN;
  if (!accessToken)
    throw new Error(
      `缺少 Authorization。请传入 token 参数或设置环境变量 OPENAI_ACCESS_TOKEN${process.env.OPENAI_ACCESS_TOKEN}`
    );

  let endpoint = uuid;
  if (!uuid.includes("http")) {
    endpoint = `https://chatgpt.com/backend-api/conversation/${endpoint}`;
  }

  const authorization = `Bearer ${accessToken}`;

  const proxy = process.env.HTTPS_PROXY || process.env.HTTP_PROXY;
  const agent = new HttpsProxyAgent(proxy as string);

  try {
    const response = await fetch(endpoint, {
      agent,
      method: "GET",
      headers: {
        "Authorization": authorization,
        "Accept": "*/*",
        "Accept-Encoding": "gzip, deflate, br",
        "Referer": `https://chatgpt.com/c/${uuid}`,
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/135.0.0.0 Safari/537.36",
        "Connection": "keep-alive",
        "Cache-Control": "no-cache",
      },
    });

    const data = await response.json();

    const conversation = parseBackendConversation(data);
    const messages = flattenConversation(conversation);

    return messages;

  } catch (e) {
    console.log("error", e);
    throw e;
  }
}
