import { z } from "zod";

// Types de fichiers autorisés
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

export const documentSchema = z.object({
  title: z
    .string()
    .min(1, "Le titre est requis")
    .max(255, "Le titre ne doit pas dépasser 255 caractères"),
  description: z.string().optional(),
  binder_id: z.string().uuid("ID de classeur invalide"),
  file: z
    .instanceof(File)
    .refine(
      (file) => ACCEPTED_FILE_TYPES.includes(file.type),
      "Type de fichier non pris en charge. Utilisez JPG, PNG, PDF, DOC, DOCX, XLS, XLSX, PPT ou PPTX"
    ),
  is_searchable: z.boolean(),
  tags: z.array(z.string()).optional(),
});

export type DocumentFormValues = z.infer<typeof documentSchema>;
