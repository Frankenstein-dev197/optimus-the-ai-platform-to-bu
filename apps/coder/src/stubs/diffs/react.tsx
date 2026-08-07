import type { ReactNode, ComponentProps, RefObject } from "react";

export type SupportedLanguages =
  | "plaintext"
  | "abap"
  | "actionscript-3"
  | "ada"
  | "apache"
  | "apex"
  | "apl"
  | "applescript"
  | "asciiarmor"
  | "asl"
  | "assembly"
  | "autoit"
  | "awk"
  | "batchfile"
  | "bibtex"
  | "bison"
  | "bitbake"
  | "blade"
  | "c"
  | "c++"
  | "caddyfile"
  | "caddyfile.directives"
  | "caddyfile.global-options"
  | "cadence"
  | "cairo"
  | "cement"
  | "clojure"
  | "cmake"
  | "cobol"
  | "coffeescript"
  | "concurnas"
  | "containerfile"
  | "crystal"
  | "csharp"
  | "css"
  | "cue"
  | "cypher"
  | "d"
  | "dart"
  | "delphi"
  | "diff"
  | "dockerfile"
  | "doxygen"
  | "dy鸥"
  | "ebnf"
  | "editor-config"
  | "eiffel"
  | "elixir"
  | "elm"
  | "emacs-lisp"
  | "erb"
  | "erlang"
  | "fennel"
  | "fish"
  | "fortran"
  | "freefem"
  | "fsharp"
  | "gdscript"
  | "gedcom"
  | "glsl"
  | "gnuplot"
  | "go"
  | "graphql"
  | "groovy"
  | "hack"
  | "haml"
  | "handlebars"
  | "haskell"
  | "haxe"
  | "hcl"
  | "helm"
  | "hjson"
  | "hlsl"
  | "html"
  | "http"
  | "hxml"
  | "ignore"
  | "image-jpeg"
  | "image-png"
  | "ini"
  | "io"
  | "irc"
  | "j"
  | "java"
  | "javascript"
  | "json"
  | "jsonnet"
  | "jsp"
  | "julia"
  | "kotlin"
  | "kusto"
  | "latex"
  | "less"
  | "linker-script"
  | "liquid"
  | "lisp"
  | "logo"
  | "lua"
  | "makefile"
  | "markdown"
  | "marko"
  | "matlab"
  | "maxscript"
  | "mel"
  | "mermaid"
  | "nginx"
  | "nim"
  | "nix"
  | "objective-c"
  | "objective-c++"
  | "ocaml"
  | "pascal"
  | "perl"
  | "pgsql"
  | "php"
  | "plsql"
  | "powershell"
  | "processing"
  | "prolog"
  | "proto"
  | "pug"
  | "puppet"
  | "purebasic"
  | "python"
  | "qml"
  | "r"
  | "racket"
  | "raku"
  | "razor"
  | "reg"
  | "renpy"
  | "ruby"
  | "rust"
  | "sass"
  | "scala"
  | "scheme"
  | "scss"
  | "sed"
  | "shaderlab"
  | "shell"
  | "shellscript"
  | "smalltalk"
  | "sparql"
  | "sql"
  | "ssh-config"
  | "standard-ml"
  | "starlark"
  | "stylus"
  | "svelte"
  | "swift"
  | "systemd"
  | "tal"
  | "tcl"
  | "tex"
  | "toml"
  | "tsx"
  | "twig"
  | "typescript"
  | "v"
  | "vala"
  | "vbnet"
  | "velocity"
  | "verilog"
  | "vhdl"
  | "vim"
  | "vim-script"
  | "vue"
  | "webgpu"
  | "wgsl"
  | "xml"
  | "xquery"
  | "yaml"
  | "zenscript"
  | "zig";

interface FileProps {
  file: {
    name: string;
    lang?: SupportedLanguages;
    contents: string;
    cacheKey?: string;
  };
  options?: {
    overflow?: string;
    themeType?: "dark" | "light";
    disableFileHeader?: boolean;
    disableLineNumbers?: boolean;
    theme?: string;
    unsafeCSS?: string;
  };
  style?: React.CSSProperties;
  renderCustomHeader?: (file: { 
    name?: string; 
    type?: string;
    contents?: string;
    lang?: string;
    prevName?: string;
  }) => React.ReactNode;
  diffs?: Array<{
    hunks: Array<{
      content: string;
      oldStart: number;
      oldLines: number;
      newStart: number;
      newLines: number;
    }>;
  }>;
  language?: SupportedLanguages;
  theme?: string;
  beforeContent?: string;
  afterContent?: string;
  afterLabel?: string;
  beforeLabel?: string;
  beforeIcon?: ReactNode;
  afterIcon?: ReactNode;
  className?: string;
}

export function File(props: FileProps): React.JSX.Element {
  return <div {...props} />;
}

interface FileDiffProps {
  fileDiff: {
    hunks: Array<{
      content: string;
      oldStart: number;
      oldLines: number;
      newStart: number;
      newLines: number;
    }>;
  };
  options?: {
    themeType?: "dark" | "light";
    theme?: string;
  };
  style?: React.CSSProperties;
  renderCustomHeader?: (fileDiff: { 
    name?: string; 
    type?: string;
    contents?: string;
    lang?: string;
    prevName?: string;
  }) => React.ReactNode;
}

export function FileDiff(props: FileDiffProps): React.JSX.Element {
  return <div {...props} />;
}

export interface WorkerPoolOptions {
  maxConcurrentWorkers?: number;
  poolSize?: number;
  workerFactory?: () => Worker;
}

export interface WorkerInitializationRenderOptions {
  worker?: Worker;
  theme?: {
    dark: string;
    light: string;
  };
}

interface WorkerPoolContextProviderProps {
  children: ReactNode;
  poolOptions?: WorkerPoolOptions;
  highlighterOptions?: WorkerInitializationRenderOptions;
}

export function WorkerPoolContextProvider({
  children,
}: WorkerPoolContextProviderProps): React.JSX.Element {
  return <>{children}</>;
}

export type { DiffLineAnnotation } from "../index";
export type { SelectedLineRange } from "../index";
export type { VirtualFileMetrics } from "../index";
export type { FileDiffMetadata } from "../index";

export interface CodeViewItem<T = unknown> {
  file?: {
    name: string;
    lang?: string;
    contents?: string;
  };
  type?: "added" | "deleted" | "modified" | "renamed" | "diff";
  metadata?: T;
  id?: string;
  fileDiff?: unknown;
  annotations?: DiffLineAnnotation<T>[];
  version?: number;
}

export interface CodeViewHandle<T = unknown> {
  scrollToLine?: (lineNumber: number) => void;
  scrollTo?: (options: { type?: string; id?: string; align?: string; behavior?: string }) => void;
  getSelectedLines?: () => { start: number; end: number } | null;
  getSelectedAnnotations?: () => Array<{
    side?: "additions" | "deletions";
    lineNumber?: number;
  }>;
}

interface CodeViewProps<T = unknown> {
  items: Array<CodeViewItem<T>>;
  selectedLineRange?: SelectedLineRange;
  selectedLines?: { id?: string; range?: SelectedLineRange } | null;
  annotations?: DiffLineAnnotation<T>[];
  showAnnotations?: boolean;
  className?: string;
  style?: React.CSSProperties;
  ref?: RefObject<CodeViewHandle<T> | null>;
  onLineClick?: (lineNumber: number, side: "additions" | "deletions") => void;
  onScroll?: (scrollTop: number, viewer: unknown) => void;
  renderCustomHeader?: (item: CodeViewItem<T>) => ReactNode;
  renderAnnotation?: (annotation: DiffLineAnnotation<T>) => ReactNode;
  options?: {
    diffStyle?: "split" | "unified";
    diffIndicators?: "bars" | "highlight";
    overflow?: "scroll" | "hidden";
    stickyHeaders?: boolean;
    layout?: { paddingTop?: number; paddingBottom?: number; gap?: number };
    hunkSeparators?: "line-info" | "gutter";
    itemMetrics?: VirtualFileMetrics;
    unsafeCSS?: string;
    themeType?: "dark" | "light";
    theme?: string;
    enableLineSelection?: boolean;
    enableGutterUtility?: boolean;
    onLineNumberClick?: (props: { type?: string; lineNumber: number; annotationSide: "additions" | "deletions" }, item: { type?: string; item?: { id?: string } }) => void;
    onLineSelected?: (range: SelectedLineRange | null, item: { type?: string; item?: { id?: string } }) => void;
    onLineSelectionChange?: (range: SelectedLineRange | null, item: { type?: string; item?: { id?: string } }) => void;
    onGutterUtilityClick?: (range: SelectedLineRange | null, item: { type?: string; item?: { id?: string } }) => void;
  };
}

export function CodeView<T = unknown>(props: CodeViewProps<T>): React.JSX.Element {
  return <div {...props} />;
}
