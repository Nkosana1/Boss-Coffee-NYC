import express, { Request, Response } from 'express';
import cors from 'cors';
import axios from 'axios';

// ============================================
// TypeScript Interfaces
// ============================================

interface ContactFormData {
    name: string;
    email: string;
    phone?: string;
    message: string;
}

interface ApiResponse {
    success: boolean;
    message: string;
}

// ============================================
// Configuration Constants
// ============================================

// TODO: Replace with your actual Telegram Bot Token
const TELEGRAM_BOT_TOKEN: string = 'YOUR_TELEGRAM_BOT_TOKEN_HERE';

// TODO: Replace with your actual Telegram Chat ID
const TELEGRAM_CHAT_ID: string = 'YOUR_TELEGRAM_CHAT_ID_HERE';

const TELEGRAM_API_URL: string = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;

const PORT: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;

// ============================================
// Express App Setup
// ============================================

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ============================================
// Input Sanitization
// ============================================

function sanitizeInput(input: string): string {
    return input
        .trim()
        .replace(/[<>]/g, '') // Remove potential HTML tags
        .replace(/[&<>"']/g, (match) => {
            const escapeMap: { [key: string]: string } = {
                '&': '&amp;',
                '<': '&lt;',
                '>': '&gt;',
                '"': '&quot;',
                "'": '&#x27;',
            };
            return escapeMap[match] || match;
        });
}

function validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validatePhone(phone: string): boolean {
    if (!phone) return true; // Phone is optional
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

// ============================================
// Form Validation
// ============================================

function validateFormData(data: ContactFormData): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate name
    if (!data.name || data.name.trim().length < 2) {
        errors.push('Name must be at least 2 characters long');
    }

    // Validate email
    if (!data.email || !validateEmail(data.email)) {
        errors.push('Please provide a valid email address');
    }

    // Validate phone (optional but must be valid if provided)
    if (data.phone && !validatePhone(data.phone)) {
        errors.push('Please provide a valid phone number');
    }

    // Validate message
    if (!data.message || data.message.trim().length < 10) {
        errors.push('Message must be at least 10 characters long');
    }

    return {
        valid: errors.length === 0,
        errors,
    };
}

// ============================================
// Telegram Message Formatting
// ============================================

function formatTelegramMessage(data: ContactFormData): string {
    const phoneDisplay = data.phone ? `📞 Phone: ${data.phone}\n` : '';
    
    return `🔔 *New Contact Form Submission*\n\n` +
           `👤 *Name:* ${data.name}\n` +
           `📧 *Email:* ${data.email}\n` +
           phoneDisplay +
           `\n💬 *Message:*\n${data.message}`;
}

// ============================================
// API Routes
// ============================================

app.post('/api/contact', async (req: Request, res: Response<ApiResponse>) => {
    try {
        // Extract and sanitize form data
        const formData: ContactFormData = {
            name: sanitizeInput(req.body.name || ''),
            email: sanitizeInput(req.body.email || ''),
            phone: req.body.phone ? sanitizeInput(req.body.phone) : undefined,
            message: sanitizeInput(req.body.message || ''),
        };

        // Validate form data
        const validation = validateFormData(formData);
        if (!validation.valid) {
            return res.status(400).json({
                success: false,
                message: validation.errors.join(', '),
            });
        }

        // Format message for Telegram
        const telegramMessage = formatTelegramMessage(formData);

        // Send to Telegram
        try {
            await axios.post(TELEGRAM_API_URL, {
                chat_id: TELEGRAM_CHAT_ID,
                text: telegramMessage,
                parse_mode: 'Markdown',
            });

            return res.status(200).json({
                success: true,
                message: 'Thank you! Your message has been sent successfully.',
            });
        } catch (telegramError: any) {
            console.error('Telegram API Error:', telegramError.response?.data || telegramError.message);
            return res.status(500).json({
                success: false,
                message: 'Failed to send message. Please try again later.',
            });
        }
    } catch (error: any) {
        console.error('Server Error:', error);
        return res.status(500).json({
            success: false,
            message: 'An unexpected error occurred. Please try again later.',
        });
    }
});

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// ============================================
// Server Start
// ============================================

app.listen(PORT, () => {
    console.log(`🚀 Boss Coffee NYC Server running on port ${PORT}`);
    console.log(`📡 Contact form endpoint: http://localhost:${PORT}/api/contact`);
    
    if (TELEGRAM_BOT_TOKEN === 'YOUR_TELEGRAM_BOT_TOKEN_HERE') {
        console.warn('⚠️  WARNING: Please configure your Telegram Bot Token and Chat ID in server.ts');
    }
});

export default app;

