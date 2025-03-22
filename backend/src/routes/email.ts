import express, { Request, Response, Router } from 'express';
import { Resend } from 'resend';

const router: Router = express.Router();
const resend = new Resend('re_WzFs1gkM_2LNuo15ebVFKbjvAG4WNVYj1');

interface TestEmailBody {
  to: string;
}

interface LoanRequestBody {
  to: string;
  params: {
    equipmentName: string;
    borrowingDate: string;
    returnDate: string;
    projectDescription: string;
    studentEmail: string;
  };
}

router.post('/test', async (req: Request<{}, any, TestEmailBody>, res: Response) => {
  try {
    const { to } = req.body;

    if (!to) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipient email is required' 
      });
    }

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: 'Test Email from IELMS',
      html: '<p>This is a test email from the IELMS system.</p>',
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error sending test email:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
});

router.post('/loan-request', async (req: Request<{}, any, LoanRequestBody>, res: Response) => {
  try {
    const { to, params } = req.body;

    if (!to || !params) {
      return res.status(400).json({ 
        success: false, 
        error: 'Recipient email and parameters are required' 
      });
    }

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">Nouvelle demande d'emprunt de matériel</h2>
        
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #34495e; margin-top: 0;">Détails de la demande:</h3>
          
          <div style="margin: 15px 0;">
            <strong>Équipement:</strong> ${params.equipmentName}
          </div>
          
          <div style="margin: 15px 0;">
            <strong>Date d'emprunt:</strong> ${params.borrowingDate}
          </div>
          
          <div style="margin: 15px 0;">
            <strong>Date de retour:</strong> ${params.returnDate}
          </div>
          
          <div style="margin: 15px 0;">
            <strong>Description du projet:</strong><br>
            ${params.projectDescription}
          </div>
          
          <div style="margin: 15px 0;">
            <strong>Email de l'étudiant:</strong> ${params.studentEmail}
          </div>
        </div>
        
        <p style="color: #7f8c8d; font-size: 0.9em;">
          Cet email a été envoyé automatiquement par le système de gestion des emprunts.
        </p>
      </div>
    `;

    const data = await resend.emails.send({
      from: 'onboarding@resend.dev',
      to,
      subject: 'Nouvelle demande d\'emprunt de matériel',
      html: emailHtml,
    });

    res.json({ success: true, data });
  } catch (error) {
    console.error('Error sending loan request email:', error);
    res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'An unknown error occurred' 
    });
  }
});

export default router; 