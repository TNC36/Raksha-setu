export interface Helpline {
  id: string;
  name: string;
  phone: string;
}

export const DEFAULT_HELPLINES: Helpline[] = [
  { id: "hl-1", name: "National Emergency", phone: "112" },
  { id: "hl-2", name: "Police", phone: "100" },
  { id: "hl-3", name: "Fire", phone: "101" },
  { id: "hl-4", name: "Ambulance", phone: "108" },
  { id: "hl-5", name: "Disaster Management", phone: "108" },
  { id: "hl-6", name: "Women Helpline", phone: "1091" },
  { id: "hl-7", name: "Child Helpline", phone: "1098" },
  { id: "hl-8", name: "Blood Bank", phone: "104" },
];
