# 🎵 Music Streaming & Playlist Management Application

A modern, feature-rich music streaming and playlist management application built with Angular 21.  This application provides an intuitive interface for browsing songs, managing playlists, exploring artists, and controlling music playback.

![Angular](https://img.shields.io/badge/Angular-21.1.0-red?style=flat-square&logo=angular)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-blue?style=flat-square&logo=typescript)

## 🌐 Live Demo

**Access the deployed application:** [Vercel](https://music-streaming-and-playlist-mangem-woad.vercel.app/)

For a detailed report click on : [report](Project 14 report.pdf)

## ✨ Features

### 🎧 Core Functionality
- **Song Library**: Browse and manage your complete music collection
- **Music Player**: Full-featured audio player with playback controls
- **Playlist Management**: Create, edit, and organize custom playlists
- **Artist Browser**: Explore artists with detailed information and top tracks
- **Responsive UI**: Modern, dark-themed interface optimized for all devices

### 🎨 User Interface
- Clean, Spotify-inspired dark theme design
- Intuitive navigation between different views (Home, Artists, Playlists)
- Real-time playback progress tracking
- Album artwork and artist image display
- Smooth animations and transitions

### 🔧 Technical Features
- Standalone Angular components architecture
- Reactive programming with RxJS
- Component-based service architecture
- TypeScript for type safety
- Prettier code formatting
- Vitest for unit testing

## 📁 Project Structure

```
Music-Streaming_and_playlist_Mangement_application/
├── src/
│   ├── app/
│   │   ├── components/         # UI Components
│   │   │   ├── navbar/         # Navigation bar component
│   │   │   ├── song-list/      # Song library display
│   │   │   ├── song-player/    # Audio player controls
│   │   │   ├── playlist-manager/ # Playlist management
│   │   │   └── artists-list/   # Artist browser
│   │   ├── models/             # Data models
│   │   ├── services/           # Business logic services
│   │   ├── app.ts              # Root component
│   │   └── app.config.ts       # App configuration
│   ├── index.html              # Entry HTML file
│   ├── main.ts                 # Application bootstrap
│   └── styles.css              # Global styles
├── public/                     # Static assets
├── angular.json                # Angular workspace config
├── package.json                # Dependencies
├── tsconfig. json               # TypeScript configuration
├── CUSTOMIZATION-GUIDE.md      # Guide for customizing content
└── README.md                   # This file
```

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher recommended)
- **npm** (v11. 6. 2 or higher)
- **Angular CLI** (v21.1.0)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Darain-Brit-A/Music-Streaming_and_playlist_Mangement_application.git
   cd Music-Streaming_and_playlist_Mangement_application
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   ng serve
   ```

4. **Open your browser**
   
   Navigate to `http://localhost:4200/`
   
   The application will automatically reload when you modify source files.

## 📝 Usage

### Development Commands

| Command | Description |
|---------|-------------|
| `npm start` | Start development server at http://localhost:4200 |
| `npm run build` | Build the project for production |
| `npm run watch` | Build in watch mode for development |
| `ng test` | Run unit tests with Vitest |
| `ng generate component component-name` | Generate a new component |

### Building for Production

To build the project for production: 

```bash
npm run build
```

This will compile your project and store the optimized build artifacts in the `dist/` directory.

## 🎨 Customization

To customize the application with your own music data, artists, and playlists, please refer to the [CUSTOMIZATION-GUIDE.md](./CUSTOMIZATION-GUIDE.md) file, which includes detailed instructions on:

- Adding songs to the library
- Configuring artist information
- Creating and managing playlists
- Setting up the music player
- Understanding data model parameters

### Quick Example:  Adding a Song

```typescript
// In src/app/components/song-list/song-list.component.ts
songs: SongModel[] = [
  new SongModel(1, 'Bohemian Rhapsody', 354, 1, 1),
  new SongModel(2, 'Stairway to Heaven', 482, 2, 2),
];
```

## 🏗️ Architecture

### Components

- **NavbarComponent**:  Top navigation bar with view switching
- **SongListComponent**:  Displays the complete song library
- **SongPlayerComponent**: Controls music playback with progress bar
- **PlaylistManagerComponent**:  Create and manage playlists
- **ArtistsListComponent**: Browse artists and their top tracks

### Models

- **SongModel**:  Represents a song with title, duration, artist, and album
- **ArtistModel**: Contains artist information, biography, and image
- **PlaylistModel**: Manages playlist data and associated songs

### Services

Service layer for managing application state, data flow, and business logic.

## 🧪 Testing

Run unit tests using Vitest: 

```bash
ng test
```


## 🛠️ Technologies Used

### Core Framework
- **Angular 21.1.0**: Modern web application framework
- **TypeScript 5.9.2**: Type-safe JavaScript superset

### Development Tools
- **Angular CLI 21.1.0**: Command-line interface for Angular
- **Prettier**:  Code formatting

## 🎯 Roadmap

Future enhancements planned for this application:

- [ ] Backend API integration
- [ ] User authentication and profiles
- [ ] Audio file upload and streaming
- [ ] Search and filter functionality
- [ ] Shuffle and repeat playback modes
- [ ] Queue management
- [ ] Social features (sharing playlists)
- [ ] Mobile app version
- [ ] Lyrics display
- [ ] Music recommendations

## 🤝 Contributing

Contributions are welcome! If you'd like to contribute to this project:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 👤 Author

- Github: [Nihitha](https://github.com/Nihitha47)
- GitHub: [Darain](https://github.com/Darain-Brit-A)
- GitHub: [Praveen](https://github.com/2326praveen)
- GitHub: [Anush](https://github.com/anushjowin)


