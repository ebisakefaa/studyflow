const FREE_LIMIT = 10

function getData(userId) {
  try {
    const all = JSON.parse(localStorage.getItem('sf_ai_usage') || '{}')
    const data = all[userId] || {}
    return { total: data.total || 0 }
  } catch {
    return { total: 0 }
  }
}

function saveData(userId, data) {
  const all = JSON.parse(localStorage.getItem('sf_ai_usage') || '{}')
  all[userId] = data
  localStorage.setItem('sf_ai_usage', JSON.stringify(all))
}

export function useAiUsage(userId) {
  function canUse() {
    return getData(userId).total < FREE_LIMIT
  }

  function use() {
    const data = getData(userId)
    data.total = (data.total || 0) + 1
    saveData(userId, data)
    return data.total
  }

  function getRemaining() {
    return Math.max(0, FREE_LIMIT - getData(userId).total)
  }

  function getUsed() {
    return getData(userId).total
  }

  function reset() {
    saveData(userId, { total: 0 })
  }

  return { canUse, use, getRemaining, getUsed, reset, FREE_LIMIT }
}