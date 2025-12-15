const fs = require('fs')
const path = require('path')

const categories = ['writing','drawing','script','code','marketing','education','business','creative','productivity','other']
const difficulties = ['beginner','intermediate','advanced']
const zhTagsByCategory = {
  writing: ['写作','文案','长文','故事','标题'],
  drawing: ['AI绘画','Midjourney','Stable Diffusion','风格','构图'],
  script: ['剧本','短视频','分镜','对话','反转'],
  code: ['编程','算法','代码','重构','调试'],
  marketing: ['营销','增长','转化','SEO','投放'],
  education: ['学习','课程','笔记','知识图谱','考试'],
  business: ['商业','运营','产品','战略','数据'],
  creative: ['创意','脑暴','设计','灵感','概念'],
  productivity: ['效率','流程','自动化','模板','清单'],
  other: ['综合','杂项','通用','提示词','技巧']
}
const imageByCategory = {
  writing: 'https://images.unsplash.com/photo-1510936111840-65e151ad71bb?q=80&w=1200&auto=format&fit=crop',
  drawing: 'https://images.unsplash.com/photo-1496307042754-b4aa456c4a2d?q=80&w=1200&auto=format&fit=crop',
  script: 'https://images.unsplash.com/photo-1517511620798-cec17d828004?q=80&w=1200&auto=format&fit=crop',
  code: 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop',
  marketing: 'https://images.unsplash.com/photo-1557800636-894a64c1696f?q=80&w=1200&auto=format&fit=crop',
  education: 'https://images.unsplash.com/photo-1517520287167-4bbf64a00d66?q=80&w=1200&auto=format&fit=crop',
  business: 'https://images.unsplash.com/photo-1556767576-cffae3be7d96?q=80&w=1200&auto=format&fit=crop',
  creative: 'https://images.unsplash.com/photo-1485827404703-89b55f04f17b?q=80&w=1200&auto=format&fit=crop',
  productivity: 'https://images.unsplash.com/photo-1506784983877-45594efa4cbe?q=80&w=1200&auto=format&fit=crop',
  other: 'https://images.unsplash.com/photo-1518972559570-7cc1309f3229?q=80&w=1200&auto=format&fit=crop'
}

function pick(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2) }
function titleFor(cat, i) {
  const map = {
    writing: ['爆款标题','结构化写作','风格模仿','长文大纲','总结改写'],
    drawing: ['MJ场景提示','SD风格模板','构图指令','光影方案','人物设定'],
    script: ['短视频脚本','剧情反转','对白强化','分镜清单','节奏模板'],
    code: ['代码重构','测试生成','Bug定位','架构草稿','注释补全'],
    marketing: ['着陆页文案','产品卖点','广告语生成','投放脚本','活动方案'],
    education: ['学习路径','知识点测验','讲义生成','思维导图','练习题'],
    business: ['商业计划','指标分析','竞品报告','会议纪要','岗位JD'],
    creative: ['脑暴清单','概念设计','世界观设定','角色卡','口号合集'],
    productivity: ['日报生成','流程优化','清单模板','自动化脚本','会议议程'],
    other: ['通用指令','角色设定','多语言翻译','礼貌润色','规范校对']
  }
  return `${map[cat][i % map[cat].length]} · Twitter热帖合集`
}
function contentFor(cat) {
  const base = {
    writing: '你是一位资深写作教练，请基于主题{主题}生成结构化内容：背景-痛点-解决方案-案例-行动号召，语气自然，加入数据与示例。',
    drawing: '为{主题}生成AI绘画提示：风格:{风格} 构图:{构图} 光影:{光影} 质感:{材质} 关键词:8K, ultra-detailed, cinematic, volumetric light。',
    script: '为{主题}生成30秒短视频脚本：钩子(0-3s)-价值点(4-15s)-反转(16-24s)-CTA(25-30s)，给出分镜与文案。',
    code: '作为资深工程师，为{项目}生成代码重构计划与关键测试用例，列出模块划分、边界条件与性能优化。',
    marketing: '为{产品}生成AIDA营销文案：注意-兴趣-欲望-行动，每段不超过50字，包含3个差异化卖点。',
    education: '为{课程}设计学习路径与练习题：基础-进阶-实战-测试，输出知识点与题目。',
    business: '为{业务}生成指标分析框架：目标-现状-问题-策略-风险，附关键KPI与数据采集方案。',
    creative: '围绕{主题}进行创意脑暴，输出10个方向，每个包含概念、受众、实现方式与灵感来源。',
    productivity: '为{场景}生成效率清单：准备-执行-复盘-自动化，输出模板与检查点。',
    other: '为{任务}生成通用提示词：角色-目标-输入-输出-约束-评价标准，保证可复用。'
  }
  return base[cat]
}

const items = []
for (let i = 0; i < 100; i++) {
  const cat = categories[i % categories.length]
  const now = new Date().toISOString()
  const tags = [...new Set([pick(zhTagsByCategory[cat]), pick(zhTagsByCategory[cat]), pick(zhTagsByCategory[cat]), 'Twitter','爆火'])]
  const title = titleFor(cat, i)
  items.push({
    id: uid(),
    title,
    content: contentFor(cat),
    description: `来自Twitter热门话题的${cat}提示词精选，覆盖多场景高转化用法。`,
    platform: 'twitter',
    category: cat,
    tags,
    sourceUrl: `https://twitter.com/search?q=${encodeURIComponent(title)}`,
    author: 'Twitter用户合集',
    createdAt: now,
    updatedAt: now,
    usageCount: Math.floor(Math.random()*5000)+100,
    rating: Number((Math.random()*1.5+3.5).toFixed(1)),
    difficulty: pick(difficulties),
    language: 'zh',
    imageUrl: imageByCategory[cat]
  })
}

const out = path.resolve(__dirname,'../src/data/prompts.json')
fs.writeFileSync(out, JSON.stringify(items, null, 2))
console.log(`generated ${items.length} prompts -> ${out}`)
