import React, {
    useEffect,
    useImperativeHandle,
    useRef,
    useState,
    forwardRef,
} from "react";

// 声明 window.loadPyodide
declare global {
    interface Window {
        loadPyodide: any;
    }
}

const PYODIDE_SRC = "https://cdn.jsdelivr.net/pyodide/v0.25.1/full/pyodide.js";

// 1. props 变简单（onOutput），2. ref 类型暴露 runCode
export interface PyRunnerHandle {
    runCode: (code: string) => Promise<{ success: boolean; message: string }>;
}

export const PyRunner = forwardRef<PyRunnerHandle, {}>((props, ref) => {
    const [loading, setLoading] = useState(true);
    const pyodideRef = useRef<any>(null);

    // 初始化 pyodide，只加载一次
    useEffect(() => {
        let unmounted = false;
        async function loadPyodideScript() {
            if (!window.loadPyodide) {
                const script = document.createElement("script");
                script.src = PYODIDE_SRC;
                script.async = true;
                document.body.appendChild(script);
                await new Promise<void>((res) => {
                    script.onload = () => res();
                });
            }
            const pyodide = await window.loadPyodide();
            if (!unmounted) {
                pyodideRef.current = pyodide;
                setLoading(false);
            }
        }
        loadPyodideScript();
        return () => {
            unmounted = true;
        };
    }, []);

    useImperativeHandle(ref, () => ({
        runCode: async (code: string) => {
            if (!pyodideRef.current) return {
                success: false,
                message: "Pyodide未加载"
            }
            if (!code.trim()) return {
                success: false,
                message: "代码不能为空"
            }
            let output = "";
            const pyodide = pyodideRef.current;

            const stdoutRedir = pyodide.setStdout({ batched: (s: string) => { output += s; } });
            const stderrRedir = pyodide.setStderr({ batched: (s: string) => { output += s; } });

            try {
                await pyodide.runPythonAsync(code);
                console.log(output)
                return {
                    success: true,
                    message: output.trim() || "运行成功"
                };
            } catch (e: any) {
                let msg: string;
                if (typeof e === "object" && e !== null && typeof e.message === "string") {
                    const lines = e.message.trim().split('\n');
                    msg = lines[lines.length - 1] || e.message;
                } else {
                    msg = String(e);
                }
                return {
                    success: false,
                    message: msg
                };
            } finally {
                stdoutRedir && typeof stdoutRedir.destroy === 'function' && stdoutRedir.destroy();
                stderrRedir && typeof stderrRedir.destroy === 'function' && stderrRedir.destroy();
            }
        }
    }));


    return (
        <div>{loading ? "Pyodide 加载中..." : null}</div>
    );
});
