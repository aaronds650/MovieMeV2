// Frontend debugging script to test watchlist/watched functionality
const BASE_URL = 'https://movie-me-v2.vercel.app';

async function simulateFrontendFlow() {
  console.log('🔍 Simulating Frontend Watchlist/Watched Flow\n');
  
  // Test user (simulating what would be in localStorage)
  const testUserId = '12345678-1234-4abc-9abc-123456789012';
  
  // Test movie data (simulating what components would pass)
  const testMovie = {
    tmdb_id: 98765,
    title: 'Debug Test Movie',
    year: 2024,
    poster_url: 'https://image.tmdb.org/t/p/w500/test.jpg',
    overview: 'This is a test movie for debugging purposes.'
  };
  
  console.log('1️⃣ Testing addToWatchlist flow...');
  try {
    const response = await fetch(`${BASE_URL}/api/watchlist`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        user_id: testUserId,
        movieData: testMovie
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      if (response.status === 409) {
        console.log('✅ 409 handled correctly - movie already exists');
      } else {
        console.log('❌ Unexpected error status:', response.status);
      }
    } else {
      console.log('✅ Successfully added to watchlist');
    }
    
  } catch (error) {
    console.log('❌ Network/Parse error:', error.message);
  }
  
  console.log('\n2️⃣ Testing markAsWatched flow...');
  const watchedMovie = { ...testMovie, tmdb_id: testMovie.tmdb_id + 1 };
  
  try {
    const response = await fetch(`${BASE_URL}/api/watched`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'add',
        user_id: testUserId,
        movieData: watchedMovie
      })
    });
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    const responseData = await response.json();
    console.log('Response data:', JSON.stringify(responseData, null, 2));
    
    if (!response.ok) {
      if (response.status === 409) {
        console.log('✅ 409 handled correctly - movie already watched');
      } else {
        console.log('❌ Unexpected error status:', response.status);
      }
    } else {
      console.log('✅ Successfully marked as watched');
    }
    
  } catch (error) {
    console.log('❌ Network/Parse error:', error.message);
  }
  
  console.log('\n3️⃣ Testing status check flows...');
  
  // Test watchlist status check
  try {
    const response = await fetch(`${BASE_URL}/api/watchlist?user_id=${testUserId}&tmdb_id=${testMovie.tmdb_id}`);
    const data = await response.json();
    console.log('Watchlist status check:', data);
  } catch (error) {
    console.log('❌ Watchlist status check failed:', error.message);
  }
  
  // Test watched status check
  try {
    const response = await fetch(`${BASE_URL}/api/watched?user_id=${testUserId}&tmdb_id=${watchedMovie.tmdb_id}`);
    const data = await response.json();
    console.log('Watched status check:', data);
  } catch (error) {
    console.log('❌ Watched status check failed:', error.message);
  }
  
  console.log('\n🏁 Frontend simulation complete');
}

// Run the test
simulateFrontendFlow().catch(error => {
  console.log('💥 Test crashed:', error);
});