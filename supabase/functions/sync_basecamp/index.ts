import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface BasecampTokens {
  access_token: string
  refresh_token?: string
  expires_at?: string
  account_id?: string
}

interface SyncCounts {
  projects: number
  todo_lists: number
  todos: number
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const url = new URL(req.url)
    const resetParam = url.searchParams.get('reset')
    const isReset = resetParam === '1' || resetParam === 'true'
    
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      { auth: { persistSession: false } }
    )

    console.log('Starting Basecamp sync...', isReset ? '(RESET MODE)' : '(CURSOR MODE)')

    // Handle reset mode
    if (isReset) {
      console.log('Resetting sync state...')
      
      // Reset cursor to 0
      await supabaseClient
        .from('sync_state')
        .upsert({
          key: 'cursor_position',
          value: '0',
          updated_at: new Date().toISOString()
        }, { onConflict: 'key' })
      
      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Sync state reset successfully. Cursor position set to 0.',
          cursor_position: 0,
          last_synced_at: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    // Get cursor position from sync_state
    const { data: cursorData } = await supabaseClient
      .from('sync_state')
      .select('value')
      .eq('key', 'cursor_position')
      .single()
    
    const cursor = parseInt(cursorData?.value || '0')
    const limit = 25 // Process 25 todo lists at a time
    
    console.log(`Starting cursor-based sync from position ${cursor}`)

    // 1. Get tokens from bc_tokens table
    const { data: tokenData, error: tokenError } = await supabaseClient
      .from('bc_tokens')
      .select('*')
      .single()

    if (tokenError || !tokenData) {
      throw new Error('No Basecamp tokens found. Please set up your Basecamp integration first.')
    }

    const tokens: BasecampTokens = tokenData

    // 2. Check if tokens need refresh (simplified for now)
    if (tokens.expires_at && new Date(tokens.expires_at) <= new Date()) {
      console.log('Tokens expired, need refresh')
      // TODO: Implement token refresh logic
    }

    const counts: SyncCounts = { projects: 0, todo_lists: 0, todos: 0 }
    const baseUrl = `https://3.basecampapi.com/${tokens.account_id}`
    const headers = {
      'Authorization': `Bearer ${tokens.access_token}`,
      'User-Agent': 'Basecamp Avatar App (your-email@domain.com)',
      'Content-Type': 'application/json'
    }

    // 3. Get todo lists from database using cursor-based pagination
    console.log(`Fetching todo lists from database (cursor: ${cursor}, limit: ${limit})...`)
    const { data: todoLists, error: listsErr } = await supabaseClient
      .from("todo_lists")
      .select("id, basecamp_id, name, project_id")
      .gt("id", cursor)
      .order("id", { ascending: true })
      .limit(limit)

    if (listsErr) {
      throw new Error(`Failed to fetch todo lists from database: ${listsErr.message}`)
    }

    if (!todoLists || todoLists.length === 0) {
      console.log('No more todo lists to process. Sync complete!')
      return new Response(
        JSON.stringify({
          ok: true,
          message: 'Historical sync complete - no more todo lists to process',
          cursor_position: cursor,
          processed_lists: 0,
          todos_synced: 0,
          last_synced_at: new Date().toISOString()
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    }

    console.log(`Found ${todoLists.length} todo lists to process`)

    // 4. Process each todo list
    for (const todoList of todoLists) {
      try {
        // Get project info for this todo list
        const { data: projectData } = await supabaseClient
          .from('projects')
          .select('basecamp_id')
          .eq('id', todoList.project_id)
          .single()

        if (!projectData) {
          console.log(`No project found for todo list ${todoList.name}`)
          continue
        }

        console.log(`Processing todo list: ${todoList.name} (ID: ${todoList.basecamp_id})`)

        // 5. Fetch active todos for this todo list from Basecamp API
        const activeTodosResponse = await fetch(
          `${baseUrl}/buckets/${projectData.basecamp_id}/todolists/${todoList.basecamp_id}/todos.json`, 
          { headers }
        )
        
        if (!activeTodosResponse.ok) {
          console.error(`Failed to fetch active todos for list ${todoList.basecamp_id}: ${activeTodosResponse.status}`)
          continue
        }

        const activeTodos = await activeTodosResponse.json()
        
        // 6. Fetch completed todos for this todo list
        const completedTodosResponse = await fetch(
          `${baseUrl}/buckets/${projectData.basecamp_id}/todolists/${todoList.basecamp_id}/todos.json?completed=true`, 
          { headers }
        )
        
        let completedTodos = []
        if (completedTodosResponse.ok) {
          completedTodos = await completedTodosResponse.json()
        }
        
        const allTodos = activeTodos.concat(completedTodos)
        console.log(`Found ${allTodos.length} todos in list ${todoList.name}`)

        // 7. Process todos for this list - FILTER FOR AAYUSH ONLY + DATE FILTER
        const AAYUSH_USER_ID = 47103552 // Aayush Maggo's Basecamp user ID
        const JUNE_2025_START = new Date('2025-06-01T00:00:00Z') // Only sync from June 2025 onwards
        
        for (const todo of allTodos) {
          // Fix: Basecamp uses 'assignees' array, not 'assignee' object
          const primaryAssignee = todo.assignees && todo.assignees.length > 0 ? todo.assignees[0] : null
          
          // FILTER 1: Only sync todos assigned to Aayush Maggo
          if (!primaryAssignee || primaryAssignee.id !== AAYUSH_USER_ID) {
            continue // Skip todos not assigned to Aayush
          }
          
          // FILTER 2: Only sync todos from June 2025 onwards
          const todoCreatedAt = new Date(todo.created_at)
          const todoUpdatedAt = new Date(todo.updated_at)
          const isRecentTodo = todoCreatedAt >= JUNE_2025_START || todoUpdatedAt >= JUNE_2025_START
          
          if (!isRecentTodo) {
            continue // Skip todos from before June 2025
          }
          
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

          counts.todos++
        }

        counts.todo_lists++
        
      } catch (error) {
        console.error(`Error processing todo list ${todoList.name}:`, error)
        continue
      }
    }

    // 8. Update cursor position to the last processed todo list ID
    const lastProcessedId = todoLists[todoLists.length - 1].id
    await supabaseClient
      .from('sync_state')
      .upsert({
        key: 'cursor_position',
        value: lastProcessedId.toString(),
        updated_at: new Date().toISOString()
      }, { onConflict: 'key' })

    // 9. Update sync state
    const lastSyncedAt = new Date().toISOString()
    await supabaseClient
      .from('sync_state')
      .upsert({
        key: 'last_synced_at',
        value: lastSyncedAt,
        updated_at: lastSyncedAt
      }, { onConflict: 'key' })

    console.log('Batch sync completed successfully', counts)

    return new Response(
      JSON.stringify({
        ok: true,
        message: `Processed ${counts.todo_lists} todo lists, synced ${counts.todos} todos`,
        cursor_position: lastProcessedId,
        processed_lists: counts.todo_lists,
        todos_synced: counts.todos,
        has_more: todoLists.length === limit, // If we got a full batch, there might be more
        last_synced_at: lastSyncedAt
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )

  } catch (error) {
    console.error('Sync error:', error)
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