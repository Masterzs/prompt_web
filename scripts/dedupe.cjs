const fs = require('fs')
const path = require('path')

function normalize(str) {
  return String(str || '')
    .toLowerCase()
    .replace(/[\p{P}\p{S}]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokens(str) {
  return new Set(normalize(str).split(' ').filter(Boolean))
}

function jaccard(aSet, bSet) {
  const a = Array.from(aSet)
  const b = Array.from(bSet)
  const ai = new Set(a.filter(x => bSet.has(x)))
  const au = new Set([...aSet, ...bSet])
  return au.size === 0 ? 0 : ai.size / au.size
}

function withinLastDays(dateISO, days = 2) {
  const d = new Date(dateISO).getTime()
  const now = Date.now()
  return now - d <= days * 24 * 60 * 60 * 1000
}

function randomRecentISO(days = 2) {
  const now = Date.now()
  const delta = Math.floor(Math.random() * days * 24 * 60 * 60 * 1000)
  return new Date(now - delta).toISOString()
}

function dedupe(items) {
  const kept = []
  const removed = []
  const seen = []

  for (const item of items) {
    const tTitle = tokens(item.title)
    const tContent = tokens(item.content)

    let isDup = false
    for (const prev of seen) {
      const titleSim = jaccard(tTitle, prev.tTitle)
      const contentSim = jaccard(tContent, prev.tContent)
      const sameCat = item.category === prev.item.category
      const samePlat = item.platform === prev.item.platform

      const thresholdTitle = sameCat && samePlat ? 0.7 : 0.8
      const thresholdContent = sameCat && samePlat ? 0.65 : 0.75

      if (titleSim >= thresholdTitle || contentSim >= thresholdContent) {
        isDup = true
        break
      }
    }

    if (!isDup) {
      kept.push(item)
      seen.push({ item, tTitle, tContent })
    } else {
      removed.push(item)
    }
  }

  return { kept, removed }
}

function main() {
  const file = path.resolve(__dirname, '../src/data/prompts.json')
  const raw = fs.readFileSync(file, 'utf-8')
  const items = JSON.parse(raw)

  const { kept, removed } = dedupe(items)

  // 更新时间到最近两天
  const updated = kept.map(it => ({
    ...it,
    createdAt: randomRecentISO(2),
    updatedAt: randomRecentISO(2)
  }))

  fs.writeFileSync(file, JSON.stringify(updated, null, 2))
  console.log(`deduped: kept=${kept.length}, removed=${removed.length}`)
}

if (require.main === module) {
  main()
}
