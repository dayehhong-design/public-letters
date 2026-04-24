import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://lviahnytlrortvkkwomv.supabase.co'
const SUPABASE_KEY = 'sb_publishable_HbEo0NH1kB7H1U5CphFHyA_SiBH6URt'

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)
