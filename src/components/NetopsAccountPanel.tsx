import type { AccountSyncSnapshot } from '../utils/accountSyncStore';
import { accountSync } from '../utils/netopsAccountSync';

const action = 'inline-flex min-h-11 cursor-pointer items-center rounded-lg border border-cyan-600/40 px-3 py-2 text-xs font-semibold text-cyan-900 hover:bg-cyan-500/10 focus-visible:outline-2 focus-visible:outline-cyan-500 disabled:cursor-not-allowed disabled:opacity-50 dark:text-cyan-200';

export function NetopsAccountPanel({ state, hasGuestData, onImport }: {
  state: AccountSyncSnapshot;
  hasGuestData: boolean;
  onImport: () => void;
}) {
  return (
    <section aria-label="Синхронизация уроков" className="space-y-1 rounded-xl border border-slate-200 p-3 text-sm dark:border-slate-700">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <p className="font-semibold">Синхронизация уроков</p>
          {state.identity ? <p className="break-all text-xs text-slate-600 dark:text-slate-300">{state.identity.label}</p>
            : <p className="text-xs text-slate-600 dark:text-slate-300">По желанию: «Избранное» и место остановки на разных устройствах. Ответы и экзамены не отправляются.</p>}
        </div>
        {state.stage === 'guest' && <button type="button" className={action} onClick={() => void accountSync.prepareSignIn()}>Подключить синхронизацию</button>}
        {state.stage === 'ready' && <div className="flex flex-wrap gap-2">
          <button type="button" className={action} onClick={() => void accountSync.signIn()}>Войти через Google</button>
          <button type="button" className={action} onClick={accountSync.cancelSignIn}>Отмена</button>
        </div>}
        {state.stage === 'account' && <button type="button" className={action} onClick={() => void accountSync.signOut()}>Выйти</button>}
      </div>
      {state.stage === 'preparing' && <p role="status">Загружаю форму входа…</p>}
      {state.stage === 'connecting' && <p role="status">Подключаю аккаунт…</p>}
      {state.stage === 'signing-out' && <p role="status">Выхожу из аккаунта…</p>}
      {state.stage === 'account' && (
        <>
          <div className="flex flex-wrap items-center gap-2">
            <p role="status" className="text-xs text-slate-600 dark:text-slate-300">{state.busy ? 'Жду подтверждение сервера…'
              : state.confirmed ? 'Подключено' : 'Нет подтверждения от сервера. Изменения временно недоступны.'}</p>
            {!state.confirmed && !state.busy && <button type="button" className={action} onClick={() => void accountSync.retry()}>Повторить загрузку</button>}
          </div>
          {hasGuestData && state.importStatus === 'idle' && (
            <div className="flex flex-wrap items-center gap-2">
              <button type="button" className={action} onClick={onImport} disabled={!state.confirmed || state.busy}>Импортировать локальные</button>
              <p className="text-xs text-slate-600 dark:text-slate-300">Только отсутствующие в аккаунте. Локальные данные сохранятся.</p>
            </div>
          )}
          {state.importStatus === 'done' && <p role="status" className="text-xs">Импорт подтверждён сервером. Существующие записи не заменены.</p>}
        </>
      )}
      {state.error && <p role="alert" className="text-xs text-amber-800 dark:text-amber-300">{state.error}</p>}
    </section>
  );
}
