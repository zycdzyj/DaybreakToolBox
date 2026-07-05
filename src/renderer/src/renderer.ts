const inputElement = document.getElementById('user-input') as HTMLInputElement;
const btnElement = document.getElementById('submitBtn');
console.log("检查 window.api 是否存在:", window.api); 
// 1. 必须加上 async
btnElement?.addEventListener('click', async () => {
    const Text: string = inputElement.value;
    
    try {
        // 2. 使用 await 等待主进程返回
        const reply = await window.api.sendPing(Text); 
        console.log("渲染进程收到回复:", reply);
    } catch (error) {
        console.error("IPC 通信失败:", error);
    }
});
console.log('dqwdqw')