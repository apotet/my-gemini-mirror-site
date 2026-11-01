import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Download,
  Key,
  FolderGit2,
  Sparkles,
  RotateCcw,
} from 'lucide-react';
import {
  pushProjectToGitHub,
  generateProjectZip,
  downloadBlob,
  getProjectFiles,
} from '../projectExporter';

interface DeployModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DeployModal: React.FC<DeployModalProps> = ({ isOpen, onClose }) => {
  const [token, setToken] = useState<string>(() => {
    try {
      return localStorage.getItem('gh_pat_token') || '';
    } catch {
      return '';
    }
  });
  const [repoName, setRepoName] = useState<string>('my-gemini-mirror-site');
  const [isPushing, setIsPushing] = useState<boolean>(false);
  const [pushStatus, setPushStatus] = useState<string>('');
  const [progressPercent, setProgressPercent] = useState<number>(0);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [successResult, setSuccessResult] = useState<{
    repoUrl: string;
    pageUrl: string;
    owner: string;
    actionsUrl?: string;
  } | null>(null);

  const [liveActionStatus, setLiveActionStatus] = useState<{
    status: 'queued' | 'in_progress' | 'completed' | 'unknown';
    conclusion: 'success' | 'failure' | 'cancelled' | null;
    updatedAt?: string;
  } | null>(null);

  // Poll GitHub Actions status when successResult is available
  React.useEffect(() => {
    if (!successResult || !token) return;

    let isSubscribed = true;
    const cleanRepo = repoName.replace(/^https?:\/\/github\.com\//i, '').replace(/^.*\//, '').trim() || 'my-gemini-mirror-site';
    const authHeader = {
      Authorization: `Bearer ${token.trim()}`,
      Accept: 'application/vnd.github.v3+json',
    };

    const checkStatus = async () => {
      try {
        const res = await fetch(
          `https://api.github.com/repos/${successResult.owner}/${cleanRepo}/actions/runs?per_page=1`,
          { headers: authHeader }
        );
        if (!res.ok) return;
        const data = await res.json();
        const latestRun = data.workflow_runs?.[0];
        if (latestRun && isSubscribed) {
          setLiveActionStatus({
            status: latestRun.status,
            conclusion: latestRun.conclusion,
            updatedAt: latestRun.updated_at,
          });
        }
      } catch {
        // quiet fallback
      }
    };

    // Initial check and interval every 6 seconds
    checkStatus();
    const interval = setInterval(checkStatus, 6000);
    return () => {
      isSubscribed = false;
      clearInterval(interval);
    };
  }, [successResult, token, repoName]);

  const projectFiles = React.useMemo(() => {
    try {
      return getProjectFiles();
    } catch {
      return [];
    }
  }, [isOpen]);

  const hasPracticeHub = projectFiles.some((f) => f.path.includes('PracticeHub.tsx'));
  const hasNewIpv4 = projectFiles.some(
    (f) => f.path.includes('Ipv4Trainer.tsx') && f.content.includes('Правило непрерывности')
  );

  const forceReloadApp = () => {
    window.location.href = window.location.origin + window.location.pathname + '?reload=' + Date.now();
  };

  if (!isOpen) return null;

  const handlePush = async () => {
    if (!token.trim()) {
      setErrorMsg('Пожалуйста, введите ваш токен доступа GitHub (PAT).');
      return;
    }
    setErrorMsg('');
    setIsPushing(true);
    setProgressPercent(5);
    setPushStatus('Инициализация выгрузки...');

    try {
      localStorage.setItem('gh_pat_token', token.trim());
    } catch {
      // safe fallback
    }

    try {
      const cleanRepo = repoName.replace(/^https?:\/\/github\.com\//i, '').replace(/^.*\//, '').trim() || 'my-gemini-mirror-site';
      const result = await pushProjectToGitHub({
        token: token.trim(),
        repoName: cleanRepo,
        isPrivate: false,
        onProgress: (status, current) => {
          setPushStatus(status);
          setProgressPercent(current);
        },
      });

      setSuccessResult(result);
    } catch (err: any) {
      setErrorMsg(err.message || 'Ошибка синхронизации с GitHub.');
    } finally {
      setIsPushing(false);
    }
  };

  const handleDownloadZip = async () => {
    try {
      const blob = await generateProjectZip();
      downloadBlob(blob, 'osi-tcpip-gemini-mirror.zip');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="relative w-full max-w-xl p-6 sm:p-8 rounded-2xl bg-[#0d1b2b] border border-cyan-500/30 shadow-2xl text-slate-100 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 text-cyan-400">
            <UploadCloud className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight">
                Синхронизация с GitHub
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                v2.4
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Публикация обновлённого зеркала в{' '}
              <span className="text-cyan-300 font-mono">my-gemini-mirror-site</span>
            </p>
          </div>
        </div>

        {/* Verification banner of browser memory status */}
        {!hasPracticeHub || !hasNewIpv4 ? (
          <div className="p-3.5 rounded-xl bg-rose-950/80 border-2 border-rose-500/80 text-rose-200 mb-4 space-y-2">
            <div className="font-bold text-xs text-rose-100 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              Вкладка браузера держит устаревший кэш!
            </div>
            <p className="text-[11px] text-rose-300">
              В память браузера ещё не загрузились последние правки (Практика и новая логика IPv4). Нажмите кнопку ниже, чтобы обновить код перед выгрузкой:
            </p>
            <button
              onClick={forceReloadApp}
              type="button"
              className="w-full py-2 px-3 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-md"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Принудительно перезагрузить код
            </button>
          </div>
        ) : (
          <div className="p-2.5 rounded-xl bg-emerald-950/50 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Код проверен (v2.4):</strong> PracticeHub и IPv4 непрерывные маски загружены ({projectFiles.length} файлов).
              </span>
            </div>
            <button
              onClick={forceReloadApp}
              type="button"
              title="Перезагрузить код"
              className="px-2 py-1 text-emerald-300 hover:text-white rounded bg-emerald-900/60 hover:bg-emerald-800 text-[10px] font-mono cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Обновить
            </button>
          </div>
        )}

        {/* Change summary pill */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 space-y-1 mb-5">
          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Включено в это обновление:
          </span>
          <ul className="list-disc list-inside text-slate-400 space-y-0.5 pl-1">
            <li><strong className="text-slate-200">IPv4 Тренажёр:</strong> непрерывные маски (перед 1 не бывает 0, клик по 2 или 1 ставит единицы).</li>
            <li><strong className="text-slate-200">Вкладка «Практика»:</strong> объединены все 4 симулятора (Путь пакета, VLAN, Протоколы, CLI).</li>
            <li><strong className="text-slate-200">Чистая навигация:</strong> 4 главные вкладки (Экзамен, IPv4, Практика, Теория OSI).</li>
          </ul>
        </div>

        {/* URLs overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          <a
            href="https://apotet.github.io/osi-tcpip-exam-public/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-slate-900/60 border border-slate-700/50 hover:border-slate-500 transition-colors group"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-between">
              Оригинал (ChatGPT)
              <ExternalLink className="w-3.5 h-3.5 opacity-60 group-hover:opacity-100" />
            </div>
            <div className="text-xs font-mono text-emerald-400 truncate">
              osi-tcpip-exam-public
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5">Не затрагивается</div>
          </a>

          <a
            href="https://apotet.github.io/my-gemini-mirror-site/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/40 hover:border-cyan-400 transition-colors group"
          >
            <div className="text-[11px] font-semibold uppercase tracking-wider text-cyan-400 mb-1 flex items-center justify-between">
              Зеркало (Gemini Edition)
              <ExternalLink className="w-3.5 h-3.5 opacity-80 group-hover:opacity-100" />
            </div>
            <div className="text-xs font-mono text-cyan-300 truncate">
              my-gemini-mirror-site
            </div>
            <div className="text-[10px] text-cyan-500/80 mt-0.5">Резервная ссылка</div>
          </a>
        </div>

        {successResult ? (
          <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-4">
            <div className="flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold">Файлы успешно выгружены на GitHub!</h3>
                <p className="text-xs text-emerald-400/90">
                  Все файлы обновления отправлены в репозиторий.
                </p>
              </div>
            </div>

            {/* Live Actions Status Card */}
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  Статус автосборки (GitHub Actions):
                </span>
                {liveActionStatus?.status === 'in_progress' || liveActionStatus?.status === 'queued' ? (
                  <span className="flex items-center gap-1.5 text-amber-400 font-mono font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Собирается на сервере... (~1 мин)
                  </span>
                ) : liveActionStatus?.conclusion === 'success' ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Готово! Сайт обновлён на GitHub
                  </span>
                ) : (
                  <span className="text-cyan-300 font-mono">
                    {liveActionStatus?.status || 'Запуск задачи...'}
                  </span>
                )}
              </div>

              {liveActionStatus?.conclusion === 'success' && (
                <div className="p-2.5 rounded-lg bg-emerald-950/60 border border-emerald-500/30 text-xs text-emerald-200">
                  🚀 <strong>Сборка готова!</strong> Теперь откройте сайт зеркала и нажмите <strong>Ctrl + F5</strong> (или Command + Shift + R на Mac) для сброса кэша браузера.
                </div>
              )}
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30">
                <span className="text-slate-400">Сайт зеркала:</span>
                <a
                  href={successResult.pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-cyan-300 hover:underline flex items-center gap-1 font-bold"
                >
                  {successResult.pageUrl}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>

              {successResult.actionsUrl && (
                <div className="flex items-center justify-between p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30">
                  <span className="text-slate-300">Логи GitHub Actions:</span>
                  <a
                    href={successResult.actionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-mono text-cyan-300 hover:underline flex items-center gap-1 font-bold"
                  >
                    Открыть логи сборки
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30">
                <span className="text-slate-400">Репозиторий:</span>
                <a
                  href={successResult.repoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-mono text-slate-300 hover:underline flex items-center gap-1"
                >
                  {successResult.owner}/{repoName}
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>

            <div className="p-3.5 rounded-lg bg-amber-950/30 border border-amber-500/30 text-[11px] text-amber-200 space-y-1.5">
              <div className="font-bold text-amber-300 flex items-center gap-1.5">
                ⚡ Почему сайт может показывать старую версию:
              </div>
              <p>
                1. <strong>Кэш браузера:</strong> GitHub Pages отдаёт заголовок <code className="bg-black/40 px-1 py-0.5 rounded text-white">cache-control: max-age=600</code> (10 минут). Браузер показывает сохранённую копию. Обязательно нажмите <strong>Ctrl+F5</strong> на ПК или откройте ссылку в режиме <strong>Инкогнито</strong>.
              </p>
              <p>
                2. <strong>Сборка GitHub Actions:</strong> занимает ~60-90 секунд. Дождитесь зелёного статуса выше.
              </p>
            </div>

            <button
              onClick={() => {
                setSuccessResult(null);
                setLiveActionStatus(null);
              }}
              type="button"
              className="w-full py-2.5 px-4 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors cursor-pointer"
            >
              Синхронизировать снова
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-cyan-400" />
                Персональный токен GitHub (PAT)
              </label>
              <input
                type="password"
                value={token}
                onChange={(e) => setToken(e.target.value)}
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                Токен хранится локально в вашем браузере. Требуется право <code className="text-cyan-300">repo</code>.
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                Имя репозитория-зеркала
              </label>
              <input
                type="text"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                placeholder="my-gemini-mirror-site"
                className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all"
              />
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            {isPushing && (
              <div className="space-y-2 p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30">
                <div className="flex justify-between text-xs text-slate-300">
                  <span className="truncate pr-2 font-mono text-[11px]">{pushStatus}</span>
                  <span className="font-bold text-cyan-400">{progressPercent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            )}

            <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-[11px] text-blue-200 flex items-start gap-2">
              <span className="text-cyan-400 font-bold">ℹ️</span>
              <span>
                <strong>Перед отправкой:</strong> если вкладка AI Studio на ПК открыта давно, нажмите <kbd className="px-1.5 py-0.5 rounded bg-black/50 text-cyan-300 font-mono text-[10px]">F5</kbd> (обновить страницу), чтобы браузер гарантированно держал в памяти свежий код.
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handlePush}
                disabled={isPushing}
                type="button"
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer min-h-[44px]"
              >
                <Sparkles className="w-4 h-4" />
                {isPushing ? 'Выгрузка...' : 'Опубликовать зеркало в 1 клик'}
              </button>

              <button
                onClick={handleDownloadZip}
                type="button"
                className="py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2 min-h-[44px]"
              >
                <Download className="w-4 h-4" />
                Скачать ZIP
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
