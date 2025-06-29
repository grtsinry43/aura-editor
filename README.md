# Aura Editor

一个基于 Next.js 和 React 构建的协作文档编辑器，支持深浅色主题切换。

## 功能特性

- 📝 富文本编辑器
- 🌓 深浅色主题切换
- 📱 响应式设计
- 🔍 文档搜索和替换
- 📊 文档统计信息
- 📋 文档大纲导航

## 主题切换功能

项目支持三种主题模式：

1. **浅色模式 (Light)** - 明亮的界面，适合白天使用
2. **深色模式 (Dark)** - 暗色界面，适合夜间使用
3. **系统模式 (System)** - 自动跟随系统主题设置

### 如何使用主题切换

1. 在编辑器右上角找到主题切换按钮（太阳/月亮图标）
2. 点击按钮打开主题选择菜单
3. 选择您喜欢的主题模式：
   - ☀️ 浅色
   - 🌙 深色
   - 🖥️ 系统

### 主题设置

- 主题偏好会自动保存到本地存储
- 系统模式会根据您的操作系统主题设置自动切换
- 支持平滑的主题切换动画

## 技术栈

- **框架**: Next.js 15
- **UI 组件**: Radix UI + Tailwind CSS
- **主题管理**: next-themes
- **富文本编辑**: 原生 contentEditable
- **语言**: TypeScript

## 开发

```bash
# 安装依赖
pnpm install

# 启动开发服务器
pnpm dev

# 构建生产版本
pnpm build

# 启动生产服务器
pnpm start
```

## 项目结构

```
aura-editor/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # 根布局（包含主题提供者）
│   ├── page.tsx           # 主页面
│   └── globals.css        # 全局样式（包含主题变量）
├── components/            # React 组件
│   ├── ui/               # UI 组件库
│   │   └── theme-toggle.tsx  # 主题切换组件
│   ├── document-editor.tsx   # 文档编辑器主组件
│   ├── document-sidebar.tsx  # 文档侧边栏
│   ├── rich-text-editor.tsx  # 富文本编辑器
│   └── theme-provider.tsx    # 主题提供者
├── hooks/                # 自定义 Hooks
├── lib/                  # 工具函数
└── styles/               # 样式文件
```

## 主题变量

项目使用 CSS 自定义属性来管理主题颜色：

### 浅色主题变量
```css
:root {
  --background: 0 0% 100%;
  --foreground: 222.2 84% 4.9%;
  --primary: 221.2 83.2% 53.3%;
  --muted: 210 40% 96%;
  /* ... 更多变量 */
}
```

### 深色主题变量
```css
.dark {
  --background: 222.2 84% 4.9%;
  --foreground: 210 40% 98%;
  --primary: 217.2 91.2% 59.8%;
  --muted: 217.2 32.6% 17.5%;
  /* ... 更多变量 */
}
```

## 贡献

欢迎提交 Issue 和 Pull Request！

## 许可证

MIT License 