# Account & Profile Page

The Account & Profile page provides users with comprehensive account management and personalization features.

## Features

### 📱 Profile Management
- **Personal Information**: Edit full name, email, phone, location, company, job title, website, and bio
- **Avatar Upload**: Upload and manage profile picture with real-time preview
- **Account Verification**: Display verification status and badges
- **Profile Editing**: Toggle between view and edit modes

### 🔔 Preferences
- **Notifications**: Configure email, push, meeting reminders, task updates, and weekly summaries
- **Appearance**: Choose theme (light/dark/system), language, and sound effects
- **Privacy**: Control profile visibility, activity status, and analytics sharing

### 🔐 Security
- **Password Management**: Change password with validation
- **Privacy Settings**: Control data sharing and profile visibility
- **Account Deletion**: Secure account deletion with confirmation

### 💳 Billing Integration
- **Subscription Management**: View current plan and usage
- **Billing History**: Access payment records
- **Usage Tracking**: Monitor API usage with visual progress bars

### 📊 Activity Dashboard
- **Statistics**: View meetings, tasks, summaries, and completion rates
- **Activity Feed**: Recent actions and achievements
- **Progress Tracking**: Daily streaks and performance metrics

## UI Components

### Tabs Navigation
- **Profile**: Personal information and avatar management
- **Preferences**: Notification and appearance settings
- **Security**: Password and privacy controls
- **Billing**: Subscription and payment information
- **Activity**: Usage statistics and recent activity

### Interactive Elements
- **Real-time Updates**: Instant feedback on changes
- **Form Validation**: Input validation with error messages
- **Loading States**: Progress indicators during operations
- **Toast Notifications**: Success/error feedback
- **Confirmation Dialogs**: Secure actions with confirmations

## Technical Implementation

### State Management
- React hooks for local state management
- Form state with validation
- Loading and error states
- Modal and dialog management

### API Integration
- Supabase authentication
- Profile data CRUD operations
- File upload for avatars
- Subscription management

### Responsive Design
- Mobile-first approach
- Grid layouts for different screen sizes
- Touch-friendly interactions
- Accessibility features

## Usage

1. **Access**: Navigate to `/dashboard/profile` or click "Profile" in the account dropdown
2. **Edit Profile**: Click "Edit Profile" to modify personal information
3. **Upload Avatar**: Click the camera icon on the avatar to upload a new image
4. **Configure Preferences**: Use the Preferences tab to customize notifications and appearance
5. **Manage Security**: Change password and privacy settings in the Security tab
6. **View Activity**: Check statistics and recent activity in the Activity tab

## Data Export

Users can export their profile data in JSON format using the "Export Data" button, which includes:
- Profile information
- Preferences
- Activity statistics
- Export timestamp

## Security Features

- Password strength validation
- Secure account deletion
- Privacy controls
- Data export capabilities
- Session management

## Future Enhancements

- Two-factor authentication
- Profile themes
- Activity analytics
- Team collaboration features
- Integration with external services
