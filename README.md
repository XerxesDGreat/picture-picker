# Picture Picker

A web application for organizing and voting on photos, helping you choose the best pictures from your collection. Built with Next.js, TypeScript, and Prisma.

## Features

- **Photo Management**
  - Create albums to organize your photos
  - Upload multiple photos at once
  - Support for both portrait and landscape photos with responsive layouts
  - Automatic capture date extraction from photo metadata

- **Voting System**
  - Upvote and downvote photos
  - Unvote by clicking the same button again
  - Real-time vote count updates
  - Sort photos by score (high to low or low to high)

- **Sorting Options**
  - Capture date (old to new, new to old)
  - Upload date (old to new, new to old)
  - Score (high to low, low to high)
  - Secondary sort by capture date when scores are equal

- **User Features**
  - User authentication with email/password and Google
  - Personal voting history
  - Secure photo storage

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MySQL with Prisma ORM
- **Authentication**: NextAuth.js
- **File Storage**: MinIO
- **Image Processing**: Sharp

## Prerequisites

- Node.js 18 or later
- MySQL database
- MinIO server for file storage
- Google OAuth credentials (for Google sign-in)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/picturepicker_dev"

# NextAuth
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# Google OAuth
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# MinIO
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="your-access-key"
MINIO_SECRET_KEY="your-secret-key"
MINIO_BUCKET_NAME="picturepicker"
MINIO_USE_SSL=false
```

## Getting Started

1. Clone the repository:
   ```bash
   git clone https://github.com/yourusername/picture-picker.git
   cd picture-picker
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up the database:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Using the Application

### Authentication
- Sign up with email/password or Google account
- Log in to access your albums and voting features

### Managing Albums
1. Create a new album:
   - Click "New Album" on the home page
   - Enter an album title
   - Click "Create Album"

2. Add photos to an album:
   - Open an album
   - Click "Add Photos"
   - Drag and drop or select photos
   - Photos will be uploaded and displayed in the album

### Voting and Sorting
1. Vote on photos:
   - Hover over a photo to reveal voting controls
   - Click thumbs up (👍) to upvote
   - Click thumbs down (👎) to downvote
   - Click the same button again to remove your vote

2. Sort photos:
   - Use the dropdown menu to select sorting criteria
   - Options include:
     - Capture date (old to new, new to old)
     - Upload date (old to new, new to old)
     - Score (high to low, low to high)

### Photo Layout
- Photos are displayed in a responsive grid
- Portrait photos maintain their aspect ratio
- Landscape photos fill available space
- Hover over photos to see voting controls

## Development

### Project Structure
```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   ├── albums/            # Album pages
│   └── auth/              # Authentication pages
├── components/            # React components
├── lib/                   # Utility functions and configurations
└── types/                 # TypeScript type definitions
```

### Key Files
- `src/app/api/albums/[id]/photos/route.ts`: Photo upload endpoint
- `src/app/api/photos/[id]/vote/route.ts`: Vote handling endpoint
- `src/components/PhotoCard.tsx`: Photo display and voting component
- `src/app/albums/[id]/page.tsx`: Album page with sorting and layout

### Database Schema
The application uses Prisma with the following main models:
- `User`: User accounts and authentication
- `Album`: Photo collections
- `Photo`: Individual photos with metadata
- `Vote`: User votes on photos

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
