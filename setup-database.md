# MovieMe Database Setup Instructions

## Migration Order (Run in Exact Sequence)

Execute these 12 migration files in chronological order in your new Supabase project:

1. `20250216191313_crimson_feather.sql` - Core profiles and streaming services
2. `20250216192829_twilight_surf.sql` - Watchlist table  
3. `20250216194044_raspy_unit.sql` - Profile triggers
4. `20250217042838_white_meadow.sql` - Watched movies table
5. `20250217080525_shiny_meadow.sql` - Profile updates
6. `20250217173848_flat_sea.sql` - User preferences
7. `20250217174724_old_brook.sql` - Additional profile fields
8. `20250217213258_autumn_cake.sql` - Enhanced user profiles
9. `20250323012540_lively_lagoon.sql` - Search limits
10. `20250505151527_mute_tooth.sql` - Role-based access
11. `20250505154646_tender_bush.sql` - User activity logging
12. `20250505171617_tight_dew.sql` - Activity log policies

## How to Apply Migrations

1. Go to your Supabase project dashboard
2. Navigate to **SQL Editor**
3. Copy and paste each migration file content in order
4. Click **Run** for each one
5. Verify no errors before proceeding to the next

## Verification Steps

After all migrations are complete, verify:

1. **Tables exist**: profiles, streaming_services, user_streaming_services, watchlist, watched_movies, user_activity_log
2. **RLS enabled**: All tables should show "RLS enabled: true" 
3. **Streaming services populated**: Should have Netflix, Hulu, Prime Video, Disney+, Max, Peacock, Apple TV+
4. **Policies active**: Each table should have appropriate SELECT/INSERT/UPDATE/DELETE policies

## Environment Variables Needed

After setup, get from your Supabase project Settings > API:
- Project URL (for VITE_SUPABASE_URL)
- Anon/public key (for VITE_SUPABASE_ANON_KEY)