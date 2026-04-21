import koffi from 'koffi';

const user32 = koffi.load('user32.dll');
const kernel32 = koffi.load('kernel32.dll');

// Win32 API signatures
const GetForegroundWindow = user32.func('void* __stdcall GetForegroundWindow()');
const GetWindowThreadProcessId = user32.func(
  'uint32 __stdcall GetWindowThreadProcessId(void* hWnd, _Out_ uint32 *lpdwProcessId)',
);
const OpenProcess = kernel32.func(
  'void* __stdcall OpenProcess(uint32 dwDesiredAccess, int32 bInheritHandle, uint32 dwProcessId)',
);
const QueryFullProcessImageNameW = kernel32.func(
  'int32 __stdcall QueryFullProcessImageNameW(void* hProcess, uint32 dwFlags, _Out_ uint8 *lpExeName, _Inout_ uint32 *lpdwSize)',
);
const CloseHandle = kernel32.func('int32 __stdcall CloseHandle(void* hObject)');

const PROCESS_QUERY_LIMITED_INFORMATION = 0x1000;

export function getForegroundExe(): { exePath: string; pid: number } | null {
  const hwnd = GetForegroundWindow();
  if (!hwnd) return null;

  const pidBox: [number] = [0];
  GetWindowThreadProcessId(hwnd, pidBox);
  const pid = pidBox[0];
  if (!pid) return null;

  const hProc = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, 0, pid);
  if (!hProc) return null;
  try {
    const BUF_WCHARS = 1024;
    const buf = Buffer.alloc(BUF_WCHARS * 2);
    const sizeBox: [number] = [BUF_WCHARS];
    const ok = QueryFullProcessImageNameW(hProc, 0, buf, sizeBox);
    if (!ok) return null;
    const exePath = buf.slice(0, sizeBox[0] * 2).toString('utf16le').replace(/\0+$/, '');
    return { exePath, pid };
  } finally {
    CloseHandle(hProc);
  }
}
