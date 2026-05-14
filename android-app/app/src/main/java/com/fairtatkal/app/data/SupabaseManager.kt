package com.fairtatkal.app.data

import io.github.jan.supabase.createSupabaseClient
import io.github.jan.supabase.gotrue.Auth
import io.github.jan.supabase.postgrest.Postgrest
import io.github.jan.supabase.gotrue.auth

object SupabaseManager {
    val client = createSupabaseClient(
        supabaseUrl = "https://tqsiadlcbtpyrwjydgfs.supabase.co",
        supabaseKey = "sb_publishable_zlA6HEwC7lRW4cMTKSwxaQ_aqT8wal2"
    ) {
        install(Auth)
        install(Postgrest)
    }
}
