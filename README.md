# TaskFlow AI 🚀

**AI-powered productivity suite with meeting summaries, task management, and comprehensive billing system**
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=flat-square&logo=supabase)
![Stripe](https://img.shields.io/badge/Stripe-Payments-purple?style=flat-square&logo=stripe)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC?style=flat-square&logo=tailwind-css)

## 🌟 Features
   git clone https://github.com/KingGoku910/TaskFlow-AI.git
### � Core Productivity
   cd TaskFlow-AI
- **Smart Dashboard** - Comprehensive overview of tasks, meetings, and analytics
- **AI Task Management** - Intelligent task decomposition and prioritization
- **Meeting Summaries** - AI-powered meeting transcription and summarization
- **Note Generation** - AI-assisted note creation and organization

### 💳 Billing & Subscription System
- **Multi-tier Subscriptions** - Free, Pro, and Enterprise plans
- **Stripe Integration** - Secure payment processing with webhook support
- **Usage Tracking** - Real-time monitoring of plan limits and consumption
- **Rate Limiting** - Automatic usage control and API limits
- **Payment Methods** - Secure card management and billing history

### 👤 User Management
- **Profile Management** - Comprehensive user profiles with avatar upload
- **Account Settings** - Security, privacy, notifications, and preferences
- **Authentication** - Secure user authentication with Supabase
- **Activity Tracking** - User engagement and usage statistics

### 📊 Analytics & Reporting
- **Usage Analytics** - Detailed usage reports and insights
- **Performance Metrics** - Task completion rates and productivity trends
- **Billing Analytics** - Revenue and subscription analytics
- **Real-time Dashboards** - Interactive charts and progress indicators

## 🎯 Recent Updates

### ✨ New Features
- **Complete Billing System** - Full Stripe integration with subscription management
- **Profile Page** - Comprehensive user profile with account management
- **Payment Processing** - Secure subscription upgrades and payment handling
- **Usage Monitoring** - Real-time tracking of plan limits and usage
- **Mock Mode** - Development-friendly billing simulation

### 🔧 Improvements
- **Audio Error Handling** - Fixed meeting summary playback issues
## 🛠️ Tech Stack

### Frontend
- **Next.js 15.3.5** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI components
- **Lucide React** - Beautiful icons

### Backend
- **Supabase** - PostgreSQL database with real-time features
- **Edge Functions** - Serverless API endpoints
- **Row Level Security** - Database-level security

### Payment Processing
- **Stripe** - Payment gateway integration
- **Webhook Handling** - Real-time payment event processing
- **Subscription Management** - Automated billing cycles

### AI & ML
## ⚡ Quick Start

### Prerequisites


1. **Clone the repository**
   ```bash
   git clone https://github.com/KingGoku910/Effecto-TaskFlow.git
   cd Effecto-TaskFlow
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment setup**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your actual values
   ```

4. **Database setup**
   - Create a new Supabase project
   - Go to SQL Editor in Supabase dashboard
   - Copy and run the entire contents of `database/complete-schema.sql`

5. **Start development server**
   ```bash
   npm run dev
   ```

6. **Open application**
   - Navigate to [http://localhost:3000](http://localhost:3000)
   - Complete the guided onboarding tutorial
   - Start managing your tasks with AI assistance!

## 📁 Project Structure

```
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── auth/              # Authentication pages
│   │   ├── dashboard/         # Main application
│   │   │   ├── analytics/     # Productivity analytics
│   │   │   ├── meeting-summaries/ # AI meeting features
│   │   │   ├── note-generator/    # AI note generation
│   │   │   ├── settings/      # User preferences
│   │   │   └── tasks/         # Task management
│   │   └── api/               # API routes
│   ├── components/            # React components
│   │   ├── dashboard/         # Dashboard components
│   │   ├── ui/                # Base UI components
│   │   └── common/            # Shared components
│   ├── ai/                    # AI integration
│   │   └── flows/             # AI processing workflows
│   ├── lib/                   # Utilities and configurations
│   ├── hooks/                 # Custom React hooks
│   ├── types/                 # TypeScript definitions
│   └── utils/                 # Helper functions
├── database/                  # Database schema
├── docs/                      # Documentation
└── scripts/                   # Build and deployment scripts
```

## 🔒 Security & Performance

- **Row Level Security**: Database-level user data isolation
- **JWT Authentication**: Secure session management
- **Optimistic Updates**: Instant UI feedback
- **Code Splitting**: Lazy loading for optimal performance
- **Edge Runtime**: Serverless functions for AI processing

## 📚 Documentation

- [📖 Complete Documentation](docs/PROJECT-DOCUMENTATION.md)
- [🏗️ Architecture Overview](docs/architecture.md)
- [🔧 Database Setup](docs/database-deployment.md)
- [🤖 AI Features Guide](docs/ai-features.md)

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under a Custom Commercial License - see the [LICENSE](LICENSE) file for details.

**Free Tier**: Basic task management features are available for personal, non-commercial use.
**Commercial Use**: Requires a commercial license. Contact licensing@innova-tex.com for details.

## � Acknowledgments

- [Supabase](https://supabase.com) for the backend infrastructure
- [Google AI](https://ai.google.dev) for the AI capabilities
- [Radix UI](https://radix-ui.com) for accessible components
- [Tailwind CSS](https://tailwindcss.com) for the styling system

## 📞 Support

- 📧 Email: support@innova-tex.com
- 🐛 Issues: [GitHub Issues](https://github.com/KingGoku910/Effecto-TaskFlow/issues)
- 📖 Documentation: [Full Docs](docs/)

---

**Built with ❤️ by Innova-TEX AI**
