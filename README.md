# Picture Picker

A collaborative photo sharing and voting application built with Next.js, Prisma, and MinIO. Users can create albums, upload photos, and vote on their favorites. The application features a Google Photos-style interface with a lightbox view and real-time vote tracking.

## Features

- **Album Management**
  - Create photo albums
  - Upload multiple photos at once
  - Public albums visible to all users
  - Automatic image dimension detection
  - EXIF data extraction for capture dates

- **Photo Viewing**
  - Responsive masonry-style grid layout
  - Google Photos-style lightbox view
  - Keyboard navigation support
  - Maintains aspect ratios for both portrait and landscape photos

- **Photo Organization**
  - Sort by capture date (oldest/newest)
  - Sort by upload date (oldest/newest)
  - Sort by vote score (highest/lowest)

- **Voting System**
  - Upvote/downvote photos
  - Real-time vote updates
  - Score-based sorting
  - Vote counts visible in both grid and lightbox views

## Prerequisites

- Docker and Docker Compose
- Node.js 18+ (for development)
- Git

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mysql://root:your_password@db:3306/picture_picker"
MYSQL_ROOT_PASSWORD=your_password
MYSQL_DATABASE=picture_picker

# MinIO Configuration
MINIO_ROOT_USER=your_minio_user
MINIO_ROOT_PASSWORD=your_minio_password
MINIO_ENDPOINT=minio
MINIO_PORT=9000
MINIO_USE_SSL=false
MINIO_BUCKET_NAME=photos

# NextAuth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_nextauth_secret

# OAuth Providers (at least one is required)
# GitHub
GITHUB_ID=your_github_oauth_id
GITHUB_SECRET=your_github_oauth_secret

# Google
GOOGLE_ID=your_google_oauth_id
GOOGLE_SECRET=your_google_oauth_secret
```

## Running with Docker Compose

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/picture-picker.git
   cd picture-picker
   ```

2. Create and configure the `.env` file as shown above

3. Start the application:
   ```bash
   docker compose up -d
   ```

4. Access the application at `http://localhost:3000`

The application will automatically:
- Set up the MySQL database
- Run database migrations
- Start the MinIO server
- Start the Next.js application

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/picture-picker.git
   cd picture-picker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create and configure the `.env` file as shown above, but update the DATABASE_URL:
   ```env
   DATABASE_URL="mysql://root:your_password@localhost:3306/picture_picker"
   ```

4. Start the development database and MinIO:
   ```bash
   docker compose up db minio -d
   ```

5. Run database migrations:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

6. Start the development server:
   ```bash
   npm run dev
   ```

7. Access the application at `http://localhost:3000`

## Database Migrations

To create a new migration:
```bash
npx prisma migrate dev --name your_migration_name
```

To apply migrations in production:
```bash
npx prisma migrate deploy
```

## Project Structure

```
picture-picker/
├── prisma/                # Database schema and migrations
├── public/                # Static assets
├── src/
│   ├── app/              # Next.js app router pages and API routes
│   ├── components/       # React components
│   └── lib/             # Utility functions and shared code
├── .env                  # Environment variables
├── docker-compose.yml    # Docker Compose configuration
├── Dockerfile           # Next.js application container
└── next.config.js       # Next.js configuration
```

## API Routes

- `GET /api/albums` - List all albums
- `POST /api/albums` - Create a new album
- `GET /api/albums/:id` - Get album details
- `POST /api/albums/:id/photos` - Upload photos to an album
- `POST /api/photos/:id/vote` - Vote on a photo

## Contributing

1. Fork the repository
2. Create your feature branch: `git checkout -b feature/my-new-feature`
3. Commit your changes: `git commit -am 'Add some feature'`
4. Push to the branch: `git push origin feature/my-new-feature`
5. Submit a pull request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
