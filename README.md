# YT2MP3 Converter 🎵

A modern, mobile-first YouTube to MP3 converter built with React, TypeScript, and Vite. Convert YouTube videos to high-quality MP3 files instantly with a beautiful, responsive interface.

## ✨ Features

- **Mobile-First Design**: Optimized for Android and iOS devices
- **Modern UI**: Beautiful gradient design with glassmorphism effects
- **Fast Conversion**: Quick YouTube to MP3 conversion using RapidAPI
- **Responsive**: Works seamlessly on all screen sizes
- **TypeScript**: Full type safety and better developer experience
- **Testing**: Comprehensive unit tests with Jest and React Testing Library
- **CI/CD**: Automated testing and deployment with GitHub Actions

## 🚀 Live Demo

Visit the live application: [YT2MP3 Converter](https://yourusername.github.io/YT2MP3Dpwnload/)

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: CSS3 with CSS Variables, Flexbox, Grid
- **Icons**: Lucide React
- **API**: RapidAPI YouTube to MP3 service
- **Testing**: Jest, React Testing Library
- **CI/CD**: GitHub Actions
- **Deployment**: GitHub Pages

## 📱 Mobile Optimization

- Touch-friendly interface with large buttons
- Responsive design that works on all screen sizes
- Optimized for both portrait and landscape orientations
- iOS Safari and Android Chrome compatible
- Prevents zoom on input focus (iOS)

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/YT2MP3Dpwnload.git
   cd YT2MP3Dpwnload
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your RapidAPI key:
   ```env
   VITE_RAPIDAPI_KEY=your_rapidapi_key_here
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 🔑 API Setup

1. Sign up for [RapidAPI](https://rapidapi.com/)
2. Subscribe to the [YouTube MP3 API](https://rapidapi.com/ytjar/api/youtube-mp36/)
3. Copy your API key to the `.env` file

## 📦 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run test` - Run tests
- `npm run test:watch` - Run tests in watch mode
- `npm run test:coverage` - Run tests with coverage report

## 🧪 Testing

The project includes comprehensive tests for:

- **Utils**: YouTube URL validation, video ID extraction
- **Components**: UrlInput, ConversionStatus, Header
- **Hooks**: useConverter custom hook
- **Integration**: End-to-end user workflows

Run tests:
```bash
npm run test:coverage
```

## 🚀 Deployment

The project is configured for automatic deployment to GitHub Pages:

1. **Enable GitHub Pages** in your repository settings
2. **Set up secrets** in your repository:
   - `VITE_RAPIDAPI_KEY`: Your RapidAPI key
3. **Push to main branch** - deployment happens automatically

### Manual Deployment

```bash
npm run build
npm run deploy
```

## 📁 Project Structure

```
src/
├── components/          # React components
│   ├── Header.tsx      # App header with logo
│   ├── UrlInput.tsx    # YouTube URL input form
│   └── ConversionStatus.tsx # Conversion progress/results
├── hooks/              # Custom React hooks
│   └── useConverter.ts # Conversion logic hook
├── services/           # API services
│   └── api.ts         # YouTube to MP3 API
├── types/              # TypeScript type definitions
│   └── index.ts       # Shared interfaces
├── utils/              # Utility functions
│   └── youtube.ts     # YouTube URL validation
└── __tests__/          # Test files
    ├── components/     # Component tests
    ├── hooks/         # Hook tests
    └── utils/         # Utility tests
```

## 🎨 Design Features

- **Glassmorphism**: Modern glass-like UI elements
- **Gradient Backgrounds**: Beautiful color transitions
- **Smooth Animations**: Hover effects and transitions
- **Dark/Light Mode**: Automatic system preference detection
- **Loading States**: Visual feedback during conversion
- **Error Handling**: User-friendly error messages

## 🔒 Security

- Environment variables for API keys
- Input validation and sanitization
- HTTPS-only in production
- No sensitive data in client-side code

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ⚠️ Disclaimer

This tool is for educational purposes only. Please respect YouTube's Terms of Service and copyright laws. Only download content you have permission to use.

## 🙏 Acknowledgments

- [RapidAPI](https://rapidapi.com/) for the YouTube to MP3 API
- [Lucide](https://lucide.dev/) for the beautiful icons
- [Vite](https://vitejs.dev/) for the fast build tool
- [React](https://reactjs.org/) for the UI framework

## 📞 Support

If you have any questions or need help, please open an issue on GitHub.

---

Made with ❤️ for the community
