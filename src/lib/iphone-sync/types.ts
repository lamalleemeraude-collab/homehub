export type IPhoneSyncEvent = {
  id: string;
  title: string;
  start: string;
  end: string;
  calendar: string;
  allDay?: boolean;
};

export type IPhoneSyncStore = {
  syncedAt: string;
  events: IPhoneSyncEvent[];
};

/** Payload accepté depuis le Raccourci iOS (FR ou EN). */
export type IPhoneSyncIncomingEvent = {
  titre?: string;
  title?: string;
  dateDebut?: string;
  dateFin?: string;
  start?: string;
  end?: string;
  calendrier?: string;
  calendar?: string;
  allDay?: boolean;
  journéeEntière?: boolean;
  journeeEntiere?: boolean;
};

export type IPhoneSyncPostBody = {
  events?: IPhoneSyncIncomingEvent[];
};
