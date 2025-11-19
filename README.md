# Boss Coffee NYC - Contact Form Backend

TypeScript Express server for handling contact form submissions via Telegram Bot API.

## Setup Instructions

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Telegram Bot

1. Create a Telegram bot by messaging [@BotFather](https://t.me/botfather) on Telegram
2. Get your Bot Token from BotFather
3. Get your Chat ID by messaging [@userinfobot](https://t.me/userinfobot) or your bot
4. Update `server.ts` with your credentials:

```typescript
const TELEGRAM_BOT_TOKEN: string = 'YOUR_ACTUAL_BOT_TOKEN';
const TELEGRAM_CHAT_ID: string = 'YOUR_ACTUAL_CHAT_ID';
```

### 3. Build TypeScript

```bash
npm run build
```

### 4. Start the Server

**Development mode (with auto-reload):**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

The server will run on `http://localhost:3000` by default.

## API Endpoints

### POST `/api/contact`

Submit contact form data.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "message": "Hello, I'm interested in your coffee!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thank you! Your message has been sent successfully."
}
```

### GET `/api/health`

Health check endpoint.

## Features

- ✅ Input validation and sanitization
- ✅ TypeScript type safety
- ✅ Telegram Bot API integration
- ✅ CORS enabled
- ✅ Error handling
- ✅ Formatted Telegram messages

## Environment Variables

You can set the port using an environment variable:

```bash
PORT=3000 npm start
```

