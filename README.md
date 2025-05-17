# Hexo Chat2Blog Plugin

[![GitHub stars](https://img.shields.io/github/stars/NickLennonLiu/hexo-chat2blog.svg?style=social&label=Star)](https://github.com/NickLennonLiu/hexo-chat2blog)
[![GitHub release](https://img.shields.io/github/release/NickLennonLiu/hexo-chat2blog.svg)](https://github.com/NickLennonLiu/hexo-chat2blog/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/NickLennonLiu/hexo-chat2blog/total.svg)](https://github.com/NickLennonLiu/hexo-chat2blog/releases)

[English](#english) | [中文](#chinese)

## English

A Hexo plugin that converts chat conversations into beautiful blog posts. This plugin provides a custom tag `chat` that allows you to easily format and display chat conversations in your Hexo blog posts. See [Demo](https://blog.river9.top/2025/05/17/aiandbrain/).

### Features

- Custom `chat` tag for formatting chat conversations
- Automatic CSS styling for chat messages
- Markdown support within chat messages
- Seamless integration with Hexo

### Installation

```bash
npm install hexo-chat2blog
# or
pnpm add hexo-chat2blog
```

### Usage

In your Hexo blog post, use the `chat` tag to format your chat conversations:

```markdown
{% chat %}
Your chat content here in markdown format
{% endchat %}
```

### Development

```bash
# Install dependencies
pnpm install

# Build the project
pnpm build

# Run linter
pnpm lint
```

## Chinese

一个将聊天对话转换为精美博客文章的 Hexo 插件。该插件提供了一个自定义标签 `chat`，可以让你轻松地在 Hexo 博客文章中格式化和显示聊天对话。[示例博客](https://blog.river9.top/2025/05/17/aiandbrain/)

### 功能特点

- 用于格式化聊天对话的自定义 `chat` 标签
- 聊天消息的自动 CSS 样式
- 支持在聊天消息中使用 Markdown
- 与 Hexo 无缝集成

### 安装

```bash
npm install hexo-chat2blog
# 或
pnpm add hexo-chat2blog
```

### 使用方法

在你的 Hexo 博客文章中，使用 `chat` 标签来格式化你的聊天对话：

```markdown
{% chat %}
在这里使用 markdown 格式编写聊天内容
{% endchat %}
```

### 开发

```bash
# 安装依赖
pnpm install

# 构建项目
pnpm build

# 运行代码检查
pnpm lint
```

## License

ISC © Junetheriver

[![Star History Chart](https://api.star-history.com/svg?repos=NickLennonLiu/hexo-chat2blog&type=Date)](https://star-history.com/#NickLennonLiu/hexo-chat2blog&Date)