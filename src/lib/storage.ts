import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
  process.env.SUPABASE_SERVICE_KEY ?? ''
)

export async function uploadResume(buffer: Buffer, filename: string) {
  const path = `resumes/${Date.now()}-${filename}`
  const { error } = await supabase.storage
    .from('ats-files')
    .upload(path, buffer, { contentType: 'application/pdf', upsert: false })
  if (error) throw error
  const { data } = supabase.storage.from('ats-files').getPublicUrl(path)
  return data.publicUrl
}
