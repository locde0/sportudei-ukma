export interface MohylaGame {
  id: number;
  title: string;
  short_description: string;
  content: string;
}

export interface UpdateMohylaGamePayload {
  title: string;
  short_description: string;
  content: string;
}
