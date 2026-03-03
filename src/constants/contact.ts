// Contact Form Types
export interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactFormState {
  isSubmitting: boolean;
  isSuccess: boolean;
  error: string | null;
}

// Contact Form Configuration
export const CONTACT_FORM_CONFIG = {
  fields: {
    name: {
      label: 'Name',
      placeholder: 'Your name',
      type: 'text',
      required: true,
    },
    email: {
      label: 'Email',
      placeholder: 'your@email.com',
      type: 'email',
      required: true,
    },
    subject: {
      label: 'Subject',
      placeholder: 'Subject',
      type: 'text',
      required: true,
    },
    message: {
      label: 'Message',
      placeholder: 'Tell me about your project...',
      type: 'textarea',
      required: true,
    },
  }
} as const;

// Contact Information
export const CONTACT_INFO = {
  title: 'Contact',
  subtitle: 'Get in touch',
  description: 'Have a project or want to collaborate?',
  availability: {
    responseTime: 'I usually respond within 24 hours',
  },
  callToAction: {
    primary: 'Send a message',
    secondary: 'Check my social media',
  },
} as const;

// Messages
export const CONTACT_MESSAGES = {
  success: {
    message: 'Thank you for your message! I\'ll get back to you soon.',
  },
  error: {
    disabled: 'Contact form is temporarily disabled. Please use social media or email to reach me.',
  },
} as const;

// Simple validation function
export const validateFormField = (fieldName: string, value: string): string | null => {
  const fieldConfig = CONTACT_FORM_CONFIG.fields[fieldName as keyof typeof CONTACT_FORM_CONFIG.fields];
  if (!fieldConfig) {
    return 'Invalid field';
  }

  if (!value.trim()) {
    return `${fieldConfig.label} is required`;
  }
  return null;
};
