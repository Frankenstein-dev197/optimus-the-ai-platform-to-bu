export type Diff = {
  id: string;
  hunks: Hunk[];
};

export type Hunk = {
  content: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  noEOFCRDeletions?: boolean;
  noEOFCRAdditions?: boolean;
};

export interface FileContents {
  name: string;
  lang?: string;
  contents: string;
  cacheKey?: string;
}

export interface FileDiffMetadata extends FileContents {
  hunks: Array<{
    content: string;
    oldStart: number;
    oldLines: number;
    newStart: number;
    newLines: number;
    additionStart?: number;
    deletionStart?: number;
    noEOFCRDeletions?: boolean;
    noEOFCRAdditions?: boolean;
    hunkContent?: Array<{
      type: "addition" | "deletion" | "context";
      content: string;
      lineNumber?: number;
      oldLineNumber?: number;
      newLineNumber?: number;
      lines?: number;
      deletions?: number;
      additions?: number;
      additionLineIndex?: number;
      deletionLineIndex?: number;
    }>;
    additionLines?: number;
    deletionLines?: number;
  }>;
  type: "added" | "deleted" | "modified" | "renamed";
  prevName?: string;
  insertions?: number;
  deletions?: number;
  additionLines?: string[];
  deletionLines?: string[];
}

export function parseDiff(content: string): Diff[] {
  return [];
}

export function parsePatchFiles(content: string, cacheKeyPrefix?: string): Array<{ files: FileDiffMetadata[] }> {
  return [{ files: [] }];
}

export type ChangeTypes = "new" | "deleted" | "rename-pure" | "rename-changed" | "change" | "added" | "modified" | "renamed";

export type DiffLineAnnotation<T = unknown> = {
  id?: string;
  type?: string;
  author?: string;
  timestamp?: string;
  body?: T;
  side?: "additions" | "deletions" | "left" | "right";
  lineNumber?: number;
  metadata?: T;
};

export type SelectedLineRange = {
  start: number;
  end: number;
  type?: "line" | "range";
  side?: "additions" | "deletions";
  endSide?: "additions" | "deletions";
};

export interface VirtualFileMetrics {
  insertions?: number;
  deletions?: number;
  filesChanged?: number;
}
