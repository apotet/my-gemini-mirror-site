import{n as e,r as t,t as n}from"./rolldown-runtime-pP25SEvz.js";import{n as r,t as i}from"./vendor-react-CbWjFBrl.js";import{A as a,B as o,C as s,D as c,E as l,F as u,G as d,H as f,I as p,J as m,K as h,L as g,M as _,N as v,O as y,P as b,R as x,S,T as C,U as w,V as T,W as E,_ as D,a as O,b as k,c as A,d as j,f as M,g as N,h as P,i as F,j as I,k as L,l as R,m as z,n as B,o as V,p as H,q as U,r as ee,s as W,t as G,u as te,v as K,w as ne,x as re,y as ie,z as ae}from"./icons-Bct-rqCN.js";import{n as oe,t as se}from"./questions-data-B3OH0Md1.js";(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),t.credentials=e.crossOrigin===`use-credentials`?`include`:e.crossOrigin===`anonymous`?`omit`:`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var ce=r(),q=t(m(),1),J=i(),le=({activeTab:e,onTabChange:t,isDark:n,onToggleTheme:r,soundEnabled:i,onToggleSound:o,onOpenDeploy:s,onOpenCommandPalette:u})=>{let[d,f]=(0,q.useState)(!1),p=[{id:`exam`,label:`Экзамен`,icon:(0,J.jsx)(K,{className:`w-4 h-4`})},{id:`theory`,label:`Теория и разборы`,icon:(0,J.jsx)(T,{className:`w-4 h-4 text-cyan-400`})},{id:`ipv4`,label:`IPv4 Тренажёр`,icon:(0,J.jsx)(R,{className:`w-4 h-4 text-amber-400`})},{id:`practice`,label:`Практика`,icon:(0,J.jsx)(ne,{className:`w-4 h-4 text-indigo-400`})}],m=e=>{t(e),f(!1)};return(0,J.jsxs)(`header`,{className:`sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-xl`,children:[(0,J.jsxs)(`div`,{className:`max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4`,children:[(0,J.jsx)(`div`,{className:`flex items-center gap-2 sm:gap-3 min-w-0`,children:(0,J.jsxs)(`button`,{onClick:()=>m(`exam`),type:`button`,className:`flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group min-w-0`,children:[(0,J.jsx)(`div`,{className:`w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 font-mono shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0`,children:`7`}),(0,J.jsxs)(`div`,{className:`min-w-0`,children:[(0,J.jsxs)(`div`,{className:`font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 truncate`,children:[(0,J.jsx)(`span`,{children:`OSI & TCP/IP`}),(0,J.jsx)(`span`,{className:`hidden sm:inline text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40`,children:`Gemini Mirror`})]}),(0,J.jsx)(`p`,{className:`text-[10px] text-slate-400 hidden sm:block truncate`,children:`502 вопроса · визуализаторы · CLI`})]})]})}),(0,J.jsx)(`nav`,{className:`hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800`,children:p.map(t=>{let n=e===t.id||t.id===`theory`&&e===`osi`;return(0,J.jsxs)(`button`,{onClick:()=>m(t.id),type:`button`,className:`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer ${n?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20`:`text-slate-300 hover:text-white hover:bg-white/5`}`,children:[t.icon,(0,J.jsx)(`span`,{children:t.label})]},t.id)})}),(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5 sm:gap-2 shrink-0`,children:[u&&(0,J.jsxs)(`button`,{onClick:u,type:`button`,className:`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer min-h-[38px]`,title:`Поиск и командная строка (Cmd+K / Ctrl+K)`,children:[(0,J.jsx)(H,{className:`w-3.5 h-3.5 text-cyan-400 shrink-0`}),(0,J.jsx)(`span`,{className:`hidden md:inline font-mono text-[11px] text-slate-400`,children:`⌘K`})]}),(0,J.jsxs)(`a`,{href:`https://apotet.github.io/osi-tcpip-exam-public/`,target:`_blank`,rel:`noopener noreferrer`,className:`hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-300 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all min-h-[38px]`,title:`Открыть исходный сайт от ChatGPT`,children:[(0,J.jsx)(`span`,{children:`Оригинал`}),(0,J.jsx)(l,{className:`w-3.5 h-3.5 opacity-70`})]}),(0,J.jsxs)(`a`,{href:`/osi-tcpip-trainer-source.zip`,download:`osi-tcpip-trainer-source.zip`,className:`inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold bg-emerald-950/70 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-900/80 transition-all min-h-[38px] shadow-sm shadow-emerald-500/20`,title:`Скачать полный ZIP архив проекта`,children:[(0,J.jsx)(c,{className:`w-4 h-4 text-emerald-400 shrink-0`}),(0,J.jsx)(`span`,{className:`hidden sm:inline`,children:`ZIP`})]}),(0,J.jsxs)(`button`,{onClick:s,type:`button`,className:`inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-900/80 transition-all cursor-pointer min-h-[38px] shadow-sm shadow-cyan-500/20`,title:`Синхронизация зеркала с GitHub Pages`,children:[(0,J.jsx)(a,{className:`w-4 h-4 text-cyan-400 shrink-0`}),(0,J.jsx)(`span`,{className:`hidden sm:inline`,children:`Синхронизация`})]}),(0,J.jsx)(`button`,{onClick:()=>{window.location.href=window.location.origin+window.location.pathname+`?reload=`+Date.now()},type:`button`,className:`hidden sm:flex p-2 text-slate-400 hover:text-cyan-300 rounded-xl hover:bg-white/5 transition-colors min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer`,"aria-label":`Обновить код приложения`,title:`Перезагрузить код приложения (сброс кэша)`,children:(0,J.jsx)(z,{className:`w-4 h-4`})}),(0,J.jsx)(`button`,{onClick:o,type:`button`,className:`hidden sm:flex p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer`,"aria-label":i?`Выключить звук`:`Включить звук`,title:i?`Звук включен`:`Звук выключен`,children:i?(0,J.jsx)(F,{className:`w-4 h-4 text-cyan-400`}):(0,J.jsx)(ee,{className:`w-4 h-4 text-slate-500`})}),(0,J.jsx)(`button`,{onClick:r,type:`button`,className:`hidden sm:flex p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer`,"aria-label":n?`Включить светлую тему`:`Включить тёмную тему`,children:n?(0,J.jsx)(A,{className:`w-4 h-4 text-amber-400`}):(0,J.jsx)(P,{className:`w-4 h-4 text-indigo-400`})}),(0,J.jsx)(`button`,{onClick:()=>f(!d),type:`button`,className:`lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer`,"aria-label":`Открыть меню`,children:d?(0,J.jsx)(B,{className:`w-5 h-5`}):(0,J.jsx)(N,{className:`w-5 h-5`})})]})]}),d&&(0,J.jsxs)(`div`,{className:`lg:hidden p-4 border-t border-slate-800 bg-[#07111f]/98 backdrop-blur-2xl space-y-3 animate-fade-in shadow-2xl`,children:[(0,J.jsx)(`div`,{className:`space-y-1.5`,children:p.map(t=>{let n=e===t.id||t.id===`theory`&&e===`osi`;return(0,J.jsxs)(`button`,{onClick:()=>m(t.id),type:`button`,className:`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all min-h-[44px] cursor-pointer ${n?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black`:`text-slate-300 hover:bg-white/5`}`,children:[t.icon,(0,J.jsx)(`span`,{children:t.label})]},t.id)})}),(0,J.jsxs)(`div`,{className:`pt-3 border-t border-slate-800/80`,children:[(0,J.jsx)(`div`,{className:`text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 px-1`,children:`Быстрые настройки`}),(0,J.jsxs)(`div`,{className:`grid grid-cols-3 gap-2`,children:[(0,J.jsxs)(`button`,{onClick:o,type:`button`,className:`p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col items-center justify-center gap-1 hover:border-cyan-500/40 cursor-pointer`,children:[i?(0,J.jsx)(F,{className:`w-4 h-4 text-cyan-400`}):(0,J.jsx)(ee,{className:`w-4 h-4 text-slate-500`}),(0,J.jsx)(`span`,{className:`text-[10px]`,children:i?`Звук вкл`:`Без звука`})]}),(0,J.jsxs)(`button`,{onClick:r,type:`button`,className:`p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col items-center justify-center gap-1 hover:border-cyan-500/40 cursor-pointer`,children:[n?(0,J.jsx)(A,{className:`w-4 h-4 text-amber-400`}):(0,J.jsx)(P,{className:`w-4 h-4 text-indigo-400`}),(0,J.jsx)(`span`,{className:`text-[10px]`,children:n?`Тёмная`:`Светлая`})]}),(0,J.jsxs)(`button`,{onClick:()=>{window.location.href=window.location.origin+window.location.pathname+`?reload=`+Date.now()},type:`button`,className:`p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col items-center justify-center gap-1 hover:border-cyan-500/40 cursor-pointer`,children:[(0,J.jsx)(z,{className:`w-4 h-4 text-cyan-400`}),(0,J.jsx)(`span`,{className:`text-[10px]`,children:`Сброс кэша`})]})]})]}),(0,J.jsxs)(`div`,{className:`pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs`,children:[(0,J.jsxs)(`a`,{href:`https://apotet.github.io/osi-tcpip-exam-public/`,target:`_blank`,rel:`noopener noreferrer`,className:`text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]`,children:[(0,J.jsx)(`span`,{children:`Оригинал ChatGPT`}),(0,J.jsx)(l,{className:`w-3 h-3`})]}),(0,J.jsxs)(`button`,{onClick:()=>{f(!1),s()},type:`button`,className:`text-cyan-300 hover:underline flex items-center gap-1 font-mono text-[11px] font-bold cursor-pointer`,children:[(0,J.jsx)(a,{className:`w-3 h-3`}),(0,J.jsx)(`span`,{children:`Опубликовать`})]})]})]})]})},Y=oe,ue=[{id:`mixed`,title:`Смешанный экзамен`,subtitle:`Все уровни OSI и стек TCP/IP`,description:`Комплексный срез знаний по всем темам: от оптики и витой пары до прикладных протоколов.`,icon:`Layers`,count:Y.filter(e=>e.group!==`visual-l1`).length},{id:`l1-l2`,title:`L1–L2: Физика и Ethernet`,subtitle:`Кабели, оптика, SFP, MAC, VLAN, STP`,description:`Сигналы, коллизионные домены, широковещание, коммутаторы, транки и агрегация каналов.`,icon:`Cpu`,groupFilter:`l1-l2`,count:Y.filter(e=>e.group===`l1-l2`).length},{id:`l3`,title:`L3: IPv4, IPv6 и маршрутизация`,subtitle:`Адресация, маски, CIDR, ARP, ICMP`,description:`Маршрутизация, таблицы пересылки, деление на подсети, TTL, MTU и фрагментация.`,icon:`Network`,groupFilter:`l3`,count:Y.filter(e=>e.group===`l3`).length},{id:`l4`,title:`L4: TCP и UDP`,subtitle:`Транспортный уровень, порты, сокеты`,description:`3-way handshake, флаги SYN/ACK/FIN/RST, надежность, скользящее окно и тайм-ауты.`,icon:`Repeat`,groupFilter:`l4`,count:Y.filter(e=>e.group===`l4`).length},{id:`l5-l7`,title:`L5–L7: Приложения и безопасность`,subtitle:`DNS, HTTP/1-3, TLS, DHCP, SSH`,description:`Прикладные протоколы, сертификаты, сессии, REST API и шифрование данных.`,icon:`Globe`,groupFilter:`l5-l7`,count:Y.filter(e=>e.group===`l5-l7`).length},{id:`tcpip`,title:`Стек TCP/IP`,subtitle:`Модель и архитектура стека`,description:`Инкапсуляция, декапсуляция, заголовки и соответствие с 7-уровневой моделью OSI.`,icon:`FileCode`,groupFilter:`tcpip`,count:Y.filter(e=>e.group===`tcpip`).length},{id:`troubleshooting`,title:`Диагностика сети и CLI`,subtitle:`Практический траблшутинг и команды`,description:`Использование ping, traceroute, netstat, ip link/route, wireshark и разбор инцидентов.`,icon:`Terminal`,groupFilter:`troubleshooting`,count:Y.filter(e=>e.group===`troubleshooting`).length},{id:`visual-l1`,title:`L1 — по фото оборудования`,subtitle:`Патч-корды, разъемы, SFP, шасси`,description:`Реальные фотографии серверного и телеком-оборудования, портов и маркировок.`,icon:`Camera`,groupFilter:`visual-l1`,count:Y.filter(e=>e.group===`visual-l1`).length}];function de(e,t=10){let n=Y;n=e===`mixed`?Y.filter(e=>e.group!==`visual-l1`):Y.filter(t=>t.group===e);let r=[...n];for(let e=r.length-1;e>0;e--){let t=Math.floor(Math.random()*(e+1));[r[e],r[t]]=[r[t],r[e]]}return t>=r.length?r:r.slice(0,t)}function fe(e){return e?e.startsWith(`http://`)||e.startsWith(`https://`)?e:`https://raw.githubusercontent.com/apotet/osi-tcpip-exam-public/main/${e.replace(/^\.?\//,``)}`:``}var pe=null;function me(){if(typeof window>`u`)return null;if(!pe){let e=window.AudioContext||window.webkitAudioContext;e&&(pe=new e)}return pe&&pe.state===`suspended`&&pe.resume(),pe}function he(){try{let e=me();if(!e)return;let t=e.createOscillator(),n=e.createGain();t.type=`sine`,t.frequency.setValueAtTime(587.33,e.currentTime),t.frequency.exponentialRampToValueAtTime(880,e.currentTime+.15),n.gain.setValueAtTime(.08,e.currentTime),n.gain.exponentialRampToValueAtTime(.001,e.currentTime+.2),t.connect(n),n.connect(e.destination),t.start(),t.stop(e.currentTime+.2)}catch{}}function ge(){try{let e=me();if(!e)return;let t=e.createOscillator(),n=e.createGain();t.type=`sawtooth`,t.frequency.setValueAtTime(220,e.currentTime),t.frequency.exponentialRampToValueAtTime(146.83,e.currentTime+.2),n.gain.setValueAtTime(.08,e.currentTime),n.gain.exponentialRampToValueAtTime(.001,e.currentTime+.25),t.connect(n),n.connect(e.destination),t.start(),t.stop(e.currentTime+.25)}catch{}}function _e(){try{let e=me();if(!e)return;let t=e.createOscillator(),n=e.createGain();t.type=`triangle`,t.frequency.setValueAtTime(440,e.currentTime),n.gain.setValueAtTime(.03,e.currentTime),n.gain.exponentialRampToValueAtTime(.001,e.currentTime+.05),t.connect(n),n.connect(e.destination),t.start(),t.stop(e.currentTime+.05)}catch{}}function X(e=`light`){if(typeof window<`u`&&`vibrate`in navigator)try{switch(e){case`light`:case`selection`:navigator.vibrate(8);break;case`medium`:navigator.vibrate(18);break;case`heavy`:navigator.vibrate(30);break;case`success`:navigator.vibrate([10,30,20]);break;case`error`:navigator.vibrate([20,40,20,40,30])}}catch{}}var ve=({onStartExam:e,onReviewMistakes:t,onOpenVisualL1:n,mistakesCount:r,totalQuestionsCount:i=502})=>{let a=(0,q.useMemo)(()=>{let e=72,t=`L3 подсети и маски`;try{let n=localStorage.getItem(`osi_exam_history`);if(n){let t=JSON.parse(n);if(Array.isArray(t)&&t.length>0){let n=t.reduce((e,t)=>e+(t.percentage||0),0);e=Math.round(n/t.length)}}let r=localStorage.getItem(`osi_last_mistakes`);if(r){let e=JSON.parse(r);if(Array.isArray(e)&&e.length>0){let n=e.filter(e=>e.startsWith(`l3`)||e.includes(`subnet`)).length,r=e.filter(e=>e.startsWith(`l4`)||e.includes(`transport`)).length,i=e.filter(e=>e.startsWith(`l2`)||e.includes(`vlan`)).length;n>=r&&n>=i?t=`L3 расчёт масок и маршрутов`:r>=i?t=`L4 флаги TCP и сокеты`:i>0&&(t=`L2 VLAN и кадры Ethernet`)}}}catch{}return{streakDays:7,scorePercent:e,weakSpot:t,strongSpot:`L1 фото оборудования`}},[r]),o=2*Math.PI*38,s=o-a.scorePercent/100*o;return(0,J.jsxs)(`div`,{className:`space-y-3 w-full`,children:[(0,J.jsxs)(`div`,{className:`p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c1c2e] via-[#091524] to-[#07111f] border border-cyan-500/30 shadow-2xl relative overflow-hidden`,children:[(0,J.jsx)(`div`,{className:`absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none`}),(0,J.jsxs)(`div`,{className:`relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-4`,children:[(0,J.jsxs)(`div`,{className:`relative w-20 h-20 shrink-0 flex items-center justify-center`,children:[(0,J.jsxs)(`svg`,{className:`w-20 h-20 -rotate-90 transform`,viewBox:`0 0 96 96`,children:[(0,J.jsx)(`circle`,{cx:`48`,cy:`48`,r:38,className:`stroke-slate-800`,strokeWidth:`8`,fill:`none`}),(0,J.jsx)(`circle`,{cx:`48`,cy:`48`,r:38,className:`stroke-cyan-400 transition-all duration-1000 ease-out`,strokeWidth:`8`,strokeDasharray:o,strokeDashoffset:s,strokeLinecap:`round`,fill:`none`,style:{filter:`drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))`}})]}),(0,J.jsx)(`div`,{className:`absolute inset-0 flex flex-col items-center justify-center`,children:(0,J.jsxs)(`span`,{className:`text-xl font-black font-mono text-white leading-none`,children:[a.scorePercent,`%`]})})]}),(0,J.jsxs)(`div`,{className:`space-y-1`,children:[(0,J.jsx)(`h2`,{className:`text-sm sm:text-base font-bold text-white tracking-tight`,children:`Готовность к экзамену`}),(0,J.jsxs)(`div`,{className:`text-[11px] sm:text-xs text-slate-300 space-y-0.5`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5`,children:[(0,J.jsx)(`span`,{className:`w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0`}),(0,J.jsxs)(`span`,{children:[`Слабое место:`,` `,(0,J.jsx)(`strong`,{className:`text-rose-300 font-semibold`,children:a.weakSpot})]})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5`,children:[(0,J.jsx)(`span`,{className:`w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0`}),(0,J.jsxs)(`span`,{children:[`Сильнее всего:`,` `,(0,J.jsx)(`strong`,{className:`text-emerald-300 font-semibold`,children:a.strongSpot})]})]})]})]})]}),(0,J.jsx)(`div`,{className:`flex items-center gap-2 self-start sm:self-center`,children:(0,J.jsxs)(`div`,{className:`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold shadow-md shadow-cyan-500/10`,children:[(0,J.jsx)(C,{className:`w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse`}),(0,J.jsxs)(`span`,{children:[`Серия `,a.streakDays,` дн.`]})]})})]})]}),(0,J.jsxs)(`div`,{className:`grid grid-cols-2 gap-2.5 sm:gap-3`,children:[(0,J.jsxs)(`div`,{onClick:()=>{X(`medium`),t()},className:`p-3.5 sm:p-4 rounded-2xl bg-[#091524] border border-rose-500/30 hover:border-rose-400/60 hover:bg-[#0b1a2d] transition-all cursor-pointer flex flex-col justify-between min-h-[96px] shadow-lg shadow-rose-950/20 group`,children:[(0,J.jsxs)(`div`,{className:`space-y-1`,children:[(0,J.jsx)(`span`,{className:`text-xs font-bold text-white group-hover:text-rose-200 transition-colors block`,children:`Работа над ошибками`}),(0,J.jsx)(`div`,{className:`text-2xl sm:text-3xl font-black font-mono text-cyan-400`,children:r>0?r:14})]}),(0,J.jsx)(`span`,{className:`text-[11px] text-slate-400 font-sans`,children:`вопросов на повтор`})]}),(0,J.jsxs)(`div`,{onClick:()=>{X(`light`),n()},className:`p-3.5 sm:p-4 rounded-2xl bg-[#091524] border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-[#0b1a2d] transition-all cursor-pointer flex flex-col justify-between min-h-[96px] shadow-lg shadow-cyan-950/20 group`,children:[(0,J.jsxs)(`div`,{className:`space-y-1`,children:[(0,J.jsx)(`span`,{className:`text-xs font-bold text-white group-hover:text-cyan-200 transition-colors block`,children:`Фото L1`}),(0,J.jsx)(`div`,{className:`text-2xl sm:text-3xl font-black font-mono text-cyan-400`,children:`26/40`})]}),(0,J.jsx)(`span`,{className:`text-[11px] text-slate-400 font-sans`,children:`разобрано`})]})]}),(0,J.jsxs)(`button`,{onClick:()=>{X(`heavy`),e()},type:`button`,className:`w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 text-slate-950 font-black text-sm sm:text-base hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(34,211,238,0.35)] cursor-pointer tracking-wide`,children:[(0,J.jsx)(R,{className:`w-4 h-4 fill-slate-950`}),(0,J.jsx)(`span`,{children:`Продолжить экзамен`})]})]})},ye=[{id:7,level:`L7`,name:`Прикладной`,pdu:`Данные`,color:`text-pink-400`,glowColor:`rgba(244, 114, 182, 0.4)`,protocols:[`HTTP/3`,`HTTPS`,`DNS`,`DHCP`,`SSH`,`BGP`],description:`Интерфейс приложений пользователя, API, веб-сокеты и сетевые сервисы.`,devices:`WAF, L7-балансировщики (Nginx/Envoy), веб-серверы`,cliTool:`curl -Iv https://site, dig +trace, nslookup`,headerFields:[`HTTP Request/Response`,`DNS Query Type A/AAAA`,`DHCP Options`]},{id:6,level:`L6`,name:`Представления`,pdu:`Данные`,color:`text-purple-400`,glowColor:`rgba(192, 132, 252, 0.4)`,protocols:[`TLS 1.3`,`JSON`,`ASCII`,`UTF-8`,`GZIP`],description:`Шифрование сессии (TLS handshake), согласование кодировок и сжатие данных.`,devices:`Крипто-шлюзы, TLS Termination прокси`,cliTool:`openssl s_client -connect host:443`,headerFields:[`TLS Record Header`,`Cipher Suites`,`X.509 Certificate`]},{id:5,level:`L5`,name:`Сеансовый`,pdu:`Данные`,color:`text-indigo-400`,glowColor:`rgba(129, 140, 248, 0.4)`,protocols:[`RPC`,`NetBIOS`,`gRPC Sessions`,`SOCKS5`],description:`Управление сессиями, контрольные точки синхронизации и восстановление диалога.`,devices:`Сеансовые шлюзы, координаторы микросервисов`,cliTool:`rpcinfo -p, nc -zv host 1080`,headerFields:[`Session ID`,`Sync Points`,`Transaction Token`]},{id:4,level:`L4`,name:`Транспортный`,pdu:`Сегмент`,color:`text-cyan-400`,glowColor:`rgba(34, 211, 238, 0.4)`,protocols:[`TCP`,`UDP`,`QUIC`,`SCTP`],description:`Сквозная доставка процессов по портам (1-65535), 3-way handshake, скользящее окно.`,devices:`L4 балансировщики нагрузки (HAProxy, IPVS), Stateful Firewall`,cliTool:`ss -tulpn, netstat -rn, nc -zv`,headerFields:[`Src Port (16b)`,`Dst Port (16b)`,`Seq/Ack Num`,`Flags: SYN/ACK/FIN/RST`]},{id:3,level:`L3`,name:`Сетевой`,pdu:`Пакет`,color:`text-teal-400`,glowColor:`rgba(45, 212, 191, 0.4)`,protocols:[`IPv4`,`IPv6`,`ICMP`,`OSPF`,`IPsec`],description:`Логическая сквозная IP-маршрутизация, декремент TTL, фрагментация MTU, таблицы FIB.`,devices:`Маршрутизаторы (Routers), L3-коммутаторы`,cliTool:`ip route, traceroute, ping, mtr`,headerFields:[`Src IP (32b)`,`Dst IP (32b)`,`TTL (8b)`,`Protocol (TCP=6, UDP=17, ICMP=1)`]},{id:2,level:`L2`,name:`Канальный`,pdu:`Кадр`,color:`text-emerald-400`,glowColor:`rgba(52, 211, 153, 0.4)`,protocols:[`Ethernet (802.3)`,`VLAN (802.1Q)`,`ARP`,`STP`],description:`Физическая адресация по MAC-адресам, CAM-таблица коммутатора, защита от петель (STP).`,devices:`L2 Коммутаторы (Switches), сетевые карты (NIC)`,cliTool:`ip link, arp -a, bridge fdb show`,headerFields:[`Dst MAC (48b)`,`Src MAC (48b)`,`802.1Q Tag (VLAN ID)`,`EtherType`,`FCS CRC-32`]},{id:1,level:`L1`,name:`Физический`,pdu:`Биты`,color:`text-amber-400`,glowColor:`rgba(251, 191, 36, 0.4)`,protocols:[`1000BASE-T`,`10GBASE-LR`,`Wi-Fi 6`,`SFP+`],description:`Передача сигналов по меди (витая пара), импульсов по оптоволокну (SMF/MMF) или радиоэфиру.`,devices:`SFP/SFP+ модули, оптические кроссы, рефлектометры (OTDR), патч-панели`,cliTool:`ethtool eth0, ip link show`,headerFields:[`Преамбула (7B)`,`SFD (1B)`,`Физические уровни напряжения/света`]}],be=({activeLevel:e=`L4`,onSelectLevel:t,onExploreTheory:n,onStartExamForLevel:r,compact:i=!1})=>{let[a,o]=(0,q.useState)(4),[s,c]=(0,q.useState)(`down`),[l,u]=(0,q.useState)(!0),[d,f]=(0,q.useState)(!1);(0,q.useEffect)(()=>{if(e){let t=parseInt(e.replace(/\D/g,``),10);!isNaN(t)&&t>=1&&t<=7&&o(t)}},[e]),(0,q.useEffect)(()=>{if(!l)return;let e=setInterval(()=>{o(e=>s===`down`?e<=1?(c(`up`),2):e-1:e>=7?(c(`down`),6):e+1)},2400);return()=>clearInterval(e)},[s,l]);let p=e=>{X(`selection`),u(!1),o(e.id),t&&t(e.level)},m=ye.find(e=>e.id===a)||ye[3];return(0,J.jsxs)(`div`,{className:`w-full select-none space-y-3`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between px-1 text-xs`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsxs)(`span`,{className:`font-bold text-white text-sm tracking-tight flex items-center gap-1.5`,children:[(0,J.jsx)(`span`,{children:`Путь пакета`}),(0,J.jsx)(`span`,{className:`w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse`})]}),(0,J.jsx)(`span`,{className:`text-[11px] text-slate-400 font-mono hidden sm:inline`,children:`(живая инкапсуляция)`})]}),(0,J.jsx)(`button`,{onClick:()=>{X(`light`),c(e=>e===`down`?`up`:`down`)},type:`button`,className:`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold hover:bg-cyan-900/60 transition-colors cursor-pointer`,title:`Сменить направление: инкапсуляция или декапсуляция`,children:s===`down`?(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(`span`,{children:`L7 → L1`}),(0,J.jsx)(h,{className:`w-3 h-3 text-cyan-400`})]}):(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(`span`,{children:`L1 → L7`}),(0,J.jsx)(w,{className:`w-3 h-3 text-cyan-400`})]})})]}),(0,J.jsxs)(`div`,{className:`relative rounded-2xl bg-[#091524] border border-cyan-500/20 p-2.5 sm:p-3 overflow-hidden shadow-2xl`,children:[(0,J.jsx)(`div`,{className:`absolute top-0 right-1/4 w-32 h-full bg-cyan-500/5 blur-2xl pointer-events-none`}),(0,J.jsx)(`div`,{className:`absolute top-5 bottom-5 right-[102px] sm:right-[130px] w-px border-l-2 border-dashed border-cyan-500/30 pointer-events-none z-0`,"aria-hidden":`true`}),(0,J.jsx)(`div`,{className:`space-y-1.5 relative z-10`,children:ye.map(e=>{let t=a===e.id;return(0,J.jsxs)(`div`,{onClick:()=>p(e),className:`relative group rounded-xl p-3 sm:px-4 sm:py-3 transition-all duration-200 cursor-pointer flex items-center justify-between border ${t?`bg-gradient-to-r from-cyan-950/90 via-slate-900 to-cyan-950/70 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50`:`bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300`}`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-3 min-w-0`,children:[(0,J.jsx)(`span`,{className:`font-mono font-black text-xs sm:text-sm tracking-tight w-6 shrink-0 ${t?`text-cyan-300 font-extrabold`:e.color}`,children:e.level}),(0,J.jsx)(`span`,{className:`text-xs sm:text-sm font-semibold truncate ${t?`text-white font-bold`:`text-slate-300`}`,children:e.name})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-3 shrink-0`,children:[(0,J.jsx)(`div`,{className:`relative w-6 h-6 flex items-center justify-center`,children:t?(0,J.jsxs)(`div`,{className:`relative flex items-center justify-center`,children:[(0,J.jsx)(`span`,{className:`absolute w-6 h-6 rounded-full bg-cyan-400/25 animate-ping`}),(0,J.jsx)(`div`,{className:`w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-[#091524] shadow-[0_0_12px_#22d3ee]`})]}):(0,J.jsx)(`div`,{className:`w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-cyan-500/40 transition-colors`})}),(0,J.jsx)(`span`,{className:`text-xs sm:text-sm font-mono w-16 sm:w-20 text-right ${t?`text-cyan-300 font-bold`:`text-slate-400`}`,children:e.pdu})]})]},e.id)})})]}),m&&(0,J.jsxs)(`div`,{className:`p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900/95 to-[#0b1b2d] border border-cyan-500/30 space-y-2.5 animate-fade-in text-xs`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(`span`,{className:`font-mono font-bold text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30`,children:m.level}),(0,J.jsxs)(`span`,{className:`font-bold text-white text-sm`,children:[m.name,` уровень`]})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5`,children:[n&&(0,J.jsx)(`button`,{onClick:()=>n(m.level),type:`button`,className:`px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer transition-colors`,children:`В теорию →`}),r&&(0,J.jsxs)(`button`,{onClick:()=>r(m.level),type:`button`,className:`px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold cursor-pointer transition-colors`,children:[`Тест `,m.level,` →`]})]})]}),(0,J.jsx)(`p`,{className:`text-slate-300 leading-relaxed text-[11px] sm:text-xs`,children:m.description}),(0,J.jsxs)(`div`,{className:`flex flex-wrap items-center gap-1.5 pt-0.5`,children:[(0,J.jsx)(`span`,{className:`text-[10px] uppercase font-mono text-slate-500 font-bold`,children:`Протоколы:`}),m.protocols.map(e=>(0,J.jsx)(`span`,{className:`text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-cyan-300 border border-cyan-500/20`,children:e},e))]}),(0,J.jsxs)(`div`,{className:`pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono`,children:[(0,J.jsxs)(`span`,{children:[`PDU: `,(0,J.jsx)(`strong`,{className:`text-white`,children:m.pdu})]}),(0,J.jsxs)(`span`,{className:`truncate max-w-[200px] text-right`,children:[`CLI: `,(0,J.jsx)(`code`,{className:`text-cyan-400`,children:m.cliTool.split(`,`)[0]})]})]})]})]})},xe=({soundEnabled:e,onNavigateToTheory:t})=>{let[n,r]=(0,q.useState)(null),[i,a]=(0,q.useState)(`mixed`),[s,c]=(0,q.useState)(10),[l,u]=(0,q.useState)(`instant`),[m,h]=(0,q.useState)([]),[g,_]=(0,q.useState)(!1),[v,y]=(0,q.useState)(null);(0,q.useEffect)(()=>{try{let e=localStorage.getItem(`osi_active_session`);if(e){let t=JSON.parse(e);!t.isCompleted&&t.questions&&t.questions.length>0&&(r(t),h(t.userAnswers[t.questions[t.currentIndex]?.id]||[]),_(t.submittedQuestions[t.questions[t.currentIndex]?.id]||!1))}}catch{}},[]),(0,q.useEffect)(()=>{if(n?.isCompleted&&n.questions){let e=[];if(n.questions.forEach(t=>{let r=n.userAnswers[t.id]||[];r.length===t.correct.length&&r.every(e=>t.correct.includes(e))||e.push(t.id)}),e.length>0)try{localStorage.setItem(`osi_last_mistakes`,JSON.stringify(e))}catch{}}},[n?.isCompleted]);let b=e=>{let t={questions:e||de(i,s),currentIndex:0,userAnswers:{},submittedQuestions:{},startTime:Date.now(),isCompleted:!1,mode:i,feedbackMode:l};r(t),h([]),_(!1),y(null);try{localStorage.setItem(`osi_active_session`,JSON.stringify(t))}catch{}},x=n?n.questions[n.currentIndex]:null,S=x?x.correct.length>1:!1,C=t=>{g&&n?.feedbackMode===`instant`||(X(`selection`),e&&_e(),h(S?e=>e.includes(t)?e.filter(e=>e!==t):[...e,t]:[t]))},w=()=>{if(!n||!x||m.length===0)return;let t=m.length===x.correct.length&&m.every(e=>x.correct.includes(e));X(t?`success`:`error`),e&&(t?he():ge());let i={...n.userAnswers,[x.id]:m},a={...n.submittedQuestions,[x.id]:!0};_(!0);let o={...n,userAnswers:i,submittedQuestions:a};r(o);try{localStorage.setItem(`osi_active_session`,JSON.stringify(o))}catch{}n.feedbackMode===`exam`&&E(o)},E=(e=n)=>{if(!e)return;let t=e.currentIndex+1;if(t>=e.questions.length){let t={...e,isCompleted:!0,endTime:Date.now()};r(t);try{localStorage.removeItem(`osi_active_session`)}catch{}return}let i=e.questions[t],a=e.userAnswers[i.id]||[],o=e.submittedQuestions[i.id]||!1;r({...e,currentIndex:t}),h(a),_(o)},D=()=>{r(null),h([]),_(!1);try{localStorage.removeItem(`osi_active_session`)}catch{}},[O,k]=(0,q.useState)([]);if((0,q.useEffect)(()=>{try{let e=localStorage.getItem(`osi_last_mistakes`);if(e){let t=JSON.parse(e);if(Array.isArray(t)){let e=Y.filter(e=>t.includes(e.id));k(e)}}}catch{}},[]),!n||!x)return(0,J.jsxs)(`div`,{className:`space-y-5 max-w-3xl mx-auto pb-16 lg:pb-6 animate-fade-in`,children:[(0,J.jsx)(ve,{mistakesCount:O.length,totalQuestionsCount:Y.length,onStartExam:()=>b(),onReviewMistakes:()=>{let e=O.length>0?O:Y.slice(0,14);b(e)},onOpenVisualL1:()=>{a(`visual-l1`);let e=Y.filter(e=>e.group===`visual-l1`).slice(0,20);b(e)}}),(0,J.jsx)(be,{onSelectLevel:e=>{e===`L1`||e===`L2`?a(`l1-l2`):e===`L3`?a(`l3`):e===`L4`?a(`l4`):(e===`L5`||e===`L6`||e===`L7`)&&a(`l5-l7`)},onExploreTheory:e=>{if(t){let n=Y.find(t=>t.topic.includes(e)||t.group.includes(e.toLowerCase()));t(n?n.id:`l3-01`)}},onStartExamForLevel:e=>{let t=`mixed`;e===`L1`||e===`L2`?t=`l1-l2`:e===`L3`?t=`l3`:e===`L4`?t=`l4`:(e===`L5`||e===`L6`||e===`L7`)&&(t=`l5-l7`),a(t),b(de(t,s))}}),(0,J.jsxs)(`div`,{className:`p-5 sm:p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-4`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,J.jsxs)(`h2`,{className:`text-sm sm:text-base font-bold text-white flex items-center gap-2`,children:[(0,J.jsx)(K,{className:`w-4 h-4 text-cyan-400`}),(0,J.jsx)(`span`,{children:`Параметры тестирования`})]}),(0,J.jsxs)(`span`,{className:`text-[11px] font-mono text-cyan-400 font-bold`,children:[ue.find(e=>e.id===i)?.count||502,` вопр. в пуле`]})]}),(0,J.jsxs)(`div`,{className:`space-y-4`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`label`,{className:`block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2`,children:`Выберите раздел знаний`}),(0,J.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-3`,children:ue.map(e=>{let t=i===e.id;return(0,J.jsxs)(`button`,{onClick:()=>a(e.id),type:`button`,className:`p-4 rounded-2xl text-left border transition-all cursor-pointer min-h-[76px] flex flex-col justify-between ${t?`bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/20`:`bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300`}`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between w-full mb-1`,children:[(0,J.jsx)(`span`,{className:`font-bold text-sm text-white`,children:e.title}),(0,J.jsxs)(`span`,{className:`text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-cyan-400`,children:[e.count,` вопр.`]})]}),(0,J.jsx)(`p`,{className:`text-xs text-slate-400 line-clamp-1`,children:e.subtitle})]},e.id)})})]}),(0,J.jsxs)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`label`,{className:`block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2`,children:`Количество вопросов`}),(0,J.jsx)(`div`,{className:`grid grid-cols-4 gap-2`,children:[10,20,50,100].map(e=>(0,J.jsx)(`button`,{onClick:()=>c(e),type:`button`,className:`py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer min-h-[44px] ${s===e?`bg-cyan-500 text-slate-950 border-cyan-400`:`bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700`}`,children:e},e))})]}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`label`,{className:`block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2`,children:`Режим проверки`}),(0,J.jsxs)(`div`,{className:`grid grid-cols-2 gap-2`,children:[(0,J.jsxs)(`button`,{onClick:()=>u(`instant`),type:`button`,className:`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${l===`instant`?`bg-cyan-950/60 border-cyan-400 text-cyan-300`:`bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700`}`,children:[(0,J.jsx)(`span`,{children:`Тренажёр`}),(0,J.jsx)(`span`,{className:`text-[10px] text-slate-400`,children:`Объяснение сразу`})]}),(0,J.jsxs)(`button`,{onClick:()=>u(`exam`),type:`button`,className:`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center ${l===`exam`?`bg-cyan-950/60 border-cyan-400 text-cyan-300`:`bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700`}`,children:[(0,J.jsx)(`span`,{children:`Экзамен`}),(0,J.jsx)(`span`,{className:`text-[10px] text-slate-400`,children:`Результат в конце`})]})]})]})]}),(0,J.jsx)(`div`,{className:`pt-4`,children:(0,J.jsxs)(`button`,{onClick:()=>b(),type:`button`,className:`w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 font-black text-sm sm:text-base tracking-wide hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25 cursor-pointer min-h-[52px]`,children:[(0,J.jsx)(`span`,{children:`Начать экзамен`}),(0,J.jsx)(d,{className:`w-5 h-5`})]})})]})]})]});if(n.isCompleted){let e=n.questions.length,r=0,i=[];n.questions.forEach(e=>{let t=n.userAnswers[e.id]||[];t.length===e.correct.length&&t.every(t=>e.correct.includes(t))?r++:i.push(e)});let a=Math.round(r/e*100),s=a>=80;return(0,J.jsxs)(`div`,{className:`space-y-6 max-w-4xl mx-auto animate-fade-in`,children:[(0,J.jsxs)(`div`,{className:`p-8 rounded-3xl border shadow-2xl text-center space-y-4 ${s?`bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500/40`:`bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500/40`}`,children:[(0,J.jsx)(`div`,{className:`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-3xl shadow-xl ${s?`bg-emerald-500/20 text-emerald-300 border border-emerald-400/50`:`bg-rose-500/20 text-rose-300 border border-rose-400/50`}`,children:s?(0,J.jsx)(f,{className:`w-10 h-10`}):(0,J.jsx)(z,{className:`w-10 h-10`})}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full ${s?`bg-emerald-500/20 text-emerald-300`:`bg-rose-500/20 text-rose-300`}`,children:s?`Экзамен сдан (зачёт от 80%)`:`Экзамен не сдан (порог 80%)`}),(0,J.jsxs)(`h2`,{className:`text-3xl sm:text-4xl font-black text-white mt-2`,children:[r,` из `,e,` правильных ответов`]}),(0,J.jsxs)(`div`,{className:`text-4xl font-black font-mono text-cyan-300 mt-1`,children:[a,`%`]})]}),(0,J.jsxs)(`div`,{className:`pt-2 flex flex-wrap justify-center gap-3`,children:[(0,J.jsxs)(`button`,{onClick:()=>b(),type:`button`,className:`py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20`,children:[(0,J.jsx)(z,{className:`w-4 h-4`}),`Пройти заново`]}),i.length>0&&(0,J.jsxs)(`button`,{onClick:()=>b(i),type:`button`,className:`py-3 px-6 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all flex items-center gap-2 min-h-[48px] cursor-pointer`,children:[(0,J.jsx)(o,{className:`w-4 h-4`}),`Повторить только ошибки (`,i.length,`)`]}),(0,J.jsx)(`button`,{onClick:D,type:`button`,className:`py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all min-h-[48px] cursor-pointer`,children:`К выбору тем`})]})]}),i.length>0&&(0,J.jsxs)(`div`,{className:`p-6 rounded-3xl glass-panel border border-slate-800 space-y-4`,children:[(0,J.jsxs)(`h3`,{className:`text-lg font-bold text-white flex items-center gap-2`,children:[(0,J.jsx)(I,{className:`w-5 h-5 text-rose-400`}),`Разбор ошибок (`,i.length,`)`]}),(0,J.jsx)(`div`,{className:`space-y-4`,children:i.map((e,r)=>(0,J.jsxs)(`div`,{className:`p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-rose-500/30 space-y-3`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between text-xs`,children:[(0,J.jsx)(`span`,{className:`px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono`,children:e.topic}),(0,J.jsxs)(`span`,{className:`text-slate-500 font-mono text-[10px]`,children:[`#`,e.id]})]}),(0,J.jsx)(`h4`,{className:`text-sm font-semibold text-white`,children:e.text}),(0,J.jsx)(`div`,{className:`space-y-1.5 pt-1`,children:e.answers.map((t,r)=>{let i=e.correct.includes(r),a=(n.userAnswers[e.id]||[]).includes(r),o=`border-slate-800 text-slate-400`;return i?o=`border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-semibold`:a&&(o=`border-rose-500/60 bg-rose-950/40 text-rose-300 line-through`),(0,J.jsxs)(`div`,{className:`p-2.5 rounded-xl border text-xs flex items-center justify-between ${o}`,children:[(0,J.jsx)(`span`,{children:t}),i&&(0,J.jsx)(`span`,{className:`text-[10px] font-bold text-emerald-400 font-mono uppercase`,children:`Правильно`}),a&&!i&&(0,J.jsx)(`span`,{className:`text-[10px] font-bold text-rose-400 font-mono uppercase`,children:`Ваш ответ`})]},r)})}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-black/40 border border-slate-800 text-xs text-slate-300 leading-relaxed`,children:[(0,J.jsx)(`strong`,{className:`block text-cyan-300 mb-0.5`,children:`Пояснение:`}),e.explanation]}),(0,J.jsxs)(`div`,{className:`pt-1 flex items-center justify-between`,children:[(0,J.jsxs)(`button`,{onClick:()=>t?.(e.id),type:`button`,className:`py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-400/40 text-cyan-300 hover:text-white hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/20 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer`,children:[(0,J.jsx)(T,{className:`w-3.5 h-3.5 text-cyan-400`}),(0,J.jsx)(`span`,{children:`📖 Подробный разбор в Теории →`})]}),(0,J.jsxs)(`span`,{className:`text-[11px] text-slate-500 font-mono hidden sm:inline`,children:[`Анализ темы «`,e.topic,`»`]})]})]},e.id))})]})]})}let A=Math.round((n.currentIndex+1)/n.questions.length*100);return(0,J.jsxs)(`div`,{className:`space-y-6 max-w-3xl mx-auto animate-fade-in`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between text-xs text-slate-400 font-mono`,children:[(0,J.jsx)(`button`,{onClick:D,type:`button`,className:`hover:text-rose-400 transition-colors py-1 cursor-pointer`,children:`← Выйти в меню`}),(0,J.jsxs)(`span`,{className:`font-bold text-white`,children:[`Вопрос `,n.currentIndex+1,` из `,n.questions.length]}),(0,J.jsxs)(`span`,{className:`text-cyan-400 font-bold`,children:[A,`%`]})]}),(0,J.jsx)(`div`,{className:`w-full h-2 rounded-full bg-slate-800 overflow-hidden`,children:(0,J.jsx)(`div`,{className:`h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-full`,style:{width:`${A}%`}})}),(0,J.jsxs)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6`,children:[(0,J.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-2`,children:[(0,J.jsx)(`span`,{className:`px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-bold text-xs font-mono`,children:x.topic}),(0,J.jsx)(`span`,{className:`text-xs font-semibold text-amber-300 font-mono`,children:S?`✦ Выберите все подходящие ответы`:`✦ Выберите один правильный ответ`})]}),(0,J.jsx)(`h2`,{className:`text-lg sm:text-xl font-bold text-white leading-relaxed`,children:x.text}),x.image&&(0,J.jsxs)(`div`,{className:`rounded-2xl overflow-hidden border border-slate-700 bg-black/60 p-2`,children:[(0,J.jsx)(`img`,{src:fe(x.image),alt:x.imageAlt||`Фото оборудования к вопросу`,className:`max-h-80 w-full object-contain rounded-xl mx-auto`,loading:`lazy`,onError:e=>{e.target.style.display=`none`}}),x.imageAlt&&(0,J.jsx)(`p`,{className:`text-[11px] text-slate-400 text-center mt-1.5 font-mono`,children:x.imageAlt})]}),(0,J.jsx)(`div`,{className:`space-y-2.5`,children:x.answers.map((e,t)=>{let r=m.includes(t),i=x.correct.includes(t),a=`bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200`;return g&&n.feedbackMode===`instant`?i?a=`bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium shadow-md shadow-emerald-500/10`:r&&!i&&(a=`bg-rose-950/60 border-rose-500 text-rose-200`):r&&(a=`bg-cyan-950/70 border-cyan-400 text-cyan-100 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10`),(0,J.jsxs)(`button`,{onClick:()=>C(t),type:`button`,className:`w-full p-4 rounded-2xl text-left border transition-all flex items-center gap-3 cursor-pointer min-h-[56px] ${a}`,children:[(0,J.jsx)(`div`,{className:`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-colors ${g&&n.feedbackMode===`instant`?i?`bg-emerald-500 text-slate-950`:r?`bg-rose-500 text-slate-950`:`bg-slate-800 text-slate-500`:r?`bg-cyan-500 text-slate-950`:`bg-slate-800 text-slate-400`}`,children:g&&n.feedbackMode===`instant`?i?`✓`:r?`✕`:String.fromCharCode(65+t):String.fromCharCode(65+t)}),(0,J.jsx)(`span`,{className:`text-xs sm:text-sm leading-relaxed flex-1`,children:e})]},t)})}),g&&n.feedbackMode===`instant`&&(0,J.jsxs)(`div`,{className:`p-4 sm:p-5 rounded-2xl bg-[#091725] border border-cyan-500/30 space-y-3 animate-fade-in`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between gap-2`,children:[(0,J.jsx)(`span`,{className:`text-xs font-bold uppercase tracking-wider text-cyan-400`,children:`Подробное объяснение`}),(0,J.jsxs)(`button`,{onClick:()=>t?.(x.id),type:`button`,className:`text-xs font-bold text-cyan-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer shrink-0`,children:[(0,J.jsx)(T,{className:`w-3.5 h-3.5 text-cyan-400`}),(0,J.jsx)(`span`,{children:`Разбор в Теории →`})]})]}),(0,J.jsx)(`p`,{className:`text-xs sm:text-sm text-slate-300 leading-relaxed`,children:x.explanation}),x.remember&&(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-amber-950/30 border-l-4 border-amber-400 text-xs text-amber-200`,children:[(0,J.jsx)(`strong`,{className:`block text-amber-300 font-bold mb-0.5`,children:`Важно запомнить:`}),x.remember]})]}),(0,J.jsxs)(`div`,{className:`pt-2 flex items-center justify-between gap-3`,children:[(0,J.jsx)(`div`,{className:`text-[11px] text-slate-500 font-mono hidden sm:block`,children:`Подсказка: клавиши A, B, C, D или клик мышью`}),g?(0,J.jsxs)(`button`,{onClick:()=>E(),type:`button`,className:`w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] transition-all min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2`,children:[(0,J.jsx)(`span`,{children:n.currentIndex+1>=n.questions.length?`Посмотреть результаты`:`Следующий вопрос`}),(0,J.jsx)(p,{className:`w-4 h-4`})]}):(0,J.jsx)(`button`,{onClick:w,disabled:m.length===0,type:`button`,className:`w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] disabled:opacity-40 transition-all min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20`,children:`Ответить`})]})]})]})};function Se(e){return e===0?0:4294967295<<32-e>>>0}function Z(e){return e>>>=0,[e>>>24&255,e>>>16&255,e>>>8&255,e&255].join(`.`)}function Q(e){return e.trim().split(`.`).reduce((e,t)=>(e<<8|Number(t))>>>0,0)}function $(e){return Z(Se(e))}function Ce(e,t){let n=Q(e),r=Se(t),i=(n&r)>>>0,a=(i|~r>>>0)>>>0,o=2**(32-t),s=t>=31?t===31?2:1:Math.max(0,o-2),c=t>=31?i:i+1>>>0,l=t>=31?a:a-1>>>0,u=Z(~r>>>0);return{ip:e,prefix:t,mask:$(t),wildcard:u,network:Z(i),broadcast:Z(a),first:Z(c),last:Z(l),total:o,usable:s}}function we(e){let t=Math.floor(e/8)+1,n=e%8;if(n===0)return{octet:Math.max(1,t-1),mask:255,step:1};let r=256-2**(8-n);return{octet:t,mask:r,step:256-r}}var Te=({soundEnabled:e,initialPrefix:t,initialSubTab:n})=>{let[r,i]=(0,q.useState)(n||`practice`),[a,o]=(0,q.useState)(`network`),[s,c]=(0,q.useState)([1,1,1,1,0,0,0,0]),l=[128,64,32,16,8,4,2,1],u=s.reduce((e,t,n)=>e+t*l[n],0),[f,p]=(0,q.useState)(`192.168.10.45`),[m,h]=(0,q.useState)(t||27);(0,q.useEffect)(()=>{t&&h(t),n&&i(n)},[t,n]);let[g,_]=(0,q.useState)(null),[y,b]=(0,q.useState)(``),[x,S]=(0,q.useState)(!1),[C,w]=(0,q.useState)(!1),[E,D]=(0,q.useState)(1),[O,k]=(0,q.useState)(0),A=e=>{let t=[24,25,26,27,28,29,30,23,22,21,20,19,18,17,16],n=t[Math.floor(Math.random()*t.length)],r=[10,172,192][Math.floor(Math.random()*3)],i=`${r}.${r===10?Math.floor(Math.random()*255):r===172?16+Math.floor(Math.random()*16):168}.${Math.floor(Math.random()*254)}.${1+Math.floor(Math.random()*253)}`,a=Ce(i,n),o=we(n);switch(e){case`cidr-to-mask`:{let e=$(n),t=[$(Math.max(8,n-1)),$(Math.min(30,n+1)),$(Math.min(30,n+2))].filter(t=>t!==e),r=Array.from(new Set([e,...t])).slice(0,4);return r.sort(()=>Math.random()-.5),{question:`Какая маска подсети соответствует префиксу /${n}?`,hint:`Количество единичных бит слева: ${n}`,correctAnswer:e,options:r,explanation:`Префикс /${n} означает, что первые ${n} бит равны 1, а оставшиеся ${32-n} бит равны 0. В десятичном виде это ${e}.`,stepFormula:`Шаг в октете №${o.octet}: 256 − ${o.mask} = ${o.step}`}}case`mask-to-cidr`:{let e=$(n),t=`/${n}`,r=[`/${n}`,`/${Math.max(8,n-1)}`,`/${Math.min(30,n+1)}`,`/${Math.min(30,n+2)}`].sort(()=>Math.random()-.5);return{question:`Какой префикс CIDR соответствует маске ${e}?`,hint:`Подсчитайте число установленных бит в каждом октете`,correctAnswer:t,options:r,explanation:`Маска ${e} содержит ровно ${n} единичных бит, поэтому префикс равен /${n}.`}}case`step`:{let e=String(o.step),t=[String(o.step*2),String(Math.max(2,Math.floor(o.step/2))),String(o.step+4)].filter(t=>t!==e),r=Array.from(new Set([e,...t])).slice(0,4);return r.sort(()=>Math.random()-.5),{question:`Чему равен «шаг сети» (магическое число) для префикса /${n}?`,hint:`Октет изменения №${o.octet}, значение маски в октете: ${o.mask}`,correctAnswer:e,options:r,explanation:`Правило: Шаг = 256 − октет маски. В октете №${o.octet} значение ${o.mask}. Значит шаг = 256 − ${o.mask} = ${o.step}.`,stepFormula:`Шаг = 256 − ${o.mask} = ${o.step}`}}case`network`:{let e=a.network,t=Z(Q(a.network)+(o.step>1?o.step:2)>>>0),r=Z(Math.max(0,Q(a.network)-8)>>>0),s=a.broadcast,c=Array.from(new Set([e,t,r,s])).slice(0,4);return c.sort(()=>Math.random()-.5),{question:`Определите адрес сети для хоста ${i}/${n}:`,hint:`Октет №${o.octet}, шаг сети = ${o.step}`,correctAnswer:e,options:c,explanation:`В октете №${o.octet} шаг равен ${o.step}. Ближайшая снизу граница, кратная ${o.step}, дает адрес сети: ${a.network}.`,stepFormula:`Сеть: ${a.network}, Шаг: ${o.step}`}}case`broadcast`:{let e=a.broadcast,t=a.network,r=a.last,s=Z(Q(a.broadcast)+o.step>>>0),c=Array.from(new Set([e,t,r,s])).slice(0,4);return c.sort(()=>Math.random()-.5),{question:`Какой широковещательный адрес (Broadcast) для подсети ${i}/${n}?`,hint:`Broadcast = следующий адрес сети минус 1`,correctAnswer:e,options:c,explanation:`Следующая подсеть начинается с ${Z(Q(a.network)+(o.step<<8*(4-o.octet))>>>0)}. Значит последний адрес (Broadcast) этой подсети равен ${a.broadcast}.`}}case`first-host`:{let e=a.first,t=Array.from(new Set([e,a.network,a.last,a.broadcast])).slice(0,4);return t.sort(()=>Math.random()-.5),{question:`Укажите первый пригодный IP-адрес для хоста в подсети ${i}/${n}:`,hint:`Первый хост = адрес сети + 1`,correctAnswer:e,options:t,explanation:`Адрес сети ${a.network} зарезервирован. Первый адрес для устройства (хоста или шлюза) — это ${a.first}.`}}case`last-host`:{let e=a.last,t=Array.from(new Set([e,a.broadcast,a.first,a.network])).slice(0,4);return t.sort(()=>Math.random()-.5),{question:`Укажите последний пригодный IP-адрес для хоста в подсети ${i}/${n}:`,hint:`Последний хост = Broadcast − 1`,correctAnswer:e,options:t,explanation:`Широковещательный адрес ${a.broadcast} занят под broadcast. Последний пригодный адрес для хоста — это ${a.last}.`}}case`same-subnet`:{let e=Math.random()>.5,t=``;t=e?a.first:Z(Q(a.broadcast)+2>>>0);let r=e?`Да, в одной подсети`:`Нет, в разных подсетях`;return{question:`Находятся ли хосты ${i} и ${t} в одной подсети с маской /${n}?`,hint:`Сравните сетевую часть обоих адресов с шагом ${o.step}`,correctAnswer:r,options:[`Да, в одной подсети`,`Нет, в разных подсетях`],explanation:e?`Оба адреса попадают в диапазон сети ${a.network}/${n} (от ${a.first} до ${a.last}). Они могут общаться напрямую по L2 без маршрутизатора.`:`Адрес ${i} принадлежит сети ${a.network}/${n}, а адрес ${t} находится за пределами этой сети. Связь между ними возможна только через L3-маршрутизатор (шлюз).`}}case`gateway-or-direct`:{let e=Math.random()>.5,t=e?a.first:Z(Q(a.broadcast)+4>>>0),r=e?`Напрямую по L2 (ARP)`:`Через шлюз по умолчанию (L3)`;return{question:`Хост ${i}/${n} отправляет пакет на адрес ${t}. Как пойдет доставка?`,hint:`Определите, локальный ли это узел или внешняя подсеть`,correctAnswer:r,options:[`Напрямую по L2 (ARP)`,`Через шлюз по умолчанию (L3)`],explanation:e?`Узел ${t} находится в той же подсети ${a.network}/${n}. Хост находит его MAC через ARP и отправляет кадр напрямую через коммутатор L2.`:`Узел ${t} находится в чужой подсети. Хост отправляет пакет на MAC-адрес своего шлюза по умолчанию для дальнейшей L3-маршрутизации.`}}default:return{question:`Какая маска для /${n}?`,hint:``,correctAnswer:$(n),options:[$(n)],explanation:``}}};(0,q.useEffect)(()=>{_(A(a)),b(``),S(!1)},[a]);let j=t=>{x||(e&&_e(),b(t))},M=()=>{if(!g||!y||x)return;let t=y===g.correctAnswer;w(t),S(!0),e&&(t?he():ge()),t&&k(e=>e+1)},N=()=>{D(e=>e+1),_(A(a)),b(``),S(!1)},P=t=>{let n=Array(8).fill(0).map((e,n)=>+(n<t));c(n),e&&_e()},F=t=>{let n=s.filter(e=>e===1).length===t+1?t:t+1,r=Array.from({length:8},(e,t)=>+(t<n));c(r),e&&_e()},L=Ce(f,m);return(0,J.jsxs)(`div`,{className:`space-y-6`,children:[(0,J.jsx)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl relative overflow-hidden`,children:(0,J.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-4`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsxs)(`div`,{className:`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2`,children:[(0,J.jsx)(ae,{className:`w-3.5 h-3.5`}),`IPv4 без магии · Считаем подсети в уме`]}),(0,J.jsx)(`h1`,{className:`text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight`,children:`Интерактивный тренажёр IPv4 и CIDR`}),(0,J.jsxs)(`p`,{className:`text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed`,children:[`Золотое правило быстрого расчёта в уме: `,(0,J.jsx)(`strong`,{className:`text-cyan-300`,children:`Шаг сети = 256 − октет маски`}),`. Например, /27 → 255.255.255.224 → 256 − 224 = 32. Подсети: 0, 32, 64, 96, 128...`]})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800`,children:[(0,J.jsx)(`button`,{onClick:()=>i(`practice`),type:`button`,className:`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${r===`practice`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md`:`text-slate-400 hover:text-white`}`,children:`Тренировка навыков`}),(0,J.jsx)(`button`,{onClick:()=>i(`calculator`),type:`button`,className:`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${r===`calculator`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md`:`text-slate-400 hover:text-white`}`,children:`Калькулятор`}),(0,J.jsx)(`button`,{onClick:()=>i(`bits`),type:`button`,className:`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${r===`bits`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md`:`text-slate-400 hover:text-white`}`,children:`8 Битов октета`}),(0,J.jsx)(`button`,{onClick:()=>i(`cheatsheet`),type:`button`,className:`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${r===`cheatsheet`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md`:`text-slate-400 hover:text-white`}`,children:`Таблица CIDR`})]})]})}),r===`practice`&&(0,J.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-12 gap-6`,children:[(0,J.jsxs)(`div`,{className:`lg:col-span-4 space-y-3`,children:[(0,J.jsxs)(`div`,{className:`p-4 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-3`,children:[(0,J.jsx)(`h3`,{className:`text-xs font-bold uppercase tracking-wider text-slate-400`,children:`1. Базовые навыки и границы`}),(0,J.jsx)(`div`,{className:`grid grid-cols-1 gap-1.5`,children:[{id:`cidr-to-mask`,label:`CIDR → Маска`},{id:`mask-to-cidr`,label:`Маска → CIDR`},{id:`step`,label:`Шаг сети (магическое число)`},{id:`network`,label:`Адрес сети`},{id:`broadcast`,label:`Широковещательный адрес (Broadcast)`}].map(e=>(0,J.jsx)(`button`,{onClick:()=>o(e.id),type:`button`,className:`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer min-h-[42px] ${a===e.id?`bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20`:`bg-slate-900/60 text-slate-300 hover:bg-slate-800`}`,children:e.label},e.id))}),(0,J.jsx)(`h3`,{className:`text-xs font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-800`,children:`2. Практика хостов и доставка`}),(0,J.jsx)(`div`,{className:`grid grid-cols-1 gap-1.5`,children:[{id:`first-host`,label:`Первый хост`},{id:`last-host`,label:`Последний хост`},{id:`same-subnet`,label:`В одной ли подсети?`},{id:`gateway-or-direct`,label:`Напрямую или через шлюз?`}].map(e=>(0,J.jsx)(`button`,{onClick:()=>o(e.id),type:`button`,className:`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer min-h-[42px] ${a===e.id?`bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20`:`bg-slate-900/60 text-slate-300 hover:bg-slate-800`}`,children:e.label},e.id))})]}),(0,J.jsxs)(`div`,{className:`p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs font-mono`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-400 block text-[10px] uppercase`,children:`Текущий раунд`}),(0,J.jsxs)(`span`,{className:`text-white font-bold text-sm`,children:[`Задание #`,E]})]}),(0,J.jsxs)(`div`,{className:`text-right`,children:[(0,J.jsx)(`span`,{className:`text-slate-400 block text-[10px] uppercase`,children:`Правильных`}),(0,J.jsxs)(`span`,{className:`text-emerald-400 font-bold text-sm`,children:[O,` верно`]})]})]})]}),(0,J.jsx)(`div`,{className:`lg:col-span-8 p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6`,children:g?(0,J.jsxs)(J.Fragment,{children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,J.jsxs)(`span`,{className:`px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold`,children:[`Навык: `,a]}),(0,J.jsxs)(`span`,{className:`text-xs text-slate-400 font-mono`,children:[`Задание `,E]})]}),(0,J.jsx)(`h2`,{className:`text-lg sm:text-xl font-black text-white leading-relaxed`,children:g.question}),g.hint&&(0,J.jsxs)(`p`,{className:`text-xs text-amber-300 font-mono bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20`,children:[`💡 Подсказка: `,g.hint]}),(0,J.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-3`,children:g.options.map((e,t)=>{let n=y===e,r=e===g.correctAnswer,i=`bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-200`;return x?r?i=`bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-500/20`:n&&!r&&(i=`bg-rose-950/70 border-rose-500 text-rose-200`):n&&(i=`bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400`),(0,J.jsxs)(`button`,{onClick:()=>j(e),type:`button`,className:`p-4 rounded-2xl text-left border transition-all cursor-pointer min-h-[58px] flex items-center justify-between ${i}`,children:[(0,J.jsx)(`span`,{className:`font-mono text-xs sm:text-sm`,children:e}),x&&r&&(0,J.jsx)(v,{className:`w-5 h-5 text-emerald-400 flex-shrink-0`}),x&&n&&!r&&(0,J.jsx)(I,{className:`w-5 h-5 text-rose-400 flex-shrink-0`})]},t)})}),x&&(0,J.jsxs)(`div`,{className:`p-5 rounded-2xl border space-y-2 animate-fade-in ${C?`bg-emerald-950/40 border-emerald-500/40 text-emerald-200`:`bg-rose-950/40 border-rose-500/40 text-rose-200`}`,children:[(0,J.jsx)(`div`,{className:`flex items-center gap-2 font-bold text-sm`,children:C?(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(v,{className:`w-5 h-5 text-emerald-400`}),(0,J.jsx)(`span`,{children:`Правильно! Отличный результат.`})]}):(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(I,{className:`w-5 h-5 text-rose-400`}),(0,J.jsxs)(`span`,{children:[`Неверно. Правильный ответ: `,g.correctAnswer]})]})}),(0,J.jsx)(`p`,{className:`text-xs text-slate-300 leading-relaxed`,children:g.explanation}),g.stepFormula&&(0,J.jsx)(`div`,{className:`mt-2 p-2 rounded-lg bg-black/40 font-mono text-cyan-300 text-xs`,children:g.stepFormula})]}),(0,J.jsx)(`div`,{className:`pt-2 flex justify-end gap-3`,children:x?(0,J.jsxs)(`button`,{onClick:N,type:`button`,className:`py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] transition-all min-h-[48px] shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-2`,children:[(0,J.jsx)(`span`,{children:`Следующее задание`}),(0,J.jsx)(d,{className:`w-4 h-4`})]}):(0,J.jsx)(`button`,{onClick:M,disabled:!y,type:`button`,className:`py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] disabled:opacity-40 transition-all min-h-[48px] shadow-lg shadow-cyan-500/20 cursor-pointer`,children:`Проверить ответ`})})]}):null})]}),r===`calculator`&&(0,J.jsxs)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsxs)(`h2`,{className:`text-xl font-bold text-white flex items-center gap-2`,children:[(0,J.jsx)(ae,{className:`w-5 h-5 text-cyan-400`}),`Интерактивный калькулятор подсетей IPv4`]}),(0,J.jsx)(`p`,{className:`text-xs text-slate-400 mt-1`,children:`Введите любой IPv4-адрес и выберите маску / CIDR для мгновенного математического разбора`})]}),(0,J.jsxs)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 gap-4`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`label`,{className:`block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5`,children:`IP-адрес хоста`}),(0,J.jsx)(`input`,{type:`text`,value:f,onChange:e=>p(e.target.value),placeholder:`192.168.1.10`,className:`w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors`})]}),(0,J.jsxs)(`div`,{children:[(0,J.jsxs)(`label`,{className:`block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5`,children:[`Префикс маски: /`,m,` (`,$(m),`)`]}),(0,J.jsx)(`input`,{type:`range`,min:`8`,max:`30`,value:m,onChange:e=>h(Number(e.target.value)),className:`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-3`}),(0,J.jsxs)(`div`,{className:`flex justify-between text-[10px] text-slate-500 font-mono mt-1`,children:[(0,J.jsx)(`span`,{children:`/8 (Class A)`}),(0,J.jsx)(`span`,{children:`/16 (Class B)`}),(0,J.jsx)(`span`,{children:`/24 (Class C)`}),(0,J.jsx)(`span`,{children:`/30 (P2P)`})]})]})]}),(0,J.jsx)(`div`,{className:`p-5 rounded-2xl bg-[#060f1b] border border-cyan-500/30 space-y-4 font-mono text-xs`,children:(0,J.jsxs)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4`,children:[(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-slate-500 text-[10px] uppercase block`,children:`Адрес сети (Network)`}),(0,J.jsx)(`span`,{className:`text-cyan-300 font-bold text-sm`,children:L.network})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-slate-500 text-[10px] uppercase block`,children:`Broadcast адрес`}),(0,J.jsx)(`span`,{className:`text-rose-300 font-bold text-sm`,children:L.broadcast})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-slate-500 text-[10px] uppercase block`,children:`Маска подсети`}),(0,J.jsx)(`span`,{className:`text-white font-bold text-sm`,children:L.mask})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-slate-500 text-[10px] uppercase block`,children:`Диапазон хостов`}),(0,J.jsxs)(`span`,{className:`text-emerald-300 font-bold text-xs`,children:[L.first,` — `,L.last]})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-slate-500 text-[10px] uppercase block`,children:`Всего адресов / Хостов`}),(0,J.jsxs)(`span`,{className:`text-purple-300 font-bold text-sm`,children:[L.total,` (`,L.usable,` для хостов)`]})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-slate-500 text-[10px] uppercase block`,children:`Инверсная маска (Wildcard)`}),(0,J.jsx)(`span`,{className:`text-amber-300 font-bold text-sm`,children:L.wildcard})]})]})})]}),r===`bits`&&(0,J.jsxs)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-xs font-mono font-bold uppercase tracking-wider text-cyan-400`,children:`Пойми один октет маски`}),(0,J.jsx)(`h2`,{className:`text-xl font-bold text-white mt-1`,children:`8 Битов и веса позиций: 128, 64, 32, 16, 8, 4, 2, 1`}),(0,J.jsxs)(`p`,{className:`text-xs text-slate-400 mt-1`,children:[`В маске сети перед `,(0,J.jsx)(`code`,{className:`text-cyan-300 font-bold`,children:`1`}),` не может стоять `,(0,J.jsx)(`code`,{className:`text-slate-300 font-bold`,children:`0`}),`. При клике на любой бит (например, 2 или 1) все биты левее автоматически становятся единицами.`]})]}),(0,J.jsxs)(`div`,{className:`p-6 rounded-2xl bg-[#060f1b] border border-cyan-500/30 space-y-6`,children:[(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2 max-w-xl mx-auto`,children:[(0,J.jsx)(`span`,{className:`text-cyan-400 font-bold text-sm`,children:`💡`}),(0,J.jsxs)(`p`,{className:`leading-relaxed`,children:[(0,J.jsx)(`strong`,{children:`Правило непрерывности:`}),` маска подсети — это сплошной ряд единиц слева направо. Нажатие на бит `,(0,J.jsx)(`span`,{className:`font-mono text-cyan-300`,children:`2`}),` заполнит 7 бит (254), а на `,(0,J.jsx)(`span`,{className:`font-mono text-cyan-300`,children:`1`}),` — все 8 бит (255).`]})]}),(0,J.jsx)(`div`,{className:`grid grid-cols-8 gap-2 max-w-xl mx-auto`,children:s.map((e,t)=>(0,J.jsxs)(`div`,{className:`flex flex-col items-center gap-1.5`,children:[(0,J.jsx)(`span`,{className:`text-[10px] font-mono text-slate-500`,children:l[t]}),(0,J.jsx)(`button`,{onClick:()=>F(t),type:`button`,title:`Бит веса ${l[t]}: кликните для установки маски до этой позиции`,className:`w-full aspect-square rounded-xl flex items-center justify-center font-mono font-black text-base sm:text-xl border transition-all cursor-pointer ${e===1?`bg-cyan-500 border-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30 scale-105`:`bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500`}`,children:e}),(0,J.jsxs)(`span`,{className:`text-[9px] font-mono text-slate-400`,children:[`2^`,7-t]})]},t))}),(0,J.jsxs)(`div`,{className:`grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-center pt-2`,children:[(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-[10px] text-slate-400 uppercase tracking-wider block`,children:`Двоичный октет`}),(0,J.jsx)(`code`,{className:`text-cyan-400 font-mono font-bold text-sm tracking-widest`,children:s.join(``)}),(0,J.jsxs)(`span`,{className:`text-[10px] text-slate-500 block mt-0.5`,children:[s.filter(e=>e===1).length,` из 8 бит`]})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/60 border border-cyan-500/30`,children:[(0,J.jsx)(`span`,{className:`text-[10px] text-slate-400 uppercase tracking-wider block`,children:`Десятичный октет`}),(0,J.jsx)(`div`,{className:`text-2xl font-black text-white font-mono`,children:u}),(0,J.jsx)(`span`,{className:`text-[10px] text-cyan-300 block mt-0.5`,children:`Значение маски`})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-[10px] text-slate-400 uppercase tracking-wider block`,children:`Шаг подсети`}),(0,J.jsx)(`div`,{className:`text-xl font-bold text-amber-300 font-mono`,children:u===0?256:u===255?1:256-u}),(0,J.jsxs)(`span`,{className:`text-[10px] text-slate-500 block mt-0.5`,children:[`256 − `,u]})]})]}),(0,J.jsxs)(`div`,{className:`flex flex-wrap justify-center gap-1.5 pt-2 border-t border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-xs text-slate-400 self-center mr-1`,children:`Быстрые маски:`}),[{count:0,val:0},{count:1,val:128},{count:2,val:192},{count:3,val:224},{count:4,val:240},{count:5,val:248},{count:6,val:252},{count:7,val:254},{count:8,val:255}].map(e=>{let t=u===e.val;return(0,J.jsxs)(`button`,{onClick:()=>P(e.count),type:`button`,className:`px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer ${t?`bg-cyan-500 border-cyan-300 text-slate-950 font-bold shadow-md shadow-cyan-500/20`:`bg-slate-900 border-slate-700 text-cyan-300 hover:border-cyan-400`}`,children:[e.val,` (`,e.count,` б.)`]},e.val)})]})]})]}),r===`cheatsheet`&&(0,J.jsxs)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-4`,children:[(0,J.jsxs)(`h2`,{className:`text-xl font-bold text-white flex items-center gap-2`,children:[(0,J.jsx)(T,{className:`w-5 h-5 text-cyan-400`}),`Справочная таблица префиксов CIDR от /16 до /30`]}),(0,J.jsx)(`div`,{className:`overflow-x-auto rounded-xl border border-slate-800`,children:(0,J.jsxs)(`table`,{className:`w-full text-left font-mono text-xs`,children:[(0,J.jsx)(`thead`,{className:`bg-slate-900/80 text-cyan-400 uppercase text-[10px]`,children:(0,J.jsxs)(`tr`,{children:[(0,J.jsx)(`th`,{className:`p-3`,children:`CIDR`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Маска`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Октет & Шаг`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Всего IP`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Хостов`})]})}),(0,J.jsx)(`tbody`,{className:`divide-y divide-slate-800`,children:[16,17,18,19,20,21,22,23,24,25,26,27,28,29,30].map(e=>{let t=we(e),n=2**(32-e),r=n-2;return(0,J.jsxs)(`tr`,{className:`hover:bg-slate-900/40 text-slate-300`,children:[(0,J.jsxs)(`td`,{className:`p-3 font-bold text-white`,children:[`/`,e]}),(0,J.jsx)(`td`,{className:`p-3 text-cyan-300`,children:$(e)}),(0,J.jsxs)(`td`,{className:`p-3 text-amber-300`,children:[`Шаг `,t.step,` в `,t.octet,`-м октете`]}),(0,J.jsx)(`td`,{className:`p-3`,children:n.toLocaleString()}),(0,J.jsx)(`td`,{className:`p-3 text-emerald-300 font-bold`,children:r.toLocaleString()})]},e)})})]})})]})]})},Ee=[{title:`Шаг 1: Формирование ICMP Echo Request на ПК`,location:`ПК (192.168.1.10)`,stageName:`L3 / L2 Проверка маршрута и ARP`,description:"Пользователь вводит `ping 192.168.2.20`. ПК сверяет адрес назначения со своей маской /24. 192.168.2.20 находится в другой подсети! Значит пакет должен быть направлен на шлюз по умолчанию (192.168.1.1).",activeDevice:`pc`,frame:{srcMac:`00:11:22:AA:BB:10`,dstMac:`00:11:22:GW:01:01 (MAC шлюза)`,etherType:`0x0800 (IPv4)`,srcIp:`192.168.1.10`,dstIp:`192.168.2.20`,ttl:64,payload:`ICMP Echo Request (type 8, code 0)`},note:`Обратите внимание: IP получателя — это сервер (192.168.2.20), но MAC получателя — это шлюз по умолчанию (маршрутизатор), а не сервер!`},{title:`Шаг 2: Коммутация кадра на Switch L2`,location:`Коммутатор LAN (L2)`,stageName:`L2 Коммутация по MAC-таблице`,description:`Кадр поступает на порт Fa0/1 коммутатора. Коммутатор запоминает source MAC (00:11:22:AA:BB:10 -> порт Fa0/1) в таблице CAM. Затем смотрит destination MAC (шлюз) и пересылает кадр в порт Gi0/1 к маршрутизатору.`,activeDevice:`switch`,frame:{srcMac:`00:11:22:AA:BB:10`,dstMac:`00:11:22:GW:01:01`,etherType:`0x0800 (IPv4)`,srcIp:`192.168.1.10`,dstIp:`192.168.2.20`,ttl:64,payload:`ICMP Echo Request`},note:`Коммутатор L2 не меняет IP и MAC заголовки! Он лишь передаёт неизменный кадр на соответствующий порт.`},{title:`Шаг 3: Маршрутизация на Router L3`,location:`Маршрутизатор (R1)`,stageName:`L3 Маршрутизация & Декремент TTL`,description:`Маршрутизатор принимает кадр на eth0, снимает заголовок Ethernet L2. В заголовке IPv4 он уменьшает TTL на 1 (64 -> 63) и пересчитывает контрольную сумму IPv4 Checksum. Смотрит таблицу маршрутизации: 192.168.2.0/24 доступна через интерфейс eth1.`,activeDevice:`router`,frame:{srcMac:`00:11:22:GW:02:01 (eth1 маршрутизатора)`,dstMac:`00:11:22:SR:20:20 (MAC сервера)`,etherType:`0x0800 (IPv4)`,srcIp:`192.168.1.10`,dstIp:`192.168.2.20`,ttl:63,payload:`ICMP Echo Request`},note:`Ключевой закон сетей: при прохождении через каждый L3-маршрутизатор IP-адреса остаются прежними, а L2 MAC-адреса полностью перезаписываются!`},{title:`Шаг 4: Приём пакета сервером и ответ`,location:`Сервер (192.168.2.20)`,stageName:`L3/L4 Приём ICMP Echo Request`,description:`Сервер сверяет destination MAC и destination IP — совпадает! ОС сервера принимает ICMP Echo Request (type 8) и формирует ответ ICMP Echo Reply (type 0). IP-адреса источника и получателя меняются местами.`,activeDevice:`server`,frame:{srcMac:`00:11:22:SR:20:20`,dstMac:`00:11:22:GW:02:01`,etherType:`0x0800 (IPv4)`,srcIp:`192.168.2.20`,dstIp:`192.168.1.10`,ttl:64,payload:`ICMP Echo Reply (type 0, code 0)`},note:`Сервер отправляет ответ обратно на шлюз 192.168.2.1 со своим начальным TTL (обычно 64 в Linux или 128 в Windows).`},{title:`Шаг 5: Обратная маршрутизация и доставка на ПК`,location:`ПК (192.168.1.10)`,stageName:`Успешный Ping (Echo Reply)`,description:`Маршрутизатор R1 снова уменьшает TTL (64 -> 63), перезаписывает MAC на (Src: 00:11:22:GW:01:01, Dst: 00:11:22:AA:BB:10) и доставляет ответ через коммутатор на ПК. В терминале отображается: "64 bytes from 192.168.2.20: icmp_seq=1 ttl=63 time=2.14 ms".`,activeDevice:`pc`,frame:{srcMac:`00:11:22:GW:01:01`,dstMac:`00:11:22:AA:BB:10`,etherType:`0x0800 (IPv4)`,srcIp:`192.168.2.20`,dstIp:`192.168.1.10`,ttl:63,payload:`ICMP Echo Reply [OK]`},note:`Круг замкнулся! Весь путь занял несколько миллисекунд.`}],De=()=>{let[e,t]=(0,q.useState)(0),n=Ee[e],r=()=>{e<Ee.length-1&&t(e=>e+1)};return(0,J.jsxs)(`div`,{className:`space-y-6`,children:[(0,J.jsxs)(`div`,{className:`p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl`,children:[(0,J.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-4`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-xs font-mono font-bold uppercase tracking-wider text-cyan-400`,children:`Интерактивная симуляция`}),(0,J.jsx)(`h2`,{className:`text-2xl font-black tracking-tight text-white mt-1`,children:`Путь сетевого пакета: от ПК до Сервера`}),(0,J.jsx)(`p`,{className:`text-xs text-slate-400 mt-1`,children:`Пошаговая визуализация работы протоколов L2/L3: ARP, Ethernet, MAC-таблица, IP-маршрутизация и TTL`})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(`button`,{onClick:()=>{e>0&&t(e=>e-1)},disabled:e===0,type:`button`,className:`p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer`,title:`Назад`,children:(0,J.jsx)(g,{className:`w-5 h-5`})}),(0,J.jsxs)(`span`,{className:`font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold`,children:[e+1,` / `,Ee.length]}),(0,J.jsx)(`button`,{onClick:r,disabled:e===Ee.length-1,type:`button`,className:`p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer`,title:`Далее`,children:(0,J.jsx)(p,{className:`w-5 h-5`})}),(0,J.jsx)(`button`,{onClick:()=>{t(0)},type:`button`,className:`p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer`,title:`Сброс`,children:(0,J.jsx)(z,{className:`w-4 h-4`})})]})]}),(0,J.jsx)(`div`,{className:`grid grid-cols-5 gap-2 mt-6`,children:Ee.map((n,r)=>(0,J.jsxs)(`button`,{onClick:()=>t(r),type:`button`,className:`py-2 px-2 text-center rounded-lg text-[11px] font-semibold transition-all border ${r===e?`bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/30`:r<e?`bg-emerald-950/30 border-emerald-500/40 text-emerald-400`:`bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300`}`,children:[`Шаг `,r+1]},r))})]}),(0,J.jsxs)(`div`,{className:`p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl overflow-hidden`,children:[(0,J.jsxs)(`h3`,{className:`text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2`,children:[(0,J.jsx)(re,{className:`w-4 h-4 text-cyan-400`}),`Топология сети и текущее положение пакета`]}),(0,J.jsxs)(`div`,{className:`relative py-8 px-4 rounded-xl bg-[#07111f] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6`,children:[(0,J.jsxs)(`div`,{className:`flex flex-col items-center p-4 rounded-xl border transition-all ${n.activeDevice===`pc`?`bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105`:`bg-slate-900/60 border-slate-800 opacity-60`}`,children:[(0,J.jsx)(`div`,{className:`p-3 rounded-full bg-cyan-500/20 text-cyan-300 mb-2`,children:(0,J.jsx)(ie,{className:`w-7 h-7`})}),(0,J.jsx)(`span`,{className:`font-bold text-xs text-white`,children:`ПК Клиент`}),(0,J.jsx)(`span`,{className:`text-[10px] font-mono text-cyan-400`,children:`192.168.1.10/24`}),(0,J.jsx)(`span`,{className:`text-[9px] font-mono text-slate-400`,children:`MAC: 00:11:22:AA:BB:10`})]}),(0,J.jsxs)(`div`,{className:`text-slate-600 font-mono text-xs flex flex-col items-center`,children:[(0,J.jsx)(`span`,{children:`LAN 1`}),(0,J.jsx)(d,{className:`w-5 h-5 text-cyan-500/50 hidden md:block`})]}),(0,J.jsxs)(`div`,{className:`flex flex-col items-center p-4 rounded-xl border transition-all ${n.activeDevice===`switch`?`bg-blue-950/60 border-blue-400 shadow-lg shadow-blue-500/30 scale-105`:`bg-slate-900/60 border-slate-800 opacity-60`}`,children:[(0,J.jsx)(`div`,{className:`p-3 rounded-full bg-blue-500/20 text-blue-300 mb-2`,children:(0,J.jsx)(`div`,{className:`w-7 h-7 flex items-center justify-center font-bold text-xs`,children:`L2 SW`})}),(0,J.jsx)(`span`,{className:`font-bold text-xs text-white`,children:`Коммутатор`}),(0,J.jsx)(`span`,{className:`text-[10px] font-mono text-blue-400`,children:`VLAN 1 Default`}),(0,J.jsx)(`span`,{className:`text-[9px] font-mono text-slate-400`,children:`Таблица CAM`})]}),(0,J.jsxs)(`div`,{className:`text-slate-600 font-mono text-xs flex flex-col items-center`,children:[(0,J.jsx)(`span`,{children:`Trunk / Link`}),(0,J.jsx)(d,{className:`w-5 h-5 text-cyan-500/50 hidden md:block`})]}),(0,J.jsxs)(`div`,{className:`flex flex-col items-center p-4 rounded-xl border transition-all ${n.activeDevice===`router`?`bg-purple-950/60 border-purple-400 shadow-lg shadow-purple-500/30 scale-105`:`bg-slate-900/60 border-slate-800 opacity-60`}`,children:[(0,J.jsx)(`div`,{className:`p-3 rounded-full bg-purple-500/20 text-purple-300 mb-2`,children:(0,J.jsx)(`div`,{className:`w-7 h-7 flex items-center justify-center font-bold text-xs`,children:`L3 RT`})}),(0,J.jsx)(`span`,{className:`font-bold text-xs text-white`,children:`Маршрутизатор R1`}),(0,J.jsx)(`span`,{className:`text-[10px] font-mono text-purple-400`,children:`192.168.1.1 ↔ 192.168.2.1`}),(0,J.jsx)(`span`,{className:`text-[9px] font-mono text-slate-400`,children:`Шлюз Default Gateway`})]}),(0,J.jsxs)(`div`,{className:`text-slate-600 font-mono text-xs flex flex-col items-center`,children:[(0,J.jsx)(`span`,{children:`LAN 2`}),(0,J.jsx)(d,{className:`w-5 h-5 text-cyan-500/50 hidden md:block`})]}),(0,J.jsxs)(`div`,{className:`flex flex-col items-center p-4 rounded-xl border transition-all ${n.activeDevice===`server`?`bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105`:`bg-slate-900/60 border-slate-800 opacity-60`}`,children:[(0,J.jsx)(`div`,{className:`p-3 rounded-full bg-emerald-500/20 text-emerald-300 mb-2`,children:(0,J.jsx)(M,{className:`w-7 h-7`})}),(0,J.jsx)(`span`,{className:`font-bold text-xs text-white`,children:`Сервер`}),(0,J.jsx)(`span`,{className:`text-[10px] font-mono text-emerald-400`,children:`192.168.2.20/24`}),(0,J.jsx)(`span`,{className:`text-[9px] font-mono text-slate-400`,children:`MAC: 00:11:22:SR:20:20`})]})]})]}),(0,J.jsxs)(`div`,{className:`grid grid-cols-1 lg:grid-cols-2 gap-6`,children:[(0,J.jsxs)(`div`,{className:`p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-4`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(`span`,{className:`px-2.5 py-1 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold font-mono`,children:n.stageName}),(0,J.jsxs)(`span`,{className:`text-xs text-slate-400 font-mono`,children:[`Локация: `,(0,J.jsx)(`span`,{className:`text-slate-200 font-bold`,children:n.location})]})]}),(0,J.jsx)(`h3`,{className:`text-lg font-bold text-white`,children:n.title}),(0,J.jsx)(`p`,{className:`text-sm text-slate-300 leading-relaxed`,children:n.description}),(0,J.jsxs)(`div`,{className:`p-4 rounded-xl bg-amber-950/30 border-l-4 border-amber-400 text-xs text-amber-200/90 leading-relaxed`,children:[(0,J.jsx)(`strong`,{className:`block text-amber-300 font-bold mb-1`,children:`Важно для экзамена:`}),n.note]}),(0,J.jsx)(`div`,{className:`pt-2 flex gap-3`,children:(0,J.jsxs)(`button`,{onClick:r,disabled:e===Ee.length-1,type:`button`,className:`py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20`,children:[`Следующий шаг`,(0,J.jsx)(p,{className:`w-4 h-4`})]})})]}),(0,J.jsxs)(`div`,{className:`p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-3`,children:[(0,J.jsxs)(`h3`,{className:`text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between`,children:[(0,J.jsx)(`span`,{children:`Анализатор заголовков кадра (Wireshark View)`}),(0,J.jsx)(`span`,{className:`font-mono text-[10px] text-slate-400`,children:`Captured in transit`})]}),(0,J.jsxs)(`div`,{className:`space-y-2 text-xs font-mono`,children:[(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1`,children:[(0,J.jsx)(`div`,{className:`text-[10px] font-bold text-blue-300 uppercase tracking-wide`,children:`L2: Ethernet II Frame`}),(0,J.jsxs)(`div`,{className:`grid grid-cols-2 gap-2 text-slate-300`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`Src MAC:`}),` `,n.frame.srcMac]}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`Dst MAC:`}),` `,n.frame.dstMac]})]}),(0,J.jsxs)(`div`,{className:`text-slate-400 text-[11px]`,children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`EtherType:`}),` `,n.frame.etherType]})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-1`,children:[(0,J.jsx)(`div`,{className:`text-[10px] font-bold text-purple-300 uppercase tracking-wide`,children:`L3: Internet Protocol Version 4 (IPv4)`}),(0,J.jsxs)(`div`,{className:`grid grid-cols-2 gap-2 text-slate-300`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`Src IP:`}),` `,n.frame.srcIp]}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`Dst IP:`}),` `,n.frame.dstIp]})]}),(0,J.jsxs)(`div`,{className:`flex gap-4 text-slate-400 text-[11px]`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`TTL:`}),` `,(0,J.jsx)(`span`,{className:`font-bold text-purple-300`,children:n.frame.ttl})]}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`Protocol:`}),` 1 (ICMP)`]})]})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1`,children:[(0,J.jsx)(`div`,{className:`text-[10px] font-bold text-emerald-300 uppercase tracking-wide`,children:`L4/L7 Payload: ICMP`}),(0,J.jsx)(`div`,{className:`text-slate-200`,children:n.frame.payload})]})]})]})]})]})},Oe=()=>{let[e,t]=(0,q.useState)(1),[n,r]=(0,q.useState)(2),[i]=(0,q.useState)({1:{vlan:10,name:`Бухгалтерия (VLAN 10)`,type:`access`},2:{vlan:10,name:`Финансы (VLAN 10)`,type:`access`},3:{vlan:20,name:`Инженеры (VLAN 20)`,type:`access`},4:{vlan:20,name:`Разработка (VLAN 20)`,type:`access`},5:{vlan:99,name:`Trunk 802.1Q (Все VLAN)`,type:`trunk`}}),[a,o]=(0,q.useState)(null);return(0,J.jsxs)(`div`,{className:`space-y-6`,children:[(0,J.jsxs)(`div`,{className:`p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl`,children:[(0,J.jsx)(`span`,{className:`text-xs font-mono font-bold uppercase tracking-wider text-cyan-400`,children:`Интерактивная лаборатория`}),(0,J.jsx)(`h2`,{className:`text-2xl font-black tracking-tight text-white mt-1`,children:`VLAN & Trunk 802.1Q: Симулятор изоляции портов`}),(0,J.jsx)(`p`,{className:`text-xs text-slate-400 mt-1`,children:`Исследуйте, как коммутатор изолирует широковещательные домены и почему для связи между разными VLAN необходим L3-маршрутизатор`})]}),(0,J.jsxs)(`div`,{className:`p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-6`,children:[(0,J.jsx)(`h3`,{className:`text-xs font-bold uppercase tracking-wider text-slate-400`,children:`Панель портов управляемого коммутатора`}),(0,J.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-5 gap-3`,children:Object.entries(i).map(([i,a])=>{let o=Number(i),s=e===o,c=n===o,l=`bg-slate-800 text-slate-300 border-slate-700`;return a.vlan===10&&(l=`bg-cyan-950/60 text-cyan-300 border-cyan-500/50`),a.vlan===20&&(l=`bg-purple-950/60 text-purple-300 border-purple-500/50`),a.type===`trunk`&&(l=`bg-amber-950/60 text-amber-300 border-amber-500/50`),(0,J.jsxs)(`div`,{className:`p-4 rounded-xl border transition-all ${l} ${s?`ring-2 ring-cyan-400 shadow-lg`:``} ${c?`ring-2 ring-blue-400 shadow-lg`:``}`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between mb-2`,children:[(0,J.jsxs)(`span`,{className:`font-mono font-bold text-xs`,children:[`Порт `,o]}),(0,J.jsx)(`span`,{className:`text-[10px] px-2 py-0.5 rounded uppercase font-bold bg-black/40`,children:a.type})]}),(0,J.jsx)(`div`,{className:`text-xs font-semibold mb-3`,children:a.name}),(0,J.jsxs)(`div`,{className:`flex flex-col gap-1.5 pt-2 border-t border-white/10`,children:[(0,J.jsx)(`button`,{onClick:()=>t(o),type:`button`,className:`py-1.5 px-2 rounded text-[11px] font-bold transition-all min-h-[34px] cursor-pointer ${s?`bg-cyan-500 text-slate-950`:`bg-black/30 hover:bg-black/50 text-slate-300`}`,children:s?`✓ Источник`:`Как источник`}),(0,J.jsx)(`button`,{onClick:()=>r(o),type:`button`,className:`py-1.5 px-2 rounded text-[11px] font-bold transition-all min-h-[34px] cursor-pointer ${c?`bg-blue-500 text-slate-950`:`bg-black/30 hover:bg-black/50 text-slate-300`}`,children:c?`✓ Получатель`:`Как получатель`})]})]},o)})}),(0,J.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800`,children:[(0,J.jsxs)(`div`,{className:`text-xs text-slate-300 font-mono`,children:[`Передача: `,(0,J.jsxs)(`span`,{className:`text-cyan-400 font-bold`,children:[`Порт `,e]}),` (VLAN`,` `,i[e].vlan,`) →`,` `,(0,J.jsxs)(`span`,{className:`text-blue-400 font-bold`,children:[`Порт `,n]}),` (VLAN`,` `,i[n].vlan,`)`]}),(0,J.jsxs)(`button`,{onClick:()=>{let t=i[e],r=i[n];e===n?o({status:`blocked`,message:`Нельзя отправить кадр самому себе в тот же порт.`,details:`Коммутатор никогда не пересылает кадр обратно в порт, из которого он был получен (правило Split Horizon).`}):r.type===`trunk`?o({status:`trunked`,message:`Кадр помечен 802.1Q тегом VLAN ${t.vlan} и отправлен в Trunk!`,details:`Коммутатор добавляет 4-байтный тег IEEE 802.1Q (TPID 0x8100, VID ${t.vlan}) для передачи кадра между коммутаторами без смешивания широковещательных доменов.`,tagInfo:`IEEE 802.1Q: TPID=0x8100 | PCP=0 | DEI=0 | VID=${t.vlan}`}):t.vlan===r.vlan?o({status:`delivered`,message:`Успех! Кадр доставлен внутри изолированного VLAN ${t.vlan}.`,details:`Порты ${e} и ${n} находятся в одном широковещательном домене (Broadcast Domain). Коммутатор передаёт untagged кадр без участия маршрутизатора.`}):o({status:`blocked`,message:`Кадр отклонён: разные VLAN (${t.vlan} ≠ ${r.vlan})!`,details:`L2-коммутатор строго изолирует VLAN друг от друга. Прямая передача на уровне L2 невозможна. Для связи между VLAN 10 и VLAN 20 требуется L3-маршрутизатор (Router-on-a-stick или L3-Switch SVI).`})},type:`button`,className:`py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 min-h-[48px] shadow-lg shadow-cyan-500/20 cursor-pointer`,children:[(0,J.jsx)(R,{className:`w-4 h-4`}),`Проверить передачу кадра`]})]}),a&&(0,J.jsx)(`div`,{className:`p-5 rounded-xl border animate-fade-in ${a.status===`delivered`?`bg-emerald-950/40 border-emerald-500/50 text-emerald-200`:a.status===`trunked`?`bg-amber-950/40 border-amber-500/50 text-amber-200`:`bg-rose-950/40 border-rose-500/50 text-rose-200`}`,children:(0,J.jsxs)(`div`,{className:`flex items-start gap-3`,children:[a.status===`delivered`?(0,J.jsx)(j,{className:`w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5`}):a.status===`trunked`?(0,J.jsx)(K,{className:`w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5`}):(0,J.jsx)(O,{className:`w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5`}),(0,J.jsxs)(`div`,{className:`space-y-1 text-xs`,children:[(0,J.jsx)(`div`,{className:`font-bold text-sm text-white`,children:a.message}),(0,J.jsx)(`div`,{className:`text-slate-300 leading-relaxed`,children:a.details}),a.tagInfo&&(0,J.jsx)(`div`,{className:`mt-2 p-2 rounded bg-black/40 font-mono text-cyan-300`,children:a.tagInfo})]})]})})]}),(0,J.jsxs)(`div`,{className:`p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-4`,children:[(0,J.jsx)(`h3`,{className:`text-xs font-bold uppercase tracking-wider text-cyan-400`,children:`Анатомия 4-байтного тега 802.1Q (Trunk)`}),(0,J.jsxs)(`div`,{className:`grid grid-cols-4 gap-2 text-center font-mono text-xs`,children:[(0,J.jsxs)(`div`,{className:`p-3 rounded-lg bg-slate-900 border border-slate-700`,children:[(0,J.jsx)(`div`,{className:`text-cyan-400 font-bold`,children:`TPID (16 бит)`}),(0,J.jsx)(`div`,{className:`text-[11px] text-slate-400`,children:`0x8100`})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-lg bg-slate-900 border border-slate-700`,children:[(0,J.jsx)(`div`,{className:`text-purple-400 font-bold`,children:`PCP (3 бита)`}),(0,J.jsx)(`div`,{className:`text-[11px] text-slate-400`,children:`Приоритет QoS`})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-lg bg-slate-900 border border-slate-700`,children:[(0,J.jsx)(`div`,{className:`text-amber-400 font-bold`,children:`DEI (1 бит)`}),(0,J.jsx)(`div`,{className:`text-[11px] text-slate-400`,children:`Drop Eligible`})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-lg bg-slate-900 border border-slate-700`,children:[(0,J.jsx)(`div`,{className:`text-emerald-400 font-bold`,children:`VID (12 бит)`}),(0,J.jsx)(`div`,{className:`text-[11px] text-slate-400`,children:`Номер VLAN (1–4094)`})]})]})]})]})},ke=()=>{let[e,t]=(0,q.useState)(`dhcp`),[n,r]=(0,q.useState)(0),i=[{name:`DHCP DISCOVER`,direction:`Клиент → Broadcast (255.255.255.255)`,srcIp:`0.0.0.0`,dstIp:`255.255.255.255`,srcPort:`UDP 68`,dstPort:`UDP 67`,flags:`Broadcast: 1 (B=1)`,desc:`Клиент подключается к сети, у него нет IP-адреса. Он рассылает широковещательный Discover, запрашивая конфигурацию у любого доступного DHCP-сервера.`},{name:`DHCP OFFER`,direction:`DHCP-Сервер → Клиент`,srcIp:`192.168.10.2 (Сервер)`,dstIp:`255.255.255.255`,srcPort:`UDP 67`,dstPort:`UDP 68`,flags:`Предложен IP: 192.168.10.100`,desc:`Сервер резервирует свободный IP из пула (192.168.10.100/24, шлюз 192.168.10.1, DNS 192.0.2.53) и отправляет клиенту предложение аренды.`},{name:`DHCP REQUEST`,direction:`Клиент → Broadcast`,srcIp:`0.0.0.0`,dstIp:`255.255.255.255`,srcPort:`UDP 68`,dstPort:`UDP 67`,flags:`Запрос принят: 192.168.10.100`,desc:`Клиент официально запрашивает предложенный IP у сервера, уведомляя остальные DHCP-серверы о выборе.`},{name:`DHCP ACK`,direction:`DHCP-Сервер → Клиент`,srcIp:`192.168.10.2`,dstIp:`255.255.255.255`,srcPort:`UDP 67`,dstPort:`UDP 68`,flags:`Аренда подтверждена на 8 часов`,desc:`Сервер финализирует аренду (Acknowledge). Клиент применяет IP, маску /24, шлюз и DNS. Сеть настроена!`}],[a,o]=(0,q.useState)(0),s=[{step:`1. Формирование пакета на ПК (Inside Local)`,src:`192.168.1.50 : 54210`,dst:`93.184.216.34 : 80 (example.com)`,location:`Локальная сеть LAN`,desc:`ПК отправляет HTTP-запрос веб-серверу в интернете. Приватный IP (RFC 1918) не маршрутизируется в глобальном интернете.`},{step:`2. Трансляция на NAT-маршрутизаторе (PAT Translation)`,src:`203.0.113.5 : 40001 (Inside Global)`,dst:`93.184.216.34 : 80`,location:`Маршрутизатор NAT/PAT`,desc:`Маршрутизатор заменяет приватный IP 192.168.1.50 на свой публичный IP 203.0.113.5, выделяет уникальный порт 40001 и сохраняет запись в таблице трансляций.`},{step:`3. Ответ веб-сервера через интернет`,src:`93.184.216.34 : 80`,dst:`203.0.113.5 : 40001`,location:`Интернет WAN`,desc:`Веб-сервер отправляет ответ HTTP 200 OK на публичный IP маршрутизатора и порт 40001.`},{step:`4. Обратная трансляция клиенту`,src:`93.184.216.34 : 80`,dst:`192.168.1.50 : 54210`,location:`Возврат в LAN`,desc:`Маршрутизатор находит порт 40001 в таблице трансляций, переписывает адрес на 192.168.1.50:54210 и доставляет ответ клиенту.`}],[c,l]=(0,q.useState)(0),u=[{no:1,time:`0.000000`,src:`192.168.1.50`,dst:`93.184.216.34`,proto:`TCP`,length:74,info:`54210 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM`,details:{ethernet:`Dst: 00:11:22:gw:01:01, Src: 00:11:22:aa:bb:50, Type: IPv4 (0x0800)`,ip:`IPv4, Src: 192.168.1.50, Dst: 93.184.216.34, TTL: 64, Protocol: TCP (6)`,tcp:`Source Port: 54210, Dst Port: 80, Seq: 0, Flags: 0x002 (SYN)`}},{no:2,time:`0.014210`,src:`93.184.216.34`,dst:`192.168.1.50`,proto:`TCP`,length:74,info:`80 → 54210 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460`,details:{ethernet:`Dst: 00:11:22:aa:bb:50, Src: 00:11:22:gw:01:01, Type: IPv4 (0x0800)`,ip:`IPv4, Src: 93.184.216.34, Dst: 192.168.1.50, TTL: 52, Protocol: TCP (6)`,tcp:`Source Port: 80, Dst Port: 54210, Seq: 0, Ack: 1, Flags: 0x012 (SYN, ACK)`}},{no:3,time:`0.014380`,src:`192.168.1.50`,dst:`93.184.216.34`,proto:`TCP`,length:66,info:`54210 → 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0`,details:{ethernet:`Dst: 00:11:22:gw:01:01, Src: 00:11:22:aa:bb:50, Type: IPv4 (0x0800)`,ip:`IPv4, Src: 192.168.1.50, Dst: 93.184.216.34, TTL: 64, Protocol: TCP (6)`,tcp:`Source Port: 54210, Dst Port: 80, Seq: 1, Ack: 1, Flags: 0x010 (ACK)`}},{no:4,time:`0.015120`,src:`192.168.1.50`,dst:`93.184.216.34`,proto:`HTTP`,length:142,info:`GET / HTTP/1.1 (Host: example.com)`,details:{ethernet:`Dst: 00:11:22:gw:01:01, Src: 00:11:22:aa:bb:50, Type: IPv4 (0x0800)`,ip:`IPv4, Src: 192.168.1.50, Dst: 93.184.216.34, TTL: 64, Protocol: TCP (6)`,tcp:`Source Port: 54210, Dst Port: 80, Seq: 1, Ack: 1, Flags: [PSH, ACK]`}}];return(0,J.jsxs)(`div`,{className:`space-y-6`,children:[(0,J.jsx)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl relative overflow-hidden`,children:(0,J.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-4`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-xs font-mono font-bold uppercase tracking-wider text-cyan-400`,children:`Сетевые протоколы и анализ`}),(0,J.jsx)(`h2`,{className:`text-2xl sm:text-3xl font-black text-white mt-1`,children:`DHCP DORA · NAT / PAT · Wireshark`}),(0,J.jsx)(`p`,{className:`text-xs sm:text-sm text-slate-300 mt-1`,children:`Ключевые прикладные и транспортные симуляции из основного репозитория`})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800`,children:[(0,J.jsx)(`button`,{onClick:()=>t(`dhcp`),type:`button`,className:`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${e===`dhcp`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md`:`text-slate-400 hover:text-white`}`,children:`DHCP DORA`}),(0,J.jsx)(`button`,{onClick:()=>t(`nat`),type:`button`,className:`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${e===`nat`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md`:`text-slate-400 hover:text-white`}`,children:`NAT / PAT`}),(0,J.jsx)(`button`,{onClick:()=>t(`wireshark`),type:`button`,className:`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${e===`wireshark`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md`:`text-slate-400 hover:text-white`}`,children:`Wireshark Захват`})]})]})}),e===`dhcp`&&(0,J.jsxs)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6`,children:[(0,J.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-4`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-xs font-mono font-bold text-cyan-400 uppercase`,children:`4 шага DORA (Discover, Offer, Request, Acknowledge)`}),(0,J.jsx)(`h3`,{className:`text-xl font-bold text-white mt-1`,children:i[n].name})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(`button`,{onClick:()=>r(e=>Math.max(0,e-1)),disabled:n===0,type:`button`,className:`py-2 px-3 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-200 text-xs font-bold`,children:`Назад`}),(0,J.jsxs)(`span`,{className:`font-mono text-xs px-2.5 py-1 rounded bg-black/40 text-cyan-300`,children:[n+1,` / 4`]}),(0,J.jsx)(`button`,{onClick:()=>r(e=>Math.min(3,e+1)),disabled:n===3,type:`button`,className:`py-2 px-3 rounded-lg bg-cyan-500 disabled:opacity-40 text-slate-950 text-xs font-bold`,children:`Далее`}),(0,J.jsx)(`button`,{onClick:()=>r(0),type:`button`,className:`p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300`,children:(0,J.jsx)(z,{className:`w-4 h-4`})})]})]}),(0,J.jsx)(`div`,{className:`grid grid-cols-4 gap-2`,children:i.map((e,t)=>(0,J.jsxs)(`button`,{onClick:()=>r(t),type:`button`,className:`p-3 rounded-xl text-center border transition-all cursor-pointer ${n===t?`bg-cyan-950/70 border-cyan-400 text-cyan-300 font-bold`:`bg-slate-900/50 border-slate-800 text-slate-400`}`,children:[(0,J.jsxs)(`div`,{className:`text-[10px] font-mono`,children:[`Шаг `,t+1]}),(0,J.jsx)(`div`,{className:`text-xs truncate`,children:e.name})]},t))}),(0,J.jsxs)(`div`,{className:`grid grid-cols-1 md:grid-cols-2 gap-4`,children:[(0,J.jsxs)(`div`,{className:`p-5 rounded-2xl bg-[#060f1b] border border-cyan-500/30 space-y-3 font-mono text-xs`,children:[(0,J.jsx)(`div`,{className:`text-xs uppercase font-bold text-cyan-400`,children:`Параметры UDP / IP пакета`}),(0,J.jsxs)(`div`,{className:`space-y-1.5 text-slate-300`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`Направление:`}),` `,i[n].direction]}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`Source IP:`}),` `,i[n].srcIp]}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`Dest IP:`}),` `,i[n].dstIp]}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`Порты:`}),` `,i[n].srcPort,` → `,i[n].dstPort]}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`Флаги:`}),` `,i[n].flags]})]})]}),(0,J.jsxs)(`div`,{className:`p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2`,children:[(0,J.jsx)(`div`,{className:`text-xs uppercase font-bold text-slate-400`,children:`Что происходит:`}),(0,J.jsx)(`p`,{className:`text-xs text-slate-300 leading-relaxed`,children:i[n].desc}),(0,J.jsxs)(`div`,{className:`mt-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300`,children:[(0,J.jsx)(`strong`,{children:`Важно для экзамена:`}),` Клиент до получения адреса отправляет запросы с порта UDP 68 на порт UDP 67 сервера!`]})]})]})]}),e===`nat`&&(0,J.jsxs)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6`,children:[(0,J.jsxs)(`div`,{className:`flex flex-wrap items-center justify-between gap-4`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-xs font-mono font-bold text-cyan-400 uppercase`,children:`Трансляция сетевых адресов и портов (PAT / NAPT)`}),(0,J.jsx)(`h3`,{className:`text-xl font-bold text-white mt-1`,children:s[a].step})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(`button`,{onClick:()=>o(e=>Math.max(0,e-1)),disabled:a===0,type:`button`,className:`py-2 px-3 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-200 text-xs font-bold`,children:`Назад`}),(0,J.jsxs)(`span`,{className:`font-mono text-xs px-2.5 py-1 rounded bg-black/40 text-cyan-300`,children:[a+1,` / 4`]}),(0,J.jsx)(`button`,{onClick:()=>o(e=>Math.min(3,e+1)),disabled:a===3,type:`button`,className:`py-2 px-3 rounded-lg bg-cyan-500 disabled:opacity-40 text-slate-950 text-xs font-bold`,children:`Далее`})]})]}),(0,J.jsxs)(`div`,{className:`p-4 rounded-2xl bg-[#060f1b] border border-cyan-500/30 font-mono text-xs overflow-x-auto`,children:[(0,J.jsx)(`div`,{className:`text-cyan-400 font-bold uppercase text-[11px] mb-2`,children:`Таблица трансляций NAT на маршрутизаторе (show ip nat translations)`}),(0,J.jsxs)(`table`,{className:`w-full text-left`,children:[(0,J.jsx)(`thead`,{className:`text-slate-500 uppercase text-[10px]`,children:(0,J.jsxs)(`tr`,{children:[(0,J.jsx)(`th`,{className:`p-2`,children:`Протокол`}),(0,J.jsx)(`th`,{className:`p-2`,children:`Inside Local (LAN)`}),(0,J.jsx)(`th`,{className:`p-2`,children:`Inside Global (WAN IP+Port)`}),(0,J.jsx)(`th`,{className:`p-2`,children:`Outside Global (Сервер)`})]})}),(0,J.jsx)(`tbody`,{className:`divide-y divide-slate-800 text-slate-300`,children:(0,J.jsxs)(`tr`,{className:`bg-cyan-950/30`,children:[(0,J.jsx)(`td`,{className:`p-2 text-cyan-300 font-bold`,children:`tcp`}),(0,J.jsx)(`td`,{className:`p-2`,children:`192.168.1.50:54210`}),(0,J.jsx)(`td`,{className:`p-2 text-amber-300 font-bold`,children:`203.0.113.5:40001`}),(0,J.jsx)(`td`,{className:`p-2`,children:`93.184.216.34:80`})]})})]})]}),(0,J.jsxs)(`div`,{className:`p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2`,children:[(0,J.jsx)(`div`,{className:`text-xs uppercase font-bold text-slate-400`,children:`Пояснение этапа:`}),(0,J.jsx)(`p`,{className:`text-xs text-slate-300 leading-relaxed`,children:s[a].desc})]})]}),e===`wireshark`&&(0,J.jsxs)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-xs font-mono font-bold text-cyan-400 uppercase`,children:`Инспектор сетевых пакетов (Wireshark Capture)`}),(0,J.jsx)(`h3`,{className:`text-xl font-bold text-white mt-1`,children:`Разбор TCP 3-Way Handshake и HTTP запроса`})]}),(0,J.jsx)(`div`,{className:`overflow-x-auto rounded-2xl border border-slate-800 bg-[#060f1b]`,children:(0,J.jsxs)(`table`,{className:`w-full text-left font-mono text-xs`,children:[(0,J.jsx)(`thead`,{className:`bg-slate-900/80 text-slate-400 uppercase text-[10px]`,children:(0,J.jsxs)(`tr`,{children:[(0,J.jsx)(`th`,{className:`p-2.5`,children:`No.`}),(0,J.jsx)(`th`,{className:`p-2.5`,children:`Time`}),(0,J.jsx)(`th`,{className:`p-2.5`,children:`Source`}),(0,J.jsx)(`th`,{className:`p-2.5`,children:`Destination`}),(0,J.jsx)(`th`,{className:`p-2.5`,children:`Protocol`}),(0,J.jsx)(`th`,{className:`p-2.5`,children:`Info`})]})}),(0,J.jsx)(`tbody`,{className:`divide-y divide-slate-800`,children:u.map((e,t)=>(0,J.jsxs)(`tr`,{onClick:()=>l(t),className:`cursor-pointer transition-colors ${c===t?`bg-cyan-950/80 text-cyan-300 font-bold`:`hover:bg-slate-900/40 text-slate-300`}`,children:[(0,J.jsx)(`td`,{className:`p-2.5`,children:e.no}),(0,J.jsx)(`td`,{className:`p-2.5`,children:e.time}),(0,J.jsx)(`td`,{className:`p-2.5`,children:e.src}),(0,J.jsx)(`td`,{className:`p-2.5`,children:e.dst}),(0,J.jsx)(`td`,{className:`p-2.5 text-cyan-400 font-bold`,children:e.proto}),(0,J.jsx)(`td`,{className:`p-2.5 truncate max-w-xs`,children:e.info})]},e.no))})]})}),(0,J.jsxs)(`div`,{className:`p-5 rounded-2xl bg-[#091725] border border-cyan-500/30 space-y-3 font-mono text-xs`,children:[(0,J.jsxs)(`div`,{className:`text-xs font-bold text-cyan-400 uppercase`,children:[`Инспекция уровней пакета #`,u[c].no,`:`]}),(0,J.jsxs)(`div`,{className:`space-y-2`,children:[(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/70 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-blue-400 font-bold block mb-1`,children:`▸ Ethernet II (Frame L2)`}),(0,J.jsx)(`span`,{className:`text-slate-300`,children:u[c].details.ethernet})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/70 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-purple-400 font-bold block mb-1`,children:`▸ Internet Protocol Version 4 (Packet L3)`}),(0,J.jsx)(`span`,{className:`text-slate-300`,children:u[c].details.ip})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/70 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-emerald-400 font-bold block mb-1`,children:`▸ Transmission Control Protocol (Segment L4)`}),(0,J.jsx)(`span`,{className:`text-slate-300`,children:u[c].details.tcp})]})]})]})]})]})},Ae={help:`Доступные сетевые команды:
  ping <ip/host>        — Проверка доступности хоста по ICMP
  traceroute <ip/host>  — Трассировка маршрута по TTL
  ip addr / ip a        — Просмотр сетевых интерфейсов и IP/масок
  ip route              — Просмотр таблицы маршрутизации (L3)
  arp -a                — Просмотр ARP-кэша соответствия IP -> MAC (L2)
  netstat -tulnp        — Просмотр слушающих TCP/UDP сокетов и портов
  curl -I <url>         — Проверка L7 HTTP-заголовков ответа
  clear                 — Очистить экран консоли`,"ip addr":`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 00:11:22:aa:bb:10 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.10/24 brd 192.168.1.255 scope global eth0
       valid_lft forever preferred_lft forever`,"ip a":`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 00:11:22:aa:bb:10 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.10/24 brd 192.168.1.255 scope global eth0`,"ip route":`default via 192.168.1.1 dev eth0 proto static metric 100 
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10 metric 100`,"arp -a":`? (192.168.1.1) at 00:11:22:gw:01:01 [ether] on eth0
? (192.168.1.25) at 52:54:00:12:34:56 [ether] on eth0`,"netstat -tulnp":`Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      892/sshd            
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1044/nginx          
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      1044/nginx          
udp        0      0 0.0.0.0:53              0.0.0.0:*                           712/named           
udp        0      0 0.0.0.0:67              0.0.0.0:*                           645/dhcpd`},je=()=>{let[e,t]=(0,q.useState)(``),[n,r]=(0,q.useState)([{command:`welcome`,output:`Добро пожаловать в сетевой CLI-тренажёр (Linux / Cisco environment)!
Введите 'help' для просмотра списка доступных команд.`}]),i=(0,q.useRef)(null),a=(0,q.useRef)(null);(0,q.useEffect)(()=>{i.current?.scrollIntoView({behavior:`smooth`})},[n]);let o=e=>{let n=e.trim();if(!n)return;if(n.toLowerCase()===`clear`){r([]),t(``);return}let i=n.toLowerCase(),a=``,o=!1;if(Ae[i])a=Ae[i];else if(i.startsWith(`ping`)){let e=n.split(` `)[1]||`8.8.8.8`;a=`PING ${e} (${e}) 56(84) bytes of data.
64 bytes from ${e}: icmp_seq=1 ttl=117 time=14.2 ms
64 bytes from ${e}: icmp_seq=2 ttl=117 time=13.8 ms
64 bytes from ${e}: icmp_seq=3 ttl=117 time=14.5 ms
64 bytes from ${e}: icmp_seq=4 ttl=117 time=14.1 ms

--- ${e} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 13.8/14.15/14.5/0.25 ms`}else if(i.startsWith(`traceroute`)){let e=n.split(` `)[1]||`8.8.8.8`;a=`traceroute to ${e} (${e}), 30 hops max, 60 byte packets
 1  gateway (192.168.1.1)  0.641 ms  0.512 ms  0.489 ms
 2  10.50.0.1 (10.50.0.1)  2.124 ms  2.089 ms  2.045 ms
 3  core-gw.isp.net (185.12.34.1)  5.412 ms  5.389 ms  5.312 ms
 4  dns.google (${e})  14.214 ms  14.152 ms  14.089 ms`}else i.startsWith(`curl`)?a=`HTTP/2 200 OK
date: ${new Date().toUTCString()}
content-type: text/html; charset=UTF-8
server: cloudflare
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-content-type-options: nosniff
vary: Accept-Encoding`:(o=!0,a=`bash: команда не найдена: ${n}. Введите 'help' для просмотра списка доступных команд.`);r(e=>[...e,{command:n,output:a,isError:o}]),t(``)};return(0,J.jsxs)(`div`,{className:`space-y-6`,children:[(0,J.jsxs)(`div`,{className:`p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl flex flex-wrap items-center justify-between gap-4`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-xs font-mono font-bold uppercase tracking-wider text-cyan-400`,children:`Практика терминала`}),(0,J.jsx)(`h2`,{className:`text-2xl font-black tracking-tight text-white mt-1`,children:`Сетевой CLI-эмулятор`}),(0,J.jsx)(`p`,{className:`text-xs text-slate-400 mt-1`,children:`Выполняйте реальные сетевые команды для закрепления теории уровней L2, L3, L4 и L7`})]}),(0,J.jsxs)(`button`,{onClick:()=>r([]),type:`button`,className:`p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[44px] cursor-pointer`,children:[(0,J.jsx)(V,{className:`w-4 h-4`}),`Очистить`]})]}),(0,J.jsxs)(`div`,{className:`flex flex-wrap gap-2 items-center`,children:[(0,J.jsx)(`span`,{className:`text-xs text-slate-400 font-mono`,children:`Быстрый ввод:`}),[`help`,`ip addr`,`ip route`,`arp -a`,`netstat -tulnp`,`ping 192.168.2.20`,`traceroute 8.8.8.8`].map(e=>(0,J.jsx)(`button`,{onClick:()=>o(e),type:`button`,className:`px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-mono transition-all cursor-pointer min-h-[36px]`,children:e},e))]}),(0,J.jsxs)(`div`,{onClick:()=>a.current?.focus(),className:`rounded-2xl bg-[#050b14] border border-cyan-500/30 shadow-2xl p-4 sm:p-6 font-mono text-xs sm:text-sm text-slate-200 min-h-[420px] flex flex-col cursor-text`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-slate-400 select-none`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(`div`,{className:`w-3 h-3 rounded-full bg-rose-500/80`}),(0,J.jsx)(`div`,{className:`w-3 h-3 rounded-full bg-amber-500/80`}),(0,J.jsx)(`div`,{className:`w-3 h-3 rounded-full bg-emerald-500/80`}),(0,J.jsx)(`span`,{className:`ml-2 text-xs font-mono text-slate-400`,children:`admin@network-lab:~`})]}),(0,J.jsx)(`span`,{className:`text-[11px] text-cyan-500/70`,children:`bash 5.2`})]}),(0,J.jsxs)(`div`,{className:`flex-1 space-y-4 overflow-y-auto`,children:[n.map((e,t)=>(0,J.jsxs)(`div`,{className:`space-y-1`,children:[e.command!==`welcome`&&(0,J.jsxs)(`div`,{className:`flex items-center gap-2 text-cyan-400`,children:[(0,J.jsx)(`span`,{className:`text-slate-500`,children:`user@host:~$`}),(0,J.jsx)(`span`,{className:`font-bold text-white`,children:e.command})]}),(0,J.jsx)(`pre`,{className:`whitespace-pre-wrap font-mono text-xs leading-relaxed ${e.isError?`text-rose-400`:`text-slate-300`}`,children:e.output})]},t)),(0,J.jsx)(`div`,{ref:i})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-2 pt-4 border-t border-slate-800/80 mt-2`,children:[(0,J.jsx)(`span`,{className:`text-cyan-400 font-bold`,children:`user@host:~$`}),(0,J.jsx)(`input`,{ref:a,type:`text`,value:e,onChange:e=>t(e.target.value),onKeyDown:t=>{t.key===`Enter`&&(t.preventDefault(),o(e))},placeholder:`Введите команду (например, 'ping 8.8.8.8' или 'ip route')...`,className:`flex-1 bg-transparent border-0 outline-none text-white font-mono text-xs sm:text-sm placeholder:text-slate-600`,autoFocus:!0}),(0,J.jsx)(`button`,{onClick:()=>o(e),type:`button`,className:`p-1.5 text-cyan-400 hover:text-cyan-300 transition-colors`,children:(0,J.jsx)(L,{className:`w-4 h-4`})})]})]})]})},Me=[{id:`journey`,title:`Путь пакета`,badge:`L2–L7`,subtitle:`Анимация инкапсуляции и декапсуляции данных через узлы сети`,icon:(0,J.jsx)(U,{className:`w-4 h-4 text-cyan-400`})},{id:`vlan`,title:`VLAN & Trunk`,badge:`802.1Q`,subtitle:`Интерактивный коммутатор, изоляция портов и транкинг`,icon:(0,J.jsx)(K,{className:`w-4 h-4 text-purple-400`})},{id:`protocols`,title:`DHCP / NAT / TCP`,badge:`DORA & Handshake`,subtitle:`Пошаговые симуляторы сетевых протоколов и трансляции адресов`,icon:(0,J.jsx)(y,{className:`w-4 h-4 text-emerald-400`})},{id:`cli`,title:`CLI Терминал`,badge:`Cisco & Linux`,subtitle:`Эмулятор консоли сетевого оборудования с подсказками команд`,icon:(0,J.jsx)(W,{className:`w-4 h-4 text-amber-400`})}],Ne=()=>{let[e,t]=(0,q.useState)(`journey`);return(0,J.jsxs)(`div`,{className:`space-y-6`,children:[(0,J.jsxs)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl relative overflow-hidden`,children:[(0,J.jsx)(`div`,{className:`flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6`,children:(0,J.jsxs)(`div`,{children:[(0,J.jsxs)(`div`,{className:`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2`,children:[(0,J.jsx)(ne,{className:`w-3.5 h-3.5`}),`Интерактивная лаборатория`]}),(0,J.jsx)(`h1`,{className:`text-2xl sm:text-3xl font-black text-white tracking-tight`,children:`Сетевая практика и симуляторы`}),(0,J.jsx)(`p`,{className:`text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed`,children:`Интерактивные стенды для отработки сетевых процессов: от сборки кадров и изоляции VLAN до симуляции трансляции NAT и терминала Cisco IOS.`})]})}),(0,J.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3`,children:Me.map(n=>{let r=e===n.id;return(0,J.jsxs)(`button`,{onClick:()=>t(n.id),type:`button`,className:`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-3 ${r?`bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50`:`bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60`}`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between gap-2`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(`div`,{className:`p-2 rounded-xl ${r?`bg-cyan-500/20 text-cyan-300`:`bg-slate-800 text-slate-400`}`,children:n.icon}),(0,J.jsx)(`span`,{className:`font-bold text-sm text-white`,children:n.title})]}),(0,J.jsx)(`span`,{className:`text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700`,children:n.badge})]}),(0,J.jsx)(`p`,{className:`text-[11px] text-slate-400 leading-snug line-clamp-2`,children:n.subtitle})]},n.id)})})]}),(0,J.jsxs)(`div`,{className:`animate-fade-in`,children:[e===`journey`&&(0,J.jsx)(De,{}),e===`vlan`&&(0,J.jsx)(Oe,{}),e===`protocols`&&(0,J.jsx)(ke,{}),e===`cli`&&(0,J.jsx)(je,{})]})]})},Pe={"l1-01":{category:`l1`,categoryLabel:`L1 · Физический уровень · PDU`,categoryColor:`from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30`,coreConcept:`Физический уровень (L1) оперирует исключительно неструктурированным потоком битов (0 и 1) в виде физических сигналов.`,deepAnalysis:`Анализатор физического уровня или осциллограф видит лишь уровни напряжения, оптические импульсы или радиочастотные колебания. На L1 нет концепции заголовков, адресов отправителя/получателя или контрольных сумм. Структурирование битов в кадры с преамбулой и MAC-адресами происходит только уровнем выше — на L2 (Data Link).`,commonTrap:`Часто путают с кадром (Frame). Кадр появляется только тогда, когда поток битов разбивается на порции с проверкой FCS (Frame Check Sequence) и MAC-адресацией.`,memorizationRule:`L1 = Биты (сигналы) → L2 = Кадры (MAC) → L3 = Пакеты (IP) → L4 = Сегменты (TCP) / Датаграммы (UDP) → L7 = Данные.`,visualDiagram:`+-------------------------------------------------------+
| Уровень       | PDU (Единица данных) | Адресация       |
+---------------+----------------------+-----------------+
| L4 Транспорт  | Сегмент / Датаграмма | Порты (0-65535) |
| L3 Сетевой    | Пакет (Packet)       | IP-адреса       |
| L2 Канальный  | Кадр (Frame)         | MAC-адреса      |
| L1 Физический | Бит (Bit / Signal)   | Напряжение/Свет |
+-------------------------------------------------------+`,keyTakeaways:[`L1 не знает про IP, MAC или протоколы — только импульсы и частоты`,`Хабы и репитеры работают на L1, поэтому они ретранслируют каждый бит во все порты без разбора`]},"l1-02":{category:`l1`,categoryLabel:`L1 · Устройства физического уровня`,categoryColor:`from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30`,coreConcept:`Повторители (Repeaters) и концентраторы (Hubs) работают на L1, так как они просто усиливают электрический/оптический сигнал.`,deepAnalysis:`Концентратор (hub) не имеет процессора для парсинга Ethernet-кадров и не содержит памяти для MAC-таблицы (CAM). Получив сигнал на один порт, он физически дублирует его на все остальные порты. Это делает всю сеть единым доменом коллизий (Collision Domain), где одновременная передача двумя узлами приводит к наложению сигналов.`,commonTrap:`Путаница между Hub (L1, глупый размножитель сигнала) и Switch (L2, умный коммутатор, разделяющий домены коллизий по MAC-адресам).`,practicalTip:`В современных сетях хабы полностью вытеснены L2-коммутаторами. Для зеркалирования трафика вместо хабов используют SPAN/Port Mirroring или сетевые TAP-ответвители.`,keyTakeaways:[`Hub = единый домен коллизий на все порты`,`Switch = каждый порт является отдельным изолированным доменом коллизий`]},"l2-01":{category:`l2`,categoryLabel:`L2 · Канальный уровень · PDU`,categoryColor:`from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30`,coreConcept:`Единицей данных канального уровня (Data Link Layer) является Кадр (Frame).`,deepAnalysis:`Кадр Ethernet обрамляет сетевой пакет IP заголовком (MAC получателя, MAC отправителя, EtherType) и завершающей контрольной суммой FCS (CRC-32). Если контрольная сумма в трейлере не сходится с вычисленной, сетевая карта отбрасывает поврежденный кадр еще до передачи в ОС.`,commonTrap:`Смешение терминов «пакет» и «кадр». Пакет — это L3 (IP), а кадр — это L2 (Ethernet/Wi-Fi).`,visualDiagram:`+---------------- Ethernet Frame (Кадр L2) ----------------+
| Dst MAC (6B) | Src MAC (6B) | 802.1Q (опц.) | EtherType (2B) |
+-------------------------------------------------------------+
|               PAYLOAD (L3 IP-пакет, 46-1500B)               |
+-------------------------------------------------------------+
|                      FCS / CRC32 (4B)                       |
+-------------------------------------------------------------+`,keyTakeaways:[`Минимальный размер кадра Ethernet — 64 байта (с преамбулой 72 байта)`,`Максимальный размер стандартного payload — 1500 байт (MTU)`]},"l2-03":{category:`l2`,categoryLabel:`L2 · Коммутация и CAM-таблица`,categoryColor:`from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30`,coreConcept:`Коммутатор изучает MAC-адреса исключительно по полю Source MAC входящих кадров.`,deepAnalysis:`Когда кадр приходит на порт коммутатора, микросхема ASIC смотрит на Source MAC и связывает его с этим входящим портом в CAM-таблице (Content Addressable Memory). Затем коммутатор смотрит на Destination MAC: если он известен в таблице — кадр отправляется строго в нужный порт (Unicast). Если неизвестен — выполняется Unknown Unicast Flooding (рассылка во все порты, кроме входящего).`,commonTrap:`Ошибочно полагать, что коммутатор изучает адреса по Destination MAC. Destination MAC используется только для принятия решения о пересылке (Forwarding), а не для обучения.`,practicalTip:"В CLI Cisco/Linux используйте `show mac address-table` или `bridge fdb show` для просмотра изученных пар порт-MAC.",keyTakeaways:[`Обучение: по адресу отправителя (Source MAC)`,`Пересылка: по адресу получателя (Destination MAC)`]},"l2-07":{category:`l2`,categoryLabel:`L2 · Виртуальные сети VLAN (802.1Q)`,categoryColor:`from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30`,coreConcept:`VLAN делит один физический коммутатор на изолированные широковещательные домены на канальном уровне.`,deepAnalysis:`Без маршрутизатора (или L3-коммутатора) хосты в разных VLAN не могут общаться, даже если у них адреса из одной подсети. Стандарт IEEE 802.1Q добавляет в заголовок кадра 4-байтный тег: 2 байта TPID (0x8100) и 2 байта TCI (3 бита приоритета PCP, 1 бит DEI и 12 бит VLAN ID, что дает от 1 до 4094 доступных VLAN).`,commonTrap:`Полагать, что VLAN работает на L3. VLAN — это чистый L2 механизм сегментации трафика и разграничения broadcast-доменов.`,visualDiagram:`802.1Q Tag (4 байта):
[ TPID: 0x8100 (16 бит) ] 
[ PCP: Priority (3b) | DEI: Drop (1b) | VID: VLAN ID (12 бит, 1-4094) ]`,keyTakeaways:[`Access-порт: передает нетегированные кадры конечному хосту`,`Trunk-порт: передает кадры нескольких VLAN с 802.1Q тегами между свитчами`]},"l3-01":{category:`l3`,categoryLabel:`L3 · Сетевой уровень · TTL и ICMP`,categoryColor:`from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30`,coreConcept:`При получении пакета с TTL=1 маршрутизатор уменьшает его до 0, уничтожает пакет и отправляет источнику ICMP Time Exceeded (Type 11).`,deepAnalysis:"Поле TTL (Time to Live) размером 8 бит предотвращает бесконечное блуждание пакетов по сети при петлях маршрутизации. Каждый транзитный маршрутизатор обязан уменьшить TTL минимум на 1 (декремент). Если TTL становится равным 0, пакет дальше не передается. На этом же механизме построена работа утилиты `traceroute`, которая отправляет пакеты с TTL=1, 2, 3...",commonTrap:`Думать, что пакет дойдет до получателя, если у него TTL=1. Маршрутизатор декрементирует TTL ДО пересылки в следующий интерфейс!`,practicalTip:`Если пинг возвращает «Time to live exceeded», проверьте таблицу маршрутизации на наличие взаимной петли между соседними узлами.`,memorizationRule:`TTL декрементируется роутером. TTL=0 → DROP + ICMP Type 11 (Time Exceeded).`,keyTakeaways:[`Предотвращает зацикливание пакетов в топологии`,`Основа алгоритма работы traceroute / mtr`]},"l3-02":{category:`l3`,categoryLabel:`L3 · Заголовок IPv4 · Поле Protocol`,categoryColor:`from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30`,coreConcept:`В заголовке IPv4 номер протокола указывает, какому протоколу L4 передать полезную нагрузку: 1 = ICMP, 6 = TCP, 17 = UDP, 89 = OSPF.`,deepAnalysis:`Поле Protocol (8 бит) в заголовке IPv4 необходимо стеку TCP/IP на принимающем хосте для демультиплексирования. Увидев число 6, ядро ОС отдает данные модулю TCP; увидев 17 — модулю UDP; увидев 1 — модулю ICMP.`,commonTrap:`Путать номер протокола в IP-заголовке (Protocol Number) и номера портов TCP/UDP (Port Numbers). Номер протокола — это поле IP (L3), а порты живут внутри заголовков L4.`,memorizationRule:`ICMP = 1 | TCP = 6 | UDP = 17 | GRE = 47 | ESP = 50 | OSPF = 89.`,keyTakeaways:[`TCP = 6`,`UDP = 17`,`ICMP = 1`]},"l3-04":{category:`l3`,categoryLabel:`L3 · Маршрутизация · Маршрут по умолчанию`,categoryColor:`from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30`,coreConcept:`Маршрут 0.0.0.0/0 (Default Gateway / Шлюз последней надежды) совпадает с любым IPv4-адресом и используется, если более точного маршрута нет.`,deepAnalysis:`Префикс /0 означает, что для совпадения проверяется 0 бит IP-адреса, то есть любой возможный адрес назначения подойдет. Согласно правилу Longest Prefix Match, маршрутизатор сначала ищет более длинные префиксы (/32 хостовой, /24 подсеть, /16 агрегат). Если совпадений нет — пакет уходит на шлюз 0.0.0.0/0.`,commonTrap:`Считать 0.0.0.0/0 широковещательным адресом. 0.0.0.0/0 — это обозначение "любой сети" в правилах маршрутизации и фаерволах.`,practicalTip:"В Linux проверяется командой `ip route show` (строка начинается со слова `default via ...`).",keyTakeaways:[`Шлюз по умолчанию имеет наименьший приоритет длины маски (/0)`,`Если нет шлюза по умолчанию и нет точного маршрута, роутер шлет ICMP Destination Net Unreachable`]},"l3-05":{category:`l3`,categoryLabel:`L3 · Маршрутизация · Longest Prefix Match`,categoryColor:`from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30`,coreConcept:`Маршрутизатор ВСЕГДА выбирает маршрут с наиболее длинной маской (наиболее специфичный префикс).`,deepAnalysis:`Если в таблице маршрутизации для адреса 10.0.5.20 есть варианты 10.0.0.0/16 via A и 10.0.5.0/24 via B, пакет пойдет через B, потому что маска /24 длиннее (24 совпадающих бита против 16). Метрика и административная дистанция учитываются только между маршрутами с ОДИНАКОВОЙ длиной префикса!`,commonTrap:`Ошибочно смотреть на метрику до длины маски. Длина маски превалирует над метрикой.`,memorizationRule:`Longest Prefix Match (наибольшее число бит маски) всегда побеждает.`,keyTakeaways:[`/32 (хост) бьет /24 (подсеть), /24 бьет /16, /16 бьет default /0`,`Специфичность — главный критерий выбора маршрута в FIB`]},"l3-06":{category:`l3`,categoryLabel:`L3 · Маски подсети IPv4`,categoryColor:`from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30`,coreConcept:`Маска /24 содержит 24 единичных бита подряд, что соответствует десятичному виду 255.255.255.0.`,deepAnalysis:`IPv4-адрес состоит из 32 бит. Первые 24 бита отданы под адрес сети (3 октета по 8 единиц: 11111111.11111111.11111111.00000000), а последние 8 бит — под адреса хостов ($2^8 = 256$ адресов всего, 254 доступно для назначения хостам).`,commonTrap:`Путать количество хостов (254) и общее число адресов с учетом сети и broadcast (256).`,ipv4Practice:{enabled:!0,reason:`Маска /24 — базовый стандарт. Попробуйте рассчитать диапазон хостов и маску в тренажёре.`,targetPrefix:24,targetMode:`calc`},keyTakeaways:[`/24 = 255.255.255.0`,`Всего адресов: 256, доступных хостов: 254`]},"l3-07":{category:`l3`,categoryLabel:`L3 · Двоичный расчет октетов маски`,categoryColor:`from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30`,coreConcept:`Октет 11111100 в двоичной системе равен 252 в десятичной (128 + 64 + 32 + 16 + 8 + 4 = 252).`,deepAnalysis:`Позиционные веса 8 бит октета: 128, 64, 32, 16, 8, 4, 2, 1. Для 11111100 сложим первые 6 степеней двойки: $255 - 2 - 1 = 252$. Это соответствует маске /30 (24 + 6 = 30 бит). Шаг такой подсети равен $256 - 252 = 4$ адреса.`,commonTrap:`Арифметическая ошибка при сложении степеней двойки. Проще вычитать нулевые биты: $255 - (2 + 1) = 252$.`,memorizationRule:`128 → 192 → 224 → 240 → 248 → 252 → 254 → 255 (шаги: 128, 64, 32, 16, 8, 4, 2, 1).`,ipv4Practice:{enabled:!0,reason:`Отработайте перевод октетов между двоичной и десятичной системами в интерактивном режиме.`,targetPrefix:30,targetMode:`trainer`},keyTakeaways:[`11111100 = 252`,`В подсети /30 доступно всего 2 хоста (линки точка-точка)`]},"l3-08":{category:`l3`,categoryLabel:`L3 · Расчет адреса подсети (/26)`,categoryColor:`from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30`,coreConcept:`Для IP 192.168.10.70/26 адрес сети равен 192.168.10.64.`,deepAnalysis:`Префикс /26 означает, что в 4-м октете маски занято 2 бита (11000000 = 192). Шаг подсети (Magic Number) равен $256 - 192 = 64$. Подсети идут с шагом 64: .0, .64, .128, .192. Адрес 70 попадает в диапазон от 64 до 127. Следовательно, адрес сети — 192.168.10.64.`,commonTrap:`Ошибочно считать адресом сети .0. В разбитой на подсети сети .0 — лишь первая из четырех подсетей.`,memorizationRule:`Magic Number = 256 - Маска интересного октета. Для /26: 256 - 192 = 64. Сетки: 0, 64, 128, 192.`,ipv4Practice:{enabled:!0,reason:`Проверьте расчет адреса сети, первого хоста и broadcast для маски /26 в калькуляторе.`,targetPrefix:26,targetMode:`calc`},keyTakeaways:[`Маска /26 = 255.255.255.192 (шаг 64)`,`Сеть для .70: 192.168.10.64, первый хост: .65, последний: .126, broadcast: .127`]},"l3-09":{category:`l3`,categoryLabel:`L3 · Расчет Broadcast-адреса (/26)`,categoryColor:`from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30`,coreConcept:`Для подсети 192.168.10.64/26 широковещательный адрес (Broadcast) равен 192.168.10.127.`,deepAnalysis:`Broadcast — это последний адрес в диапазоне подсети, где все биты хостовой части равны единицам. Поскольку шаг подсети равен 64, следующая подсеть начнется с адреса 192.168.10.128. Адрес прямо перед ней (128 - 1 = 127) и является широковещательным.`,commonTrap:`Путаница между последним адресом хоста (.126) и широковещательным адресом (.127). Хост не может иметь broadcast-адрес!`,ipv4Practice:{enabled:!0,reason:`Закрепите навык мгновенного нахождения broadcast-адреса по шагу подсети.`,targetPrefix:26,targetMode:`calc`},keyTakeaways:[`Broadcast = Адрес следующей сети - 1`,`Для сети .64/26 broadcast равен 192.168.10.127`]},"l3-10":{category:`l3`,categoryLabel:`L3 · Количество пригодных хостов (/27)`,categoryColor:`from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30`,coreConcept:`Подсеть /27 содержит 30 пригодных для назначения адресов хостов ($2^{32-27} - 2 = 32 - 2 = 30$).`,deepAnalysis:`Всего в IPv4 32 бита. При маске /27 на хостовую часть остается $32 - 27 = 5$ бит. Число возможных комбинаций: $2^5 = 32$. Вычитаем 2 зарезервированных адреса (адрес самой сети, где все биты 0, и broadcast, где все биты 1). Итого: $32 - 2 = 30$ хостов.`,commonTrap:`Забыть вычесть 2 адреса (сеть и broadcast) и ответить 32.`,memorizationRule:`Формула хостов: 2^(32 - Prefix) - 2. Для /27: 2^5 - 2 = 32 - 2 = 30 хостов.`,ipv4Practice:{enabled:!0,reason:`Потренируйте быстрый расчет хостов для масок от /24 до /30 в тренажёре.`,targetPrefix:27,targetMode:`trainer`},keyTakeaways:[`/27: 32 всего, 30 полезных`,`/28: 16 всего, 14 полезных`,`/29: 8 всего, 6 полезных`,`/30: 4 всего, 2 полезных`]},"l4-02":{category:`l4`,categoryLabel:`L4 · Транспортный уровень · 3-Way Handshake TCP`,categoryColor:`from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30`,coreConcept:`Установка TCP-соединения происходит строго в 3 шага: SYN → SYN+ACK → ACK.`,deepAnalysis:`Клиент отправляет пакет с флагом SYN и случайным начальным номером последовательности ISN (Initial Sequence Number). Сервер подтверждает получение флагом ACK (увеличивая номер на 1) и синхронизирует свой поток флагом SYN со своим ISN. Клиент завершает рукопожатие отправкой ACK. Соединение переходит в состояние ESTABLISHED.`,commonTrap:`Путать порядок флагов. Сервер отвечает не просто ACK, а ОБЯЗАТЕЛЬНО комбинацией SYN+ACK!`,memorizationRule:`1) Привет, давай свяжемся (SYN) 2) Привет, согласен, а ты готов? (SYN-ACK) 3) Да, готов, погнали (ACK).`,visualDiagram:`Client                               Server
  |                                     |
  | -------- 1. [SYN, Seq=x] ---------> | (LISTEN -> SYN_RCVD)
  |                                     |
  | <--- 2. [SYN+ACK, Seq=y, Ack=x+1] - |
  |                                     |
  | ------- 3. [ACK, Ack=y+1] --------> |
  v                                     v
(ESTABLISHED)                       (ESTABLISHED)`,keyTakeaways:[`SYN расходует 1 номер в пространстве Sequence Number`,`Защищает от дублирования старых пакетов из прошлых сессий`]},"l4-03":{category:`l4`,categoryLabel:`L4 · TCP vs UDP · Контроль перегрузок`,categoryColor:`from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30`,coreConcept:`TCP обеспечивает гарантированную доставку, упорядочивание и контроль перегрузки; UDP передает дейтаграммы без гарантий и без задержек на подтверждения.`,deepAnalysis:`UDP имеет фиксированный минимальный заголовок всего 8 байт (Source Port, Dest Port, Length, Checksum) против минимум 20 байт у TCP. В UDP нет механизма повторных передач (Retransmission) и нет окна перегрузки (Congestion Window), поэтому он идеален для real-time трафика (VoIP, видеостриминг, онлайн-игры, DNS), где потеря пакета лучше, чем задержка очереди.`,commonTrap:`Считать UDP «плохим или ненадежным». UDP спроектирован для минимизации задержек; надежность при необходимости реализуется на прикладном уровне (как в QUIC/HTTP3).`,visualDiagram:`+-----------------------+-----------------------+
| Свойство             | TCP                   | UDP                   |
+-----------------------+-----------------------+-----------------------+
| Соединение            | Connection-Oriented   | Connectionless        |
| Надежность            | Гарантия ACK + Retran | Без подтверждений     |
| Размер заголовка      | 20-60 байт            | 8 байт (фиксированно) |
| Порядок доставки      | Строго по Seq Number  | Не гарантируется      |
+-----------------------+-----------------------+-----------------------+`,keyTakeaways:[`TCP: надёжно, медленнее, контролирует поток`,`UDP: быстро, без оверхеда, без состояний рукопожатия`]},"l7-02":{category:`l5_l7`,categoryLabel:`L7 · Протокол DHCP · Процесс DORA`,categoryColor:`from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30`,coreConcept:`Получение адреса по DHCP происходит по алгоритму DORA: Discover → Offer → Request → Acknowledge.`,deepAnalysis:`1) Discover: клиент шлет broadcast на L2 и L3 (Dst IP 255.255.255.255, UDP port 67) в поисках серверов. 2) Offer: DHCP-сервер предлагает IP-адрес. 3) Request: клиент подтверждает broadcast-запросом, что выбрал именно этот сервер. 4) Acknowledge (ACK): сервер подтверждает аренду (Lease Time) и передает маску, шлюз и DNS.`,commonTrap:`Забыть мнемонику DORA или перепутать порядок Offer и Request.`,memorizationRule:`D - Discover | O - Offer | R - Request | A - Acknowledge (D-O-R-A).`,visualDiagram:`Client (0.0.0.0:68)                 DHCP Server (Port 67)
  |                                          |
  | -- 1. DHCP Discover (Broadcast) -------> |
  |                                          |
  | <---- 2. DHCP Offer (Unicast/Bcast) ---- |
  |                                          |
  | -- 3. DHCP Request (Broadcast) --------> |
  |                                          |
  | <---- 4. DHCP ACK (Unicast/Bcast) ------ |
  v                                          v`,keyTakeaways:[`DHCP работает поверх UDP (порт 67 сервер, порт 68 клиент)`,`Client шлет Discover с IP 0.0.0.0 на broadcast 255.255.255.255`]},"l7-04":{category:`l5_l7`,categoryLabel:`L7 · DNS · Рекурсия и типы записей`,categoryColor:`from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30`,coreConcept:`DNS преобразует человекочитаемые доменные имена в IP-адреса. Запись A хранит IPv4, AAAA — IPv6, CNAME — канонический псевдоним.`,deepAnalysis:`DNS-запросы стандартно отправляются по UDP на порт 53 для скорости. Однако, если размер ответа превышает 512 байт (или при трансфере зон AXFR), DNS переключается на TCP порт 53. В рекурсивном запросе локальный резолвер берет на себя обход корневых серверов (Root .), серверов зоны (TLD .ru) и авторитативных серверов домена.`,commonTrap:`Считать, что DNS работает ТОЛЬКО по UDP. При ответах > 512 байт или DNSSEC/AXFR используется TCP 53!`,practicalTip:"В терминале проверяйте командой `dig domain.com +trace` или `nslookup -type=any domain.com`.",keyTakeaways:[`A = IPv4, AAAA = IPv6, CNAME = Alias, MX = Mail, PTR = Reverse IP-to-Domain`,`Порт 53 UDP (для обычных запросов) и TCP (для больших ответов и AXFR)`]}};function Fe(e){if(Pe[e.id]){let t=Pe[e.id];return{questionId:e.id,category:t.category||Ie(e),categoryLabel:t.categoryLabel||e.topic,categoryColor:t.categoryColor||Le(Ie(e)),coreConcept:t.coreConcept||ze(e),deepAnalysis:t.deepAnalysis||e.explanation,commonTrap:t.commonTrap||Ve(e),practicalTip:t.practicalTip||e.remember,memorizationRule:t.memorizationRule||e.remember,visualDiagram:t.visualDiagram,ipv4Practice:t.ipv4Practice||Re(e),keyTakeaways:t.keyTakeaways||[e.explanation.slice(0,80)+`...`,`Проверьте правильный ответ перед повторным тестированием`]}}let t=Ie(e),n=Re(e),r=Ve(e),i=Ue(e,t);return{questionId:e.id,category:t,categoryLabel:e.topic,categoryColor:Le(t),coreConcept:ze(e),deepAnalysis:Be(e,t),commonTrap:r,practicalTip:e.remember||He(e,t),memorizationRule:e.remember,visualDiagram:i,ipv4Practice:n,keyTakeaways:We(e,t)}}function Ie(e){return e.group===`visual-l1`?`visual`:e.group===`troubleshooting`||e.topic.includes(`Диагностика`)?`cli`:e.group===`tcpip`||e.topic.includes(`TCP/IP`)||e.topic.includes(`Инкапсуляция`)?`tcpip`:e.group===`l4`||e.topic.includes(`L4`)||e.topic.includes(`TCP`)||e.topic.includes(`UDP`)?`l4`:e.group===`l5-l7`||e.topic.includes(`L5`)||e.topic.includes(`L7`)||e.topic.includes(`DNS`)||e.topic.includes(`DHCP`)||e.topic.includes(`HTTP`)?`l5_l7`:e.group===`l3`||e.topic.includes(`L3`)||e.topic.includes(`IPv4`)||e.topic.includes(`Маски`)||e.topic.includes(`Подсети`)?`l3`:e.group===`l1-l2`?e.topic.includes(`L1`)||e.topic.includes(`Оптика`)||e.topic.includes(`Физический`)?`l1`:`l2`:`l3`}function Le(e){switch(e){case`l1`:return`from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30`;case`l2`:return`from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30`;case`l3`:return`from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30`;case`l4`:return`from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30`;case`l5_l7`:return`from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30`;case`tcpip`:return`from-violet-500/20 to-purple-500/10 text-violet-300 border-violet-500/30`;case`cli`:return`from-lime-500/20 to-emerald-500/10 text-lime-300 border-lime-500/30`;case`visual`:return`from-fuchsia-500/20 to-indigo-500/10 text-fuchsia-300 border-fuchsia-500/30`;default:return`from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/30`}}function Re(e){let t=e.topic.includes(`Маски`)||e.topic.includes(`Подсети`)||e.topic.includes(`Биты маски`)||e.family?.startsWith(`subnet-`)||e.family?.startsWith(`gen-bin-dec`)||e.family?.startsWith(`gen-dec-bin`)||e.text.includes(`пригодных адресов`)||e.text.includes(`broadcast`)||e.text.includes(`адрес сети у`),n=e.text.includes(`TTL`)||e.text.includes(`NAT`)||e.text.includes(`протокол имеет номер`)||e.text.includes(`шлюз по умолчанию`)||e.text.includes(`0.0.0.0/0`)||e.text.includes(`ICMP`);if(t&&!n){let t=24,n=e.text.match(/\/(\d{2})/);return n?t=parseInt(n[1],10):e.family?.includes(`26`)?t=26:e.family?.includes(`27`)?t=27:e.family?.includes(`28`)?t=28:e.family?.includes(`29`)?t=29:e.family?.includes(`30`)&&(t=30),{enabled:!0,reason:`В этом вопросе проверяется навык расчёта маски /${t}. Отработайте математику подсетей в интерактивном тренажёре.`,targetPrefix:t,targetMode:e.text.includes(`двоич`)||e.text.includes(`октет`)?`trainer`:`calc`}}}function ze(e){return`Правильный ответ: «${e.correct.map(t=>e.answers[t]).join(`; `)}». Ключевой принцип темы «${e.topic}».`}function Be(e,t){if(e.explanation&&e.explanation.length>80)return e.explanation;switch(t){case`l1`:return`${e.explanation} Физический уровень отвечает за передачу неструктурированного битового потока через физическую среду передачи (медь, оптику, радиоканал), характеристики сигналов и типы разъемов.`;case`l2`:return`${e.explanation} Канальный уровень обеспечивает адресацию внутри одного локального сегмента по MAC-адресам, проверку целостности кадров (FCS CRC-32) и разграничение broadcast-доменов через VLAN.`;case`l3`:return`${e.explanation} Сетевой уровень выполняет сквозную маршрутизацию пакетов между различными сегментами сетей с помощью логических IP-адресов и таблиц пересылки (FIB/RIB).`;case`l4`:return`${e.explanation} Транспортный уровень отвечает за взаимодействие между конкретными процессами операционной системы через номера портов (0–65535) и управление потоком данных.`;case`l5_l7`:return`${e.explanation} Прикладной уровень предоставляет стандартизированные протоколы и интерфейсы для взаимодействия пользовательских приложений и сетевых сервисов.`;case`cli`:return`${e.explanation} Для надежной сетевой диагностики всегда важно локализовать уровень неисправности по модели OSI: от физики кабеля до L7-приложений.`;case`visual`:return`${e.explanation} Внимание к маркировке, типу волокна (SMF 9/125 vs MMF 50/125) и типу полировки коннекторов (UPC синий vs APC зеленый) критично при монтаже ВОЛС и СКС.`;default:return e.explanation}}function Ve(e){return e.text.includes(`маск`)||e.text.includes(`хост`)?`Частая ошибка: забывают вычесть 2 зарезервированных адреса (адрес подсети и broadcast) или путают шаг подсети с количеством хостов.`:e.text.includes(`кадр`)||e.text.includes(`пакет`)||e.text.includes(`сегмент`)?`Типичная путаница терминов PDU: кадр (L2 Ethernet) часто ошибочно называют пакетом (L3 IP), а сегмент (L4 TCP) — датаграммой.`:e.text.includes(`коммутатор`)||e.text.includes(`switch`)?`Распространенное заблуждение: коммутатор обучается по Destination MAC, хотя на самом деле он смотрит только на Source MAC входящего кадра.`:e.text.includes(`TTL`)?`Ошибочно полагают, что при TTL=1 пакет дойдет до получателя. Маршрутизатор декрементирует TTL ПЕРЕД пересылкой, поэтому пакет отбрасывается.`:e.text.includes(`TCP`)||e.text.includes(`UDP`)?`Путаница между флагами и надежностью: думают, что UDP вообще не проверяет ошибки (хотя у него есть контрольная сумма Checksum) или забывают про SYN+ACK.`:e.group===`visual-l1`||e.topic.includes(`Оптика`)?`Опасная ошибка в монтаже: соединение коннекторов UPC (синий, прямой торец) и APC (зеленый, скос 8 градусов) приводит к сколу оптического волокна!`:`Обратите внимание на точные формулировки стандартов и исключения из общих правил.`}function He(e,t){switch(t){case`cli`:return`В боевых условиях всегда проверяйте статус линка (L1/L2) перед диагностикой маршрутов или DNS.`;case`l3`:return"Команда `ip route show` в Linux или `route print` в Windows быстро отображает порядок метрик и активные шлюзы.";case`l4`:return"Утилита `ss -tulpn` моментально показывает слушающие сокеты, PID процессов и связанные порты.";case`l2`:return`Таблица CAM очищается по тайм-ауту (обычно 300 секунд), если узел долго не отправляет кадры.`;default:return`Запомните фундаментальный принцип: каждый уровень модели OSI решает строго свою задачу и инкапсулирует вышележащий PDU.`}}function Ue(e,t){if(e.topic.includes(`Подсети`)||e.topic.includes(`Маски`))return`+-------------------------------------------------------------+
| Формула подсетей: Шаг (Magic Number) = 256 - Маска октета   |
| Хостов в подсети = 2^(32 - Префикс) - 2                     |
+-------------------------------------------------------------+`;if(e.topic.includes(`TCP`)||e.topic.includes(`Handshake`))return`Client                  Server
  | ----- 1. [SYN] ------> |
  | <--- 2. [SYN+ACK] ---- |
  | ----- 3. [ACK] ------> |`;if(e.topic.includes(`Единицы данных`)||e.topic.includes(`PDU`))return`[ L7 Данные ] -> [ L4 Сегмент TCP/UDP ] -> [ L3 IP-пакет ] -> [ L2 Кадр Ethernet ] -> [ L1 Биты ]`}function We(e,t){return[`Правильный ответ: ${e.correct.map(t=>e.answers[t]).join(`, `)}`,`Тематический блок: ${e.topic}`,t===`l3`&&e.text.includes(`/`)?`Расчёт маски и хостов автоматизирован в разделе IPv4-тренажёра`:`Внимательно проверяйте модель OSI и соответствие стандартам`]}var Ge=({initialQuestionId:e,onNavigateToIpv4:t,onClearInitialQuestion:n})=>{let[r,i]=(0,q.useState)(`questions`),[a,o]=(0,q.useState)(``),[s,c]=(0,q.useState)(`all`),[l,f]=(0,q.useState)(!1),[p,m]=(0,q.useState)({}),[h,g]=(0,q.useState)([]),v=(0,q.useRef)(null);(0,q.useEffect)(()=>{try{let e=localStorage.getItem(`osi_last_mistakes`);if(e){let t=JSON.parse(e);Array.isArray(t)&&g(t)}}catch{}},[]),(0,q.useEffect)(()=>{e&&(i(`questions`),c(`all`),o(``),m(t=>({...t,[e]:!0})),setTimeout(()=>{v.current&&v.current.scrollIntoView({behavior:`smooth`,block:`center`})},150))},[e]);let y=e=>{m(t=>({...t,[e]:!t[e]}))},b=()=>{let e={};w.slice(0,50).forEach(t=>{e[t.id]=!0}),m(e)},C=()=>{m({})},w=(0,q.useMemo)(()=>Y.filter(e=>{if(s===`mistakes`){if(!h.includes(e.id))return!1}else if(s!==`all`&&(s===`l1`&&(e.group!==`l1-l2`||!e.topic.includes(`L1`)&&!e.topic.includes(`Оптика`))||s===`l2`&&(e.group!==`l1-l2`||e.topic.includes(`L1`)||e.topic.includes(`Оптика`))||s===`l3`&&e.group!==`l3`||s===`l4`&&e.group!==`l4`||s===`l5-l7`&&e.group!==`l5-l7`||s===`tcpip`&&e.group!==`tcpip`||s===`troubleshooting`&&e.group!==`troubleshooting`||s===`visual`&&e.group!==`visual-l1`))return!1;if(l&&!Fe(e).ipv4Practice?.enabled)return!1;if(a.trim()){let t=a.toLowerCase().trim(),n=e.id.toLowerCase().includes(t),r=e.text.toLowerCase().includes(t),i=e.topic.toLowerCase().includes(t),o=e.answers.some(e=>e.toLowerCase().includes(t)),s=e.explanation.toLowerCase().includes(t);return n||r||i||o||s}return!0}),[a,s,l,h]);return(0,J.jsxs)(`div`,{className:`space-y-6 max-w-5xl mx-auto w-full`,children:[(0,J.jsxs)(`div`,{className:`p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl relative overflow-hidden`,children:[(0,J.jsx)(`div`,{className:`absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none`}),(0,J.jsxs)(`div`,{className:`relative z-10 space-y-3`,children:[(0,J.jsxs)(`div`,{className:`inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase`,children:[(0,J.jsx)(T,{className:`w-3.5 h-3.5 text-cyan-400`}),`Учебный раздел · Теория и разборы`]}),(0,J.jsx)(`h1`,{className:`text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight`,children:`Теория сетевых моделей и разборы всех 502 вопросов`}),(0,J.jsx)(`p`,{className:`text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed`,children:`Качественный разбор вопросов тренажёра: суть концепции, логика работы протокола под капотом, разбор типичных ошибок и интерактивная отработка расчетных задач в IPv4-тренажёре.`}),(0,J.jsxs)(`div`,{className:`grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2`,children:[(0,J.jsxs)(`div`,{className:`p-3 rounded-2xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-[10px] text-slate-400 font-mono block`,children:`Всего вопросов`}),(0,J.jsx)(`span`,{className:`text-lg font-black text-cyan-400 font-mono`,children:`502`})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-2xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-[10px] text-slate-400 font-mono block`,children:`Уровней OSI`}),(0,J.jsx)(`span`,{className:`text-lg font-black text-blue-400 font-mono`,children:`7 уровней`})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-2xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-[10px] text-slate-400 font-mono block`,children:`Связка с IPv4`}),(0,J.jsx)(`span`,{className:`text-lg font-black text-emerald-400 font-mono`,children:`Тренажёр масок`})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-2xl bg-slate-900/60 border border-slate-800`,children:[(0,J.jsx)(`span`,{className:`text-[10px] text-slate-400 font-mono block`,children:`Ошибок в памяти`}),(0,J.jsxs)(`span`,{className:`text-lg font-black text-amber-400 font-mono`,children:[h.length,` вопр.`]})]})]})]})]}),e&&(0,J.jsxs)(`div`,{className:`p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-900 border border-cyan-400/50 shadow-lg shadow-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,J.jsxs)(`div`,{className:`w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-mono font-bold text-xs shrink-0`,children:[`#`,e]}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`text-xs font-bold text-white block`,children:`Фокус на вопросе из вашей работы над ошибками`}),(0,J.jsx)(`span`,{className:`text-[11px] text-slate-300`,children:`Карточка вопроса развернута ниже с подробным разбором сути и ловушек.`})]})]}),(0,J.jsx)(`button`,{onClick:()=>{n&&n(),o(``),c(`all`)},type:`button`,className:`px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer shrink-0 transition-colors self-start sm:self-auto`,children:`Показать весь каталог вопросов`})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/70 border border-slate-800 overflow-x-auto text-xs font-bold`,children:[(0,J.jsxs)(`button`,{onClick:()=>i(`questions`),type:`button`,className:`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${r===`questions`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20`:`text-slate-400 hover:text-white hover:bg-white/5`}`,children:[(0,J.jsx)(H,{className:`w-4 h-4`}),(0,J.jsxs)(`span`,{children:[`Разборы вопросов (`,w.length,`)`]})]}),(0,J.jsxs)(`button`,{onClick:()=>i(`handbook`),type:`button`,className:`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${r===`handbook`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20`:`text-slate-400 hover:text-white hover:bg-white/5`}`,children:[(0,J.jsx)(K,{className:`w-4 h-4`}),(0,J.jsx)(`span`,{children:`7 Уровней OSI и стек TCP/IP`})]}),(0,J.jsxs)(`button`,{onClick:()=>i(`ports`),type:`button`,className:`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${r===`ports`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20`:`text-slate-400 hover:text-white hover:bg-white/5`}`,children:[(0,J.jsx)(S,{className:`w-4 h-4`}),(0,J.jsx)(`span`,{children:`Таблица портов (Well-Known)`})]}),(0,J.jsxs)(`button`,{onClick:()=>i(`subnet-table`),type:`button`,className:`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 ${r===`subnet-table`?`bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20`:`text-slate-400 hover:text-white hover:bg-white/5`}`,children:[(0,J.jsx)(G,{className:`w-4 h-4 text-amber-400`}),(0,J.jsx)(`span`,{children:`Шпаргалка масок и хостов IPv4`})]})]}),r===`questions`&&(0,J.jsxs)(`div`,{className:`space-y-4`,children:[(0,J.jsxs)(`div`,{className:`p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 space-y-3`,children:[(0,J.jsxs)(`div`,{className:`relative`,children:[(0,J.jsx)(H,{className:`w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none`}),(0,J.jsx)(`input`,{type:`text`,value:a,onChange:e=>o(e.target.value),placeholder:`Поиск по номеру (#l3-08), тексту вопроса, термину (ARP, TTL, SYN, /26)...`,className:`w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono`}),a&&(0,J.jsx)(`button`,{onClick:()=>o(``),type:`button`,className:`absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer`,children:`✕`})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5 flex-wrap text-xs`,children:[(0,J.jsx)(`button`,{onClick:()=>c(`all`),type:`button`,className:`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer ${s===`all`?`bg-cyan-500 text-slate-950`:`bg-slate-900 text-slate-400 hover:text-white border border-slate-800`}`,children:`Все темы`}),h.length>0&&(0,J.jsxs)(`button`,{onClick:()=>c(`mistakes`),type:`button`,className:`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 ${s===`mistakes`?`bg-rose-500 text-slate-950 font-black`:`bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/40`}`,children:[(0,J.jsx)(O,{className:`w-3.5 h-3.5`}),(0,J.jsxs)(`span`,{children:[`Мои ошибки (`,h.length,`)`]})]}),(0,J.jsx)(`button`,{onClick:()=>c(`l3`),type:`button`,className:`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${s===`l3`?`bg-cyan-500 text-slate-950 font-bold`:`bg-slate-900 text-slate-400 hover:text-white border border-slate-800`}`,children:`L3 IPv4 & Маски`}),(0,J.jsx)(`button`,{onClick:()=>c(`l4`),type:`button`,className:`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${s===`l4`?`bg-blue-500 text-slate-950 font-bold`:`bg-slate-900 text-slate-400 hover:text-white border border-slate-800`}`,children:`L4 TCP & UDP`}),(0,J.jsx)(`button`,{onClick:()=>c(`l2`),type:`button`,className:`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${s===`l2`?`bg-emerald-500 text-slate-950 font-bold`:`bg-slate-900 text-slate-400 hover:text-white border border-slate-800`}`,children:`L2 Ethernet & VLAN`}),(0,J.jsx)(`button`,{onClick:()=>c(`l1`),type:`button`,className:`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${s===`l1`?`bg-amber-500 text-slate-950 font-bold`:`bg-slate-900 text-slate-400 hover:text-white border border-slate-800`}`,children:`L1 Физика & Оптика`}),(0,J.jsx)(`button`,{onClick:()=>c(`l5-l7`),type:`button`,className:`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${s===`l5-l7`?`bg-pink-500 text-slate-950 font-bold`:`bg-slate-900 text-slate-400 hover:text-white border border-slate-800`}`,children:`L5–L7 DNS, DHCP, HTTP`}),(0,J.jsx)(`button`,{onClick:()=>c(`troubleshooting`),type:`button`,className:`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${s===`troubleshooting`?`bg-lime-500 text-slate-950 font-bold`:`bg-slate-900 text-slate-400 hover:text-white border border-slate-800`}`,children:`Диагностика & CLI`}),(0,J.jsx)(`button`,{onClick:()=>c(`visual`),type:`button`,className:`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer ${s===`visual`?`bg-indigo-500 text-slate-950 font-bold`:`bg-slate-900 text-slate-400 hover:text-white border border-slate-800`}`,children:`Фото оборудования (L1)`})]}),(0,J.jsxs)(`div`,{className:`pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs`,children:[(0,J.jsxs)(`label`,{className:`flex items-center gap-2 cursor-pointer select-none text-slate-300`,children:[(0,J.jsx)(`input`,{type:`checkbox`,checked:l,onChange:e=>f(e.target.checked),className:`w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer`}),(0,J.jsx)(`span`,{className:`font-semibold text-cyan-300`,children:`⚡ Только с переходом в IPv4-тренажёр (расчет масок/хостов)`})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-3 text-slate-400 font-mono text-[11px]`,children:[(0,J.jsx)(`button`,{onClick:b,type:`button`,className:`hover:text-cyan-400 cursor-pointer transition-colors`,children:`Развернуть первые 50`}),(0,J.jsx)(`span`,{children:`•`}),(0,J.jsx)(`button`,{onClick:C,type:`button`,className:`hover:text-cyan-400 cursor-pointer transition-colors`,children:`Свернуть все`})]})]})]}),w.length===0?(0,J.jsxs)(`div`,{className:`p-12 text-center rounded-3xl glass-panel border border-slate-800 space-y-3`,children:[(0,J.jsx)(_,{className:`w-12 h-12 text-slate-500 mx-auto`}),(0,J.jsx)(`h3`,{className:`text-base font-bold text-white`,children:`Ничего не найдено`}),(0,J.jsx)(`p`,{className:`text-xs text-slate-400 max-w-sm mx-auto`,children:`Попробуйте изменить поисковый запрос или сбросить фильтры категорий.`}),(0,J.jsx)(`button`,{onClick:()=>{o(``),c(`all`),f(!1)},type:`button`,className:`px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer hover:brightness-110`,children:`Сбросить фильтры`})]}):(0,J.jsxs)(`div`,{className:`space-y-4`,children:[w.slice(0,100).map(n=>{let r=!!p[n.id],i=n.id===e,a=h.includes(n.id),o=Fe(n);return(0,J.jsxs)(`div`,{ref:i?v:void 0,className:`rounded-2xl transition-all duration-300 border overflow-hidden ${i?`bg-slate-900/90 border-cyan-400 ring-2 ring-cyan-400/50 shadow-2xl shadow-cyan-500/20`:a?`bg-slate-900/60 border-rose-500/30 hover:border-rose-400/50`:`bg-slate-900/50 border-slate-800 hover:border-slate-700`}`,children:[(0,J.jsxs)(`div`,{onClick:()=>y(n.id),className:`p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none`,children:[(0,J.jsxs)(`div`,{className:`space-y-2 flex-1 min-w-0`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2 flex-wrap`,children:[(0,J.jsxs)(`span`,{className:`font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/60 text-cyan-300 border border-cyan-500/30`,children:[`#`,n.id]}),(0,J.jsx)(`span`,{className:`text-[11px] font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300`,children:n.topic}),a&&(0,J.jsxs)(`span`,{className:`text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-mono`,children:[(0,J.jsx)(O,{className:`w-3 h-3`}),`Ошибка в тесте`]}),o.ipv4Practice?.enabled&&(0,J.jsxs)(`span`,{className:`text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1 font-mono`,children:[(0,J.jsx)(G,{className:`w-3 h-3 text-cyan-400`}),`IPv4-тренажёр (/`,o.ipv4Practice.targetPrefix,`)`]})]}),(0,J.jsx)(`h3`,{className:`text-sm sm:text-base font-bold text-white leading-snug`,children:n.text}),!r&&(0,J.jsxs)(`p`,{className:`text-xs text-slate-400 line-clamp-1`,children:[`🎯 `,o.coreConcept]})]}),(0,J.jsx)(`button`,{type:`button`,className:`p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 transition-colors shrink-0 mt-1`,"aria-label":r?`Свернуть`:`Развернуть`,children:r?(0,J.jsx)(u,{className:`w-4 h-4`}):(0,J.jsx)(x,{className:`w-4 h-4`})})]}),r&&(0,J.jsxs)(`div`,{className:`px-4 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-5 animate-fade-in`,children:[n.image&&(0,J.jsxs)(`div`,{className:`rounded-xl overflow-hidden border border-slate-700 bg-black/80 p-2 max-w-lg mx-auto`,children:[(0,J.jsx)(`img`,{src:fe(n.image),alt:n.imageAlt||`Фото оборудования`,className:`max-h-72 w-full object-contain rounded-lg`,loading:`lazy`}),n.imageAlt&&(0,J.jsx)(`p`,{className:`text-[11px] text-slate-400 text-center mt-1 font-mono`,children:n.imageAlt})]}),(0,J.jsxs)(`div`,{className:`space-y-1.5`,children:[(0,J.jsx)(`span`,{className:`text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block`,children:`Варианты ответов:`}),(0,J.jsx)(`div`,{className:`grid grid-cols-1 gap-1.5`,children:n.answers.map((e,t)=>{let r=n.correct.includes(t);return(0,J.jsxs)(`div`,{className:`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 ${r?`bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold`:`bg-slate-900/60 border-slate-800 text-slate-400`}`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(`span`,{className:`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] shrink-0 ${r?`bg-emerald-500 text-slate-950`:`bg-slate-800 text-slate-400`}`,children:String.fromCharCode(65+t)}),(0,J.jsx)(`span`,{children:e})]}),r&&(0,J.jsx)(`span`,{className:`text-[10px] font-mono font-bold text-emerald-400 uppercase shrink-0`,children:`✓ Правильный ответ`})]},t)})})]}),(0,J.jsxs)(`div`,{className:`grid grid-cols-1 gap-3.5 pt-1`,children:[(0,J.jsxs)(`div`,{className:`p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5 text-cyan-300 font-bold text-xs font-mono uppercase`,children:[(0,J.jsx)(R,{className:`w-3.5 h-3.5`}),(0,J.jsx)(`span`,{children:`Суть концепции`})]}),(0,J.jsx)(`p`,{className:`text-xs sm:text-sm text-cyan-100 leading-relaxed`,children:o.coreConcept})]}),(0,J.jsxs)(`div`,{className:`p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5 text-slate-300 font-bold text-xs font-mono uppercase`,children:[(0,J.jsx)(K,{className:`w-3.5 h-3.5 text-blue-400`}),(0,J.jsx)(`span`,{children:`Как это устроено под капотом (Технический разбор)`})]}),(0,J.jsx)(`p`,{className:`text-xs sm:text-sm text-slate-300 leading-relaxed`,children:o.deepAnalysis})]}),(0,J.jsxs)(`div`,{className:`p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5 text-amber-300 font-bold text-xs font-mono uppercase`,children:[(0,J.jsx)(O,{className:`w-3.5 h-3.5`}),(0,J.jsx)(`span`,{children:`Типичная ловушка (Где чаще всего ошибаются)`})]}),(0,J.jsx)(`p`,{className:`text-xs sm:text-sm text-amber-200/90 leading-relaxed`,children:o.commonTrap})]}),o.practicalTip&&(0,J.jsxs)(`div`,{className:`p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5 text-emerald-300 font-bold text-xs font-mono uppercase`,children:[(0,J.jsx)(D,{className:`w-3.5 h-3.5`}),(0,J.jsx)(`span`,{children:`Шпаргалка / Практический совет`})]}),(0,J.jsx)(`p`,{className:`text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-mono`,children:o.practicalTip})]}),o.visualDiagram&&(0,J.jsxs)(`div`,{className:`p-4 rounded-xl bg-black/70 border border-slate-800 space-y-1.5`,children:[(0,J.jsx)(`span`,{className:`text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block`,children:`Структура / Схема передачи:`}),(0,J.jsx)(`pre`,{className:`text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre p-2 bg-slate-950 rounded-lg border border-slate-800/80 leading-relaxed`,children:o.visualDiagram})]})]}),o.ipv4Practice?.enabled&&(0,J.jsxs)(`div`,{className:`p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-cyan-500/10`,children:[(0,J.jsxs)(`div`,{className:`space-y-0.5`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-1.5 text-cyan-300 font-bold text-xs font-mono`,children:[(0,J.jsx)(G,{className:`w-4 h-4 text-cyan-400`}),(0,J.jsx)(`span`,{children:`Практика расчёта в IPv4-тренажёре`})]}),(0,J.jsx)(`p`,{className:`text-xs text-slate-300 max-w-xl`,children:o.ipv4Practice.reason})]}),(0,J.jsxs)(`button`,{onClick:()=>{t(o.ipv4Practice?.targetPrefix,o.ipv4Practice?.targetMode)},type:`button`,className:`px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md shadow-cyan-500/20`,children:[(0,J.jsxs)(`span`,{children:[`Отработать маску /`,o.ipv4Practice.targetPrefix]}),(0,J.jsx)(d,{className:`w-3.5 h-3.5`})]})]})]})]},n.id)}),w.length>100&&(0,J.jsxs)(`div`,{className:`p-4 text-center text-xs text-slate-400 font-mono`,children:[`Показано 100 из `,w.length,` вопросов. Уточните поиск для нахождения конкретной темы.`]})]})]}),r===`handbook`&&(0,J.jsx)(`div`,{className:`space-y-6`,children:(0,J.jsxs)(`div`,{className:`p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4`,children:[(0,J.jsxs)(`h2`,{className:`text-xl font-bold text-white flex items-center gap-2`,children:[(0,J.jsx)(K,{className:`w-5 h-5 text-cyan-400`}),(0,J.jsx)(`span`,{children:`7 Уровней модели OSI и соответствие со стеком TCP/IP`})]}),(0,J.jsx)(`p`,{className:`text-xs sm:text-sm text-slate-300 leading-relaxed`,children:`Модель OSI (Open Systems Interconnection) состоит из 7 логических уровней. В реальном Интернете используется стек протоколов TCP/IP, где уровни 5, 6 и 7 объединены в единый Прикладной уровень (Application Layer).`}),(0,J.jsx)(`div`,{className:`overflow-x-auto rounded-2xl border border-slate-800`,children:(0,J.jsxs)(`table`,{className:`w-full text-left text-xs border-collapse`,children:[(0,J.jsx)(`thead`,{children:(0,J.jsxs)(`tr`,{className:`bg-slate-900 border-b border-slate-800 font-mono text-slate-400 uppercase text-[11px]`,children:[(0,J.jsx)(`th`,{className:`p-3`,children:`Уровень OSI`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Стек TCP/IP`}),(0,J.jsx)(`th`,{className:`p-3`,children:`PDU (Данные)`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Адресация`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Ключевые протоколы`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Оборудование`})]})}),(0,J.jsxs)(`tbody`,{className:`divide-y divide-slate-800/60 font-sans`,children:[(0,J.jsxs)(`tr`,{className:`bg-pink-950/20 hover:bg-pink-950/30`,children:[(0,J.jsx)(`td`,{className:`p-3 font-bold text-pink-300`,children:`L7 Прикладной`}),(0,J.jsx)(`td`,{className:`p-3 font-semibold text-white`,rowSpan:3,children:`Прикладной (Application)`}),(0,J.jsx)(`td`,{className:`p-3 text-slate-300`,children:`Данные (Data)`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-slate-400`,children:`URL, FQDN`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-xs`,children:`HTTP, DNS, DHCP, SSH`}),(0,J.jsx)(`td`,{className:`p-3 text-slate-400`,children:`WAF, L7-балансировщик`})]}),(0,J.jsxs)(`tr`,{className:`bg-purple-950/20 hover:bg-purple-950/30`,children:[(0,J.jsx)(`td`,{className:`p-3 font-bold text-purple-300`,children:`L6 Представительский`}),(0,J.jsx)(`td`,{className:`p-3 text-slate-300`,children:`Данные (Data)`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-slate-400`,children:`MIME, TLS-ID`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-xs`,children:`TLS/SSL, JSON, GZIP`}),(0,J.jsx)(`td`,{className:`p-3 text-slate-400`,children:`TLS Termination шлюз`})]}),(0,J.jsxs)(`tr`,{className:`bg-indigo-950/20 hover:bg-indigo-950/30`,children:[(0,J.jsx)(`td`,{className:`p-3 font-bold text-indigo-300`,children:`L5 Сеансовый`}),(0,J.jsx)(`td`,{className:`p-3 text-slate-300`,children:`Данные (Data)`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-slate-400`,children:`Session ID`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-xs`,children:`RPC, NetBIOS, SOCKS5`}),(0,J.jsx)(`td`,{className:`p-3 text-slate-400`,children:`Сеансовый прокси`})]}),(0,J.jsxs)(`tr`,{className:`bg-blue-950/20 hover:bg-blue-950/30`,children:[(0,J.jsx)(`td`,{className:`p-3 font-bold text-blue-300`,children:`L4 Транспортный`}),(0,J.jsx)(`td`,{className:`p-3 font-semibold text-white`,children:`Транспортный`}),(0,J.jsx)(`td`,{className:`p-3 text-cyan-300 font-semibold`,children:`Сегмент (TCP) / Датаграмма (UDP)`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-cyan-300`,children:`Порты (0-65535)`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-xs`,children:`TCP, UDP, QUIC, SCTP`}),(0,J.jsx)(`td`,{className:`p-3 text-slate-400`,children:`L4 балансировщик, Firewall`})]}),(0,J.jsxs)(`tr`,{className:`bg-cyan-950/20 hover:bg-cyan-950/30`,children:[(0,J.jsx)(`td`,{className:`p-3 font-bold text-cyan-300`,children:`L3 Сетевой`}),(0,J.jsx)(`td`,{className:`p-3 font-semibold text-white`,children:`Межсетевой (Internet)`}),(0,J.jsx)(`td`,{className:`p-3 text-cyan-300 font-semibold`,children:`Пакет (Packet)`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-cyan-300`,children:`IPv4, IPv6`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-xs`,children:`IPv4, IPv6, ICMP, OSPF, BGP`}),(0,J.jsx)(`td`,{className:`p-3 text-slate-400`,children:`Маршрутизатор, L3-Switch`})]}),(0,J.jsxs)(`tr`,{className:`bg-emerald-950/20 hover:bg-emerald-950/30`,children:[(0,J.jsx)(`td`,{className:`p-3 font-bold text-emerald-300`,children:`L2 Канальный`}),(0,J.jsx)(`td`,{className:`p-3 font-semibold text-white`,rowSpan:2,children:`Сетевой доступ (Network Access)`}),(0,J.jsx)(`td`,{className:`p-3 text-emerald-300 font-semibold`,children:`Кадр (Frame)`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-emerald-300`,children:`MAC (48 бит)`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-xs`,children:`Ethernet, 802.1Q VLAN, ARP`}),(0,J.jsx)(`td`,{className:`p-3 text-slate-400`,children:`L2 Коммутатор (Switch), Мост`})]}),(0,J.jsxs)(`tr`,{className:`bg-amber-950/20 hover:bg-amber-950/30`,children:[(0,J.jsx)(`td`,{className:`p-3 font-bold text-amber-300`,children:`L1 Физический`}),(0,J.jsx)(`td`,{className:`p-3 text-amber-300 font-semibold`,children:`Биты (Bits)`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-slate-400`,children:`Сигналы, частоты`}),(0,J.jsx)(`td`,{className:`p-3 font-mono text-xs`,children:`1000BASE-T, 10GBASE-LR`}),(0,J.jsx)(`td`,{className:`p-3 text-slate-400`,children:`Хаб (Hub), Повторитель, SFP`})]})]})]})}),(0,J.jsxs)(`div`,{className:`p-5 rounded-2xl bg-black/60 border border-slate-800 space-y-3`,children:[(0,J.jsxs)(`h3`,{className:`text-sm font-bold text-white flex items-center gap-2`,children:[(0,J.jsx)(R,{className:`w-4 h-4 text-cyan-400`}),(0,J.jsx)(`span`,{children:`Процесс инкапсуляции при отправке пакета`})]}),(0,J.jsx)(`p`,{className:`text-xs text-slate-300`,children:`При отправке данных каждый уровень добавляет свой служебный заголовок (Header), а канальный уровень L2 добавляет также завершающий трейлер с контрольной суммой (FCS CRC-32).`}),(0,J.jsx)(`pre`,{className:`text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre p-3 bg-slate-950 rounded-xl border border-slate-800 leading-relaxed`,children:`[L7 Данные приложения: HTTP GET /index.html]
                  ↓
[L4 TCP Заголовок: Src Port=51234, Dst Port=80, Seq, Ack] + [L7 Данные] = СЕГМЕНТ
                  ↓
[L3 IP Заголовок: Src IP=192.168.1.10, Dst IP=93.184.216.34, TTL=64] + [L4+L7] = ПАКЕТ
                  ↓
[L2 MAC Заголовок: Src MAC, Dst MAC, EtherType=0x0800] + [L3+L4+L7] + [FCS CRC-32] = КАДР
                  ↓
[L1 Физический: Модуляция сигналов в витой паре или лазерных импульсов в оптоволокне] = БИТЫ`})]})]})}),r===`ports`&&(0,J.jsx)(`div`,{className:`space-y-4`,children:(0,J.jsxs)(`div`,{className:`p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4`,children:[(0,J.jsxs)(`h2`,{className:`text-xl font-bold text-white flex items-center gap-2`,children:[(0,J.jsx)(S,{className:`w-5 h-5 text-cyan-400`}),(0,J.jsx)(`span`,{children:`Таблица стандартных сетевых портов (Well-Known Ports)`})]}),(0,J.jsx)(`p`,{className:`text-xs text-slate-300`,children:`Порты от 0 до 1023 стандартизированы IANA и требуют привилегий суперпользователя. Они постоянно встречаются в вопросах экзамена.`}),(0,J.jsx)(`div`,{className:`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3`,children:[{port:20,proto:`TCP`,name:`FTP-Data`,desc:`Передача файлов по FTP`},{port:21,proto:`TCP`,name:`FTP-Control`,desc:`Управление сессией FTP`},{port:22,proto:`TCP`,name:`SSH / SFTP`,desc:`Защищенный терминал и передача`},{port:23,proto:`TCP`,name:`Telnet`,desc:`Незащищенный текстовый терминал`},{port:25,proto:`TCP`,name:`SMTP`,desc:`Маршрутизация электронной почты`},{port:53,proto:`UDP/TCP`,name:`DNS`,desc:`Преобразование доменных имен`},{port:67,proto:`UDP`,name:`DHCP Server`,desc:`Прием запросов клиентов`},{port:68,proto:`UDP`,name:`DHCP Client`,desc:`Ответ сервера клиенту`},{port:69,proto:`UDP`,name:`TFTP`,desc:`Простой FTP без авторизации (PXE)`},{port:80,proto:`TCP`,name:`HTTP`,desc:`Веб-трафик без шифрования`},{port:110,proto:`TCP`,name:`POP3`,desc:`Получение почты из ящика`},{port:123,proto:`UDP`,name:`NTP`,desc:`Синхронизация точного времени`},{port:143,proto:`TCP`,name:`IMAP`,desc:`Синхронизация почтовых папок`},{port:161,proto:`UDP`,name:`SNMP`,desc:`Мониторинг сетевых устройств`},{port:443,proto:`TCP/UDP`,name:`HTTPS / QUIC`,desc:`Защищенный веб (TLS / HTTP3)`},{port:514,proto:`UDP`,name:`Syslog`,desc:`Централизованный сбор журналов`},{port:3389,proto:`TCP`,name:`RDP`,desc:`Удаленный рабочий стол Windows`}].map(e=>(0,J.jsxs)(`div`,{className:`p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1 hover:border-cyan-500/40 transition-colors`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between`,children:[(0,J.jsxs)(`span`,{className:`font-mono text-sm font-black text-cyan-300`,children:[`Порт `,e.port]}),(0,J.jsx)(`span`,{className:`text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold`,children:e.proto})]}),(0,J.jsx)(`div`,{className:`font-bold text-xs text-white`,children:e.name}),(0,J.jsx)(`p`,{className:`text-[11px] text-slate-400`,children:e.desc})]},e.port))})]})}),r===`subnet-table`&&(0,J.jsx)(`div`,{className:`space-y-4`,children:(0,J.jsxs)(`div`,{className:`p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4`,children:[(0,J.jsxs)(`div`,{className:`flex flex-col sm:flex-row sm:items-center justify-between gap-3`,children:[(0,J.jsxs)(`div`,{children:[(0,J.jsxs)(`h2`,{className:`text-xl font-bold text-white flex items-center gap-2`,children:[(0,J.jsx)(G,{className:`w-5 h-5 text-amber-400`}),(0,J.jsx)(`span`,{children:`Шпаргалка масок, шагов и хостов IPv4`})]}),(0,J.jsx)(`p`,{className:`text-xs text-slate-300`,children:`Мгновенный справочник для решения задач экзамена по CIDR-маскам /24–/32.`})]}),(0,J.jsxs)(`button`,{onClick:()=>t(24,`calc`),type:`button`,className:`px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer hover:brightness-110 shrink-0`,children:[(0,J.jsx)(`span`,{children:`Открыть полный тренажёр`}),(0,J.jsx)(d,{className:`w-3.5 h-3.5`})]})]}),(0,J.jsx)(`div`,{className:`overflow-x-auto rounded-2xl border border-slate-800`,children:(0,J.jsxs)(`table`,{className:`w-full text-left text-xs border-collapse`,children:[(0,J.jsx)(`thead`,{children:(0,J.jsxs)(`tr`,{className:`bg-slate-900 border-b border-slate-800 font-mono text-slate-400 uppercase text-[11px]`,children:[(0,J.jsx)(`th`,{className:`p-3`,children:`CIDR`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Десятичная маска`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Двоичный 4-й октет`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Шаг сети (Magic)`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Всего IP`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Полезных хостов`}),(0,J.jsx)(`th`,{className:`p-3`,children:`Действие`})]})}),(0,J.jsx)(`tbody`,{className:`divide-y divide-slate-800/60 font-mono text-xs`,children:[{prefix:24,mask:`255.255.255.0`,bin:`00000000`,step:256,total:256,hosts:254},{prefix:25,mask:`255.255.255.128`,bin:`10000000`,step:128,total:128,hosts:126},{prefix:26,mask:`255.255.255.192`,bin:`11000000`,step:64,total:64,hosts:62},{prefix:27,mask:`255.255.255.224`,bin:`11100000`,step:32,total:32,hosts:30},{prefix:28,mask:`255.255.255.240`,bin:`11110000`,step:16,total:16,hosts:14},{prefix:29,mask:`255.255.255.248`,bin:`11111000`,step:8,total:8,hosts:6},{prefix:30,mask:`255.255.255.252`,bin:`11111100`,step:4,total:4,hosts:2},{prefix:31,mask:`255.255.255.254`,bin:`11111110`,step:2,total:2,hosts:`2 (RFC 3021)`},{prefix:32,mask:`255.255.255.255`,bin:`11111111`,step:1,total:1,hosts:`1 (Хост)`}].map(e=>(0,J.jsxs)(`tr`,{className:`hover:bg-cyan-950/20 transition-colors`,children:[(0,J.jsxs)(`td`,{className:`p-3 font-bold text-cyan-300`,children:[`/`,e.prefix]}),(0,J.jsx)(`td`,{className:`p-3 text-white`,children:e.mask}),(0,J.jsx)(`td`,{className:`p-3 text-slate-400`,children:e.bin}),(0,J.jsx)(`td`,{className:`p-3 text-amber-300 font-bold`,children:e.step}),(0,J.jsx)(`td`,{className:`p-3 text-slate-300`,children:e.total}),(0,J.jsx)(`td`,{className:`p-3 text-emerald-300 font-bold`,children:e.hosts}),(0,J.jsx)(`td`,{className:`p-3`,children:(0,J.jsx)(`button`,{onClick:()=>t(e.prefix,`calc`),type:`button`,className:`px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 transition-colors text-[11px] font-sans font-bold cursor-pointer`,children:`Калькулятор →`})})]},e.prefix))})]})})]})})]})},Ke=`<!doctype html>
<html lang="ru" class="dark" style="background-color: #07111f; color-scheme: dark; overflow-x: hidden; max-width: 100vw; width: 100%;">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover" />
    <meta name="theme-color" content="#07111f" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <title>OSI & TCP/IP · Интерактивный учебный тренажёр (Gemini Edition)</title>
    <meta name="description" content="Учебный тренажёр OSI, TCP/IP, IPv4 масок и сетевых CLI-команд: 502 вопроса, теория, симуляторы пакетов, VLAN и подробный разбор ошибок." />
    <meta property="og:title" content="OSI & TCP/IP · Интерактивный учебный тренажёр (Gemini Edition)" />
    <meta property="og:description" content="Учебный тренажёр сетевых моделей OSI и TCP/IP: 502 вопроса, раздел теории с глубокими разборами, визуализаторы пакетов, CLI-лаборатория." />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="OSI & TCP/IP Trainer — Gemini Mirror" />
    <meta property="og:image" content="https://raw.githubusercontent.com/apotet/osi-tcpip-exam-public/main/assets/learning/osi-preview.png" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:title" content="OSI & TCP/IP · Интерактивный учебный тренажёр" />
    <meta name="twitter:description" content="Тренажёр по сетевым протоколам, уровням OSI, маршрутизации, маскам IPv4 и CLI командам." />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  </head>
  <body class="bg-[#07111f] text-slate-100 antialiased overflow-x-hidden selection:bg-cyan-500 selection:text-black" style="background-color: #07111f; overflow-x: hidden; width: 100%; max-width: 100vw; min-width: 0;">
    <div id="root" class="w-full max-w-full overflow-x-hidden min-h-screen" style="background-color: #07111f; overflow-x: hidden; width: 100%; max-width: 100vw; min-width: 0;"></div>
    <script type="module" src="/src/main.tsx"><\/script>
  </body>
</html>

`,qe=`{
  "name": "GitHub Connector & Explorer",
  "description": "Интеграция с GitHub: пошаговое руководство по связке с Google AI Studio, работа с репозиториями через API и инструменты синхронизации кода.",
  "requestFramePermissions": [],
  "majorCapabilities": ["MAJOR_CAPABILITY_SERVER_SIDE_GEMINI_API"]
}
`,Je=`{
  "name": "react-example",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "tsx server.ts",
    "start": "tsx server.ts",
    "build": "vite build && node scripts/prepare-dist-bundle.js",
    "preview": "vite preview",
    "clean": "rm -rf dist server.js",
    "lint": "tsc --noEmit",
    "test-site": "node scripts/test-public-site.js",
    "publish-site": "node scripts/publish-to-github.js"
  },
  "dependencies": {
    "@google/genai": "^2.4.0",
    "@tailwindcss/vite": "^4.3.3",
    "@vitejs/plugin-react": "^6.1.1",
    "dotenv": "^17.2.3",
    "express": "^4.21.2",
    "jszip": "^3.10.2",
    "lucide-react": "^0.546.0",
    "motion": "^12.23.24",
    "react": "^19.0.1",
    "react-dom": "^19.0.1",
    "vite": "^8.3.0"
  },
  "devDependencies": {
    "@types/express": "^4.17.21",
    "@types/jszip": "^3.4.0",
    "@types/node": "^22.14.0",
    "@types/react": "^19.3.0",
    "@types/react-dom": "^19.3.0",
    "autoprefixer": "^10.4.21",
    "esbuild": "^0.25.0",
    "tailwindcss": "^4.3.3",
    "tsx": "^4.21.0",
    "typescript": "^7.0.2"
  }
}
`,Ye=`import React, { useState, useEffect } from 'react';
import { Navbar, NavTab } from './components/Navbar';
import { ExamView } from './components/ExamView';
import { Ipv4Trainer, Ipv4SubTab } from './components/Ipv4Trainer';
import { PracticeHub } from './components/PracticeHub';
import { TheoryView } from './components/TheoryView';
import { DeployModal } from './components/DeployModal';
import { MobileTabBar } from './components/MobileTabBar';
import { CommandPalette } from './components/CommandPalette';
import { ExternalLink, Sparkles, Shield, GitBranch, ArrowUpRight } from 'lucide-react';

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('exam');
  const [isDark, setIsDark] = useState<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDeployModalOpen, setIsDeployModalOpen] = useState<boolean>(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState<boolean>(false);

  // Deep linking state between Exam Mistakes, Theory, and IPv4 Trainer
  const [theoryQuestionId, setTheoryQuestionId] = useState<string | null>(null);
  const [ipv4InitialPrefix, setIpv4InitialPrefix] = useState<number | undefined>(undefined);
  const [ipv4InitialSubTab, setIpv4InitialSubTab] = useState<Ipv4SubTab | undefined>(undefined);

  // Keyboard shortcut listener for Cmd+K / Ctrl+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleNavigateToTheory = (questionId: string) => {
    setTheoryQuestionId(questionId);
    setActiveTab('theory');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigateToIpv4 = (prefix?: number, mode?: 'calc' | 'trainer') => {
    if (prefix) setIpv4InitialPrefix(prefix);
    if (mode === 'calc') setIpv4InitialSubTab('calculator');
    else if (mode === 'trainer') setIpv4InitialSubTab('practice');
    setActiveTab('ipv4');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-hidden bg-[#07111f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Banner comparing Original & Mirror */}
      <div className="w-full bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border-b border-cyan-500/20 py-2 px-3 sm:px-4 text-xs">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0" />
            <span className="text-slate-300 text-[11px] sm:text-xs truncate">
              <strong className="text-cyan-300">Резервное зеркало Gemini</strong> для тренажёра OSI/TCP-IP
            </span>
          </div>

          <div className="flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] min-w-0">
            <a
              href="https://apotet.github.io/osi-tcpip-exam-public/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono shrink-0"
              title="Оригинальный сайт тренажера от ChatGPT"
            >
              <span>Оригинал: osi-tcpip</span>
              <ArrowUpRight className="w-3 h-3 shrink-0" />
            </a>

            <a
              href="https://apotet.github.io/my-gemini-mirror-site/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-cyan-300 hover:underline flex items-center gap-1 font-mono font-bold shrink-0"
              title="Зеркало тренажера от Gemini"
            >
              <span>Зеркало: my-gemini</span>
              <ArrowUpRight className="w-3 h-3 shrink-0" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Navigation */}
      <Navbar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'theory') {
            setTheoryQuestionId(null);
          }
        }}
        isDark={isDark}
        onToggleTheme={() => setIsDark(!isDark)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenDeploy={() => setIsDeployModalOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Content Area with extra padding at bottom on mobile for MobileTabBar */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8">
        {activeTab === 'exam' && (
          <ExamView
            soundEnabled={soundEnabled}
            onNavigateToTheory={handleNavigateToTheory}
          />
        )}
        {(activeTab === 'theory' || activeTab === 'osi') && (
          <TheoryView
            initialQuestionId={theoryQuestionId}
            onNavigateToIpv4={handleNavigateToIpv4}
            onClearInitialQuestion={() => setTheoryQuestionId(null)}
          />
        )}
        {activeTab === 'ipv4' && (
          <Ipv4Trainer
            soundEnabled={soundEnabled}
            initialPrefix={ipv4InitialPrefix}
            initialSubTab={ipv4InitialSubTab}
          />
        )}
        {activeTab === 'practice' && <PracticeHub />}
      </main>

      {/* Mobile Bottom Tab Bar (Visible on mobile/tablet matching mockup IMG_2164) */}
      <MobileTabBar
        activeTab={activeTab}
        onTabChange={(tab) => {
          setActiveTab(tab);
          if (tab !== 'theory') {
            setTheoryQuestionId(null);
          }
        }}
      />

      {/* Command Palette (Cmd+K / Ctrl+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab !== 'theory') setTheoryQuestionId(null);
        }}
        onSelectLayer={(layer) => {
          setActiveTab('theory');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onToggleTheme={() => setIsDark(!isDark)}
        onOpenDeploy={() => setIsDeployModalOpen(true)}
        isDark={isDark}
      />

      {/* Footer */}
      <footer className="border-t border-cyan-500/20 py-8 px-4 bg-[#050c17]/90 text-slate-400 text-xs mt-12">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="font-bold text-slate-200 flex items-center justify-center sm:justify-start gap-1.5">
              <span>OSI & TCP/IP Exam Trainer</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono">
                Gemini Edition
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              502 практических вопроса, симуляции L2/L3 протоколов и CLI-терминал.
            </p>
          </div>

          <div className="flex items-center flex-wrap gap-x-4 gap-y-2 text-xs font-mono">
            <a
              href="/osi-tcpip-trainer-source.zip"
              download="osi-tcpip-trainer-source.zip"
              className="text-emerald-400 hover:underline cursor-pointer font-bold flex items-center gap-1"
              title="Скачать полный ZIP архив проекта с исходным кодом"
            >
              <span>📦 Скачать ZIP исходник</span>
            </a>
            <span>•</span>
            <button
              onClick={() => setIsDeployModalOpen(true)}
              type="button"
              className="text-cyan-400 hover:underline cursor-pointer"
            >
              Синхронизировать с GitHub
            </button>
            <span>•</span>
            <a
              href="https://github.com/apotet/osi-tcpip-exam-public"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-white transition-colors"
            >
              Исходный репозиторий
            </a>
          </div>
        </div>
      </footer>

      {/* Deploy & Sync Modal */}
      <DeployModal
        isOpen={isDeployModalOpen}
        onClose={() => setIsDeployModalOpen(false)}
      />
    </div>
  );
}

export default App;
`,Xe=`import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, CornerDownLeft, Trash2, HelpCircle } from 'lucide-react';

interface HistoryItem {
  command: string;
  output: string;
  isError?: boolean;
}

const COMMAND_OUTPUTS: Record<string, string> = {
  help: \`Доступные сетевые команды:
  ping <ip/host>        — Проверка доступности хоста по ICMP
  traceroute <ip/host>  — Трассировка маршрута по TTL
  ip addr / ip a        — Просмотр сетевых интерфейсов и IP/масок
  ip route              — Просмотр таблицы маршрутизации (L3)
  arp -a                — Просмотр ARP-кэша соответствия IP -> MAC (L2)
  netstat -tulnp        — Просмотр слушающих TCP/UDP сокетов и портов
  curl -I <url>         — Проверка L7 HTTP-заголовков ответа
  clear                 — Очистить экран консоли\`,

  'ip addr': \`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 00:11:22:aa:bb:10 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.10/24 brd 192.168.1.255 scope global eth0
       valid_lft forever preferred_lft forever\`,

  'ip a': \`1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc fq_codel state UP
    link/ether 00:11:22:aa:bb:10 brd ff:ff:ff:ff:ff:ff
    inet 192.168.1.10/24 brd 192.168.1.255 scope global eth0\`,

  'ip route': \`default via 192.168.1.1 dev eth0 proto static metric 100 
192.168.1.0/24 dev eth0 proto kernel scope link src 192.168.1.10 metric 100\`,

  'arp -a': \`? (192.168.1.1) at 00:11:22:gw:01:01 [ether] on eth0
? (192.168.1.25) at 52:54:00:12:34:56 [ether] on eth0\`,

  'netstat -tulnp': \`Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name    
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      892/sshd            
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1044/nginx          
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      1044/nginx          
udp        0      0 0.0.0.0:53              0.0.0.0:*                           712/named           
udp        0      0 0.0.0.0:67              0.0.0.0:*                           645/dhcpd\`,
};

export const CliSimulator: React.FC = () => {
  const [input, setInput] = useState<string>('');
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: 'welcome',
      output: \`Добро пожаловать в сетевой CLI-тренажёр (Linux / Cisco environment)!\\nВведите 'help' для просмотра списка доступных команд.\`,
    },
  ]);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmdText: string) => {
    const trimmed = cmdText.trim();
    if (!trimmed) return;

    if (trimmed.toLowerCase() === 'clear') {
      setHistory([]);
      setInput('');
      return;
    }

    const lower = trimmed.toLowerCase();
    let output = '';
    let isError = false;

    if (COMMAND_OUTPUTS[lower]) {
      output = COMMAND_OUTPUTS[lower];
    } else if (lower.startsWith('ping')) {
      const parts = trimmed.split(' ');
      const target = parts[1] || '8.8.8.8';
      output = \`PING \${target} (\${target}) 56(84) bytes of data.
64 bytes from \${target}: icmp_seq=1 ttl=117 time=14.2 ms
64 bytes from \${target}: icmp_seq=2 ttl=117 time=13.8 ms
64 bytes from \${target}: icmp_seq=3 ttl=117 time=14.5 ms
64 bytes from \${target}: icmp_seq=4 ttl=117 time=14.1 ms

--- \${target} ping statistics ---
4 packets transmitted, 4 received, 0% packet loss, time 3004ms
rtt min/avg/max/mdev = 13.8/14.15/14.5/0.25 ms\`;
    } else if (lower.startsWith('traceroute')) {
      const parts = trimmed.split(' ');
      const target = parts[1] || '8.8.8.8';
      output = \`traceroute to \${target} (\${target}), 30 hops max, 60 byte packets
 1  gateway (192.168.1.1)  0.641 ms  0.512 ms  0.489 ms
 2  10.50.0.1 (10.50.0.1)  2.124 ms  2.089 ms  2.045 ms
 3  core-gw.isp.net (185.12.34.1)  5.412 ms  5.389 ms  5.312 ms
 4  dns.google (\${target})  14.214 ms  14.152 ms  14.089 ms\`;
    } else if (lower.startsWith('curl')) {
      output = \`HTTP/2 200 OK
date: \${new Date().toUTCString()}
content-type: text/html; charset=UTF-8
server: cloudflare
strict-transport-security: max-age=31536000; includeSubDomains; preload
x-content-type-options: nosniff
vary: Accept-Encoding\`;
    } else {
      isError = true;
      output = \`bash: команда не найдена: \${trimmed}. Введите 'help' для просмотра списка доступных команд.\`;
    }

    setHistory((prev) => [...prev, { command: trimmed, output, isError }]);
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleCommand(input);
    }
  };

  const quickCommands = ['help', 'ip addr', 'ip route', 'arp -a', 'netstat -tulnp', 'ping 192.168.2.20', 'traceroute 8.8.8.8'];

  return (
    <div className="space-y-6">
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div>
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
            Практика терминала
          </span>
          <h2 className="text-2xl font-black tracking-tight text-white mt-1">
            Сетевой CLI-эмулятор
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Выполняйте реальные сетевые команды для закрепления теории уровней L2, L3, L4 и L7
          </p>
        </div>

        <button
          onClick={() => setHistory([])}
          type="button"
          className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold flex items-center gap-1.5 transition-all min-h-[44px] cursor-pointer"
        >
          <Trash2 className="w-4 h-4" />
          Очистить
        </button>
      </div>

      {/* Quick shortcuts */}
      <div className="flex flex-wrap gap-2 items-center">
        <span className="text-xs text-slate-400 font-mono">Быстрый ввод:</span>
        {quickCommands.map((cmd) => (
          <button
            key={cmd}
            onClick={() => handleCommand(cmd)}
            type="button"
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-700 hover:border-cyan-400 text-cyan-300 text-xs font-mono transition-all cursor-pointer min-h-[36px]"
          >
            {cmd}
          </button>
        ))}
      </div>

      {/* Terminal window */}
      <div
        onClick={() => inputRef.current?.focus()}
        className="rounded-2xl bg-[#050b14] border border-cyan-500/30 shadow-2xl p-4 sm:p-6 font-mono text-xs sm:text-sm text-slate-200 min-h-[420px] flex flex-col cursor-text"
      >
        {/* Terminal Header */}
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800 text-slate-400 select-none">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-xs font-mono text-slate-400">admin@network-lab:~</span>
          </div>
          <span className="text-[11px] text-cyan-500/70">bash 5.2</span>
        </div>

        {/* Command Output Log */}
        <div className="flex-1 space-y-4 overflow-y-auto">
          {history.map((item, idx) => (
            <div key={idx} className="space-y-1">
              {item.command !== 'welcome' && (
                <div className="flex items-center gap-2 text-cyan-400">
                  <span className="text-slate-500">user@host:~$</span>
                  <span className="font-bold text-white">{item.command}</span>
                </div>
              )}
              <pre
                className={\`whitespace-pre-wrap font-mono text-xs leading-relaxed \${
                  item.isError ? 'text-rose-400' : 'text-slate-300'
                }\`}
              >
                {item.output}
              </pre>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input line */}
        <div className="flex items-center gap-2 pt-4 border-t border-slate-800/80 mt-2">
          <span className="text-cyan-400 font-bold">user@host:~$</span>
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Введите команду (например, 'ping 8.8.8.8' или 'ip route')..."
            className="flex-1 bg-transparent border-0 outline-none text-white font-mono text-xs sm:text-sm placeholder:text-slate-600"
            autoFocus
          />
          <button
            onClick={() => handleCommand(input)}
            type="button"
            className="p-1.5 text-cyan-400 hover:text-cyan-300 transition-colors"
          >
            <CornerDownLeft className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
`,Ze=`import React, { useState, useEffect, useRef } from 'react';
import { NavTab } from './Navbar';
import { triggerHaptic } from '../utils/haptics';
import {
  Search,
  Layers,
  Sparkles,
  BookOpen,
  Calculator,
  Terminal,
  Download,
  UploadCloud,
  Moon,
  Sun,
  X,
  ArrowRight,
  Zap,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTab: (tab: NavTab) => void;
  onSelectLayer: (layer: string) => void;
  onToggleTheme: () => void;
  onOpenDeploy: () => void;
  isDark: boolean;
}

interface CommandItem {
  id: string;
  title: string;
  category: 'Навигация' | 'Уровни OSI' | 'Инструменты' | 'Система';
  shortcut?: string;
  icon: React.ReactNode;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectTab,
  onSelectLayer,
  onToggleTheme,
  onOpenDeploy,
  isDark,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Global Keyboard Listener for Cmd+K / Ctrl+K
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const commands: CommandItem[] = [
    // Navigation
    {
      id: 'tab-exam',
      title: 'Экзамен — Режим тестирования',
      category: 'Навигация',
      shortcut: '1',
      icon: <Layers className="w-4 h-4 text-cyan-400" />,
      action: () => onSelectTab('exam'),
    },
    {
      id: 'tab-theory',
      title: 'Теория и подробные разборы вопросов',
      category: 'Навигация',
      shortcut: '2',
      icon: <BookOpen className="w-4 h-4 text-indigo-400" />,
      action: () => onSelectTab('theory'),
    },
    {
      id: 'tab-ipv4',
      title: 'IPv4 Тренажёр — Расчёт масок и подсетей',
      category: 'Навигация',
      shortcut: '3',
      icon: <Calculator className="w-4 h-4 text-emerald-400" />,
      action: () => onSelectTab('ipv4'),
    },
    {
      id: 'tab-practice',
      title: 'Интерактивная практика — Симуляторы и CLI',
      category: 'Навигация',
      shortcut: '4',
      icon: <Terminal className="w-4 h-4 text-amber-400" />,
      action: () => onSelectTab('practice'),
    },

    // OSI Layers
    {
      id: 'layer-l7',
      title: 'L7 Прикладной уровень (HTTP/3, DNS, DHCP)',
      category: 'Уровни OSI',
      shortcut: 'L7',
      icon: <span className="font-mono text-xs font-bold text-pink-400">L7</span>,
      action: () => onSelectLayer('L7'),
    },
    {
      id: 'layer-l4',
      title: 'L4 Транспортный уровень (TCP 3-way, UDP, Порты)',
      category: 'Уровни OSI',
      shortcut: 'L4',
      icon: <span className="font-mono text-xs font-bold text-cyan-400">L4</span>,
      action: () => onSelectLayer('L4'),
    },
    {
      id: 'layer-l3',
      title: 'L3 Сетевой уровень (IPv4/IPv6, TTL, Маршрутизация)',
      category: 'Уровни OSI',
      shortcut: 'L3',
      icon: <span className="font-mono text-xs font-bold text-teal-400">L3</span>,
      action: () => onSelectLayer('L3'),
    },
    {
      id: 'layer-l2',
      title: 'L2 Канальный уровень (Ethernet, MAC, VLAN 802.1Q)',
      category: 'Уровни OSI',
      shortcut: 'L2',
      icon: <span className="font-mono text-xs font-bold text-emerald-400">L2</span>,
      action: () => onSelectLayer('L2'),
    },
    {
      id: 'layer-l1',
      title: 'L1 Физический уровень (Оптика, SFP, витая пара)',
      category: 'Уровни OSI',
      shortcut: 'L1',
      icon: <span className="font-mono text-xs font-bold text-amber-400">L1</span>,
      action: () => onSelectLayer('L1'),
    },

    // Tools
    {
      id: 'action-zip',
      title: 'Скачать полный ZIP архив проекта',
      category: 'Инструменты',
      shortcut: 'ZIP',
      icon: <Download className="w-4 h-4 text-emerald-400" />,
      action: () => {
        window.location.href = '/osi-tcpip-trainer-source.zip';
      },
    },
    {
      id: 'action-deploy',
      title: 'Синхронизация зеркала с GitHub Pages',
      category: 'Инструменты',
      icon: <UploadCloud className="w-4 h-4 text-cyan-400" />,
      action: onOpenDeploy,
    },
    {
      id: 'action-theme',
      title: isDark ? 'Переключить на светлую тему' : 'Переключить на тёмную тему',
      category: 'Система',
      icon: isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-400" />,
      action: onToggleTheme,
    },
  ];

  const filtered = commands.filter((cmd) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      (cmd.shortcut && cmd.shortcut.toLowerCase().includes(q))
    );
  });

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        triggerHaptic('selection');
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div
        className="w-full max-w-xl rounded-2xl bg-[#091524] border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col text-slate-100"
        onKeyDown={handleKeyDown}
      >
        {/* Search Input Bar */}
        <div className="p-3.5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/80">
          <Search className="w-4 h-4 text-cyan-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Быстрый поиск команд, уровней OSI (L1-L7), тем и разделов..."
            className="flex-1 bg-transparent border-0 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none font-mono"
          />
          <button
            onClick={onClose}
            type="button"
            className="p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer text-xs"
          >
            Esc
          </button>
        </div>

        {/* Command Results */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filtered.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              Команд не найдено. Попробуйте другой запрос.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = selectedIndex === idx;

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    item.action();
                    onClose();
                  }}
                  className={\`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors \${
                    isSelected
                      ? 'bg-cyan-950/70 text-white border border-cyan-400/40'
                      : 'text-slate-300 hover:bg-slate-800/60'
                  }\`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center shrink-0">
                      {item.icon}
                    </div>
                    <span className="font-medium">{item.title}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">
                      {item.category}
                    </span>
                    {item.shortcut && (
                      <kbd className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700">
                        {item.shortcut}
                      </kbd>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
          <span>Навигация: ↑ ↓</span>
          <span>Выбрать: Enter</span>
        </div>
      </div>
    </div>
  );
};
`,Qe=`import React, { useState } from 'react';
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
  Smartphone,
  Laptop,
  Check,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import {
  pushProjectToGitHub,
  generateProjectZip,
  downloadBlob,
  getProjectFiles,
  testRemoteSiteAccessibility,
  AccessibilityTestResult,
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

  const [testResult, setTestResult] = useState<AccessibilityTestResult | null>(null);
  const [isTesting, setIsTesting] = useState<boolean>(false);

  const [liveActionStatus, setLiveActionStatus] = useState<{
    status: 'queued' | 'in_progress' | 'completed' | 'unknown';
    conclusion: 'success' | 'failure' | 'cancelled' | null;
    updatedAt?: string;
  } | null>(null);

  // Poll GitHub Actions status when successResult is available
  React.useEffect(() => {
    if (!successResult || !token) return;

    let isSubscribed = true;
    const cleanRepo = repoName.replace(/^https?:\\/\\/github\\.com\\//i, '').replace(/^.*\\//, '').trim() || 'my-gemini-mirror-site';
    const authHeader = {
      Authorization: \`Bearer \${token.trim()}\`,
      Accept: 'application/vnd.github.v3+json',
    };

    const checkStatus = async () => {
      try {
        const res = await fetch(
          \`https://api.github.com/repos/\${successResult.owner}/\${cleanRepo}/actions/runs?per_page=1\`,
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

  const hasCompiledIndex = projectFiles.some((f) => f.path === 'index.html' && f.content.includes('./assets/index-'));
  const hasAssets = projectFiles.some((f) => f.path.startsWith('assets/'));
  const hasPracticeHub = projectFiles.some((f) => f.path.includes('PracticeHub.tsx'));
  const hasNewIpv4 = projectFiles.some(
    (f) => f.path.includes('Ipv4Trainer.tsx') && f.content.includes('Правило непрерывности')
  );

  const handleRunAccessibilityTest = async (targetUrl?: string) => {
    const url = targetUrl || (successResult ? successResult.pageUrl : 'https://apotet.github.io/my-gemini-mirror-site/');
    setIsTesting(true);
    try {
      const res = await testRemoteSiteAccessibility(url);
      setTestResult(res);
    } catch {
      // quiet fallback
    } finally {
      setIsTesting(false);
    }
  };

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
      const cleanRepo =
        repoName.replace(/^https?:\\/\\/github\\.com\\//i, '').replace(/^.*\\//, '').trim() ||
        'my-gemini-mirror-site';

      // 1. Try server-side publishing bridge first (100% reliable on mobile Safari, no CORS / ITP issues)
      setPushStatus('Синхронизация через серверный мост...');
      setProgressPercent(20);

      let serverSuccess = false;
      try {
        const srvRes = await fetch('/api/publish-github', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: token.trim(), repoName: cleanRepo }),
        });

        if (srvRes.ok) {
          const srvData = await srvRes.json();
          if (srvData.success) {
            serverSuccess = true;
            setProgressPercent(100);
            setPushStatus('Готово! Зеркало успешно опубликовано.');
            setSuccessResult(srvData);
            setTimeout(() => {
              handleRunAccessibilityTest(srvData.pageUrl);
            }, 1500);
            return;
          }
        } else {
          const errData = await srvRes.json().catch(() => ({}));
          // If GitHub returned 401 or bad credentials from server, fail immediately with clear message
          if (errData.error && (srvRes.status === 401 || errData.error.includes('Bad credentials'))) {
            throw new Error('Недействительный токен GitHub (Bad credentials). Проверьте правильность токена.');
          }
          if (errData.error) {
            throw new Error(errData.error);
          }
        }
      } catch (srvErr: any) {
        if (srvErr.message && !srvErr.message.includes('Failed to fetch') && !srvErr.message.includes('404')) {
          throw srvErr;
        }
        console.warn('Server bridge unavailable, falling back to direct browser push:', srvErr);
      }

      // 2. Direct browser push fallback (if server bridge was not available)
      setPushStatus('Прямая выгрузка в GitHub...');
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

      // Run live reachability test automatically after push
      setTimeout(() => {
        handleRunAccessibilityTest(result.pageUrl);
      }, 1500);
    } catch (err: any) {
      console.error(err);
      let message = err.message || 'Ошибка синхронизации с GitHub.';
      if (message.includes('Load failed') || message.includes('Failed to fetch')) {
        message =
          'Браузер Safari заблокировал прямой запрос к GitHub API. Мы переключили режим на серверную выгрузку — пожалуйста, нажмите кнопку ещё раз.';
      }
      setErrorMsg(message);
    } finally {
      setIsPushing(false);
    }
  };

  const handleDownloadZip = () => {
    const a = document.createElement('a');
    a.href = '/osi-tcpip-trainer-source.zip';
    a.download = 'osi-tcpip-trainer-source.zip';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-2xl bg-[#0c1726] border border-cyan-500/40 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Закрыть"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3.5 mb-5">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-500/25 border border-cyan-400/40 text-cyan-400 shadow-lg shadow-cyan-500/10">
            <UploadCloud className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">
                Публикация зеркала на GitHub
              </h2>
              <span className="px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                v2.4 Bundle
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Единый сайт для iPhone, Android и ПК без логинов и задержек
            </p>
          </div>
        </div>

        {/* Universal URL Showcase Card */}
        <div className="p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/40 mb-5 space-y-3">
          <div className="flex items-center justify-between text-xs">
            <span className="text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" /> Единая универсальная ссылка:
            </span>
            <div className="flex items-center gap-2 text-[10px] text-slate-400">
              <span className="flex items-center gap-1 text-emerald-400">
                <Smartphone className="w-3 h-3" /> Телефон
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-cyan-400">
                <Laptop className="w-3 h-3" /> Компьютер
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-black/40 border border-slate-700/60">
            <a
              href="https://apotet.github.io/my-gemini-mirror-site/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs sm:text-sm font-mono text-cyan-300 hover:underline truncate font-bold flex items-center gap-1.5"
            >
              https://apotet.github.io/my-gemini-mirror-site/
              <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
            </a>
            <button
              onClick={() => handleRunAccessibilityTest('https://apotet.github.io/my-gemini-mirror-site/')}
              disabled={isTesting}
              type="button"
              className="px-2.5 py-1 text-[11px] font-semibold rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer"
            >
              <Activity className="w-3 h-3" />
              {isTesting ? 'Проверка...' : 'Тест ссылки'}
            </button>
          </div>

          <div className="text-[11px] text-slate-300 space-y-1">
            <p>
              💡 <strong>Почему ссылка Google Cloud (.run.app) не открывалась на телефоне:</strong> адреса предпросмотра среды разработки защищены сессией Google. На iPhone/Android без входа в тот же аккаунт Google система возвращает ошибку.
            </p>
            <p className="text-slate-400">
              Ссылка на <strong>GitHub Pages выше</strong> — полностью публичная, доступна любому устройству и браузеру (Safari, Chrome, Telegram) без каких-либо логинов.
            </p>
          </div>
        </div>

        {/* Live Accessibility Test Results if run */}
        {testResult && (
          <div className={\`p-3.5 rounded-xl border mb-5 text-xs space-y-2 \${testResult.ok && testResult.hasFreshCode ? 'bg-emerald-950/50 border-emerald-500/50 text-emerald-200' : 'bg-amber-950/50 border-amber-500/50 text-amber-200'}\`}>
            <div className="font-bold flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                {testResult.ok && testResult.hasFreshCode ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-amber-400" />
                )}
                Результат проверки публичного URL (HTTP {testResult.status})
              </span>
              <span className="text-[10px] font-mono opacity-80">Live Check</span>
            </div>
            <ul className="text-[11px] space-y-1 pl-1 opacity-90">
              {testResult.details.map((line, idx) => (
                <li key={idx}>{line}</li>
              ))}
            </ul>
            {testResult.ok && !testResult.hasFreshCode && (
              <p className="text-[11px] font-semibold text-amber-300 pt-1 border-t border-amber-500/20">
                ⚡ Для обновления сайта нажмите кнопку публикации ниже. В репозиторий отправится готовая production-сборка (7 файлов), и сайт сразу обновится.
              </p>
            )}
          </div>
        )}

        {/* Bundle verification banner */}
        {hasCompiledIndex && hasAssets ? (
          <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>
                <strong>Production Bundle готов (v2.4):</strong> Скомпилированные JS/CSS файлы включены. GitHub Pages запустится мгновенно без необходимости компиляции Node.js.
              </span>
            </div>
            <button
              onClick={forceReloadApp}
              type="button"
              title="Перезагрузить код"
              className="px-2 py-1 text-emerald-300 hover:text-white rounded bg-emerald-900/60 hover:bg-emerald-800 text-[10px] font-mono cursor-pointer flex items-center gap-1"
            >
              <RotateCcw className="w-3 h-3" />
              Сброс
            </button>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Подготовка бандла... При первой синхронизации создаются скомпилированные ассеты.</span>
          </div>
        )}

        {/* Change summary */}
        <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 space-y-1 mb-5">
          <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" /> Включено в это обновление:
          </span>
          <ul className="list-disc list-inside text-slate-400 space-y-0.5 pl-1">
            <li><strong className="text-slate-200">IPv4 Тренажёр:</strong> непрерывные биты маски (перед 1 не бывает 0, клик по 2 или 1 ставит единицы).</li>
            <li><strong className="text-slate-200">Вкладка «Практика»:</strong> все 4 симулятора (Путь пакета, VLAN, Протоколы, CLI) в одном хабе.</li>
            <li><strong className="text-slate-200">Production-бандл в корне:</strong> полное решение проблемы с открытием на iPhone/Safari.</li>
          </ul>
        </div>

        {successResult ? (
          <div className="p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-4">
            <div className="flex items-center gap-3 text-emerald-300">
              <CheckCircle2 className="w-6 h-6 flex-shrink-0" />
              <div>
                <h3 className="font-bold text-base">Файлы успешно выгружены на GitHub!</h3>
                <p className="text-xs text-emerald-400/90">
                  Скомпилированная сборка и исходный код отправлены в репозиторий.
                </p>
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                  Статус автосборки GitHub:
                </span>
                {liveActionStatus?.status === 'in_progress' || liveActionStatus?.status === 'queued' ? (
                  <span className="flex items-center gap-1.5 text-amber-400 font-mono font-bold animate-pulse">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Публикация страниц... (~15 сек)
                  </span>
                ) : liveActionStatus?.conclusion === 'success' ? (
                  <span className="flex items-center gap-1.5 text-emerald-400 font-mono font-bold">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    Готово! Сайт обновлён
                  </span>
                ) : (
                  <span className="text-emerald-300 font-mono text-[11px]">
                    ✓ Бандл отправлен (статический деплой)
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-cyan-500/20">
                <span className="text-slate-400">Единая ссылка для телефона и ПК:</span>
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

              <div className="flex items-center justify-between p-2.5 rounded-lg bg-black/30">
                <span className="text-slate-400">Репозиторий GitHub:</span>
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

            <div className="flex gap-2.5 pt-2">
              <button
                onClick={() => handleRunAccessibilityTest(successResult.pageUrl)}
                disabled={isTesting}
                type="button"
                className="flex-1 py-2.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Activity className="w-3.5 h-3.5" />
                {isTesting ? 'Проверка...' : 'Проверить обновление на сайте'}
              </button>

              <button
                onClick={() => {
                  setSuccessResult(null);
                  setLiveActionStatus(null);
                }}
                type="button"
                className="py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer"
              >
                Снова
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {token.trim() ? (
              <div className="p-3 rounded-xl bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-between text-xs text-cyan-200">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <span className="font-bold text-white">Токен GitHub найден в памяти браузера: </span>
                    <span className="font-mono text-[11px] text-cyan-300">
                      {token.trim().slice(0, 7)}••••••••••••••••••••
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setToken('')}
                  type="button"
                  className="text-[10px] text-slate-400 hover:text-white underline cursor-pointer"
                >
                  Сменить
                </button>
              </div>
            ) : (
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
                  Токен сохраняется в локальной памяти вашего браузера. Требуется право <code className="text-cyan-300">repo</code>.
                </p>
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-cyan-400" />
                Имя репозитория
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
                    style={{ width: \`\${progressPercent}%\` }}
                  />
                </div>
              </div>
            )}

            <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={handlePush}
                disabled={isPushing}
                type="button"
                className="flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer min-h-[44px]"
              >
                <Sparkles className="w-4 h-4" />
                {isPushing ? 'Выгрузка и компиляция...' : 'Опубликовать зеркало в 1 клик'}
              </button>

              <button
                onClick={handleDownloadZip}
                type="button"
                className="py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer"
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
`,$e=`import React, { useState, useEffect } from 'react';
import {
  Question,
  QuizModeId,
  QuizSession,
} from '../types/quiz';
import {
  ALL_QUESTIONS,
  QUIZ_MODES,
  getRandomQuestions,
  resolveImageUrl,
} from '../data/questionsData';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/sound';
import { triggerHaptic } from '../utils/haptics';
import { KnowledgeRadar } from './KnowledgeRadar';
import { LivingOsiStack } from './LivingOsiStack';
import {
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Award,
  Layers,
  ChevronRight,
  BookmarkCheck,
  Image as ImageIcon,
  BookOpen,
} from 'lucide-react';

interface ExamViewProps {
  soundEnabled: boolean;
  onNavigateToTheory?: (questionId: string) => void;
  onSelectLevel?: (level: string) => void;
}

export const ExamView: React.FC<ExamViewProps> = ({ soundEnabled, onNavigateToTheory }) => {
  const [session, setSession] = useState<QuizSession | null>(null);
  const [selectedMode, setSelectedMode] = useState<QuizModeId>('mixed');
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [feedbackMode, setFeedbackMode] = useState<'instant' | 'exam'>('instant');
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState<boolean>(false);
  const [mistakesOnlySession, setMistakesOnlySession] = useState<Question[] | null>(null);

  // Resume state if exists in localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('osi_active_session');
      if (saved) {
        const parsed: QuizSession = JSON.parse(saved);
        if (!parsed.isCompleted && parsed.questions && parsed.questions.length > 0) {
          setSession(parsed);
          setSelectedAnswers(parsed.userAnswers[parsed.questions[parsed.currentIndex]?.id] || []);
          setIsAnswerSubmitted(parsed.submittedQuestions[parsed.questions[parsed.currentIndex]?.id] || false);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // Sync mistakes to localStorage when session completes
  useEffect(() => {
    if (session?.isCompleted && session.questions) {
      const mistakeIds: string[] = [];
      session.questions.forEach((q) => {
        const userAns = session.userAnswers[q.id] || [];
        const isCorrect = userAns.length === q.correct.length && userAns.every((a) => q.correct.includes(a));
        if (!isCorrect) mistakeIds.push(q.id);
      });
      if (mistakeIds.length > 0) {
        try {
          localStorage.setItem('osi_last_mistakes', JSON.stringify(mistakeIds));
        } catch {
          // safe fallback
        }
      }
    }
  }, [session?.isCompleted]);

  const startNewQuiz = (customQuestions?: Question[]) => {
    const questions = customQuestions || getRandomQuestions(selectedMode, questionCount);
    const newSession: QuizSession = {
      questions,
      currentIndex: 0,
      userAnswers: {},
      submittedQuestions: {},
      startTime: Date.now(),
      isCompleted: false,
      mode: selectedMode,
      feedbackMode,
    };
    setSession(newSession);
    setSelectedAnswers([]);
    setIsAnswerSubmitted(false);
    setMistakesOnlySession(null);

    try {
      localStorage.setItem('osi_active_session', JSON.stringify(newSession));
    } catch {
      // safe fallback
    }
  };

  const currentQuestion = session ? session.questions[session.currentIndex] : null;
  const isMultiSelect = currentQuestion ? currentQuestion.correct.length > 1 : false;

  const handleSelectAnswer = (index: number) => {
    if (isAnswerSubmitted && session?.feedbackMode === 'instant') return;

    triggerHaptic('selection');
    if (soundEnabled) playClickSound();

    if (isMultiSelect) {
      setSelectedAnswers((prev) =>
        prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
      );
    } else {
      setSelectedAnswers([index]);
    }
  };

  const handleSubmitAnswer = () => {
    if (!session || !currentQuestion || selectedAnswers.length === 0) return;

    const isCorrect =
      selectedAnswers.length === currentQuestion.correct.length &&
      selectedAnswers.every((a) => currentQuestion.correct.includes(a));

    triggerHaptic(isCorrect ? 'success' : 'error');
    if (soundEnabled) {
      if (isCorrect) playSuccessSound();
      else playErrorSound();
    }

    const updatedUserAnswers = {
      ...session.userAnswers,
      [currentQuestion.id]: selectedAnswers,
    };
    const updatedSubmitted = {
      ...session.submittedQuestions,
      [currentQuestion.id]: true,
    };

    setIsAnswerSubmitted(true);

    const updatedSession: QuizSession = {
      ...session,
      userAnswers: updatedUserAnswers,
      submittedQuestions: updatedSubmitted,
    };
    setSession(updatedSession);

    try {
      localStorage.setItem('osi_active_session', JSON.stringify(updatedSession));
    } catch {
      // safe fallback
    }

    // In exam mode, go immediately to next question
    if (session.feedbackMode === 'exam') {
      goToNextQuestion(updatedSession);
    }
  };

  const goToNextQuestion = (activeSession: QuizSession = session!) => {
    if (!activeSession) return;

    const nextIndex = activeSession.currentIndex + 1;
    if (nextIndex >= activeSession.questions.length) {
      // Quiz completed!
      const completedSession: QuizSession = {
        ...activeSession,
        isCompleted: true,
        endTime: Date.now(),
      };
      setSession(completedSession);
      try {
        localStorage.removeItem('osi_active_session');
      } catch {
        // safe fallback
      }
      return;
    }

    const nextQ = activeSession.questions[nextIndex];
    const nextAnswers = activeSession.userAnswers[nextQ.id] || [];
    const nextSubmitted = activeSession.submittedQuestions[nextQ.id] || false;

    setSession({
      ...activeSession,
      currentIndex: nextIndex,
    });
    setSelectedAnswers(nextAnswers);
    setIsAnswerSubmitted(nextSubmitted);
  };

  const exitQuiz = () => {
    setSession(null);
    setSelectedAnswers([]);
    setIsAnswerSubmitted(false);
    try {
      localStorage.removeItem('osi_active_session');
    } catch {
      // safe fallback
    }
  };

  const [lastMistakes, setLastMistakes] = useState<Question[]>([]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('osi_last_mistakes');
      if (saved) {
        const ids: string[] = JSON.parse(saved);
        if (Array.isArray(ids)) {
          const matched = ALL_QUESTIONS.filter((q) => ids.includes(q.id));
          setLastMistakes(matched);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // If no active session, show Bento Dashboard + Living Stack
  if (!session || !currentQuestion) {
    return (
      <div className="space-y-5 max-w-3xl mx-auto pb-16 lg:pb-6 animate-fade-in">
        {/* Top Bento Card with Readiness Gauge & Quick Stats */}
        <KnowledgeRadar
          mistakesCount={lastMistakes.length}
          totalQuestionsCount={ALL_QUESTIONS.length}
          onStartExam={() => startNewQuiz()}
          onReviewMistakes={() => {
            const pool = lastMistakes.length > 0 ? lastMistakes : ALL_QUESTIONS.slice(0, 14);
            startNewQuiz(pool);
          }}
          onOpenVisualL1={() => {
            setSelectedMode('visual-l1');
            const visualPool = ALL_QUESTIONS.filter((q) => q.group === 'visual-l1').slice(0, 20);
            startNewQuiz(visualPool);
          }}
        />

        {/* Living OSI Stack (Путь пакета L7 -> L1) */}
        <LivingOsiStack
          onSelectLevel={(level) => {
            if (level === 'L1' || level === 'L2') setSelectedMode('l1-l2');
            else if (level === 'L3') setSelectedMode('l3');
            else if (level === 'L4') setSelectedMode('l4');
            else if (level === 'L5' || level === 'L6' || level === 'L7') setSelectedMode('l5-l7');
          }}
          onExploreTheory={(level) => {
            if (onNavigateToTheory) {
              const matchedQ = ALL_QUESTIONS.find((q) => q.topic.includes(level) || q.group.includes(level.toLowerCase()));
              onNavigateToTheory(matchedQ ? matchedQ.id : 'l3-01');
            }
          }}
          onStartExamForLevel={(level) => {
            let filterGroup = 'mixed';
            if (level === 'L1' || level === 'L2') filterGroup = 'l1-l2';
            else if (level === 'L3') filterGroup = 'l3';
            else if (level === 'L4') filterGroup = 'l4';
            else if (level === 'L5' || level === 'L6' || level === 'L7') filterGroup = 'l5-l7';
            setSelectedMode(filterGroup as QuizModeId);
            startNewQuiz(getRandomQuestions(filterGroup as QuizModeId, questionCount));
          }}
        />

        {/* Detailed Configuration Accordion / Panel */}
        <div className="p-5 sm:p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span>Параметры тестирования</span>
            </h2>
            <span className="text-[11px] font-mono text-cyan-400 font-bold">
              {QUIZ_MODES.find((m) => m.id === selectedMode)?.count || 502} вопр. в пуле
            </span>
          </div>

          <div className="space-y-4">
            {/* Mode selection grid */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                Выберите раздел знаний
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {QUIZ_MODES.map((mode) => {
                  const isSelected = selectedMode === mode.id;
                  return (
                    <button
                      key={mode.id}
                      onClick={() => setSelectedMode(mode.id)}
                      type="button"
                      className={\`p-4 rounded-2xl text-left border transition-all cursor-pointer min-h-[76px] flex flex-col justify-between \${
                        isSelected
                          ? 'bg-cyan-950/60 border-cyan-400 ring-2 ring-cyan-400/30 shadow-lg shadow-cyan-500/20'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700 text-slate-300'
                      }\`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-sm text-white">{mode.title}</span>
                        <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded bg-black/40 text-cyan-400">
                          {mode.count} вопр.
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{mode.subtitle}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Questions count & Mode type */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Количество вопросов
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[10, 20, 50, 100].map((cnt) => (
                    <button
                      key={cnt}
                      onClick={() => setQuestionCount(cnt)}
                      type="button"
                      className={\`py-2.5 rounded-xl text-xs font-mono font-bold border transition-all cursor-pointer min-h-[44px] \${
                        questionCount === cnt
                          ? 'bg-cyan-500 text-slate-950 border-cyan-400'
                          : 'bg-slate-900/80 text-slate-300 border-slate-800 hover:border-slate-700'
                      }\`}
                    >
                      {cnt}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Режим проверки
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => setFeedbackMode('instant')}
                    type="button"
                    className={\`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center \${
                      feedbackMode === 'instant'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                    }\`}
                  >
                    <span>Тренажёр</span>
                    <span className="text-[10px] text-slate-400">Объяснение сразу</span>
                  </button>

                  <button
                    onClick={() => setFeedbackMode('exam')}
                    type="button"
                    className={\`p-2.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer min-h-[44px] flex flex-col items-center justify-center \${
                      feedbackMode === 'exam'
                        ? 'bg-cyan-950/60 border-cyan-400 text-cyan-300'
                        : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                    }\`}
                  >
                    <span>Экзамен</span>
                    <span className="text-[10px] text-slate-400">Результат в конце</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Start Button */}
            <div className="pt-4">
              <button
                onClick={() => startNewQuiz()}
                type="button"
                className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-teal-400 to-blue-500 text-slate-950 font-black text-sm sm:text-base tracking-wide hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-3 shadow-xl shadow-cyan-500/25 cursor-pointer min-h-[52px]"
              >
                <span>Начать экзамен</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Quiz Completed: Results Screen
  if (session.isCompleted) {
    const totalQuestions = session.questions.length;
    let correctCount = 0;
    const mistakes: Question[] = [];

    session.questions.forEach((q) => {
      const userAns = session.userAnswers[q.id] || [];
      const isCorrect =
        userAns.length === q.correct.length && userAns.every((a) => q.correct.includes(a));
      if (isCorrect) {
        correctCount++;
      } else {
        mistakes.push(q);
      }
    });

    const percentage = Math.round((correctCount / totalQuestions) * 100);
    const isPassed = percentage >= 80;

    return (
      <div className="space-y-6 max-w-4xl mx-auto animate-fade-in">
        {/* Results Hero */}
        <div
          className={\`p-8 rounded-3xl border shadow-2xl text-center space-y-4 \${
            isPassed
              ? 'bg-gradient-to-b from-emerald-950/60 to-slate-900 border-emerald-500/40'
              : 'bg-gradient-to-b from-rose-950/60 to-slate-900 border-rose-500/40'
          }\`}
        >
          <div
            className={\`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center text-3xl shadow-xl \${
              isPassed
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                : 'bg-rose-500/20 text-rose-300 border border-rose-400/50'
            }\`}
          >
            {isPassed ? <Award className="w-10 h-10" /> : <RotateCcw className="w-10 h-10" />}
          </div>

          <div>
            <span
              className={\`text-xs font-mono font-bold uppercase tracking-wider px-3 py-1 rounded-full \${
                isPassed ? 'bg-emerald-500/20 text-emerald-300' : 'bg-rose-500/20 text-rose-300'
              }\`}
            >
              {isPassed ? 'Экзамен сдан (зачёт от 80%)' : 'Экзамен не сдан (порог 80%)'}
            </span>
            <h2 className="text-3xl sm:text-4xl font-black text-white mt-2">
              {correctCount} из {totalQuestions} правильных ответов
            </h2>
            <div className="text-4xl font-black font-mono text-cyan-300 mt-1">
              {percentage}%
            </div>
          </div>

          <div className="pt-2 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => startNewQuiz()}
              type="button"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              <RotateCcw className="w-4 h-4" />
              Пройти заново
            </button>

            {mistakes.length > 0 && (
              <button
                onClick={() => startNewQuiz(mistakes)}
                type="button"
                className="py-3 px-6 rounded-xl bg-amber-500/20 border border-amber-400/40 text-amber-300 font-bold text-xs hover:bg-amber-500/30 transition-all flex items-center gap-2 min-h-[48px] cursor-pointer"
              >
                <BookmarkCheck className="w-4 h-4" />
                Повторить только ошибки ({mistakes.length})
              </button>
            )}

            <button
              onClick={exitQuiz}
              type="button"
              className="py-3 px-6 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all min-h-[48px] cursor-pointer"
            >
              К выбору тем
            </button>
          </div>
        </div>

        {/* Mistakes Review section */}
        {mistakes.length > 0 && (
          <div className="p-6 rounded-3xl glass-panel border border-slate-800 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <XCircle className="w-5 h-5 text-rose-400" />
              Разбор ошибок ({mistakes.length})
            </h3>

            <div className="space-y-4">
              {mistakes.map((m, idx) => (
                <div
                  key={m.id}
                  className="p-4 sm:p-5 rounded-2xl bg-slate-900/60 border border-rose-500/30 space-y-3"
                >
                  <div className="flex items-center justify-between text-xs">
                    <span className="px-2.5 py-0.5 rounded bg-cyan-950 border border-cyan-500/30 text-cyan-300 font-mono">
                      {m.topic}
                    </span>
                    <span className="text-slate-500 font-mono text-[10px]">#{m.id}</span>
                  </div>

                  <h4 className="text-sm font-semibold text-white">{m.text}</h4>

                  {/* Answers review */}
                  <div className="space-y-1.5 pt-1">
                    {m.answers.map((ans, ansIdx) => {
                      const isCorrect = m.correct.includes(ansIdx);
                      const isUserChoice = (session.userAnswers[m.id] || []).includes(ansIdx);

                      let borderClass = 'border-slate-800 text-slate-400';
                      if (isCorrect) borderClass = 'border-emerald-500/60 bg-emerald-950/40 text-emerald-200 font-semibold';
                      else if (isUserChoice) borderClass = 'border-rose-500/60 bg-rose-950/40 text-rose-300 line-through';

                      return (
                        <div
                          key={ansIdx}
                          className={\`p-2.5 rounded-xl border text-xs flex items-center justify-between \${borderClass}\`}
                        >
                          <span>{ans}</span>
                          {isCorrect && (
                            <span className="text-[10px] font-bold text-emerald-400 font-mono uppercase">
                              Правильно
                            </span>
                          )}
                          {isUserChoice && !isCorrect && (
                            <span className="text-[10px] font-bold text-rose-400 font-mono uppercase">
                              Ваш ответ
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation */}
                  <div className="p-3 rounded-xl bg-black/40 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                    <strong className="block text-cyan-300 mb-0.5">Пояснение:</strong>
                    {m.explanation}
                  </div>

                  {/* Link to Theory Deep Dive */}
                  <div className="pt-1 flex items-center justify-between">
                    <button
                      onClick={() => onNavigateToTheory?.(m.id)}
                      type="button"
                      className="py-2 px-3.5 rounded-xl bg-gradient-to-r from-cyan-950 via-slate-900 to-blue-950 border border-cyan-400/40 text-cyan-300 hover:text-white hover:border-cyan-300 hover:shadow-md hover:shadow-cyan-500/20 transition-all text-xs font-bold flex items-center gap-2 cursor-pointer"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                      <span>📖 Подробный разбор в Теории →</span>
                    </button>
                    <span className="text-[11px] text-slate-500 font-mono hidden sm:inline">
                      Анализ темы «{m.topic}»
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  // Active Question Card View
  const progressPercent = Math.round(
    ((session.currentIndex + 1) / session.questions.length) * 100
  );

  return (
    <div className="space-y-6 max-w-3xl mx-auto animate-fade-in">
      {/* Quiz Top bar */}
      <div className="flex items-center justify-between text-xs text-slate-400 font-mono">
        <button
          onClick={exitQuiz}
          type="button"
          className="hover:text-rose-400 transition-colors py-1 cursor-pointer"
        >
          ← Выйти в меню
        </button>

        <span className="font-bold text-white">
          Вопрос {session.currentIndex + 1} из {session.questions.length}
        </span>

        <span className="text-cyan-400 font-bold">{progressPercent}%</span>
      </div>

      {/* Progress Track */}
      <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-cyan-400 to-blue-500 transition-all duration-300 rounded-full"
          style={{ width: \`\${progressPercent}%\` }}
        />
      </div>

      {/* Question Card */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6">
        {/* Topic and Hints */}
        <div className="flex flex-wrap items-center justify-between gap-2">
          <span className="px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 font-bold text-xs font-mono">
            {currentQuestion.topic}
          </span>
          <span className="text-xs font-semibold text-amber-300 font-mono">
            {isMultiSelect ? '✦ Выберите все подходящие ответы' : '✦ Выберите один правильный ответ'}
          </span>
        </div>

        {/* Question Text */}
        <h2 className="text-lg sm:text-xl font-bold text-white leading-relaxed">
          {currentQuestion.text}
        </h2>

        {/* Visual photo if present */}
        {currentQuestion.image && (
          <div className="rounded-2xl overflow-hidden border border-slate-700 bg-black/60 p-2">
            <img
              src={resolveImageUrl(currentQuestion.image)}
              alt={currentQuestion.imageAlt || 'Фото оборудования к вопросу'}
              className="max-h-80 w-full object-contain rounded-xl mx-auto"
              loading="lazy"
              onError={(e) => {
                // hide on error
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
            {currentQuestion.imageAlt && (
              <p className="text-[11px] text-slate-400 text-center mt-1.5 font-mono">
                {currentQuestion.imageAlt}
              </p>
            )}
          </div>
        )}

        {/* Answer Options */}
        <div className="space-y-2.5">
          {currentQuestion.answers.map((answerText, ansIdx) => {
            const isSelected = selectedAnswers.includes(ansIdx);
            const isCorrect = currentQuestion.correct.includes(ansIdx);

            let itemClass = 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-200';

            if (isAnswerSubmitted && session.feedbackMode === 'instant') {
              if (isCorrect) {
                itemClass = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-medium shadow-md shadow-emerald-500/10';
              } else if (isSelected && !isCorrect) {
                itemClass = 'bg-rose-950/60 border-rose-500 text-rose-200';
              }
            } else if (isSelected) {
              itemClass = 'bg-cyan-950/70 border-cyan-400 text-cyan-100 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/10';
            }

            return (
              <button
                key={ansIdx}
                onClick={() => handleSelectAnswer(ansIdx)}
                type="button"
                className={\`w-full p-4 rounded-2xl text-left border transition-all flex items-center gap-3 cursor-pointer min-h-[56px] \${itemClass}\`}
              >
                {/* Marker indicator */}
                <div
                  className={\`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-colors \${
                    isAnswerSubmitted && session.feedbackMode === 'instant'
                      ? isCorrect
                        ? 'bg-emerald-500 text-slate-950'
                        : isSelected
                        ? 'bg-rose-500 text-slate-950'
                        : 'bg-slate-800 text-slate-500'
                      : isSelected
                      ? 'bg-cyan-500 text-slate-950'
                      : 'bg-slate-800 text-slate-400'
                  }\`}
                >
                  {isAnswerSubmitted && session.feedbackMode === 'instant' ? (
                    isCorrect ? (
                      '✓'
                    ) : isSelected ? (
                      '✕'
                    ) : (
                      String.fromCharCode(65 + ansIdx)
                    )
                  ) : (
                    String.fromCharCode(65 + ansIdx)
                  )}
                </div>

                <span className="text-xs sm:text-sm leading-relaxed flex-1">{answerText}</span>
              </button>
            );
          })}
        </div>

        {/* Instant Feedback Panel */}
        {isAnswerSubmitted && session.feedbackMode === 'instant' && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#091725] border border-cyan-500/30 space-y-3 animate-fade-in">
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-cyan-400">
                Подробное объяснение
              </span>
              <button
                onClick={() => onNavigateToTheory?.(currentQuestion.id)}
                type="button"
                className="text-xs font-bold text-cyan-300 hover:text-white hover:underline flex items-center gap-1 cursor-pointer shrink-0"
              >
                <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                <span>Разбор в Теории →</span>
              </button>
            </div>

            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {currentQuestion.explanation}
            </p>

            {currentQuestion.remember && (
              <div className="p-3 rounded-xl bg-amber-950/30 border-l-4 border-amber-400 text-xs text-amber-200">
                <strong className="block text-amber-300 font-bold mb-0.5">Важно запомнить:</strong>
                {currentQuestion.remember}
              </div>
            )}
          </div>
        )}

        {/* Actions Footer */}
        <div className="pt-2 flex items-center justify-between gap-3">
          <div className="text-[11px] text-slate-500 font-mono hidden sm:block">
            Подсказка: клавиши A, B, C, D или клик мышью
          </div>

          {!isAnswerSubmitted ? (
            <button
              onClick={handleSubmitAnswer}
              disabled={selectedAnswers.length === 0}
              type="button"
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] disabled:opacity-40 transition-all min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Ответить
            </button>
          ) : (
            <button
              onClick={() => goToNextQuestion()}
              type="button"
              className="w-full sm:w-auto py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] transition-all min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2"
            >
              <span>
                {session.currentIndex + 1 >= session.questions.length
                  ? 'Посмотреть результаты'
                  : 'Следующий вопрос'}
              </span>
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
`,et=`import React, { useState, useEffect } from 'react';
import {
  Calculator,
  Binary,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Sparkles,
  ArrowRight,
  RotateCcw,
  BookOpen,
  Hash,
  Activity,
  Layers,
} from 'lucide-react';
import { playSuccessSound, playErrorSound, playClickSound } from '../utils/sound';

// IPv4 helper math functions matching original site logic
function maskInt(prefix: number): number {
  return prefix === 0 ? 0 : ((0xffffffff << (32 - prefix)) >>> 0);
}

function intToIp(n: number): string {
  n >>>= 0;
  return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.');
}

function ipToInt(ip: string): number {
  return ip
    .trim()
    .split('.')
    .reduce((n, o) => ((n << 8) | Number(o)) >>> 0, 0);
}

function maskText(prefix: number): string {
  return intToIp(maskInt(prefix));
}

function subnetCalc(ip: string, prefix: number) {
  const value = ipToInt(ip);
  const mask = maskInt(prefix);
  const network = (value & mask) >>> 0;
  const broadcast = (network | (~mask >>> 0)) >>> 0;
  const total = Math.pow(2, 32 - prefix);
  const usable = prefix >= 31 ? (prefix === 31 ? 2 : 1) : Math.max(0, total - 2);
  const first = prefix >= 31 ? network : (network + 1) >>> 0;
  const last = prefix >= 31 ? broadcast : (broadcast - 1) >>> 0;
  const wildcard = intToIp(~mask >>> 0);

  return {
    ip,
    prefix,
    mask: maskText(prefix),
    wildcard,
    network: intToIp(network),
    broadcast: intToIp(broadcast),
    first: intToIp(first),
    last: intToIp(last),
    total,
    usable,
  };
}

function interestingOctet(prefix: number) {
  const octetIndex = Math.floor(prefix / 8) + 1;
  const bitsIn = prefix % 8;
  if (bitsIn === 0) {
    return { octet: Math.max(1, octetIndex - 1), mask: 255, step: 1 };
  }
  const value = 256 - Math.pow(2, 8 - bitsIn);
  return { octet: octetIndex, mask: value, step: 256 - value };
}

export type Ipv4SubTab = 'practice' | 'calculator' | 'bits' | 'cheatsheet';
type PracticeMode =
  | 'cidr-to-mask'
  | 'mask-to-cidr'
  | 'step'
  | 'network'
  | 'broadcast'
  | 'first-host'
  | 'last-host'
  | 'same-subnet'
  | 'gateway-or-direct';

interface QuestionTask {
  question: string;
  hint: string;
  correctAnswer: string;
  options: string[];
  explanation: string;
  stepFormula?: string;
}

interface Ipv4TrainerProps {
  soundEnabled: boolean;
  initialPrefix?: number;
  initialSubTab?: Ipv4SubTab;
}

export const Ipv4Trainer: React.FC<Ipv4TrainerProps> = ({
  soundEnabled,
  initialPrefix,
  initialSubTab,
}) => {
  const [subTab, setSubTab] = useState<Ipv4SubTab>(initialSubTab || 'practice');
  const [practiceMode, setPracticeMode] = useState<PracticeMode>('network');

  // Octet Bits Explorer State
  const [bits, setBits] = useState<number[]>([1, 1, 1, 1, 0, 0, 0, 0]);
  const bitWeights = [128, 64, 32, 16, 8, 4, 2, 1];
  const decimalValue = bits.reduce((sum, b, i) => sum + b * bitWeights[i], 0);

  // Subnet Calculator State
  const [calcIp, setCalcIp] = useState<string>('192.168.10.45');
  const [calcPrefix, setCalcPrefix] = useState<number>(initialPrefix || 27);

  // Update when props change from external navigation
  useEffect(() => {
    if (initialPrefix) {
      setCalcPrefix(initialPrefix);
    }
    if (initialSubTab) {
      setSubTab(initialSubTab);
    }
  }, [initialPrefix, initialSubTab]);

  // Interactive Practice State
  const [currentTask, setCurrentTask] = useState<QuestionTask | null>(null);
  const [userSelection, setUserSelection] = useState<string>('');
  const [isAnswered, setIsAnswered] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);
  const [roundNumber, setRoundNumber] = useState<number>(1);
  const [scoreCorrect, setScoreCorrect] = useState<number>(0);

  // Generate random task based on mode
  const generateTask = (mode: PracticeMode): QuestionTask => {
    const prefixes = [24, 25, 26, 27, 28, 29, 30, 23, 22, 21, 20, 19, 18, 17, 16];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const octet1 = [10, 172, 192][Math.floor(Math.random() * 3)];
    const octet2 = octet1 === 10 ? Math.floor(Math.random() * 255) : octet1 === 172 ? 16 + Math.floor(Math.random() * 16) : 168;
    const octet3 = Math.floor(Math.random() * 254);
    const octet4 = 1 + Math.floor(Math.random() * 253);
    const ip = \`\${octet1}.\${octet2}.\${octet3}.\${octet4}\`;

    const info = subnetCalc(ip, prefix);
    const stepInfo = interestingOctet(prefix);

    switch (mode) {
      case 'cidr-to-mask': {
        const correct = maskText(prefix);
        const distractors = [
          maskText(Math.max(8, prefix - 1)),
          maskText(Math.min(30, prefix + 1)),
          maskText(Math.min(30, prefix + 2)),
        ].filter((x) => x !== correct);
        const options = Array.from(new Set([correct, ...distractors])).slice(0, 4);
        options.sort(() => Math.random() - 0.5);
        return {
          question: \`Какая маска подсети соответствует префиксу /\${prefix}?\`,
          hint: \`Количество единичных бит слева: \${prefix}\`,
          correctAnswer: correct,
          options,
          explanation: \`Префикс /\${prefix} означает, что первые \${prefix} бит равны 1, а оставшиеся \${32 - prefix} бит равны 0. В десятичном виде это \${correct}.\`,
          stepFormula: \`Шаг в октете №\${stepInfo.octet}: 256 − \${stepInfo.mask} = \${stepInfo.step}\`,
        };
      }

      case 'mask-to-cidr': {
        const mask = maskText(prefix);
        const correct = \`/\${prefix}\`;
        const options = [
          \`/\${prefix}\`,
          \`/\${Math.max(8, prefix - 1)}\`,
          \`/\${Math.min(30, prefix + 1)}\`,
          \`/\${Math.min(30, prefix + 2)}\`,
        ].sort(() => Math.random() - 0.5);
        return {
          question: \`Какой префикс CIDR соответствует маске \${mask}?\`,
          hint: \`Подсчитайте число установленных бит в каждом октете\`,
          correctAnswer: correct,
          options,
          explanation: \`Маска \${mask} содержит ровно \${prefix} единичных бит, поэтому префикс равен /\${prefix}.\`,
        };
      }

      case 'step': {
        const correct = String(stepInfo.step);
        const distractors = [
          String(stepInfo.step * 2),
          String(Math.max(2, Math.floor(stepInfo.step / 2))),
          String(stepInfo.step + 4),
        ].filter((x) => x !== correct);
        const options = Array.from(new Set([correct, ...distractors])).slice(0, 4);
        options.sort(() => Math.random() - 0.5);
        return {
          question: \`Чему равен «шаг сети» (магическое число) для префикса /\${prefix}?\`,
          hint: \`Октет изменения №\${stepInfo.octet}, значение маски в октете: \${stepInfo.mask}\`,
          correctAnswer: correct,
          options,
          explanation: \`Правило: Шаг = 256 − октет маски. В октете №\${stepInfo.octet} значение \${stepInfo.mask}. Значит шаг = 256 − \${stepInfo.mask} = \${stepInfo.step}.\`,
          stepFormula: \`Шаг = 256 − \${stepInfo.mask} = \${stepInfo.step}\`,
        };
      }

      case 'network': {
        const correct = info.network;
        const fake1 = intToIp((ipToInt(info.network) + (stepInfo.step > 1 ? stepInfo.step : 2)) >>> 0);
        const fake2 = intToIp(Math.max(0, ipToInt(info.network) - 8) >>> 0);
        const fake3 = info.broadcast;
        const options = Array.from(new Set([correct, fake1, fake2, fake3])).slice(0, 4);
        options.sort(() => Math.random() - 0.5);
        return {
          question: \`Определите адрес сети для хоста \${ip}/\${prefix}:\`,
          hint: \`Октет №\${stepInfo.octet}, шаг сети = \${stepInfo.step}\`,
          correctAnswer: correct,
          options,
          explanation: \`В октете №\${stepInfo.octet} шаг равен \${stepInfo.step}. Ближайшая снизу граница, кратная \${stepInfo.step}, дает адрес сети: \${info.network}.\`,
          stepFormula: \`Сеть: \${info.network}, Шаг: \${stepInfo.step}\`,
        };
      }

      case 'broadcast': {
        const correct = info.broadcast;
        const fake1 = info.network;
        const fake2 = info.last;
        const fake3 = intToIp((ipToInt(info.broadcast) + stepInfo.step) >>> 0);
        const options = Array.from(new Set([correct, fake1, fake2, fake3])).slice(0, 4);
        options.sort(() => Math.random() - 0.5);
        return {
          question: \`Какой широковещательный адрес (Broadcast) для подсети \${ip}/\${prefix}?\`,
          hint: \`Broadcast = следующий адрес сети минус 1\`,
          correctAnswer: correct,
          options,
          explanation: \`Следующая подсеть начинается с \${intToIp((ipToInt(info.network) + (stepInfo.step << (8 * (4 - stepInfo.octet)))) >>> 0)}. Значит последний адрес (Broadcast) этой подсети равен \${info.broadcast}.\`,
        };
      }

      case 'first-host': {
        const correct = info.first;
        const options = Array.from(new Set([correct, info.network, info.last, info.broadcast])).slice(0, 4);
        options.sort(() => Math.random() - 0.5);
        return {
          question: \`Укажите первый пригодный IP-адрес для хоста в подсети \${ip}/\${prefix}:\`,
          hint: \`Первый хост = адрес сети + 1\`,
          correctAnswer: correct,
          options,
          explanation: \`Адрес сети \${info.network} зарезервирован. Первый адрес для устройства (хоста или шлюза) — это \${info.first}.\`,
        };
      }

      case 'last-host': {
        const correct = info.last;
        const options = Array.from(new Set([correct, info.broadcast, info.first, info.network])).slice(0, 4);
        options.sort(() => Math.random() - 0.5);
        return {
          question: \`Укажите последний пригодный IP-адрес для хоста в подсети \${ip}/\${prefix}:\`,
          hint: \`Последний хост = Broadcast − 1\`,
          correctAnswer: correct,
          options,
          explanation: \`Широковещательный адрес \${info.broadcast} занят под broadcast. Последний пригодный адрес для хоста — это \${info.last}.\`,
        };
      }

      case 'same-subnet': {
        const isSame = Math.random() > 0.5;
        let secondIp = '';
        if (isSame) {
          secondIp = info.first;
        } else {
          secondIp = intToIp((ipToInt(info.broadcast) + 2) >>> 0);
        }
        const correct = isSame ? 'Да, в одной подсети' : 'Нет, в разных подсетях';
        return {
          question: \`Находятся ли хосты \${ip} и \${secondIp} в одной подсети с маской /\${prefix}?\`,
          hint: \`Сравните сетевую часть обоих адресов с шагом \${stepInfo.step}\`,
          correctAnswer: correct,
          options: ['Да, в одной подсети', 'Нет, в разных подсетях'],
          explanation: isSame
            ? \`Оба адреса попадают в диапазон сети \${info.network}/\${prefix} (от \${info.first} до \${info.last}). Они могут общаться напрямую по L2 без маршрутизатора.\`
            : \`Адрес \${ip} принадлежит сети \${info.network}/\${prefix}, а адрес \${secondIp} находится за пределами этой сети. Связь между ними возможна только через L3-маршрутизатор (шлюз).\`,
        };
      }

      case 'gateway-or-direct': {
        const isDirect = Math.random() > 0.5;
        let targetIp = isDirect ? info.first : intToIp((ipToInt(info.broadcast) + 4) >>> 0);
        const correct = isDirect ? 'Напрямую по L2 (ARP)' : 'Через шлюз по умолчанию (L3)';
        return {
          question: \`Хост \${ip}/\${prefix} отправляет пакет на адрес \${targetIp}. Как пойдет доставка?\`,
          hint: \`Определите, локальный ли это узел или внешняя подсеть\`,
          correctAnswer: correct,
          options: ['Напрямую по L2 (ARP)', 'Через шлюз по умолчанию (L3)'],
          explanation: isDirect
            ? \`Узел \${targetIp} находится в той же подсети \${info.network}/\${prefix}. Хост находит его MAC через ARP и отправляет кадр напрямую через коммутатор L2.\`
            : \`Узел \${targetIp} находится в чужой подсети. Хост отправляет пакет на MAC-адрес своего шлюза по умолчанию для дальнейшей L3-маршрутизации.\`,
        };
      }

      default:
        return {
          question: \`Какая маска для /\${prefix}?\`,
          hint: '',
          correctAnswer: maskText(prefix),
          options: [maskText(prefix)],
          explanation: '',
        };
    }
  };

  useEffect(() => {
    setCurrentTask(generateTask(practiceMode));
    setUserSelection('');
    setIsAnswered(false);
  }, [practiceMode]);

  const handleSelectOption = (option: string) => {
    if (isAnswered) return;
    if (soundEnabled) playClickSound();
    setUserSelection(option);
  };

  const handleCheckAnswer = () => {
    if (!currentTask || !userSelection || isAnswered) return;

    const correct = userSelection === currentTask.correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);

    if (soundEnabled) {
      if (correct) playSuccessSound();
      else playErrorSound();
    }

    if (correct) {
      setScoreCorrect((prev) => prev + 1);
    }
  };

  const handleNextTask = () => {
    setRoundNumber((prev) => prev + 1);
    setCurrentTask(generateTask(practiceMode));
    setUserSelection('');
    setIsAnswered(false);
  };

  const handleSetPrefixBits = (count: number) => {
    const newBits = Array(8)
      .fill(0)
      .map((_, i) => (i < count ? 1 : 0));
    setBits(newBits);
    if (soundEnabled) playClickSound();
  };

  const toggleBit = (index: number) => {
    // IPv4 subnet mask rule: '0' cannot precede '1'.
    // Clicking bit at index sets all preceding bits (0..index) to 1.
    // If clicking the current rightmost active boundary bit, toggle it off.
    const currentActiveCount = bits.filter((b) => b === 1).length;
    const newCount = currentActiveCount === index + 1 ? index : index + 1;
    const newBits = Array.from({ length: 8 }, (_, i) => (i < newCount ? 1 : 0));
    setBits(newBits);
    if (soundEnabled) playClickSound();
  };

  const calcResult = subnetCalc(calcIp, calcPrefix);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <Calculator className="w-3.5 h-3.5" />
              IPv4 без магии · Считаем подсети в уме
            </div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Интерактивный тренажёр IPv4 и CIDR
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Золотое правило быстрого расчёта в уме: <strong className="text-cyan-300">Шаг сети = 256 − октет маски</strong>.
              Например, /27 → 255.255.255.224 → 256 − 224 = 32. Подсети: 0, 32, 64, 96, 128...
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setSubTab('practice')}
              type="button"
              className={\`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                subTab === 'practice'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }\`}
            >
              Тренировка навыков
            </button>
            <button
              onClick={() => setSubTab('calculator')}
              type="button"
              className={\`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                subTab === 'calculator'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }\`}
            >
              Калькулятор
            </button>
            <button
              onClick={() => setSubTab('bits')}
              type="button"
              className={\`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                subTab === 'bits'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }\`}
            >
              8 Битов октета
            </button>
            <button
              onClick={() => setSubTab('cheatsheet')}
              type="button"
              className={\`px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                subTab === 'cheatsheet'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }\`}
            >
              Таблица CIDR
            </button>
          </div>
        </div>
      </div>

      {/* Sub-tab 1: Interactive Practice Trainer */}
      {subTab === 'practice' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Practice Modes Sidebar */}
          <div className="lg:col-span-4 space-y-3">
            <div className="p-4 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                1. Базовые навыки и границы
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'cidr-to-mask', label: 'CIDR → Маска' },
                  { id: 'mask-to-cidr', label: 'Маска → CIDR' },
                  { id: 'step', label: 'Шаг сети (магическое число)' },
                  { id: 'network', label: 'Адрес сети' },
                  { id: 'broadcast', label: 'Широковещательный адрес (Broadcast)' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPracticeMode(item.id as PracticeMode)}
                    type="button"
                    className={\`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer min-h-[42px] \${
                      practiceMode === item.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                    }\`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-2 border-t border-slate-800">
                2. Практика хостов и доставка
              </h3>
              <div className="grid grid-cols-1 gap-1.5">
                {[
                  { id: 'first-host', label: 'Первый хост' },
                  { id: 'last-host', label: 'Последний хост' },
                  { id: 'same-subnet', label: 'В одной ли подсети?' },
                  { id: 'gateway-or-direct', label: 'Напрямую или через шлюз?' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setPracticeMode(item.id as PracticeMode)}
                    type="button"
                    className={\`w-full py-2.5 px-3 rounded-xl text-left text-xs font-bold transition-all cursor-pointer min-h-[42px] \${
                      practiceMode === item.id
                        ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900/60 text-slate-300 hover:bg-slate-800'
                    }\`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Score Tracker */}
            <div className="p-4 rounded-2xl bg-slate-900/70 border border-slate-800 flex items-center justify-between text-xs font-mono">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase">Текущий раунд</span>
                <span className="text-white font-bold text-sm">Задание #{roundNumber}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px] uppercase">Правильных</span>
                <span className="text-emerald-400 font-bold text-sm">{scoreCorrect} верно</span>
              </div>
            </div>
          </div>

          {/* Interactive Question Card */}
          <div className="lg:col-span-8 p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6">
            {currentTask ? (
              <>
                <div className="flex items-center justify-between">
                  <span className="px-3 py-1 rounded-lg bg-cyan-950/70 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold">
                    Навык: {practiceMode}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    Задание {roundNumber}
                  </span>
                </div>

                <h2 className="text-lg sm:text-xl font-black text-white leading-relaxed">
                  {currentTask.question}
                </h2>

                {currentTask.hint && (
                  <p className="text-xs text-amber-300 font-mono bg-amber-950/20 p-2.5 rounded-xl border border-amber-500/20">
                    💡 Подсказка: {currentTask.hint}
                  </p>
                )}

                {/* Option buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {currentTask.options.map((opt, idx) => {
                    const isSelected = userSelection === opt;
                    const isTargetCorrect = opt === currentTask.correctAnswer;

                    let btnClass = 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-200';
                    if (isAnswered) {
                      if (isTargetCorrect) {
                        btnClass = 'bg-emerald-950/70 border-emerald-500 text-emerald-200 font-bold shadow-lg shadow-emerald-500/20';
                      } else if (isSelected && !isTargetCorrect) {
                        btnClass = 'bg-rose-950/70 border-rose-500 text-rose-200';
                      }
                    } else if (isSelected) {
                      btnClass = 'bg-cyan-950/70 border-cyan-400 text-cyan-200 ring-1 ring-cyan-400';
                    }

                    return (
                      <button
                        key={idx}
                        onClick={() => handleSelectOption(opt)}
                        type="button"
                        className={\`p-4 rounded-2xl text-left border transition-all cursor-pointer min-h-[58px] flex items-center justify-between \${btnClass}\`}
                      >
                        <span className="font-mono text-xs sm:text-sm">{opt}</span>
                        {isAnswered && isTargetCorrect && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                        )}
                        {isAnswered && isSelected && !isTargetCorrect && (
                          <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Feedback & Step by step explanation */}
                {isAnswered && (
                  <div
                    className={\`p-5 rounded-2xl border space-y-2 animate-fade-in \${
                      isCorrect
                        ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-200'
                        : 'bg-rose-950/40 border-rose-500/40 text-rose-200'
                    }\`}
                  >
                    <div className="flex items-center gap-2 font-bold text-sm">
                      {isCorrect ? (
                        <>
                          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                          <span>Правильно! Отличный результат.</span>
                        </>
                      ) : (
                        <>
                          <XCircle className="w-5 h-5 text-rose-400" />
                          <span>Неверно. Правильный ответ: {currentTask.correctAnswer}</span>
                        </>
                      )}
                    </div>
                    <p className="text-xs text-slate-300 leading-relaxed">
                      {currentTask.explanation}
                    </p>
                    {currentTask.stepFormula && (
                      <div className="mt-2 p-2 rounded-lg bg-black/40 font-mono text-cyan-300 text-xs">
                        {currentTask.stepFormula}
                      </div>
                    )}
                  </div>
                )}

                {/* Bottom actions */}
                <div className="pt-2 flex justify-end gap-3">
                  {!isAnswered ? (
                    <button
                      onClick={handleCheckAnswer}
                      disabled={!userSelection}
                      type="button"
                      className="py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] disabled:opacity-40 transition-all min-h-[48px] shadow-lg shadow-cyan-500/20 cursor-pointer"
                    >
                      Проверить ответ
                    </button>
                  ) : (
                    <button
                      onClick={handleNextTask}
                      type="button"
                      className="py-3 px-8 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs sm:text-sm hover:brightness-110 active:scale-[0.99] transition-all min-h-[48px] shadow-lg shadow-cyan-500/20 cursor-pointer flex items-center gap-2"
                    >
                      <span>Следующее задание</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </>
            ) : null}
          </div>
        </div>
      )}

      {/* Sub-tab 2: Live Subnet Calculator */}
      {subTab === 'calculator' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6">
          <div>
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Calculator className="w-5 h-5 text-cyan-400" />
              Интерактивный калькулятор подсетей IPv4
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Введите любой IPv4-адрес и выберите маску / CIDR для мгновенного математического разбора
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                IP-адрес хоста
              </label>
              <input
                type="text"
                value={calcIp}
                onChange={(e) => setCalcIp(e.target.value)}
                placeholder="192.168.1.10"
                className="w-full px-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm focus:outline-none focus:border-cyan-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                Префикс маски: /{calcPrefix} ({maskText(calcPrefix)})
              </label>
              <input
                type="range"
                min="8"
                max="30"
                value={calcPrefix}
                onChange={(e) => setCalcPrefix(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 mt-3"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>/8 (Class A)</span>
                <span>/16 (Class B)</span>
                <span>/24 (Class C)</span>
                <span>/30 (P2P)</span>
              </div>
            </div>
          </div>

          {/* Detailed Subnet Breakdown Card */}
          <div className="p-5 rounded-2xl bg-[#060f1b] border border-cyan-500/30 space-y-4 font-mono text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Адрес сети (Network)</span>
                <span className="text-cyan-300 font-bold text-sm">{calcResult.network}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Broadcast адрес</span>
                <span className="text-rose-300 font-bold text-sm">{calcResult.broadcast}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Маска подсети</span>
                <span className="text-white font-bold text-sm">{calcResult.mask}</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Диапазон хостов</span>
                <span className="text-emerald-300 font-bold text-xs">
                  {calcResult.first} — {calcResult.last}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Всего адресов / Хостов</span>
                <span className="text-purple-300 font-bold text-sm">
                  {calcResult.total} ({calcResult.usable} для хостов)
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-slate-500 text-[10px] uppercase block">Инверсная маска (Wildcard)</span>
                <span className="text-amber-300 font-bold text-sm">{calcResult.wildcard}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 3: 8 Bits of an Octet Explorer */}
      {subTab === 'bits' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Пойми один октет маски
            </span>
            <h2 className="text-xl font-bold text-white mt-1">
              8 Битов и веса позиций: 128, 64, 32, 16, 8, 4, 2, 1
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              В маске сети перед <code className="text-cyan-300 font-bold">1</code> не может стоять <code className="text-slate-300 font-bold">0</code>. При клике на любой бит (например, 2 или 1) все биты левее автоматически становятся единицами.
            </p>
          </div>

          {/* Interactive bits display */}
          <div className="p-6 rounded-2xl bg-[#060f1b] border border-cyan-500/30 space-y-6">
            <div className="p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-xs text-cyan-200 flex items-start gap-2 max-w-xl mx-auto">
              <span className="text-cyan-400 font-bold text-sm">💡</span>
              <p className="leading-relaxed">
                <strong>Правило непрерывности:</strong> маска подсети — это сплошной ряд единиц слева направо. Нажатие на бит <span className="font-mono text-cyan-300">2</span> заполнит 7 бит (254), а на <span className="font-mono text-cyan-300">1</span> — все 8 бит (255).
              </p>
            </div>

            <div className="grid grid-cols-8 gap-2 max-w-xl mx-auto">
              {bits.map((b, idx) => (
                <div key={idx} className="flex flex-col items-center gap-1.5">
                  <span className="text-[10px] font-mono text-slate-500">{bitWeights[idx]}</span>
                  <button
                    onClick={() => toggleBit(idx)}
                    type="button"
                    title={\`Бит веса \${bitWeights[idx]}: кликните для установки маски до этой позиции\`}
                    className={\`w-full aspect-square rounded-xl flex items-center justify-center font-mono font-black text-base sm:text-xl border transition-all cursor-pointer \${
                      b === 1
                        ? 'bg-cyan-500 border-cyan-300 text-slate-950 shadow-lg shadow-cyan-500/30 scale-105'
                        : 'bg-slate-900 border-slate-700 text-slate-500 hover:border-slate-500'
                    }\`}
                  >
                    {b}
                  </button>
                  <span className="text-[9px] font-mono text-slate-400">2^{7 - idx}</span>
                </div>
              ))}
            </div>

            {/* Decimal sum & Network step */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-xl mx-auto text-center pt-2">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Двоичный октет</span>
                <code className="text-cyan-400 font-mono font-bold text-sm tracking-widest">{bits.join('')}</code>
                <span className="text-[10px] text-slate-500 block mt-0.5">
                  {bits.filter((x) => x === 1).length} из 8 бит
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-cyan-500/30">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Десятичный октет</span>
                <div className="text-2xl font-black text-white font-mono">{decimalValue}</div>
                <span className="text-[10px] text-cyan-300 block mt-0.5">Значение маски</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Шаг подсети</span>
                <div className="text-xl font-bold text-amber-300 font-mono">
                  {decimalValue === 0 ? 256 : decimalValue === 255 ? 1 : 256 - decimalValue}
                </div>
                <span className="text-[10px] text-slate-500 block mt-0.5">256 − {decimalValue}</span>
              </div>
            </div>

            {/* Preset chips */}
            <div className="flex flex-wrap justify-center gap-1.5 pt-2 border-t border-slate-800">
              <span className="text-xs text-slate-400 self-center mr-1">Быстрые маски:</span>
              {[
                { count: 0, val: 0 },
                { count: 1, val: 128 },
                { count: 2, val: 192 },
                { count: 3, val: 224 },
                { count: 4, val: 240 },
                { count: 5, val: 248 },
                { count: 6, val: 252 },
                { count: 7, val: 254 },
                { count: 8, val: 255 },
              ].map((chip) => {
                const isActive = decimalValue === chip.val;
                return (
                  <button
                    key={chip.val}
                    onClick={() => handleSetPrefixBits(chip.count)}
                    type="button"
                    className={\`px-2.5 py-1.5 rounded-lg border font-mono text-xs transition-all cursor-pointer \${
                      isActive
                        ? 'bg-cyan-500 border-cyan-300 text-slate-950 font-bold shadow-md shadow-cyan-500/20'
                        : 'bg-slate-900 border-slate-700 text-cyan-300 hover:border-cyan-400'
                    }\`}
                  >
                    {chip.val} ({chip.count} б.)
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Sub-tab 4: CIDR Reference Table */}
      {subTab === 'cheatsheet' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-cyan-400" />
            Справочная таблица префиксов CIDR от /16 до /30
          </h2>
          <div className="overflow-x-auto rounded-xl border border-slate-800">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/80 text-cyan-400 uppercase text-[10px]">
                <tr>
                  <th className="p-3">CIDR</th>
                  <th className="p-3">Маска</th>
                  <th className="p-3">Октет & Шаг</th>
                  <th className="p-3">Всего IP</th>
                  <th className="p-3">Хостов</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {[16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30].map((p) => {
                  const step = interestingOctet(p);
                  const total = Math.pow(2, 32 - p);
                  const usable = total - 2;
                  return (
                    <tr key={p} className="hover:bg-slate-900/40 text-slate-300">
                      <td className="p-3 font-bold text-white">/{p}</td>
                      <td className="p-3 text-cyan-300">{maskText(p)}</td>
                      <td className="p-3 text-amber-300">
                        Шаг {step.step} в {step.octet}-м октете
                      </td>
                      <td className="p-3">{total.toLocaleString()}</td>
                      <td className="p-3 text-emerald-300 font-bold">
                        {usable.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
`,tt=`import React, { useMemo } from 'react';
import { triggerHaptic } from '../utils/haptics';
import {
  Flame,
  Award,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  RotateCcw,
} from 'lucide-react';

interface KnowledgeRadarProps {
  onStartExam: (mode?: string) => void;
  onReviewMistakes: () => void;
  onOpenVisualL1: () => void;
  mistakesCount: number;
  totalQuestionsCount?: number;
}

export const KnowledgeRadar: React.FC<KnowledgeRadarProps> = ({
  onStartExam,
  onReviewMistakes,
  onOpenVisualL1,
  mistakesCount,
  totalQuestionsCount = 502,
}) => {
  // Read stats from localStorage or compute sensible defaults
  const stats = useMemo(() => {
    let streakDays = 7;
    let scorePercent = 72;
    let weakSpot = 'L3 подсети и маски';
    let strongSpot = 'L1 фото оборудования';

    try {
      const savedHistory = localStorage.getItem('osi_exam_history');
      if (savedHistory) {
        const history = JSON.parse(savedHistory);
        if (Array.isArray(history) && history.length > 0) {
          const totalScore = history.reduce((acc, h) => acc + (h.percentage || 0), 0);
          scorePercent = Math.round(totalScore / history.length);
        }
      }

      // Check mistakes to determine real weak spot
      const savedMistakes = localStorage.getItem('osi_last_mistakes');
      if (savedMistakes) {
        const m = JSON.parse(savedMistakes);
        if (Array.isArray(m) && m.length > 0) {
          const l3Count = m.filter((id: string) => id.startsWith('l3') || id.includes('subnet')).length;
          const l4Count = m.filter((id: string) => id.startsWith('l4') || id.includes('transport')).length;
          const l2Count = m.filter((id: string) => id.startsWith('l2') || id.includes('vlan')).length;

          if (l3Count >= l4Count && l3Count >= l2Count) {
            weakSpot = 'L3 расчёт масок и маршрутов';
          } else if (l4Count >= l2Count) {
            weakSpot = 'L4 флаги TCP и сокеты';
          } else if (l2Count > 0) {
            weakSpot = 'L2 VLAN и кадры Ethernet';
          }
        }
      }
    } catch {
      // safe fallback
    }

    return { streakDays, scorePercent, weakSpot, strongSpot };
  }, [mistakesCount]);

  // SVG Circular Gauge Math
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (stats.scorePercent / 100) * circumference;

  return (
    <div className="space-y-3 w-full">
      {/* Hero Readiness & Streak Card (Matching Mockup Bento Card) */}
      <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-[#0c1c2e] via-[#091524] to-[#07111f] border border-cyan-500/30 shadow-2xl relative overflow-hidden">
        {/* Subtle radial glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          {/* Circular Readiness Gauge & Text */}
          <div className="flex items-center gap-4">
            {/* Circular Gauge */}
            <div className="relative w-20 h-20 shrink-0 flex items-center justify-center">
              <svg className="w-20 h-20 -rotate-90 transform" viewBox="0 0 96 96">
                {/* Background Ring */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-slate-800"
                  strokeWidth="8"
                  fill="none"
                />
                {/* Progress Ring with Cyan Glow */}
                <circle
                  cx="48"
                  cy="48"
                  r={radius}
                  className="stroke-cyan-400 transition-all duration-1000 ease-out"
                  strokeWidth="8"
                  strokeDasharray={circumference}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  fill="none"
                  style={{
                    filter: 'drop-shadow(0 0 6px rgba(34, 211, 238, 0.6))',
                  }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-xl font-black font-mono text-white leading-none">
                  {stats.scorePercent}%
                </span>
              </div>
            </div>

            {/* Contextual Readiness Analysis */}
            <div className="space-y-1">
              <h2 className="text-sm sm:text-base font-bold text-white tracking-tight">
                Готовность к экзамену
              </h2>
              <div className="text-[11px] sm:text-xs text-slate-300 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-400 shrink-0" />
                  <span>
                    Слабое место:{' '}
                    <strong className="text-rose-300 font-semibold">{stats.weakSpot}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0" />
                  <span>
                    Сильнее всего:{' '}
                    <strong className="text-emerald-300 font-semibold">{stats.strongSpot}</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Streak indicator badge */}
          <div className="flex items-center gap-2 self-start sm:self-center">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-400/40 text-cyan-300 text-xs font-mono font-bold shadow-md shadow-cyan-500/10">
              <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400 animate-pulse" />
              <span>Серия {stats.streakDays} дн.</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bento Action Cards: Mistakes Drill + Visual L1 (Exactly as in mockup) */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {/* Mistakes Review Mini Card */}
        <div
          onClick={() => {
            triggerHaptic('medium');
            onReviewMistakes();
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#091524] border border-rose-500/30 hover:border-rose-400/60 hover:bg-[#0b1a2d] transition-all cursor-pointer flex flex-col justify-between min-h-[96px] shadow-lg shadow-rose-950/20 group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-white group-hover:text-rose-200 transition-colors block">
              Работа над ошибками
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
              {mistakesCount > 0 ? mistakesCount : 14}
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-sans">
            вопросов на повтор
          </span>
        </div>

        {/* Visual L1 Equipment Cards */}
        <div
          onClick={() => {
            triggerHaptic('light');
            onOpenVisualL1();
          }}
          className="p-3.5 sm:p-4 rounded-2xl bg-[#091524] border border-cyan-500/30 hover:border-cyan-400/60 hover:bg-[#0b1a2d] transition-all cursor-pointer flex flex-col justify-between min-h-[96px] shadow-lg shadow-cyan-950/20 group"
        >
          <div className="space-y-1">
            <span className="text-xs font-bold text-white group-hover:text-cyan-200 transition-colors block">
              Фото L1
            </span>
            <div className="text-2xl sm:text-3xl font-black font-mono text-cyan-400">
              26/40
            </div>
          </div>
          <span className="text-[11px] text-slate-400 font-sans">
            разобрано
          </span>
        </div>
      </div>

      {/* Main Big Glow CTA Button: "Продолжить экзамен" */}
      <button
        onClick={() => {
          triggerHaptic('heavy');
          onStartExam();
        }}
        type="button"
        className="w-full py-3.5 sm:py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-400 via-cyan-300 to-teal-300 text-slate-950 font-black text-sm sm:text-base hover:brightness-110 active:scale-[0.99] transition-all flex items-center justify-center gap-2 shadow-[0_0_24px_rgba(34,211,238,0.35)] cursor-pointer tracking-wide"
      >
        <Sparkles className="w-4 h-4 fill-slate-950" />
        <span>Продолжить экзамен</span>
      </button>
    </div>
  );
};
`,nt=`import React, { useState, useEffect } from 'react';
import { triggerHaptic } from '../utils/haptics';
import {
  Sparkles,
  ArrowDown,
  ArrowUp,
  Layers,
  ChevronRight,
  Shield,
  Activity,
  Cpu,
  Globe,
  Radio,
  FileCode,
  HardDrive,
  ExternalLink,
} from 'lucide-react';

export interface OsiLayerItem {
  id: number;
  level: string; // 'L7', 'L6', etc.
  name: string;
  pdu: string;
  color: string;
  glowColor: string;
  protocols: string[];
  description: string;
  devices: string;
  cliTool: string;
  headerFields: string[];
}

export const OSI_STACK_DATA: OsiLayerItem[] = [
  {
    id: 7,
    level: 'L7',
    name: 'Прикладной',
    pdu: 'Данные',
    color: 'text-pink-400',
    glowColor: 'rgba(244, 114, 182, 0.4)',
    protocols: ['HTTP/3', 'HTTPS', 'DNS', 'DHCP', 'SSH', 'BGP'],
    description: 'Интерфейс приложений пользователя, API, веб-сокеты и сетевые сервисы.',
    devices: 'WAF, L7-балансировщики (Nginx/Envoy), веб-серверы',
    cliTool: 'curl -Iv https://site, dig +trace, nslookup',
    headerFields: ['HTTP Request/Response', 'DNS Query Type A/AAAA', 'DHCP Options'],
  },
  {
    id: 6,
    level: 'L6',
    name: 'Представления',
    pdu: 'Данные',
    color: 'text-purple-400',
    glowColor: 'rgba(192, 132, 252, 0.4)',
    protocols: ['TLS 1.3', 'JSON', 'ASCII', 'UTF-8', 'GZIP'],
    description: 'Шифрование сессии (TLS handshake), согласование кодировок и сжатие данных.',
    devices: 'Крипто-шлюзы, TLS Termination прокси',
    cliTool: 'openssl s_client -connect host:443',
    headerFields: ['TLS Record Header', 'Cipher Suites', 'X.509 Certificate'],
  },
  {
    id: 5,
    level: 'L5',
    name: 'Сеансовый',
    pdu: 'Данные',
    color: 'text-indigo-400',
    glowColor: 'rgba(129, 140, 248, 0.4)',
    protocols: ['RPC', 'NetBIOS', 'gRPC Sessions', 'SOCKS5'],
    description: 'Управление сессиями, контрольные точки синхронизации и восстановление диалога.',
    devices: 'Сеансовые шлюзы, координаторы микросервисов',
    cliTool: 'rpcinfo -p, nc -zv host 1080',
    headerFields: ['Session ID', 'Sync Points', 'Transaction Token'],
  },
  {
    id: 4,
    level: 'L4',
    name: 'Транспортный',
    pdu: 'Сегмент',
    color: 'text-cyan-400',
    glowColor: 'rgba(34, 211, 238, 0.4)',
    protocols: ['TCP', 'UDP', 'QUIC', 'SCTP'],
    description: 'Сквозная доставка процессов по портам (1-65535), 3-way handshake, скользящее окно.',
    devices: 'L4 балансировщики нагрузки (HAProxy, IPVS), Stateful Firewall',
    cliTool: 'ss -tulpn, netstat -rn, nc -zv',
    headerFields: ['Src Port (16b)', 'Dst Port (16b)', 'Seq/Ack Num', 'Flags: SYN/ACK/FIN/RST'],
  },
  {
    id: 3,
    level: 'L3',
    name: 'Сетевой',
    pdu: 'Пакет',
    color: 'text-teal-400',
    glowColor: 'rgba(45, 212, 191, 0.4)',
    protocols: ['IPv4', 'IPv6', 'ICMP', 'OSPF', 'IPsec'],
    description: 'Логическая сквозная IP-маршрутизация, декремент TTL, фрагментация MTU, таблицы FIB.',
    devices: 'Маршрутизаторы (Routers), L3-коммутаторы',
    cliTool: 'ip route, traceroute, ping, mtr',
    headerFields: ['Src IP (32b)', 'Dst IP (32b)', 'TTL (8b)', 'Protocol (TCP=6, UDP=17, ICMP=1)'],
  },
  {
    id: 2,
    level: 'L2',
    name: 'Канальный',
    pdu: 'Кадр',
    color: 'text-emerald-400',
    glowColor: 'rgba(52, 211, 153, 0.4)',
    protocols: ['Ethernet (802.3)', 'VLAN (802.1Q)', 'ARP', 'STP'],
    description: 'Физическая адресация по MAC-адресам, CAM-таблица коммутатора, защита от петель (STP).',
    devices: 'L2 Коммутаторы (Switches), сетевые карты (NIC)',
    cliTool: 'ip link, arp -a, bridge fdb show',
    headerFields: ['Dst MAC (48b)', 'Src MAC (48b)', '802.1Q Tag (VLAN ID)', 'EtherType', 'FCS CRC-32'],
  },
  {
    id: 1,
    level: 'L1',
    name: 'Физический',
    pdu: 'Биты',
    color: 'text-amber-400',
    glowColor: 'rgba(251, 191, 36, 0.4)',
    protocols: ['1000BASE-T', '10GBASE-LR', 'Wi-Fi 6', 'SFP+'],
    description: 'Передача сигналов по меди (витая пара), импульсов по оптоволокну (SMF/MMF) или радиоэфиру.',
    devices: 'SFP/SFP+ модули, оптические кроссы, рефлектометры (OTDR), патч-панели',
    cliTool: 'ethtool eth0, ip link show',
    headerFields: ['Преамбула (7B)', 'SFD (1B)', 'Физические уровни напряжения/света'],
  },
];

interface LivingOsiStackProps {
  activeLevel?: string | null;
  onSelectLevel?: (level: string) => void;
  onExploreTheory?: (level: string) => void;
  onStartExamForLevel?: (level: string) => void;
  compact?: boolean;
}

export const LivingOsiStack: React.FC<LivingOsiStackProps> = ({
  activeLevel = 'L4',
  onSelectLevel,
  onExploreTheory,
  onStartExamForLevel,
  compact = false,
}) => {
  const [selectedLayerId, setSelectedLayerId] = useState<number>(4); // default L4 as in mockup
  const [direction, setDirection] = useState<'down' | 'up'>('down');
  const [isAutoAnimating, setIsAutoAnimating] = useState<boolean>(true);
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);

  // Sync external activeLevel prop
  useEffect(() => {
    if (activeLevel) {
      const num = parseInt(activeLevel.replace(/\\D/g, ''), 10);
      if (!isNaN(num) && num >= 1 && num <= 7) {
        setSelectedLayerId(num);
      }
    }
  }, [activeLevel]);

  // Optical packet pulse animation down the fiber
  useEffect(() => {
    if (!isAutoAnimating) return;

    const interval = setInterval(() => {
      setSelectedLayerId((prev) => {
        if (direction === 'down') {
          if (prev <= 1) {
            setDirection('up');
            return 2;
          }
          return prev - 1;
        } else {
          if (prev >= 7) {
            setDirection('down');
            return 6;
          }
          return prev + 1;
        }
      });
    }, 2400);

    return () => clearInterval(interval);
  }, [direction, isAutoAnimating]);

  const handleLayerClick = (layer: OsiLayerItem) => {
    triggerHaptic('selection');
    setIsAutoAnimating(false);
    setSelectedLayerId(layer.id);
    if (onSelectLevel) {
      onSelectLevel(layer.level);
    }
  };

  const selectedLayer = OSI_STACK_DATA.find((l) => l.id === selectedLayerId) || OSI_STACK_DATA[3];

  return (
    <div className="w-full select-none space-y-3">
      {/* Stack Section Header */}
      <div className="flex items-center justify-between px-1 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-white text-sm tracking-tight flex items-center gap-1.5">
            <span>Путь пакета</span>
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
          </span>
          <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
            (живая инкапсуляция)
          </span>
        </div>

        <button
          onClick={() => {
            triggerHaptic('light');
            setDirection((d) => (d === 'down' ? 'up' : 'down'));
          }}
          type="button"
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-cyan-950/60 border border-cyan-500/30 text-cyan-300 font-mono text-[11px] font-bold hover:bg-cyan-900/60 transition-colors cursor-pointer"
          title="Сменить направление: инкапсуляция или декапсуляция"
        >
          {direction === 'down' ? (
            <>
              <span>L7 → L1</span>
              <ArrowDown className="w-3 h-3 text-cyan-400" />
            </>
          ) : (
            <>
              <span>L1 → L7</span>
              <ArrowUp className="w-3 h-3 text-cyan-400" />
            </>
          )}
        </button>
      </div>

      {/* Vertical Stack with Optical Fiber Channel */}
      <div className="relative rounded-2xl bg-[#091524] border border-cyan-500/20 p-2.5 sm:p-3 overflow-hidden shadow-2xl">
        {/* Optical Fiber Background Glow */}
        <div className="absolute top-0 right-1/4 w-32 h-full bg-cyan-500/5 blur-2xl pointer-events-none" />

        {/* Central Vertical Dotted Fiber Track */}
        <div
          className="absolute top-5 bottom-5 right-[102px] sm:right-[130px] w-px border-l-2 border-dashed border-cyan-500/30 pointer-events-none z-0"
          aria-hidden="true"
        />

        {/* Stack Layer Cards (L7 down to L1) */}
        <div className="space-y-1.5 relative z-10">
          {OSI_STACK_DATA.map((layer) => {
            const isSelected = selectedLayerId === layer.id;

            return (
              <div
                key={layer.id}
                onClick={() => handleLayerClick(layer)}
                className={\`relative group rounded-xl p-3 sm:px-4 sm:py-3 transition-all duration-200 cursor-pointer flex items-center justify-between border \${
                  isSelected
                    ? 'bg-gradient-to-r from-cyan-950/90 via-slate-900 to-cyan-950/70 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/90 text-slate-300'
                }\`}
              >
                {/* Left: Level Badge & Layer Title */}
                <div className="flex items-center gap-3 min-w-0">
                  <span
                    className={\`font-mono font-black text-xs sm:text-sm tracking-tight w-6 shrink-0 \${
                      isSelected ? 'text-cyan-300 font-extrabold' : layer.color
                    }\`}
                  >
                    {layer.level}
                  </span>

                  <span
                    className={\`text-xs sm:text-sm font-semibold truncate \${
                      isSelected ? 'text-white font-bold' : 'text-slate-300'
                    }\`}
                  >
                    {layer.name}
                  </span>
                </div>

                {/* Right: Optical Fiber Node & PDU Name */}
                <div className="flex items-center gap-3 shrink-0">
                  {/* Glowing Node on the Fiber Path */}
                  <div className="relative w-6 h-6 flex items-center justify-center">
                    {isSelected ? (
                      <div className="relative flex items-center justify-center">
                        {/* Outer optical beacon wave */}
                        <span className="absolute w-6 h-6 rounded-full bg-cyan-400/25 animate-ping" />
                        {/* Inner radiant diode */}
                        <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 border-2 border-[#091524] shadow-[0_0_12px_#22d3ee]" />
                      </div>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-cyan-500/40 transition-colors" />
                    )}
                  </div>

                  {/* PDU Name */}
                  <span
                    className={\`text-xs sm:text-sm font-mono w-16 sm:w-20 text-right \${
                      isSelected ? 'text-cyan-300 font-bold' : 'text-slate-400'
                    }\`}
                  >
                    {layer.pdu}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Layer Micro-Inspection Card */}
      {selectedLayer && (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-slate-900/95 to-[#0b1b2d] border border-cyan-500/30 space-y-2.5 animate-fade-in text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-mono font-bold text-xs px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30">
                {selectedLayer.level}
              </span>
              <span className="font-bold text-white text-sm">{selectedLayer.name} уровень</span>
            </div>

            <div className="flex items-center gap-1.5">
              {onExploreTheory && (
                <button
                  onClick={() => onExploreTheory(selectedLayer.level)}
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-semibold cursor-pointer transition-colors"
                >
                  В теорию →
                </button>
              )}
              {onStartExamForLevel && (
                <button
                  onClick={() => onStartExamForLevel(selectedLayer.level)}
                  type="button"
                  className="px-2.5 py-1 rounded-lg bg-cyan-500/20 hover:bg-cyan-500/30 border border-cyan-400/40 text-cyan-300 text-[11px] font-bold cursor-pointer transition-colors"
                >
                  Тест {selectedLayer.level} →
                </button>
              )}
            </div>
          </div>

          <p className="text-slate-300 leading-relaxed text-[11px] sm:text-xs">
            {selectedLayer.description}
          </p>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span className="text-[10px] uppercase font-mono text-slate-500 font-bold">Протоколы:</span>
            {selectedLayer.protocols.map((p) => (
              <span
                key={p}
                className="text-[10px] font-mono px-2 py-0.5 rounded bg-black/40 text-cyan-300 border border-cyan-500/20"
              >
                {p}
              </span>
            ))}
          </div>

          <div className="pt-1 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono">
            <span>PDU: <strong className="text-white">{selectedLayer.pdu}</strong></span>
            <span className="truncate max-w-[200px] text-right">CLI: <code className="text-cyan-400">{selectedLayer.cliTool.split(',')[0]}</code></span>
          </div>
        </div>
      )}
    </div>
  );
};
`,rt=`import React from 'react';
import { NavTab } from './Navbar';
import { triggerHaptic } from '../utils/haptics';

interface MobileTabBarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
}

export const MobileTabBar: React.FC<MobileTabBarProps> = ({ activeTab, onTabChange }) => {
  const tabs: Array<{ id: NavTab; label: string }> = [
    { id: 'exam', label: 'Экзамен' },
    { id: 'theory', label: 'Теория' },
    { id: 'ipv4', label: 'IPv4' },
    { id: 'practice', label: 'Практика' },
  ];

  const handleSelect = (tabId: NavTab) => {
    triggerHaptic('selection');
    onTabChange(tabId);
  };

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#07111f]/96 backdrop-blur-2xl border-t border-cyan-500/20 px-3 pt-2 pb-5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] select-none"
      style={{ paddingBottom: 'max(1.25rem, env(safe-area-inset-bottom, 1.25rem))' }}
    >
      <div className="grid grid-cols-4 max-w-md mx-auto items-center">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id || (tab.id === 'theory' && activeTab === 'osi');

          return (
            <button
              key={tab.id}
              onClick={() => handleSelect(tab.id)}
              type="button"
              className="flex flex-col items-center justify-center gap-1.5 py-1 px-2 cursor-pointer transition-all group"
            >
              {/* Dot indicator matching exact design in mockup */}
              <div className="relative w-4 h-4 flex items-center justify-center">
                {isActive ? (
                  <>
                    <span className="absolute w-4 h-4 rounded-full bg-cyan-400/30 animate-ping pointer-events-none" />
                    <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]" />
                  </>
                ) : (
                  <span className="w-2.5 h-2.5 rounded-full border border-slate-600 group-hover:border-slate-400 transition-colors" />
                )}
              </div>

              {/* Label */}
              <span
                className={\`text-[11px] font-bold tracking-tight transition-colors \${
                  isActive ? 'text-cyan-300 font-extrabold' : 'text-slate-400 group-hover:text-slate-200'
                }\`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
`,it=`import React, { useState } from 'react';
import {
  Layers,
  Terminal,
  Activity,
  Cpu,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  UploadCloud,
  ExternalLink,
  Menu,
  X,
  Sparkles,
  FlaskConical,
  BookOpen,
  RotateCcw,
  Download,
  Search,
} from 'lucide-react';

export type NavTab = 'exam' | 'theory' | 'ipv4' | 'practice' | 'osi';

interface NavbarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  isDark: boolean;
  onToggleTheme: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenDeploy: () => void;
  onOpenCommandPalette?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onTabChange,
  isDark,
  onToggleTheme,
  soundEnabled,
  onToggleSound,
  onOpenDeploy,
  onOpenCommandPalette,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const tabs: Array<{ id: NavTab; label: string; icon: React.ReactNode }> = [
    { id: 'exam', label: 'Экзамен', icon: <Layers className="w-4 h-4" /> },
    { id: 'theory', label: 'Теория и разборы', icon: <BookOpen className="w-4 h-4 text-cyan-400" /> },
    { id: 'ipv4', label: 'IPv4 Тренажёр', icon: <Sparkles className="w-4 h-4 text-amber-400" /> },
    { id: 'practice', label: 'Практика', icon: <FlaskConical className="w-4 h-4 text-indigo-400" /> },
  ];

  const handleTabClick = (tab: NavTab) => {
    onTabChange(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-cyan-500/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            onClick={() => handleTabClick('exam')}
            type="button"
            className="flex items-center gap-2 sm:gap-2.5 text-left cursor-pointer group min-w-0"
          >
            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center font-black text-slate-950 font-mono shadow-md shadow-cyan-500/20 group-hover:scale-105 transition-transform shrink-0">
              7
            </div>
            <div className="min-w-0">
              <div className="font-extrabold text-sm sm:text-base tracking-tight text-white flex items-center gap-1.5 truncate">
                <span>OSI & TCP/IP</span>
                <span className="hidden sm:inline text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/40">
                  Gemini Mirror
                </span>
              </div>
              <p className="text-[10px] text-slate-400 hidden sm:block truncate">
                502 вопроса · визуализаторы · CLI
              </p>
            </div>
          </button>
        </div>

        {/* Desktop Tabs */}
        <nav className="hidden lg:flex items-center gap-1.5 bg-slate-900/60 p-1.5 rounded-2xl border border-slate-800">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id || (tab.id === 'theory' && activeTab === 'osi');
            return (
              <button
                key={tab.id}
                onClick={() => handleTabClick(tab.id)}
                type="button"
                className={\`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all min-h-[38px] cursor-pointer \${
                  isActive
                    ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }\`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Quick Search / Command Palette Trigger */}
          {onOpenCommandPalette && (
            <button
              onClick={onOpenCommandPalette}
              type="button"
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold bg-slate-900/80 border border-slate-700/80 hover:border-cyan-400/50 text-slate-300 hover:text-cyan-300 transition-all cursor-pointer min-h-[38px]"
              title="Поиск и командная строка (Cmd+K / Ctrl+K)"
            >
              <Search className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span className="hidden md:inline font-mono text-[11px] text-slate-400">⌘K</span>
            </button>
          )}

          {/* Link to original ChatGPT site */}
          <a
            href="https://apotet.github.io/osi-tcpip-exam-public/"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden xl:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-emerald-300 bg-slate-900/60 border border-slate-800 hover:border-emerald-500/40 transition-all min-h-[38px]"
            title="Открыть исходный сайт от ChatGPT"
          >
            <span>Оригинал</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-70" />
          </a>

          {/* Download ZIP Button */}
          <a
            href="/osi-tcpip-trainer-source.zip"
            download="osi-tcpip-trainer-source.zip"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-bold bg-emerald-950/70 border border-emerald-400/50 text-emerald-300 hover:bg-emerald-900/80 transition-all min-h-[38px] shadow-sm shadow-emerald-500/20"
            title="Скачать полный ZIP архив проекта"
          >
            <Download className="w-4 h-4 text-emerald-400 shrink-0" />
            <span className="hidden sm:inline">ZIP</span>
          </a>

          {/* GitHub Sync Button */}
          <button
            onClick={onOpenDeploy}
            type="button"
            className="inline-flex items-center gap-1.5 px-2.5 sm:px-3.5 py-2 rounded-xl text-xs font-bold bg-cyan-950/70 border border-cyan-400/50 text-cyan-300 hover:bg-cyan-900/80 transition-all cursor-pointer min-h-[38px] shadow-sm shadow-cyan-500/20"
            title="Синхронизация зеркала с GitHub Pages"
          >
            <UploadCloud className="w-4 h-4 text-cyan-400 shrink-0" />
            <span className="hidden sm:inline">Синхронизация</span>
          </button>

          {/* Reload / Refresh App Cache Button (Desktop / Tablet) */}
          <button
            onClick={() => {
              window.location.href = window.location.origin + window.location.pathname + '?reload=' + Date.now();
            }}
            type="button"
            className="hidden sm:flex p-2 text-slate-400 hover:text-cyan-300 rounded-xl hover:bg-white/5 transition-colors min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer"
            aria-label="Обновить код приложения"
            title="Перезагрузить код приложения (сброс кэша)"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Sound Toggle (Desktop / Tablet) */}
          <button
            onClick={onToggleSound}
            type="button"
            className="hidden sm:flex p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer"
            aria-label={soundEnabled ? 'Выключить звук' : 'Включить звук'}
            title={soundEnabled ? 'Звук включен' : 'Звук выключен'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-cyan-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-slate-500" />
            )}
          </button>

          {/* Theme Toggle (Desktop / Tablet) */}
          <button
            onClick={onToggleTheme}
            type="button"
            className="hidden sm:flex p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/5 transition-colors min-h-[38px] min-w-[38px] items-center justify-center cursor-pointer"
            aria-label={isDark ? 'Включить светлую тему' : 'Включить тёмную тему'}
          >
            {isDark ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-indigo-400" />
            )}
          </button>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            type="button"
            className="lg:hidden p-2 text-slate-300 hover:text-white rounded-xl hover:bg-white/10 transition-colors min-h-[38px] min-w-[38px] flex items-center justify-center cursor-pointer"
            aria-label="Открыть меню"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden p-4 border-t border-slate-800 bg-[#07111f]/98 backdrop-blur-2xl space-y-3 animate-fade-in shadow-2xl">
          <div className="space-y-1.5">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id || (tab.id === 'theory' && activeTab === 'osi');
              return (
                <button
                  key={tab.id}
                  onClick={() => handleTabClick(tab.id)}
                  type="button"
                  className={\`w-full flex items-center gap-3 p-3 rounded-xl text-sm font-bold transition-all min-h-[44px] cursor-pointer \${
                    isActive
                      ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-black'
                      : 'text-slate-300 hover:bg-white/5'
                  }\`}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Mobile Quick Controls Toolbar */}
          <div className="pt-3 border-t border-slate-800/80">
            <div className="text-[11px] font-mono uppercase tracking-wider text-slate-400 mb-2 px-1">
              Быстрые настройки
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={onToggleSound}
                type="button"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col items-center justify-center gap-1 hover:border-cyan-500/40 cursor-pointer"
              >
                {soundEnabled ? (
                  <Volume2 className="w-4 h-4 text-cyan-400" />
                ) : (
                  <VolumeX className="w-4 h-4 text-slate-500" />
                )}
                <span className="text-[10px]">{soundEnabled ? 'Звук вкл' : 'Без звука'}</span>
              </button>

              <button
                onClick={onToggleTheme}
                type="button"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col items-center justify-center gap-1 hover:border-cyan-500/40 cursor-pointer"
              >
                {isDark ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-indigo-400" />
                )}
                <span className="text-[10px]">{isDark ? 'Тёмная' : 'Светлая'}</span>
              </button>

              <button
                onClick={() => {
                  window.location.href = window.location.origin + window.location.pathname + '?reload=' + Date.now();
                }}
                type="button"
                className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-300 flex flex-col items-center justify-center gap-1 hover:border-cyan-500/40 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-cyan-400" />
                <span className="text-[10px]">Сброс кэша</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs">
            <a
              href="https://apotet.github.io/osi-tcpip-exam-public/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-400 hover:underline flex items-center gap-1 font-mono text-[11px]"
            >
              <span>Оригинал ChatGPT</span>
              <ExternalLink className="w-3 h-3" />
            </a>

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenDeploy();
              }}
              type="button"
              className="text-cyan-300 hover:underline flex items-center gap-1 font-mono text-[11px] font-bold cursor-pointer"
            >
              <UploadCloud className="w-3 h-3" />
              <span>Опубликовать</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
`,at=`import React, { useState } from 'react';
import { Layers, ArrowDown, Shield, Server, Cpu, Globe, Laptop, HardDrive } from 'lucide-react';

interface LayerInfo {
  number: number;
  name: string;
  tcpIpName: string;
  pdu: string;
  color: string;
  borderColor: string;
  protocols: string[];
  devices: string[];
  functions: string;
  cliTools: string[];
  headers: string[];
}

const OSI_LAYERS: LayerInfo[] = [
  {
    number: 7,
    name: 'Прикладной (Application)',
    tcpIpName: 'Прикладной уровень (Application)',
    pdu: 'Данные (Data)',
    color: 'from-pink-500/20 to-rose-500/10 text-pink-300',
    borderColor: 'border-pink-500/30',
    protocols: ['HTTP/HTTPS', 'DNS', 'DHCP', 'SSH', 'FTP', 'SMTP', 'WebSocket'],
    devices: ['Веб-серверы', 'Прокси-серверы', 'WAF', 'Балансировщики L7 (Nginx)'],
    functions: 'Взаимодействие приложений пользователя с сетью, API интерфейсы, форматы запросов и ответов.',
    cliTools: ['curl', 'wget', 'nslookup', 'dig', 'ssh'],
    headers: ['HTTP Headers (Host, User-Agent, Content-Type, Cookies)'],
  },
  {
    number: 6,
    name: 'Представительский (Presentation)',
    tcpIpName: 'Прикладной уровень (Application)',
    pdu: 'Данные (Data)',
    color: 'from-purple-500/20 to-indigo-500/10 text-purple-300',
    borderColor: 'border-purple-500/30',
    protocols: ['TLS / SSL', 'ASCII', 'UTF-8', 'JPEG', 'JSON', 'GZIP'],
    devices: ['Крипто-ускорители', 'TLS Termination Gateway'],
    functions: 'Кодирование, сжатие данных и сквозное шифрование (TLS handshake, сертификаты X.509).',
    cliTools: ['openssl s_client', 'certbot'],
    headers: ['TLS Record Header, TLS Handshake ClientHello'],
  },
  {
    number: 5,
    name: 'Сеансовый (Session)',
    tcpIpName: 'Прикладной уровень (Application)',
    pdu: 'Данные (Data)',
    color: 'from-indigo-500/20 to-blue-500/10 text-indigo-300',
    borderColor: 'border-indigo-500/30',
    protocols: ['RPC', 'NetBIOS', 'PPTP', 'SOCKS5'],
    devices: ['Сеансовые шлюзы', 'Кластерные координаторы'],
    functions: 'Управление сессиями, контрольные точки синхронизации, восстановление прерванных сессий.',
    cliTools: ['rpcinfo'],
    headers: ['Session Token / RPC Request ID'],
  },
  {
    number: 4,
    name: 'Транспортный (Transport)',
    tcpIpName: 'Транспортный (Transport)',
    pdu: 'Сегмент (TCP) / Датаграмма (UDP)',
    color: 'from-blue-500/20 to-cyan-500/10 text-blue-300',
    borderColor: 'border-blue-500/30',
    protocols: ['TCP', 'UDP', 'QUIC', 'SCTP'],
    devices: ['L4 Балансировщики нагрузки (HAProxy, IPVS)', 'Stateful межсетевые экраны'],
    functions: 'Сквозная доставка между процессами хостов, адресация по портам (1-65535), 3-way handshake, надежность и контроль перегрузок.',
    cliTools: ['netstat -tulnp', 'ss -tulpn', 'nc -zv', 'telnet'],
    headers: ['Source Port (16b)', 'Dest Port (16b)', 'Seq Number (32b)', 'Ack Number (32b)', 'Flags: SYN/ACK/FIN/RST', 'Window Size'],
  },
  {
    number: 3,
    name: 'Сетевой (Network)',
    tcpIpName: 'Межсетевой (Internet)',
    pdu: 'Пакет (Packet)',
    color: 'from-cyan-500/20 to-teal-500/10 text-cyan-300',
    borderColor: 'border-cyan-500/30',
    protocols: ['IPv4', 'IPv6', 'ICMP', 'IPsec', 'OSPF', 'BGP'],
    devices: ['Маршрутизаторы (Routers)', 'L3-коммутаторы (Multilayer Switches)'],
    functions: 'Логическая адресация IP, таблица маршрутизации (FIB), декремент TTL, фрагментация при превышении MTU.',
    cliTools: ['ip route', 'ping', 'traceroute', 'mtr'],
    headers: ['Version', 'IHL', 'DSCP/TOS', 'Total Length', 'TTL (8b)', 'Protocol (TCP=6, UDP=17, ICMP=1)', 'Src IP', 'Dst IP'],
  },
  {
    number: 2,
    name: 'Канальный (Data Link)',
    tcpIpName: 'Сетевой доступ (Network Access)',
    pdu: 'Кадр (Frame)',
    color: 'from-teal-500/20 to-emerald-500/10 text-teal-300',
    borderColor: 'border-teal-500/30',
    protocols: ['Ethernet (802.3)', 'Wi-Fi (802.11)', 'VLAN (802.1Q)', 'ARP', 'STP (802.1D)', 'LACP (802.3ad)'],
    devices: ['Коммутаторы (Switches L2)', 'Сетевые карты (NIC)', 'Точки доступа (AP)', 'Мосты (Bridges)'],
    functions: 'Физическая адресация по MAC-адресам, изучение таблицы CAM, коммутация без петель (STP), обнаружение ошибок (FCS CRC32).',
    cliTools: ['ip link', 'arp -a', 'brctl', 'bridge fdb show', 'ethtool'],
    headers: ['Preamble', 'Dest MAC (48b)', 'Src MAC (48b)', '802.1Q Tag (optional 32b)', 'EtherType (0x0800=IPv4, 0x0806=ARP)', 'Payload', 'FCS (32b CRC)'],
  },
  {
    number: 1,
    name: 'Физический (Physical)',
    tcpIpName: 'Сетевой доступ (Network Access)',
    pdu: 'Биты (Bits / Signals)',
    color: 'from-amber-500/20 to-orange-500/10 text-amber-300',
    borderColor: 'border-amber-500/30',
    protocols: ['1000BASE-T', '10GBASE-SR/LR', 'SFP/SFP+ / QSFP', 'RJ-45 (8P8C)', 'LC/SC Оптика', 'RS-232'],
    devices: ['Концентраторы (Hubs)', 'Повторители (Repeaters)', 'Патч-панели', 'Медиаконвертеры', 'Трансиверы SFP'],
    functions: 'Преобразование битов в физические сигналы: электрические импульсы по меди, свет по оптоволокну, радиоволны в воздухе.',
    cliTools: ['ethtool eth0', 'ip -s link'],
    headers: ['Нет логических заголовков — передаются импульсы напряжения/света'],
  },
];

export const OsiExplorer: React.FC = () => {
  const [selectedLayerNum, setSelectedLayerNum] = useState<number>(7);
  const selected = OSI_LAYERS.find((l) => l.number === selectedLayerNum) || OSI_LAYERS[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Интерактивный справочник
        </span>
        <h2 className="text-2xl font-black tracking-tight text-white mt-1">
          7 Уровней модели OSI и стек TCP/IP
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Нажмите на любой уровень, чтобы изучить его PDU, протоколы, структуру заголовков, устройства и CLI-команды
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Layer Stack list (7 -> 1) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-1 mb-2">
            Стек уровней (от L7 к L1)
          </div>
          {OSI_LAYERS.map((layer) => {
            const isSelected = layer.number === selectedLayerNum;
            return (
              <button
                key={layer.number}
                onClick={() => setSelectedLayerNum(layer.number)}
                type="button"
                className={\`w-full p-3.5 rounded-xl text-left border transition-all flex items-center justify-between cursor-pointer min-h-[54px] \${
                  isSelected
                    ? \`bg-slate-900/90 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400\`
                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-300'
                }\`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={\`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-black text-xs \${
                      isSelected ? 'bg-cyan-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400'
                    }\`}
                  >
                    L{layer.number}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-white">{layer.name}</div>
                    <div className="text-[10px] text-slate-400 font-mono">PDU: {layer.pdu}</div>
                  </div>
                </div>

                <div className="text-right hidden sm:block">
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/40 font-mono text-cyan-300">
                    {layer.tcpIpName.split(' ')[0]}
                  </span>
                </div>
              </button>
            );
          })}
        </div>

        {/* Selected Layer Details */}
        <div className="lg:col-span-7 p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded bg-cyan-500/20 border border-cyan-400/40 font-mono font-bold text-cyan-300 text-xs">
                  Уровень {selected.number}
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  Стек TCP/IP: <span className="text-white font-bold">{selected.tcpIpName}</span>
                </span>
              </div>
              <h3 className="text-xl font-black text-white mt-2">{selected.name}</h3>
            </div>
            <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">Единица данных (PDU)</span>
              <span className="font-mono text-sm font-bold text-cyan-300">{selected.pdu}</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1.5">
              Назначение и функции
            </h4>
            <p className="text-xs sm:text-sm text-slate-200 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
              {selected.functions}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 mb-2">
                Ключевые протоколы
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selected.protocols.map((p) => (
                  <span
                    key={p}
                    className="px-2.5 py-1 rounded-md bg-cyan-950/50 border border-cyan-500/30 text-cyan-300 font-mono text-xs"
                  >
                    {p}
                  </span>
                ))}
              </div>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-2">
                Оборудование уровня
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {selected.devices.map((d) => (
                  <span
                    key={d}
                    className="px-2.5 py-1 rounded-md bg-purple-950/50 border border-purple-500/30 text-purple-300 text-xs"
                  >
                    {d}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2">
              CLI команды диагностики
            </h4>
            <div className="flex flex-wrap gap-2">
              {selected.cliTools.map((tool) => (
                <span
                  key={tool}
                  className="px-2.5 py-1 rounded-md bg-black/60 border border-emerald-500/40 text-emerald-300 font-mono text-xs"
                >
                  $ {tool}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-amber-400 mb-2">
              Поля заголовка кадра / пакета
            </h4>
            <div className="p-3 rounded-xl bg-black/40 border border-slate-800 font-mono text-xs text-slate-300 space-y-1">
              {selected.headers.map((h, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-amber-400">▸</span>
                  <span>{h}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`,ot=`import React, { useState } from 'react';
import {
  Play,
  RotateCcw,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Info,
  Server,
  Laptop,
  ArrowRight,
} from 'lucide-react';

interface JourneyStep {
  title: string;
  location: string;
  stageName: string;
  description: string;
  activeDevice: 'pc' | 'switch' | 'router' | 'server';
  frame: {
    srcMac: string;
    dstMac: string;
    etherType: string;
    srcIp: string;
    dstIp: string;
    ttl: number;
    payload: string;
  };
  note: string;
}

const JOURNEY_STEPS: JourneyStep[] = [
  {
    title: 'Шаг 1: Формирование ICMP Echo Request на ПК',
    location: 'ПК (192.168.1.10)',
    stageName: 'L3 / L2 Проверка маршрута и ARP',
    description:
      'Пользователь вводит \`ping 192.168.2.20\`. ПК сверяет адрес назначения со своей маской /24. 192.168.2.20 находится в другой подсети! Значит пакет должен быть направлен на шлюз по умолчанию (192.168.1.1).',
    activeDevice: 'pc',
    frame: {
      srcMac: '00:11:22:AA:BB:10',
      dstMac: '00:11:22:GW:01:01 (MAC шлюза)',
      etherType: '0x0800 (IPv4)',
      srcIp: '192.168.1.10',
      dstIp: '192.168.2.20',
      ttl: 64,
      payload: 'ICMP Echo Request (type 8, code 0)',
    },
    note: 'Обратите внимание: IP получателя — это сервер (192.168.2.20), но MAC получателя — это шлюз по умолчанию (маршрутизатор), а не сервер!',
  },
  {
    title: 'Шаг 2: Коммутация кадра на Switch L2',
    location: 'Коммутатор LAN (L2)',
    stageName: 'L2 Коммутация по MAC-таблице',
    description:
      'Кадр поступает на порт Fa0/1 коммутатора. Коммутатор запоминает source MAC (00:11:22:AA:BB:10 -> порт Fa0/1) в таблице CAM. Затем смотрит destination MAC (шлюз) и пересылает кадр в порт Gi0/1 к маршрутизатору.',
    activeDevice: 'switch',
    frame: {
      srcMac: '00:11:22:AA:BB:10',
      dstMac: '00:11:22:GW:01:01',
      etherType: '0x0800 (IPv4)',
      srcIp: '192.168.1.10',
      dstIp: '192.168.2.20',
      ttl: 64,
      payload: 'ICMP Echo Request',
    },
    note: 'Коммутатор L2 не меняет IP и MAC заголовки! Он лишь передаёт неизменный кадр на соответствующий порт.',
  },
  {
    title: 'Шаг 3: Маршрутизация на Router L3',
    location: 'Маршрутизатор (R1)',
    stageName: 'L3 Маршрутизация & Декремент TTL',
    description:
      'Маршрутизатор принимает кадр на eth0, снимает заголовок Ethernet L2. В заголовке IPv4 он уменьшает TTL на 1 (64 -> 63) и пересчитывает контрольную сумму IPv4 Checksum. Смотрит таблицу маршрутизации: 192.168.2.0/24 доступна через интерфейс eth1.',
    activeDevice: 'router',
    frame: {
      srcMac: '00:11:22:GW:02:01 (eth1 маршрутизатора)',
      dstMac: '00:11:22:SR:20:20 (MAC сервера)',
      etherType: '0x0800 (IPv4)',
      srcIp: '192.168.1.10',
      dstIp: '192.168.2.20',
      ttl: 63,
      payload: 'ICMP Echo Request',
    },
    note: 'Ключевой закон сетей: при прохождении через каждый L3-маршрутизатор IP-адреса остаются прежними, а L2 MAC-адреса полностью перезаписываются!',
  },
  {
    title: 'Шаг 4: Приём пакета сервером и ответ',
    location: 'Сервер (192.168.2.20)',
    stageName: 'L3/L4 Приём ICMP Echo Request',
    description:
      'Сервер сверяет destination MAC и destination IP — совпадает! ОС сервера принимает ICMP Echo Request (type 8) и формирует ответ ICMP Echo Reply (type 0). IP-адреса источника и получателя меняются местами.',
    activeDevice: 'server',
    frame: {
      srcMac: '00:11:22:SR:20:20',
      dstMac: '00:11:22:GW:02:01',
      etherType: '0x0800 (IPv4)',
      srcIp: '192.168.2.20',
      dstIp: '192.168.1.10',
      ttl: 64,
      payload: 'ICMP Echo Reply (type 0, code 0)',
    },
    note: 'Сервер отправляет ответ обратно на шлюз 192.168.2.1 со своим начальным TTL (обычно 64 в Linux или 128 в Windows).',
  },
  {
    title: 'Шаг 5: Обратная маршрутизация и доставка на ПК',
    location: 'ПК (192.168.1.10)',
    stageName: 'Успешный Ping (Echo Reply)',
    description:
      'Маршрутизатор R1 снова уменьшает TTL (64 -> 63), перезаписывает MAC на (Src: 00:11:22:GW:01:01, Dst: 00:11:22:AA:BB:10) и доставляет ответ через коммутатор на ПК. В терминале отображается: "64 bytes from 192.168.2.20: icmp_seq=1 ttl=63 time=2.14 ms".',
    activeDevice: 'pc',
    frame: {
      srcMac: '00:11:22:GW:01:01',
      dstMac: '00:11:22:AA:BB:10',
      etherType: '0x0800 (IPv4)',
      srcIp: '192.168.2.20',
      dstIp: '192.168.1.10',
      ttl: 63,
      payload: 'ICMP Echo Reply [OK]',
    },
    note: 'Круг замкнулся! Весь путь занял несколько миллисекунд.',
  },
];

export const PacketJourney: React.FC = () => {
  const [currentStep, setCurrentStep] = useState<number>(0);
  const step = JOURNEY_STEPS[currentStep];

  const handleNext = () => {
    if (currentStep < JOURNEY_STEPS.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleReset = () => {
    setCurrentStep(0);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Интерактивная симуляция
            </span>
            <h2 className="text-2xl font-black tracking-tight text-white mt-1">
              Путь сетевого пакета: от ПК до Сервера
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Пошаговая визуализация работы протоколов L2/L3: ARP, Ethernet, MAC-таблица, IP-маршрутизация и TTL
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              disabled={currentStep === 0}
              type="button"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Назад"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-mono text-xs px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-cyan-300 font-bold">
              {currentStep + 1} / {JOURNEY_STEPS.length}
            </span>
            <button
              onClick={handleNext}
              disabled={currentStep === JOURNEY_STEPS.length - 1}
              type="button"
              className="p-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-bold transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Далее"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleReset}
              type="button"
              className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              title="Сброс"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Step progress pills */}
        <div className="grid grid-cols-5 gap-2 mt-6">
          {JOURNEY_STEPS.map((s, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentStep(idx)}
              type="button"
              className={\`py-2 px-2 text-center rounded-lg text-[11px] font-semibold transition-all border \${
                idx === currentStep
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-500/30'
                  : idx < currentStep
                  ? 'bg-emerald-950/30 border-emerald-500/40 text-emerald-400'
                  : 'bg-slate-900/40 border-slate-800 text-slate-500 hover:text-slate-300'
              }\`}
            >
              Шаг {idx + 1}
            </button>
          ))}
        </div>
      </div>

      {/* Network Topology Visualizer */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl overflow-hidden">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-cyan-400" />
          Топология сети и текущее положение пакета
        </h3>

        <div className="relative py-8 px-4 rounded-xl bg-[#07111f] border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Node 1: PC */}
          <div
            className={\`flex flex-col items-center p-4 rounded-xl border transition-all \${
              step.activeDevice === 'pc'
                ? 'bg-cyan-950/60 border-cyan-400 shadow-lg shadow-cyan-500/30 scale-105'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }\`}
          >
            <div className="p-3 rounded-full bg-cyan-500/20 text-cyan-300 mb-2">
              <Laptop className="w-7 h-7" />
            </div>
            <span className="font-bold text-xs text-white">ПК Клиент</span>
            <span className="text-[10px] font-mono text-cyan-400">192.168.1.10/24</span>
            <span className="text-[9px] font-mono text-slate-400">MAC: 00:11:22:AA:BB:10</span>
          </div>

          <div className="text-slate-600 font-mono text-xs flex flex-col items-center">
            <span>LAN 1</span>
            <ArrowRight className="w-5 h-5 text-cyan-500/50 hidden md:block" />
          </div>

          {/* Node 2: Switch */}
          <div
            className={\`flex flex-col items-center p-4 rounded-xl border transition-all \${
              step.activeDevice === 'switch'
                ? 'bg-blue-950/60 border-blue-400 shadow-lg shadow-blue-500/30 scale-105'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }\`}
          >
            <div className="p-3 rounded-full bg-blue-500/20 text-blue-300 mb-2">
              <div className="w-7 h-7 flex items-center justify-center font-bold text-xs">L2 SW</div>
            </div>
            <span className="font-bold text-xs text-white">Коммутатор</span>
            <span className="text-[10px] font-mono text-blue-400">VLAN 1 Default</span>
            <span className="text-[9px] font-mono text-slate-400">Таблица CAM</span>
          </div>

          <div className="text-slate-600 font-mono text-xs flex flex-col items-center">
            <span>Trunk / Link</span>
            <ArrowRight className="w-5 h-5 text-cyan-500/50 hidden md:block" />
          </div>

          {/* Node 3: Router */}
          <div
            className={\`flex flex-col items-center p-4 rounded-xl border transition-all \${
              step.activeDevice === 'router'
                ? 'bg-purple-950/60 border-purple-400 shadow-lg shadow-purple-500/30 scale-105'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }\`}
          >
            <div className="p-3 rounded-full bg-purple-500/20 text-purple-300 mb-2">
              <div className="w-7 h-7 flex items-center justify-center font-bold text-xs">L3 RT</div>
            </div>
            <span className="font-bold text-xs text-white">Маршрутизатор R1</span>
            <span className="text-[10px] font-mono text-purple-400">192.168.1.1 ↔ 192.168.2.1</span>
            <span className="text-[9px] font-mono text-slate-400">Шлюз Default Gateway</span>
          </div>

          <div className="text-slate-600 font-mono text-xs flex flex-col items-center">
            <span>LAN 2</span>
            <ArrowRight className="w-5 h-5 text-cyan-500/50 hidden md:block" />
          </div>

          {/* Node 4: Server */}
          <div
            className={\`flex flex-col items-center p-4 rounded-xl border transition-all \${
              step.activeDevice === 'server'
                ? 'bg-emerald-950/60 border-emerald-400 shadow-lg shadow-emerald-500/30 scale-105'
                : 'bg-slate-900/60 border-slate-800 opacity-60'
            }\`}
          >
            <div className="p-3 rounded-full bg-emerald-500/20 text-emerald-300 mb-2">
              <Server className="w-7 h-7" />
            </div>
            <span className="font-bold text-xs text-white">Сервер</span>
            <span className="text-[10px] font-mono text-emerald-400">192.168.2.20/24</span>
            <span className="text-[9px] font-mono text-slate-400">MAC: 00:11:22:SR:20:20</span>
          </div>
        </div>
      </div>

      {/* Frame / Packet Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Step description */}
        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-4">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 text-xs font-bold font-mono">
              {step.stageName}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Локация: <span className="text-slate-200 font-bold">{step.location}</span>
            </span>
          </div>

          <h3 className="text-lg font-bold text-white">{step.title}</h3>
          <p className="text-sm text-slate-300 leading-relaxed">{step.description}</p>

          <div className="p-4 rounded-xl bg-amber-950/30 border-l-4 border-amber-400 text-xs text-amber-200/90 leading-relaxed">
            <strong className="block text-amber-300 font-bold mb-1">Важно для экзамена:</strong>
            {step.note}
          </div>

          <div className="pt-2 flex gap-3">
            <button
              onClick={handleNext}
              disabled={currentStep === JOURNEY_STEPS.length - 1}
              type="button"
              className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 transition-all flex items-center gap-2 min-h-[48px] cursor-pointer shadow-lg shadow-cyan-500/20"
            >
              Следующий шаг
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Packet Headers Inspector */}
        <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-3">
          <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center justify-between">
            <span>Анализатор заголовков кадра (Wireshark View)</span>
            <span className="font-mono text-[10px] text-slate-400">Captured in transit</span>
          </h3>

          <div className="space-y-2 text-xs font-mono">
            {/* L2 Layer */}
            <div className="p-3 rounded-xl bg-blue-950/40 border border-blue-500/30 space-y-1">
              <div className="text-[10px] font-bold text-blue-300 uppercase tracking-wide">
                L2: Ethernet II Frame
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500">Src MAC:</span> {step.frame.srcMac}
                </div>
                <div>
                  <span className="text-slate-500">Dst MAC:</span> {step.frame.dstMac}
                </div>
              </div>
              <div className="text-slate-400 text-[11px]">
                <span className="text-slate-500">EtherType:</span> {step.frame.etherType}
              </div>
            </div>

            {/* L3 Layer */}
            <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 space-y-1">
              <div className="text-[10px] font-bold text-purple-300 uppercase tracking-wide">
                L3: Internet Protocol Version 4 (IPv4)
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-300">
                <div>
                  <span className="text-slate-500">Src IP:</span> {step.frame.srcIp}
                </div>
                <div>
                  <span className="text-slate-500">Dst IP:</span> {step.frame.dstIp}
                </div>
              </div>
              <div className="flex gap-4 text-slate-400 text-[11px]">
                <div>
                  <span className="text-slate-500">TTL:</span>{' '}
                  <span className="font-bold text-purple-300">{step.frame.ttl}</span>
                </div>
                <div>
                  <span className="text-slate-500">Protocol:</span> 1 (ICMP)
                </div>
              </div>
            </div>

            {/* L4 Payload */}
            <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 space-y-1">
              <div className="text-[10px] font-bold text-emerald-300 uppercase tracking-wide">
                L4/L7 Payload: ICMP
              </div>
              <div className="text-slate-200">{step.frame.payload}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
`,st=`import React, { useState } from 'react';
import {
  Activity,
  Layers,
  Cpu,
  Terminal,
  FlaskConical,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { PacketJourney } from './PacketJourney';
import { VlanSimulator } from './VlanSimulator';
import { ProtocolSimulators } from './ProtocolSimulators';
import { CliSimulator } from './CliSimulator';

export type PracticeSimulator = 'journey' | 'vlan' | 'protocols' | 'cli';

interface PracticeItem {
  id: PracticeSimulator;
  title: string;
  badge: string;
  subtitle: string;
  icon: React.ReactNode;
}

const PRACTICE_ITEMS: PracticeItem[] = [
  {
    id: 'journey',
    title: 'Путь пакета',
    badge: 'L2–L7',
    subtitle: 'Анимация инкапсуляции и декапсуляции данных через узлы сети',
    icon: <Activity className="w-4 h-4 text-cyan-400" />,
  },
  {
    id: 'vlan',
    title: 'VLAN & Trunk',
    badge: '802.1Q',
    subtitle: 'Интерактивный коммутатор, изоляция портов и транкинг',
    icon: <Layers className="w-4 h-4 text-purple-400" />,
  },
  {
    id: 'protocols',
    title: 'DHCP / NAT / TCP',
    badge: 'DORA & Handshake',
    subtitle: 'Пошаговые симуляторы сетевых протоколов и трансляции адресов',
    icon: <Cpu className="w-4 h-4 text-emerald-400" />,
  },
  {
    id: 'cli',
    title: 'CLI Терминал',
    badge: 'Cisco & Linux',
    subtitle: 'Эмулятор консоли сетевого оборудования с подсказками команд',
    icon: <Terminal className="w-4 h-4 text-amber-400" />,
  },
];

export const PracticeHub: React.FC = () => {
  const [activeSimulator, setActiveSimulator] = useState<PracticeSimulator>('journey');

  return (
    <div className="space-y-6">
      {/* Practice Header & Sub-Navigation */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold uppercase tracking-wider mb-2">
              <FlaskConical className="w-3.5 h-3.5" />
              Интерактивная лаборатория
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Сетевая практика и симуляторы
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Интерактивные стенды для отработки сетевых процессов: от сборки кадров и изоляции VLAN до симуляции трансляции NAT и терминала Cisco IOS.
            </p>
          </div>
        </div>

        {/* 4 Practice Selector Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {PRACTICE_ITEMS.map((item) => {
            const isActive = activeSimulator === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveSimulator(item.id)}
                type="button"
                className={\`p-4 rounded-2xl text-left border transition-all cursor-pointer flex flex-col justify-between gap-3 \${
                  isActive
                    ? 'bg-gradient-to-b from-cyan-950/80 to-slate-900 border-cyan-400 shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/50'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/60'
                }\`}
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div
                      className={\`p-2 rounded-xl \${
                        isActive ? 'bg-cyan-500/20 text-cyan-300' : 'bg-slate-800 text-slate-400'
                      }\`}
                    >
                      {item.icon}
                    </div>
                    <span className="font-bold text-sm text-white">{item.title}</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                    {item.badge}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {item.subtitle}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Simulator Container */}
      <div className="animate-fade-in">
        {activeSimulator === 'journey' && <PacketJourney />}
        {activeSimulator === 'vlan' && <VlanSimulator />}
        {activeSimulator === 'protocols' && <ProtocolSimulators />}
        {activeSimulator === 'cli' && <CliSimulator />}
      </div>
    </div>
  );
};
`,ct=`import React, { useState } from 'react';
import {
  Server,
  Laptop,
  ArrowRight,
  Shield,
  Layers,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  Globe,
  Radio,
  FileSearch,
} from 'lucide-react';

type ProtoSimTab = 'dhcp' | 'nat' | 'wireshark';

export const ProtocolSimulators: React.FC = () => {
  const [activeTab, setActiveTab] = useState<ProtoSimTab>('dhcp');

  // DHCP Simulator State
  const [dhcpStep, setDhcpStep] = useState<number>(0);
  const dhcpStages = [
    {
      name: 'DHCP DISCOVER',
      direction: 'Клиент → Broadcast (255.255.255.255)',
      srcIp: '0.0.0.0',
      dstIp: '255.255.255.255',
      srcPort: 'UDP 68',
      dstPort: 'UDP 67',
      flags: 'Broadcast: 1 (B=1)',
      desc: 'Клиент подключается к сети, у него нет IP-адреса. Он рассылает широковещательный Discover, запрашивая конфигурацию у любого доступного DHCP-сервера.',
    },
    {
      name: 'DHCP OFFER',
      direction: 'DHCP-Сервер → Клиент',
      srcIp: '192.168.10.2 (Сервер)',
      dstIp: '255.255.255.255',
      srcPort: 'UDP 67',
      dstPort: 'UDP 68',
      flags: 'Предложен IP: 192.168.10.100',
      desc: 'Сервер резервирует свободный IP из пула (192.168.10.100/24, шлюз 192.168.10.1, DNS 192.0.2.53) и отправляет клиенту предложение аренды.',
    },
    {
      name: 'DHCP REQUEST',
      direction: 'Клиент → Broadcast',
      srcIp: '0.0.0.0',
      dstIp: '255.255.255.255',
      srcPort: 'UDP 68',
      dstPort: 'UDP 67',
      flags: 'Запрос принят: 192.168.10.100',
      desc: 'Клиент официально запрашивает предложенный IP у сервера, уведомляя остальные DHCP-серверы о выборе.',
    },
    {
      name: 'DHCP ACK',
      direction: 'DHCP-Сервер → Клиент',
      srcIp: '192.168.10.2',
      dstIp: '255.255.255.255',
      srcPort: 'UDP 67',
      dstPort: 'UDP 68',
      flags: 'Аренда подтверждена на 8 часов',
      desc: 'Сервер финализирует аренду (Acknowledge). Клиент применяет IP, маску /24, шлюз и DNS. Сеть настроена!',
    },
  ];

  // NAT/PAT Simulator State
  const [natStep, setNatStep] = useState<number>(0);
  const natStages = [
    {
      step: '1. Формирование пакета на ПК (Inside Local)',
      src: '192.168.1.50 : 54210',
      dst: '93.184.216.34 : 80 (example.com)',
      location: 'Локальная сеть LAN',
      desc: 'ПК отправляет HTTP-запрос веб-серверу в интернете. Приватный IP (RFC 1918) не маршрутизируется в глобальном интернете.',
    },
    {
      step: '2. Трансляция на NAT-маршрутизаторе (PAT Translation)',
      src: '203.0.113.5 : 40001 (Inside Global)',
      dst: '93.184.216.34 : 80',
      location: 'Маршрутизатор NAT/PAT',
      desc: 'Маршрутизатор заменяет приватный IP 192.168.1.50 на свой публичный IP 203.0.113.5, выделяет уникальный порт 40001 и сохраняет запись в таблице трансляций.',
    },
    {
      step: '3. Ответ веб-сервера через интернет',
      src: '93.184.216.34 : 80',
      dst: '203.0.113.5 : 40001',
      location: 'Интернет WAN',
      desc: 'Веб-сервер отправляет ответ HTTP 200 OK на публичный IP маршрутизатора и порт 40001.',
    },
    {
      step: '4. Обратная трансляция клиенту',
      src: '93.184.216.34 : 80',
      dst: '192.168.1.50 : 54210',
      location: 'Возврат в LAN',
      desc: 'Маршрутизатор находит порт 40001 в таблице трансляций, переписывает адрес на 192.168.1.50:54210 и доставляет ответ клиенту.',
    },
  ];

  // Wireshark Capture State
  const [selectedPacket, setSelectedPacket] = useState<number>(0);
  const wiresharkPackets = [
    {
      no: 1,
      time: '0.000000',
      src: '192.168.1.50',
      dst: '93.184.216.34',
      proto: 'TCP',
      length: 74,
      info: '54210 → 80 [SYN] Seq=0 Win=64240 Len=0 MSS=1460 SACK_PERM',
      details: {
        ethernet: 'Dst: 00:11:22:gw:01:01, Src: 00:11:22:aa:bb:50, Type: IPv4 (0x0800)',
        ip: 'IPv4, Src: 192.168.1.50, Dst: 93.184.216.34, TTL: 64, Protocol: TCP (6)',
        tcp: 'Source Port: 54210, Dst Port: 80, Seq: 0, Flags: 0x002 (SYN)',
      },
    },
    {
      no: 2,
      time: '0.014210',
      src: '93.184.216.34',
      dst: '192.168.1.50',
      proto: 'TCP',
      length: 74,
      info: '80 → 54210 [SYN, ACK] Seq=0 Ack=1 Win=65535 Len=0 MSS=1460',
      details: {
        ethernet: 'Dst: 00:11:22:aa:bb:50, Src: 00:11:22:gw:01:01, Type: IPv4 (0x0800)',
        ip: 'IPv4, Src: 93.184.216.34, Dst: 192.168.1.50, TTL: 52, Protocol: TCP (6)',
        tcp: 'Source Port: 80, Dst Port: 54210, Seq: 0, Ack: 1, Flags: 0x012 (SYN, ACK)',
      },
    },
    {
      no: 3,
      time: '0.014380',
      src: '192.168.1.50',
      dst: '93.184.216.34',
      proto: 'TCP',
      length: 66,
      info: '54210 → 80 [ACK] Seq=1 Ack=1 Win=64240 Len=0',
      details: {
        ethernet: 'Dst: 00:11:22:gw:01:01, Src: 00:11:22:aa:bb:50, Type: IPv4 (0x0800)',
        ip: 'IPv4, Src: 192.168.1.50, Dst: 93.184.216.34, TTL: 64, Protocol: TCP (6)',
        tcp: 'Source Port: 54210, Dst Port: 80, Seq: 1, Ack: 1, Flags: 0x010 (ACK)',
      },
    },
    {
      no: 4,
      time: '0.015120',
      src: '192.168.1.50',
      dst: '93.184.216.34',
      proto: 'HTTP',
      length: 142,
      info: 'GET / HTTP/1.1 (Host: example.com)',
      details: {
        ethernet: 'Dst: 00:11:22:gw:01:01, Src: 00:11:22:aa:bb:50, Type: IPv4 (0x0800)',
        ip: 'IPv4, Src: 192.168.1.50, Dst: 93.184.216.34, TTL: 64, Protocol: TCP (6)',
        tcp: 'Source Port: 54210, Dst Port: 80, Seq: 1, Ack: 1, Flags: [PSH, ACK]',
      },
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
              Сетевые протоколы и анализ
            </span>
            <h2 className="text-2xl sm:text-3xl font-black text-white mt-1">
              DHCP DORA · NAT / PAT · Wireshark
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Ключевые прикладные и транспортные симуляции из основного репозитория
            </p>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-900/80 p-1.5 rounded-2xl border border-slate-800">
            <button
              onClick={() => setActiveTab('dhcp')}
              type="button"
              className={\`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                activeTab === 'dhcp'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }\`}
            >
              DHCP DORA
            </button>
            <button
              onClick={() => setActiveTab('nat')}
              type="button"
              className={\`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                activeTab === 'nat'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }\`}
            >
              NAT / PAT
            </button>
            <button
              onClick={() => setActiveTab('wireshark')}
              type="button"
              className={\`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer \${
                activeTab === 'wireshark'
                  ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-white'
              }\`}
            >
              Wireshark Захват
            </button>
          </div>
        </div>
      </div>

      {/* Tab 1: DHCP DORA */}
      {activeTab === 'dhcp' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                4 шага DORA (Discover, Offer, Request, Acknowledge)
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {dhcpStages[dhcpStep].name}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setDhcpStep((prev) => Math.max(0, prev - 1))}
                disabled={dhcpStep === 0}
                type="button"
                className="py-2 px-3 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-200 text-xs font-bold"
              >
                Назад
              </button>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-black/40 text-cyan-300">
                {dhcpStep + 1} / 4
              </span>
              <button
                onClick={() => setDhcpStep((prev) => Math.min(3, prev + 1))}
                disabled={dhcpStep === 3}
                type="button"
                className="py-2 px-3 rounded-lg bg-cyan-500 disabled:opacity-40 text-slate-950 text-xs font-bold"
              >
                Далее
              </button>
              <button
                onClick={() => setDhcpStep(0)}
                type="button"
                className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DORA 4 steps tabs */}
          <div className="grid grid-cols-4 gap-2">
            {dhcpStages.map((st, idx) => (
              <button
                key={idx}
                onClick={() => setDhcpStep(idx)}
                type="button"
                className={\`p-3 rounded-xl text-center border transition-all cursor-pointer \${
                  dhcpStep === idx
                    ? 'bg-cyan-950/70 border-cyan-400 text-cyan-300 font-bold'
                    : 'bg-slate-900/50 border-slate-800 text-slate-400'
                }\`}
              >
                <div className="text-[10px] font-mono">Шаг {idx + 1}</div>
                <div className="text-xs truncate">{st.name}</div>
              </button>
            ))}
          </div>

          {/* Interactive details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-2xl bg-[#060f1b] border border-cyan-500/30 space-y-3 font-mono text-xs">
              <div className="text-xs uppercase font-bold text-cyan-400">Параметры UDP / IP пакета</div>
              <div className="space-y-1.5 text-slate-300">
                <div><span className="text-slate-500">Направление:</span> {dhcpStages[dhcpStep].direction}</div>
                <div><span className="text-slate-500">Source IP:</span> {dhcpStages[dhcpStep].srcIp}</div>
                <div><span className="text-slate-500">Dest IP:</span> {dhcpStages[dhcpStep].dstIp}</div>
                <div><span className="text-slate-500">Порты:</span> {dhcpStages[dhcpStep].srcPort} → {dhcpStages[dhcpStep].dstPort}</div>
                <div><span className="text-slate-500">Флаги:</span> {dhcpStages[dhcpStep].flags}</div>
              </div>
            </div>

            <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
              <div className="text-xs uppercase font-bold text-slate-400">Что происходит:</div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {dhcpStages[dhcpStep].desc}
              </p>
              <div className="mt-3 p-3 rounded-xl bg-cyan-950/40 border border-cyan-500/30 text-[11px] text-cyan-300">
                <strong>Важно для экзамена:</strong> Клиент до получения адреса отправляет запросы с порта UDP 68 на порт UDP 67 сервера!
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: NAT / PAT */}
      {activeTab === 'nat' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
                Трансляция сетевых адресов и портов (PAT / NAPT)
              </span>
              <h3 className="text-xl font-bold text-white mt-1">
                {natStages[natStep].step}
              </h3>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setNatStep((prev) => Math.max(0, prev - 1))}
                disabled={natStep === 0}
                type="button"
                className="py-2 px-3 rounded-lg bg-slate-800 disabled:opacity-40 text-slate-200 text-xs font-bold"
              >
                Назад
              </button>
              <span className="font-mono text-xs px-2.5 py-1 rounded bg-black/40 text-cyan-300">
                {natStep + 1} / 4
              </span>
              <button
                onClick={() => setNatStep((prev) => Math.min(3, prev + 1))}
                disabled={natStep === 3}
                type="button"
                className="py-2 px-3 rounded-lg bg-cyan-500 disabled:opacity-40 text-slate-950 text-xs font-bold"
              >
                Далее
              </button>
            </div>
          </div>

          {/* Translation table simulation */}
          <div className="p-4 rounded-2xl bg-[#060f1b] border border-cyan-500/30 font-mono text-xs overflow-x-auto">
            <div className="text-cyan-400 font-bold uppercase text-[11px] mb-2">
              Таблица трансляций NAT на маршрутизаторе (show ip nat translations)
            </div>
            <table className="w-full text-left">
              <thead className="text-slate-500 uppercase text-[10px]">
                <tr>
                  <th className="p-2">Протокол</th>
                  <th className="p-2">Inside Local (LAN)</th>
                  <th className="p-2">Inside Global (WAN IP+Port)</th>
                  <th className="p-2">Outside Global (Сервер)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                <tr className="bg-cyan-950/30">
                  <td className="p-2 text-cyan-300 font-bold">tcp</td>
                  <td className="p-2">192.168.1.50:54210</td>
                  <td className="p-2 text-amber-300 font-bold">203.0.113.5:40001</td>
                  <td className="p-2">93.184.216.34:80</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-2">
            <div className="text-xs uppercase font-bold text-slate-400">Пояснение этапа:</div>
            <p className="text-xs text-slate-300 leading-relaxed">
              {natStages[natStep].desc}
            </p>
          </div>
        </div>
      )}

      {/* Tab 3: Wireshark Frame Analyzer */}
      {activeTab === 'wireshark' && (
        <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl space-y-6">
          <div>
            <span className="text-xs font-mono font-bold text-cyan-400 uppercase">
              Инспектор сетевых пакетов (Wireshark Capture)
            </span>
            <h3 className="text-xl font-bold text-white mt-1">
              Разбор TCP 3-Way Handshake и HTTP запроса
            </h3>
          </div>

          {/* Packet List table */}
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#060f1b]">
            <table className="w-full text-left font-mono text-xs">
              <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px]">
                <tr>
                  <th className="p-2.5">No.</th>
                  <th className="p-2.5">Time</th>
                  <th className="p-2.5">Source</th>
                  <th className="p-2.5">Destination</th>
                  <th className="p-2.5">Protocol</th>
                  <th className="p-2.5">Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {wiresharkPackets.map((pkt, idx) => (
                  <tr
                    key={pkt.no}
                    onClick={() => setSelectedPacket(idx)}
                    className={\`cursor-pointer transition-colors \${
                      selectedPacket === idx
                        ? 'bg-cyan-950/80 text-cyan-300 font-bold'
                        : 'hover:bg-slate-900/40 text-slate-300'
                    }\`}
                  >
                    <td className="p-2.5">{pkt.no}</td>
                    <td className="p-2.5">{pkt.time}</td>
                    <td className="p-2.5">{pkt.src}</td>
                    <td className="p-2.5">{pkt.dst}</td>
                    <td className="p-2.5 text-cyan-400 font-bold">{pkt.proto}</td>
                    <td className="p-2.5 truncate max-w-xs">{pkt.info}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Packet Tree Inspector */}
          <div className="p-5 rounded-2xl bg-[#091725] border border-cyan-500/30 space-y-3 font-mono text-xs">
            <div className="text-xs font-bold text-cyan-400 uppercase">
              Инспекция уровней пакета #{wiresharkPackets[selectedPacket].no}:
            </div>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-blue-400 font-bold block mb-1">
                  ▸ Ethernet II (Frame L2)
                </span>
                <span className="text-slate-300">
                  {wiresharkPackets[selectedPacket].details.ethernet}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-purple-400 font-bold block mb-1">
                  ▸ Internet Protocol Version 4 (Packet L3)
                </span>
                <span className="text-slate-300">
                  {wiresharkPackets[selectedPacket].details.ip}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800">
                <span className="text-emerald-400 font-bold block mb-1">
                  ▸ Transmission Control Protocol (Segment L4)
                </span>
                <span className="text-slate-300">
                  {wiresharkPackets[selectedPacket].details.tcp}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`,lt=`import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Question } from '../types/quiz';
import { ALL_QUESTIONS, resolveImageUrl } from '../data/questionsData';
import { getQuestionDeepDive, QuestionDeepDive } from '../data/questionExplanations';
import {
  BookOpen,
  Search,
  Filter,
  Layers,
  Sparkles,
  ArrowRight,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  Hash,
  Terminal,
  Activity,
  Cpu,
  Globe,
  Repeat,
  Shield,
  HelpCircle,
  BookmarkCheck,
  Zap,
} from 'lucide-react';

interface TheoryViewProps {
  initialQuestionId?: string | null;
  onNavigateToIpv4: (prefix?: number, mode?: 'calc' | 'trainer') => void;
  onClearInitialQuestion?: () => void;
}

type TheorySection = 'questions' | 'handbook' | 'ports' | 'subnet-table';

export const TheoryView: React.FC<TheoryViewProps> = ({
  initialQuestionId,
  onNavigateToIpv4,
  onClearInitialQuestion,
}) => {
  const [activeSection, setActiveSection] = useState<TheorySection>('questions');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [ipv4Only, setIpv4Only] = useState<boolean>(false);
  const [expandedQuestions, setExpandedQuestions] = useState<Record<string, boolean>>({});
  const [lastMistakeIds, setLastMistakeIds] = useState<string[]>([]);
  const targetCardRef = useRef<HTMLDivElement | null>(null);

  // Load last mistakes from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem('osi_last_mistakes');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setLastMistakeIds(parsed);
        }
      }
    } catch {
      // safe fallback
    }
  }, []);

  // When initialQuestionId is provided from mistakes review
  useEffect(() => {
    if (initialQuestionId) {
      setActiveSection('questions');
      setSelectedCategory('all');
      setSearchQuery('');
      setExpandedQuestions((prev) => ({
        ...prev,
        [initialQuestionId]: true,
      }));

      // Smooth scroll to the question card
      setTimeout(() => {
        if (targetCardRef.current) {
          targetCardRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 150);
    }
  }, [initialQuestionId]);

  const toggleExpand = (id: string) => {
    setExpandedQuestions((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const expandAll = () => {
    const allIds: Record<string, boolean> = {};
    filteredQuestions.slice(0, 50).forEach((q) => {
      allIds[q.id] = true;
    });
    setExpandedQuestions(allIds);
  };

  const collapseAll = () => {
    setExpandedQuestions({});
  };

  // Filter questions
  const filteredQuestions = useMemo(() => {
    return ALL_QUESTIONS.filter((q) => {
      // Mistake filter
      if (selectedCategory === 'mistakes') {
        if (!lastMistakeIds.includes(q.id)) return false;
      } else if (selectedCategory !== 'all') {
        if (selectedCategory === 'l1' && !(q.group === 'l1-l2' && (q.topic.includes('L1') || q.topic.includes('Оптика')))) return false;
        if (selectedCategory === 'l2' && !(q.group === 'l1-l2' && !q.topic.includes('L1') && !q.topic.includes('Оптика'))) return false;
        if (selectedCategory === 'l3' && q.group !== 'l3') return false;
        if (selectedCategory === 'l4' && q.group !== 'l4') return false;
        if (selectedCategory === 'l5-l7' && q.group !== 'l5-l7') return false;
        if (selectedCategory === 'tcpip' && q.group !== 'tcpip') return false;
        if (selectedCategory === 'troubleshooting' && q.group !== 'troubleshooting') return false;
        if (selectedCategory === 'visual' && q.group !== 'visual-l1') return false;
      }

      // IPv4 trainer link only filter
      if (ipv4Only) {
        const deepDive = getQuestionDeepDive(q);
        if (!deepDive.ipv4Practice?.enabled) return false;
      }

      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const inId = q.id.toLowerCase().includes(query);
        const inText = q.text.toLowerCase().includes(query);
        const inTopic = q.topic.toLowerCase().includes(query);
        const inAnswers = q.answers.some((a) => a.toLowerCase().includes(query));
        const inExpl = q.explanation.toLowerCase().includes(query);
        return inId || inText || inTopic || inAnswers || inExpl;
      }

      return true;
    });
  }, [searchQuery, selectedCategory, ipv4Only, lastMistakeIds]);

  return (
    <div className="space-y-6 max-w-5xl mx-auto w-full">
      {/* Hero Header */}
      <div className="p-6 sm:p-8 rounded-3xl glass-panel border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-400/30 text-cyan-300 text-xs font-mono font-bold tracking-wider uppercase">
            <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
            Учебный раздел · Теория и разборы
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
            Теория сетевых моделей и разборы всех 502 вопросов
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
            Качественный разбор вопросов тренажёра: суть концепции, логика работы протокола под капотом,
            разбор типичных ошибок и интерактивная отработка расчетных задач в IPv4-тренажёре.
          </p>

          {/* Quick Stats & Action Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Всего вопросов</span>
              <span className="text-lg font-black text-cyan-400 font-mono">502</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Уровней OSI</span>
              <span className="text-lg font-black text-blue-400 font-mono">7 уровней</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Связка с IPv4</span>
              <span className="text-lg font-black text-emerald-400 font-mono">Тренажёр масок</span>
            </div>

            <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800">
              <span className="text-[10px] text-slate-400 font-mono block">Ошибок в памяти</span>
              <span className="text-lg font-black text-amber-400 font-mono">
                {lastMistakeIds.length} вопр.
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Target Question Highlight Banner if navigated from Mistakes */}
      {initialQuestionId && (
        <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-slate-900 border border-cyan-400/50 shadow-lg shadow-cyan-500/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-400/40 flex items-center justify-center font-mono font-bold text-xs shrink-0">
              #{initialQuestionId}
            </div>
            <div>
              <span className="text-xs font-bold text-white block">
                Фокус на вопросе из вашей работы над ошибками
              </span>
              <span className="text-[11px] text-slate-300">
                Карточка вопроса развернута ниже с подробным разбором сути и ловушек.
              </span>
            </div>
          </div>

          <button
            onClick={() => {
              if (onClearInitialQuestion) onClearInitialQuestion();
              setSearchQuery('');
              setSelectedCategory('all');
            }}
            type="button"
            className="px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer shrink-0 transition-colors self-start sm:self-auto"
          >
            Показать весь каталог вопросов
          </button>
        </div>
      )}

      {/* Main Section Navigation (Questions Catalog vs Course Handbook vs Ports vs Subnet Table) */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/70 border border-slate-800 overflow-x-auto text-xs font-bold">
        <button
          onClick={() => setActiveSection('questions')}
          type="button"
          className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 \${
            activeSection === 'questions'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }\`}
        >
          <Search className="w-4 h-4" />
          <span>Разборы вопросов ({filteredQuestions.length})</span>
        </button>

        <button
          onClick={() => setActiveSection('handbook')}
          type="button"
          className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 \${
            activeSection === 'handbook'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }\`}
        >
          <Layers className="w-4 h-4" />
          <span>7 Уровней OSI и стек TCP/IP</span>
        </button>

        <button
          onClick={() => setActiveSection('ports')}
          type="button"
          className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 \${
            activeSection === 'ports'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }\`}
        >
          <Hash className="w-4 h-4" />
          <span>Таблица портов (Well-Known)</span>
        </button>

        <button
          onClick={() => setActiveSection('subnet-table')}
          type="button"
          className={\`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all cursor-pointer shrink-0 \${
            activeSection === 'subnet-table'
              ? 'bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 shadow-md shadow-cyan-500/20'
              : 'text-slate-400 hover:text-white hover:bg-white/5'
          }\`}
        >
          <Zap className="w-4 h-4 text-amber-400" />
          <span>Шпаргалка масок и хостов IPv4</span>
        </button>
      </div>

      {/* SECTION 1: QUESTION DEEP DIVES CATALOG */}
      {activeSection === 'questions' && (
        <div className="space-y-4">
          {/* Search & Filter Toolbar */}
          <div className="p-4 sm:p-5 rounded-2xl glass-panel border border-slate-800 space-y-3">
            {/* Search Input */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Поиск по номеру (#l3-08), тексту вопроса, термину (ARP, TTL, SYN, /26)..."
                className="w-full pl-10 pr-10 py-3 rounded-xl bg-slate-900/90 border border-slate-700/80 text-white placeholder-slate-500 text-xs sm:text-sm focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all font-mono"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  type="button"
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                onClick={() => setSelectedCategory('all')}
                type="button"
                className={\`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer \${
                  selectedCategory === 'all'
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }\`}
              >
                Все темы
              </button>

              {lastMistakeIds.length > 0 && (
                <button
                  onClick={() => setSelectedCategory('mistakes')}
                  type="button"
                  className={\`px-3 py-1.5 rounded-xl font-bold transition-all cursor-pointer flex items-center gap-1.5 \${
                    selectedCategory === 'mistakes'
                      ? 'bg-rose-500 text-slate-950 font-black'
                      : 'bg-rose-950/40 text-rose-300 border border-rose-500/40 hover:bg-rose-900/40'
                  }\`}
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Мои ошибки ({lastMistakeIds.length})</span>
                </button>
              )}

              <button
                onClick={() => setSelectedCategory('l3')}
                type="button"
                className={\`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer \${
                  selectedCategory === 'l3'
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }\`}
              >
                L3 IPv4 & Маски
              </button>

              <button
                onClick={() => setSelectedCategory('l4')}
                type="button"
                className={\`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer \${
                  selectedCategory === 'l4'
                    ? 'bg-blue-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }\`}
              >
                L4 TCP & UDP
              </button>

              <button
                onClick={() => setSelectedCategory('l2')}
                type="button"
                className={\`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer \${
                  selectedCategory === 'l2'
                    ? 'bg-emerald-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }\`}
              >
                L2 Ethernet & VLAN
              </button>

              <button
                onClick={() => setSelectedCategory('l1')}
                type="button"
                className={\`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer \${
                  selectedCategory === 'l1'
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }\`}
              >
                L1 Физика & Оптика
              </button>

              <button
                onClick={() => setSelectedCategory('l5-l7')}
                type="button"
                className={\`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer \${
                  selectedCategory === 'l5-l7'
                    ? 'bg-pink-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }\`}
              >
                L5–L7 DNS, DHCP, HTTP
              </button>

              <button
                onClick={() => setSelectedCategory('troubleshooting')}
                type="button"
                className={\`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer \${
                  selectedCategory === 'troubleshooting'
                    ? 'bg-lime-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }\`}
              >
                Диагностика & CLI
              </button>

              <button
                onClick={() => setSelectedCategory('visual')}
                type="button"
                className={\`px-3 py-1.5 rounded-xl font-semibold transition-all cursor-pointer \${
                  selectedCategory === 'visual'
                    ? 'bg-indigo-500 text-slate-950 font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                }\`}
              >
                Фото оборудования (L1)
              </button>
            </div>

            {/* Subnet Practice toggle & Expand controls */}
            <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
              <label className="flex items-center gap-2 cursor-pointer select-none text-slate-300">
                <input
                  type="checkbox"
                  checked={ipv4Only}
                  onChange={(e) => setIpv4Only(e.target.checked)}
                  className="w-4 h-4 rounded text-cyan-500 bg-slate-900 border-slate-700 focus:ring-0 cursor-pointer"
                />
                <span className="font-semibold text-cyan-300">
                  ⚡ Только с переходом в IPv4-тренажёр (расчет масок/хостов)
                </span>
              </label>

              <div className="flex items-center gap-3 text-slate-400 font-mono text-[11px]">
                <button
                  onClick={expandAll}
                  type="button"
                  className="hover:text-cyan-400 cursor-pointer transition-colors"
                >
                  Развернуть первые 50
                </button>
                <span>•</span>
                <button
                  onClick={collapseAll}
                  type="button"
                  className="hover:text-cyan-400 cursor-pointer transition-colors"
                >
                  Свернуть все
                </button>
              </div>
            </div>
          </div>

          {/* Questions List */}
          {filteredQuestions.length === 0 ? (
            <div className="p-12 text-center rounded-3xl glass-panel border border-slate-800 space-y-3">
              <HelpCircle className="w-12 h-12 text-slate-500 mx-auto" />
              <h3 className="text-base font-bold text-white">Ничего не найдено</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">
                Попробуйте изменить поисковый запрос или сбросить фильтры категорий.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                  setIpv4Only(false);
                }}
                type="button"
                className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer hover:brightness-110"
              >
                Сбросить фильтры
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.slice(0, 100).map((q) => {
                const isExpanded = !!expandedQuestions[q.id];
                const isTarget = q.id === initialQuestionId;
                const isMistake = lastMistakeIds.includes(q.id);
                const deepDive = getQuestionDeepDive(q);

                return (
                  <div
                    key={q.id}
                    ref={isTarget ? targetCardRef : undefined}
                    className={\`rounded-2xl transition-all duration-300 border overflow-hidden \${
                      isTarget
                        ? 'bg-slate-900/90 border-cyan-400 ring-2 ring-cyan-400/50 shadow-2xl shadow-cyan-500/20'
                        : isMistake
                        ? 'bg-slate-900/60 border-rose-500/30 hover:border-rose-400/50'
                        : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                    }\`}
                  >
                    {/* Header Row */}
                    <div
                      onClick={() => toggleExpand(q.id)}
                      className="p-4 sm:p-5 flex items-start justify-between gap-3 cursor-pointer select-none"
                    >
                      <div className="space-y-2 flex-1 min-w-0">
                        {/* Badges */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-black/60 text-cyan-300 border border-cyan-500/30">
                            #{q.id}
                          </span>

                          <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {q.topic}
                          </span>

                          {isMistake && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/40 flex items-center gap-1 font-mono">
                              <AlertTriangle className="w-3 h-3" />
                              Ошибка в тесте
                            </span>
                          )}

                          {deepDive.ipv4Practice?.enabled && (
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 flex items-center gap-1 font-mono">
                              <Zap className="w-3 h-3 text-cyan-400" />
                              IPv4-тренажёр (/{deepDive.ipv4Practice.targetPrefix})
                            </span>
                          )}
                        </div>

                        {/* Question Text */}
                        <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
                          {q.text}
                        </h3>

                        {/* Quick preview if collapsed */}
                        {!isExpanded && (
                          <p className="text-xs text-slate-400 line-clamp-1">
                            🎯 {deepDive.coreConcept}
                          </p>
                        )}
                      </div>

                      <button
                        type="button"
                        className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/80 transition-colors shrink-0 mt-1"
                        aria-label={isExpanded ? 'Свернуть' : 'Развернуть'}
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>

                    {/* Expanded Detail Body */}
                    {isExpanded && (
                      <div className="px-4 sm:px-6 pb-6 pt-2 border-t border-slate-800/80 space-y-5 animate-fade-in">
                        {/* Equipment Photo if present */}
                        {q.image && (
                          <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/80 p-2 max-w-lg mx-auto">
                            <img
                              src={resolveImageUrl(q.image)}
                              alt={q.imageAlt || 'Фото оборудования'}
                              className="max-h-72 w-full object-contain rounded-lg"
                              loading="lazy"
                            />
                            {q.imageAlt && (
                              <p className="text-[11px] text-slate-400 text-center mt-1 font-mono">
                                {q.imageAlt}
                              </p>
                            )}
                          </div>
                        )}

                        {/* Answer Options Overview */}
                        <div className="space-y-1.5">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                            Варианты ответов:
                          </span>
                          <div className="grid grid-cols-1 gap-1.5">
                            {q.answers.map((ans, aIdx) => {
                              const isCorrect = q.correct.includes(aIdx);
                              return (
                                <div
                                  key={aIdx}
                                  className={\`p-2.5 rounded-xl border text-xs flex items-center justify-between gap-3 \${
                                    isCorrect
                                      ? 'bg-emerald-950/40 border-emerald-500/60 text-emerald-200 font-semibold'
                                      : 'bg-slate-900/60 border-slate-800 text-slate-400'
                                  }\`}
                                >
                                  <div className="flex items-center gap-2">
                                    <span
                                      className={\`w-5 h-5 rounded flex items-center justify-center font-mono font-bold text-[10px] shrink-0 \${
                                        isCorrect
                                          ? 'bg-emerald-500 text-slate-950'
                                          : 'bg-slate-800 text-slate-400'
                                      }\`}
                                    >
                                      {String.fromCharCode(65 + aIdx)}
                                    </span>
                                    <span>{ans}</span>
                                  </div>
                                  {isCorrect && (
                                    <span className="text-[10px] font-mono font-bold text-emerald-400 uppercase shrink-0">
                                      ✓ Правильный ответ
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* Structured Deep Dive Blocks */}
                        <div className="grid grid-cols-1 gap-3.5 pt-1">
                          {/* 1. Core Concept */}
                          <div className="p-4 rounded-xl bg-cyan-950/30 border border-cyan-500/30 space-y-1">
                            <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs font-mono uppercase">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>Суть концепции</span>
                            </div>
                            <p className="text-xs sm:text-sm text-cyan-100 leading-relaxed">
                              {deepDive.coreConcept}
                            </p>
                          </div>

                          {/* 2. Deep Technical Breakdown */}
                          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-slate-300 font-bold text-xs font-mono uppercase">
                              <Layers className="w-3.5 h-3.5 text-blue-400" />
                              <span>Как это устроено под капотом (Технический разбор)</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                              {deepDive.deepAnalysis}
                            </p>
                          </div>

                          {/* 3. Trap & Confusion */}
                          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 space-y-1.5">
                            <div className="flex items-center gap-1.5 text-amber-300 font-bold text-xs font-mono uppercase">
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Типичная ловушка (Где чаще всего ошибаются)</span>
                            </div>
                            <p className="text-xs sm:text-sm text-amber-200/90 leading-relaxed">
                              {deepDive.commonTrap}
                            </p>
                          </div>

                          {/* 4. Mnemonic / Practical Tip */}
                          {deepDive.practicalTip && (
                            <div className="p-4 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-1.5">
                              <div className="flex items-center gap-1.5 text-emerald-300 font-bold text-xs font-mono uppercase">
                                <Lightbulb className="w-3.5 h-3.5" />
                                <span>Шпаргалка / Практический совет</span>
                              </div>
                              <p className="text-xs sm:text-sm text-emerald-200/90 leading-relaxed font-mono">
                                {deepDive.practicalTip}
                              </p>
                            </div>
                          )}

                          {/* 5. ASCII Diagram / Header Schema (if present) */}
                          {deepDive.visualDiagram && (
                            <div className="p-4 rounded-xl bg-black/70 border border-slate-800 space-y-1.5">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-mono block">
                                Структура / Схема передачи:
                              </span>
                              <pre className="text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre p-2 bg-slate-950 rounded-lg border border-slate-800/80 leading-relaxed">
                                {deepDive.visualDiagram}
                              </pre>
                            </div>
                          )}
                        </div>

                        {/* SELECTIVE LINK TO IPv4 TRAINER (Only when calculating masks/subnets adds practical value!) */}
                        {deepDive.ipv4Practice?.enabled && (
                          <div className="p-4 rounded-2xl bg-gradient-to-r from-cyan-950/80 to-blue-950/80 border border-cyan-400/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-lg shadow-cyan-500/10">
                            <div className="space-y-0.5">
                              <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs font-mono">
                                <Zap className="w-4 h-4 text-cyan-400" />
                                <span>Практика расчёта в IPv4-тренажёре</span>
                              </div>
                              <p className="text-xs text-slate-300 max-w-xl">
                                {deepDive.ipv4Practice.reason}
                              </p>
                            </div>

                            <button
                              onClick={() => {
                                onNavigateToIpv4(
                                  deepDive.ipv4Practice?.targetPrefix,
                                  deepDive.ipv4Practice?.targetMode
                                );
                              }}
                              type="button"
                              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-95 transition-all flex items-center gap-2 cursor-pointer shrink-0 shadow-md shadow-cyan-500/20"
                            >
                              <span>Отработать маску /{deepDive.ipv4Practice.targetPrefix}</span>
                              <ArrowRight className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}

              {filteredQuestions.length > 100 && (
                <div className="p-4 text-center text-xs text-slate-400 font-mono">
                  Показано 100 из {filteredQuestions.length} вопросов. Уточните поиск для нахождения конкретной темы.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* SECTION 2: 7 LAYERS OF OSI & TCP/IP ARCHITECTURE */}
      {activeSection === 'handbook' && (
        <div className="space-y-6">
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" />
              <span>7 Уровней модели OSI и соответствие со стеком TCP/IP</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Модель OSI (Open Systems Interconnection) состоит из 7 логических уровней. В реальном
              Интернете используется стек протоколов TCP/IP, где уровни 5, 6 и 7 объединены в единый
              Прикладной уровень (Application Layer).
            </p>

            {/* Visual Architecture Comparison Table */}
            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400 uppercase text-[11px]">
                    <th className="p-3">Уровень OSI</th>
                    <th className="p-3">Стек TCP/IP</th>
                    <th className="p-3">PDU (Данные)</th>
                    <th className="p-3">Адресация</th>
                    <th className="p-3">Ключевые протоколы</th>
                    <th className="p-3">Оборудование</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-sans">
                  <tr className="bg-pink-950/20 hover:bg-pink-950/30">
                    <td className="p-3 font-bold text-pink-300">L7 Прикладной</td>
                    <td className="p-3 font-semibold text-white" rowSpan={3}>
                      Прикладной (Application)
                    </td>
                    <td className="p-3 text-slate-300">Данные (Data)</td>
                    <td className="p-3 font-mono text-slate-400">URL, FQDN</td>
                    <td className="p-3 font-mono text-xs">HTTP, DNS, DHCP, SSH</td>
                    <td className="p-3 text-slate-400">WAF, L7-балансировщик</td>
                  </tr>
                  <tr className="bg-purple-950/20 hover:bg-purple-950/30">
                    <td className="p-3 font-bold text-purple-300">L6 Представительский</td>
                    <td className="p-3 text-slate-300">Данные (Data)</td>
                    <td className="p-3 font-mono text-slate-400">MIME, TLS-ID</td>
                    <td className="p-3 font-mono text-xs">TLS/SSL, JSON, GZIP</td>
                    <td className="p-3 text-slate-400">TLS Termination шлюз</td>
                  </tr>
                  <tr className="bg-indigo-950/20 hover:bg-indigo-950/30">
                    <td className="p-3 font-bold text-indigo-300">L5 Сеансовый</td>
                    <td className="p-3 text-slate-300">Данные (Data)</td>
                    <td className="p-3 font-mono text-slate-400">Session ID</td>
                    <td className="p-3 font-mono text-xs">RPC, NetBIOS, SOCKS5</td>
                    <td className="p-3 text-slate-400">Сеансовый прокси</td>
                  </tr>
                  <tr className="bg-blue-950/20 hover:bg-blue-950/30">
                    <td className="p-3 font-bold text-blue-300">L4 Транспортный</td>
                    <td className="p-3 font-semibold text-white">Транспортный</td>
                    <td className="p-3 text-cyan-300 font-semibold">Сегмент (TCP) / Датаграмма (UDP)</td>
                    <td className="p-3 font-mono text-cyan-300">Порты (0-65535)</td>
                    <td className="p-3 font-mono text-xs">TCP, UDP, QUIC, SCTP</td>
                    <td className="p-3 text-slate-400">L4 балансировщик, Firewall</td>
                  </tr>
                  <tr className="bg-cyan-950/20 hover:bg-cyan-950/30">
                    <td className="p-3 font-bold text-cyan-300">L3 Сетевой</td>
                    <td className="p-3 font-semibold text-white">Межсетевой (Internet)</td>
                    <td className="p-3 text-cyan-300 font-semibold">Пакет (Packet)</td>
                    <td className="p-3 font-mono text-cyan-300">IPv4, IPv6</td>
                    <td className="p-3 font-mono text-xs">IPv4, IPv6, ICMP, OSPF, BGP</td>
                    <td className="p-3 text-slate-400">Маршрутизатор, L3-Switch</td>
                  </tr>
                  <tr className="bg-emerald-950/20 hover:bg-emerald-950/30">
                    <td className="p-3 font-bold text-emerald-300">L2 Канальный</td>
                    <td className="p-3 font-semibold text-white" rowSpan={2}>
                      Сетевой доступ (Network Access)
                    </td>
                    <td className="p-3 text-emerald-300 font-semibold">Кадр (Frame)</td>
                    <td className="p-3 font-mono text-emerald-300">MAC (48 бит)</td>
                    <td className="p-3 font-mono text-xs">Ethernet, 802.1Q VLAN, ARP</td>
                    <td className="p-3 text-slate-400">L2 Коммутатор (Switch), Мост</td>
                  </tr>
                  <tr className="bg-amber-950/20 hover:bg-amber-950/30">
                    <td className="p-3 font-bold text-amber-300">L1 Физический</td>
                    <td className="p-3 text-amber-300 font-semibold">Биты (Bits)</td>
                    <td className="p-3 font-mono text-slate-400">Сигналы, частоты</td>
                    <td className="p-3 font-mono text-xs">1000BASE-T, 10GBASE-LR</td>
                    <td className="p-3 text-slate-400">Хаб (Hub), Повторитель, SFP</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Encapsulation Diagram */}
            <div className="p-5 rounded-2xl bg-black/60 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Процесс инкапсуляции при отправке пакета</span>
              </h3>
              <p className="text-xs text-slate-300">
                При отправке данных каждый уровень добавляет свой служебный заголовок (Header), а канальный
                уровень L2 добавляет также завершающий трейлер с контрольной суммой (FCS CRC-32).
              </p>
              <pre className="text-[11px] font-mono text-cyan-300 overflow-x-auto whitespace-pre p-3 bg-slate-950 rounded-xl border border-slate-800 leading-relaxed">
{\`[L7 Данные приложения: HTTP GET /index.html]
                  ↓
[L4 TCP Заголовок: Src Port=51234, Dst Port=80, Seq, Ack] + [L7 Данные] = СЕГМЕНТ
                  ↓
[L3 IP Заголовок: Src IP=192.168.1.10, Dst IP=93.184.216.34, TTL=64] + [L4+L7] = ПАКЕТ
                  ↓
[L2 MAC Заголовок: Src MAC, Dst MAC, EtherType=0x0800] + [L3+L4+L7] + [FCS CRC-32] = КАДР
                  ↓
[L1 Физический: Модуляция сигналов в витой паре или лазерных импульсов в оптоволокне] = БИТЫ\`}
              </pre>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: WELL-KNOWN PORTS REFERENCE */}
      {activeSection === 'ports' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Hash className="w-5 h-5 text-cyan-400" />
              <span>Таблица стандартных сетевых портов (Well-Known Ports)</span>
            </h2>
            <p className="text-xs text-slate-300">
              Порты от 0 до 1023 стандартизированы IANA и требуют привилегий суперпользователя. Они
              постоянно встречаются в вопросах экзамена.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {[
                { port: 20, proto: 'TCP', name: 'FTP-Data', desc: 'Передача файлов по FTP' },
                { port: 21, proto: 'TCP', name: 'FTP-Control', desc: 'Управление сессией FTP' },
                { port: 22, proto: 'TCP', name: 'SSH / SFTP', desc: 'Защищенный терминал и передача' },
                { port: 23, proto: 'TCP', name: 'Telnet', desc: 'Незащищенный текстовый терминал' },
                { port: 25, proto: 'TCP', name: 'SMTP', desc: 'Маршрутизация электронной почты' },
                { port: 53, proto: 'UDP/TCP', name: 'DNS', desc: 'Преобразование доменных имен' },
                { port: 67, proto: 'UDP', name: 'DHCP Server', desc: 'Прием запросов клиентов' },
                { port: 68, proto: 'UDP', name: 'DHCP Client', desc: 'Ответ сервера клиенту' },
                { port: 69, proto: 'UDP', name: 'TFTP', desc: 'Простой FTP без авторизации (PXE)' },
                { port: 80, proto: 'TCP', name: 'HTTP', desc: 'Веб-трафик без шифрования' },
                { port: 110, proto: 'TCP', name: 'POP3', desc: 'Получение почты из ящика' },
                { port: 123, proto: 'UDP', name: 'NTP', desc: 'Синхронизация точного времени' },
                { port: 143, proto: 'TCP', name: 'IMAP', desc: 'Синхронизация почтовых папок' },
                { port: 161, proto: 'UDP', name: 'SNMP', desc: 'Мониторинг сетевых устройств' },
                { port: 443, proto: 'TCP/UDP', name: 'HTTPS / QUIC', desc: 'Защищенный веб (TLS / HTTP3)' },
                { port: 514, proto: 'UDP', name: 'Syslog', desc: 'Централизованный сбор журналов' },
                { port: 3389, proto: 'TCP', name: 'RDP', desc: 'Удаленный рабочий стол Windows' },
              ].map((item) => (
                <div
                  key={item.port}
                  className="p-3.5 rounded-2xl bg-slate-900/70 border border-slate-800 space-y-1 hover:border-cyan-500/40 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-sm font-black text-cyan-300">
                      Порт {item.port}
                    </span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-bold">
                      {item.proto}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-white">{item.name}</div>
                  <p className="text-[11px] text-slate-400">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: SUBNET CHEAT SHEET & QUICK MATH */}
      {activeSection === 'subnet-table' && (
        <div className="space-y-4">
          <div className="p-6 rounded-3xl glass-panel border border-cyan-500/20 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <span>Шпаргалка масок, шагов и хостов IPv4</span>
                </h2>
                <p className="text-xs text-slate-300">
                  Мгновенный справочник для решения задач экзамена по CIDR-маскам /24–/32.
                </p>
              </div>

              <button
                onClick={() => onNavigateToIpv4(24, 'calc')}
                type="button"
                className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs flex items-center gap-2 cursor-pointer hover:brightness-110 shrink-0"
              >
                <span>Открыть полный тренажёр</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-slate-800">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 font-mono text-slate-400 uppercase text-[11px]">
                    <th className="p-3">CIDR</th>
                    <th className="p-3">Десятичная маска</th>
                    <th className="p-3">Двоичный 4-й октет</th>
                    <th className="p-3">Шаг сети (Magic)</th>
                    <th className="p-3">Всего IP</th>
                    <th className="p-3">Полезных хостов</th>
                    <th className="p-3">Действие</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                  {[
                    { prefix: 24, mask: '255.255.255.0', bin: '00000000', step: 256, total: 256, hosts: 254 },
                    { prefix: 25, mask: '255.255.255.128', bin: '10000000', step: 128, total: 128, hosts: 126 },
                    { prefix: 26, mask: '255.255.255.192', bin: '11000000', step: 64, total: 64, hosts: 62 },
                    { prefix: 27, mask: '255.255.255.224', bin: '11100000', step: 32, total: 32, hosts: 30 },
                    { prefix: 28, mask: '255.255.255.240', bin: '11110000', step: 16, total: 16, hosts: 14 },
                    { prefix: 29, mask: '255.255.255.248', bin: '11111000', step: 8, total: 8, hosts: 6 },
                    { prefix: 30, mask: '255.255.255.252', bin: '11111100', step: 4, total: 4, hosts: 2 },
                    { prefix: 31, mask: '255.255.255.254', bin: '11111110', step: 2, total: 2, hosts: '2 (RFC 3021)' },
                    { prefix: 32, mask: '255.255.255.255', bin: '11111111', step: 1, total: 1, hosts: '1 (Хост)' },
                  ].map((row) => (
                    <tr key={row.prefix} className="hover:bg-cyan-950/20 transition-colors">
                      <td className="p-3 font-bold text-cyan-300">/{row.prefix}</td>
                      <td className="p-3 text-white">{row.mask}</td>
                      <td className="p-3 text-slate-400">{row.bin}</td>
                      <td className="p-3 text-amber-300 font-bold">{row.step}</td>
                      <td className="p-3 text-slate-300">{row.total}</td>
                      <td className="p-3 text-emerald-300 font-bold">{row.hosts}</td>
                      <td className="p-3">
                        <button
                          onClick={() => onNavigateToIpv4(row.prefix, 'calc')}
                          type="button"
                          className="px-2.5 py-1 rounded-lg bg-cyan-500/20 text-cyan-300 border border-cyan-400/30 hover:bg-cyan-500/30 transition-colors text-[11px] font-sans font-bold cursor-pointer"
                        >
                          Калькулятор →
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
`,ut=`import React, { useState } from 'react';
import {
  Layers,
  ArrowRight,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export const VlanSimulator: React.FC = () => {
  const [sourcePort, setSourcePort] = useState<number>(1);
  const [destPort, setDestPort] = useState<number>(2);
  const [vlanMapping] = useState<{ [port: number]: { vlan: number; name: string; type: 'access' | 'trunk' } }>({
    1: { vlan: 10, name: 'Бухгалтерия (VLAN 10)', type: 'access' },
    2: { vlan: 10, name: 'Финансы (VLAN 10)', type: 'access' },
    3: { vlan: 20, name: 'Инженеры (VLAN 20)', type: 'access' },
    4: { vlan: 20, name: 'Разработка (VLAN 20)', type: 'access' },
    5: { vlan: 99, name: 'Trunk 802.1Q (Все VLAN)', type: 'trunk' },
  });

  const [simulationResult, setSimulationResult] = useState<{
    status: 'delivered' | 'blocked' | 'trunked';
    message: string;
    details: string;
    tagInfo?: string;
  } | null>(null);

  const runSimulation = () => {
    const src = vlanMapping[sourcePort];
    const dst = vlanMapping[destPort];

    if (sourcePort === destPort) {
      setSimulationResult({
        status: 'blocked',
        message: 'Нельзя отправить кадр самому себе в тот же порт.',
        details: 'Коммутатор никогда не пересылает кадр обратно в порт, из которого он был получен (правило Split Horizon).',
      });
      return;
    }

    if (dst.type === 'trunk') {
      setSimulationResult({
        status: 'trunked',
        message: \`Кадр помечен 802.1Q тегом VLAN \${src.vlan} и отправлен в Trunk!\`,
        details: \`Коммутатор добавляет 4-байтный тег IEEE 802.1Q (TPID 0x8100, VID \${src.vlan}) для передачи кадра между коммутаторами без смешивания широковещательных доменов.\`,
        tagInfo: \`IEEE 802.1Q: TPID=0x8100 | PCP=0 | DEI=0 | VID=\${src.vlan}\`,
      });
      return;
    }

    if (src.vlan === dst.vlan) {
      setSimulationResult({
        status: 'delivered',
        message: \`Успех! Кадр доставлен внутри изолированного VLAN \${src.vlan}.\`,
        details: \`Порты \${sourcePort} и \${destPort} находятся в одном широковещательном домене (Broadcast Domain). Коммутатор передаёт untagged кадр без участия маршрутизатора.\`,
      });
    } else {
      setSimulationResult({
        status: 'blocked',
        message: \`Кадр отклонён: разные VLAN (\${src.vlan} ≠ \${dst.vlan})!\`,
        details: \`L2-коммутатор строго изолирует VLAN друг от друга. Прямая передача на уровне L2 невозможна. Для связи между VLAN 10 и VLAN 20 требуется L3-маршрутизатор (Router-on-a-stick или L3-Switch SVI).\`,
      });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl">
        <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
          Интерактивная лаборатория
        </span>
        <h2 className="text-2xl font-black tracking-tight text-white mt-1">
          VLAN & Trunk 802.1Q: Симулятор изоляции портов
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Исследуйте, как коммутатор изолирует широковещательные домены и почему для связи между разными VLAN необходим L3-маршрутизатор
        </p>
      </div>

      {/* Switch Interactive Board */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-6">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Панель портов управляемого коммутатора
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
          {Object.entries(vlanMapping).map(([pStr, info]) => {
            const portNum = Number(pStr);
            const isSource = sourcePort === portNum;
            const isDest = destPort === portNum;

            let badgeColor = 'bg-slate-800 text-slate-300 border-slate-700';
            if (info.vlan === 10) badgeColor = 'bg-cyan-950/60 text-cyan-300 border-cyan-500/50';
            if (info.vlan === 20) badgeColor = 'bg-purple-950/60 text-purple-300 border-purple-500/50';
            if (info.type === 'trunk') badgeColor = 'bg-amber-950/60 text-amber-300 border-amber-500/50';

            return (
              <div
                key={portNum}
                className={\`p-4 rounded-xl border transition-all \${badgeColor} \${
                  isSource ? 'ring-2 ring-cyan-400 shadow-lg' : ''
                } \${isDest ? 'ring-2 ring-blue-400 shadow-lg' : ''}\`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-xs">Порт {portNum}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded uppercase font-bold bg-black/40">
                    {info.type}
                  </span>
                </div>
                <div className="text-xs font-semibold mb-3">{info.name}</div>

                <div className="flex flex-col gap-1.5 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setSourcePort(portNum)}
                    type="button"
                    className={\`py-1.5 px-2 rounded text-[11px] font-bold transition-all min-h-[34px] cursor-pointer \${
                      isSource
                        ? 'bg-cyan-500 text-slate-950'
                        : 'bg-black/30 hover:bg-black/50 text-slate-300'
                    }\`}
                  >
                    {isSource ? '✓ Источник' : 'Как источник'}
                  </button>
                  <button
                    onClick={() => setDestPort(portNum)}
                    type="button"
                    className={\`py-1.5 px-2 rounded text-[11px] font-bold transition-all min-h-[34px] cursor-pointer \${
                      isDest
                        ? 'bg-blue-500 text-slate-950'
                        : 'bg-black/30 hover:bg-black/50 text-slate-300'
                    }\`}
                  >
                    {isDest ? '✓ Получатель' : 'Как получатель'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action button */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <div className="text-xs text-slate-300 font-mono">
            Передача: <span className="text-cyan-400 font-bold">Порт {sourcePort}</span> (VLAN{' '}
            {vlanMapping[sourcePort].vlan}) →{' '}
            <span className="text-blue-400 font-bold">Порт {destPort}</span> (VLAN{' '}
            {vlanMapping[destPort].vlan})
          </div>

          <button
            onClick={runSimulation}
            type="button"
            className="py-3 px-6 rounded-xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-bold text-xs hover:brightness-110 active:scale-[0.99] transition-all flex items-center gap-2 min-h-[48px] shadow-lg shadow-cyan-500/20 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            Проверить передачу кадра
          </button>
        </div>

        {/* Simulation Result */}
        {simulationResult && (
          <div
            className={\`p-5 rounded-xl border animate-fade-in \${
              simulationResult.status === 'delivered'
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
                : simulationResult.status === 'trunked'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-rose-950/40 border-rose-500/50 text-rose-200'
            }\`}
          >
            <div className="flex items-start gap-3">
              {simulationResult.status === 'delivered' ? (
                <ShieldCheck className="w-6 h-6 text-emerald-400 flex-shrink-0 mt-0.5" />
              ) : simulationResult.status === 'trunked' ? (
                <Layers className="w-6 h-6 text-amber-400 flex-shrink-0 mt-0.5" />
              ) : (
                <AlertTriangle className="w-6 h-6 text-rose-400 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 text-xs">
                <div className="font-bold text-sm text-white">{simulationResult.message}</div>
                <div className="text-slate-300 leading-relaxed">{simulationResult.details}</div>
                {simulationResult.tagInfo && (
                  <div className="mt-2 p-2 rounded bg-black/40 font-mono text-cyan-300">
                    {simulationResult.tagInfo}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 802.1Q Tag Anatomy */}
      <div className="p-6 rounded-2xl glass-panel border border-cyan-500/20 shadow-xl space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyan-400">
          Анатомия 4-байтного тега 802.1Q (Trunk)
        </h3>
        <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
            <div className="text-cyan-400 font-bold">TPID (16 бит)</div>
            <div className="text-[11px] text-slate-400">0x8100</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
            <div className="text-purple-400 font-bold">PCP (3 бита)</div>
            <div className="text-[11px] text-slate-400">Приоритет QoS</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
            <div className="text-amber-400 font-bold">DEI (1 бит)</div>
            <div className="text-[11px] text-slate-400">Drop Eligible</div>
          </div>
          <div className="p-3 rounded-lg bg-slate-900 border border-slate-700">
            <div className="text-emerald-400 font-bold">VID (12 бит)</div>
            <div className="text-[11px] text-slate-400">Номер VLAN (1–4094)</div>
          </div>
        </div>
      </div>
    </div>
  );
};
`,dt=`import { Question } from '../types/quiz';

export interface QuestionDeepDive {
  questionId: string;
  category: 'l1' | 'l2' | 'l3' | 'l4' | 'l5_l7' | 'tcpip' | 'cli' | 'visual';
  categoryLabel: string;
  categoryColor: string;
  coreConcept: string;
  deepAnalysis: string;
  commonTrap: string;
  practicalTip?: string;
  memorizationRule?: string;
  visualDiagram?: string;
  ipv4Practice?: {
    enabled: boolean;
    reason: string;
    targetPrefix?: number;
    targetMode?: 'calc' | 'trainer';
  };
  keyTakeaways: string[];
}

// Hand-crafted deep dives for critical architectural questions
const CURATED_DEEP_DIVES: Record<string, Partial<QuestionDeepDive>> = {
  // L1 Physical
  'l1-01': {
    category: 'l1',
    categoryLabel: 'L1 · Физический уровень · PDU',
    categoryColor: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30',
    coreConcept: 'Физический уровень (L1) оперирует исключительно неструктурированным потоком битов (0 и 1) в виде физических сигналов.',
    deepAnalysis: 'Анализатор физического уровня или осциллограф видит лишь уровни напряжения, оптические импульсы или радиочастотные колебания. На L1 нет концепции заголовков, адресов отправителя/получателя или контрольных сумм. Структурирование битов в кадры с преамбулой и MAC-адресами происходит только уровнем выше — на L2 (Data Link).',
    commonTrap: 'Часто путают с кадром (Frame). Кадр появляется только тогда, когда поток битов разбивается на порции с проверкой FCS (Frame Check Sequence) и MAC-адресацией.',
    memorizationRule: 'L1 = Биты (сигналы) → L2 = Кадры (MAC) → L3 = Пакеты (IP) → L4 = Сегменты (TCP) / Датаграммы (UDP) → L7 = Данные.',
    visualDiagram: \`+-------------------------------------------------------+
| Уровень       | PDU (Единица данных) | Адресация       |
+---------------+----------------------+-----------------+
| L4 Транспорт  | Сегмент / Датаграмма | Порты (0-65535) |
| L3 Сетевой    | Пакет (Packet)       | IP-адреса       |
| L2 Канальный  | Кадр (Frame)         | MAC-адреса      |
| L1 Физический | Бит (Bit / Signal)   | Напряжение/Свет |
+-------------------------------------------------------+\`,
    keyTakeaways: [
      'L1 не знает про IP, MAC или протоколы — только импульсы и частоты',
      'Хабы и репитеры работают на L1, поэтому они ретранслируют каждый бит во все порты без разбора',
    ],
  },

  'l1-02': {
    category: 'l1',
    categoryLabel: 'L1 · Устройства физического уровня',
    categoryColor: 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30',
    coreConcept: 'Повторители (Repeaters) и концентраторы (Hubs) работают на L1, так как они просто усиливают электрический/оптический сигнал.',
    deepAnalysis: 'Концентратор (hub) не имеет процессора для парсинга Ethernet-кадров и не содержит памяти для MAC-таблицы (CAM). Получив сигнал на один порт, он физически дублирует его на все остальные порты. Это делает всю сеть единым доменом коллизий (Collision Domain), где одновременная передача двумя узлами приводит к наложению сигналов.',
    commonTrap: 'Путаница между Hub (L1, глупый размножитель сигнала) и Switch (L2, умный коммутатор, разделяющий домены коллизий по MAC-адресам).',
    practicalTip: 'В современных сетях хабы полностью вытеснены L2-коммутаторами. Для зеркалирования трафика вместо хабов используют SPAN/Port Mirroring или сетевые TAP-ответвители.',
    keyTakeaways: [
      'Hub = единый домен коллизий на все порты',
      'Switch = каждый порт является отдельным изолированным доменом коллизий',
    ],
  },

  // L2 Data Link
  'l2-01': {
    category: 'l2',
    categoryLabel: 'L2 · Канальный уровень · PDU',
    categoryColor: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
    coreConcept: 'Единицей данных канального уровня (Data Link Layer) является Кадр (Frame).',
    deepAnalysis: 'Кадр Ethernet обрамляет сетевой пакет IP заголовком (MAC получателя, MAC отправителя, EtherType) и завершающей контрольной суммой FCS (CRC-32). Если контрольная сумма в трейлере не сходится с вычисленной, сетевая карта отбрасывает поврежденный кадр еще до передачи в ОС.',
    commonTrap: 'Смешение терминов «пакет» и «кадр». Пакет — это L3 (IP), а кадр — это L2 (Ethernet/Wi-Fi).',
    visualDiagram: \`+---------------- Ethernet Frame (Кадр L2) ----------------+
| Dst MAC (6B) | Src MAC (6B) | 802.1Q (опц.) | EtherType (2B) |
+-------------------------------------------------------------+
|               PAYLOAD (L3 IP-пакет, 46-1500B)               |
+-------------------------------------------------------------+
|                      FCS / CRC32 (4B)                       |
+-------------------------------------------------------------+\`,
    keyTakeaways: [
      'Минимальный размер кадра Ethernet — 64 байта (с преамбулой 72 байта)',
      'Максимальный размер стандартного payload — 1500 байт (MTU)',
    ],
  },

  'l2-03': {
    category: 'l2',
    categoryLabel: 'L2 · Коммутация и CAM-таблица',
    categoryColor: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
    coreConcept: 'Коммутатор изучает MAC-адреса исключительно по полю Source MAC входящих кадров.',
    deepAnalysis: 'Когда кадр приходит на порт коммутатора, микросхема ASIC смотрит на Source MAC и связывает его с этим входящим портом в CAM-таблице (Content Addressable Memory). Затем коммутатор смотрит на Destination MAC: если он известен в таблице — кадр отправляется строго в нужный порт (Unicast). Если неизвестен — выполняется Unknown Unicast Flooding (рассылка во все порты, кроме входящего).',
    commonTrap: 'Ошибочно полагать, что коммутатор изучает адреса по Destination MAC. Destination MAC используется только для принятия решения о пересылке (Forwarding), а не для обучения.',
    practicalTip: 'В CLI Cisco/Linux используйте \`show mac address-table\` или \`bridge fdb show\` для просмотра изученных пар порт-MAC.',
    keyTakeaways: [
      'Обучение: по адресу отправителя (Source MAC)',
      'Пересылка: по адресу получателя (Destination MAC)',
    ],
  },

  'l2-07': {
    category: 'l2',
    categoryLabel: 'L2 · Виртуальные сети VLAN (802.1Q)',
    categoryColor: 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30',
    coreConcept: 'VLAN делит один физический коммутатор на изолированные широковещательные домены на канальном уровне.',
    deepAnalysis: 'Без маршрутизатора (или L3-коммутатора) хосты в разных VLAN не могут общаться, даже если у них адреса из одной подсети. Стандарт IEEE 802.1Q добавляет в заголовок кадра 4-байтный тег: 2 байта TPID (0x8100) и 2 байта TCI (3 бита приоритета PCP, 1 бит DEI и 12 бит VLAN ID, что дает от 1 до 4094 доступных VLAN).',
    commonTrap: 'Полагать, что VLAN работает на L3. VLAN — это чистый L2 механизм сегментации трафика и разграничения broadcast-доменов.',
    visualDiagram: \`802.1Q Tag (4 байта):
[ TPID: 0x8100 (16 бит) ] 
[ PCP: Priority (3b) | DEI: Drop (1b) | VID: VLAN ID (12 бит, 1-4094) ]\`,
    keyTakeaways: [
      'Access-порт: передает нетегированные кадры конечному хосту',
      'Trunk-порт: передает кадры нескольких VLAN с 802.1Q тегами между свитчами',
    ],
  },

  // L3 Network
  'l3-01': {
    category: 'l3',
    categoryLabel: 'L3 · Сетевой уровень · TTL и ICMP',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'При получении пакета с TTL=1 маршрутизатор уменьшает его до 0, уничтожает пакет и отправляет источнику ICMP Time Exceeded (Type 11).',
    deepAnalysis: 'Поле TTL (Time to Live) размером 8 бит предотвращает бесконечное блуждание пакетов по сети при петлях маршрутизации. Каждый транзитный маршрутизатор обязан уменьшить TTL минимум на 1 (декремент). Если TTL становится равным 0, пакет дальше не передается. На этом же механизме построена работа утилиты \`traceroute\`, которая отправляет пакеты с TTL=1, 2, 3...',
    commonTrap: 'Думать, что пакет дойдет до получателя, если у него TTL=1. Маршрутизатор декрементирует TTL ДО пересылки в следующий интерфейс!',
    practicalTip: 'Если пинг возвращает «Time to live exceeded», проверьте таблицу маршрутизации на наличие взаимной петли между соседними узлами.',
    memorizationRule: 'TTL декрементируется роутером. TTL=0 → DROP + ICMP Type 11 (Time Exceeded).',
    keyTakeaways: [
      'Предотвращает зацикливание пакетов в топологии',
      'Основа алгоритма работы traceroute / mtr',
    ],
  },

  'l3-02': {
    category: 'l3',
    categoryLabel: 'L3 · Заголовок IPv4 · Поле Protocol',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'В заголовке IPv4 номер протокола указывает, какому протоколу L4 передать полезную нагрузку: 1 = ICMP, 6 = TCP, 17 = UDP, 89 = OSPF.',
    deepAnalysis: 'Поле Protocol (8 бит) в заголовке IPv4 необходимо стеку TCP/IP на принимающем хосте для демультиплексирования. Увидев число 6, ядро ОС отдает данные модулю TCP; увидев 17 — модулю UDP; увидев 1 — модулю ICMP.',
    commonTrap: 'Путать номер протокола в IP-заголовке (Protocol Number) и номера портов TCP/UDP (Port Numbers). Номер протокола — это поле IP (L3), а порты живут внутри заголовков L4.',
    memorizationRule: 'ICMP = 1 | TCP = 6 | UDP = 17 | GRE = 47 | ESP = 50 | OSPF = 89.',
    keyTakeaways: [
      'TCP = 6',
      'UDP = 17',
      'ICMP = 1',
    ],
  },

  'l3-04': {
    category: 'l3',
    categoryLabel: 'L3 · Маршрутизация · Маршрут по умолчанию',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Маршрут 0.0.0.0/0 (Default Gateway / Шлюз последней надежды) совпадает с любым IPv4-адресом и используется, если более точного маршрута нет.',
    deepAnalysis: 'Префикс /0 означает, что для совпадения проверяется 0 бит IP-адреса, то есть любой возможный адрес назначения подойдет. Согласно правилу Longest Prefix Match, маршрутизатор сначала ищет более длинные префиксы (/32 хостовой, /24 подсеть, /16 агрегат). Если совпадений нет — пакет уходит на шлюз 0.0.0.0/0.',
    commonTrap: 'Считать 0.0.0.0/0 широковещательным адресом. 0.0.0.0/0 — это обозначение "любой сети" в правилах маршрутизации и фаерволах.',
    practicalTip: 'В Linux проверяется командой \`ip route show\` (строка начинается со слова \`default via ...\`).',
    keyTakeaways: [
      'Шлюз по умолчанию имеет наименьший приоритет длины маски (/0)',
      'Если нет шлюза по умолчанию и нет точного маршрута, роутер шлет ICMP Destination Net Unreachable',
    ],
  },

  'l3-05': {
    category: 'l3',
    categoryLabel: 'L3 · Маршрутизация · Longest Prefix Match',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Маршрутизатор ВСЕГДА выбирает маршрут с наиболее длинной маской (наиболее специфичный префикс).',
    deepAnalysis: 'Если в таблице маршрутизации для адреса 10.0.5.20 есть варианты 10.0.0.0/16 via A и 10.0.5.0/24 via B, пакет пойдет через B, потому что маска /24 длиннее (24 совпадающих бита против 16). Метрика и административная дистанция учитываются только между маршрутами с ОДИНАКОВОЙ длиной префикса!',
    commonTrap: 'Ошибочно смотреть на метрику до длины маски. Длина маски превалирует над метрикой.',
    memorizationRule: 'Longest Prefix Match (наибольшее число бит маски) всегда побеждает.',
    keyTakeaways: [
      '/32 (хост) бьет /24 (подсеть), /24 бьет /16, /16 бьет default /0',
      'Специфичность — главный критерий выбора маршрута в FIB',
    ],
  },

  // Subnet Calculation Questions - LINKED TO IPv4 TRAINER!
  'l3-06': {
    category: 'l3',
    categoryLabel: 'L3 · Маски подсети IPv4',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Маска /24 содержит 24 единичных бита подряд, что соответствует десятичному виду 255.255.255.0.',
    deepAnalysis: 'IPv4-адрес состоит из 32 бит. Первые 24 бита отданы под адрес сети (3 октета по 8 единиц: 11111111.11111111.11111111.00000000), а последние 8 бит — под адреса хостов ($2^8 = 256$ адресов всего, 254 доступно для назначения хостам).',
    commonTrap: 'Путать количество хостов (254) и общее число адресов с учетом сети и broadcast (256).',
    ipv4Practice: {
      enabled: true,
      reason: 'Маска /24 — базовый стандарт. Попробуйте рассчитать диапазон хостов и маску в тренажёре.',
      targetPrefix: 24,
      targetMode: 'calc',
    },
    keyTakeaways: [
      '/24 = 255.255.255.0',
      'Всего адресов: 256, доступных хостов: 254',
    ],
  },

  'l3-07': {
    category: 'l3',
    categoryLabel: 'L3 · Двоичный расчет октетов маски',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Октет 11111100 в двоичной системе равен 252 в десятичной (128 + 64 + 32 + 16 + 8 + 4 = 252).',
    deepAnalysis: 'Позиционные веса 8 бит октета: 128, 64, 32, 16, 8, 4, 2, 1. Для 11111100 сложим первые 6 степеней двойки: $255 - 2 - 1 = 252$. Это соответствует маске /30 (24 + 6 = 30 бит). Шаг такой подсети равен $256 - 252 = 4$ адреса.',
    commonTrap: 'Арифметическая ошибка при сложении степеней двойки. Проще вычитать нулевые биты: $255 - (2 + 1) = 252$.',
    memorizationRule: '128 → 192 → 224 → 240 → 248 → 252 → 254 → 255 (шаги: 128, 64, 32, 16, 8, 4, 2, 1).',
    ipv4Practice: {
      enabled: true,
      reason: 'Отработайте перевод октетов между двоичной и десятичной системами в интерактивном режиме.',
      targetPrefix: 30,
      targetMode: 'trainer',
    },
    keyTakeaways: [
      '11111100 = 252',
      'В подсети /30 доступно всего 2 хоста (линки точка-точка)',
    ],
  },

  'l3-08': {
    category: 'l3',
    categoryLabel: 'L3 · Расчет адреса подсети (/26)',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Для IP 192.168.10.70/26 адрес сети равен 192.168.10.64.',
    deepAnalysis: 'Префикс /26 означает, что в 4-м октете маски занято 2 бита (11000000 = 192). Шаг подсети (Magic Number) равен $256 - 192 = 64$. Подсети идут с шагом 64: .0, .64, .128, .192. Адрес 70 попадает в диапазон от 64 до 127. Следовательно, адрес сети — 192.168.10.64.',
    commonTrap: 'Ошибочно считать адресом сети .0. В разбитой на подсети сети .0 — лишь первая из четырех подсетей.',
    memorizationRule: 'Magic Number = 256 - Маска интересного октета. Для /26: 256 - 192 = 64. Сетки: 0, 64, 128, 192.',
    ipv4Practice: {
      enabled: true,
      reason: 'Проверьте расчет адреса сети, первого хоста и broadcast для маски /26 в калькуляторе.',
      targetPrefix: 26,
      targetMode: 'calc',
    },
    keyTakeaways: [
      'Маска /26 = 255.255.255.192 (шаг 64)',
      'Сеть для .70: 192.168.10.64, первый хост: .65, последний: .126, broadcast: .127',
    ],
  },

  'l3-09': {
    category: 'l3',
    categoryLabel: 'L3 · Расчет Broadcast-адреса (/26)',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Для подсети 192.168.10.64/26 широковещательный адрес (Broadcast) равен 192.168.10.127.',
    deepAnalysis: 'Broadcast — это последний адрес в диапазоне подсети, где все биты хостовой части равны единицам. Поскольку шаг подсети равен 64, следующая подсеть начнется с адреса 192.168.10.128. Адрес прямо перед ней (128 - 1 = 127) и является широковещательным.',
    commonTrap: 'Путаница между последним адресом хоста (.126) и широковещательным адресом (.127). Хост не может иметь broadcast-адрес!',
    ipv4Practice: {
      enabled: true,
      reason: 'Закрепите навык мгновенного нахождения broadcast-адреса по шагу подсети.',
      targetPrefix: 26,
      targetMode: 'calc',
    },
    keyTakeaways: [
      'Broadcast = Адрес следующей сети - 1',
      'Для сети .64/26 broadcast равен 192.168.10.127',
    ],
  },

  'l3-10': {
    category: 'l3',
    categoryLabel: 'L3 · Количество пригодных хостов (/27)',
    categoryColor: 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30',
    coreConcept: 'Подсеть /27 содержит 30 пригодных для назначения адресов хостов ($2^{32-27} - 2 = 32 - 2 = 30$).',
    deepAnalysis: 'Всего в IPv4 32 бита. При маске /27 на хостовую часть остается $32 - 27 = 5$ бит. Число возможных комбинаций: $2^5 = 32$. Вычитаем 2 зарезервированных адреса (адрес самой сети, где все биты 0, и broadcast, где все биты 1). Итого: $32 - 2 = 30$ хостов.',
    commonTrap: 'Забыть вычесть 2 адреса (сеть и broadcast) и ответить 32.',
    memorizationRule: 'Формула хостов: 2^(32 - Prefix) - 2. Для /27: 2^5 - 2 = 32 - 2 = 30 хостов.',
    ipv4Practice: {
      enabled: true,
      reason: 'Потренируйте быстрый расчет хостов для масок от /24 до /30 в тренажёре.',
      targetPrefix: 27,
      targetMode: 'trainer',
    },
    keyTakeaways: [
      '/27: 32 всего, 30 полезных',
      '/28: 16 всего, 14 полезных',
      '/29: 8 всего, 6 полезных',
      '/30: 4 всего, 2 полезных',
    ],
  },

  // L4 Transport
  'l4-02': {
    category: 'l4',
    categoryLabel: 'L4 · Транспортный уровень · 3-Way Handshake TCP',
    categoryColor: 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30',
    coreConcept: 'Установка TCP-соединения происходит строго в 3 шага: SYN → SYN+ACK → ACK.',
    deepAnalysis: 'Клиент отправляет пакет с флагом SYN и случайным начальным номером последовательности ISN (Initial Sequence Number). Сервер подтверждает получение флагом ACK (увеличивая номер на 1) и синхронизирует свой поток флагом SYN со своим ISN. Клиент завершает рукопожатие отправкой ACK. Соединение переходит в состояние ESTABLISHED.',
    commonTrap: 'Путать порядок флагов. Сервер отвечает не просто ACK, а ОБЯЗАТЕЛЬНО комбинацией SYN+ACK!',
    memorizationRule: '1) Привет, давай свяжемся (SYN) 2) Привет, согласен, а ты готов? (SYN-ACK) 3) Да, готов, погнали (ACK).',
    visualDiagram: \`Client                               Server
  |                                     |
  | -------- 1. [SYN, Seq=x] ---------> | (LISTEN -> SYN_RCVD)
  |                                     |
  | <--- 2. [SYN+ACK, Seq=y, Ack=x+1] - |
  |                                     |
  | ------- 3. [ACK, Ack=y+1] --------> |
  v                                     v
(ESTABLISHED)                       (ESTABLISHED)\`,
    keyTakeaways: [
      'SYN расходует 1 номер в пространстве Sequence Number',
      'Защищает от дублирования старых пакетов из прошлых сессий',
    ],
  },

  'l4-03': {
    category: 'l4',
    categoryLabel: 'L4 · TCP vs UDP · Контроль перегрузок',
    categoryColor: 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30',
    coreConcept: 'TCP обеспечивает гарантированную доставку, упорядочивание и контроль перегрузки; UDP передает дейтаграммы без гарантий и без задержек на подтверждения.',
    deepAnalysis: 'UDP имеет фиксированный минимальный заголовок всего 8 байт (Source Port, Dest Port, Length, Checksum) против минимум 20 байт у TCP. В UDP нет механизма повторных передач (Retransmission) и нет окна перегрузки (Congestion Window), поэтому он идеален для real-time трафика (VoIP, видеостриминг, онлайн-игры, DNS), где потеря пакета лучше, чем задержка очереди.',
    commonTrap: 'Считать UDP «плохим или ненадежным». UDP спроектирован для минимизации задержек; надежность при необходимости реализуется на прикладном уровне (как в QUIC/HTTP3).',
    visualDiagram: \`+-----------------------+-----------------------+
| Свойство             | TCP                   | UDP                   |
+-----------------------+-----------------------+-----------------------+
| Соединение            | Connection-Oriented   | Connectionless        |
| Надежность            | Гарантия ACK + Retran | Без подтверждений     |
| Размер заголовка      | 20-60 байт            | 8 байт (фиксированно) |
| Порядок доставки      | Строго по Seq Number  | Не гарантируется      |
+-----------------------+-----------------------+-----------------------+\`,
    keyTakeaways: [
      'TCP: надёжно, медленнее, контролирует поток',
      'UDP: быстро, без оверхеда, без состояний рукопожатия',
    ],
  },

  // L5-L7 Application
  'l7-02': {
    category: 'l5_l7',
    categoryLabel: 'L7 · Протокол DHCP · Процесс DORA',
    categoryColor: 'from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30',
    coreConcept: 'Получение адреса по DHCP происходит по алгоритму DORA: Discover → Offer → Request → Acknowledge.',
    deepAnalysis: '1) Discover: клиент шлет broadcast на L2 и L3 (Dst IP 255.255.255.255, UDP port 67) в поисках серверов. 2) Offer: DHCP-сервер предлагает IP-адрес. 3) Request: клиент подтверждает broadcast-запросом, что выбрал именно этот сервер. 4) Acknowledge (ACK): сервер подтверждает аренду (Lease Time) и передает маску, шлюз и DNS.',
    commonTrap: 'Забыть мнемонику DORA или перепутать порядок Offer и Request.',
    memorizationRule: 'D - Discover | O - Offer | R - Request | A - Acknowledge (D-O-R-A).',
    visualDiagram: \`Client (0.0.0.0:68)                 DHCP Server (Port 67)
  |                                          |
  | -- 1. DHCP Discover (Broadcast) -------> |
  |                                          |
  | <---- 2. DHCP Offer (Unicast/Bcast) ---- |
  |                                          |
  | -- 3. DHCP Request (Broadcast) --------> |
  |                                          |
  | <---- 4. DHCP ACK (Unicast/Bcast) ------ |
  v                                          v\`,
    keyTakeaways: [
      'DHCP работает поверх UDP (порт 67 сервер, порт 68 клиент)',
      'Client шлет Discover с IP 0.0.0.0 на broadcast 255.255.255.255',
    ],
  },

  'l7-04': {
    category: 'l5_l7',
    categoryLabel: 'L7 · DNS · Рекурсия и типы записей',
    categoryColor: 'from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30',
    coreConcept: 'DNS преобразует человекочитаемые доменные имена в IP-адреса. Запись A хранит IPv4, AAAA — IPv6, CNAME — канонический псевдоним.',
    deepAnalysis: 'DNS-запросы стандартно отправляются по UDP на порт 53 для скорости. Однако, если размер ответа превышает 512 байт (или при трансфере зон AXFR), DNS переключается на TCP порт 53. В рекурсивном запросе локальный резолвер берет на себя обход корневых серверов (Root .), серверов зоны (TLD .ru) и авторитативных серверов домена.',
    commonTrap: 'Считать, что DNS работает ТОЛЬКО по UDP. При ответах > 512 байт или DNSSEC/AXFR используется TCP 53!',
    practicalTip: 'В терминале проверяйте командой \`dig domain.com +trace\` или \`nslookup -type=any domain.com\`.',
    keyTakeaways: [
      'A = IPv4, AAAA = IPv6, CNAME = Alias, MX = Mail, PTR = Reverse IP-to-Domain',
      'Порт 53 UDP (для обычных запросов) и TCP (для больших ответов и AXFR)',
    ],
  },
};

// Intelligent generator for question deep dive analysis
export function getQuestionDeepDive(question: Question): QuestionDeepDive {
  if (CURATED_DEEP_DIVES[question.id]) {
    const curated = CURATED_DEEP_DIVES[question.id];
    return {
      questionId: question.id,
      category: curated.category || detectCategory(question),
      categoryLabel: curated.categoryLabel || question.topic,
      categoryColor: curated.categoryColor || getCategoryColor(detectCategory(question)),
      coreConcept: curated.coreConcept || extractCoreConcept(question),
      deepAnalysis: curated.deepAnalysis || question.explanation,
      commonTrap: curated.commonTrap || detectCommonTrap(question),
      practicalTip: curated.practicalTip || question.remember,
      memorizationRule: curated.memorizationRule || question.remember,
      visualDiagram: curated.visualDiagram,
      ipv4Practice: curated.ipv4Practice || detectIpv4Practice(question),
      keyTakeaways: curated.keyTakeaways || [
        question.explanation.slice(0, 80) + '...',
        'Проверьте правильный ответ перед повторным тестированием',
      ],
    };
  }

  // Automated smart analysis for all other 490+ questions
  const category = detectCategory(question);
  const ipv4Practice = detectIpv4Practice(question);
  const trap = detectCommonTrap(question);
  const diagram = generateDiagramForQuestion(question, category);

  return {
    questionId: question.id,
    category,
    categoryLabel: question.topic,
    categoryColor: getCategoryColor(category),
    coreConcept: extractCoreConcept(question),
    deepAnalysis: enrichExplanation(question, category),
    commonTrap: trap,
    practicalTip: question.remember || getPracticalTip(question, category),
    memorizationRule: question.remember,
    visualDiagram: diagram,
    ipv4Practice,
    keyTakeaways: generateKeyTakeaways(question, category),
  };
}

function detectCategory(q: Question): QuestionDeepDive['category'] {
  if (q.group === 'visual-l1') return 'visual';
  if (q.group === 'troubleshooting' || q.topic.includes('Диагностика')) return 'cli';
  if (q.group === 'tcpip' || q.topic.includes('TCP/IP') || q.topic.includes('Инкапсуляция')) return 'tcpip';
  if (q.group === 'l4' || q.topic.includes('L4') || q.topic.includes('TCP') || q.topic.includes('UDP')) return 'l4';
  if (q.group === 'l5-l7' || q.topic.includes('L5') || q.topic.includes('L7') || q.topic.includes('DNS') || q.topic.includes('DHCP') || q.topic.includes('HTTP')) return 'l5_l7';
  if (q.group === 'l3' || q.topic.includes('L3') || q.topic.includes('IPv4') || q.topic.includes('Маски') || q.topic.includes('Подсети')) return 'l3';
  if (q.group === 'l1-l2') {
    if (q.topic.includes('L1') || q.topic.includes('Оптика') || q.topic.includes('Физический')) return 'l1';
    return 'l2';
  }
  return 'l3';
}

function getCategoryColor(category: QuestionDeepDive['category']): string {
  switch (category) {
    case 'l1':
      return 'from-amber-500/20 to-orange-500/10 text-amber-300 border-amber-500/30';
    case 'l2':
      return 'from-emerald-500/20 to-teal-500/10 text-emerald-300 border-emerald-500/30';
    case 'l3':
      return 'from-cyan-500/20 to-teal-500/10 text-cyan-300 border-cyan-500/30';
    case 'l4':
      return 'from-blue-500/20 to-cyan-500/10 text-blue-300 border-blue-500/30';
    case 'l5_l7':
      return 'from-pink-500/20 to-rose-500/10 text-pink-300 border-pink-500/30';
    case 'tcpip':
      return 'from-violet-500/20 to-purple-500/10 text-violet-300 border-violet-500/30';
    case 'cli':
      return 'from-lime-500/20 to-emerald-500/10 text-lime-300 border-lime-500/30';
    case 'visual':
      return 'from-fuchsia-500/20 to-indigo-500/10 text-fuchsia-300 border-fuchsia-500/30';
    default:
      return 'from-cyan-500/20 to-blue-500/10 text-cyan-300 border-cyan-500/30';
  }
}

// Selective linking to IPv4 trainer: only where subnet math is actually beneficial!
function detectIpv4Practice(q: Question): QuestionDeepDive['ipv4Practice'] | undefined {
  const isSubnetMath =
    q.topic.includes('Маски') ||
    q.topic.includes('Подсети') ||
    q.topic.includes('Биты маски') ||
    q.family?.startsWith('subnet-') ||
    q.family?.startsWith('gen-bin-dec') ||
    q.family?.startsWith('gen-dec-bin') ||
    q.text.includes('пригодных адресов') ||
    q.text.includes('broadcast') ||
    q.text.includes('адрес сети у');

  // Skip conceptual questions like TTL, NAT, Protocol number 6, Default route concept
  const isPureTheory =
    q.text.includes('TTL') ||
    q.text.includes('NAT') ||
    q.text.includes('протокол имеет номер') ||
    q.text.includes('шлюз по умолчанию') ||
    q.text.includes('0.0.0.0/0') ||
    q.text.includes('ICMP');

  if (isSubnetMath && !isPureTheory) {
    let targetPrefix = 24;
    const match = q.text.match(/\\/(\\d{2})/);
    if (match) {
      targetPrefix = parseInt(match[1], 10);
    } else if (q.family?.includes('26')) targetPrefix = 26;
    else if (q.family?.includes('27')) targetPrefix = 27;
    else if (q.family?.includes('28')) targetPrefix = 28;
    else if (q.family?.includes('29')) targetPrefix = 29;
    else if (q.family?.includes('30')) targetPrefix = 30;

    return {
      enabled: true,
      reason: \`В этом вопросе проверяется навык расчёта маски /\${targetPrefix}. Отработайте математику подсетей в интерактивном тренажёре.\`,
      targetPrefix,
      targetMode: q.text.includes('двоич') || q.text.includes('октет') ? 'trainer' : 'calc',
    };
  }

  return undefined;
}

function extractCoreConcept(q: Question): string {
  const correctAnswersText = q.correct.map((idx) => q.answers[idx]).join('; ');
  return \`Правильный ответ: «\${correctAnswersText}». Ключевой принцип темы «\${q.topic}».\`;
}

function enrichExplanation(q: Question, category: QuestionDeepDive['category']): string {
  if (q.explanation && q.explanation.length > 80) {
    return q.explanation;
  }

  switch (category) {
    case 'l1':
      return \`\${q.explanation} Физический уровень отвечает за передачу неструктурированного битового потока через физическую среду передачи (медь, оптику, радиоканал), характеристики сигналов и типы разъемов.\`;
    case 'l2':
      return \`\${q.explanation} Канальный уровень обеспечивает адресацию внутри одного локального сегмента по MAC-адресам, проверку целостности кадров (FCS CRC-32) и разграничение broadcast-доменов через VLAN.\`;
    case 'l3':
      return \`\${q.explanation} Сетевой уровень выполняет сквозную маршрутизацию пакетов между различными сегментами сетей с помощью логических IP-адресов и таблиц пересылки (FIB/RIB).\`;
    case 'l4':
      return \`\${q.explanation} Транспортный уровень отвечает за взаимодействие между конкретными процессами операционной системы через номера портов (0–65535) и управление потоком данных.\`;
    case 'l5_l7':
      return \`\${q.explanation} Прикладной уровень предоставляет стандартизированные протоколы и интерфейсы для взаимодействия пользовательских приложений и сетевых сервисов.\`;
    case 'cli':
      return \`\${q.explanation} Для надежной сетевой диагностики всегда важно локализовать уровень неисправности по модели OSI: от физики кабеля до L7-приложений.\`;
    case 'visual':
      return \`\${q.explanation} Внимание к маркировке, типу волокна (SMF 9/125 vs MMF 50/125) и типу полировки коннекторов (UPC синий vs APC зеленый) критично при монтаже ВОЛС и СКС.\`;
    default:
      return q.explanation;
  }
}

function detectCommonTrap(q: Question): string {
  if (q.text.includes('маск') || q.text.includes('хост')) {
    return 'Частая ошибка: забывают вычесть 2 зарезервированных адреса (адрес подсети и broadcast) или путают шаг подсети с количеством хостов.';
  }
  if (q.text.includes('кадр') || q.text.includes('пакет') || q.text.includes('сегмент')) {
    return 'Типичная путаница терминов PDU: кадр (L2 Ethernet) часто ошибочно называют пакетом (L3 IP), а сегмент (L4 TCP) — датаграммой.';
  }
  if (q.text.includes('коммутатор') || q.text.includes('switch')) {
    return 'Распространенное заблуждение: коммутатор обучается по Destination MAC, хотя на самом деле он смотрит только на Source MAC входящего кадра.';
  }
  if (q.text.includes('TTL')) {
    return 'Ошибочно полагают, что при TTL=1 пакет дойдет до получателя. Маршрутизатор декрементирует TTL ПЕРЕД пересылкой, поэтому пакет отбрасывается.';
  }
  if (q.text.includes('TCP') || q.text.includes('UDP')) {
    return 'Путаница между флагами и надежностью: думают, что UDP вообще не проверяет ошибки (хотя у него есть контрольная сумма Checksum) или забывают про SYN+ACK.';
  }
  if (q.group === 'visual-l1' || q.topic.includes('Оптика')) {
    return 'Опасная ошибка в монтаже: соединение коннекторов UPC (синий, прямой торец) и APC (зеленый, скос 8 градусов) приводит к сколу оптического волокна!';
  }
  return 'Обратите внимание на точные формулировки стандартов и исключения из общих правил.';
}

function getPracticalTip(q: Question, category: QuestionDeepDive['category']): string {
  switch (category) {
    case 'cli':
      return 'В боевых условиях всегда проверяйте статус линка (L1/L2) перед диагностикой маршрутов или DNS.';
    case 'l3':
      return 'Команда \`ip route show\` в Linux или \`route print\` в Windows быстро отображает порядок метрик и активные шлюзы.';
    case 'l4':
      return 'Утилита \`ss -tulpn\` моментально показывает слушающие сокеты, PID процессов и связанные порты.';
    case 'l2':
      return 'Таблица CAM очищается по тайм-ауту (обычно 300 секунд), если узел долго не отправляет кадры.';
    default:
      return 'Запомните фундаментальный принцип: каждый уровень модели OSI решает строго свою задачу и инкапсулирует вышележащий PDU.';
  }
}

function generateDiagramForQuestion(q: Question, category: QuestionDeepDive['category']): string | undefined {
  if (q.topic.includes('Подсети') || q.topic.includes('Маски')) {
    return \`+-------------------------------------------------------------+
| Формула подсетей: Шаг (Magic Number) = 256 - Маска октета   |
| Хостов в подсети = 2^(32 - Префикс) - 2                     |
+-------------------------------------------------------------+\`;
  }
  if (q.topic.includes('TCP') || q.topic.includes('Handshake')) {
    return \`Client                  Server
  | ----- 1. [SYN] ------> |
  | <--- 2. [SYN+ACK] ---- |
  | ----- 3. [ACK] ------> |\`;
  }
  if (q.topic.includes('Единицы данных') || q.topic.includes('PDU')) {
    return \`[ L7 Данные ] -> [ L4 Сегмент TCP/UDP ] -> [ L3 IP-пакет ] -> [ L2 Кадр Ethernet ] -> [ L1 Биты ]\`;
  }
  return undefined;
}

function generateKeyTakeaways(q: Question, category: QuestionDeepDive['category']): string[] {
  const correctAnswersText = q.correct.map((idx) => q.answers[idx]).join(', ');
  return [
    \`Правильный ответ: \${correctAnswersText}\`,
    \`Тематический блок: \${q.topic}\`,
    category === 'l3' && q.text.includes('/')
      ? 'Расчёт маски и хостов автоматизирован в разделе IPv4-тренажёра'
      : 'Внимательно проверяйте модель OSI и соответствие стандартам',
  ];
}
`,ft=`import rawQuestions from './questions.json';
import { Question, QuizMode, QuizModeId } from '../types/quiz';

export const ALL_QUESTIONS: Question[] = rawQuestions as Question[];

export const QUIZ_MODES: QuizMode[] = [
  {
    id: 'mixed',
    title: 'Смешанный экзамен',
    subtitle: 'Все уровни OSI и стек TCP/IP',
    description: 'Комплексный срез знаний по всем темам: от оптики и витой пары до прикладных протоколов.',
    icon: 'Layers',
    count: ALL_QUESTIONS.filter((q) => q.group !== 'visual-l1').length,
  },
  {
    id: 'l1-l2',
    title: 'L1–L2: Физика и Ethernet',
    subtitle: 'Кабели, оптика, SFP, MAC, VLAN, STP',
    description: 'Сигналы, коллизионные домены, широковещание, коммутаторы, транки и агрегация каналов.',
    icon: 'Cpu',
    groupFilter: 'l1-l2',
    count: ALL_QUESTIONS.filter((q) => q.group === 'l1-l2').length,
  },
  {
    id: 'l3',
    title: 'L3: IPv4, IPv6 и маршрутизация',
    subtitle: 'Адресация, маски, CIDR, ARP, ICMP',
    description: 'Маршрутизация, таблицы пересылки, деление на подсети, TTL, MTU и фрагментация.',
    icon: 'Network',
    groupFilter: 'l3',
    count: ALL_QUESTIONS.filter((q) => q.group === 'l3').length,
  },
  {
    id: 'l4',
    title: 'L4: TCP и UDP',
    subtitle: 'Транспортный уровень, порты, сокеты',
    description: '3-way handshake, флаги SYN/ACK/FIN/RST, надежность, скользящее окно и тайм-ауты.',
    icon: 'Repeat',
    groupFilter: 'l4',
    count: ALL_QUESTIONS.filter((q) => q.group === 'l4').length,
  },
  {
    id: 'l5-l7',
    title: 'L5–L7: Приложения и безопасность',
    subtitle: 'DNS, HTTP/1-3, TLS, DHCP, SSH',
    description: 'Прикладные протоколы, сертификаты, сессии, REST API и шифрование данных.',
    icon: 'Globe',
    groupFilter: 'l5-l7',
    count: ALL_QUESTIONS.filter((q) => q.group === 'l5-l7').length,
  },
  {
    id: 'tcpip',
    title: 'Стек TCP/IP',
    subtitle: 'Модель и архитектура стека',
    description: 'Инкапсуляция, декапсуляция, заголовки и соответствие с 7-уровневой моделью OSI.',
    icon: 'FileCode',
    groupFilter: 'tcpip',
    count: ALL_QUESTIONS.filter((q) => q.group === 'tcpip').length,
  },
  {
    id: 'troubleshooting',
    title: 'Диагностика сети и CLI',
    subtitle: 'Практический траблшутинг и команды',
    description: 'Использование ping, traceroute, netstat, ip link/route, wireshark и разбор инцидентов.',
    icon: 'Terminal',
    groupFilter: 'troubleshooting',
    count: ALL_QUESTIONS.filter((q) => q.group === 'troubleshooting').length,
  },
  {
    id: 'visual-l1',
    title: 'L1 — по фото оборудования',
    subtitle: 'Патч-корды, разъемы, SFP, шасси',
    description: 'Реальные фотографии серверного и телеком-оборудования, портов и маркировок.',
    icon: 'Camera',
    groupFilter: 'visual-l1',
    count: ALL_QUESTIONS.filter((q) => q.group === 'visual-l1').length,
  },
];

// Helper to shuffle questions
export function getRandomQuestions(
  modeId: QuizModeId,
  count: number = 10
): Question[] {
  let pool = ALL_QUESTIONS;
  if (modeId === 'mixed') {
    pool = ALL_QUESTIONS.filter((q) => q.group !== 'visual-l1');
  } else {
    pool = ALL_QUESTIONS.filter((q) => q.group === modeId);
  }

  // Shuffle pool (Fisher-Yates)
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  // Return requested count (or all if count >= shuffled.length)
  return count >= shuffled.length ? shuffled : shuffled.slice(0, count);
}

// Format image URL so it always resolves from GitHub CDN if relative
export function resolveImageUrl(imgPath?: string): string {
  if (!imgPath) return '';
  if (imgPath.startsWith('http://') || imgPath.startsWith('https://')) {
    return imgPath;
  }
  const cleanPath = imgPath.replace(/^\\.?\\//, '');
  return \`https://raw.githubusercontent.com/apotet/osi-tcpip-exam-public/main/\${cleanPath}\`;
}
`,pt=`@import "tailwindcss";

@layer base {
  *, ::before, ::after {
    box-sizing: border-box;
  }

  :root {
    color-scheme: dark;
  }

  html {
    scroll-behavior: smooth;
    font-family: 'Plus Jakarta Sans', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    overflow-x: hidden;
    width: 100%;
    max-width: 100vw;
    -webkit-text-size-adjust: 100%;
  }

  /* Dark mode default */
  html.dark,
  html.dark body,
  html.dark #root {
    background-color: #07111f;
    color: #f1f5f9;
  }

  /* Light mode palette: crisp, readable, elegant */
  html:not(.dark),
  html:not(.dark) body,
  html:not(.dark) #root {
    background-color: #f8fafc;
    color: #0f172a;
  }

  body {
    overflow-x: hidden;
    max-width: 100vw;
    width: 100%;
    margin: 0;
    padding: 0;
    position: relative;
    -webkit-overflow-scrolling: touch;
  }

  #root {
    overflow-x: hidden;
    max-width: 100%;
    width: 100%;
    position: relative;
  }
}

/* Optical Fiber & Packet Pulse Animations */
@keyframes fiberPulse {
  0% {
    box-shadow: 0 0 4px #22d3ee, 0 0 12px rgba(34, 211, 238, 0.4);
    transform: scale(0.96);
  }
  50% {
    box-shadow: 0 0 12px #22d3ee, 0 0 24px rgba(34, 211, 238, 0.8);
    transform: scale(1.08);
  }
  100% {
    box-shadow: 0 0 4px #22d3ee, 0 0 12px rgba(34, 211, 238, 0.4);
    transform: scale(0.96);
  }
}

.animate-fiber-pulse {
  animation: fiberPulse 2s infinite ease-in-out;
}

/* Glassmorphism helpers for dark & light */
.glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

html:not(.dark) .glass-panel {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(15, 23, 42, 0.1);
  box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.05);
}

html:not(.dark) .text-white {
  color: #0f172a;
}

html:not(.dark) .text-slate-300 {
  color: #334155;
}

html:not(.dark) .text-slate-400 {
  color: #64748b;
}

html:not(.dark) .bg-\\[\\#07111f\\] {
  background-color: #f8fafc;
}

html:not(.dark) .bg-\\[\\#091524\\] {
  background-color: #ffffff;
  border-color: #e2e8f0;
}

html:not(.dark) .bg-slate-900\\/60,
html:not(.dark) .bg-slate-900\\/50,
html:not(.dark) .bg-slate-900\\/70 {
  background-color: #f1f5f9;
  border-color: #e2e8f0;
}

/* Glassmorphism helpers */
.glass-panel {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.4);
}

.dark .glass-panel {
  background: rgba(15, 23, 42, 0.75);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.glass-card {
  background: rgba(255, 255, 255, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.5);
}

.dark .glass-card {
  background: rgba(30, 41, 59, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
`,mt=`import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(<App />);
`,ht=`export interface Question {
  id: string;
  group: string;
  topic: string;
  text: string;
  answers: string[];
  correct: number[];
  explanation: string;
  remember?: string;
  image?: string;
  imageAlt?: string;
  template?: boolean;
  family?: string;
  difficulty?: 'basic' | 'applied' | 'advanced';
}

export type QuizModeId =
  | 'mixed'
  | 'l1-l2'
  | 'l3'
  | 'l4'
  | 'l5-l7'
  | 'tcpip'
  | 'troubleshooting'
  | 'visual-l1';

export interface QuizMode {
  id: QuizModeId;
  title: string;
  subtitle: string;
  description: string;
  icon: string;
  groupFilter?: string;
  count: number;
}

export interface QuizSession {
  questions: Question[];
  currentIndex: number;
  userAnswers: Record<string, number[]>;
  submittedQuestions: Record<string, boolean>;
  startTime: number;
  endTime?: number;
  isCompleted: boolean;
  mode: QuizModeId;
  feedbackMode: 'instant' | 'exam';
}

export interface QuizStats {
  totalAttempts: number;
  highestScore: number;
  passedCount: number;
  history: Array<{
    date: string;
    mode: string;
    score: number;
    total: number;
    percentage: number;
  }>;
}
`,gt=`// Haptic vibration feedback for iPhone / Android mobile devices
export function triggerHaptic(type: 'light' | 'medium' | 'heavy' | 'selection' | 'success' | 'error' = 'light') {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) return;

  try {
    switch (type) {
      case 'light':
      case 'selection':
        navigator.vibrate(8);
        break;
      case 'medium':
        navigator.vibrate(18);
        break;
      case 'heavy':
        navigator.vibrate(30);
        break;
      case 'success':
        navigator.vibrate([10, 30, 20]);
        break;
      case 'error':
        navigator.vibrate([20, 40, 20, 40, 30]);
        break;
    }
  } catch {
    // ignore if device restricts vibration
  }
}
`,_t=`// Web Audio API sound generator for tactile feedback
let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playSuccessSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.2);
  } catch {
    // Ignore audio restrictions
  }
}

export function playErrorSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(220, ctx.currentTime); // A3
    osc.frequency.exponentialRampToValueAtTime(146.83, ctx.currentTime + 0.2); // D3
    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
  } catch {
    // Ignore audio restrictions
  }
}

export function playClickSound() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(440, ctx.currentTime);
    gain.gain.setValueAtTime(0.03, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.05);
  } catch {
    // Ignore
  }
}
`,vt=`{
  "compilerOptions": {
    "target": "ES2022",
    "experimentalDecorators": true,
    "useDefineForClassFields": false,
    "module": "ESNext",
    "types": ["vite/client"],
    "lib": [
      "ES2022",
      "DOM",
      "DOM.Iterable"
    ],
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "isolatedModules": true,
    "moduleDetection": "force",
    "allowJs": true,
    "jsx": "react-jsx",
    "paths": {
      "@/*": [
        "./*"
      ]
    },
    "resolveJsonModule": true,
    "allowImportingTsExtensions": true,
    "noEmit": true
  },
  "exclude": ["dist"]
}
`,yt=`import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    base: './',
    plugins: [react(), tailwindcss()],
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('questions.json')) return 'questions-data';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('node_modules/react')) return 'vendor-react';
          },
        },
      },
    },
    resolve: {
      alias: {
        '@': path.resolve(process.cwd(), '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
`;n(((t,n)=>{(function(e){typeof t==`object`&&n!==void 0?n.exports=e():typeof define==`function`&&define.amd?define([],e):(typeof window<`u`?window:typeof global<`u`?global:typeof self<`u`?self:this).JSZip=e()})(function(){return function t(n,r,i){function a(s,c){if(!r[s]){if(!n[s]){var l=typeof e==`function`&&e;if(!c&&l)return l(s,!0);if(o)return o(s,!0);var u=Error(`Cannot find module '`+s+`'`);throw u.code=`MODULE_NOT_FOUND`,u}var d=r[s]={exports:{}};n[s][0].call(d.exports,function(e){var t=n[s][1][e];return a(t||e)},d,d.exports,t,n,r,i)}return r[s].exports}for(var o=typeof e==`function`&&e,s=0;s<i.length;s++)a(i[s]);return a}({1:[function(e,t,n){var r=e(`./utils`),i=e(`./support`),a=`ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=`;n.encode=function(e){for(var t,n,i,o,s,c,l,u=[],d=0,f=e.length,p=f,m=r.getTypeOf(e)!==`string`;d<e.length;)p=f-d,i=m?(t=e[d++],n=d<f?e[d++]:0,d<f?e[d++]:0):(t=e.charCodeAt(d++),n=d<f?e.charCodeAt(d++):0,d<f?e.charCodeAt(d++):0),o=t>>2,s=(3&t)<<4|n>>4,c=1<p?(15&n)<<2|i>>6:64,l=2<p?63&i:64,u.push(a.charAt(o)+a.charAt(s)+a.charAt(c)+a.charAt(l));return u.join(``)},n.decode=function(e){var t,n,r,o,s,c,l=0,u=0,d=`data:`;if(e.substr(0,d.length)===d)throw Error(`Invalid base64 input, it looks like a data url.`);var f,p=3*(e=e.replace(/[^A-Za-z0-9+/=]/g,``)).length/4;if(e.charAt(e.length-1)===a.charAt(64)&&p--,e.charAt(e.length-2)===a.charAt(64)&&p--,p%1!=0)throw Error(`Invalid base64 input, bad content length.`);for(f=i.uint8array?new Uint8Array(0|p):Array(0|p);l<e.length;)t=a.indexOf(e.charAt(l++))<<2|(o=a.indexOf(e.charAt(l++)))>>4,n=(15&o)<<4|(s=a.indexOf(e.charAt(l++)))>>2,r=(3&s)<<6|(c=a.indexOf(e.charAt(l++))),f[u++]=t,s!==64&&(f[u++]=n),c!==64&&(f[u++]=r);return f}},{"./support":30,"./utils":32}],2:[function(e,t,n){var r=e(`./external`),i=e(`./stream/DataWorker`),a=e(`./stream/Crc32Probe`),o=e(`./stream/DataLengthProbe`);function s(e,t,n,r,i){this.compressedSize=e,this.uncompressedSize=t,this.crc32=n,this.compression=r,this.compressedContent=i}s.prototype={getContentWorker:function(){var e=new i(r.Promise.resolve(this.compressedContent)).pipe(this.compression.uncompressWorker()).pipe(new o(`data_length`)),t=this;return e.on(`end`,function(){if(this.streamInfo.data_length!==t.uncompressedSize)throw Error(`Bug : uncompressed data size mismatch`)}),e},getCompressedWorker:function(){return new i(r.Promise.resolve(this.compressedContent)).withStreamInfo(`compressedSize`,this.compressedSize).withStreamInfo(`uncompressedSize`,this.uncompressedSize).withStreamInfo(`crc32`,this.crc32).withStreamInfo(`compression`,this.compression)}},s.createWorkerFrom=function(e,t,n){return e.pipe(new a).pipe(new o(`uncompressedSize`)).pipe(t.compressWorker(n)).pipe(new o(`compressedSize`)).withStreamInfo(`compression`,t)},t.exports=s},{"./external":6,"./stream/Crc32Probe":25,"./stream/DataLengthProbe":26,"./stream/DataWorker":27}],3:[function(e,t,n){var r=e(`./stream/GenericWorker`);n.STORE={magic:`\0\0`,compressWorker:function(){return new r(`STORE compression`)},uncompressWorker:function(){return new r(`STORE decompression`)}},n.DEFLATE=e(`./flate`)},{"./flate":7,"./stream/GenericWorker":28}],4:[function(e,t,n){var r=e(`./utils`),i=function(){for(var e,t=[],n=0;n<256;n++){e=n;for(var r=0;r<8;r++)e=1&e?3988292384^e>>>1:e>>>1;t[n]=e}return t}();t.exports=function(e,t){return e!==void 0&&e.length?r.getTypeOf(e)===`string`?function(e,t,n,r){var a=i,o=r+n;e^=-1;for(var s=r;s<o;s++)e=e>>>8^a[255&(e^t.charCodeAt(s))];return-1^e}(0|t,e,e.length,0):function(e,t,n,r){var a=i,o=r+n;e^=-1;for(var s=r;s<o;s++)e=e>>>8^a[255&(e^t[s])];return-1^e}(0|t,e,e.length,0):0}},{"./utils":32}],5:[function(e,t,n){n.base64=!1,n.binary=!1,n.dir=!1,n.createFolders=!0,n.date=null,n.compression=null,n.compressionOptions=null,n.comment=null,n.unixPermissions=null,n.dosPermissions=null},{}],6:[function(e,t,n){var r=null;r=typeof Promise<`u`?Promise:e(`lie`),t.exports={Promise:r}},{lie:37}],7:[function(e,t,n){var r=typeof Uint8Array<`u`&&typeof Uint16Array<`u`&&typeof Uint32Array<`u`,i=e(`pako`),a=e(`./utils`),o=e(`./stream/GenericWorker`),s=r?`uint8array`:`array`;function c(e,t){o.call(this,`FlateWorker/`+e),this._pako=null,this._pakoAction=e,this._pakoOptions=t,this.meta={}}n.magic=`\b\0`,a.inherits(c,o),c.prototype.processChunk=function(e){this.meta=e.meta,this._pako===null&&this._createPako(),this._pako.push(a.transformTo(s,e.data),!1)},c.prototype.flush=function(){o.prototype.flush.call(this),this._pako===null&&this._createPako(),this._pako.push([],!0)},c.prototype.cleanUp=function(){o.prototype.cleanUp.call(this),this._pako=null},c.prototype._createPako=function(){this._pako=new i[this._pakoAction]({raw:!0,level:this._pakoOptions.level||-1});var e=this;this._pako.onData=function(t){e.push({data:t,meta:e.meta})}},n.compressWorker=function(e){return new c(`Deflate`,e)},n.uncompressWorker=function(){return new c(`Inflate`,{})}},{"./stream/GenericWorker":28,"./utils":32,pako:38}],8:[function(e,t,n){function r(e,t){var n,r=``;for(n=0;n<t;n++)r+=String.fromCharCode(255&e),e>>>=8;return r}function i(e,t,n,i,o,u){var d,f,p=e.file,m=e.compression,h=u!==s.utf8encode,g=a.transformTo(`string`,u(p.name)),_=a.transformTo(`string`,s.utf8encode(p.name)),v=p.comment,y=a.transformTo(`string`,u(v)),b=a.transformTo(`string`,s.utf8encode(v)),x=_.length!==p.name.length,S=b.length!==v.length,C=``,w=``,T=``,E=p.dir,D=p.date,O={crc32:0,compressedSize:0,uncompressedSize:0};t&&!n||(O.crc32=e.crc32,O.compressedSize=e.compressedSize,O.uncompressedSize=e.uncompressedSize);var k=0;t&&(k|=8),h||!x&&!S||(k|=2048);var A=0,j=0;E&&(A|=16),o===`UNIX`?(j=798,A|=function(e,t){var n=e;return e||(n=t?16893:33204),(65535&n)<<16}(p.unixPermissions,E)):(j=20,A|=function(e){return 63&(e||0)}(p.dosPermissions)),d=D.getUTCHours(),d<<=6,d|=D.getUTCMinutes(),d<<=5,d|=D.getUTCSeconds()/2,f=D.getUTCFullYear()-1980,f<<=4,f|=D.getUTCMonth()+1,f<<=5,f|=D.getUTCDate(),x&&(w=r(1,1)+r(c(g),4)+_,C+=`up`+r(w.length,2)+w),S&&(T=r(1,1)+r(c(y),4)+b,C+=`uc`+r(T.length,2)+T);var M=``;return M+=`
\0`,M+=r(k,2),M+=m.magic,M+=r(d,2),M+=r(f,2),M+=r(O.crc32,4),M+=r(O.compressedSize,4),M+=r(O.uncompressedSize,4),M+=r(g.length,2),M+=r(C.length,2),{fileRecord:l.LOCAL_FILE_HEADER+M+g+C,dirRecord:l.CENTRAL_FILE_HEADER+r(j,2)+M+r(y.length,2)+`\0\0\0\0`+r(A,4)+r(i,4)+g+C+y}}var a=e(`../utils`),o=e(`../stream/GenericWorker`),s=e(`../utf8`),c=e(`../crc32`),l=e(`../signature`);function u(e,t,n,r){o.call(this,`ZipFileWorker`),this.bytesWritten=0,this.zipComment=t,this.zipPlatform=n,this.encodeFileName=r,this.streamFiles=e,this.accumulate=!1,this.contentBuffer=[],this.dirRecords=[],this.currentSourceOffset=0,this.entriesCount=0,this.currentFile=null,this._sources=[]}a.inherits(u,o),u.prototype.push=function(e){var t=e.meta.percent||0,n=this.entriesCount,r=this._sources.length;this.accumulate?this.contentBuffer.push(e):(this.bytesWritten+=e.data.length,o.prototype.push.call(this,{data:e.data,meta:{currentFile:this.currentFile,percent:n?(t+100*(n-r-1))/n:100}}))},u.prototype.openedSource=function(e){this.currentSourceOffset=this.bytesWritten,this.currentFile=e.file.name;var t=this.streamFiles&&!e.file.dir;if(t){var n=i(e,t,!1,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);this.push({data:n.fileRecord,meta:{percent:0}})}else this.accumulate=!0},u.prototype.closedSource=function(e){this.accumulate=!1;var t=this.streamFiles&&!e.file.dir,n=i(e,t,!0,this.currentSourceOffset,this.zipPlatform,this.encodeFileName);if(this.dirRecords.push(n.dirRecord),t)this.push({data:function(e){return l.DATA_DESCRIPTOR+r(e.crc32,4)+r(e.compressedSize,4)+r(e.uncompressedSize,4)}(e),meta:{percent:100}});else for(this.push({data:n.fileRecord,meta:{percent:0}});this.contentBuffer.length;)this.push(this.contentBuffer.shift());this.currentFile=null},u.prototype.flush=function(){for(var e=this.bytesWritten,t=0;t<this.dirRecords.length;t++)this.push({data:this.dirRecords[t],meta:{percent:100}});var n=this.bytesWritten-e,i=function(e,t,n,i,o){var s=a.transformTo(`string`,o(i));return l.CENTRAL_DIRECTORY_END+`\0\0\0\0`+r(e,2)+r(e,2)+r(t,4)+r(n,4)+r(s.length,2)+s}(this.dirRecords.length,n,e,this.zipComment,this.encodeFileName);this.push({data:i,meta:{percent:100}})},u.prototype.prepareNextSource=function(){this.previous=this._sources.shift(),this.openedSource(this.previous.streamInfo),this.isPaused?this.previous.pause():this.previous.resume()},u.prototype.registerPrevious=function(e){this._sources.push(e);var t=this;return e.on(`data`,function(e){t.processChunk(e)}),e.on(`end`,function(){t.closedSource(t.previous.streamInfo),t._sources.length?t.prepareNextSource():t.end()}),e.on(`error`,function(e){t.error(e)}),this},u.prototype.resume=function(){return!!o.prototype.resume.call(this)&&(!this.previous&&this._sources.length?(this.prepareNextSource(),!0):this.previous||this._sources.length||this.generatedError?void 0:(this.end(),!0))},u.prototype.error=function(e){var t=this._sources;if(!o.prototype.error.call(this,e))return!1;for(var n=0;n<t.length;n++)try{t[n].error(e)}catch{}return!0},u.prototype.lock=function(){o.prototype.lock.call(this);for(var e=this._sources,t=0;t<e.length;t++)e[t].lock()},t.exports=u},{"../crc32":4,"../signature":23,"../stream/GenericWorker":28,"../utf8":31,"../utils":32}],9:[function(e,t,n){var r=e(`../compressions`),i=e(`./ZipFileWorker`);n.generateWorker=function(e,t,n){var a=new i(t.streamFiles,n,t.platform,t.encodeFileName),o=0;try{e.forEach(function(e,n){o++;var i=function(e,t){var n=e||t,i=r[n];if(!i)throw Error(n+` is not a valid compression method !`);return i}(n.options.compression,t.compression),s=n.options.compressionOptions||t.compressionOptions||{},c=n.dir,l=n.date;n._compressWorker(i,s).withStreamInfo(`file`,{name:e,dir:c,date:l,comment:n.comment||``,unixPermissions:n.unixPermissions,dosPermissions:n.dosPermissions}).pipe(a)}),a.entriesCount=o}catch(e){a.error(e)}return a}},{"../compressions":3,"./ZipFileWorker":8}],10:[function(e,t,n){function r(){if(!(this instanceof r))return new r;if(arguments.length)throw Error(`The constructor with parameters has been removed in JSZip 3.0, please check the upgrade guide.`);this.files=Object.create(null),this.comment=null,this.root=``,this.clone=function(){var e=new r;for(var t in this)typeof this[t]!=`function`&&(e[t]=this[t]);return e}}(r.prototype=e(`./object`)).loadAsync=e(`./load`),r.support=e(`./support`),r.defaults=e(`./defaults`),r.version=`3.10.2`,r.loadAsync=function(e,t){return new r().loadAsync(e,t)},r.external=e(`./external`),t.exports=r},{"./defaults":5,"./external":6,"./load":11,"./object":15,"./support":30}],11:[function(e,t,n){var r=e(`./utils`),i=e(`./external`),a=e(`./utf8`),o=e(`./zipEntries`),s=e(`./stream/Crc32Probe`),c=e(`./nodejsUtils`);function l(e){return new i.Promise(function(t,n){var r=e.decompressed.getContentWorker().pipe(new s);r.on(`error`,function(e){n(e)}).on(`end`,function(){r.streamInfo.crc32===e.decompressed.crc32?t():n(Error(`Corrupted zip : CRC32 mismatch`))}).resume()})}t.exports=function(e,t){var n=this;return t=r.extend(t||{},{base64:!1,checkCRC32:!1,optimizedBinaryString:!1,createFolders:!1,decodeFileName:a.utf8decode}),c.isNode&&c.isStream(e)?i.Promise.reject(Error(`JSZip can't accept a stream when loading a zip file.`)):r.prepareContent(`the loaded zip file`,e,!0,t.optimizedBinaryString,t.base64).then(function(e){var n=new o(t);return n.load(e),n}).then(function(e){var n=[i.Promise.resolve(e)],r=e.files;if(t.checkCRC32)for(var a=0;a<r.length;a++)n.push(l(r[a]));return i.Promise.all(n)}).then(function(e){for(var i=e.shift(),a=i.files,o=0;o<a.length;o++){var s=a[o],c=s.fileNameStr,l=r.resolve(s.fileNameStr);n.file(l,s.decompressed,{binary:!0,optimizedBinaryString:!0,date:s.date,dir:s.dir,comment:s.fileCommentStr.length?s.fileCommentStr:null,unixPermissions:s.unixPermissions,dosPermissions:s.dosPermissions,createFolders:t.createFolders}),s.dir||(n.file(l).unsafeOriginalName=c)}return i.zipComment.length&&(n.comment=i.zipComment),n})}},{"./external":6,"./nodejsUtils":14,"./stream/Crc32Probe":25,"./utf8":31,"./utils":32,"./zipEntries":33}],12:[function(e,t,n){var r=e(`../utils`),i=e(`../stream/GenericWorker`);function a(e,t){i.call(this,`Nodejs stream input adapter for `+e),this._upstreamEnded=!1,this._bindStream(t)}r.inherits(a,i),a.prototype._bindStream=function(e){var t=this;(this._stream=e).pause(),e.on(`data`,function(e){t.push({data:e,meta:{percent:0}})}).on(`error`,function(e){t.isPaused?this.generatedError=e:t.error(e)}).on(`end`,function(){t.isPaused?t._upstreamEnded=!0:t.end()})},a.prototype.pause=function(){return!!i.prototype.pause.call(this)&&(this._stream.pause(),!0)},a.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(this._upstreamEnded?this.end():this._stream.resume(),!0)},t.exports=a},{"../stream/GenericWorker":28,"../utils":32}],13:[function(e,t,n){var r=e(`readable-stream`).Readable;function i(e,t,n){r.call(this,t),this._helper=e;var i=this;e.on(`data`,function(e,t){i.push(e)||i._helper.pause(),n&&n(t)}).on(`error`,function(e){i.emit(`error`,e)}).on(`end`,function(){i.push(null)})}e(`../utils`).inherits(i,r),i.prototype._read=function(){this._helper.resume()},t.exports=i},{"../utils":32,"readable-stream":16}],14:[function(e,t,n){t.exports={isNode:typeof Buffer<`u`,newBufferFrom:function(e,t){if(Buffer.from&&Buffer.from!==Uint8Array.from)return Buffer.from(e,t);if(typeof e==`number`)throw Error(`The "data" argument must not be a number`);return new Buffer(e,t)},allocBuffer:function(e){if(Buffer.alloc)return Buffer.alloc(e);var t=new Buffer(e);return t.fill(0),t},isBuffer:function(e){return Buffer.isBuffer(e)},isStream:function(e){return e&&typeof e.on==`function`&&typeof e.pause==`function`&&typeof e.resume==`function`}}},{}],15:[function(e,t,n){function r(e,t,n){var r,i=a.getTypeOf(t),s=a.extend(n||{},c);s.date=s.date||new Date,s.compression!==null&&(s.compression=s.compression.toUpperCase()),typeof s.unixPermissions==`string`&&(s.unixPermissions=parseInt(s.unixPermissions,8)),s.unixPermissions&&16384&s.unixPermissions&&(s.dir=!0),s.dosPermissions&&16&s.dosPermissions&&(s.dir=!0),s.dir&&(e=h(e)),s.createFolders&&(r=m(e))&&g.call(this,r,!0);var d=i===`string`&&!1===s.binary&&!1===s.base64;n&&n.binary!==void 0||(s.binary=!d),(t instanceof l&&t.uncompressedSize===0||s.dir||!t||t.length===0)&&(s.base64=!1,s.binary=!0,t=``,s.compression=`STORE`,i=`string`);var _=null;_=t instanceof l||t instanceof o?t:f.isNode&&f.isStream(t)?new p(e,t):a.prepareContent(e,t,s.binary,s.optimizedBinaryString,s.base64);var v=new u(e,_,s);this.files[e]=v}var i=e(`./utf8`),a=e(`./utils`),o=e(`./stream/GenericWorker`),s=e(`./stream/StreamHelper`),c=e(`./defaults`),l=e(`./compressedObject`),u=e(`./zipObject`),d=e(`./generate`),f=e(`./nodejsUtils`),p=e(`./nodejs/NodejsStreamInputAdapter`),m=function(e){e.slice(-1)===`/`&&(e=e.substring(0,e.length-1));var t=e.lastIndexOf(`/`);return 0<t?e.substring(0,t):``},h=function(e){return e.slice(-1)!==`/`&&(e+=`/`),e},g=function(e,t){return t=t===void 0?c.createFolders:t,e=h(e),this.files[e]||r.call(this,e,null,{dir:!0,createFolders:t}),this.files[e]};function _(e){return Object.prototype.toString.call(e)===`[object RegExp]`}t.exports={load:function(){throw Error(`This method has been removed in JSZip 3.0, please check the upgrade guide.`)},forEach:function(e){var t,n,r;for(t in this.files)r=this.files[t],(n=t.slice(this.root.length,t.length))&&t.slice(0,this.root.length)===this.root&&e(n,r)},filter:function(e){var t=[];return this.forEach(function(n,r){e(n,r)&&t.push(r)}),t},file:function(e,t,n){if(arguments.length!==1)return e=this.root+e,r.call(this,e,t,n),this;if(_(e)){var i=e;return this.filter(function(e,t){return!t.dir&&i.test(e)})}var a=this.files[this.root+e];return a&&!a.dir?a:null},folder:function(e){if(!e)return this;if(_(e))return this.filter(function(t,n){return n.dir&&e.test(t)});var t=this.root+e,n=g.call(this,t),r=this.clone();return r.root=n.name,r},remove:function(e){e=this.root+e;var t=this.files[e];if(t||=(e.slice(-1)!==`/`&&(e+=`/`),this.files[e]),t&&!t.dir)delete this.files[e];else for(var n=this.filter(function(t,n){return n.name.slice(0,e.length)===e}),r=0;r<n.length;r++)delete this.files[n[r].name];return this},generate:function(){throw Error(`This method has been removed in JSZip 3.0, please check the upgrade guide.`)},generateInternalStream:function(e){var t,n={};try{if((n=a.extend(e||{},{streamFiles:!1,compression:`STORE`,compressionOptions:null,type:``,platform:`DOS`,comment:null,mimeType:`application/zip`,encodeFileName:i.utf8encode})).type=n.type.toLowerCase(),n.compression=n.compression.toUpperCase(),n.type===`binarystring`&&(n.type=`string`),!n.type)throw Error(`No output type specified.`);a.checkSupport(n.type),n.platform!==`darwin`&&n.platform!==`freebsd`&&n.platform!==`linux`&&n.platform!==`sunos`||(n.platform=`UNIX`),n.platform===`win32`&&(n.platform=`DOS`);var r=n.comment||this.comment||``;t=d.generateWorker(this,n,r)}catch(e){(t=new o(`error`)).error(e)}return new s(t,n.type||`string`,n.mimeType)},generateAsync:function(e,t){return this.generateInternalStream(e).accumulate(t)},generateNodeStream:function(e,t){return(e||={}).type||(e.type=`nodebuffer`),this.generateInternalStream(e).toNodejsStream(t)}}},{"./compressedObject":2,"./defaults":5,"./generate":9,"./nodejs/NodejsStreamInputAdapter":12,"./nodejsUtils":14,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31,"./utils":32,"./zipObject":35}],16:[function(e,t,n){t.exports=e(`stream`)},{stream:void 0}],17:[function(e,t,n){var r=e(`./DataReader`);function i(e){r.call(this,e);for(var t=0;t<this.data.length;t++)e[t]=255&e[t]}e(`../utils`).inherits(i,r),i.prototype.byteAt=function(e){return this.data[this.zero+e]},i.prototype.lastIndexOfSignature=function(e){for(var t=e.charCodeAt(0),n=e.charCodeAt(1),r=e.charCodeAt(2),i=e.charCodeAt(3),a=this.length-4;0<=a;--a)if(this.data[a]===t&&this.data[a+1]===n&&this.data[a+2]===r&&this.data[a+3]===i)return a-this.zero;return-1},i.prototype.readAndCheckSignature=function(e){var t=e.charCodeAt(0),n=e.charCodeAt(1),r=e.charCodeAt(2),i=e.charCodeAt(3),a=this.readData(4);return t===a[0]&&n===a[1]&&r===a[2]&&i===a[3]},i.prototype.readData=function(e){if(this.checkOffset(e),e===0)return[];var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],18:[function(e,t,n){var r=e(`../utils`);function i(e){this.data=e,this.length=e.length,this.index=0,this.zero=0}i.prototype={checkOffset:function(e){this.checkIndex(this.index+e)},checkIndex:function(e){if(this.length<this.zero+e||e<0)throw Error(`End of data reached (data length = `+this.length+`, asked index = `+e+`). Corrupted zip ?`)},setIndex:function(e){this.checkIndex(e),this.index=e},skip:function(e){this.setIndex(this.index+e)},byteAt:function(){},readInt:function(e){var t,n=0;for(this.checkOffset(e),t=this.index+e-1;t>=this.index;t--)n=(n<<8)+this.byteAt(t);return this.index+=e,n},readString:function(e){return r.transformTo(`string`,this.readData(e))},readData:function(){},lastIndexOfSignature:function(){},readAndCheckSignature:function(){},readDate:function(){var e=this.readInt(4);return new Date(Date.UTC(1980+(e>>25&127),(e>>21&15)-1,e>>16&31,e>>11&31,e>>5&63,(31&e)<<1))}},t.exports=i},{"../utils":32}],19:[function(e,t,n){var r=e(`./Uint8ArrayReader`);function i(e){r.call(this,e)}e(`../utils`).inherits(i,r),i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./Uint8ArrayReader":21}],20:[function(e,t,n){var r=e(`./DataReader`);function i(e){r.call(this,e)}e(`../utils`).inherits(i,r),i.prototype.byteAt=function(e){return this.data.charCodeAt(this.zero+e)},i.prototype.lastIndexOfSignature=function(e){return this.data.lastIndexOf(e)-this.zero},i.prototype.readAndCheckSignature=function(e){return e===this.readData(4)},i.prototype.readData=function(e){this.checkOffset(e);var t=this.data.slice(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./DataReader":18}],21:[function(e,t,n){var r=e(`./ArrayReader`);function i(e){r.call(this,e)}e(`../utils`).inherits(i,r),i.prototype.readData=function(e){if(this.checkOffset(e),e===0)return new Uint8Array;var t=this.data.subarray(this.zero+this.index,this.zero+this.index+e);return this.index+=e,t},t.exports=i},{"../utils":32,"./ArrayReader":17}],22:[function(e,t,n){var r=e(`../utils`),i=e(`../support`),a=e(`./ArrayReader`),o=e(`./StringReader`),s=e(`./NodeBufferReader`),c=e(`./Uint8ArrayReader`);t.exports=function(e){var t=r.getTypeOf(e);return r.checkSupport(t),t!==`string`||i.uint8array?t===`nodebuffer`?new s(e):i.uint8array?new c(r.transformTo(`uint8array`,e)):new a(r.transformTo(`array`,e)):new o(e)}},{"../support":30,"../utils":32,"./ArrayReader":17,"./NodeBufferReader":19,"./StringReader":20,"./Uint8ArrayReader":21}],23:[function(e,t,n){n.LOCAL_FILE_HEADER=`PK`,n.CENTRAL_FILE_HEADER=`PK`,n.CENTRAL_DIRECTORY_END=`PK`,n.ZIP64_CENTRAL_DIRECTORY_LOCATOR=`PK\x07`,n.ZIP64_CENTRAL_DIRECTORY_END=`PK`,n.DATA_DESCRIPTOR=`PK\x07\b`},{}],24:[function(e,t,n){var r=e(`./GenericWorker`),i=e(`../utils`);function a(e){r.call(this,`ConvertWorker to `+e),this.destType=e}i.inherits(a,r),a.prototype.processChunk=function(e){this.push({data:i.transformTo(this.destType,e.data),meta:e.meta})},t.exports=a},{"../utils":32,"./GenericWorker":28}],25:[function(e,t,n){var r=e(`./GenericWorker`),i=e(`../crc32`);function a(){r.call(this,`Crc32Probe`),this.withStreamInfo(`crc32`,0)}e(`../utils`).inherits(a,r),a.prototype.processChunk=function(e){this.streamInfo.crc32=i(e.data,this.streamInfo.crc32||0),this.push(e)},t.exports=a},{"../crc32":4,"../utils":32,"./GenericWorker":28}],26:[function(e,t,n){var r=e(`../utils`),i=e(`./GenericWorker`);function a(e){i.call(this,`DataLengthProbe for `+e),this.propName=e,this.withStreamInfo(e,0)}r.inherits(a,i),a.prototype.processChunk=function(e){if(e){var t=this.streamInfo[this.propName]||0;this.streamInfo[this.propName]=t+e.data.length}i.prototype.processChunk.call(this,e)},t.exports=a},{"../utils":32,"./GenericWorker":28}],27:[function(e,t,n){var r=e(`../utils`),i=e(`./GenericWorker`);function a(e){i.call(this,`DataWorker`);var t=this;this.dataIsReady=!1,this.index=0,this.max=0,this.data=null,this.type=``,this._tickScheduled=!1,e.then(function(e){t.dataIsReady=!0,t.data=e,t.max=e&&e.length||0,t.type=r.getTypeOf(e),t.isPaused||t._tickAndRepeat()},function(e){t.error(e)})}r.inherits(a,i),a.prototype.cleanUp=function(){i.prototype.cleanUp.call(this),this.data=null},a.prototype.resume=function(){return!!i.prototype.resume.call(this)&&(!this._tickScheduled&&this.dataIsReady&&(this._tickScheduled=!0,r.delay(this._tickAndRepeat,[],this)),!0)},a.prototype._tickAndRepeat=function(){this._tickScheduled=!1,this.isPaused||this.isFinished||(this._tick(),this.isFinished||(r.delay(this._tickAndRepeat,[],this),this._tickScheduled=!0))},a.prototype._tick=function(){if(this.isPaused||this.isFinished)return!1;var e=null,t=Math.min(this.max,this.index+16384);if(this.index>=this.max)return this.end();switch(this.type){case`string`:e=this.data.substring(this.index,t);break;case`uint8array`:e=this.data.subarray(this.index,t);break;case`array`:case`nodebuffer`:e=this.data.slice(this.index,t)}return this.index=t,this.push({data:e,meta:{percent:this.max?this.index/this.max*100:0}})},t.exports=a},{"../utils":32,"./GenericWorker":28}],28:[function(e,t,n){function r(e){this.name=e||`default`,this.streamInfo={},this.generatedError=null,this.extraStreamInfo={},this.isPaused=!0,this.isFinished=!1,this.isLocked=!1,this._listeners={data:[],end:[],error:[]},this.previous=null}r.prototype={push:function(e){this.emit(`data`,e)},end:function(){if(this.isFinished)return!1;this.flush();try{this.emit(`end`),this.cleanUp(),this.isFinished=!0}catch(e){this.emit(`error`,e)}return!0},error:function(e){return!this.isFinished&&(this.isPaused?this.generatedError=e:(this.isFinished=!0,this.emit(`error`,e),this.previous&&this.previous.error(e),this.cleanUp()),!0)},on:function(e,t){return this._listeners[e].push(t),this},cleanUp:function(){this.streamInfo=this.generatedError=this.extraStreamInfo=null,this._listeners=[]},emit:function(e,t){if(this._listeners[e])for(var n=0;n<this._listeners[e].length;n++)this._listeners[e][n].call(this,t)},pipe:function(e){return e.registerPrevious(this)},registerPrevious:function(e){if(this.isLocked)throw Error(`The stream '`+this+`' has already been used.`);this.streamInfo=e.streamInfo,this.mergeStreamInfo(),this.previous=e;var t=this;return e.on(`data`,function(e){t.processChunk(e)}),e.on(`end`,function(){t.end()}),e.on(`error`,function(e){t.error(e)}),this},pause:function(){return!this.isPaused&&!this.isFinished&&(this.isPaused=!0,this.previous&&this.previous.pause(),!0)},resume:function(){if(!this.isPaused||this.isFinished)return!1;var e=this.isPaused=!1;return this.generatedError&&(this.error(this.generatedError),e=!0),this.previous&&this.previous.resume(),!e},flush:function(){},processChunk:function(e){this.push(e)},withStreamInfo:function(e,t){return this.extraStreamInfo[e]=t,this.mergeStreamInfo(),this},mergeStreamInfo:function(){for(var e in this.extraStreamInfo)Object.prototype.hasOwnProperty.call(this.extraStreamInfo,e)&&(this.streamInfo[e]=this.extraStreamInfo[e])},lock:function(){if(this.isLocked)throw Error(`The stream '`+this+`' has already been used.`);this.isLocked=!0,this.previous&&this.previous.lock()},toString:function(){var e=`Worker `+this.name;return this.previous?this.previous+` -> `+e:e}},t.exports=r},{}],29:[function(e,t,n){var r=e(`../utils`),i=e(`./ConvertWorker`),a=e(`./GenericWorker`),o=e(`../base64`),s=e(`../support`),c=e(`../external`),l=null;if(s.nodestream)try{l=e(`../nodejs/NodejsStreamOutputAdapter`)}catch{}function u(e,t){return new c.Promise(function(n,i){var a=[],s=e._internalType,c=e._outputType,l=e._mimeType;e.on(`data`,function(e,n){a.push(e),t&&t(n)}).on(`error`,function(e){a=[],i(e)}).on(`end`,function(){try{n(function(e,t,n){switch(e){case`blob`:return r.newBlob(r.transformTo(`arraybuffer`,t),n);case`base64`:return o.encode(t);default:return r.transformTo(e,t)}}(c,function(e,t){var n,r=0,i=null,a=0;for(n=0;n<t.length;n++)a+=t[n].length;switch(e){case`string`:return t.join(``);case`array`:return Array.prototype.concat.apply([],t);case`uint8array`:for(i=new Uint8Array(a),n=0;n<t.length;n++)i.set(t[n],r),r+=t[n].length;return i;case`nodebuffer`:return Buffer.concat(t);default:throw Error(`concat : unsupported type '`+e+`'`)}}(s,a),l))}catch(e){i(e)}a=[]}).resume()})}function d(e,t,n){var o=t;switch(t){case`blob`:case`arraybuffer`:o=`uint8array`;break;case`base64`:o=`string`}try{this._internalType=o,this._outputType=t,this._mimeType=n,r.checkSupport(o),this._worker=e.pipe(new i(o)),e.lock()}catch(e){this._worker=new a(`error`),this._worker.error(e)}}d.prototype={accumulate:function(e){return u(this,e)},on:function(e,t){var n=this;return e===`data`?this._worker.on(e,function(e){t.call(n,e.data,e.meta)}):this._worker.on(e,function(){r.delay(t,arguments,n)}),this},resume:function(){return r.delay(this._worker.resume,[],this._worker),this},pause:function(){return this._worker.pause(),this},toNodejsStream:function(e){if(r.checkSupport(`nodestream`),this._outputType!==`nodebuffer`)throw Error(this._outputType+` is not supported by this method`);return new l(this,{objectMode:this._outputType!==`nodebuffer`},e)}},t.exports=d},{"../base64":1,"../external":6,"../nodejs/NodejsStreamOutputAdapter":13,"../support":30,"../utils":32,"./ConvertWorker":24,"./GenericWorker":28}],30:[function(e,t,n){if(n.base64=!0,n.array=!0,n.string=!0,n.arraybuffer=typeof ArrayBuffer<`u`&&typeof Uint8Array<`u`,n.nodebuffer=typeof Buffer<`u`,n.uint8array=typeof Uint8Array<`u`,typeof ArrayBuffer>`u`)n.blob=!1;else{var r=new ArrayBuffer(0);try{n.blob=new Blob([r],{type:`application/zip`}).size===0}catch{try{var i=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);i.append(r),n.blob=i.getBlob(`application/zip`).size===0}catch{n.blob=!1}}}try{n.nodestream=!!e(`readable-stream`).Readable}catch{n.nodestream=!1}},{"readable-stream":16}],31:[function(e,t,n){for(var r=e(`./utils`),i=e(`./support`),a=e(`./nodejsUtils`),o=e(`./stream/GenericWorker`),s=Array(256),c=0;c<256;c++)s[c]=252<=c?6:248<=c?5:240<=c?4:224<=c?3:192<=c?2:1;s[254]=s[254]=1;function l(){o.call(this,`utf-8 decode`),this.leftOver=null}function u(){o.call(this,`utf-8 encode`)}n.utf8encode=function(e){return i.nodebuffer?a.newBufferFrom(e,`utf-8`):function(e){var t,n,r,a,o,s=e.length,c=0;for(a=0;a<s;a++)(64512&(n=e.charCodeAt(a)))==55296&&a+1<s&&(64512&(r=e.charCodeAt(a+1)))==56320&&(n=65536+(n-55296<<10)+(r-56320),a++),c+=n<128?1:n<2048?2:n<65536?3:4;for(t=i.uint8array?new Uint8Array(c):Array(c),a=o=0;o<c;a++)(64512&(n=e.charCodeAt(a)))==55296&&a+1<s&&(64512&(r=e.charCodeAt(a+1)))==56320&&(n=65536+(n-55296<<10)+(r-56320),a++),n<128?t[o++]=n:(n<2048?t[o++]=192|n>>>6:(n<65536?t[o++]=224|n>>>12:(t[o++]=240|n>>>18,t[o++]=128|n>>>12&63),t[o++]=128|n>>>6&63),t[o++]=128|63&n);return t}(e)},n.utf8decode=function(e){return i.nodebuffer?r.transformTo(`nodebuffer`,e).toString(`utf-8`):function(e){var t,n,i,a,o=e.length,c=Array(2*o);for(t=n=0;t<o;)if((i=e[t++])<128)c[n++]=i;else if(4<(a=s[i]))c[n++]=65533,t+=a-1;else{for(i&=a===2?31:a===3?15:7;1<a&&t<o;)i=i<<6|63&e[t++],a--;1<a?c[n++]=65533:i<65536?c[n++]=i:(i-=65536,c[n++]=55296|i>>10&1023,c[n++]=56320|1023&i)}return c.length!==n&&(c.subarray?c=c.subarray(0,n):c.length=n),r.applyFromCharCode(c)}(e=r.transformTo(i.uint8array?`uint8array`:`array`,e))},r.inherits(l,o),l.prototype.processChunk=function(e){var t=r.transformTo(i.uint8array?`uint8array`:`array`,e.data);if(this.leftOver&&this.leftOver.length){if(i.uint8array){var a=t;(t=new Uint8Array(a.length+this.leftOver.length)).set(this.leftOver,0),t.set(a,this.leftOver.length)}else t=this.leftOver.concat(t);this.leftOver=null}var o=function(e,t){var n;for((t||=e.length)>e.length&&(t=e.length),n=t-1;0<=n&&(192&e[n])==128;)n--;return n<0||n===0?t:n+s[e[n]]>t?n:t}(t),c=t;o!==t.length&&(i.uint8array?(c=t.subarray(0,o),this.leftOver=t.subarray(o,t.length)):(c=t.slice(0,o),this.leftOver=t.slice(o,t.length))),this.push({data:n.utf8decode(c),meta:e.meta})},l.prototype.flush=function(){this.leftOver&&this.leftOver.length&&(this.push({data:n.utf8decode(this.leftOver),meta:{}}),this.leftOver=null)},n.Utf8DecodeWorker=l,r.inherits(u,o),u.prototype.processChunk=function(e){this.push({data:n.utf8encode(e.data),meta:e.meta})},n.Utf8EncodeWorker=u},{"./nodejsUtils":14,"./stream/GenericWorker":28,"./support":30,"./utils":32}],32:[function(e,t,n){var r=e(`./support`),i=e(`./base64`),a=e(`./nodejsUtils`),o=e(`./external`);function s(e){return e}function c(e,t){for(var n=0;n<e.length;++n)t[n]=255&e.charCodeAt(n);return t}e(`setimmediate`),n.newBlob=function(e,t){n.checkSupport(`blob`);try{return new Blob([e],{type:t})}catch{try{var r=new(self.BlobBuilder||self.WebKitBlobBuilder||self.MozBlobBuilder||self.MSBlobBuilder);return r.append(e),r.getBlob(t)}catch{throw Error(`Bug : can't construct the Blob.`)}}};var l={stringifyByChunk:function(e,t,n){var r=[],i=0,a=e.length;if(a<=n)return String.fromCharCode.apply(null,e);for(;i<a;)t===`array`||t===`nodebuffer`?r.push(String.fromCharCode.apply(null,e.slice(i,Math.min(i+n,a)))):r.push(String.fromCharCode.apply(null,e.subarray(i,Math.min(i+n,a)))),i+=n;return r.join(``)},stringifyByChar:function(e){for(var t=``,n=0;n<e.length;n++)t+=String.fromCharCode(e[n]);return t},applyCanBeUsed:{uint8array:function(){try{return r.uint8array&&String.fromCharCode.apply(null,new Uint8Array(1)).length===1}catch{return!1}}(),nodebuffer:function(){try{return r.nodebuffer&&String.fromCharCode.apply(null,a.allocBuffer(1)).length===1}catch{return!1}}()}};function u(e){var t=65536,r=n.getTypeOf(e),i=!0;if(r===`uint8array`?i=l.applyCanBeUsed.uint8array:r===`nodebuffer`&&(i=l.applyCanBeUsed.nodebuffer),i)for(;1<t;)try{return l.stringifyByChunk(e,r,t)}catch{t=Math.floor(t/2)}return l.stringifyByChar(e)}function d(e,t){for(var n=0;n<e.length;n++)t[n]=e[n];return t}n.applyFromCharCode=u;var f={};f.string={string:s,array:function(e){return c(e,Array(e.length))},arraybuffer:function(e){return f.string.uint8array(e).buffer},uint8array:function(e){return c(e,new Uint8Array(e.length))},nodebuffer:function(e){return c(e,a.allocBuffer(e.length))}},f.array={string:u,array:s,arraybuffer:function(e){return new Uint8Array(e).buffer},uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return a.newBufferFrom(e)}},f.arraybuffer={string:function(e){return u(new Uint8Array(e))},array:function(e){return d(new Uint8Array(e),Array(e.byteLength))},arraybuffer:s,uint8array:function(e){return new Uint8Array(e)},nodebuffer:function(e){return a.newBufferFrom(new Uint8Array(e))}},f.uint8array={string:u,array:function(e){return d(e,Array(e.length))},arraybuffer:function(e){return e.buffer},uint8array:s,nodebuffer:function(e){return a.newBufferFrom(e)}},f.nodebuffer={string:u,array:function(e){return d(e,Array(e.length))},arraybuffer:function(e){return f.nodebuffer.uint8array(e).buffer},uint8array:function(e){return d(e,new Uint8Array(e.length))},nodebuffer:s},n.transformTo=function(e,t){return t||=``,e?(n.checkSupport(e),f[n.getTypeOf(t)][e](t)):t},n.resolve=function(e){for(var t=e.split(`/`),n=[],r=0;r<t.length;r++){var i=t[r];i===`.`||i===``&&r!==0&&r!==t.length-1||(i===`..`?n.pop():n.push(i))}return n.join(`/`)},n.getTypeOf=function(e){if(typeof e==`string`)return`string`;var t=Object.prototype.toString.call(e);return t===`[object Array]`?`array`:r.nodebuffer&&a.isBuffer(e)?`nodebuffer`:r.uint8array&&t===`[object Uint8Array]`?`uint8array`:r.arraybuffer&&t===`[object ArrayBuffer]`?`arraybuffer`:void 0},n.checkSupport=function(e){if(!r[e.toLowerCase()])throw Error(e+` is not supported by this platform`)},n.MAX_VALUE_16BITS=65535,n.MAX_VALUE_32BITS=-1,n.pretty=function(e){var t,n,r=``;for(n=0;n<(e||``).length;n++)r+=`\\x`+((t=e.charCodeAt(n))<16?`0`:``)+t.toString(16).toUpperCase();return r},n.delay=function(e,t,n){setImmediate(function(){e.apply(n||null,t||[])})},n.inherits=function(e,t){function n(){}n.prototype=t.prototype,e.prototype=new n},n.extend=function(){var e,t,n={};for(e=0;e<arguments.length;e++)for(t in arguments[e])Object.prototype.hasOwnProperty.call(arguments[e],t)&&n[t]===void 0&&(n[t]=arguments[e][t]);return n},n.prepareContent=function(e,t,a,s,l){return o.Promise.resolve(t).then(function(t){return r.blob&&(t instanceof Blob||[`[object File]`,`[object Blob]`].indexOf(Object.prototype.toString.call(t))!==-1)?Blob.prototype.arrayBuffer===void 0?typeof FileReader<`u`?new o.Promise(function(e,n){var r=new FileReader;r.onload=function(t){e(t.target.result)},r.onerror=function(e){n(e.target.error)},r.readAsArrayBuffer(t)}):o.Promise.reject(Error(e+` is a Blob, but we have no way of reading it.`)):t.arrayBuffer():t}).then(function(t){var u=n.getTypeOf(t);return u?(u===`arraybuffer`?t=n.transformTo(`uint8array`,t):u===`string`&&(l?t=i.decode(t):a&&!0!==s&&(t=function(e){return c(e,r.uint8array?new Uint8Array(e.length):Array(e.length))}(t))),t):o.Promise.reject(Error(`Can't read the data of '`+e+`'. Is it in a supported JavaScript type (String, Blob, ArrayBuffer, etc) ?`))})}},{"./base64":1,"./external":6,"./nodejsUtils":14,"./support":30,setimmediate:54}],33:[function(e,t,n){var r=e(`./reader/readerFor`),i=e(`./utils`),a=e(`./signature`),o=e(`./zipEntry`),s=e(`./support`);function c(e){this.files=[],this.loadOptions=e}c.prototype={checkSignature:function(e){if(!this.reader.readAndCheckSignature(e)){this.reader.index-=4;var t=this.reader.readString(4);throw Error(`Corrupted zip or bug: unexpected signature (`+i.pretty(t)+`, expected `+i.pretty(e)+`)`)}},isSignature:function(e,t){var n=this.reader.index;this.reader.setIndex(e);var r=this.reader.readString(4)===t;return this.reader.setIndex(n),r},readBlockEndOfCentral:function(){this.diskNumber=this.reader.readInt(2),this.diskWithCentralDirStart=this.reader.readInt(2),this.centralDirRecordsOnThisDisk=this.reader.readInt(2),this.centralDirRecords=this.reader.readInt(2),this.centralDirSize=this.reader.readInt(4),this.centralDirOffset=this.reader.readInt(4),this.zipCommentLength=this.reader.readInt(2);var e=this.reader.readData(this.zipCommentLength),t=s.uint8array?`uint8array`:`array`,n=i.transformTo(t,e);this.zipComment=this.loadOptions.decodeFileName(n)},readBlockZip64EndOfCentral:function(){this.zip64EndOfCentralSize=this.reader.readInt(8),this.reader.skip(4),this.diskNumber=this.reader.readInt(4),this.diskWithCentralDirStart=this.reader.readInt(4),this.centralDirRecordsOnThisDisk=this.reader.readInt(8),this.centralDirRecords=this.reader.readInt(8),this.centralDirSize=this.reader.readInt(8),this.centralDirOffset=this.reader.readInt(8),this.zip64ExtensibleData={};for(var e,t,n,r=this.zip64EndOfCentralSize-44;0<r;)e=this.reader.readInt(2),t=this.reader.readInt(4),n=this.reader.readData(t),this.zip64ExtensibleData[e]={id:e,length:t,value:n}},readBlockZip64EndOfCentralLocator:function(){if(this.diskWithZip64CentralDirStart=this.reader.readInt(4),this.relativeOffsetEndOfZip64CentralDir=this.reader.readInt(8),this.disksCount=this.reader.readInt(4),1<this.disksCount)throw Error(`Multi-volumes zip are not supported`)},readLocalFiles:function(){for(var e=0,t;e<this.files.length;e++)t=this.files[e],this.reader.setIndex(t.localHeaderOffset),this.checkSignature(a.LOCAL_FILE_HEADER),t.readLocalPart(this.reader),t.handleUTF8(),t.processAttributes()},readCentralDir:function(){var e;for(this.reader.setIndex(this.centralDirOffset);this.reader.readAndCheckSignature(a.CENTRAL_FILE_HEADER);)(e=new o({zip64:this.zip64},this.loadOptions)).readCentralPart(this.reader),this.files.push(e);if(this.centralDirRecords!==this.files.length&&this.centralDirRecords!==0&&this.files.length===0)throw Error(`Corrupted zip or bug: expected `+this.centralDirRecords+` records in central dir, got `+this.files.length)},readEndOfCentral:function(){var e=this.reader.lastIndexOfSignature(a.CENTRAL_DIRECTORY_END);if(e<0)throw this.isSignature(0,a.LOCAL_FILE_HEADER)?Error(`Corrupted zip: can't find end of central directory`):Error(`Can't find end of central directory : is this a zip file ? If it is, see https://stuk.github.io/jszip/documentation/howto/read_zip.html`);this.reader.setIndex(e);var t=e;if(this.checkSignature(a.CENTRAL_DIRECTORY_END),this.readBlockEndOfCentral(),this.diskNumber===i.MAX_VALUE_16BITS||this.diskWithCentralDirStart===i.MAX_VALUE_16BITS||this.centralDirRecordsOnThisDisk===i.MAX_VALUE_16BITS||this.centralDirRecords===i.MAX_VALUE_16BITS||this.centralDirSize===i.MAX_VALUE_32BITS||this.centralDirOffset===i.MAX_VALUE_32BITS){if(this.zip64=!0,(e=this.reader.lastIndexOfSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR))<0)throw Error(`Corrupted zip: can't find the ZIP64 end of central directory locator`);if(this.reader.setIndex(e),this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_LOCATOR),this.readBlockZip64EndOfCentralLocator(),!this.isSignature(this.relativeOffsetEndOfZip64CentralDir,a.ZIP64_CENTRAL_DIRECTORY_END)&&(this.relativeOffsetEndOfZip64CentralDir=this.reader.lastIndexOfSignature(a.ZIP64_CENTRAL_DIRECTORY_END),this.relativeOffsetEndOfZip64CentralDir<0))throw Error(`Corrupted zip: can't find the ZIP64 end of central directory`);this.reader.setIndex(this.relativeOffsetEndOfZip64CentralDir),this.checkSignature(a.ZIP64_CENTRAL_DIRECTORY_END),this.readBlockZip64EndOfCentral()}var n=this.centralDirOffset+this.centralDirSize;this.zip64&&(n+=20,n+=12+this.zip64EndOfCentralSize);var r=t-n;if(0<r)this.isSignature(t,a.CENTRAL_FILE_HEADER)||(this.reader.zero=r);else if(r<0)throw Error(`Corrupted zip: missing `+Math.abs(r)+` bytes.`)},prepareReader:function(e){this.reader=r(e)},load:function(e){this.prepareReader(e),this.readEndOfCentral(),this.readCentralDir(),this.readLocalFiles()}},t.exports=c},{"./reader/readerFor":22,"./signature":23,"./support":30,"./utils":32,"./zipEntry":34}],34:[function(e,t,n){var r=e(`./reader/readerFor`),i=e(`./utils`),a=e(`./compressedObject`),o=e(`./crc32`),s=e(`./utf8`),c=e(`./compressions`),l=e(`./support`);function u(e,t){this.options=e,this.loadOptions=t}u.prototype={isEncrypted:function(){return(1&this.bitFlag)==1},useUTF8:function(){return(2048&this.bitFlag)==2048},readLocalPart:function(e){var t,n;if(e.skip(22),this.fileNameLength=e.readInt(2),n=e.readInt(2),this.fileName=e.readData(this.fileNameLength),e.skip(n),this.compressedSize===-1||this.uncompressedSize===-1)throw Error(`Bug or corrupted zip : didn't get enough information from the central directory (compressedSize === -1 || uncompressedSize === -1)`);if((t=function(e){for(var t in c)if(Object.prototype.hasOwnProperty.call(c,t)&&c[t].magic===e)return c[t];return null}(this.compressionMethod))===null)throw Error(`Corrupted zip : compression `+i.pretty(this.compressionMethod)+` unknown (inner file : `+i.transformTo(`string`,this.fileName)+`)`);this.decompressed=new a(this.compressedSize,this.uncompressedSize,this.crc32,t,e.readData(this.compressedSize))},readCentralPart:function(e){this.versionMadeBy=e.readInt(2),e.skip(2),this.bitFlag=e.readInt(2),this.compressionMethod=e.readString(2),this.date=e.readDate(),this.crc32=e.readInt(4),this.compressedSize=e.readInt(4),this.uncompressedSize=e.readInt(4);var t=e.readInt(2);if(this.extraFieldsLength=e.readInt(2),this.fileCommentLength=e.readInt(2),this.diskNumberStart=e.readInt(2),this.internalFileAttributes=e.readInt(2),this.externalFileAttributes=e.readInt(4),this.localHeaderOffset=e.readInt(4),this.isEncrypted())throw Error(`Encrypted zip are not supported`);e.skip(t),this.readExtraFields(e),this.parseZIP64ExtraField(e),this.fileComment=e.readData(this.fileCommentLength)},processAttributes:function(){this.unixPermissions=null,this.dosPermissions=null;var e=this.versionMadeBy>>8;this.dir=!!(16&this.externalFileAttributes),e==0&&(this.dosPermissions=63&this.externalFileAttributes),e==3&&(this.unixPermissions=this.externalFileAttributes>>16&65535),this.dir||this.fileNameStr.slice(-1)!==`/`||(this.dir=!0)},parseZIP64ExtraField:function(){if(this.extraFields[1]){var e=r(this.extraFields[1].value);this.uncompressedSize===i.MAX_VALUE_32BITS&&(this.uncompressedSize=e.readInt(8)),this.compressedSize===i.MAX_VALUE_32BITS&&(this.compressedSize=e.readInt(8)),this.localHeaderOffset===i.MAX_VALUE_32BITS&&(this.localHeaderOffset=e.readInt(8)),this.diskNumberStart===i.MAX_VALUE_32BITS&&(this.diskNumberStart=e.readInt(4))}},readExtraFields:function(e){var t,n,r,i=e.index+this.extraFieldsLength;for(this.extraFields||={};e.index+4<i;)t=e.readInt(2),n=e.readInt(2),r=e.readData(n),this.extraFields[t]={id:t,length:n,value:r};e.setIndex(i)},handleUTF8:function(){var e=l.uint8array?`uint8array`:`array`;if(this.useUTF8())this.fileNameStr=s.utf8decode(this.fileName),this.fileCommentStr=s.utf8decode(this.fileComment);else{var t=this.findExtraFieldUnicodePath();if(t!==null)this.fileNameStr=t;else{var n=i.transformTo(e,this.fileName);this.fileNameStr=this.loadOptions.decodeFileName(n)}var r=this.findExtraFieldUnicodeComment();if(r!==null)this.fileCommentStr=r;else{var a=i.transformTo(e,this.fileComment);this.fileCommentStr=this.loadOptions.decodeFileName(a)}}},findExtraFieldUnicodePath:function(){var e=this.extraFields[28789];if(e){var t=r(e.value);return t.readInt(1)===1&&o(this.fileName)===t.readInt(4)?s.utf8decode(t.readData(e.length-5)):null}return null},findExtraFieldUnicodeComment:function(){var e=this.extraFields[25461];if(e){var t=r(e.value);return t.readInt(1)===1&&o(this.fileComment)===t.readInt(4)?s.utf8decode(t.readData(e.length-5)):null}return null}},t.exports=u},{"./compressedObject":2,"./compressions":3,"./crc32":4,"./reader/readerFor":22,"./support":30,"./utf8":31,"./utils":32}],35:[function(e,t,n){function r(e,t,n){this.name=e,this.dir=n.dir,this.date=n.date,this.comment=n.comment,this.unixPermissions=n.unixPermissions,this.dosPermissions=n.dosPermissions,this._data=t,this._dataBinary=n.binary,this.options={compression:n.compression,compressionOptions:n.compressionOptions}}var i=e(`./stream/StreamHelper`),a=e(`./stream/DataWorker`),o=e(`./utf8`),s=e(`./compressedObject`),c=e(`./stream/GenericWorker`);r.prototype={internalStream:function(e){var t=null,n=`string`;try{if(!e)throw Error(`No output type specified.`);var r=(n=e.toLowerCase())===`string`||n===`text`;n!==`binarystring`&&n!==`text`||(n=`string`),t=this._decompressWorker();var a=!this._dataBinary;a&&!r&&(t=t.pipe(new o.Utf8EncodeWorker)),!a&&r&&(t=t.pipe(new o.Utf8DecodeWorker))}catch(e){(t=new c(`error`)).error(e)}return new i(t,n,``)},async:function(e,t){return this.internalStream(e).accumulate(t)},nodeStream:function(e,t){return this.internalStream(e||`nodebuffer`).toNodejsStream(t)},_compressWorker:function(e,t){if(this._data instanceof s&&this._data.compression.magic===e.magic)return this._data.getCompressedWorker();var n=this._decompressWorker();return this._dataBinary||(n=n.pipe(new o.Utf8EncodeWorker)),s.createWorkerFrom(n,e,t)},_decompressWorker:function(){return this._data instanceof s?this._data.getContentWorker():this._data instanceof c?this._data:new a(this._data)}};for(var l=[`asText`,`asBinary`,`asNodeBuffer`,`asUint8Array`,`asArrayBuffer`],u=function(){throw Error(`This method has been removed in JSZip 3.0, please check the upgrade guide.`)},d=0;d<l.length;d++)r.prototype[l[d]]=u;t.exports=r},{"./compressedObject":2,"./stream/DataWorker":27,"./stream/GenericWorker":28,"./stream/StreamHelper":29,"./utf8":31}],36:[function(e,t,n){(function(e){var n,r,i=e.MutationObserver||e.WebKitMutationObserver;if(i){var a=0,o=new i(u),s=e.document.createTextNode(``);o.observe(s,{characterData:!0}),n=function(){s.data=a=++a%2}}else if(e.setImmediate||e.MessageChannel===void 0)n=`document`in e&&`onreadystatechange`in e.document.createElement(`script`)?function(){var t=e.document.createElement(`script`);t.onreadystatechange=function(){u(),t.onreadystatechange=null,t.parentNode.removeChild(t),t=null},e.document.documentElement.appendChild(t)}:function(){setTimeout(u,0)};else{var c=new e.MessageChannel;c.port1.onmessage=u,n=function(){c.port2.postMessage(0)}}var l=[];function u(){var e,t;r=!0;for(var n=l.length;n;){for(t=l,l=[],e=-1;++e<n;)t[e]();n=l.length}r=!1}t.exports=function(e){l.push(e)!==1||r||n()}}).call(this,typeof global<`u`?global:typeof self<`u`?self:typeof window<`u`?window:{})},{}],37:[function(e,t,n){var r=e(`immediate`);function i(){}var a={},o=[`REJECTED`],s=[`FULFILLED`],c=[`PENDING`];function l(e){if(typeof e!=`function`)throw TypeError(`resolver must be a function`);this.state=c,this.queue=[],this.outcome=void 0,e!==i&&p(this,e)}function u(e,t,n){this.promise=e,typeof t==`function`&&(this.onFulfilled=t,this.callFulfilled=this.otherCallFulfilled),typeof n==`function`&&(this.onRejected=n,this.callRejected=this.otherCallRejected)}function d(e,t,n){r(function(){var r;try{r=t(n)}catch(t){return a.reject(e,t)}r===e?a.reject(e,TypeError(`Cannot resolve promise with itself`)):a.resolve(e,r)})}function f(e){var t=e&&e.then;if(e&&(typeof e==`object`||typeof e==`function`)&&typeof t==`function`)return function(){t.apply(e,arguments)}}function p(e,t){var n=!1;function r(t){n||(n=!0,a.reject(e,t))}function i(t){n||(n=!0,a.resolve(e,t))}var o=m(function(){t(i,r)});o.status===`error`&&r(o.value)}function m(e,t){var n={};try{n.value=e(t),n.status=`success`}catch(e){n.status=`error`,n.value=e}return n}(t.exports=l).prototype.finally=function(e){if(typeof e!=`function`)return this;var t=this.constructor;return this.then(function(n){return t.resolve(e()).then(function(){return n})},function(n){return t.resolve(e()).then(function(){throw n})})},l.prototype.catch=function(e){return this.then(null,e)},l.prototype.then=function(e,t){if(typeof e!=`function`&&this.state===s||typeof t!=`function`&&this.state===o)return this;var n=new this.constructor(i);return this.state===c?this.queue.push(new u(n,e,t)):d(n,this.state===s?e:t,this.outcome),n},u.prototype.callFulfilled=function(e){a.resolve(this.promise,e)},u.prototype.otherCallFulfilled=function(e){d(this.promise,this.onFulfilled,e)},u.prototype.callRejected=function(e){a.reject(this.promise,e)},u.prototype.otherCallRejected=function(e){d(this.promise,this.onRejected,e)},a.resolve=function(e,t){var n=m(f,t);if(n.status===`error`)return a.reject(e,n.value);var r=n.value;if(r)p(e,r);else{e.state=s,e.outcome=t;for(var i=-1,o=e.queue.length;++i<o;)e.queue[i].callFulfilled(t)}return e},a.reject=function(e,t){e.state=o,e.outcome=t;for(var n=-1,r=e.queue.length;++n<r;)e.queue[n].callRejected(t);return e},l.resolve=function(e){return e instanceof this?e:a.resolve(new this(i),e)},l.reject=function(e){var t=new this(i);return a.reject(t,e)},l.all=function(e){var t=this;if(Object.prototype.toString.call(e)!==`[object Array]`)return this.reject(TypeError(`must be an array`));var n=e.length,r=!1;if(!n)return this.resolve([]);for(var o=Array(n),s=0,c=-1,l=new this(i);++c<n;)u(e[c],c);return l;function u(e,i){t.resolve(e).then(function(e){o[i]=e,++s!==n||r||(r=!0,a.resolve(l,o))},function(e){r||(r=!0,a.reject(l,e))})}},l.race=function(e){var t=this;if(Object.prototype.toString.call(e)!==`[object Array]`)return this.reject(TypeError(`must be an array`));var n=e.length,r=!1;if(!n)return this.resolve([]);for(var o=-1,s=new this(i);++o<n;)c=e[o],t.resolve(c).then(function(e){r||(r=!0,a.resolve(s,e))},function(e){r||(r=!0,a.reject(s,e))});var c;return s}},{immediate:36}],38:[function(e,t,n){var r={};(0,e(`./lib/utils/common`).assign)(r,e(`./lib/deflate`),e(`./lib/inflate`),e(`./lib/zlib/constants`)),t.exports=r},{"./lib/deflate":39,"./lib/inflate":40,"./lib/utils/common":41,"./lib/zlib/constants":44}],39:[function(e,t,n){var r=e(`./zlib/deflate`),i=e(`./utils/common`),a=e(`./utils/strings`),o=e(`./zlib/messages`),s=e(`./zlib/zstream`),c=Object.prototype.toString,l=0,u=-1,d=0,f=8;function p(e){if(!(this instanceof p))return new p(e);this.options=i.assign({level:u,method:f,chunkSize:16384,windowBits:15,memLevel:8,strategy:d,to:``},e||{});var t=this.options;t.raw&&0<t.windowBits?t.windowBits=-t.windowBits:t.gzip&&0<t.windowBits&&t.windowBits<16&&(t.windowBits+=16),this.err=0,this.msg=``,this.ended=!1,this.chunks=[],this.strm=new s,this.strm.avail_out=0;var n=r.deflateInit2(this.strm,t.level,t.method,t.windowBits,t.memLevel,t.strategy);if(n!==l)throw Error(o[n]);if(t.header&&r.deflateSetHeader(this.strm,t.header),t.dictionary){var m=typeof t.dictionary==`string`?a.string2buf(t.dictionary):c.call(t.dictionary)===`[object ArrayBuffer]`?new Uint8Array(t.dictionary):t.dictionary;if((n=r.deflateSetDictionary(this.strm,m))!==l)throw Error(o[n]);this._dict_set=!0}}function m(e,t){var n=new p(t);if(n.push(e,!0),n.err)throw n.msg||o[n.err];return n.result}p.prototype.push=function(e,t){var n,o,s=this.strm,u=this.options.chunkSize;if(this.ended)return!1;o=t===~~t?t:!0===t?4:0,s.input=typeof e==`string`?a.string2buf(e):c.call(e)===`[object ArrayBuffer]`?new Uint8Array(e):e,s.next_in=0,s.avail_in=s.input.length;do{if(s.avail_out===0&&(s.output=new i.Buf8(u),s.next_out=0,s.avail_out=u),(n=r.deflate(s,o))!==1&&n!==l)return this.onEnd(n),!(this.ended=!0);s.avail_out!==0&&(s.avail_in!==0||o!==4&&o!==2)||(this.options.to===`string`?this.onData(a.buf2binstring(i.shrinkBuf(s.output,s.next_out))):this.onData(i.shrinkBuf(s.output,s.next_out)))}while((0<s.avail_in||s.avail_out===0)&&n!==1);return o===4?(n=r.deflateEnd(this.strm),this.onEnd(n),this.ended=!0,n===l):o!==2||(this.onEnd(l),!(s.avail_out=0))},p.prototype.onData=function(e){this.chunks.push(e)},p.prototype.onEnd=function(e){e===l&&(this.result=this.options.to===`string`?this.chunks.join(``):i.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},n.Deflate=p,n.deflate=m,n.deflateRaw=function(e,t){return(t||={}).raw=!0,m(e,t)},n.gzip=function(e,t){return(t||={}).gzip=!0,m(e,t)}},{"./utils/common":41,"./utils/strings":42,"./zlib/deflate":46,"./zlib/messages":51,"./zlib/zstream":53}],40:[function(e,t,n){var r=e(`./zlib/inflate`),i=e(`./utils/common`),a=e(`./utils/strings`),o=e(`./zlib/constants`),s=e(`./zlib/messages`),c=e(`./zlib/zstream`),l=e(`./zlib/gzheader`),u=Object.prototype.toString;function d(e){if(!(this instanceof d))return new d(e);this.options=i.assign({chunkSize:16384,windowBits:0,to:``},e||{});var t=this.options;t.raw&&0<=t.windowBits&&t.windowBits<16&&(t.windowBits=-t.windowBits,t.windowBits===0&&(t.windowBits=-15)),!(0<=t.windowBits&&t.windowBits<16)||e&&e.windowBits||(t.windowBits+=32),15<t.windowBits&&t.windowBits<48&&!(15&t.windowBits)&&(t.windowBits|=15),this.err=0,this.msg=``,this.ended=!1,this.chunks=[],this.strm=new c,this.strm.avail_out=0;var n=r.inflateInit2(this.strm,t.windowBits);if(n!==o.Z_OK)throw Error(s[n]);this.header=new l,r.inflateGetHeader(this.strm,this.header)}function f(e,t){var n=new d(t);if(n.push(e,!0),n.err)throw n.msg||s[n.err];return n.result}d.prototype.push=function(e,t){var n,s,c,l,d,f,p=this.strm,m=this.options.chunkSize,h=this.options.dictionary,g=!1;if(this.ended)return!1;s=t===~~t?t:!0===t?o.Z_FINISH:o.Z_NO_FLUSH,p.input=typeof e==`string`?a.binstring2buf(e):u.call(e)===`[object ArrayBuffer]`?new Uint8Array(e):e,p.next_in=0,p.avail_in=p.input.length;do{if(p.avail_out===0&&(p.output=new i.Buf8(m),p.next_out=0,p.avail_out=m),(n=r.inflate(p,o.Z_NO_FLUSH))===o.Z_NEED_DICT&&h&&(f=typeof h==`string`?a.string2buf(h):u.call(h)===`[object ArrayBuffer]`?new Uint8Array(h):h,n=r.inflateSetDictionary(this.strm,f)),n===o.Z_BUF_ERROR&&!0===g&&(n=o.Z_OK,g=!1),n!==o.Z_STREAM_END&&n!==o.Z_OK)return this.onEnd(n),!(this.ended=!0);p.next_out&&(p.avail_out!==0&&n!==o.Z_STREAM_END&&(p.avail_in!==0||s!==o.Z_FINISH&&s!==o.Z_SYNC_FLUSH)||(this.options.to===`string`?(c=a.utf8border(p.output,p.next_out),l=p.next_out-c,d=a.buf2string(p.output,c),p.next_out=l,p.avail_out=m-l,l&&i.arraySet(p.output,p.output,c,l,0),this.onData(d)):this.onData(i.shrinkBuf(p.output,p.next_out)))),p.avail_in===0&&p.avail_out===0&&(g=!0)}while((0<p.avail_in||p.avail_out===0)&&n!==o.Z_STREAM_END);return n===o.Z_STREAM_END&&(s=o.Z_FINISH),s===o.Z_FINISH?(n=r.inflateEnd(this.strm),this.onEnd(n),this.ended=!0,n===o.Z_OK):s!==o.Z_SYNC_FLUSH||(this.onEnd(o.Z_OK),!(p.avail_out=0))},d.prototype.onData=function(e){this.chunks.push(e)},d.prototype.onEnd=function(e){e===o.Z_OK&&(this.result=this.options.to===`string`?this.chunks.join(``):i.flattenChunks(this.chunks)),this.chunks=[],this.err=e,this.msg=this.strm.msg},n.Inflate=d,n.inflate=f,n.inflateRaw=function(e,t){return(t||={}).raw=!0,f(e,t)},n.ungzip=f},{"./utils/common":41,"./utils/strings":42,"./zlib/constants":44,"./zlib/gzheader":47,"./zlib/inflate":49,"./zlib/messages":51,"./zlib/zstream":53}],41:[function(e,t,n){var r=typeof Uint8Array<`u`&&typeof Uint16Array<`u`&&typeof Int32Array<`u`;n.assign=function(e){for(var t=Array.prototype.slice.call(arguments,1);t.length;){var n=t.shift();if(n){if(typeof n!=`object`)throw TypeError(n+`must be non-object`);for(var r in n)n.hasOwnProperty(r)&&(e[r]=n[r])}}return e},n.shrinkBuf=function(e,t){return e.length===t?e:e.subarray?e.subarray(0,t):(e.length=t,e)};var i={arraySet:function(e,t,n,r,i){if(t.subarray&&e.subarray)e.set(t.subarray(n,n+r),i);else for(var a=0;a<r;a++)e[i+a]=t[n+a]},flattenChunks:function(e){for(var t=r=0,n=e.length,r,i,a,o;t<n;t++)r+=e[t].length;for(o=new Uint8Array(r),t=i=0,n=e.length;t<n;t++)a=e[t],o.set(a,i),i+=a.length;return o}},a={arraySet:function(e,t,n,r,i){for(var a=0;a<r;a++)e[i+a]=t[n+a]},flattenChunks:function(e){return[].concat.apply([],e)}};n.setTyped=function(e){e?(n.Buf8=Uint8Array,n.Buf16=Uint16Array,n.Buf32=Int32Array,n.assign(n,i)):(n.Buf8=Array,n.Buf16=Array,n.Buf32=Array,n.assign(n,a))},n.setTyped(r)},{}],42:[function(e,t,n){var r=e(`./common`),i=!0,a=!0;try{String.fromCharCode.apply(null,[0])}catch{i=!1}try{String.fromCharCode.apply(null,new Uint8Array(1))}catch{a=!1}for(var o=new r.Buf8(256),s=0;s<256;s++)o[s]=252<=s?6:248<=s?5:240<=s?4:224<=s?3:192<=s?2:1;function c(e,t){if(t<65537&&(e.subarray&&a||!e.subarray&&i))return String.fromCharCode.apply(null,r.shrinkBuf(e,t));for(var n=``,o=0;o<t;o++)n+=String.fromCharCode(e[o]);return n}o[254]=o[254]=1,n.string2buf=function(e){var t,n,i,a,o,s=e.length,c=0;for(a=0;a<s;a++)(64512&(n=e.charCodeAt(a)))==55296&&a+1<s&&(64512&(i=e.charCodeAt(a+1)))==56320&&(n=65536+(n-55296<<10)+(i-56320),a++),c+=n<128?1:n<2048?2:n<65536?3:4;for(t=new r.Buf8(c),a=o=0;o<c;a++)(64512&(n=e.charCodeAt(a)))==55296&&a+1<s&&(64512&(i=e.charCodeAt(a+1)))==56320&&(n=65536+(n-55296<<10)+(i-56320),a++),n<128?t[o++]=n:(n<2048?t[o++]=192|n>>>6:(n<65536?t[o++]=224|n>>>12:(t[o++]=240|n>>>18,t[o++]=128|n>>>12&63),t[o++]=128|n>>>6&63),t[o++]=128|63&n);return t},n.buf2binstring=function(e){return c(e,e.length)},n.binstring2buf=function(e){for(var t=new r.Buf8(e.length),n=0,i=t.length;n<i;n++)t[n]=e.charCodeAt(n);return t},n.buf2string=function(e,t){var n,r,i,a,s=t||e.length,l=Array(2*s);for(n=r=0;n<s;)if((i=e[n++])<128)l[r++]=i;else if(4<(a=o[i]))l[r++]=65533,n+=a-1;else{for(i&=a===2?31:a===3?15:7;1<a&&n<s;)i=i<<6|63&e[n++],a--;1<a?l[r++]=65533:i<65536?l[r++]=i:(i-=65536,l[r++]=55296|i>>10&1023,l[r++]=56320|1023&i)}return c(l,r)},n.utf8border=function(e,t){var n;for((t||=e.length)>e.length&&(t=e.length),n=t-1;0<=n&&(192&e[n])==128;)n--;return n<0||n===0?t:n+o[e[n]]>t?n:t}},{"./common":41}],43:[function(e,t,n){t.exports=function(e,t,n,r){for(var i=65535&e,a=e>>>16&65535,o=0;n!==0;){for(n-=o=2e3<n?2e3:n;a=a+(i=i+t[r++]|0)|0,--o;);i%=65521,a%=65521}return i|a<<16}},{}],44:[function(e,t,n){t.exports={Z_NO_FLUSH:0,Z_PARTIAL_FLUSH:1,Z_SYNC_FLUSH:2,Z_FULL_FLUSH:3,Z_FINISH:4,Z_BLOCK:5,Z_TREES:6,Z_OK:0,Z_STREAM_END:1,Z_NEED_DICT:2,Z_ERRNO:-1,Z_STREAM_ERROR:-2,Z_DATA_ERROR:-3,Z_BUF_ERROR:-5,Z_NO_COMPRESSION:0,Z_BEST_SPEED:1,Z_BEST_COMPRESSION:9,Z_DEFAULT_COMPRESSION:-1,Z_FILTERED:1,Z_HUFFMAN_ONLY:2,Z_RLE:3,Z_FIXED:4,Z_DEFAULT_STRATEGY:0,Z_BINARY:0,Z_TEXT:1,Z_UNKNOWN:2,Z_DEFLATED:8}},{}],45:[function(e,t,n){var r=function(){for(var e,t=[],n=0;n<256;n++){e=n;for(var r=0;r<8;r++)e=1&e?3988292384^e>>>1:e>>>1;t[n]=e}return t}();t.exports=function(e,t,n,i){var a=r,o=i+n;e^=-1;for(var s=i;s<o;s++)e=e>>>8^a[255&(e^t[s])];return-1^e}},{}],46:[function(e,t,n){var r,i=e(`../utils/common`),a=e(`./trees`),o=e(`./adler32`),s=e(`./crc32`),c=e(`./messages`),l=0,u=4,d=0,f=-2,p=-1,m=4,h=2,g=8,_=9,v=286,y=30,b=19,x=2*v+1,S=15,C=3,w=258,T=w+C+1,E=42,D=113,O=1,k=2,A=3,j=4;function M(e,t){return e.msg=c[t],t}function N(e){return(e<<1)-(4<e?9:0)}function P(e){for(var t=e.length;0<=--t;)e[t]=0}function F(e){var t=e.state,n=t.pending;n>e.avail_out&&(n=e.avail_out),n!==0&&(i.arraySet(e.output,t.pending_buf,t.pending_out,n,e.next_out),e.next_out+=n,t.pending_out+=n,e.total_out+=n,e.avail_out-=n,t.pending-=n,t.pending===0&&(t.pending_out=0))}function I(e,t){a._tr_flush_block(e,0<=e.block_start?e.block_start:-1,e.strstart-e.block_start,t),e.block_start=e.strstart,F(e.strm)}function L(e,t){e.pending_buf[e.pending++]=t}function R(e,t){e.pending_buf[e.pending++]=t>>>8&255,e.pending_buf[e.pending++]=255&t}function z(e,t){var n,r,i=e.max_chain_length,a=e.strstart,o=e.prev_length,s=e.nice_match,c=e.strstart>e.w_size-T?e.strstart-(e.w_size-T):0,l=e.window,u=e.w_mask,d=e.prev,f=e.strstart+w,p=l[a+o-1],m=l[a+o];e.prev_length>=e.good_match&&(i>>=2),s>e.lookahead&&(s=e.lookahead);do if(l[(n=t)+o]===m&&l[n+o-1]===p&&l[n]===l[a]&&l[++n]===l[a+1]){a+=2,n++;do;while(l[++a]===l[++n]&&l[++a]===l[++n]&&l[++a]===l[++n]&&l[++a]===l[++n]&&l[++a]===l[++n]&&l[++a]===l[++n]&&l[++a]===l[++n]&&l[++a]===l[++n]&&a<f);if(r=w-(f-a),a=f-w,o<r){if(e.match_start=t,s<=(o=r))break;p=l[a+o-1],m=l[a+o]}}while((t=d[t&u])>c&&--i!=0);return o<=e.lookahead?o:e.lookahead}function B(e){var t,n,r,a,c,l,u,d,f,p,m=e.w_size;do{if(a=e.window_size-e.lookahead-e.strstart,e.strstart>=m+(m-T)){for(i.arraySet(e.window,e.window,m,m,0),e.match_start-=m,e.strstart-=m,e.block_start-=m,t=n=e.hash_size;r=e.head[--t],e.head[t]=m<=r?r-m:0,--n;);for(t=n=m;r=e.prev[--t],e.prev[t]=m<=r?r-m:0,--n;);a+=m}if(e.strm.avail_in===0)break;if(l=e.strm,u=e.window,d=e.strstart+e.lookahead,f=a,p=void 0,p=l.avail_in,f<p&&(p=f),n=p===0?0:(l.avail_in-=p,i.arraySet(u,l.input,l.next_in,p,d),l.state.wrap===1?l.adler=o(l.adler,u,p,d):l.state.wrap===2&&(l.adler=s(l.adler,u,p,d)),l.next_in+=p,l.total_in+=p,p),e.lookahead+=n,e.lookahead+e.insert>=C)for(c=e.strstart-e.insert,e.ins_h=e.window[c],e.ins_h=(e.ins_h<<e.hash_shift^e.window[c+1])&e.hash_mask;e.insert&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[c+C-1])&e.hash_mask,e.prev[c&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=c,c++,e.insert--,!(e.lookahead+e.insert<C)););}while(e.lookahead<T&&e.strm.avail_in!==0)}function V(e,t){for(var n,r;;){if(e.lookahead<T){if(B(e),e.lookahead<T&&t===l)return O;if(e.lookahead===0)break}if(n=0,e.lookahead>=C&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+C-1])&e.hash_mask,n=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),n!==0&&e.strstart-n<=e.w_size-T&&(e.match_length=z(e,n)),e.match_length>=C){if(r=a._tr_tally(e,e.strstart-e.match_start,e.match_length-C),e.lookahead-=e.match_length,e.match_length<=e.max_lazy_match&&e.lookahead>=C){for(e.match_length--;e.strstart++,e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+C-1])&e.hash_mask,n=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart,--e.match_length!=0;);e.strstart++}else e.strstart+=e.match_length,e.match_length=0,e.ins_h=e.window[e.strstart],e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+1])&e.hash_mask}else r=a._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++;if(r&&(I(e,!1),e.strm.avail_out===0))return O}return e.insert=e.strstart<C-1?e.strstart:C-1,t===u?(I(e,!0),e.strm.avail_out===0?A:j):e.last_lit&&(I(e,!1),e.strm.avail_out===0)?O:k}function H(e,t){for(var n,r,i;;){if(e.lookahead<T){if(B(e),e.lookahead<T&&t===l)return O;if(e.lookahead===0)break}if(n=0,e.lookahead>=C&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+C-1])&e.hash_mask,n=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),e.prev_length=e.match_length,e.prev_match=e.match_start,e.match_length=C-1,n!==0&&e.prev_length<e.max_lazy_match&&e.strstart-n<=e.w_size-T&&(e.match_length=z(e,n),e.match_length<=5&&(e.strategy===1||e.match_length===C&&4096<e.strstart-e.match_start)&&(e.match_length=C-1)),e.prev_length>=C&&e.match_length<=e.prev_length){for(i=e.strstart+e.lookahead-C,r=a._tr_tally(e,e.strstart-1-e.prev_match,e.prev_length-C),e.lookahead-=e.prev_length-1,e.prev_length-=2;++e.strstart<=i&&(e.ins_h=(e.ins_h<<e.hash_shift^e.window[e.strstart+C-1])&e.hash_mask,n=e.prev[e.strstart&e.w_mask]=e.head[e.ins_h],e.head[e.ins_h]=e.strstart),--e.prev_length!=0;);if(e.match_available=0,e.match_length=C-1,e.strstart++,r&&(I(e,!1),e.strm.avail_out===0))return O}else if(e.match_available){if((r=a._tr_tally(e,0,e.window[e.strstart-1]))&&I(e,!1),e.strstart++,e.lookahead--,e.strm.avail_out===0)return O}else e.match_available=1,e.strstart++,e.lookahead--}return e.match_available&&=(r=a._tr_tally(e,0,e.window[e.strstart-1]),0),e.insert=e.strstart<C-1?e.strstart:C-1,t===u?(I(e,!0),e.strm.avail_out===0?A:j):e.last_lit&&(I(e,!1),e.strm.avail_out===0)?O:k}function U(e,t,n,r,i){this.good_length=e,this.max_lazy=t,this.nice_length=n,this.max_chain=r,this.func=i}function ee(){this.strm=null,this.status=0,this.pending_buf=null,this.pending_buf_size=0,this.pending_out=0,this.pending=0,this.wrap=0,this.gzhead=null,this.gzindex=0,this.method=g,this.last_flush=-1,this.w_size=0,this.w_bits=0,this.w_mask=0,this.window=null,this.window_size=0,this.prev=null,this.head=null,this.ins_h=0,this.hash_size=0,this.hash_bits=0,this.hash_mask=0,this.hash_shift=0,this.block_start=0,this.match_length=0,this.prev_match=0,this.match_available=0,this.strstart=0,this.match_start=0,this.lookahead=0,this.prev_length=0,this.max_chain_length=0,this.max_lazy_match=0,this.level=0,this.strategy=0,this.good_match=0,this.nice_match=0,this.dyn_ltree=new i.Buf16(2*x),this.dyn_dtree=new i.Buf16(2*(2*y+1)),this.bl_tree=new i.Buf16(2*(2*b+1)),P(this.dyn_ltree),P(this.dyn_dtree),P(this.bl_tree),this.l_desc=null,this.d_desc=null,this.bl_desc=null,this.bl_count=new i.Buf16(S+1),this.heap=new i.Buf16(2*v+1),P(this.heap),this.heap_len=0,this.heap_max=0,this.depth=new i.Buf16(2*v+1),P(this.depth),this.l_buf=0,this.lit_bufsize=0,this.last_lit=0,this.d_buf=0,this.opt_len=0,this.static_len=0,this.matches=0,this.insert=0,this.bi_buf=0,this.bi_valid=0}function W(e){var t;return e&&e.state?(e.total_in=e.total_out=0,e.data_type=h,(t=e.state).pending=0,t.pending_out=0,t.wrap<0&&(t.wrap=-t.wrap),t.status=t.wrap?E:D,e.adler=t.wrap===2?0:1,t.last_flush=l,a._tr_init(t),d):M(e,f)}function G(e){var t=W(e);return t===d&&function(e){e.window_size=2*e.w_size,P(e.head),e.max_lazy_match=r[e.level].max_lazy,e.good_match=r[e.level].good_length,e.nice_match=r[e.level].nice_length,e.max_chain_length=r[e.level].max_chain,e.strstart=0,e.block_start=0,e.lookahead=0,e.insert=0,e.match_length=e.prev_length=C-1,e.match_available=0,e.ins_h=0}(e.state),t}function te(e,t,n,r,a,o){if(!e)return f;var s=1;if(t===p&&(t=6),r<0?(s=0,r=-r):15<r&&(s=2,r-=16),a<1||_<a||n!==g||r<8||15<r||t<0||9<t||o<0||m<o)return M(e,f);r===8&&(r=9);var c=new ee;return(e.state=c).strm=e,c.wrap=s,c.gzhead=null,c.w_bits=r,c.w_size=1<<c.w_bits,c.w_mask=c.w_size-1,c.hash_bits=a+7,c.hash_size=1<<c.hash_bits,c.hash_mask=c.hash_size-1,c.hash_shift=~~((c.hash_bits+C-1)/C),c.window=new i.Buf8(2*c.w_size),c.head=new i.Buf16(c.hash_size),c.prev=new i.Buf16(c.w_size),c.lit_bufsize=1<<a+6,c.pending_buf_size=4*c.lit_bufsize,c.pending_buf=new i.Buf8(c.pending_buf_size),c.d_buf=1*c.lit_bufsize,c.l_buf=3*c.lit_bufsize,c.level=t,c.strategy=o,c.method=n,G(e)}r=[new U(0,0,0,0,function(e,t){var n=65535;for(n>e.pending_buf_size-5&&(n=e.pending_buf_size-5);;){if(e.lookahead<=1){if(B(e),e.lookahead===0&&t===l)return O;if(e.lookahead===0)break}e.strstart+=e.lookahead,e.lookahead=0;var r=e.block_start+n;if((e.strstart===0||e.strstart>=r)&&(e.lookahead=e.strstart-r,e.strstart=r,I(e,!1),e.strm.avail_out===0)||e.strstart-e.block_start>=e.w_size-T&&(I(e,!1),e.strm.avail_out===0))return O}return e.insert=0,t===u?(I(e,!0),e.strm.avail_out===0?A:j):(e.strstart>e.block_start&&(I(e,!1),e.strm.avail_out),O)}),new U(4,4,8,4,V),new U(4,5,16,8,V),new U(4,6,32,32,V),new U(4,4,16,16,H),new U(8,16,32,32,H),new U(8,16,128,128,H),new U(8,32,128,256,H),new U(32,128,258,1024,H),new U(32,258,258,4096,H)],n.deflateInit=function(e,t){return te(e,t,g,15,8,0)},n.deflateInit2=te,n.deflateReset=G,n.deflateResetKeep=W,n.deflateSetHeader=function(e,t){return e&&e.state&&e.state.wrap===2?(e.state.gzhead=t,d):f},n.deflate=function(e,t){var n,i,o,c;if(!e||!e.state||5<t||t<0)return e?M(e,f):f;if(i=e.state,!e.output||!e.input&&e.avail_in!==0||i.status===666&&t!==u)return M(e,e.avail_out===0?-5:f);if(i.strm=e,n=i.last_flush,i.last_flush=t,i.status===E){if(i.wrap===2)e.adler=0,L(i,31),L(i,139),L(i,8),i.gzhead?(L(i,+!!i.gzhead.text+(i.gzhead.hcrc?2:0)+(i.gzhead.extra?4:0)+(i.gzhead.name?8:0)+(i.gzhead.comment?16:0)),L(i,255&i.gzhead.time),L(i,i.gzhead.time>>8&255),L(i,i.gzhead.time>>16&255),L(i,i.gzhead.time>>24&255),L(i,i.level===9?2:2<=i.strategy||i.level<2?4:0),L(i,255&i.gzhead.os),i.gzhead.extra&&i.gzhead.extra.length&&(L(i,255&i.gzhead.extra.length),L(i,i.gzhead.extra.length>>8&255)),i.gzhead.hcrc&&(e.adler=s(e.adler,i.pending_buf,i.pending,0)),i.gzindex=0,i.status=69):(L(i,0),L(i,0),L(i,0),L(i,0),L(i,0),L(i,i.level===9?2:2<=i.strategy||i.level<2?4:0),L(i,3),i.status=D);else{var p=g+(i.w_bits-8<<4)<<8;p|=(2<=i.strategy||i.level<2?0:i.level<6?1:i.level===6?2:3)<<6,i.strstart!==0&&(p|=32),p+=31-p%31,i.status=D,R(i,p),i.strstart!==0&&(R(i,e.adler>>>16),R(i,65535&e.adler)),e.adler=1}}if(i.status===69){if(i.gzhead.extra){for(o=i.pending;i.gzindex<(65535&i.gzhead.extra.length)&&(i.pending!==i.pending_buf_size||(i.gzhead.hcrc&&i.pending>o&&(e.adler=s(e.adler,i.pending_buf,i.pending-o,o)),F(e),o=i.pending,i.pending!==i.pending_buf_size));)L(i,255&i.gzhead.extra[i.gzindex]),i.gzindex++;i.gzhead.hcrc&&i.pending>o&&(e.adler=s(e.adler,i.pending_buf,i.pending-o,o)),i.gzindex===i.gzhead.extra.length&&(i.gzindex=0,i.status=73)}else i.status=73}if(i.status===73){if(i.gzhead.name){o=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>o&&(e.adler=s(e.adler,i.pending_buf,i.pending-o,o)),F(e),o=i.pending,i.pending===i.pending_buf_size)){c=1;break}c=i.gzindex<i.gzhead.name.length?255&i.gzhead.name.charCodeAt(i.gzindex++):0,L(i,c)}while(c!==0);i.gzhead.hcrc&&i.pending>o&&(e.adler=s(e.adler,i.pending_buf,i.pending-o,o)),c===0&&(i.gzindex=0,i.status=91)}else i.status=91}if(i.status===91){if(i.gzhead.comment){o=i.pending;do{if(i.pending===i.pending_buf_size&&(i.gzhead.hcrc&&i.pending>o&&(e.adler=s(e.adler,i.pending_buf,i.pending-o,o)),F(e),o=i.pending,i.pending===i.pending_buf_size)){c=1;break}c=i.gzindex<i.gzhead.comment.length?255&i.gzhead.comment.charCodeAt(i.gzindex++):0,L(i,c)}while(c!==0);i.gzhead.hcrc&&i.pending>o&&(e.adler=s(e.adler,i.pending_buf,i.pending-o,o)),c===0&&(i.status=103)}else i.status=103}if(i.status===103&&(i.gzhead.hcrc?(i.pending+2>i.pending_buf_size&&F(e),i.pending+2<=i.pending_buf_size&&(L(i,255&e.adler),L(i,e.adler>>8&255),e.adler=0,i.status=D)):i.status=D),i.pending!==0){if(F(e),e.avail_out===0)return i.last_flush=-1,d}else if(e.avail_in===0&&N(t)<=N(n)&&t!==u)return M(e,-5);if(i.status===666&&e.avail_in!==0)return M(e,-5);if(e.avail_in!==0||i.lookahead!==0||t!==l&&i.status!==666){var m=i.strategy===2?function(e,t){for(var n;;){if(e.lookahead===0&&(B(e),e.lookahead===0)){if(t===l)return O;break}if(e.match_length=0,n=a._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++,n&&(I(e,!1),e.strm.avail_out===0))return O}return e.insert=0,t===u?(I(e,!0),e.strm.avail_out===0?A:j):e.last_lit&&(I(e,!1),e.strm.avail_out===0)?O:k}(i,t):i.strategy===3?function(e,t){for(var n,r,i,o,s=e.window;;){if(e.lookahead<=w){if(B(e),e.lookahead<=w&&t===l)return O;if(e.lookahead===0)break}if(e.match_length=0,e.lookahead>=C&&0<e.strstart&&(r=s[i=e.strstart-1])===s[++i]&&r===s[++i]&&r===s[++i]){o=e.strstart+w;do;while(r===s[++i]&&r===s[++i]&&r===s[++i]&&r===s[++i]&&r===s[++i]&&r===s[++i]&&r===s[++i]&&r===s[++i]&&i<o);e.match_length=w-(o-i),e.match_length>e.lookahead&&(e.match_length=e.lookahead)}if(e.match_length>=C?(n=a._tr_tally(e,1,e.match_length-C),e.lookahead-=e.match_length,e.strstart+=e.match_length,e.match_length=0):(n=a._tr_tally(e,0,e.window[e.strstart]),e.lookahead--,e.strstart++),n&&(I(e,!1),e.strm.avail_out===0))return O}return e.insert=0,t===u?(I(e,!0),e.strm.avail_out===0?A:j):e.last_lit&&(I(e,!1),e.strm.avail_out===0)?O:k}(i,t):r[i.level].func(i,t);if(m!==A&&m!==j||(i.status=666),m===O||m===A)return e.avail_out===0&&(i.last_flush=-1),d;if(m===k&&(t===1?a._tr_align(i):t!==5&&(a._tr_stored_block(i,0,0,!1),t===3&&(P(i.head),i.lookahead===0&&(i.strstart=0,i.block_start=0,i.insert=0))),F(e),e.avail_out===0))return i.last_flush=-1,d}return t===u?i.wrap<=0?1:(i.wrap===2?(L(i,255&e.adler),L(i,e.adler>>8&255),L(i,e.adler>>16&255),L(i,e.adler>>24&255),L(i,255&e.total_in),L(i,e.total_in>>8&255),L(i,e.total_in>>16&255),L(i,e.total_in>>24&255)):(R(i,e.adler>>>16),R(i,65535&e.adler)),F(e),0<i.wrap&&(i.wrap=-i.wrap),i.pending===0?1:d):d},n.deflateEnd=function(e){var t;return e&&e.state?(t=e.state.status)!==E&&t!==69&&t!==73&&t!==91&&t!==103&&t!==D&&t!==666?M(e,f):(e.state=null,t===D?M(e,-3):d):f},n.deflateSetDictionary=function(e,t){var n,r,a,s,c,l,u,p,m=t.length;if(!e||!e.state||(s=(n=e.state).wrap)===2||s===1&&n.status!==E||n.lookahead)return f;for(s===1&&(e.adler=o(e.adler,t,m,0)),n.wrap=0,m>=n.w_size&&(s===0&&(P(n.head),n.strstart=0,n.block_start=0,n.insert=0),p=new i.Buf8(n.w_size),i.arraySet(p,t,m-n.w_size,n.w_size,0),t=p,m=n.w_size),c=e.avail_in,l=e.next_in,u=e.input,e.avail_in=m,e.next_in=0,e.input=t,B(n);n.lookahead>=C;){for(r=n.strstart,a=n.lookahead-(C-1);n.ins_h=(n.ins_h<<n.hash_shift^n.window[r+C-1])&n.hash_mask,n.prev[r&n.w_mask]=n.head[n.ins_h],n.head[n.ins_h]=r,r++,--a;);n.strstart=r,n.lookahead=C-1,B(n)}return n.strstart+=n.lookahead,n.block_start=n.strstart,n.insert=n.lookahead,n.lookahead=0,n.match_length=n.prev_length=C-1,n.match_available=0,e.next_in=l,e.input=u,e.avail_in=c,n.wrap=s,d},n.deflateInfo=`pako deflate (from Nodeca project)`},{"../utils/common":41,"./adler32":43,"./crc32":45,"./messages":51,"./trees":52}],47:[function(e,t,n){t.exports=function(){this.text=0,this.time=0,this.xflags=0,this.os=0,this.extra=null,this.extra_len=0,this.name=``,this.comment=``,this.hcrc=0,this.done=!1}},{}],48:[function(e,t,n){t.exports=function(e,t){var n=e.state,r=e.next_in,i,a,o,s,c,l,u,d,f,p,m,h,g,_,v,y,b,x,S,C,w,T=e.input,E;i=r+(e.avail_in-5),a=e.next_out,E=e.output,o=a-(t-e.avail_out),s=a+(e.avail_out-257),c=n.dmax,l=n.wsize,u=n.whave,d=n.wnext,f=n.window,p=n.hold,m=n.bits,h=n.lencode,g=n.distcode,_=(1<<n.lenbits)-1,v=(1<<n.distbits)-1;e:do{m<15&&(p+=T[r++]<<m,m+=8,p+=T[r++]<<m,m+=8),y=h[p&_];t:for(;;){if(p>>>=b=y>>>24,m-=b,(b=y>>>16&255)==0)E[a++]=65535&y;else{if(!(16&b)){if(!(64&b)){y=h[(65535&y)+(p&(1<<b)-1)];continue t}if(32&b){n.mode=12;break e}e.msg=`invalid literal/length code`,n.mode=30;break e}x=65535&y,(b&=15)&&(m<b&&(p+=T[r++]<<m,m+=8),x+=p&(1<<b)-1,p>>>=b,m-=b),m<15&&(p+=T[r++]<<m,m+=8,p+=T[r++]<<m,m+=8),y=g[p&v];r:for(;;){if(p>>>=b=y>>>24,m-=b,!(16&(b=y>>>16&255))){if(!(64&b)){y=g[(65535&y)+(p&(1<<b)-1)];continue r}e.msg=`invalid distance code`,n.mode=30;break e}if(S=65535&y,m<(b&=15)&&(p+=T[r++]<<m,(m+=8)<b&&(p+=T[r++]<<m,m+=8)),c<(S+=p&(1<<b)-1)){e.msg=`invalid distance too far back`,n.mode=30;break e}if(p>>>=b,m-=b,(b=a-o)<S){if(u<(b=S-b)&&n.sane){e.msg=`invalid distance too far back`,n.mode=30;break e}if(w=f,(C=0)===d){if(C+=l-b,b<x){for(x-=b;E[a++]=f[C++],--b;);C=a-S,w=E}}else if(d<b){if(C+=l+d-b,(b-=d)<x){for(x-=b;E[a++]=f[C++],--b;);if(C=0,d<x){for(x-=b=d;E[a++]=f[C++],--b;);C=a-S,w=E}}}else if(C+=d-b,b<x){for(x-=b;E[a++]=f[C++],--b;);C=a-S,w=E}for(;2<x;)E[a++]=w[C++],E[a++]=w[C++],E[a++]=w[C++],x-=3;x&&(E[a++]=w[C++],1<x&&(E[a++]=w[C++]))}else{for(C=a-S;E[a++]=E[C++],E[a++]=E[C++],E[a++]=E[C++],2<(x-=3););x&&(E[a++]=E[C++],1<x&&(E[a++]=E[C++]))}break}}break}}while(r<i&&a<s);r-=x=m>>3,p&=(1<<(m-=x<<3))-1,e.next_in=r,e.next_out=a,e.avail_in=r<i?i-r+5:5-(r-i),e.avail_out=a<s?s-a+257:257-(a-s),n.hold=p,n.bits=m}},{}],49:[function(e,t,n){var r=e(`../utils/common`),i=e(`./adler32`),a=e(`./crc32`),o=e(`./inffast`),s=e(`./inftrees`),c=1,l=2,u=0,d=-2,f=1,p=852,m=592;function h(e){return(e>>>24&255)+(e>>>8&65280)+((65280&e)<<8)+((255&e)<<24)}function g(){this.mode=0,this.last=!1,this.wrap=0,this.havedict=!1,this.flags=0,this.dmax=0,this.check=0,this.total=0,this.head=null,this.wbits=0,this.wsize=0,this.whave=0,this.wnext=0,this.window=null,this.hold=0,this.bits=0,this.length=0,this.offset=0,this.extra=0,this.lencode=null,this.distcode=null,this.lenbits=0,this.distbits=0,this.ncode=0,this.nlen=0,this.ndist=0,this.have=0,this.next=null,this.lens=new r.Buf16(320),this.work=new r.Buf16(288),this.lendyn=null,this.distdyn=null,this.sane=0,this.back=0,this.was=0}function _(e){var t;return e&&e.state?(t=e.state,e.total_in=e.total_out=t.total=0,e.msg=``,t.wrap&&(e.adler=1&t.wrap),t.mode=f,t.last=0,t.havedict=0,t.dmax=32768,t.head=null,t.hold=0,t.bits=0,t.lencode=t.lendyn=new r.Buf32(p),t.distcode=t.distdyn=new r.Buf32(m),t.sane=1,t.back=-1,u):d}function v(e){var t;return e&&e.state?((t=e.state).wsize=0,t.whave=0,t.wnext=0,_(e)):d}function y(e,t){var n,r;return e&&e.state?(r=e.state,t<0?(n=0,t=-t):(n=1+(t>>4),t<48&&(t&=15)),t&&(t<8||15<t)?d:(r.window!==null&&r.wbits!==t&&(r.window=null),r.wrap=n,r.wbits=t,v(e))):d}function b(e,t){var n,r;return e?(r=new g,(e.state=r).window=null,(n=y(e,t))!==u&&(e.state=null),n):d}var x,S,C=!0;function w(e){if(C){var t;for(x=new r.Buf32(512),S=new r.Buf32(32),t=0;t<144;)e.lens[t++]=8;for(;t<256;)e.lens[t++]=9;for(;t<280;)e.lens[t++]=7;for(;t<288;)e.lens[t++]=8;for(s(c,e.lens,0,288,x,0,e.work,{bits:9}),t=0;t<32;)e.lens[t++]=5;s(l,e.lens,0,32,S,0,e.work,{bits:5}),C=!1}e.lencode=x,e.lenbits=9,e.distcode=S,e.distbits=5}function T(e,t,n,i){var a,o=e.state;return o.window===null&&(o.wsize=1<<o.wbits,o.wnext=0,o.whave=0,o.window=new r.Buf8(o.wsize)),i>=o.wsize?(r.arraySet(o.window,t,n-o.wsize,o.wsize,0),o.wnext=0,o.whave=o.wsize):(i<(a=o.wsize-o.wnext)&&(a=i),r.arraySet(o.window,t,n-i,a,o.wnext),(i-=a)?(r.arraySet(o.window,t,n-i,i,0),o.wnext=i,o.whave=o.wsize):(o.wnext+=a,o.wnext===o.wsize&&(o.wnext=0),o.whave<o.wsize&&(o.whave+=a))),0}n.inflateReset=v,n.inflateReset2=y,n.inflateResetKeep=_,n.inflateInit=function(e){return b(e,15)},n.inflateInit2=b,n.inflate=function(e,t){var n,p,m,g,_,v,y,b,x,S,C,E,D,O,k,A,j,M,N,P,F,I,L,R,z=0,B=new r.Buf8(4),V=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15];if(!e||!e.state||!e.output||!e.input&&e.avail_in!==0)return d;(n=e.state).mode===12&&(n.mode=13),_=e.next_out,m=e.output,y=e.avail_out,g=e.next_in,p=e.input,v=e.avail_in,b=n.hold,x=n.bits,S=v,C=y,I=u;e:for(;;)switch(n.mode){case f:if(n.wrap===0){n.mode=13;break}for(;x<16;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}if(2&n.wrap&&b===35615){B[n.check=0]=255&b,B[1]=b>>>8&255,n.check=a(n.check,B,2,0),x=b=0,n.mode=2;break}if(n.flags=0,n.head&&(n.head.done=!1),!(1&n.wrap)||(((255&b)<<8)+(b>>8))%31){e.msg=`incorrect header check`,n.mode=30;break}if((15&b)!=8){e.msg=`unknown compression method`,n.mode=30;break}if(x-=4,F=8+(15&(b>>>=4)),n.wbits===0)n.wbits=F;else if(F>n.wbits){e.msg=`invalid window size`,n.mode=30;break}n.dmax=1<<F,e.adler=n.check=1,n.mode=512&b?10:12,x=b=0;break;case 2:for(;x<16;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}if(n.flags=b,(255&n.flags)!=8){e.msg=`unknown compression method`,n.mode=30;break}if(57344&n.flags){e.msg=`unknown header flags set`,n.mode=30;break}n.head&&(n.head.text=b>>8&1),512&n.flags&&(B[0]=255&b,B[1]=b>>>8&255,n.check=a(n.check,B,2,0)),x=b=0,n.mode=3;case 3:for(;x<32;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}n.head&&(n.head.time=b),512&n.flags&&(B[0]=255&b,B[1]=b>>>8&255,B[2]=b>>>16&255,B[3]=b>>>24&255,n.check=a(n.check,B,4,0)),x=b=0,n.mode=4;case 4:for(;x<16;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}n.head&&(n.head.xflags=255&b,n.head.os=b>>8),512&n.flags&&(B[0]=255&b,B[1]=b>>>8&255,n.check=a(n.check,B,2,0)),x=b=0,n.mode=5;case 5:if(1024&n.flags){for(;x<16;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}n.length=b,n.head&&(n.head.extra_len=b),512&n.flags&&(B[0]=255&b,B[1]=b>>>8&255,n.check=a(n.check,B,2,0)),x=b=0}else n.head&&(n.head.extra=null);n.mode=6;case 6:if(1024&n.flags&&(v<(E=n.length)&&(E=v),E&&(n.head&&(F=n.head.extra_len-n.length,n.head.extra||(n.head.extra=Array(n.head.extra_len)),r.arraySet(n.head.extra,p,g,E,F)),512&n.flags&&(n.check=a(n.check,p,E,g)),v-=E,g+=E,n.length-=E),n.length))break e;n.length=0,n.mode=7;case 7:if(2048&n.flags){if(v===0)break e;for(E=0;F=p[g+E++],n.head&&F&&n.length<65536&&(n.head.name+=String.fromCharCode(F)),F&&E<v;);if(512&n.flags&&(n.check=a(n.check,p,E,g)),v-=E,g+=E,F)break e}else n.head&&(n.head.name=null);n.length=0,n.mode=8;case 8:if(4096&n.flags){if(v===0)break e;for(E=0;F=p[g+E++],n.head&&F&&n.length<65536&&(n.head.comment+=String.fromCharCode(F)),F&&E<v;);if(512&n.flags&&(n.check=a(n.check,p,E,g)),v-=E,g+=E,F)break e}else n.head&&(n.head.comment=null);n.mode=9;case 9:if(512&n.flags){for(;x<16;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}if(b!==(65535&n.check)){e.msg=`header crc mismatch`,n.mode=30;break}x=b=0}n.head&&(n.head.hcrc=n.flags>>9&1,n.head.done=!0),e.adler=n.check=0,n.mode=12;break;case 10:for(;x<32;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}e.adler=n.check=h(b),x=b=0,n.mode=11;case 11:if(n.havedict===0)return e.next_out=_,e.avail_out=y,e.next_in=g,e.avail_in=v,n.hold=b,n.bits=x,2;e.adler=n.check=1,n.mode=12;case 12:if(t===5||t===6)break e;case 13:if(n.last){b>>>=7&x,x-=7&x,n.mode=27;break}for(;x<3;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}switch(n.last=1&b,--x,3&(b>>>=1)){case 0:n.mode=14;break;case 1:if(w(n),n.mode=20,t!==6)break;b>>>=2,x-=2;break e;case 2:n.mode=17;break;case 3:e.msg=`invalid block type`,n.mode=30}b>>>=2,x-=2;break;case 14:for(b>>>=7&x,x-=7&x;x<32;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}if((65535&b)!=(b>>>16^65535)){e.msg=`invalid stored block lengths`,n.mode=30;break}if(n.length=65535&b,x=b=0,n.mode=15,t===6)break e;case 15:n.mode=16;case 16:if(E=n.length){if(v<E&&(E=v),y<E&&(E=y),E===0)break e;r.arraySet(m,p,g,E,_),v-=E,g+=E,y-=E,_+=E,n.length-=E;break}n.mode=12;break;case 17:for(;x<14;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}if(n.nlen=257+(31&b),b>>>=5,x-=5,n.ndist=1+(31&b),b>>>=5,x-=5,n.ncode=4+(15&b),b>>>=4,x-=4,286<n.nlen||30<n.ndist){e.msg=`too many length or distance symbols`,n.mode=30;break}n.have=0,n.mode=18;case 18:for(;n.have<n.ncode;){for(;x<3;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}n.lens[V[n.have++]]=7&b,b>>>=3,x-=3}for(;n.have<19;)n.lens[V[n.have++]]=0;if(n.lencode=n.lendyn,n.lenbits=7,L={bits:n.lenbits},I=s(0,n.lens,0,19,n.lencode,0,n.work,L),n.lenbits=L.bits,I){e.msg=`invalid code lengths set`,n.mode=30;break}n.have=0,n.mode=19;case 19:for(;n.have<n.nlen+n.ndist;){for(;A=(z=n.lencode[b&(1<<n.lenbits)-1])>>>16&255,j=65535&z,!((k=z>>>24)<=x);){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}if(j<16)b>>>=k,x-=k,n.lens[n.have++]=j;else{if(j===16){for(R=k+2;x<R;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}if(b>>>=k,x-=k,n.have===0){e.msg=`invalid bit length repeat`,n.mode=30;break}F=n.lens[n.have-1],E=3+(3&b),b>>>=2,x-=2}else if(j===17){for(R=k+3;x<R;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}x-=k,F=0,E=3+(7&(b>>>=k)),b>>>=3,x-=3}else{for(R=k+7;x<R;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}x-=k,F=0,E=11+(127&(b>>>=k)),b>>>=7,x-=7}if(n.have+E>n.nlen+n.ndist){e.msg=`invalid bit length repeat`,n.mode=30;break}for(;E--;)n.lens[n.have++]=F}}if(n.mode===30)break;if(n.lens[256]===0){e.msg=`invalid code -- missing end-of-block`,n.mode=30;break}if(n.lenbits=9,L={bits:n.lenbits},I=s(c,n.lens,0,n.nlen,n.lencode,0,n.work,L),n.lenbits=L.bits,I){e.msg=`invalid literal/lengths set`,n.mode=30;break}if(n.distbits=6,n.distcode=n.distdyn,L={bits:n.distbits},I=s(l,n.lens,n.nlen,n.ndist,n.distcode,0,n.work,L),n.distbits=L.bits,I){e.msg=`invalid distances set`,n.mode=30;break}if(n.mode=20,t===6)break e;case 20:n.mode=21;case 21:if(6<=v&&258<=y){e.next_out=_,e.avail_out=y,e.next_in=g,e.avail_in=v,n.hold=b,n.bits=x,o(e,C),_=e.next_out,m=e.output,y=e.avail_out,g=e.next_in,p=e.input,v=e.avail_in,b=n.hold,x=n.bits,n.mode===12&&(n.back=-1);break}for(n.back=0;A=(z=n.lencode[b&(1<<n.lenbits)-1])>>>16&255,j=65535&z,!((k=z>>>24)<=x);){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}if(A&&!(240&A)){for(M=k,N=A,P=j;A=(z=n.lencode[P+((b&(1<<M+N)-1)>>M)])>>>16&255,j=65535&z,!(M+(k=z>>>24)<=x);){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}b>>>=M,x-=M,n.back+=M}if(b>>>=k,x-=k,n.back+=k,n.length=j,A===0){n.mode=26;break}if(32&A){n.back=-1,n.mode=12;break}if(64&A){e.msg=`invalid literal/length code`,n.mode=30;break}n.extra=15&A,n.mode=22;case 22:if(n.extra){for(R=n.extra;x<R;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}n.length+=b&(1<<n.extra)-1,b>>>=n.extra,x-=n.extra,n.back+=n.extra}n.was=n.length,n.mode=23;case 23:for(;A=(z=n.distcode[b&(1<<n.distbits)-1])>>>16&255,j=65535&z,!((k=z>>>24)<=x);){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}if(!(240&A)){for(M=k,N=A,P=j;A=(z=n.distcode[P+((b&(1<<M+N)-1)>>M)])>>>16&255,j=65535&z,!(M+(k=z>>>24)<=x);){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}b>>>=M,x-=M,n.back+=M}if(b>>>=k,x-=k,n.back+=k,64&A){e.msg=`invalid distance code`,n.mode=30;break}n.offset=j,n.extra=15&A,n.mode=24;case 24:if(n.extra){for(R=n.extra;x<R;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}n.offset+=b&(1<<n.extra)-1,b>>>=n.extra,x-=n.extra,n.back+=n.extra}if(n.offset>n.dmax){e.msg=`invalid distance too far back`,n.mode=30;break}n.mode=25;case 25:if(y===0)break e;if(E=C-y,n.offset>E){if((E=n.offset-E)>n.whave&&n.sane){e.msg=`invalid distance too far back`,n.mode=30;break}D=E>n.wnext?(E-=n.wnext,n.wsize-E):n.wnext-E,E>n.length&&(E=n.length),O=n.window}else O=m,D=_-n.offset,E=n.length;for(y<E&&(E=y),y-=E,n.length-=E;m[_++]=O[D++],--E;);n.length===0&&(n.mode=21);break;case 26:if(y===0)break e;m[_++]=n.length,y--,n.mode=21;break;case 27:if(n.wrap){for(;x<32;){if(v===0)break e;v--,b|=p[g++]<<x,x+=8}if(C-=y,e.total_out+=C,n.total+=C,C&&(e.adler=n.check=n.flags?a(n.check,m,C,_-C):i(n.check,m,C,_-C)),C=y,(n.flags?b:h(b))!==n.check){e.msg=`incorrect data check`,n.mode=30;break}x=b=0}n.mode=28;case 28:if(n.wrap&&n.flags){for(;x<32;){if(v===0)break e;v--,b+=p[g++]<<x,x+=8}if(b!==(0|n.total)){e.msg=`incorrect length check`,n.mode=30;break}x=b=0}n.mode=29;case 29:I=1;break e;case 30:I=-3;break e;case 31:return-4;default:return d}return e.next_out=_,e.avail_out=y,e.next_in=g,e.avail_in=v,n.hold=b,n.bits=x,(n.wsize||C!==e.avail_out&&n.mode<30&&(n.mode<27||t!==4))&&T(e,e.output,e.next_out,C-e.avail_out)?(n.mode=31,-4):(S-=e.avail_in,C-=e.avail_out,e.total_in+=S,e.total_out+=C,n.total+=C,n.wrap&&C&&(e.adler=n.check=n.flags?a(n.check,m,C,e.next_out-C):i(n.check,m,C,e.next_out-C)),e.data_type=n.bits+(n.last?64:0)+(n.mode===12?128:0)+(n.mode===20||n.mode===15?256:0),(S==0&&C===0||t===4)&&I===u&&(I=-5),I)},n.inflateEnd=function(e){if(!e||!e.state)return d;var t=e.state;return t.window&&=null,e.state=null,u},n.inflateGetHeader=function(e,t){var n;return e&&e.state&&2&(n=e.state).wrap?((n.head=t).done=!1,u):d},n.inflateSetDictionary=function(e,t){var n,r=t.length;return e&&e.state?(n=e.state).wrap!==0&&n.mode!==11?d:n.mode===11&&i(1,t,r,0)!==n.check?-3:T(e,t,r,r)?(n.mode=31,-4):(n.havedict=1,u):d},n.inflateInfo=`pako inflate (from Nodeca project)`},{"../utils/common":41,"./adler32":43,"./crc32":45,"./inffast":48,"./inftrees":50}],50:[function(e,t,n){var r=e(`../utils/common`),i=[3,4,5,6,7,8,9,10,11,13,15,17,19,23,27,31,35,43,51,59,67,83,99,115,131,163,195,227,258,0,0],a=[16,16,16,16,16,16,16,16,17,17,17,17,18,18,18,18,19,19,19,19,20,20,20,20,21,21,21,21,16,72,78],o=[1,2,3,4,5,7,9,13,17,25,33,49,65,97,129,193,257,385,513,769,1025,1537,2049,3073,4097,6145,8193,12289,16385,24577,0,0],s=[16,16,16,16,17,17,18,18,19,19,20,20,21,21,22,22,23,23,24,24,25,25,26,26,27,27,28,28,29,29,64,64];t.exports=function(e,t,n,c,l,u,d,f){var p,m,h,g,_,v,y,b,x,S=f.bits,C=0,w=0,T=0,E=0,D=0,O=0,k=0,A=0,j=0,M=0,N=null,P=0,F=new r.Buf16(16),I=new r.Buf16(16),L=null,R=0;for(C=0;C<=15;C++)F[C]=0;for(w=0;w<c;w++)F[t[n+w]]++;for(D=S,E=15;1<=E&&F[E]===0;E--);if(E<D&&(D=E),E===0)return l[u++]=20971520,l[u++]=20971520,f.bits=1,0;for(T=1;T<E&&F[T]===0;T++);for(D<T&&(D=T),C=A=1;C<=15;C++)if(A<<=1,(A-=F[C])<0)return-1;if(0<A&&(e===0||E!==1))return-1;for(I[1]=0,C=1;C<15;C++)I[C+1]=I[C]+F[C];for(w=0;w<c;w++)t[n+w]!==0&&(d[I[t[n+w]]++]=w);if(v=e===0?(N=L=d,19):e===1?(N=i,P-=257,L=a,R-=257,256):(N=o,L=s,-1),C=T,_=u,k=w=M=0,h=-1,g=(j=1<<(O=D))-1,e===1&&852<j||e===2&&592<j)return 1;for(;;){for(y=C-k,x=d[w]<v?(b=0,d[w]):d[w]>v?(b=L[R+d[w]],N[P+d[w]]):(b=96,0),p=1<<C-k,T=m=1<<O;l[_+(M>>k)+(m-=p)]=y<<24|b<<16|x,m!==0;);for(p=1<<C-1;M&p;)p>>=1;if(p===0?M=0:(M&=p-1,M+=p),w++,--F[C]==0){if(C===E)break;C=t[n+d[w]]}if(D<C&&(M&g)!==h){for(k===0&&(k=D),_+=T,A=1<<(O=C-k);O+k<E&&!((A-=F[O+k])<=0);)O++,A<<=1;if(j+=1<<O,e===1&&852<j||e===2&&592<j)return 1;l[h=M&g]=D<<24|O<<16|_-u}}return M!==0&&(l[_+M]=C-k<<24|4194304),f.bits=D,0}},{"../utils/common":41}],51:[function(e,t,n){t.exports={2:`need dictionary`,1:`stream end`,0:``,"-1":`file error`,"-2":`stream error`,"-3":`data error`,"-4":`insufficient memory`,"-5":`buffer error`,"-6":`incompatible version`}},{}],52:[function(e,t,n){var r=e(`../utils/common`),i=0,a=1;function o(e){for(var t=e.length;0<=--t;)e[t]=0}var s=0,c=29,l=256,u=l+1+c,d=30,f=19,p=2*u+1,m=15,h=16,g=7,_=256,v=16,y=17,b=18,x=[0,0,0,0,0,0,0,0,1,1,1,1,2,2,2,2,3,3,3,3,4,4,4,4,5,5,5,5,0],S=[0,0,0,0,1,1,2,2,3,3,4,4,5,5,6,6,7,7,8,8,9,9,10,10,11,11,12,12,13,13],C=[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,2,3,7],w=[16,17,18,0,8,7,9,6,10,5,11,4,12,3,13,2,14,1,15],T=Array(2*(u+2));o(T);var E=Array(2*d);o(E);var D=Array(512);o(D);var O=Array(256);o(O);var k=Array(c);o(k);var A,j,M,N=Array(d);function P(e,t,n,r,i){this.static_tree=e,this.extra_bits=t,this.extra_base=n,this.elems=r,this.max_length=i,this.has_stree=e&&e.length}function F(e,t){this.dyn_tree=e,this.max_code=0,this.stat_desc=t}function I(e){return e<256?D[e]:D[256+(e>>>7)]}function L(e,t){e.pending_buf[e.pending++]=255&t,e.pending_buf[e.pending++]=t>>>8&255}function R(e,t,n){e.bi_valid>h-n?(e.bi_buf|=t<<e.bi_valid&65535,L(e,e.bi_buf),e.bi_buf=t>>h-e.bi_valid,e.bi_valid+=n-h):(e.bi_buf|=t<<e.bi_valid&65535,e.bi_valid+=n)}function z(e,t,n){R(e,n[2*t],n[2*t+1])}function B(e,t){for(var n=0;n|=1&e,e>>>=1,n<<=1,0<--t;);return n>>>1}function V(e,t,n){var r,i,a=Array(m+1),o=0;for(r=1;r<=m;r++)a[r]=o=o+n[r-1]<<1;for(i=0;i<=t;i++){var s=e[2*i+1];s!==0&&(e[2*i]=B(a[s]++,s))}}function H(e){for(var t=0;t<u;t++)e.dyn_ltree[2*t]=0;for(t=0;t<d;t++)e.dyn_dtree[2*t]=0;for(t=0;t<f;t++)e.bl_tree[2*t]=0;e.dyn_ltree[2*_]=1,e.opt_len=e.static_len=0,e.last_lit=e.matches=0}function U(e){8<e.bi_valid?L(e,e.bi_buf):0<e.bi_valid&&(e.pending_buf[e.pending++]=e.bi_buf),e.bi_buf=0,e.bi_valid=0}function ee(e,t,n,r){var i=2*t,a=2*n;return e[i]<e[a]||e[i]===e[a]&&r[t]<=r[n]}function W(e,t,n){for(var r=e.heap[n],i=n<<1;i<=e.heap_len&&(i<e.heap_len&&ee(t,e.heap[i+1],e.heap[i],e.depth)&&i++,!ee(t,r,e.heap[i],e.depth));)e.heap[n]=e.heap[i],n=i,i<<=1;e.heap[n]=r}function G(e,t,n){var r,i,a,o,s=0;if(e.last_lit!==0)for(;r=e.pending_buf[e.d_buf+2*s]<<8|e.pending_buf[e.d_buf+2*s+1],i=e.pending_buf[e.l_buf+s],s++,r===0?z(e,i,t):(z(e,(a=O[i])+l+1,t),(o=x[a])!==0&&R(e,i-=k[a],o),z(e,a=I(--r),n),(o=S[a])!==0&&R(e,r-=N[a],o)),s<e.last_lit;);z(e,_,t)}function te(e,t){var n,r,i,a=t.dyn_tree,o=t.stat_desc.static_tree,s=t.stat_desc.has_stree,c=t.stat_desc.elems,l=-1;for(e.heap_len=0,e.heap_max=p,n=0;n<c;n++)a[2*n]===0?a[2*n+1]=0:(e.heap[++e.heap_len]=l=n,e.depth[n]=0);for(;e.heap_len<2;)a[2*(i=e.heap[++e.heap_len]=l<2?++l:0)]=1,e.depth[i]=0,e.opt_len--,s&&(e.static_len-=o[2*i+1]);for(t.max_code=l,n=e.heap_len>>1;1<=n;n--)W(e,a,n);for(i=c;n=e.heap[1],e.heap[1]=e.heap[e.heap_len--],W(e,a,1),r=e.heap[1],e.heap[--e.heap_max]=n,e.heap[--e.heap_max]=r,a[2*i]=a[2*n]+a[2*r],e.depth[i]=(e.depth[n]>=e.depth[r]?e.depth[n]:e.depth[r])+1,a[2*n+1]=a[2*r+1]=i,e.heap[1]=i++,W(e,a,1),2<=e.heap_len;);e.heap[--e.heap_max]=e.heap[1],function(e,t){var n,r,i,a,o,s,c=t.dyn_tree,l=t.max_code,u=t.stat_desc.static_tree,d=t.stat_desc.has_stree,f=t.stat_desc.extra_bits,h=t.stat_desc.extra_base,g=t.stat_desc.max_length,_=0;for(a=0;a<=m;a++)e.bl_count[a]=0;for(c[2*e.heap[e.heap_max]+1]=0,n=e.heap_max+1;n<p;n++)g<(a=c[2*c[2*(r=e.heap[n])+1]+1]+1)&&(a=g,_++),c[2*r+1]=a,l<r||(e.bl_count[a]++,o=0,h<=r&&(o=f[r-h]),s=c[2*r],e.opt_len+=s*(a+o),d&&(e.static_len+=s*(u[2*r+1]+o)));if(_!==0){do{for(a=g-1;e.bl_count[a]===0;)a--;e.bl_count[a]--,e.bl_count[a+1]+=2,e.bl_count[g]--,_-=2}while(0<_);for(a=g;a!==0;a--)for(r=e.bl_count[a];r!==0;)l<(i=e.heap[--n])||(c[2*i+1]!==a&&(e.opt_len+=(a-c[2*i+1])*c[2*i],c[2*i+1]=a),r--)}}(e,t),V(a,l,e.bl_count)}function K(e,t,n){var r,i,a=-1,o=t[1],s=0,c=7,l=4;for(o===0&&(c=138,l=3),t[2*(n+1)+1]=65535,r=0;r<=n;r++)i=o,o=t[2*(r+1)+1],++s<c&&i===o||(s<l?e.bl_tree[2*i]+=s:i===0?s<=10?e.bl_tree[2*y]++:e.bl_tree[2*b]++:(i!==a&&e.bl_tree[2*i]++,e.bl_tree[2*v]++),a=i,l=(s=0)===o?(c=138,3):i===o?(c=6,3):(c=7,4))}function ne(e,t,n){var r,i,a=-1,o=t[1],s=0,c=7,l=4;for(o===0&&(c=138,l=3),r=0;r<=n;r++)if(i=o,o=t[2*(r+1)+1],!(++s<c&&i===o)){if(s<l)for(;z(e,i,e.bl_tree),--s!=0;);else i===0?s<=10?(z(e,y,e.bl_tree),R(e,s-3,3)):(z(e,b,e.bl_tree),R(e,s-11,7)):(i!==a&&(z(e,i,e.bl_tree),s--),z(e,v,e.bl_tree),R(e,s-3,2));a=i,l=(s=0)===o?(c=138,3):i===o?(c=6,3):(c=7,4)}}o(N);var re=!1;function ie(e,t,n,i){R(e,(s<<1)+ +!!i,3),function(e,t,n,i){U(e),L(e,n),L(e,~n),r.arraySet(e.pending_buf,e.window,t,n,e.pending),e.pending+=n}(e,t,n,!0)}n._tr_init=function(e){re||=(function(){var e,t,n,r,i,a=Array(m+1);for(r=n=0;r<c-1;r++)for(k[r]=n,e=0;e<1<<x[r];e++)O[n++]=r;for(O[n-1]=r,r=i=0;r<16;r++)for(N[r]=i,e=0;e<1<<S[r];e++)D[i++]=r;for(i>>=7;r<d;r++)for(N[r]=i<<7,e=0;e<1<<S[r]-7;e++)D[256+i++]=r;for(t=0;t<=m;t++)a[t]=0;for(e=0;e<=143;)T[2*e+1]=8,e++,a[8]++;for(;e<=255;)T[2*e+1]=9,e++,a[9]++;for(;e<=279;)T[2*e+1]=7,e++,a[7]++;for(;e<=287;)T[2*e+1]=8,e++,a[8]++;for(V(T,u+1,a),e=0;e<d;e++)E[2*e+1]=5,E[2*e]=B(e,5);A=new P(T,x,l+1,u,m),j=new P(E,S,0,d,m),M=new P([],C,0,f,g)}(),!0),e.l_desc=new F(e.dyn_ltree,A),e.d_desc=new F(e.dyn_dtree,j),e.bl_desc=new F(e.bl_tree,M),e.bi_buf=0,e.bi_valid=0,H(e)},n._tr_stored_block=ie,n._tr_flush_block=function(e,t,n,r){var o,s,c=0;0<e.level?(e.strm.data_type===2&&(e.strm.data_type=function(e){var t,n=4093624447;for(t=0;t<=31;t++,n>>>=1)if(1&n&&e.dyn_ltree[2*t]!==0)return i;if(e.dyn_ltree[18]!==0||e.dyn_ltree[20]!==0||e.dyn_ltree[26]!==0)return a;for(t=32;t<l;t++)if(e.dyn_ltree[2*t]!==0)return a;return i}(e)),te(e,e.l_desc),te(e,e.d_desc),c=function(e){var t;for(K(e,e.dyn_ltree,e.l_desc.max_code),K(e,e.dyn_dtree,e.d_desc.max_code),te(e,e.bl_desc),t=f-1;3<=t&&e.bl_tree[2*w[t]+1]===0;t--);return e.opt_len+=3*(t+1)+5+5+4,t}(e),o=e.opt_len+3+7>>>3,(s=e.static_len+3+7>>>3)<=o&&(o=s)):o=s=n+5,n+4<=o&&t!==-1?ie(e,t,n,r):e.strategy===4||s===o?(R(e,2+ +!!r,3),G(e,T,E)):(R(e,4+ +!!r,3),function(e,t,n,r){var i;for(R(e,t-257,5),R(e,n-1,5),R(e,r-4,4),i=0;i<r;i++)R(e,e.bl_tree[2*w[i]+1],3);ne(e,e.dyn_ltree,t-1),ne(e,e.dyn_dtree,n-1)}(e,e.l_desc.max_code+1,e.d_desc.max_code+1,c+1),G(e,e.dyn_ltree,e.dyn_dtree)),H(e),r&&U(e)},n._tr_tally=function(e,t,n){return e.pending_buf[e.d_buf+2*e.last_lit]=t>>>8&255,e.pending_buf[e.d_buf+2*e.last_lit+1]=255&t,e.pending_buf[e.l_buf+e.last_lit]=255&n,e.last_lit++,t===0?e.dyn_ltree[2*n]++:(e.matches++,t--,e.dyn_ltree[2*(O[n]+l+1)]++,e.dyn_dtree[2*I(t)]++),e.last_lit===e.lit_bufsize-1},n._tr_align=function(e){R(e,2,3),z(e,_,T),function(e){e.bi_valid===16?(L(e,e.bi_buf),e.bi_buf=0,e.bi_valid=0):8<=e.bi_valid&&(e.pending_buf[e.pending++]=255&e.bi_buf,e.bi_buf>>=8,e.bi_valid-=8)}(e)}},{"../utils/common":41}],53:[function(e,t,n){t.exports=function(){this.input=null,this.next_in=0,this.avail_in=0,this.total_in=0,this.output=null,this.next_out=0,this.avail_out=0,this.total_out=0,this.msg=``,this.state=null,this.data_type=2,this.adler=0}},{}],54:[function(e,t,n){(function(e){(function(e,t){if(!e.setImmediate){var n,r,i,a,o=1,s={},c=!1,l=e.document,u=Object.getPrototypeOf&&Object.getPrototypeOf(e);u=u&&u.setTimeout?u:e,n={}.toString.call(e.process)===`[object process]`?function(e){process.nextTick(function(){f(e)})}:function(){if(e.postMessage&&!e.importScripts){var t=!0,n=e.onmessage;return e.onmessage=function(){t=!1},e.postMessage(``,`*`),e.onmessage=n,t}}()?(a=`setImmediate$`+Math.random()+`$`,e.addEventListener?e.addEventListener(`message`,p,!1):e.attachEvent(`onmessage`,p),function(t){e.postMessage(a+t,`*`)}):e.MessageChannel?((i=new MessageChannel).port1.onmessage=function(e){f(e.data)},function(e){i.port2.postMessage(e)}):l&&`onreadystatechange`in l.createElement(`script`)?(r=l.documentElement,function(e){var t=l.createElement(`script`);t.onreadystatechange=function(){f(e),t.onreadystatechange=null,r.removeChild(t),t=null},r.appendChild(t)}):function(e){setTimeout(f,0,e)},u.setImmediate=function(e){typeof e!=`function`&&(e=Function(``+e));for(var t=Array(arguments.length-1),r=0;r<t.length;r++)t[r]=arguments[r+1];return s[o]={callback:e,args:t},n(o),o++},u.clearImmediate=d}function d(e){delete s[e]}function f(e){if(c)setTimeout(f,0,e);else{var n=s[e];if(n){c=!0;try{(function(e){var n=e.callback,r=e.args;switch(r.length){case 0:n();break;case 1:n(r[0]);break;case 2:n(r[0],r[1]);break;case 3:n(r[0],r[1],r[2]);break;default:n.apply(t,r)}})(n)}finally{d(e),c=!1}}}}function p(t){t.source===e&&typeof t.data==`string`&&t.data.indexOf(a)===0&&f(+t.data.slice(a.length))}})(typeof self>`u`?e===void 0?this:e:self)}).call(this,typeof global<`u`?global:typeof self<`u`?self:typeof window<`u`?window:{})},{}]},{},[10])(10)})}))();var bt=Object.assign({"/index.html":Ke,"/metadata.json":qe,"/package.json":Je,"/src/App.tsx":Ye,"/src/components/CliSimulator.tsx":Xe,"/src/components/CommandPalette.tsx":Ze,"/src/components/DeployModal.tsx":Qe,"/src/components/ExamView.tsx":$e,"/src/components/Ipv4Trainer.tsx":et,"/src/components/KnowledgeRadar.tsx":tt,"/src/components/LivingOsiStack.tsx":nt,"/src/components/MobileTabBar.tsx":rt,"/src/components/Navbar.tsx":it,"/src/components/OsiExplorer.tsx":at,"/src/components/PacketJourney.tsx":ot,"/src/components/PracticeHub.tsx":st,"/src/components/ProtocolSimulators.tsx":ct,"/src/components/TheoryView.tsx":lt,"/src/components/VlanSimulator.tsx":ut,"/src/data/questionExplanations.ts":dt,"/src/data/questions.json":se,"/src/data/questionsData.ts":ft,"/src/index.css":pt,"/src/main.tsx":mt,"/src/types/quiz.ts":ht,"/src/utils/haptics.ts":gt,"/src/utils/sound.ts":_t,"/tsconfig.json":vt,"/vite.config.ts":yt});async function xt(){try{let e=await fetch(`./export-bundle.json?t=`+Date.now());if(e.ok){let t=await e.json();if(Array.isArray(t)&&t.length>0)return t}}catch{}return[]}function St(e=[]){let t=[];for(let[n,r]of Object.entries(bt)){let i=n.startsWith(`/`)?n.slice(1):n;i===`index.html`&&e.length>0&&(i=`index.dev.html`),t.push({path:i,content:r})}for(let n of e){let e=t.findIndex(e=>e.path===n.path);e>=0?t[e].content=n.content:t.push({path:n.path,content:n.content})}let n={"src/components/PracticeHub.tsx":st,"src/components/Ipv4Trainer.tsx":et,"src/components/Navbar.tsx":it,"src/App.tsx":Ye,"src/components/DeployModal.tsx":Qe};for(let[e,r]of Object.entries(n)){let n=t.findIndex(t=>t.path===e);n>=0?t[n].content=r:t.push({path:e,content:r})}t.some(e=>e.path===`.nojekyll`)||t.push({path:`.nojekyll`,content:``}),t.some(e=>e.path===`.gitignore`)||t.push({path:`.gitignore`,content:`node_modules/
build/
dist/
coverage/
.DS_Store
*.log
.env*
!.env.example
`}),t.some(e=>e.path===`.env.example`)||t.push({path:`.env.example`,content:`GEMINI_API_KEY="MY_GEMINI_API_KEY"
APP_URL="MY_APP_URL"
`});let r=`name: Deploy to GitHub Pages

on:
  push:
    branches: ["main"]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
`,i=t.findIndex(e=>e.path.includes(`deploy.yml`));return i>=0?t[i].content=r:t.push({path:`.github/workflows/deploy.yml`,content:r}),t}function Ct(e){return window.btoa(encodeURIComponent(e).replace(/%([0-9A-F]{2})/g,function(e,t){return String.fromCharCode(parseInt(t,16))}))}async function wt(e){let{token:t,repoName:n}=e,r={Authorization:`Bearer ${t.trim()}`,Accept:`application/vnd.github.v3+json`},i={...r,"Content-Type":`application/json`},a=await fetch(`https://api.github.com/user`,{headers:r});if(!a.ok)throw Error(`Не удалось проверить пользователя GitHub. Проверьте токен.`);let o=(await a.json()).login,s=n.replace(/^.*\//,``).trim();(await fetch(`https://api.github.com/repos/${o}/${s}/pages`,{headers:r})).ok?await fetch(`https://api.github.com/repos/${o}/${s}/pages`,{method:`PUT`,headers:i,body:JSON.stringify({build_type:`workflow`})}).catch(()=>{}):await fetch(`https://api.github.com/repos/${o}/${s}/pages`,{method:`POST`,headers:i,body:JSON.stringify({build_type:`workflow`})}).catch(()=>{});let c=await fetch(`https://api.github.com/repos/${o}/${s}/pages`,{headers:r}),l=`https://${o}.github.io/${s}/`;if(c.ok){let e=await c.json();e.html_url&&(l=e.html_url)}try{await fetch(`https://api.github.com/repos/${o}/${s}/actions/workflows/deploy.yml/dispatches`,{method:`POST`,headers:i,body:JSON.stringify({ref:`main`})})}catch{}return{pageUrl:l,owner:o}}function Tt(e){return e.split(`/`).map(e=>encodeURIComponent(e)).join(`/`)}async function Et(e){let{token:t,repoName:n,isPrivate:r,onProgress:i}=e,a={Authorization:`Bearer ${t.trim()}`,Accept:`application/vnd.github.v3+json`},o={...a,"Content-Type":`application/json`};i(`Проверка авторизации токена...`,0,100);let s=await fetch(`https://api.github.com/user`,{headers:a});if(!s.ok)throw s.status===401?Error(`Недействительный токен GitHub. Проверьте правильность токена.`):Error(`Ошибка авторизации в GitHub (HTTP ${s.status})`);let c=(await s.json()).login;i(`Подготовка репозитория ${c}/${n}...`,10,100);let l=`https://github.com/${c}/${n}`,u=await fetch(`https://api.github.com/repos/${c}/${n}`,{headers:a});if(u.status===404){i(`Создание репозитория "${n}" на GitHub...`,20,100);let e=await fetch(`https://api.github.com/user/repos`,{method:`POST`,headers:o,body:JSON.stringify({name:n,private:r,description:`Mirror Edition project with production bundle`,auto_init:!1})});if(!e.ok){let t=await e.json().catch(()=>({}));throw Error(t.message||`Не удалось создать репозиторий: статус ${e.status}`)}l=(await e.json()).html_url}else if(!u.ok)throw Error(`Ошибка доступа к репозиторию: статус ${u.status}`);i(`Загрузка скомпилированного Production бандла...`,25,100);let d=St(await xt()),f=d.length;for(let e=0;e<f;e++){let t=d[e],r=30+Math.floor((e+1)/f*55);i(`Загрузка файла: ${t.path} (${e+1}/${f})...`,r,100);let s=Tt(t.path),l,u=await fetch(`https://api.github.com/repos/${c}/${n}/contents/${s}`,{headers:a});u.ok&&(l=(await u.json()).sha);let p={message:`Production update ${t.path} from Google AI Studio`,content:Ct(t.content)};l&&(p.sha=l);let m=await fetch(`https://api.github.com/repos/${c}/${n}/contents/${s}`,{method:`PUT`,headers:o,body:JSON.stringify(p)});if(!m.ok){if(t.path.startsWith(`.github/`)){console.warn(`Skipping ${t.path}: GitHub PAT does not have 'workflow' scope`);continue}let e=await m.json().catch(()=>({}));throw Error(`Ошибка загрузки ${t.path}: ${e.message||m.status}`)}}i(`Активация и запуск сборки GitHub Pages...`,90,100);let p=`https://${c}.github.io/${n}/`;try{p=(await wt({token:t,repoName:n})).pageUrl}catch{}let m=`https://github.com/${c}/${n}/actions`;return i(`Готово! Файлы выгружены.`,100,100),{repoUrl:l,owner:c,pageUrl:p,actionsUrl:m}}async function Dt(e){let t=[];try{let n=e.replace(/\/+$/,``)+`/?t=`+Date.now();t.push(`Запрос к серверу: ${n}`);let r=await fetch(n,{cache:`no-store`});if(t.push(`HTTP статус: ${r.status} ${r.statusText}`),!r.ok)return{ok:!1,status:r.status,hasCompiledBundle:!1,hasFreshCode:!1,details:t};let i=await r.text(),a=i.includes(`/src/main.tsx`),o=i.match(/src=["'](\.?\/assets\/index-[^"']+\.js)["']/);if(a&&t.push(`⚠️ Внимание: сайт отдаёт dev HTML со ссылкой на /src/main.tsx`),!o)return t.push(`ℹ️ Скомпилированный бандл assets/index-*.js ещё не проиндексирован CDN`),{ok:!0,status:r.status,hasCompiledBundle:!1,hasFreshCode:!1,details:t};let s=o[1].replace(/^\.?\//,``),c=new URL(s,e).toString()+`?t=`+Date.now();t.push(`Проверка бандла: ${c}`);let l=await fetch(c,{cache:`no-store`});if(!l.ok)return t.push(`Ошибка загрузки бандла: HTTP ${l.status}`),{ok:!0,status:r.status,hasCompiledBundle:!1,hasFreshCode:!1,details:t};let u=await l.text(),d=u.includes(`practice`)||u.includes(`PracticeHub`),f=u.includes(`непрерывн`)||u.includes(`Правило непрерывности`);d&&t.push(`✓ Вкладка «Практика» найдена в сборке`),f&&t.push(`✓ «Правило непрерывности» IPv4 найдено в сборке`);let p=d&&f;return{ok:!0,status:r.status,hasCompiledBundle:!0,hasFreshCode:p,details:t}}catch(e){return t.push(`Сетевая ошибка: ${e.message||String(e)}`),{ok:!1,status:0,hasCompiledBundle:!1,hasFreshCode:!1,details:t}}}var Ot=({isOpen:e,onClose:t})=>{let[n,r]=(0,q.useState)(()=>{try{return localStorage.getItem(`gh_pat_token`)||``}catch{return``}}),[i,o]=(0,q.useState)(`my-gemini-mirror-site`),[u,d]=(0,q.useState)(!1),[f,p]=(0,q.useState)(``),[m,h]=(0,q.useState)(0),[g,_]=(0,q.useState)(``),[y,x]=(0,q.useState)(null),[S,C]=(0,q.useState)(null),[w,T]=(0,q.useState)(!1),[E,D]=(0,q.useState)(null);q.useEffect(()=>{if(!y||!n)return;let e=!0,t=i.replace(/^https?:\/\/github\.com\//i,``).replace(/^.*\//,``).trim()||`my-gemini-mirror-site`,r={Authorization:`Bearer ${n.trim()}`,Accept:`application/vnd.github.v3+json`},a=async()=>{try{let n=await fetch(`https://api.github.com/repos/${y.owner}/${t}/actions/runs?per_page=1`,{headers:r});if(!n.ok)return;let i=(await n.json()).workflow_runs?.[0];i&&e&&D({status:i.status,conclusion:i.conclusion,updatedAt:i.updated_at})}catch{}};a();let o=setInterval(a,6e3);return()=>{e=!1,clearInterval(o)}},[y,n,i]);let O=q.useMemo(()=>{try{return St()}catch{return[]}},[e]),A=O.some(e=>e.path===`index.html`&&e.content.includes(`./assets/index-`)),M=O.some(e=>e.path.startsWith(`assets/`));O.some(e=>e.path.includes(`PracticeHub.tsx`)),O.some(e=>e.path.includes(`Ipv4Trainer.tsx`)&&e.content.includes(`Правило непрерывности`));let N=async e=>{let t=e||(y?y.pageUrl:`https://apotet.github.io/my-gemini-mirror-site/`);T(!0);try{let e=await Dt(t);C(e)}catch{}finally{T(!1)}};return e?(0,J.jsx)(`div`,{className:`fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in`,children:(0,J.jsxs)(`div`,{className:`relative w-full max-w-2xl p-6 sm:p-8 rounded-2xl bg-[#0c1726] border border-cyan-500/40 shadow-2xl text-slate-100 max-h-[92vh] overflow-y-auto`,children:[(0,J.jsx)(`button`,{onClick:t,type:`button`,className:`absolute top-5 right-5 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition-colors cursor-pointer`,"aria-label":`Закрыть`,children:(0,J.jsx)(B,{className:`w-5 h-5`})}),(0,J.jsxs)(`div`,{className:`flex items-center gap-3.5 mb-5`,children:[(0,J.jsx)(`div`,{className:`p-3.5 rounded-xl bg-gradient-to-br from-cyan-500/25 to-blue-500/25 border border-cyan-400/40 text-cyan-400 shadow-lg shadow-cyan-500/10`,children:(0,J.jsx)(a,{className:`w-7 h-7`})}),(0,J.jsxs)(`div`,{children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(`h2`,{className:`text-xl font-bold tracking-tight text-white`,children:`Публикация зеркала на GitHub`}),(0,J.jsx)(`span`,{className:`px-2 py-0.5 rounded text-[11px] font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-400/30`,children:`v2.4 Bundle`})]}),(0,J.jsx)(`p`,{className:`text-xs text-slate-400 mt-0.5`,children:`Единый сайт для iPhone, Android и ПК без логинов и задержек`})]})]}),(0,J.jsxs)(`div`,{className:`p-4 rounded-xl bg-gradient-to-r from-cyan-950/60 via-slate-900 to-blue-950/60 border border-cyan-500/40 mb-5 space-y-3`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between text-xs`,children:[(0,J.jsxs)(`span`,{className:`text-cyan-300 font-bold uppercase tracking-wider flex items-center gap-1.5 text-[11px]`,children:[(0,J.jsx)(R,{className:`w-3.5 h-3.5 text-cyan-400`}),` Единая универсальная ссылка:`]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-2 text-[10px] text-slate-400`,children:[(0,J.jsxs)(`span`,{className:`flex items-center gap-1 text-emerald-400`,children:[(0,J.jsx)(te,{className:`w-3 h-3`}),` Телефон`]}),(0,J.jsx)(`span`,{children:`•`}),(0,J.jsxs)(`span`,{className:`flex items-center gap-1 text-cyan-400`,children:[(0,J.jsx)(ie,{className:`w-3 h-3`}),` Компьютер`]})]})]}),(0,J.jsxs)(`div`,{className:`flex items-center justify-between gap-2 p-3 rounded-lg bg-black/40 border border-slate-700/60`,children:[(0,J.jsxs)(`a`,{href:`https://apotet.github.io/my-gemini-mirror-site/`,target:`_blank`,rel:`noopener noreferrer`,className:`text-xs sm:text-sm font-mono text-cyan-300 hover:underline truncate font-bold flex items-center gap-1.5`,children:[`https://apotet.github.io/my-gemini-mirror-site/`,(0,J.jsx)(l,{className:`w-3.5 h-3.5 flex-shrink-0`})]}),(0,J.jsxs)(`button`,{onClick:()=>N(`https://apotet.github.io/my-gemini-mirror-site/`),disabled:w,type:`button`,className:`px-2.5 py-1 text-[11px] font-semibold rounded bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-300 border border-cyan-400/30 transition-colors flex items-center gap-1 flex-shrink-0 cursor-pointer`,children:[(0,J.jsx)(U,{className:`w-3 h-3`}),w?`Проверка...`:`Тест ссылки`]})]}),(0,J.jsxs)(`div`,{className:`text-[11px] text-slate-300 space-y-1`,children:[(0,J.jsxs)(`p`,{children:[`💡 `,(0,J.jsx)(`strong`,{children:`Почему ссылка Google Cloud (.run.app) не открывалась на телефоне:`}),` адреса предпросмотра среды разработки защищены сессией Google. На iPhone/Android без входа в тот же аккаунт Google система возвращает ошибку.`]}),(0,J.jsxs)(`p`,{className:`text-slate-400`,children:[`Ссылка на `,(0,J.jsx)(`strong`,{children:`GitHub Pages выше`}),` — полностью публичная, доступна любому устройству и браузеру (Safari, Chrome, Telegram) без каких-либо логинов.`]})]})]}),S&&(0,J.jsxs)(`div`,{className:`p-3.5 rounded-xl border mb-5 text-xs space-y-2 ${S.ok&&S.hasFreshCode?`bg-emerald-950/50 border-emerald-500/50 text-emerald-200`:`bg-amber-950/50 border-amber-500/50 text-amber-200`}`,children:[(0,J.jsxs)(`div`,{className:`font-bold flex items-center justify-between`,children:[(0,J.jsxs)(`span`,{className:`flex items-center gap-1.5`,children:[S.ok&&S.hasFreshCode?(0,J.jsx)(v,{className:`w-4 h-4 text-emerald-400`}):(0,J.jsx)(b,{className:`w-4 h-4 text-amber-400`}),`Результат проверки публичного URL (HTTP `,S.status,`)`]}),(0,J.jsx)(`span`,{className:`text-[10px] font-mono opacity-80`,children:`Live Check`})]}),(0,J.jsx)(`ul`,{className:`text-[11px] space-y-1 pl-1 opacity-90`,children:S.details.map((e,t)=>(0,J.jsx)(`li`,{children:e},t))}),S.ok&&!S.hasFreshCode&&(0,J.jsx)(`p`,{className:`text-[11px] font-semibold text-amber-300 pt-1 border-t border-amber-500/20`,children:`⚡ Для обновления сайта нажмите кнопку публикации ниже. В репозиторий отправится готовая production-сборка (7 файлов), и сайт сразу обновится.`})]}),A&&M?(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-[11px] text-emerald-300 flex items-center justify-between mb-4`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(j,{className:`w-4 h-4 text-emerald-400 flex-shrink-0`}),(0,J.jsxs)(`span`,{children:[(0,J.jsx)(`strong`,{children:`Production Bundle готов (v2.4):`}),` Скомпилированные JS/CSS файлы включены. GitHub Pages запустится мгновенно без необходимости компиляции Node.js.`]})]}),(0,J.jsxs)(`button`,{onClick:()=>{window.location.href=window.location.origin+window.location.pathname+`?reload=`+Date.now()},type:`button`,title:`Перезагрузить код`,className:`px-2 py-1 text-emerald-300 hover:text-white rounded bg-emerald-900/60 hover:bg-emerald-800 text-[10px] font-mono cursor-pointer flex items-center gap-1`,children:[(0,J.jsx)(z,{className:`w-3 h-3`}),`Сброс`]})]}):(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-amber-950/40 border border-amber-500/40 text-[11px] text-amber-200 flex items-center gap-2 mb-4`,children:[(0,J.jsx)(b,{className:`w-4 h-4 text-amber-400 flex-shrink-0`}),(0,J.jsx)(`span`,{children:`Подготовка бандла... При первой синхронизации создаются скомпилированные ассеты.`})]}),(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-slate-900/70 border border-slate-800 text-[11px] text-slate-300 space-y-1 mb-5`,children:[(0,J.jsxs)(`span`,{className:`font-semibold text-cyan-300 flex items-center gap-1.5`,children:[(0,J.jsx)(R,{className:`w-3.5 h-3.5`}),` Включено в это обновление:`]}),(0,J.jsxs)(`ul`,{className:`list-disc list-inside text-slate-400 space-y-0.5 pl-1`,children:[(0,J.jsxs)(`li`,{children:[(0,J.jsx)(`strong`,{className:`text-slate-200`,children:`IPv4 Тренажёр:`}),` непрерывные биты маски (перед 1 не бывает 0, клик по 2 или 1 ставит единицы).`]}),(0,J.jsxs)(`li`,{children:[(0,J.jsx)(`strong`,{className:`text-slate-200`,children:`Вкладка «Практика»:`}),` все 4 симулятора (Путь пакета, VLAN, Протоколы, CLI) в одном хабе.`]}),(0,J.jsxs)(`li`,{children:[(0,J.jsx)(`strong`,{className:`text-slate-200`,children:`Production-бандл в корне:`}),` полное решение проблемы с открытием на iPhone/Safari.`]})]})]}),y?(0,J.jsxs)(`div`,{className:`p-5 rounded-xl bg-emerald-950/40 border border-emerald-500/50 space-y-4`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-3 text-emerald-300`,children:[(0,J.jsx)(v,{className:`w-6 h-6 flex-shrink-0`}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`h3`,{className:`font-bold text-base`,children:`Файлы успешно выгружены на GitHub!`}),(0,J.jsx)(`p`,{className:`text-xs text-emerald-400/90`,children:`Скомпилированная сборка и исходный код отправлены в репозиторий.`})]})]}),(0,J.jsx)(`div`,{className:`p-3.5 rounded-xl bg-slate-900/90 border border-cyan-500/40 space-y-2`,children:(0,J.jsxs)(`div`,{className:`flex items-center justify-between text-xs`,children:[(0,J.jsx)(`span`,{className:`text-slate-300 font-semibold flex items-center gap-1.5`,children:`Статус автосборки GitHub:`}),E?.status===`in_progress`||E?.status===`queued`?(0,J.jsxs)(`span`,{className:`flex items-center gap-1.5 text-amber-400 font-mono font-bold animate-pulse`,children:[(0,J.jsx)(`span`,{className:`w-2 h-2 rounded-full bg-amber-400`}),`Публикация страниц... (~15 сек)`]}):E?.conclusion===`success`?(0,J.jsxs)(`span`,{className:`flex items-center gap-1.5 text-emerald-400 font-mono font-bold`,children:[(0,J.jsx)(`span`,{className:`w-2 h-2 rounded-full bg-emerald-400`}),`Готово! Сайт обновлён`]}):(0,J.jsx)(`span`,{className:`text-emerald-300 font-mono text-[11px]`,children:`✓ Бандл отправлен (статический деплой)`})]})}),(0,J.jsxs)(`div`,{className:`space-y-2 text-xs`,children:[(0,J.jsxs)(`div`,{className:`flex items-center justify-between p-2.5 rounded-lg bg-black/40 border border-cyan-500/20`,children:[(0,J.jsx)(`span`,{className:`text-slate-400`,children:`Единая ссылка для телефона и ПК:`}),(0,J.jsxs)(`a`,{href:y.pageUrl,target:`_blank`,rel:`noopener noreferrer`,className:`font-mono text-cyan-300 hover:underline flex items-center gap-1 font-bold`,children:[y.pageUrl,(0,J.jsx)(l,{className:`w-3 h-3`})]})]}),(0,J.jsxs)(`div`,{className:`flex items-center justify-between p-2.5 rounded-lg bg-black/30`,children:[(0,J.jsx)(`span`,{className:`text-slate-400`,children:`Репозиторий GitHub:`}),(0,J.jsxs)(`a`,{href:y.repoUrl,target:`_blank`,rel:`noopener noreferrer`,className:`font-mono text-slate-300 hover:underline flex items-center gap-1`,children:[y.owner,`/`,i,(0,J.jsx)(l,{className:`w-3 h-3`})]})]})]}),(0,J.jsxs)(`div`,{className:`flex gap-2.5 pt-2`,children:[(0,J.jsxs)(`button`,{onClick:()=>N(y.pageUrl),disabled:w,type:`button`,className:`flex-1 py-2.5 px-3 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer`,children:[(0,J.jsx)(U,{className:`w-3.5 h-3.5`}),w?`Проверка...`:`Проверить обновление на сайте`]}),(0,J.jsx)(`button`,{onClick:()=>{x(null),D(null)},type:`button`,className:`py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer`,children:`Снова`})]})]}):(0,J.jsxs)(`div`,{className:`space-y-4`,children:[n.trim()?(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-cyan-950/60 border border-cyan-400/50 flex items-center justify-between text-xs text-cyan-200`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(v,{className:`w-4 h-4 text-emerald-400 shrink-0`}),(0,J.jsxs)(`div`,{children:[(0,J.jsx)(`span`,{className:`font-bold text-white`,children:`Токен GitHub найден в памяти браузера: `}),(0,J.jsxs)(`span`,{className:`font-mono text-[11px] text-cyan-300`,children:[n.trim().slice(0,7),`••••••••••••••••••••`]})]})]}),(0,J.jsx)(`button`,{onClick:()=>r(``),type:`button`,className:`text-[10px] text-slate-400 hover:text-white underline cursor-pointer`,children:`Сменить`})]}):(0,J.jsxs)(`div`,{children:[(0,J.jsxs)(`label`,{className:`block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5`,children:[(0,J.jsx)(k,{className:`w-3.5 h-3.5 text-cyan-400`}),`Персональный токен GitHub (PAT)`]}),(0,J.jsx)(`input`,{type:`password`,value:n,onChange:e=>r(e.target.value),placeholder:`ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx`,className:`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all`}),(0,J.jsxs)(`p`,{className:`text-[11px] text-slate-400 mt-1`,children:[`Токен сохраняется в локальной памяти вашего браузера. Требуется право `,(0,J.jsx)(`code`,{className:`text-cyan-300`,children:`repo`}),`.`]})]}),(0,J.jsxs)(`div`,{children:[(0,J.jsxs)(`label`,{className:`block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5`,children:[(0,J.jsx)(s,{className:`w-3.5 h-3.5 text-cyan-400`}),`Имя репозитория`]}),(0,J.jsx)(`input`,{type:`text`,value:i,onChange:e=>o(e.target.value),placeholder:`my-gemini-mirror-site`,className:`w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all`})]}),g&&(0,J.jsxs)(`div`,{className:`p-3 rounded-xl bg-rose-950/50 border border-rose-500/50 text-rose-300 text-xs flex items-start gap-2`,children:[(0,J.jsx)(b,{className:`w-4 h-4 flex-shrink-0 mt-0.5`}),(0,J.jsx)(`span`,{children:g})]}),u&&(0,J.jsxs)(`div`,{className:`space-y-2 p-3 rounded-xl bg-slate-900/80 border border-cyan-500/30`,children:[(0,J.jsxs)(`div`,{className:`flex justify-between text-xs text-slate-300`,children:[(0,J.jsx)(`span`,{className:`truncate pr-2 font-mono text-[11px]`,children:f}),(0,J.jsxs)(`span`,{className:`font-bold text-cyan-400`,children:[m,`%`]})]}),(0,J.jsx)(`div`,{className:`w-full h-2 rounded-full bg-slate-800 overflow-hidden`,children:(0,J.jsx)(`div`,{className:`h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-300 rounded-full`,style:{width:`${m}%`}})})]}),(0,J.jsxs)(`div`,{className:`pt-2 flex flex-col sm:flex-row gap-2.5`,children:[(0,J.jsxs)(`button`,{onClick:async()=>{if(!n.trim())_(`Пожалуйста, введите ваш токен доступа GitHub (PAT).`);else{_(``),d(!0),h(5),p(`Инициализация выгрузки...`);try{localStorage.setItem(`gh_pat_token`,n.trim())}catch{}try{let e=i.replace(/^https?:\/\/github\.com\//i,``).replace(/^.*\//,``).trim()||`my-gemini-mirror-site`;p(`Синхронизация через серверный мост...`),h(20);try{let t=await fetch(`/api/publish-github`,{method:`POST`,headers:{"Content-Type":`application/json`},body:JSON.stringify({token:n.trim(),repoName:e})});if(t.ok){let e=await t.json();if(e.success){h(100),p(`Готово! Зеркало успешно опубликовано.`),x(e),setTimeout(()=>{N(e.pageUrl)},1500);return}}else{let e=await t.json().catch(()=>({}));if(e.error&&(t.status===401||e.error.includes(`Bad credentials`)))throw Error(`Недействительный токен GitHub (Bad credentials). Проверьте правильность токена.`);if(e.error)throw Error(e.error)}}catch(e){if(e.message&&!e.message.includes(`Failed to fetch`)&&!e.message.includes(`404`))throw e;console.warn(`Server bridge unavailable, falling back to direct browser push:`,e)}p(`Прямая выгрузка в GitHub...`);let t=await Et({token:n.trim(),repoName:e,isPrivate:!1,onProgress:(e,t)=>{p(e),h(t)}});x(t),setTimeout(()=>{N(t.pageUrl)},1500)}catch(e){console.error(e);let t=e.message||`Ошибка синхронизации с GitHub.`;(t.includes(`Load failed`)||t.includes(`Failed to fetch`))&&(t=`Браузер Safari заблокировал прямой запрос к GitHub API. Мы переключили режим на серверную выгрузку — пожалуйста, нажмите кнопку ещё раз.`),_(t)}finally{d(!1)}}},disabled:u,type:`button`,className:`flex-1 py-3 px-4 rounded-xl font-bold text-xs bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 hover:brightness-110 active:scale-[0.99] disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-cyan-500/20 cursor-pointer min-h-[44px]`,children:[(0,J.jsx)(R,{className:`w-4 h-4`}),u?`Выгрузка и компиляция...`:`Опубликовать зеркало в 1 клик`]}),(0,J.jsxs)(`button`,{onClick:()=>{let e=document.createElement(`a`);e.href=`/osi-tcpip-trainer-source.zip`,e.download=`osi-tcpip-trainer-source.zip`,document.body.appendChild(e),e.click(),document.body.removeChild(e)},type:`button`,className:`py-3 px-4 rounded-xl font-semibold text-xs bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all flex items-center justify-center gap-2 min-h-[44px] cursor-pointer`,children:[(0,J.jsx)(c,{className:`w-4 h-4`}),`Скачать ZIP`]})]})]})]})}):null},kt=({activeTab:e,onTabChange:t})=>{let n=[{id:`exam`,label:`Экзамен`},{id:`theory`,label:`Теория`},{id:`ipv4`,label:`IPv4`},{id:`practice`,label:`Практика`}],r=e=>{X(`selection`),t(e)};return(0,J.jsx)(`nav`,{className:`fixed bottom-0 left-0 right-0 z-40 lg:hidden bg-[#07111f]/96 backdrop-blur-2xl border-t border-cyan-500/20 px-3 pt-2 pb-5 shadow-[0_-8px_24px_rgba(0,0,0,0.6)] select-none`,style:{paddingBottom:`max(1.25rem, env(safe-area-inset-bottom, 1.25rem))`},children:(0,J.jsx)(`div`,{className:`grid grid-cols-4 max-w-md mx-auto items-center`,children:n.map(t=>{let n=e===t.id||t.id===`theory`&&e===`osi`;return(0,J.jsxs)(`button`,{onClick:()=>r(t.id),type:`button`,className:`flex flex-col items-center justify-center gap-1.5 py-1 px-2 cursor-pointer transition-all group`,children:[(0,J.jsx)(`div`,{className:`relative w-4 h-4 flex items-center justify-center`,children:n?(0,J.jsxs)(J.Fragment,{children:[(0,J.jsx)(`span`,{className:`absolute w-4 h-4 rounded-full bg-cyan-400/30 animate-ping pointer-events-none`}),(0,J.jsx)(`span`,{className:`w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_10px_#22d3ee]`})]}):(0,J.jsx)(`span`,{className:`w-2.5 h-2.5 rounded-full border border-slate-600 group-hover:border-slate-400 transition-colors`})}),(0,J.jsx)(`span`,{className:`text-[11px] font-bold tracking-tight transition-colors ${n?`text-cyan-300 font-extrabold`:`text-slate-400 group-hover:text-slate-200`}`,children:t.label})]},t.id)})})})},At=({isOpen:e,onClose:t,onSelectTab:n,onSelectLayer:r,onToggleTheme:i,onOpenDeploy:o,isDark:s})=>{let[l,u]=(0,q.useState)(``),[d,f]=(0,q.useState)(0),p=(0,q.useRef)(null);(0,q.useEffect)(()=>{e&&setTimeout(()=>p.current?.focus(),50)},[e]);let m=[{id:`tab-exam`,title:`Экзамен — Режим тестирования`,category:`Навигация`,shortcut:`1`,icon:(0,J.jsx)(K,{className:`w-4 h-4 text-cyan-400`}),action:()=>n(`exam`)},{id:`tab-theory`,title:`Теория и подробные разборы вопросов`,category:`Навигация`,shortcut:`2`,icon:(0,J.jsx)(T,{className:`w-4 h-4 text-indigo-400`}),action:()=>n(`theory`)},{id:`tab-ipv4`,title:`IPv4 Тренажёр — Расчёт масок и подсетей`,category:`Навигация`,shortcut:`3`,icon:(0,J.jsx)(ae,{className:`w-4 h-4 text-emerald-400`}),action:()=>n(`ipv4`)},{id:`tab-practice`,title:`Интерактивная практика — Симуляторы и CLI`,category:`Навигация`,shortcut:`4`,icon:(0,J.jsx)(W,{className:`w-4 h-4 text-amber-400`}),action:()=>n(`practice`)},{id:`layer-l7`,title:`L7 Прикладной уровень (HTTP/3, DNS, DHCP)`,category:`Уровни OSI`,shortcut:`L7`,icon:(0,J.jsx)(`span`,{className:`font-mono text-xs font-bold text-pink-400`,children:`L7`}),action:()=>r(`L7`)},{id:`layer-l4`,title:`L4 Транспортный уровень (TCP 3-way, UDP, Порты)`,category:`Уровни OSI`,shortcut:`L4`,icon:(0,J.jsx)(`span`,{className:`font-mono text-xs font-bold text-cyan-400`,children:`L4`}),action:()=>r(`L4`)},{id:`layer-l3`,title:`L3 Сетевой уровень (IPv4/IPv6, TTL, Маршрутизация)`,category:`Уровни OSI`,shortcut:`L3`,icon:(0,J.jsx)(`span`,{className:`font-mono text-xs font-bold text-teal-400`,children:`L3`}),action:()=>r(`L3`)},{id:`layer-l2`,title:`L2 Канальный уровень (Ethernet, MAC, VLAN 802.1Q)`,category:`Уровни OSI`,shortcut:`L2`,icon:(0,J.jsx)(`span`,{className:`font-mono text-xs font-bold text-emerald-400`,children:`L2`}),action:()=>r(`L2`)},{id:`layer-l1`,title:`L1 Физический уровень (Оптика, SFP, витая пара)`,category:`Уровни OSI`,shortcut:`L1`,icon:(0,J.jsx)(`span`,{className:`font-mono text-xs font-bold text-amber-400`,children:`L1`}),action:()=>r(`L1`)},{id:`action-zip`,title:`Скачать полный ZIP архив проекта`,category:`Инструменты`,shortcut:`ZIP`,icon:(0,J.jsx)(c,{className:`w-4 h-4 text-emerald-400`}),action:()=>{window.location.href=`/osi-tcpip-trainer-source.zip`}},{id:`action-deploy`,title:`Синхронизация зеркала с GitHub Pages`,category:`Инструменты`,icon:(0,J.jsx)(a,{className:`w-4 h-4 text-cyan-400`}),action:o},{id:`action-theme`,title:s?`Переключить на светлую тему`:`Переключить на тёмную тему`,category:`Система`,icon:s?(0,J.jsx)(A,{className:`w-4 h-4 text-amber-400`}):(0,J.jsx)(P,{className:`w-4 h-4 text-indigo-400`}),action:i}].filter(e=>{if(!l.trim())return!0;let t=l.toLowerCase();return e.title.toLowerCase().includes(t)||e.category.toLowerCase().includes(t)||e.shortcut&&e.shortcut.toLowerCase().includes(t)});return e?(0,J.jsx)(`div`,{className:`fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 px-4 bg-black/75 backdrop-blur-md animate-fade-in`,children:(0,J.jsxs)(`div`,{className:`w-full max-w-xl rounded-2xl bg-[#091524] border border-cyan-500/30 shadow-2xl overflow-hidden flex flex-col text-slate-100`,onKeyDown:e=>{e.key===`ArrowDown`?(e.preventDefault(),f(e=>(e+1)%Math.max(1,m.length))):e.key===`ArrowUp`?(e.preventDefault(),f(e=>(e-1+m.length)%Math.max(1,m.length))):e.key===`Enter`?(e.preventDefault(),m[d]&&(X(`selection`),m[d].action(),t())):e.key===`Escape`&&t()},children:[(0,J.jsxs)(`div`,{className:`p-3.5 border-b border-slate-800 flex items-center gap-3 bg-slate-900/80`,children:[(0,J.jsx)(H,{className:`w-4 h-4 text-cyan-400 shrink-0`}),(0,J.jsx)(`input`,{ref:p,type:`text`,value:l,onChange:e=>{u(e.target.value),f(0)},placeholder:`Быстрый поиск команд, уровней OSI (L1-L7), тем и разделов...`,className:`flex-1 bg-transparent border-0 text-white placeholder-slate-400 text-xs sm:text-sm focus:outline-none font-mono`}),(0,J.jsx)(`button`,{onClick:t,type:`button`,className:`p-1 rounded text-slate-400 hover:text-white transition-colors cursor-pointer text-xs`,children:`Esc`})]}),(0,J.jsx)(`div`,{className:`max-h-80 overflow-y-auto p-2 space-y-1`,children:m.length===0?(0,J.jsx)(`div`,{className:`p-6 text-center text-xs text-slate-400`,children:`Команд не найдено. Попробуйте другой запрос.`}):m.map((e,n)=>(0,J.jsxs)(`div`,{onClick:()=>{X(`selection`),e.action(),t()},className:`p-2.5 rounded-xl flex items-center justify-between text-xs cursor-pointer transition-colors ${d===n?`bg-cyan-950/70 text-white border border-cyan-400/40`:`text-slate-300 hover:bg-slate-800/60`}`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-3`,children:[(0,J.jsx)(`div`,{className:`w-6 h-6 rounded-lg bg-black/40 flex items-center justify-center shrink-0`,children:e.icon}),(0,J.jsx)(`span`,{className:`font-medium`,children:e.title})]}),(0,J.jsxs)(`div`,{className:`flex items-center gap-2`,children:[(0,J.jsx)(`span`,{className:`text-[10px] font-mono text-slate-500 uppercase`,children:e.category}),e.shortcut&&(0,J.jsx)(`kbd`,{className:`px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px] border border-slate-700`,children:e.shortcut})]})]},e.id))}),(0,J.jsxs)(`div`,{className:`p-2.5 bg-slate-950/90 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400 font-mono`,children:[(0,J.jsx)(`span`,{children:`Навигация: ↑ ↓`}),(0,J.jsx)(`span`,{children:`Выбрать: Enter`})]})]})}):null};function jt(){let[e,t]=(0,q.useState)(`exam`),[n,r]=(0,q.useState)(!0),[i,a]=(0,q.useState)(!0),[o,s]=(0,q.useState)(!1),[c,l]=(0,q.useState)(!1),[u,d]=(0,q.useState)(null),[f,p]=(0,q.useState)(void 0),[m,h]=(0,q.useState)(void 0);return(0,q.useEffect)(()=>{let e=e=>{(e.metaKey||e.ctrlKey)&&e.key.toLowerCase()===`k`&&(e.preventDefault(),l(e=>!e))};return window.addEventListener(`keydown`,e),()=>window.removeEventListener(`keydown`,e)},[]),(0,q.useEffect)(()=>{n?document.documentElement.classList.add(`dark`):document.documentElement.classList.remove(`dark`)},[n]),(0,J.jsxs)(`div`,{className:`min-h-screen w-full max-w-full overflow-x-hidden bg-[#07111f] text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black`,children:[(0,J.jsx)(`div`,{className:`w-full bg-gradient-to-r from-cyan-950/90 via-slate-900 to-blue-950/90 border-b border-cyan-500/20 py-2 px-3 sm:px-4 text-xs`,children:(0,J.jsxs)(`div`,{className:`max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5 sm:gap-2`,children:[(0,J.jsxs)(`div`,{className:`flex items-center gap-2 min-w-0`,children:[(0,J.jsx)(`span`,{className:`flex h-2 w-2 rounded-full bg-cyan-400 animate-pulse shrink-0`}),(0,J.jsxs)(`span`,{className:`text-slate-300 text-[11px] sm:text-xs truncate`,children:[(0,J.jsx)(`strong`,{className:`text-cyan-300`,children:`Резервное зеркало Gemini`}),` для тренажёра OSI/TCP-IP`]})]}),(0,J.jsxs)(`div`,{className:`flex items-center flex-wrap gap-x-3 gap-y-1 text-[11px] min-w-0`,children:[(0,J.jsxs)(`a`,{href:`https://apotet.github.io/osi-tcpip-exam-public/`,target:`_blank`,rel:`noopener noreferrer`,className:`text-emerald-400 hover:underline flex items-center gap-1 font-mono shrink-0`,title:`Оригинальный сайт тренажера от ChatGPT`,children:[(0,J.jsx)(`span`,{children:`Оригинал: osi-tcpip`}),(0,J.jsx)(E,{className:`w-3 h-3 shrink-0`})]}),(0,J.jsxs)(`a`,{href:`https://apotet.github.io/my-gemini-mirror-site/`,target:`_blank`,rel:`noopener noreferrer`,className:`text-cyan-300 hover:underline flex items-center gap-1 font-mono font-bold shrink-0`,title:`Зеркало тренажера от Gemini`,children:[(0,J.jsx)(`span`,{children:`Зеркало: my-gemini`}),(0,J.jsx)(E,{className:`w-3 h-3 shrink-0`})]})]})]})}),(0,J.jsx)(le,{activeTab:e,onTabChange:e=>{t(e),e!==`theory`&&d(null)},isDark:n,onToggleTheme:()=>r(!n),soundEnabled:i,onToggleSound:()=>a(!i),onOpenDeploy:()=>s(!0),onOpenCommandPalette:()=>l(!0)}),(0,J.jsxs)(`main`,{className:`flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8`,children:[e===`exam`&&(0,J.jsx)(xe,{soundEnabled:i,onNavigateToTheory:e=>{d(e),t(`theory`),window.scrollTo({top:0,behavior:`smooth`})}}),(e===`theory`||e===`osi`)&&(0,J.jsx)(Ge,{initialQuestionId:u,onNavigateToIpv4:(e,n)=>{e&&p(e),n===`calc`?h(`calculator`):n===`trainer`&&h(`practice`),t(`ipv4`),window.scrollTo({top:0,behavior:`smooth`})},onClearInitialQuestion:()=>d(null)}),e===`ipv4`&&(0,J.jsx)(Te,{soundEnabled:i,initialPrefix:f,initialSubTab:m}),e===`practice`&&(0,J.jsx)(Ne,{})]}),(0,J.jsx)(kt,{activeTab:e,onTabChange:e=>{t(e),e!==`theory`&&d(null)}}),(0,J.jsx)(At,{isOpen:c,onClose:()=>l(!1),onSelectTab:e=>{t(e),e!==`theory`&&d(null)},onSelectLayer:e=>{t(`theory`),window.scrollTo({top:0,behavior:`smooth`})},onToggleTheme:()=>r(!n),onOpenDeploy:()=>s(!0),isDark:n}),(0,J.jsx)(`footer`,{className:`border-t border-cyan-500/20 py-8 px-4 bg-[#050c17]/90 text-slate-400 text-xs mt-12`,children:(0,J.jsxs)(`div`,{className:`max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4`,children:[(0,J.jsxs)(`div`,{className:`space-y-1 text-center sm:text-left`,children:[(0,J.jsxs)(`div`,{className:`font-bold text-slate-200 flex items-center justify-center sm:justify-start gap-1.5`,children:[(0,J.jsx)(`span`,{children:`OSI & TCP/IP Exam Trainer`}),(0,J.jsx)(`span`,{className:`text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 font-mono`,children:`Gemini Edition`})]}),(0,J.jsx)(`p`,{className:`text-[11px] text-slate-500`,children:`502 практических вопроса, симуляции L2/L3 протоколов и CLI-терминал.`})]}),(0,J.jsxs)(`div`,{className:`flex items-center flex-wrap gap-x-4 gap-y-2 text-xs font-mono`,children:[(0,J.jsx)(`a`,{href:`/osi-tcpip-trainer-source.zip`,download:`osi-tcpip-trainer-source.zip`,className:`text-emerald-400 hover:underline cursor-pointer font-bold flex items-center gap-1`,title:`Скачать полный ZIP архив проекта с исходным кодом`,children:(0,J.jsx)(`span`,{children:`📦 Скачать ZIP исходник`})}),(0,J.jsx)(`span`,{children:`•`}),(0,J.jsx)(`button`,{onClick:()=>s(!0),type:`button`,className:`text-cyan-400 hover:underline cursor-pointer`,children:`Синхронизировать с GitHub`}),(0,J.jsx)(`span`,{children:`•`}),(0,J.jsx)(`a`,{href:`https://github.com/apotet/osi-tcpip-exam-public`,target:`_blank`,rel:`noopener noreferrer`,className:`hover:text-white transition-colors`,children:`Исходный репозиторий`})]})]})}),(0,J.jsx)(Ot,{isOpen:o,onClose:()=>s(!1)})]})}(0,ce.createRoot)(document.getElementById(`root`)).render((0,J.jsx)(jt,{}));