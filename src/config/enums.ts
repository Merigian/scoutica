// Display labels for all enums — bilingual (IT/EN)

import type {
  Gender,
  EyeColor,
  HairColor,
  Ethnicity,
  ModelCategory,
  ProfessionalStatus,
  ContactReason,
  PipelineStage,
  VerificationStatus,
  CastingStatus,
  ApplicationStatus,
  ReportReason,
  ScoutSubtype,
  ProfileVisibility,
  NotificationType,
  JobType,
  CastingType,
  JobStatus,
  StudioType,
  StudioStatus,
  StudioInquiryStatus,
  BookingStatus,
} from "@prisma/client";

type Labels = { it: string; en: string };

export const GENDER_LABELS: Record<Gender, Labels> = {
  MALE: { it: "Uomo", en: "Male" },
  FEMALE: { it: "Donna", en: "Female" },
  NON_BINARY: { it: "Non binario", en: "Non-binary" },
  OTHER: { it: "Altro", en: "Other" },
};

export const EYE_COLOR_LABELS: Record<EyeColor, Labels> = {
  BROWN: { it: "Marrone", en: "Brown" },
  BLUE: { it: "Blu", en: "Blue" },
  GREEN: { it: "Verde", en: "Green" },
  HAZEL: { it: "Nocciola", en: "Hazel" },
  GRAY: { it: "Grigio", en: "Gray" },
  AMBER: { it: "Ambra", en: "Amber" },
  OTHER: { it: "Altro", en: "Other" },
};

export const HAIR_COLOR_LABELS: Record<HairColor, Labels> = {
  BLACK: { it: "Nero", en: "Black" },
  BROWN: { it: "Castano", en: "Brown" },
  BLONDE: { it: "Biondo", en: "Blonde" },
  RED: { it: "Rosso", en: "Red" },
  AUBURN: { it: "Ramato", en: "Auburn" },
  GRAY: { it: "Grigio", en: "Gray" },
  WHITE: { it: "Bianco", en: "White" },
  OTHER: { it: "Altro", en: "Other" },
};

export const ETHNICITY_LABELS: Record<Ethnicity, Labels> = {
  CAUCASIAN: { it: "Caucasico", en: "Caucasian" },
  AFRICAN: { it: "Africano", en: "African" },
  ASIAN: { it: "Asiatico", en: "Asian" },
  LATINO: { it: "Latino", en: "Latino" },
  MIDDLE_EASTERN: { it: "Mediorientale", en: "Middle Eastern" },
  MIXED: { it: "Misto", en: "Mixed" },
  OTHER: { it: "Altro", en: "Other" },
};

export const MODEL_CATEGORY_LABELS: Record<ModelCategory, Labels> = {
  COMMERCIAL: { it: "Commerciale", en: "Commercial" },
  EDITORIAL: { it: "Editoriale", en: "Editorial" },
  RUNWAY: { it: "Passerella", en: "Runway" },
  BEAUTY: { it: "Beauty", en: "Beauty" },
  FITTING: { it: "Fitting", en: "Fitting" },
  SHOWROOM: { it: "Showroom", en: "Showroom" },
  PLUS_SIZE: { it: "Plus Size", en: "Plus Size" },
  PETITE: { it: "Petite", en: "Petite" },
  FITNESS: { it: "Fitness", en: "Fitness" },
  LINGERIE: { it: "Lingerie", en: "Lingerie" },
  SWIMWEAR: { it: "Swimwear", en: "Swimwear" },
  OTHER: { it: "Altro", en: "Other" },
};

export const PROFESSIONAL_STATUS_LABELS: Record<ProfessionalStatus, Labels> = {
  NEW_FACE: { it: "Nuovo Volto", en: "New Face" },
  EXPERIENCED: { it: "Con Esperienza", en: "Experienced" },
  AGENCY_REPRESENTED: { it: "Con Agenzia", en: "Agency Represented" },
  FREELANCE: { it: "Freelance", en: "Freelance" },
};

export const CONTACT_REASON_LABELS: Record<ContactReason, Labels> = {
  SCOUTING: { it: "Scouting", en: "Scouting" },
  CASTING: { it: "Casting", en: "Casting" },
  JOB_OPPORTUNITY: { it: "Opportunità di lavoro", en: "Job Opportunity" },
  EDITORIAL: { it: "Collaborazione editoriale", en: "Editorial Collaboration" },
  OTHER: { it: "Altro", en: "Other" },
};

export const PIPELINE_STAGE_LABELS: Record<PipelineStage, Labels> = {
  SAVED: { it: "Salvato", en: "Saved" },
  CONTACTED: { it: "Contattato", en: "Contacted" },
  REPLIED: { it: "Risposto", en: "Replied" },
  SHORTLISTED: { it: "Shortlist", en: "Shortlisted" },
  BOOKED: { it: "Prenotato", en: "Booked" },
};

export const VERIFICATION_STATUS_LABELS: Record<VerificationStatus, Labels> = {
  PENDING: { it: "In attesa", en: "Pending" },
  APPROVED: { it: "Approvato", en: "Approved" },
  REJECTED: { it: "Rifiutato", en: "Rejected" },
  WAITLISTED: { it: "In lista d'attesa", en: "Waitlisted" },
  VERIFICATION_REQUIRED: { it: "Verifica richiesta", en: "Verification required" },
  VERIFICATION_SUBMITTED: { it: "Verifica inviata", en: "Verification submitted" },
};

export const CASTING_STATUS_LABELS: Record<CastingStatus, Labels> = {
  DRAFT: { it: "Bozza", en: "Draft" },
  PUBLISHED: { it: "Pubblicato", en: "Published" },
  CLOSED: { it: "Chiuso", en: "Closed" },
  ARCHIVED: { it: "Archiviato", en: "Archived" },
};

export const JOB_STATUS_LABELS: Record<JobStatus, Labels> = {
  DRAFT: { it: "Bozza", en: "Draft" },
  PUBLISHED: { it: "Pubblicato", en: "Published" },
  CLOSED: { it: "Chiuso", en: "Closed" },
  ARCHIVED: { it: "Archiviato", en: "Archived" },
};

export const JOB_TYPE_LABELS: Record<JobType, Labels> = {
  SHOOTING: { it: "Shooting fotografico", en: "Photo Shooting" },
  ECOMMERCE: { it: "E-commerce", en: "E-commerce" },
  CAMPAIGN: { it: "Campagna pubblicitaria", en: "Ad Campaign" },
  RUNWAY: { it: "Sfilata", en: "Runway" },
  FITTING: { it: "Fitting", en: "Fitting" },
  SHOWROOM: { it: "Showroom", en: "Showroom" },
  SOCIAL_COLLAB: { it: "Collaborazione social", en: "Social Collaboration" },
  EVENT: { it: "Evento", en: "Event" },
  HOSTESS: { it: "Hostess/Promoter", en: "Hostess/Promoter" },
  OTHER: { it: "Altro", en: "Other" },
};

export const CASTING_TYPE_LABELS: Record<CastingType, Labels> = {
  PHYSICAL: { it: "In presenza", en: "In Person" },
  ONLINE: { it: "Online", en: "Online" },
};

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, Labels> = {
  PENDING: { it: "In attesa", en: "Pending" },
  ACCEPTED: { it: "Accettata", en: "Accepted" },
  REJECTED: { it: "Rifiutata", en: "Rejected" },
  WITHDRAWN: { it: "Ritirata", en: "Withdrawn" },
};

export const REPORT_REASON_LABELS: Record<ReportReason, Labels> = {
  HARASSMENT: { it: "Molestie", en: "Harassment" },
  INAPPROPRIATE_CONTENT: { it: "Contenuto inappropriato", en: "Inappropriate Content" },
  FAKE_PROFILE: { it: "Profilo falso", en: "Fake Profile" },
  SPAM: { it: "Spam", en: "Spam" },
  OTHER: { it: "Altro", en: "Other" },
};

export const SCOUT_SUBTYPE_LABELS: Record<ScoutSubtype, Labels> = {
  SCOUT: { it: "Scout", en: "Scout" },
  AGENCY: { it: "Agenzia", en: "Agency" },
  BRAND: { it: "Brand", en: "Brand" },
};

export const PROFILE_VISIBILITY_LABELS: Record<ProfileVisibility, Labels> = {
  PUBLIC: { it: "Pubblico", en: "Public" },
  VERIFIED_SCOUTS_ONLY: { it: "Solo scout verificati", en: "Verified Scouts Only" },
  PRIVATE: { it: "Privato", en: "Private" },
};

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, Labels> = {
  CONTACT_REQUEST_RECEIVED: { it: "Richiesta di contatto ricevuta", en: "Contact Request Received" },
  CONTACT_REQUEST_ACCEPTED: { it: "Richiesta di contatto accettata", en: "Contact Request Accepted" },
  CONTACT_REQUEST_REJECTED: { it: "Richiesta di contatto rifiutata", en: "Contact Request Rejected" },
  NEW_MESSAGE: { it: "Nuovo messaggio", en: "New Message" },
  APPLICATION_SUBMITTED: { it: "Candidatura inviata", en: "Application Submitted" },
  APPLICATION_ACCEPTED: { it: "Candidatura accettata", en: "Application Accepted" },
  APPLICATION_REJECTED: { it: "Candidatura rifiutata", en: "Application Rejected" },
  JOB_APPLICATION_SUBMITTED: { it: "Candidatura lavoro inviata", en: "Job Application Submitted" },
  JOB_APPLICATION_ACCEPTED: { it: "Candidatura lavoro accettata", en: "Job Application Accepted" },
  JOB_APPLICATION_REJECTED: { it: "Candidatura lavoro rifiutata", en: "Job Application Rejected" },
  VERIFICATION_APPROVED: { it: "Verifica approvata", en: "Verification Approved" },
  VERIFICATION_REJECTED: { it: "Verifica rifiutata", en: "Verification Rejected" },
  BOOST_ACTIVATED: { it: "Boost attivato", en: "Boost Activated" },
  BOOST_EXPIRED: { it: "Boost scaduto", en: "Boost Expired" },
  STUDIO_INQUIRY_RECEIVED: { it: "Richiesta studio ricevuta", en: "Studio Inquiry Received" },
  BOOKING_RECEIVED: { it: "Prenotazione ricevuta", en: "Booking Received" },
  BOOKING_CONFIRMED: { it: "Prenotazione confermata", en: "Booking Confirmed" },
  BOOKING_CANCELLED: { it: "Prenotazione cancellata", en: "Booking Cancelled" },
  SYSTEM: { it: "Sistema", en: "System" },
};

export const SPOKEN_LANGUAGES = [
  { code: "it", label: { it: "Italiano", en: "Italian" } },
  { code: "en", label: { it: "Inglese", en: "English" } },
  { code: "fr", label: { it: "Francese", en: "French" } },
  { code: "de", label: { it: "Tedesco", en: "German" } },
  { code: "es", label: { it: "Spagnolo", en: "Spanish" } },
  { code: "pt", label: { it: "Portoghese", en: "Portuguese" } },
  { code: "ru", label: { it: "Russo", en: "Russian" } },
  { code: "zh", label: { it: "Cinese", en: "Chinese" } },
  { code: "ja", label: { it: "Giapponese", en: "Japanese" } },
  { code: "ar", label: { it: "Arabo", en: "Arabic" } },
  { code: "ko", label: { it: "Coreano", en: "Korean" } },
  { code: "nl", label: { it: "Olandese", en: "Dutch" } },
  { code: "pl", label: { it: "Polacco", en: "Polish" } },
  { code: "ro", label: { it: "Rumeno", en: "Romanian" } },
  { code: "uk", label: { it: "Ucraino", en: "Ukrainian" } },
];

// ─── STUDIO ────────────────────────────────────────────────────────────

export const STUDIO_TYPE_LABELS: Record<StudioType, Labels> = {
  PHOTO_STUDIO: { it: "Studio fotografico", en: "Photo Studio" },
  SHOWROOM: { it: "Showroom", en: "Showroom" },
  REHEARSAL_SPACE: { it: "Sala prove", en: "Rehearsal Space" },
  EVENT_SPACE: { it: "Spazio eventi", en: "Event Space" },
  COWORKING: { it: "Coworking", en: "Coworking" },
  OTHER: { it: "Altro", en: "Other" },
};

export const STUDIO_STATUS_LABELS: Record<StudioStatus, Labels> = {
  DRAFT: { it: "Bozza", en: "Draft" },
  PUBLISHED: { it: "Pubblicato", en: "Published" },
  PAUSED: { it: "In pausa", en: "Paused" },
  ARCHIVED: { it: "Archiviato", en: "Archived" },
};

export const STUDIO_INQUIRY_STATUS_LABELS: Record<StudioInquiryStatus, Labels> = {
  PENDING: { it: "In attesa", en: "Pending" },
  REPLIED: { it: "Risposta inviata", en: "Replied" },
  CLOSED: { it: "Chiusa", en: "Closed" },
};

export const BOOKING_STATUS_LABELS: Record<BookingStatus, Labels> = {
  PENDING: { it: "In attesa", en: "Pending" },
  CONFIRMED: { it: "Confermata", en: "Confirmed" },
  CANCELLED: { it: "Cancellata", en: "Cancelled" },
  COMPLETED: { it: "Completata", en: "Completed" },
};

export const STUDIO_AMENITIES = [
  { key: "professional_lighting", label: { it: "Luci professionali", en: "Professional lighting" } },
  { key: "backdrops", label: { it: "Fondali", en: "Backdrops" } },
  { key: "changing_room", label: { it: "Spogliatoio", en: "Changing room" } },
  { key: "makeup_area", label: { it: "Area trucco", en: "Makeup area" } },
  { key: "wifi", label: { it: "Wi-Fi", en: "Wi-Fi" } },
  { key: "parking", label: { it: "Parcheggio", en: "Parking" } },
  { key: "air_conditioning", label: { it: "Aria condizionata", en: "Air conditioning" } },
  { key: "kitchen", label: { it: "Cucina/angolo ristoro", en: "Kitchen/refreshment area" } },
  { key: "equipment_included", label: { it: "Attrezzatura inclusa", en: "Equipment included" } },
  { key: "cyclorama", label: { it: "Cyclorama", en: "Cyclorama" } },
  { key: "natural_light", label: { it: "Luce naturale", en: "Natural light" } },
  { key: "sound_system", label: { it: "Impianto audio", en: "Sound system" } },
  { key: "steamer", label: { it: "Stiratrice a vapore", en: "Garment steamer" } },
  { key: "accessible", label: { it: "Accessibile", en: "Wheelchair accessible" } },
];
