export const READER_VERSE_CHANGE_EVENT = "mbe:reader-verse-change";

export type ReaderVerseEventDetail = {
  bookName: string;
  chapter: number;
  verse: number;
};
