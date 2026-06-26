// Tipos compartilhados entre cliente e servidor.

export interface CampaignDNAData {
  businessName: string;
  product: string;
  idealCustomer: string;
  valueProposition: string;
  toneOfVoice: string;
  objections: string;
  proof: string;
  competitors: string;
}

export interface NicheData {
  id: string;
  slug: string;
  name: string;
  emoji: string;
  accentColor: string;
  dna: CampaignDNAData;
  favoriteAgentIds: string[];
}

export interface GenerationData {
  id: string;
  nicheId: string;
  agentId: string;
  agentLabel: string;
  agentEmoji: string;
  category: string;
  title: string;
  instructions: string;
  result: string;
  favorite: boolean;
  folderId: string | null;
  createdAt: string;
}

export interface FolderData {
  id: string;
  nicheId: string;
  name: string;
  createdAt: string;
}

export const EMPTY_DNA: CampaignDNAData = {
  businessName: "",
  product: "",
  idealCustomer: "",
  valueProposition: "",
  toneOfVoice: "",
  objections: "",
  proof: "",
  competitors: "",
};
