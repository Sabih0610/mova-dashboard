import { mockData } from './mockData'

const CLUSTER_URI = 'https://trd-70pn7j91vdw00gn8e7.z5.kusto.fabric.microsoft.com'
const DATABASE = 'kql_event_model'

// Set to false when real pipeline is ready
const USE_MOCK = true

export async function fetchKQL(functionName, params = {}) {
  if (USE_MOCK) {
    await new Promise(r => setTimeout(r, 200 + Math.random() * 300))
    return mockData[functionName] || []
  }

  const token = await getToken()
  const response = await fetch(`${CLUSTER_URI}/v1/rest/query`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      db: DATABASE,
      csl: buildQuery(functionName, params),
    }),
  })
  const data = await response.json()
  return parseKQLResponse(data)
}

function buildQuery(functionName, params) {
  // Filters applied per Tushar's ERD v2 requirements
  const baseFilter = "| where close_reason == 'exit' | where min_stitch_confidence > 0.80"
  return `${functionName}() ${baseFilter}`
}

function parseKQLResponse(data) {
  const table = data.Tables?.[0]
  if (!table) return []
  const { Columns, Rows } = table
  return Rows.map(row =>
    Object.fromEntries(Columns.map((col, i) => [col.ColumnName, row[i]]))
  )
}

async function getToken() {
  throw new Error('Real token not implemented yet — USE_MOCK should be true')
}
