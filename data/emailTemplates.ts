
export interface EmailTemplate {
  id: string;
  name: string;
  category: 'newsletter' | 'promotion' | 'announcement' | 'welcome' | 'event';
  description: string;
  thumbnail: string; // CSS background or image URL
  subject: string;
  body: string; // HTML content
}

export const EMAIL_TEMPLATES: EmailTemplate[] = [
  {
    id: 'welcome-1',
    name: 'Modern Welcome',
    category: 'welcome',
    description: 'A clean, modern welcome email for new subscribers.',
    thumbnail: 'bg-gradient-to-br from-indigo-500 to-purple-600',
    subject: 'Welcome to {{business_name}}! We’re glad you’re here.',
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="color: #4f46e5; text-align: center;">Welcome to {{business_name}}!</h1>
        <p>Hi there,</p>
        <p>Thanks for joining us! We're excited to have you on board.</p>
        <p>At {{business_name}}, we strive to provide the best service possible. Here is what you can expect from us:</p>
        <ul>
          <li>Exclusive updates</li>
          <li>Helpful tips and tricks</li>
          <li>Special offers just for you</li>
        </ul>
        <div style="text-align: center; margin-top: 30px;">
          <a href="{{website_url}}" style="background-color: #4f46e5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Visit Our Website</a>
        </div>
        <p style="margin-top: 40px; font-size: 12px; color: #888; text-align: center;">
          © {{year}} {{business_name}}. All rights reserved.
        </p>
      </div>
    `
  },
  {
    id: 'promo-flash-sale',
    name: 'Flash Sale Alert',
    category: 'promotion',
    description: 'Urgent, high-impact design for limited-time offers.',
    thumbnail: 'bg-gradient-to-br from-red-500 to-orange-500',
    subject: '⚡ Flash Sale! 24 Hours Only',
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; background-color: #fff0f0; padding: 0;">
        <div style="background-color: #ef4444; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0; font-size: 32px; text-transform: uppercase; letter-spacing: 2px;">Flash Sale</h1>
        </div>
        <div style="padding: 30px; text-align: center;">
          <h2 style="color: #b91c1c;">Don't Miss Out!</h2>
          <p style="font-size: 18px; line-height: 1.6;">For the next 24 hours, get <strong>50% OFF</strong> everything in store.</p>
          <div style="margin: 30px 0;">
            <a href="{{website_url}}" style="background-color: #ef4444; color: white; padding: 15px 30px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 20px;">Shop Now</a>
          </div>
          <p style="font-size: 14px; color: #666;">Offer ends tomorrow at midnight.</p>
        </div>
      </div>
    `
  },
  {
    id: 'newsletter-digest',
    name: 'Weekly Digest',
    category: 'newsletter',
    description: 'Content-focused layout for sharing news and articles.',
    thumbnail: 'bg-gradient-to-br from-emerald-400 to-teal-600',
    subject: 'Your Weekly Update from {{business_name}}',
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9fafb;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h2 style="color: #0f766e; text-transform: uppercase; letter-spacing: 1px;">Weekly Digest</h2>
          <p style="color: #666;">Curated news just for you</p>
        </div>
        
        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <h3 style="color: #333; margin-top: 0;">Top Story of the Week</h3>
          <p style="color: #555; line-height: 1.6;">Here is a summary of the most important thing that happened this week. It's exciting and relevant to your interests.</p>
          <a href="#" style="color: #0f766e; text-decoration: none; font-weight: bold;">Read more →</a>
        </div>

        <div style="background: white; padding: 20px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.05);">
          <h3 style="color: #333; margin-top: 0;">Community Spotlight</h3>
          <p style="color: #555; line-height: 1.6;">We are highlighting one of our amazing community members this week.</p>
          <a href="#" style="color: #0f766e; text-decoration: none; font-weight: bold;">Read more →</a>
        </div>

        <div style="text-align: center; margin-top: 40px; color: #999; font-size: 12px;">
          <p>You received this email because you are subscribed to our newsletter.</p>
          <a href="#" style="color: #999;">Unsubscribe</a>
        </div>
      </div>
    `
  },
  {
    id: 'event-invite',
    name: 'Event Invitation',
    category: 'event',
    description: 'Elegant invitation for webinars, parties, or conferences.',
    thumbnail: 'bg-gradient-to-br from-slate-700 to-slate-900',
    subject: 'You are invited: Exclusive Event at {{business_name}}',
    body: `
      <div style="font-family: serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background-color: #f8f8f8; text-align: center; border: 1px solid #e5e5e5;">
        <p style="text-transform: uppercase; letter-spacing: 2px; color: #666; font-size: 12px;">You are cordially invited to</p>
        <h1 style="font-size: 36px; margin: 20px 0; color: #1a1a1a;">The Annual Gala</h1>
        <p style="font-size: 18px; color: #444; margin-bottom: 30px;">Join us for an evening of celebration and networking.</p>
        
        <div style="margin: 30px 0; padding: 20px; border-top: 1px solid #ddd; border-bottom: 1px solid #ddd;">
          <p style="margin: 5px 0;"><strong>Date:</strong> October 25th, 2024</p>
          <p style="margin: 5px 0;"><strong>Time:</strong> 7:00 PM EST</p>
          <p style="margin: 5px 0;"><strong>Location:</strong> Grand Ballroom</p>
        </div>

        <a href="{{website_url}}" style="display: inline-block; background-color: #1a1a1a; color: white; padding: 14px 28px; text-decoration: none; text-transform: uppercase; letter-spacing: 1px; font-size: 12px; margin-top: 20px;">RSVP Now</a>
      </div>
    `
  },
  {
    id: 'announcement-product',
    name: 'Product Launch',
    category: 'announcement',
    description: 'Showcase a new product with large imagery and clear CTAs.',
    thumbnail: 'bg-gradient-to-br from-blue-400 to-indigo-500',
    subject: 'Introducing our newest arrival',
    body: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 0;">
        <div style="background-color: #f3f4f6; height: 200px; display: flex; align-items: center; justify-content: center; color: #9ca3af; font-size: 24px;">
          [Product Image Placeholder]
        </div>
        <div style="padding: 30px;">
          <h1 style="color: #111827; margin-top: 0;">Meet the Future</h1>
          <p style="color: #4b5563; line-height: 1.6; font-size: 16px;">We've been working hard on this for months, and we're finally ready to share it with you. Introducing our latest innovation designed to make your life easier.</p>
          
          <ul style="color: #4b5563; line-height: 1.6; margin-bottom: 30px;">
            <li>Feature 1: Revolutionary speed</li>
            <li>Feature 2: Seamless integration</li>
            <li>Feature 3: Beautiful design</li>
          </ul>

          <a href="{{website_url}}" style="display: block; text-align: center; background-color: #2563eb; color: white; padding: 16px; text-decoration: none; border-radius: 6px; font-weight: bold;">Learn More</a>
        </div>
      </div>
    `
  }
];
