export type MessageContent =
    | { type: 'image_url'; image_url: { url: string } }
    | { type: 'text'; text: string };

export interface StreamFetchParams {
    messages: (
        | { role: string; content: MessageContent[] }
        | { role: string; content: string }
    )[];
    onMessage: (data: any) => void;
    onFinish?: () => void;
    onError?: (err: any) => void;
    signal?: AbortSignal;
}

export async function streamFetch({
    messages,
    onMessage,
    onFinish,
    onError,
    signal,
}: StreamFetchParams) {
    try {
        const response = await fetch('https://ark.cn-beijing.volces.com/api/v3/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + import.meta.env.VITE_ARK_API_KEY,
            },
            body: JSON.stringify({
                model: 'doubao-seed-1-6-250615',
                thinking: {
                    type: "disabled"
                },
                stream: true,
                messages,
            }),
            signal,
        });
        if (!response.ok) throw new Error(`接口错误: ${response.status}`);
        if (!response.body) throw new Error('响应无流数据');

        const reader = response.body.getReader();
        const decoder = new TextDecoder('utf-8');
        let buffer = '';

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            buffer += decoder.decode(value, { stream: true });
            const lines = buffer.split('\n');
            buffer = lines.pop() || '';
            for (let line of lines) {
                line = line.trim();
                if (!line) continue;
                if (line === '[DONE]') {
                    onFinish && onFinish();
                    return;
                }
                try {
                    if (line.startsWith('data: ')) line = line.slice(6);
                    const json = JSON.parse(line);
                    onMessage && onMessage(json);
                } catch {
                    // 跳过无法解析的行
                }
            }
        }
        onFinish && onFinish();
    } catch (err: any) {
        if (err.name === 'AbortError') {
            onFinish && onFinish();
        } else {
            onError && onError(err);
        }
    }
}
