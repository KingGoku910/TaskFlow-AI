# Multilingual Speech Recognition Support

## Overview
TaskFlow AI now supports speech recognition in multiple languages, including **Afrikaans**, allowing users to conduct meetings in their preferred language.

## Supported Languages

| Language | Code | Flag | Notes |
|----------|------|------|-------|
| English (US) | `en-US` | 🇺🇸 | Default language |
| English (UK) | `en-GB` | 🇬🇧 | British English |
| **Afrikaans** | `af-ZA` | 🇿🇦 | **South African Afrikaans** |
| Spanish | `es-ES` | 🇪🇸 | Spain Spanish |
| French | `fr-FR` | 🇫🇷 | France French |
| German | `de-DE` | 🇩🇪 | Germany German |
| Portuguese | `pt-PT` | 🇵🇹 | Portugal Portuguese |
| Dutch | `nl-NL` | 🇳🇱 | Netherlands Dutch |

## Features

### 🎙️ **Language Selection**
- **Pre-Meeting**: Choose your preferred language before starting a meeting
- **Visual Selector**: Dropdown with country flags and language names
- **Persistent**: Language preference is maintained during the meeting session

### 🗣️ **Real-time Transcription**
- **Live Transcript**: Real-time speech-to-text in the selected language
- **Accuracy**: Optimized for the selected language's grammar and vocabulary
- **Multi-speaker**: Supports multiple speakers in the same language

### 💾 **Meeting Storage**
- **Language Metadata**: Meeting summaries include the language used
- **Historical View**: See which language was used for each meeting
- **Audio + Transcript**: Both audio recording and transcript in the selected language

## Usage Instructions

### Starting a Meeting in Afrikaans

1. **Navigate** to Meeting Summaries page
2. **Select Language** from the dropdown:
   - Click the language selector
   - Choose "🇿🇦 Afrikaans" from the list
3. **Start Recording** - Click "Start Meeting Recording"
4. **Speak Naturally** in Afrikaans - the system will transcribe in real-time
5. **Save Meeting** - Language metadata is automatically saved

### Language Display

- **During Meeting**: Current language is shown in the live meeting card
- **Meeting History**: Language indicator appears in saved summaries
- **Detail View**: Language information is preserved in meeting details

## Technical Implementation

### Web Speech API Support
```javascript
// Language codes supported
const supportedLanguages = {
  'af-ZA': 'Afrikaans (South Africa)',
  'en-US': 'English (United States)',
  'en-GB': 'English (United Kingdom)',
  // ... other languages
};
```

### Database Schema
```sql
-- Meeting summaries table includes language field
ALTER TABLE meeting_summaries 
ADD COLUMN language VARCHAR(10) DEFAULT 'en-US';
```

### React Component
```tsx
// Language selection component
<Select value={selectedLanguage} onValueChange={setSelectedLanguage}>
  <SelectItem value="af-ZA">🇿🇦 Afrikaans</SelectItem>
  // ... other languages
</Select>
```

## Browser Compatibility

| Browser | Afrikaans Support | Notes |
|---------|------------------|-------|
| Chrome | ✅ Full Support | Best performance |
| Edge | ✅ Full Support | Good performance |
| Firefox | ⚠️ Limited | May require enabling flags |
| Safari | ⚠️ Limited | iOS/macOS only |

## Migration Guide

### For Existing Databases
1. Run the migration script: `database/add-language-support.sql`
2. This adds the language column with default 'en-US'
3. Existing meetings will show as English (US)

### For New Installations
- The complete schema (`database/complete-schema.sql`) includes language support
- No additional migration needed

## Troubleshooting

### Common Issues

**Q: Afrikaans not transcribing correctly**
- Ensure you're using Chrome or Edge browser
- Check microphone permissions
- Speak clearly and at normal pace

**Q: Language selector not appearing**
- Refresh the page
- Check browser console for errors
- Ensure you're logged in

**Q: Mixed language detection**
- The system is optimized for single-language meetings
- Switch languages between meetings, not during

### Debug Mode
Enable browser developer tools to see speech recognition events:
```javascript
// In browser console
localStorage.setItem('debug-speech', 'true');
```

## Future Enhancements

### Planned Features
- **Auto-detection**: Automatic language detection from speech
- **Code-switching**: Support for multilingual meetings
- **Dialect Support**: Regional variations (e.g., South African English)
- **Custom Vocabularies**: Industry-specific terms and names

### Language Expansion
- Zulu (zu-ZA)
- Xhosa (xh-ZA)
- Sotho (st-ZA)
- Additional European languages

## Support

For issues with Afrikaans or other language support:
1. Check the browser compatibility table
2. Verify microphone permissions
3. Try the English fallback
4. Report issues with specific examples

---

**Note**: Speech recognition accuracy depends on:
- Microphone quality
- Background noise levels
- Speaker clarity and accent
- Internet connection stability

The Afrikaans support is optimized for South African pronunciation and vocabulary.
