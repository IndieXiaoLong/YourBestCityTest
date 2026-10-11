
---

# 改动日志 · 2026-10-11 12:18

## 用户输入的 Prompt
> 报错：Error: invalid file: utils/match.js, 33:34 SyntaxError: Unexpected token ?（next[dim] = clamp((next[dim] ?? 50) + delta)）

## 改动范围
- `miniprogram/utils/match.ts` 第 32-35 行：去掉空值合并运算符 `??`，改为兼容性写法：
  - 原：`next[dim] = clamp((next[dim] ?? 50) + delta)`
  - 新：先 `const cur = typeof next[dim] === 'number' ? next[dim] : 50`，再 `next[dim] = clamp(cur + delta)`
- 全项目扫描确认无其他 `??` / `?.` / `allSettled` / `matchAll` / `flatMap` 等高版本语法与 API

## 原因说明
- `??` 是 ES2020 语法，开发者工具编译后的 match.js 保留了该符号，旧版 JS 引擎无法解析导致运行时报 SyntaxError
- 行为完全等价（维度值缺失时按 50 起步），不影响匹配算法结果

## 验收情况
- `tsc --noEmit` 类型检查通过（typescript@4.9.5 + miniprogram-api-typings）


---

# 改动日志 · 2026-10-11 12:22

## 用户输入的 Prompt
> 需要（确认检查开发者工具编译设置，避免以后再写新语法时报 SyntaxError）

## 改动范围
- `project.config.json`：
  - `setting.es6`: false → true（对应「本地设置 → ES6 转 ES5」）
  - `setting.enhance`: false → true（对应「增强编译」，负责转换 `??`、`?.` 等更新语法）
- `project.private.config.json`：
  - `setting.showES6CompileOption`: false → true（让「ES6 转 ES5」选项在工具界面上可见）

## 原因说明
- 此前 `es6` 与 `enhance` 均关闭，编译产物保留 ES2020 语法（如 `??`），旧版 JS 引擎报 SyntaxError；这正是 match.js 报错的配置层根因
- 开启后由工具内置 babel 统一转译为兼容代码，今后可正常书写新语法

## 验收情况
- 两个 JSON 文件格式校验通过
- 需在开发者工具中重新打开/编译项目使设置生效


---

# 改动日志 · 2026-10-11 13:02

## 用户输入的 Prompt
> 在 .gitignore 文件里添加 AGENT.md

## 改动范围
- `.gitignore`：末尾新增一行 `AGENT.md`，使项目规范文件不进入版本库

## 验收情况
- `git ls-files --error-unmatch AGENT.md` 确认该文件从未被 Git 跟踪，忽略规则立即生效，无需 `git rm --cached`
