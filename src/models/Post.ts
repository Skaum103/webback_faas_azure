import { UserPartial } from "./User";

export interface Comment {
    user: UserPartial;
    content: string;
  }
  
  export interface PostRecord {
    id: string;
    title: string;
    user: UserPartial;
    content: string;
    comments: Comment[];
    topics: string[]
  }
  