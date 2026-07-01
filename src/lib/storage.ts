import { createClient } from '@supabase/supabase-js'

function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

  if (!supabaseUrl || !supabaseServiceKey) {
    throw new Error('Supabase storage is not configured')
  }

  return createClient(supabaseUrl, supabaseServiceKey)
}

export async function uploadResume(buffer: Buffer, filename: string) {
  const supabase = getSupabaseClient()
  const path = `resumes/${Date.now()}-${filename}`
  const { error } = await supabase.storage
    .from('ats-files')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('ats-files').getPublicUrl(path)
  return data.publicUrl
}
