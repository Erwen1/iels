import { Resend } from 'resend';

interface LoanRequestEmailParams {
  equipmentName: string;
  borrowingDate: string;
  returnDate: string;
  projectDescription: string;
  studentEmail: string;
}

const resend = new Resend('re_WzFs1gkM_2LNuo15ebVFKbjvAG4WNVYj1');

export const sendLoanRequestNotification = async (
  toEmail: string,
  params: LoanRequestEmailParams
): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: 'New Loan Request',
      html: `
        <h2>New Loan Request Details</h2>
        <p><strong>Equipment:</strong> ${params.equipmentName}</p>
        <p><strong>Borrowing Date:</strong> ${params.borrowingDate}</p>
        <p><strong>Return Date:</strong> ${params.returnDate}</p>
        <p><strong>Project Description:</strong> ${params.projectDescription}</p>
        <p><strong>Student Email:</strong> ${params.studentEmail}</p>
      `
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log('Email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Error sending email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
};

export const testEmailService = async (toEmail: string = 'erwen1.kad@gmail.com'): Promise<{ success: boolean; error?: string }> => {
  try {
    const { data, error } = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to: toEmail,
      subject: 'Hello World',
      html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
    });

    if (error) {
      throw new Error(error.message);
    }

    console.log('Test email sent successfully:', data);
    return { success: true };
  } catch (error) {
    console.error('Error sending test email:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred'
    };
  }
}; 