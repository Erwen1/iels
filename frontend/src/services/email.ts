import { LoanRequest } from '../types/equipment';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import emailjs from '@emailjs/browser';

// Configuration EmailJS directe
const EMAILJS_SERVICE_ID = 'service_95iv2yn';
const EMAILJS_TEMPLATE_ID = 'emprunt_8zkubuf';
const EMAILJS_PUBLIC_KEY = 'QH_MVlAg4uafdT3Ra';

// Initialiser EmailJS avec la clé publique
emailjs.init(EMAILJS_PUBLIC_KEY);

interface EmailOptions {
  to: string;
  subject: string;
  body: string;
}

export const emailService = {
  /**
   * Envoie un email en utilisant EmailJS
   */
  async sendEmail(options: EmailOptions): Promise<boolean> {
    try {
      // Pour le débogage - afficher les détails de l'email dans la console
      console.log('========== EMAIL ENVOYÉ ==========');
      console.log(`À: ${options.to}`);
      console.log(`Sujet: ${options.subject}`);
      console.log(`Contenu: ${options.body}`);
      console.log('=================================');

      // Envoi d'un véritable email via EmailJS
      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        {
          to_email: options.to,
          subject: options.subject,
          message: options.body,
        },
        EMAILJS_PUBLIC_KEY
      );

      console.log('Email envoyé avec succès:', response);
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  },

  /**
   * Formater une date au format français
   */
  formatFrenchDate(date: string | Date): string {
    try {
      return format(new Date(date), 'dd MMMM yyyy', { locale: fr });
    } catch (error) {
      console.error('Erreur lors du formatage de la date:', error);
      return String(date);
    }
  },

  /**
   * Génère et envoie un email de notification au référent matériel
   * lors d'une demande d'emprunt
   */
  async sendLoanRequestNotification(
    equipmentManagerEmail: string,
    studentEmail: string,
    equipmentName: string,
    loanRequest: LoanRequest
  ): Promise<boolean> {
    try {
      console.log('Début de l\'envoi de notification d\'emprunt avec les données suivantes:');
      console.log('Email du référent:', equipmentManagerEmail);
      console.log('Email de l\'étudiant:', studentEmail);
      console.log('Nom de l\'équipement:', equipmentName);
      console.log('Détails de la demande:', loanRequest);

      // Formater les dates pour un affichage plus convivial
      const borrowingDate = this.formatFrenchDate(loanRequest.borrowing_date);
      const returnDate = this.formatFrenchDate(loanRequest.expected_return_date);

      // Préparation des paramètres pour le template EmailJS
      // En se basant sur la structure du template
      const templateParams = {
        to_email: equipmentManagerEmail,
        name: 'PolyPrêt', // Nom de l'expéditeur
        email: studentEmail, // Email de l'étudiant (peut être utilisé comme reply-to)
        equipment_name: equipmentName,
        student_email: studentEmail,
        project_description: loanRequest.project_description || 'Non spécifié',
        borrowing_date: borrowingDate,
        return_date: returnDate,
        message: `Demande d'emprunt pour ${equipmentName} par ${studentEmail}` // Utiliser message comme champ de résumé
      };

      console.log('Paramètres du template:', templateParams);

      try {
        // Envoi direct via EmailJS avec les paramètres du template
        const response = await emailjs.send(
          EMAILJS_SERVICE_ID,
          EMAILJS_TEMPLATE_ID,
          templateParams,
          EMAILJS_PUBLIC_KEY
        );

        console.log('Email envoyé avec succès:', response);
        return true;
      } catch (emailJsError: any) {
        console.error('Détails de l\'erreur EmailJS:', emailJsError);
        if (emailJsError.text) {
          console.error('Réponse serveur:', emailJsError.text);
        }
        throw emailJsError;
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi de la notification de demande d\'emprunt:', error);
      
      // Tentative de simulation d'envoi en cas d'échec de EmailJS
      console.log('Simulation d\'envoi d\'email comme fallback:');
      console.log('========== EMAIL SIMULÉ ==========');
      console.log(`À: ${equipmentManagerEmail}`);
      console.log(`Sujet: Nouvelle demande d'emprunt: ${equipmentName}`);
      console.log(`De: ${studentEmail}`);
      console.log(`Description: ${loanRequest.project_description || 'Non spécifié'}`);
      console.log(`Date d'emprunt: ${this.formatFrenchDate(loanRequest.borrowing_date)}`);
      console.log(`Date de retour: ${this.formatFrenchDate(loanRequest.expected_return_date)}`);
      console.log('=================================');
      
      return false;
    }
  }
}; 