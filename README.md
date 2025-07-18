# Chalan Inventory Management System

A secure, modern inventory management system built with React, TypeScript, and Supabase for automotive parts businesses.

## 🔐 Security Features

- **Passcode Protection**: Secure access with iPhone-style lock screen (passcode: 13092000)
- **Developer Tools Detection**: Basic protection against inspection
- **Obfuscated Passcode**: Hard to find in source code
- **Session Management**: Requires passcode on every page refresh

## 🚀 Features

- **Product Management**: Add, edit, and delete products with detailed pricing
- **Sales Tracking**: Record sales with cash and credit amounts
- **Credit Management**: Track outstanding credits and payments
- **Inventory Analysis**: View profit margins and inventory value
- **CSV Import/Export**: Bulk import products and export inventory data
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Data**: Supabase backend with automatic synchronization

## 📱 Lock Screen

The app features a beautiful lock screen with:
- Your custom wallpaper background
- iPhone-style number pad
- 8-digit passcode entry
- Blur overlay for security
- Error handling with shake animation
- Security warnings for developer tools

## 🛠️ Technical Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Backend**: Supabase (PostgreSQL + Real-time)
- **Styling**: Inline styles with Tailwind-inspired design
- **Security**: Obfuscated passcode validation
- **Data**: LocalStorage fallback with database sync

## 🚀 Getting Started

1. **Clone the repository**
2. **Install dependencies**: `npm install`
3. **Set up Supabase**: Follow `SUPABASE_SETUP.md`
4. **Add environment variables**: Create `.env.local` with your Supabase credentials
5. **Run development server**: `npm run dev`
6. **Enter passcode**: Use `13092000` to unlock the app

## 📊 CSV Import Format

Import products using CSV with this column order:
```
name,type,category,brand,country,purchasePrice,sellingPrice,quantity
```

Example:
```
Clutch Plate,TATA,Clutch & Pressure,Luk,India,2500.00,3000.00,10
```

## 🔧 Development

- **Build**: `npm run build`
- **Preview**: `npm run preview`
- **Lint**: `npm run lint`

## 📱 Mobile Support

The app is fully responsive and works great on:
- iOS Safari
- Android Chrome
- Desktop browsers
- PWA installation support

## 🔒 Security Notes

- Passcode is obfuscated in source code
- Developer tools detection provides basic protection
- All data is validated before saving
- Precise mathematical calculations prevent rounding errors

## 📄 License

Private business application - not for public distribution.
