// filepath: src/types/botpress.ts
export interface BotpressConfig {
  botId: string;
  hostUrl: string;
  messagingUrl?: string;
  clientId?: string;
  botName?: string;
  botAvatar?: string;
  theme?: string;
  themeColor?: string;
  hideWidget?: boolean;
  disableAnimations?: boolean;
  closeOnEscape?: boolean;
  showConversationsButton?: boolean;
  enableTranscriptDownload?: boolean;
  className?: string;
  containerWidth?: string;
  layoutWidth?: string;
  userData?: Record<string, any>;
  extraData?: Record<string, any>;
}

export interface BotpressEvent {
  type: string;
  payload: Record<string, unknown>;
}

export interface BotpressWebChat {
  init: (config: BotpressConfig) => void;
  onEvent: (callback: (event: BotpressEvent) => void) => void;
  sendEvent: (event: BotpressEvent) => void;
  mergeConfig: (config: Partial<BotpressConfig>) => void;
  destroy?: () => void;
}

declare global {
  interface Window {
    botpressWebChat?: BotpressWebChat;
  }
}
