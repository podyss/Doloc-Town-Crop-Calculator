# Doloc Town Crop Calculator

《Doloc Town》作物成长时间、收获周期与产量计算器。

[在线使用](https://podyss.github.io/Doloc-Town-Crop-Calculator/)


## 使用方法

直接访问[在线版本](https://podyss.github.io/Doloc-Town-Crop-Calculator/)，选择作物并启用需要的加成选项，计算结果会即时更新。

也可以下载本仓库后直接打开 `index.html`。项目由原生 HTML、CSS 和 JavaScript 编写，无需安装依赖或执行构建命令。


## 项目结构

```text
.
├── index.html                  # 资源加载与组件入口
└── assets
    ├── components
    │   ├── define-template.js  # 原生模板组件注册器
    │   ├── app-header.js       # 页头与视图切换
    │   ├── crop-calculator.js  # 作物计算页面结构
    │   ├── layout-calculator.js # 布局计算页面结构
    │   └── app-dialogs.js      # 表单、确认框与提示层
    ├── css
    │   ├── base.css            # 全局变量、页头与通用组件
    │   ├── crop-view.css       # 作物计算视图
    │   ├── layout-view.css     # 布局计算视图
    │   ├── dialogs.css         # 表单、弹窗与提示
    │   └── responsive.css      # 响应式规则
    ├── data
    │   └── crop-catalog.js     # 作物与加工路线数据
    └── js
        ├── utils.js            # 格式化与通用工具
        ├── config.js           # 配置和默认状态
        ├── calculator.js       # 产量、耗时与产值计算
        ├── state.js            # 本地状态、迁移与校验
        ├── crop-view.js        # 作物视图交互
        ├── layout-view.js      # 布局编辑与计算
        ├── data-management.js  # 备份、恢复与确认操作
        └── app.js              # 应用初始化和事件装配
```

页面结构由原生 Custom Elements 按功能拆分，脚本使用经典 `defer` 加载。加载顺序由 `index.html` 统一管理，因此仍可通过本地文件直接运行。


## 作者

[B站用户 podys](https://www.bilibili.com/opus/1236483941697847304)
