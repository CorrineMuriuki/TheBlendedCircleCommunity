declare module 'unirest' {
  interface UnirestRequest {
    headers(headers: Record<string, string>): UnirestRequest;
    send(data?: any): UnirestRequest;
    end(callback: (response: any) => void): UnirestRequest;
    timeout(ms: number): UnirestRequest;
  }

  function unirest(method: string, url: string): UnirestRequest;
  export = unirest;
} 