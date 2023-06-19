type LineWebhookEvent = {
  parameters: object;
  contextPath: string;
  postData: {
    contents: string;
    length: number;
    name: string;
    type: string;
  };
  queryString: string;
  parameter: Object;
  contentLength: number;
};

type LineWebhookContents = {
  destination: string;
  events: LineWebhookContentsEvent[];
};

type LineWebhookContentsEvent = {
  type: 'message' | 'follow' | 'unfollow' | string;
  message?: {
    type: 'text' | string;
    id: string;
    text: string;
  }
  webhookEventId: string;
  deliveryContext: {
    isRedelivery: boolean;
  };
  timestamp: number;
  source: {
    type: 'user' | string;
    userId: string;
  };
  replyToken: string;
  mode: 'active' | string;
};

