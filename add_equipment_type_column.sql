-- Script SQL pour ajouter la colonne 'type' à la table equipment
ALTER TABLE public.equipment ADD COLUMN IF NOT EXISTS type VARCHAR(50) DEFAULT 'MATERIEL_PROJET';
