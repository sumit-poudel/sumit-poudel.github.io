export {};

declare global {
    interface Window {
      updateStatusBar: (mode?: string, commandLine?: string, fileInfo?: string, position?: string) => void;
      performSearch?: (query: string) => void;
      openSearchWithQuery?: (query: string) => void;
      refreshPalette?: (commandBuffer: string) => void;
      setCommandLine?: (query: string) => void;
      closeSearchPalette?: () => void;
      handleSearchKey?: (key: string) => boolean;
    }
  }
