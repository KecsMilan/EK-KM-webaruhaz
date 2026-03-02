import 'dotenv/config' // or: require('dotenv').config()
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function example() {
  const { data, error } = await supabase
    .from('todos')
    .select('*')
  if (error) console.error(error)
  else console.log(data)
}

example()