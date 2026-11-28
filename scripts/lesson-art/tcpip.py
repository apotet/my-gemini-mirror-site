"""Original static Russian TCP/IP artwork for issue #556. Run from repo root."""
from pathlib import Path
from html import escape as e
P=Path('public/lesson-images'); P.mkdir(exist_ok=True)
C=['#60b5ff','#9ddb70','#ffbd61','#c3a2ff']
def text(x,y,s,size=16,color='#eaf1ff',bold=False):
 return f'<text x="{x}" y="{y}" font-size="{size}" fill="{color}" font-weight="{700 if bold else 400}">{e(s)}</text>'
def rect(x,y,w,h,c='#13273e',r=12):
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{c}"/>'
def arrow(y):
 return f'<path d="M160 {y}v22m-5-6 5 6 5-6" stroke="#a5bbd3" stroke-width="2" fill="none"/>'
def icon(kind,x,y,c):
 shapes={
 'pc':'<rect x="2" y="2" width="58" height="39" rx="4"/><path d="M22 43v8h20v-8M12 54h40"/><path d="m12 26 10-10 8 8 8-12 12 14"/>',
 'server':'<rect x="10" y="0" width="42" height="58" rx="5"/><path d="M16 15h30M16 30h30M16 45h30"/><circle cx="20" cy="9" r="1"/><circle cx="20" cy="24" r="1"/><circle cx="20" cy="39" r="1"/>',
 'switch':'<path d="m2 15 16-10h34l9 10v30H2Z"/><path d="M2 15h59M10 27h6v8h-6zm12 0h6v8h-6zm12 0h6v8h-6zm12 0h6v8h-6z"/>',
 'router':'<ellipse cx="32" cy="15" rx="28" ry="12"/><path d="M4 15v29c0 16 56 16 56 0V15M18 15h28m-6-5 6 5-6 5M32 7v17m-5-5 5 5 5-5"/>',
 'app':'<rect x="2" y="2" width="58" height="51" rx="5"/><path d="M2 14h58M10 8h3m4 0h3m4 0h3M12 26h36M12 35h24M12 44h30"/>',
 'cable':'<path d="M0 48h18q12 0 12-12V22h20V6H30v16m5-14v10m5-10v10m5-10v10"/>',
 'wifi':'<path d="M3 18q28-28 56 0M12 28q19-19 38 0M22 38q9-9 18 0"/><circle cx="31" cy="47" r="3"/>',
 }
 return f'<g transform="translate({x} {y})" stroke="{c}" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">{shapes[kind]}</g>'
def save(name,title,h,body):
 h+=32 # Reserve room for the existing image expansion affordance.
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 {h}" role="img" aria-labelledby="t"><title id="t">{e(title)}</title><rect width="320" height="{h}" rx="18" fill="#091728"/><g font-family="Arial, sans-serif">{body}</g></svg>'
 (P/f'tcpip-{name}.svg').write_text(svg)
def card(y,title,lines,c,kind=None):
 s=rect(10,y,300,55+len(lines)*24)+f'<path d="M12 {y+16}v{20+len(lines)*24}" stroke="{c}" stroke-width="4"/>'
 if kind:s+=icon(kind,235,y+14,c)
 s+=text(24,y+29,title,18,c,True)
 for i,line in enumerate(lines):s+=text(24,y+59+i*24,line)
 return s
s=text(20,30,'Одна страница — четыре задачи',17,bold=True)
s+=icon('pc',25,53,C[0])+icon('server',229,53,C[0])+text(99,85,'запрос →',16,C[0])
for y,title,sub,c in zip([134,222,310,398],['4 · Смысл сообщения','3 · Нужная программа','2 · Нужная сеть','1 · Ближайший сосед'],['HTTP: «Дай страницу»','TCP: порт службы 80','IP: адрес сервера','Ethernet: MAC шлюза'],C):
 s+=rect(12,y,296,72)+text(24,y+28,title,18,c,True)+text(24,y+54,sub)
s+=text(20,504,'Протокол = общие правила обмена',16,bold=True)
s+=text(20,532,'Оба узла понимают одни правила.')
save('why','Два узла используют общие правила четырёх уровней',552,s)
s=''
rows=[('4 · Прикладной','Application','Задача: сообщения приложений',['HTTP/HTTPS · DNS · DHCP','SMTP · FTP · SNMP','Данные: сообщение'],'app'),('3 · Транспортный','Transport','Задача: доставка программам',['TCP / UDP · номера портов','TCP: сегмент · UDP: датаграмма','Работает в конечных узлах'],'pc'),('2 · Межсетевой','Internet','Задача: доставка между сетями',['IPv4 / IPv6 · ICMP','Данные: IP-пакет','Адреса: IP · маршрутизатор'],'router'),('1 · Сетевой доступ','Link / Network Access','Задача: местная передача',['Ethernet / Wi-Fi · MAC','Данные: кадр → биты → сигналы','Карта, коммутатор, кабель'],'switch')]
for i,(title,en,task,lines,k) in enumerate(rows):
 y=12+i*222;s+=rect(10,y,300,210)+text(24,y+29,title,19,C[i],True)+text(24,y+51,en,14,'#acbdd2')+f'<g transform="translate(240 {y+58}) scale(.7)">'+icon(k,0,0,C[i])+'</g>'+text(24,y+117,task,15)
 for j,l in enumerate(lines):s+=text(24,y+146+j*24,l,16)
s+=icon('cable',55,910,C[3])+icon('wifi',210,910,C[3])+text(34,985,'Кабель Ethernet',15,C[3])+text(216,985,'Wi-Fi',15,C[3])
save('layers','Четыре уровня: назначение, протоколы, устройства и данные',1005,s)
s=text(20,30,'OSI → TCP/IP',20,bold=True)
for y,c,title,lines in [(52,C[0],'7 + 6 + 5 → 4 · Прикладной',['7 Прикладной · 6 Представления','5 Сеансовый']), (174,C[1],'4 → 3 · Транспортный',['Доставка между программами']), (272,C[2],'3 → 2 · Межсетевой',['IP-адреса и выбор пути']), (370,C[3],'2 + 1 → 1 · Сетевой доступ',['2 Канальный · 1 Физический'])]:s+=card(y,title,lines,c)
s+=text(20,490,'Это соответствие функций,',16)+text(20,514,'а не обязательных заголовков.',16)
save('osi','Условное соответствие семи уровней OSI четырём TCP/IP',538,s)
# Fully visible nesting: one row per header avoids unreadably small horizontal fields.
for reverse in [False,True]:
 s=text(20,30,'Приём: снаружи внутрь' if reverse else 'Отправка: изнутри наружу',19,bold=True)
 stages=[('1 · Данные HTTP',['GET / HTTP/1.1','Host: lesson.test'],0),('2 · TCP-сегмент',['TCP: 51514 → 80','Внутри: данные HTTP'],1),('3 · IPv4-пакет',['IP: 192.0.2.10 → 198.51.100.20','Внутри: TCP + HTTP'],2),('4 · Ethernet-кадр',['MAC: компьютер → шлюз','Внутри: IP + TCP + HTTP','В конце: FCS — проверка кадра'],3),('5 · Физическая передача',['Биты кадра → сигналы','По кабелю Ethernet'],3)]
 if reverse:stages=list(reversed(stages));stages[0]=('1 · Принимаем сигналы',['Сигналы → биты кадра'],3);stages[-1]=('5 · Приложение читает HTTP',['GET / HTTP/1.1','Host: lesson.test'],0)
 y=50
 for n,(title,lines,ci) in enumerate(stages):
  if reverse and n in [1,2,3]:
   title=['','2 · Ethernet проверяет FCS','3 · IPv4 читает назначение','4 · TCP собирает поток'][n]
   lines=[[''],['Тип 0x0800 → IPv4','Заголовок и FCS обработаны'],['Protocol 6 → TCP','Заголовок IP обработан'],['Порт 80 → приложение','Заголовок TCP обработан']][n]
  if not reverse and n<4:
   s+=rect(10,y,300,61+(n+1)*34+(28 if n==3 else 0))+text(24,y+28,title,18,C[ci],True)
   bands=[('Заголовок Ethernet · MAC, тип',3),('Заголовок IPv4 · адреса, TTL',2),('Заголовок TCP · порты, поток',1),('HTTP · GET / · Host: lesson.test',0)][3-n:]
   for j,(label,col) in enumerate(bands):
    s+=rect(22+j*4,y+44+j*34,276-j*8,30,C[col],5)+text(29+j*4,y+64+j*34,label,14,'#091728',True)
   if n==3:s+=text(24,y+44+(n+1)*34+22,'FCS · контрольное поле в конце',14,C[3]);extra=28
   else:extra=0
   y+=61+(n+1)*34+extra
  else:
   s+=card(y,title,lines,C[ci]);y+=55+len(lines)*24
  if n<4:s+=arrow(y+2);y+=32
 s+=text(20,y+27,'Вложения показаны не в масштабе.',15)
 save('unpack' if reverse else 'pack','Декапсуляция HTTP' if reverse else 'Инкапсуляция HTTP в TCP, IPv4 и Ethernet',y+48,s)
s=text(20,30,'Три разных «кому»',20,bold=True)
for y,title,lines,c in [(52,'TCP · Порт',['51514 → 80','Клиент → HTTP-служба','Конечная точка сервера:','TCP 198.51.100.20:80'],C[1]),(228,'IP · Конечный узел',['192.0.2.10 → 198.51.100.20','Источник → удалённый сервер'],C[2]),(356,'MAC · Сосед на канале',['02:00:00:00:01:10 →','02:00:00:00:01:01','Компьютер → шлюз,','а не удалённый сервер'],C[3])]:s+=card(y,title,lines,c)
save('addresses','Порты, IP и MAC на первом канале',530,s)
s=text(20,30,'Один IP-пакет · два кадра',19,bold=True)
for y,k,label,c in [(52,'pc','Компьютер · 192.0.2.10',C[0]),(164,'switch','Коммутатор · первый канал',C[3]),(358,'router','Маршрутизатор',C[2]),(570,'switch','Коммутатор · второй канал',C[3]),(682,'server','Сервер · 198.51.100.20',C[0])]:
 s+=icon(k,129,y,c)+text(20,y+83,label,17,c,True)
 if y<682:s+=arrow(y+88)
s+=rect(12,280,296,67)+text(22,307,'Кадр 1: компьютер → MAC шлюза',15,C[3])+text(22,333,'IP-пакет · TTL 64',16,C[2])
s+=rect(12,472,296,85)+text(22,498,'Кадр 2: MAC выхода → MAC сервера',14,C[3])+text(22,524,'Те же IP-адреса · TTL 63',16,C[2])+text(22,546,'Новые MAC и FCS',15,C[3])
s+=text(20,795,'Без NAT. Сумма заголовка IPv4',15)+text(20,819,'обновлена после изменения TTL.',15)
save('route','Маршрутизатор заменяет кадр и уменьшает TTL, сохраняя IP без NAT',840,s)
s=text(20,30,'Одна потеря — разные результаты',16,bold=True)
s+=card(54,'TCP · поток байтов',['Отправлены: [1] → [2] → [3]','Потеря:              × [2]','Получатель подтверждает приём','Отправитель повторяет [2]','Программа читает: [1][2][3]'],C[1])
s+=card(270,'UDP · отдельные датаграммы',['Отправлены: [1] → [2] → [3]','Потеря:              × [2]','UDP не подтверждает и не повторяет','Доставлено: [1] и [3]','Приложение решает, что делать'],C[1])
s+=text(20,500,'Схема упрощена. TCP сохраняет',15)+text(20,523,'порядок байтов, но не границы',15)+text(20,546,'сообщений приложения.',15)
save('transport','TCP восстанавливает поток, UDP не даёт встроенных гарантий доставки',570,s)
# Readable field cards rather than a dense bit grid; sizes are actual, drawing isn't to scale.
sheets={
 'tcp':('TCP · заголовок 20–60 байт',C[1],[('Порты · 16 + 16 бит',['Источник и получатель']),('Номера · 32 + 32 бит',['Sequence: положение байтов','Acknowledgment: следующий байт']),('Длина и флаги · 16 бит',['Data Offset: 4 · резерв: 3','AE, CWR, ECE, URG, ACK,','PSH, RST, SYN, FIN: по 1 биту']),('Окно · 16 бит',['Сколько данных готов принять узел']),('Checksum · 16 бит',['TCP-заголовок, данные','и псевдозаголовок IP']),('Urgent Pointer · 16 бит',['Граница срочных данных при URG']),('Опции и выравнивание · 0–40 Б',['MSS, SACK, метки времени','До границы 32 бит'])]),
 'udp':('UDP · заголовок 8 байт',C[1],[('Порты · 16 + 16 бит',['Источник и получатель']),('Length · 16 бит',['Весь UDP: заголовок + данные']),('Checksum · 16 бит',['UDP и псевдозаголовок IP','В IPv4 ноль: сумма не рассчитана','В IPv6 обычно обязательна'])]),
 'ipv4':('IPv4 · заголовок 20–60 байт',C[2],[('Версия 4 · IHL 4 бита',['IHL: длина в 32-битных словах']),('DSCP 6 · ECN 2 бита',['Обслуживание и перегрузка']),('Total Length · 16 бит',['Заголовок + данные IP']),('Identification · 16 бит',['Сопоставление фрагментов']),('Flags 3 · Offset 13 бит',['DF/MF · смещение фрагмента']),('TTL 8 · Protocol 8 бит',['Предел переходов · TCP=6/UDP=17']),('Checksum · 16 бит',['Только заголовок IPv4']),('Адреса · 32 + 32 бит',['Источник и назначение']),('Опции + выравнивание · 0–40 Б',['Необязательные поля'])]),
 'ethernet':('Ethernet II · без VLAN',C[3],[('MAC назначения · 6 байт',['Ближайший получатель']),('MAC источника · 6 байт',['Отправитель этого кадра']),('EtherType · 2 байта',['0x0800: IPv4 · 0x86DD: IPv6']),('Данные + padding · 46–1500 Б',['IP-пакет и при нужде дополнение','Padding не входит в IP Total Length']),('FCS · 4 байта',['CRC от MAC назначения','до конца данных / padding']),('Кадр · 64–1518 байт',['От MAC назначения до FCS','Преамбула 7 + SFD 1 — перед ним','Межкадровый интервал — не кадр'])])}
for name,(title,c,fields) in sheets.items():
 s=text(16,30,title,18,c,True);y=48
 for title,lines in fields:s+=card(y,title,lines,c);y+=65+24*len(lines)
 save(name,sheets[name][0],y+6,s)
s=text(20,30,'Вся модель на одной странице',18,bold=True)
for i,(title,en,task,lines,k) in enumerate(rows):
 y=50+i*190;s+=rect(10,y,300,178)+text(22,y+28,title,18,C[i],True)+text(22,y+57,task,15)
 for j,l in enumerate(lines):s+=text(22,y+85+j*24,l,15)
 s+=text(22,y+159,['Адресация: имена и ресурсы','Адресация: порты','Адресация: IP','Адресация: MAC на канале'][i],15,C[i])
s+=text(20,834,'↓ Отправка: данные → сегмент →',16)+text(20,860,'пакет → кадр → сигналы',16)+text(20,898,'↑ Приём: в обратном порядке',16)
save('summary','Итоговая шпаргалка TCP/IP: роли, адресация и направление обработки',925,s)
