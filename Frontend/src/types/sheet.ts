export interface Question {
  id: string;
  title: string;
  difficulty: string | null;
  platform: string | null;
  problemUrl: string | null;
  resource: string | null;
}

export interface SubTopic {
  id: string;
  title: string;
}

export interface Topic {
  id: string;
  title: string;
}

export interface Sheet {
  topics: Topic[];
}