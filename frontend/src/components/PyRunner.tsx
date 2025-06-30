import {
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    forwardRef,
    type ForwardedRef,
} from "react";
import { loadPyodide, type PyodideInterface } from "pyodide";

export interface PyRunnerHandle {
    runCode: (code: string) => Promise<{ success: boolean; message: string }>;
}

export interface PyRunnerProps {
    // 终端输出
    onOutput?: (text: string, type: "stdout" | "stderr" | "input") => void;
    // input 请求
    onInputRequest?: (prompt: string, respond: (value: string) => void) => void;
}

export const PyRunner = forwardRef<PyRunnerHandle, PyRunnerProps>(
    ({ onOutput, onInputRequest }, ref: ForwardedRef<PyRunnerHandle>) => {
        const [loading, setLoading] = useState(true);
        const pyodideRef = useRef<PyodideInterface | null>(null);

        useEffect(() => {
            let mounted = true;
            (async () => {
                const pyodide = await loadPyodide({
                    indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/",
                });

                pyodide.registerJsModule("jsmod", {
                    async js_input(prompt: string) {
                        onOutput?.(prompt, "input");
                        return await new Promise<string>(resolve => {
                            onInputRequest?.(prompt, (value) => {
                                resolve(value ?? "");
                            });
                        });
                    }
                });

                pyodide.setStdout({ batched: (s: string) => onOutput?.(s, "stdout") });
                pyodide.setStderr({ batched: (s: string) => onOutput?.(s, "stderr") });

                if (mounted) {
                    pyodideRef.current = pyodide;
                    setLoading(false);
                }
            })();
            return () => {
                mounted = false;
            };
        }, []);

        // 让 input 调用接管所有 input() 调用（用户无感知，代码像本地一样）
        const PY_INPUT_BRIDGE = `
import builtins
import asyncio
from jsmod import js_input
builtins.input = lambda prompt='': asyncio.run(js_input(prompt))
`;

        useImperativeHandle(ref, () => ({
            runCode: async (code: string) => {
                if (!pyodideRef.current)
                    return {
                        success: false,
                        message: "Pyodide未加载",
                    };
                if (!code.trim())
                    return {
                        success: false,
                        message: "代码不能为空",
                    };

                try {
                    // 拼接 input 桥接代码与用户代码
                    const fullCode = `${PY_INPUT_BRIDGE}\n${code}`;
                    await pyodideRef.current.runPythonAsync(fullCode);
                    return {
                        success: true,
                        message: "运行成功",
                    };
                } catch (e: any) {
                    let msg = typeof e?.message === "string" ? e.message : String(e);
                    if (msg.includes('\n')) {
                        const arr = msg.trim().split('\n');
                        msg = arr[arr.length - 1] || msg;
                    }
                    onOutput?.(msg, "stderr");
                    return {
                        success: false,
                        message: msg,
                    };
                }
            },
        }));

        return <div>{loading ? "Pyodide 加载中..." : null}</div>;
    }
);
