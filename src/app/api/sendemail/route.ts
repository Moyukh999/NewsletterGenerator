import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import fs from 'fs/promises'; // To read files from the file system
import path from 'path'; // To handle file paths

// Email configuration (use your email provider details)
const transporter = nodemailer.createTransport({
  service: 'Gmail', // Or use another email service provider
  auth: {
    user: process.env.EMAIL_USER, // Make sure these env vars are set
    pass: process.env.EMAIL_PASS,
  },
});

// Function to load and prepare the template
async function loadTemplate(templateName: string, replacements: { [key: string]: string }) {
    const templatePath = path.join(process.cwd(), 'Template', templateName);
    try {
        let template = await fs.readFile(templatePath, 'utf8');
        
        // Replace placeholders in the template
        for (const [key, value] of Object.entries(replacements)) {
            const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g'); // Regex to replace with potential spaces
            template = template.replace(regex, value);
        } 
        
        return template; // This will return the template with replaced values
    } catch (error) {
        console.error('Error loading template:', error);
        throw new Error('Template loading error');
    }
}


// Exported POST function for Route Handler
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { template, subject, content, recipients } = body;

    // Check for valid recipients array
    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ message: 'No recipients defined' }, { status: 400 });
    }

    // Log the content being sent
    console.log('Content being sent:', content);

    // Send emails to all recipients
    const sendEmails = recipients.map(async (recipient: { Name: string; Email: string }) => {
      if (!recipient.Email) {
        console.error('Recipient email is missing:', recipient);
        throw new Error('Recipient email is missing');
      }

      // Load the template and replace placeholders
      const emailContent = await loadTemplate(template, {
        content: content, // The main content to be inserted into the email
        Name: recipient.Name, // Changed to match the placeholder in the template
      });

      console.log(`Sending email to: ${recipient.Name} <${recipient.Email}>`);

      return transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: recipient.Email,
        subject: subject,
        html: emailContent, // Use the processed template
      });
    });

    // Wait for all emails to be sent
    await Promise.all(sendEmails);

    return NextResponse.json({ message: 'Emails sent successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error sending emails:', error);
    return NextResponse.json({ message: 'Error sending emails', error: error}, { status: 500 });
  }
}
