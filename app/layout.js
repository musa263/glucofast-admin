import './globals.css';

export const metadata = {
  title: 'GlucoFast — Smart Glucose & Fasting Tracker',
  description: 'The smart tracker that turns manual glucose readings into personalized insights — without a $150/month CGM subscription.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
