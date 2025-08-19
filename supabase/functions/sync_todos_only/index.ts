import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    console.log('Starting todos-only sync...')

    // Get tokens
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('bc_tokens')
      .select('*')
      .single()

    if (tokenError || !tokenData) {
      throw new Error('No Basecamp tokens found.')
    }

    const baseUrl = `https://3.basecampapi.com/${tokenData.account_id}`
    const headers = {
      'Authorization': `Bearer ${tokenData.access_token}`,
      'User-Agent': 'Basecamp Avatar App (todos-sync)',
      'Content-Type': 'application/json'
    }

    // Get first 10 todo lists that don't have todos yet (or all if you want to resync)
    const { data: todoLists, error: todoListsError } = await supabaseClient
      .from('todo_lists')
      .select(`
        id, 
        basecamp_id, 
        name,
        projects!inner(basecamp_id)
      `)
      .limit(10) // Process only 10 lists to avoid timeout

    if (todoListsError || !todoLists) {
      throw new Error('Failed to get todo lists from database')
    }

    console.log(`Processing ${todoLists.length} todo lists...`)
    let todosCount = 0

    for (const todoList of todoLists) {
      const projectId = todoList.projects.basecamp_id
      
      console.log(`Fetching todos for list: ${todoList.name}`)
      
      // Fetch active todos from the correct endpoint
      const activeUrl = `${baseUrl}/buckets/${projectId}/todolists/${todoList.basecamp_id}/todos.json`
      const activeResponse = await fetch(activeUrl, { headers })
      
      if (!activeResponse.ok) {
        console.error(`Failed to fetch active todos for list ${todoList.basecamp_id}: ${activeResponse.status}`)
        continue
      }

      const activeTodos = await activeResponse.json()
      
      // Fetch completed todos as well
      const completedUrl = `${activeUrl}?completed=true`
      const completedResponse = await fetch(completedUrl, { headers })
      const completedTodos = completedResponse.ok ? await completedResponse.json() : []

      const allTodos = activeTodos.concat(completedTodos)
      console.log(`Found ${allTodos.length} todos in list ${todoList.name}`)

      for (const todo of allTodos) {
        // Basecamp returns an assignees array; use the first as primary
        const primaryAssignee = todo.assignees && todo.assignees.length > 0 ? todo.assignees[0] : null

        const { error: todoError } = await supabaseClient
          .from('todos')
          .upsert({
            basecamp_id: todo.id,
            todo_list_id: todoList.id,
            title: todo.content,
            notes: todo.notes || null,
            completed: todo.completed,
            due_date: todo.due_on || null,
            assignee_id: primaryAssignee?.id || null,
            assignee_name: primaryAssignee?.name || null,
            completed_at: todo.completed_at || null,
            updated_at: new Date().toISOString()
          }, { onConflict: 'basecamp_id' })

        if (todoError) {
          console.error('Error upserting todo:', todoError)
          continue
        }

        todosCount++
      }
    }

    // Update sync state
    const lastSyncedAt = new Date().toISOString()
    await supabaseClient
      .from('sync_state')
      .upsert({
        key: 'last_todos_sync',
        value: lastSyncedAt,
        updated_at: lastSyncedAt
      }, { onConflict: 'key' })

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Synced ${todosCount} todos from ${todoLists.length} todo lists`,
        last_synced_at: lastSyncedAt,
        todos_synced: todosCount,
        lists_processed: todoLists.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Todos sync error:', error)
    return new Response(
      JSON.stringify({ 
        ok: false, 
        error: error.message,
        last_synced_at: new Date().toISOString()
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})