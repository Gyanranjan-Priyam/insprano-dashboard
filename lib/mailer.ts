import nodemailer from "nodemailer";
import { env } from "./env";
import { type JSONContent } from "@tiptap/react";

// Create a transporter using Gmail SMTP
export const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: env.GMAIL_USER,
    pass: env.GMAIL_APP_PASSWORD,
  },
});

// Convert TipTap JSON content to HTML for emails
const convertTipTapJSONToHTML = (content: JSONContent): string => {
  if (!content) return '';
  
  let html = '';
  
  switch (content.type) {
    case 'doc':
      html = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      break;
    
    case 'paragraph':
      const paragraphContent = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      const textAlign = content.attrs?.textAlign;
      const style = textAlign ? ` style="text-align: ${textAlign}; margin: 12px 0;"` : ' style="margin: 12px 0;"';
      html = paragraphContent ? `<p${style}>${paragraphContent}</p>` : `<p${style}></p>`;
      break;
    
    case 'heading':
      const headingContent = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      const level = content.attrs?.level || 1;
      const headingTextAlign = content.attrs?.textAlign;
      const headingStyle = headingTextAlign 
        ? ` style="text-align: ${headingTextAlign}; margin: 20px 0 12px 0; color: #1f2937;"` 
        : ' style="margin: 20px 0 12px 0; color: #1f2937;"';
      html = `<h${level}${headingStyle}>${headingContent}</h${level}>`;
      break;
    
    case 'bulletList':
      const bulletItems = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      html = `<ul style="margin: 16px 0; padding-left: 24px;">${bulletItems}</ul>`;
      break;
    
    case 'orderedList':
      const orderedItems = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      html = `<ol style="margin: 16px 0; padding-left: 24px;">${orderedItems}</ol>`;
      break;
    
    case 'listItem':
      const listItemContent = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      html = `<li style="margin: 4px 0;">${listItemContent}</li>`;
      break;
    
    case 'text':
      let textContent = content.text || '';
      
      // Apply marks (formatting)
      if (content.marks) {
        content.marks.forEach(mark => {
          switch (mark.type) {
            case 'bold':
              textContent = `<strong>${textContent}</strong>`;
              break;
            case 'italic':
              textContent = `<em>${textContent}</em>`;
              break;
            case 'code':
              textContent = `<code style="background-color: #f3f4f6; padding: 2px 4px; border-radius: 4px; font-family: monospace;">${textContent}</code>`;
              break;
            case 'strike':
              textContent = `<s>${textContent}</s>`;
              break;
            case 'underline':
              textContent = `<u>${textContent}</u>`;
              break;
          }
        });
      }
      
      html = textContent;
      break;
    
    case 'hardBreak':
      html = '<br>';
      break;
    
    case 'codeBlock':
      const codeContent = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      html = `<pre style="background-color: #f3f4f6; padding: 12px; border-radius: 6px; overflow-x: auto; font-family: monospace; margin: 16px 0;"><code>${codeContent}</code></pre>`;
      break;
    
    case 'blockquote':
      const quoteContent = content.content?.map(node => convertTipTapJSONToHTML(node)).join('') || '';
      html = `<blockquote style="border-left: 4px solid #e5e7eb; padding-left: 16px; margin: 16px 0; font-style: italic; color: #6b7280;">${quoteContent}</blockquote>`;
      break;
    
    default:
      // For unknown types, try to render content if it exists
      if (content.content) {
        html = content.content.map(node => convertTipTapJSONToHTML(node)).join('');
      } else if (content.text) {
        html = content.text;
      }
      break;
  }
  
  return html;
};

// Generate verification email HTML template
const generateVerificationEmailHTML = (verificationCode: string) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Email Verification Code</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #333333;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 50px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #232325 0%, #8660c7 100%); padding: 48px 40px 36px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">Email Verification</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">Secure your account in seconds</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px 40px;">
              <p style="margin: 0 0 24px; font-size: 16px;">Hello,</p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #444444;">
                We received a request to verify your email address. Use the code below to complete your verification.
              </p>

              <!-- Verification Code -->
              <div style="text-align: center; margin-bottom: 40px;">
                <div style="display: inline-block; padding: 26px 40px; border-radius: 10px; background: linear-gradient(135deg, #292847 0%, #7c3aed 100%);">
                  <span style="font-size: 38px; font-weight: 700; color: #ffffff; letter-spacing: 8px; font-family: 'Roboto Mono', monospace;">${verificationCode}</span>
                </div>
              </div>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #444444;">
                This code will expire in 10 minutes. If you did not request it, you can safely ignore this email.
              </p>

              <!-- Security Info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px; background-color: #f8fafc; border-left: 4px solid #4f46e5; border-radius: 6px;">
                <tr>
                  <td style="padding: 20px 24px;">
                    <p style="margin: 0; font-size: 14px; color: #666666; line-height: 1.6;">
                      <strong style="color: #222222;">Security Reminder:</strong> Never share your verification code with anyone. Our team will never ask for it.
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">Need help? Contact us at 
                <a href="mailto:${env.GMAIL_USER}" style="color: #4f46e5; text-decoration: none;">${env.GMAIL_USER}</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">© 2025 ${env.GMAIL_FROM_NAME || 'Team Insprano, GCEK Bhawanipatna'}. All rights reserved.</p>
            </td>
          </tr>
        </table>

        <!-- Disclaimer -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This email was sent automatically to verify your account. If you did not initiate this request, please disregard.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Send verification email function with beautiful template
export const sendVerificationEmail = async ({
  to,
  otp,
}: {
  to: string;
  otp: string;
}) => {
  try {
    const html = generateVerificationEmailHTML(otp);
    
    const info = await mailer.sendMail({
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: 'Verify your email address',
      html,
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

// Generate confirmation email HTML template
const generateConfirmationEmailHTML = ({
  participantName,
  eventTitle,
  eventDate,
  eventVenue,
  participantEmail,
  registrationDetails,
}: {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  participantEmail: string;
  registrationDetails: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber?: string;
    collegeName: string;
    state: string;
    district: string;
  };
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Registration Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #333333;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 50px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 48px 40px 36px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">✅ Registration Confirmed!</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">You're all set for the event</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px 40px;">
              <p style="margin: 0 0 24px; font-size: 16px;">Hello <strong>${participantName}</strong>,</p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #444444;">
                Congratulations! Your registration for <strong>${eventTitle}</strong> has been confirmed. Your payment has been verified and you're officially registered for the event.
              </p>

              <!-- Attachment Notice -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #22c55e; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #166534; font-weight: 600;">📎 Registration Details Attached</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #166534;">A detailed PDF with your complete registration information is attached to this email for your records.</p>
              </div>

              <!-- Event Details -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #0ea5e9;">
                <h3 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #0c4a6e;">📅 Event Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Event:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Date:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Venue:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventVenue}</td>
                  </tr>
                </table>
              </div>

              <!-- Registration Details -->
              <div style="background: linear-gradient(135deg, #fefce8 0%, #fef3c7 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #92400e;">👤 Your Registration Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 140px;">Name:</td>
                    <td style="padding: 8px 0; color: #111827;">${registrationDetails.fullName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Email:</td>
                    <td style="padding: 8px 0; color: #111827;">${participantEmail}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Mobile:</td>
                    <td style="padding: 8px 0; color: #111827;">${registrationDetails.mobileNumber}</td>
                  </tr>
                  ${registrationDetails.whatsappNumber ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">WhatsApp:</td>
                    <td style="padding: 8px 0; color: #111827;">${registrationDetails.whatsappNumber}</td>
                  </tr>
                  ` : ''}
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">College:</td>
                    <td style="padding: 8px 0; color: #111827;">${registrationDetails.collegeName}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Location:</td>
                    <td style="padding: 8px 0; color: #111827;">${registrationDetails.district}, ${registrationDetails.state}</td>
                  </tr>
                </table>
              </div>

              <!-- Important Instructions -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #ef4444;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #dc2626;">📋 Important Instructions</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Please arrive at the venue at least 30 minutes before the event starts</li>
                  <li style="margin-bottom: 8px;">Bring a valid government-issued photo ID for verification</li>
                  <li style="margin-bottom: 8px;">Keep this confirmation email handy for check-in</li>
                  <li style="margin-bottom: 8px;">For any queries, contact our support team using the details below</li>
                </ul>
              </div>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #444444;">
                We're excited to see you at the event! If you have any questions or need assistance, please don't hesitate to reach out to our team.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="mailto:${env.GMAIL_USER}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #10b981 0%, #059669 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Contact Support</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">Need help? Contact us at 
                <a href="mailto:${env.GMAIL_USER}" style="color: #10b981; text-decoration: none;">${env.GMAIL_USER}</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">© 2025 ${env.GMAIL_FROM_NAME || 'Event Management Platform'}. All rights reserved.</p>
            </td>
          </tr>
        </table>

        <!-- Disclaimer -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This confirmation email was sent automatically. Please keep it for your records.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Send confirmation email function with attachment
export const sendConfirmationEmailWithAttachment = async ({
  to,
  participantName,
  eventTitle,
  eventDate,
  eventVenue,
  registrationDetails,
  attachmentBuffer,
  attachmentFilename
}: {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  registrationDetails: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber?: string;
    collegeName: string;
    state: string;
    district: string;
  };
  attachmentBuffer?: Buffer;
  attachmentFilename?: string;
}) => {
  try {
    const html = generateConfirmationEmailHTML({
      participantName,
      eventTitle,
      eventDate,
      eventVenue,
      participantEmail: to,
      registrationDetails,
    });
    
    const mailOptions: any = {
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: `🎉 Registration Confirmed - ${eventTitle}`,
      html,
    };

    // Add attachment if provided
    if (attachmentBuffer && attachmentFilename) {
      mailOptions.attachments = [
        {
          filename: attachmentFilename,
          content: attachmentBuffer,
          contentType: 'application/pdf'
        }
      ];
    }
    
    const info = await mailer.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send confirmation email with attachment:', error);
    throw error;
  }
};

// Send confirmation email function
export const sendConfirmationEmail = async ({
  to,
  participantName,
  eventTitle,
  eventDate,
  eventVenue,
  registrationDetails,
}: {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  registrationDetails: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber?: string;
    collegeName: string;
    state: string;
    district: string;
  };
}) => {
  try {
    const html = generateConfirmationEmailHTML({
      participantName,
      eventTitle,
      eventDate,
      eventVenue,
      participantEmail: to,
      registrationDetails,
    });
    
    const info = await mailer.sendMail({
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: `🎉 Registration Confirmed - ${eventTitle}`,
      html,
    });
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send confirmation email:', error);
    throw error;
  }
};

// Generate announcement notification email HTML template
const generateAnnouncementEmailHTML = ({
  title,
  description,
  category,
  priority,
  publishDate,
  expiryDate,
  relatedEvent,
  hasAttachments,
  hasImages,
  isUpdate = false,
}: {
  title: string;
  description: string | JSONContent;
  category: string;
  priority: string;
  publishDate: string;
  expiryDate?: string;
  relatedEvent?: { title: string; date: string; };
  hasAttachments: boolean;
  hasImages: boolean;
  isUpdate?: boolean;
}) => {
  const priorityColors = {
    URGENT: { bg: '#fee2e2', border: '#ef4444', text: '#dc2626' },
    IMPORTANT: { bg: '#fef3c7', border: '#f59e0b', text: '#d97706' },
    NORMAL: { bg: '#e0f2fe', border: '#0ea5e9', text: '#0284c7' },
  };

  const categoryColors = {
    EMERGENCY: { bg: '#fef2f2', border: '#ef4444', text: '#dc2626' },
    GENERAL: { bg: '#f0f9ff', border: '#3b82f6', text: '#1d4ed8' },
    EVENT_UPDATE: { bg: '#f0fdf4', border: '#22c55e', text: '#16a34a' },
    WORKSHOP: { bg: '#fef3c7', border: '#eab308', text: '#ca8a04' },
    LOGISTICS: { bg: '#f3e8ff', border: '#a855f7', text: '#9333ea' },
  };

  const priorityStyle = priorityColors[priority as keyof typeof priorityColors] || priorityColors.NORMAL;
  const categoryStyle = categoryColors[category as keyof typeof categoryColors] || categoryColors.GENERAL;

  // Convert description to HTML if it's JSON content, otherwise use as string
  const descriptionHTML = typeof description === 'string' 
    ? description 
    : convertTipTapJSONToHTML(description);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>New Announcement - ${title}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #333333;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 50px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, ${isUpdate ? '#7c3aed 0%, #a855f7 100%' : '#1e40af 0%, #3b82f6 100%'}); padding: 48px 40px 36px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">${isUpdate ? '🔄 Updated Announcement' : '📢 New Announcement'}</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">${isUpdate ? 'Important changes to previous announcement' : 'Important information for you'}</p>
            </td>
          </tr>

          <!-- Priority & Category Badges -->
          <tr>
            <td style="padding: 30px 40px 20px;">
              <div style="display: flex; gap: 12px; flex-wrap: wrap; justify-content: center;">
                <div style="display: inline-block; padding: 8px 16px; border-radius: 20px; background-color: ${priorityStyle.bg}; border: 2px solid ${priorityStyle.border};">
                  <span style="font-size: 12px; font-weight: 600; color: ${priorityStyle.text}; text-transform: uppercase;">${priority} Priority</span>
                </div>
                <div style="display: inline-block; padding: 8px 16px; border-radius: 20px; background-color: ${categoryStyle.bg}; border: 2px solid ${categoryStyle.border};">
                  <span style="font-size: 12px; font-weight: 600; color: ${categoryStyle.text}; text-transform: uppercase;">${category.replace('_', ' ')}</span>
                </div>
              </div>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 0 40px 40px;">
              ${isUpdate ? `
              <!-- Update Notice -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 20px; margin-bottom: 25px; border-left: 4px solid #f59e0b; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #92400e; font-weight: 600;">🔄 This announcement has been updated</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #92400e;">Please review the updated information below</p>
              </div>
              ` : ''}
              
              <!-- Title -->
              <h2 style="margin: 0 0 20px; font-size: 24px; font-weight: 600; color: #1f2937; line-height: 1.3;">${title}</h2>

              <!-- Description -->
              <div style="margin: 0 0 30px; font-size: 16px; line-height: 1.6; color: #374151; border-radius: 8px; padding: 20px; background-color: #f8fafc;">
                ${descriptionHTML}
              </div>

              <!-- Attachments Notice -->
              ${hasAttachments || hasImages ? `
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #22c55e; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #166534; font-weight: 600;">📎 Files Attached</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #166534;">${hasAttachments ? 'Documents and files' : ''}${hasAttachments && hasImages ? ' and ' : ''}${hasImages ? 'images' : ''} are attached to this announcement.</p>
              </div>
              ` : ''}

              <!-- Event Details -->
              ${relatedEvent ? `
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #f59e0b;">
                <h3 style="margin: 0 0 15px; font-size: 18px; font-weight: 600; color: #92400e;">🎯 Related Event</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 80px;">Event:</td>
                    <td style="padding: 8px 0; color: #111827;">${relatedEvent.title}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Date:</td>
                    <td style="padding: 8px 0; color: #111827;">${relatedEvent.date}</td>
                  </tr>
                </table>
              </div>
              ` : ''}

              <!-- Publication Details -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #64748b;">
                <h3 style="margin: 0 0 15px; font-size: 18px; font-weight: 600; color: #475569;">📅 Announcement Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Published:</td>
                    <td style="padding: 8px 0; color: #111827;">${publishDate}</td>
                  </tr>
                  ${expiryDate ? `
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Expires:</td>
                    <td style="padding: 8px 0; color: #111827;">${expiryDate}</td>
                  </tr>
                  ` : ''}
                </table>
              </div>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #444444;">
                Stay updated with all the latest announcements and information. If you have any questions, please don't hesitate to reach out to our support team.
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">Need help? Contact us at 
                <a href="mailto:${env.GMAIL_USER}" style="color: #1e40af; text-decoration: none;">${env.GMAIL_USER}</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">© 2025 ${env.GMAIL_FROM_NAME || 'Event Management Platform'}. All rights reserved.</p>
            </td>
          </tr>
        </table>

        <!-- Disclaimer -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This announcement was sent automatically. You received this because you're subscribed to our announcements.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Send announcement notification email to multiple recipients
export const sendAnnouncementNotification = async ({
  recipients,
  title,
  description,
  category,
  priority,
  publishDate,
  expiryDate,
  relatedEvent,
  attachments,
  isUpdate = false,
}: {
  recipients: string[];
  title: string;
  description: string | JSONContent;
  category: string;
  priority: string;
  publishDate: string;
  expiryDate?: string;
  relatedEvent?: { title: string; date: string; };
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
  isUpdate?: boolean;
}) => {
  try {
    const html = generateAnnouncementEmailHTML({
      title,
      description,
      category,
      priority,
      publishDate,
      expiryDate,
      relatedEvent,
      hasAttachments: attachments ? attachments.some(att => !att.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) : false,
      hasImages: attachments ? attachments.some(att => att.filename.match(/\.(jpg|jpeg|png|gif|webp)$/i)) : false,
      isUpdate,
    });
    
    const mailOptions: any = {
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      bcc: recipients, // Use BCC to protect recipient privacy
      subject: `${isUpdate ? '🔄 UPDATED' : '📢'} ${priority === 'URGENT' ? '🚨 URGENT: ' : priority === 'IMPORTANT' ? '⚠️ IMPORTANT: ' : ''}${title}`,
      html,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    const info = await mailer.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId, recipientCount: recipients.length };
  } catch (error) {
    console.error('Failed to send announcement notification:', error);
    throw error;
  }
};

// Generic send email function with optional attachments
export const sendEmail = async ({
  to,
  subject,
  html,
  attachments,
}: {
  to: string;
  subject: string;
  html: string;
  attachments?: Array<{
    filename: string;
    content: Buffer;
    contentType?: string;
  }>;
}) => {
  try {
    const mailOptions: any = {
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject,
      html,
    };

    // Add attachments if provided
    if (attachments && attachments.length > 0) {
      mailOptions.attachments = attachments;
    }
    
    const info = await mailer.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send email:', error);
    throw error;
  }
};

// Generate payment confirmation email HTML template
const generatePaymentConfirmationEmailHTML = ({
  participantName,
  eventTitle,
  eventDate,
  eventVenue,
  participantEmail,
  invoiceNumber,
  paymentAmount,
  registrationDetails,
}: {
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  participantEmail: string;
  invoiceNumber: string;
  paymentAmount: number;
  registrationDetails: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber?: string;
    collegeName: string;
    state: string;
    district: string;
  };
}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Payment Confirmed</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f4f6f8; font-family: 'Inter', 'Helvetica Neue', Arial, sans-serif; color: #333333;">
  <table width="100%" cellpadding="0" cellspacing="0" role="presentation" style="padding: 50px 20px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" role="presentation" style="background-color: #ffffff; border-radius: 14px; box-shadow: 0 4px 20px rgba(0,0,0,0.06); overflow: hidden;">
          
          <!-- Header -->
          <tr>
            <td style="background: linear-gradient(135deg, #059669 0%, #047857 100%); padding: 48px 40px 36px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff; letter-spacing: -0.4px;">💰 Payment Confirmed!</h1>
              <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 15px;">Your registration is now complete</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding: 50px 40px 40px;">
              <p style="margin: 0 0 24px; font-size: 16px;">Dear <strong>${participantName}</strong>,</p>
              <p style="margin: 0 0 32px; font-size: 16px; line-height: 1.6; color: #444444;">
                Great news! Your payment for <strong>${eventTitle}</strong> has been verified and confirmed by our team. 
                Your registration is now complete and you're officially enrolled for the event.
              </p>

              <!-- Payment Status -->
              <div style="background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #10b981; text-align: center;">
                <div style="font-size: 18px; font-weight: 600; color: #047857; margin-bottom: 8px;">✅ Payment Status: VERIFIED</div>
                <div style="font-size: 14px; color: #047857;">Amount Paid: ₹${paymentAmount}</div>
                <div style="font-size: 12px; color: #059669; margin-top: 5px;">Invoice #${invoiceNumber}</div>
              </div>

              <!-- Invoice Notice -->
              <div style="background: linear-gradient(135deg, #fef3c7 0%, #fed7aa 100%); border-radius: 12px; padding: 20px; margin-bottom: 30px; border-left: 4px solid #f59e0b; text-align: center;">
                <p style="margin: 0; font-size: 16px; color: #92400e; font-weight: 600;">📄 Payment Invoice Attached</p>
                <p style="margin: 8px 0 0; font-size: 14px; color: #92400e;">Your official payment invoice is attached to this email for tax and record purposes.</p>
              </div>

              <!-- Event Details -->
              <div style="background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #0ea5e9;">
                <h3 style="margin: 0 0 20px; font-size: 20px; font-weight: 600; color: #0c4a6e;">📅 Your Event Details</h3>
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151; width: 120px;">Event:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventTitle}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Date:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventDate}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Venue:</td>
                    <td style="padding: 8px 0; color: #111827;">${eventVenue}</td>
                  </tr>
                  <tr>
                    <td style="padding: 8px 0; font-weight: 600; color: #374151;">Amount Paid:</td>
                    <td style="padding: 8px 0; color: #111827; font-weight: 600;">₹${paymentAmount}</td>
                  </tr>
                </table>
              </div>

              <!-- Next Steps -->
              <div style="background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%); border-radius: 12px; padding: 30px; margin-bottom: 30px; border-left: 4px solid #64748b;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #475569;">🎯 What's Next?</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">Save the attached invoice for your records</li>
                  <li style="margin-bottom: 8px;">Mark your calendar for ${eventDate}</li>
                  <li style="margin-bottom: 8px;">Bring a valid government-issued photo ID</li>
                  <li style="margin-bottom: 8px;">Arrive at the venue 30 minutes before the event starts</li>
                  <li style="margin-bottom: 8px;">Check your email for any event updates</li>
                </ul>
              </div>

              <!-- Important Notice -->
              <div style="background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); border-radius: 12px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #ef4444;">
                <h3 style="margin: 0 0 16px; font-size: 18px; font-weight: 600; color: #dc2626;">⚠️ Important Reminders</h3>
                <ul style="margin: 0; padding-left: 20px; color: #374151; line-height: 1.6;">
                  <li style="margin-bottom: 8px;">This invoice serves as your proof of payment</li>
                  <li style="margin-bottom: 8px;">Registration is non-transferable and non-refundable</li>
                  <li style="margin-bottom: 8px;">Keep this email and invoice accessible on your phone</li>
                  <li style="margin-bottom: 8px;">Contact support if you have any questions</li>
                </ul>
              </div>

              <p style="margin: 0 0 24px; font-size: 16px; line-height: 1.6; color: #444444;">
                We're thrilled to have you join us for this amazing event! If you have any questions or need assistance, 
                please don't hesitate to reach out to our support team.
              </p>

              <!-- CTA Button -->
              <div style="text-align: center; margin: 40px 0;">
                <a href="mailto:${env.GMAIL_USER}" style="display: inline-block; padding: 16px 32px; background: linear-gradient(135deg, #059669 0%, #047857 100%); color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 16px;">Contact Support</a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #f9fafb; padding: 30px 40px; border-top: 1px solid #e5e7eb; text-align: center;">
              <p style="margin: 0 0 10px; font-size: 14px; color: #666666;">Need help? Contact us at 
                <a href="mailto:${env.GMAIL_USER}" style="color: #059669; text-decoration: none;">${env.GMAIL_USER}</a>
              </p>
              <p style="margin: 0; font-size: 12px; color: #999999;">© 2025 ${env.GMAIL_FROM_NAME || 'INSPRANO 2025, GCEK'}. All rights reserved.</p>
            </td>
          </tr>
        </table>

        <!-- Disclaimer -->
        <table width="600" cellpadding="0" cellspacing="0" role="presentation">
          <tr>
            <td style="padding: 20px; text-align: center;">
              <p style="margin: 0; font-size: 12px; color: #999999;">
                This payment confirmation was sent automatically. Please keep this invoice for tax and accounting purposes.
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
};

// Send payment confirmation email with invoice attachment
export const sendPaymentConfirmationEmail = async ({
  to,
  participantName,
  eventTitle,
  eventDate,
  eventVenue,
  invoiceNumber,
  paymentAmount,
  registrationDetails,
  invoiceBuffer,
  invoiceFilename
}: {
  to: string;
  participantName: string;
  eventTitle: string;
  eventDate: string;
  eventVenue: string;
  invoiceNumber: string;
  paymentAmount: number;
  registrationDetails: {
    fullName: string;
    mobileNumber: string;
    whatsappNumber?: string;
    collegeName: string;
    state: string;
    district: string;
  };
  invoiceBuffer: Buffer;
  invoiceFilename: string;
}) => {
  try {
    const html = generatePaymentConfirmationEmailHTML({
      participantName,
      eventTitle,
      eventDate,
      eventVenue,
      participantEmail: to,
      invoiceNumber,
      paymentAmount,
      registrationDetails,
    });
    
    const mailOptions = {
      from: env.GMAIL_FROM_NAME ? `${env.GMAIL_FROM_NAME} <${env.GMAIL_USER}>` : env.GMAIL_USER,
      to,
      subject: `💰 Payment Confirmed - ${eventTitle} | Invoice #${invoiceNumber}`,
      html,
      attachments: [
        {
          filename: invoiceFilename,
          content: invoiceBuffer,
          contentType: 'application/pdf'
        }
      ]
    };
    
    const info = await mailer.sendMail(mailOptions);
    
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Failed to send payment confirmation email:', error);
    throw error;
  }
};