# MovieMe - AI-Powered Movie Recommendations

MovieMe is an intelligent movie recommendation platform that uses AI to help users discover their next favorite film based on their preferences, mood, and viewing history.

## Features

- **AI-Powered Recommendations**: Get personalized movie suggestions using advanced AI algorithms
- **Mood-Based Discovery**: Find movies that match your current emotional state
- **Genre-Based Filtering**: Discover films by selecting your favorite genres and subgenres
- **Personal Movie Lists**: Keep track of movies you want to watch and ones you've already seen
- **User Authentication**: Secure login with email/username and password
- **Responsive Design**: Beautiful, mobile-friendly interface built with Tailwind CSS

## Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Database**: Supabase (PostgreSQL)
- **AI Integration**: OpenAI GPT-4
- **Movie Data**: The Movie Database (TMDB) API
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Supabase account
- OpenAI API key
- TMDB API key

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/movieme.git
cd movieme
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
Create a `.env` file in the root directory with the following variables:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_OPENAI_API_KEY=your_openai_api_key
VITE_TMDB_API_KEY=your_tmdb_api_key
```

4. Set up the database:
- Run the Supabase migrations in the `supabase/migrations/` directory
- The migrations will create all necessary tables and security policies

5. Start the development server:
```bash
npm run dev
```

## Project Structure

```
src/
├── components/          # React components
│   ├── auth/           # Authentication components
│   ├── conversation/   # Movie discovery flow
│   ├── pages/          # Main page components
│   └── ui/             # Reusable UI components
├── context/            # React context providers
├── hooks/              # Custom React hooks
├── lib/                # Utility functions and API clients
└── main.tsx           # Application entry point

supabase/
└── migrations/         # Database migration files
```

## Key Features

### Movie Discovery Flow
- **Path Selection**: Choose between genre-based or mood-based discovery
- **Genre Selection**: Pick from comedy, thriller, action, drama, sci-fi/fantasy, romance, horror, and documentary
- **Subgenre Refinement**: Narrow down preferences with specific subgenres
- **Favorite Movies**: Input movies you've enjoyed to improve recommendations
- **Mood Selection**: Choose emotional tones like feel-good, suspenseful, or thought-provoking
- **Time Period**: Select preferred movie eras or choose any time period
- **Critical Acclaim**: Option to prioritize award-winning films

### User Management
- **Authentication**: Email/username and password login
- **User Profiles**: Track user preferences and search history
- **Search Limits**: Core users get 5 searches per day, premium users get 30
- **Activity Logging**: Track user interactions for analytics

### Movie Lists
- **Watchlist**: Save movies to watch later
- **Watched Movies**: Mark movies as seen with optional ratings and reviews
- **List Management**: Sort and paginate movie collections

## Database Schema

The application uses Supabase with the following main tables:
- `profiles` - User profile information
- `watchlist` - User's movies to watch
- `watched_movies` - User's completed movies
- `search_usage` - Track daily search limits
- `user_activity_log` - User interaction analytics

## API Integration

- **OpenAI**: Powers the AI recommendation engine
- **TMDB**: Provides movie metadata, posters, and search functionality
- **Supabase**: Handles authentication, database, and real-time features

## Deployment

The application is configured for deployment on Netlify with:
- Automatic builds from the main branch
- Environment variable configuration
- SPA routing support via `_redirects` file

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@moviemeapp.com or create an issue in this repository.