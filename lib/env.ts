function isPlaceholder(value: string | undefined) {
  if (!value) return true
  return /placeholder|local-test|your_|paste_|example/i.test(value)
}

export function isEdgeStoreConfigured() {
  const accessKey = process.env.EDGE_STORE_ACCESS_KEY
  const secretKey = process.env.EDGE_STORE_SECRET_KEY
  return !isPlaceholder(accessKey) && !isPlaceholder(secretKey)
}

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  return !isPlaceholder(url) && !isPlaceholder(key)
}
