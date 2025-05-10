export interface Comment {
    user: string;
    content: string;
    time: string; // ISO string
  }
  
  export interface PostRecord {
    id: string;
    title: string;
    author: string;
    content: string;
    comments: Comment[];
  }
  