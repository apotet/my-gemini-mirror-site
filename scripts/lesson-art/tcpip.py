"""Responsive original TCP/IP lesson artwork. Run from repository root."""
from pathlib import Path
from html import escape as e
P=Path('public/lesson-images'); P.mkdir(exist_ok=True)
C=['#60b5ff','#9ddb70','#ffbd61','#c3a2ff']
ACCENTS={
 '#60b5ff':'application', '#9ddb70':'transport',
 '#ffbd61':'internet', '#c3a2ff':'link',
}
# Labels/lines and their pale chips are different roles, not one inverted color.
# The embedded SVG inherits prefers-color-scheme from the host <img>/zoom.
PALETTE={
 'ink':('#192d43','#eaf1ff'),
 'panel':('#edf3fa','#13273e'),
 'route-panel':('#fff3dc','#272d3b'),
 'line':('#506781','#a5bbd3'),
 'rule':('#657c95','#597491'),
 'chip-ink':('#142438','#142438'),
 'application':('#205a98','#80c2ff'),
 'transport':('#355e23','#a7df82'),
 'internet':('#7c4607','#ffc776'),
 'link':('#624292','#cfb4ff'),
 'application-chip':('#c2dfff','#60b5ff'),
 'transport-chip':('#d1ebba','#9ddb70'),
 'internet-chip':('#ffe4b4','#ffbd61'),
 'link-chip':('#e4d7ff','#c3a2ff'),
}
def scheme(index):
 return ''.join(f'--tcpip-{role}:{pair[index]};' for role,pair in PALETTE.items())
THEME=f'<style>:root{{{scheme(0)}}}@media (prefers-color-scheme: dark){{:root{{{scheme(1)}}}}}</style>'
def paint(color, chip=False):
 role={
  '#eaf1ff':'ink','#13273e':'panel','#272d3b':'route-panel',
  '#a5bbd3':'line','#314863':'rule','#091728':'chip-ink',
 }.get(color)
 if color in ACCENTS:
  role=ACCENTS[color]+('-chip' if chip else '')
 if role is None:
  raise ValueError(f'unknown TCP/IP art paint: {color}')
 return f'var(--tcpip-{role},{PALETTE[role][0]})'
def text(x,y,s,size=16,color='#eaf1ff',bold=False):
 return f'<text x="{x}" y="{y}" font-size="{size}" fill="{paint(color)}" font-weight="{700 if bold else 400}">{e(s)}</text>'
def rect(x,y,w,h,c='#13273e',r=12,*,accent_marker=False):
 # Thin color markers use the same contrast role as their nearby labels.
 return f'<rect x="{x}" y="{y}" width="{w}" height="{h}" rx="{r}" fill="{paint(c, chip=not accent_marker)}"/>'
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
 return f'<g transform="translate({x} {y})" stroke="{paint(c)}" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">{shapes[kind]}</g>'
def save_diagram(name,title,width,height,body):
 # Zoom controls are outside the image; leave only drawing insets, not a second plate.
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" role="img" aria-labelledby="t"><title id="t">{e(title)}</title>{THEME}<g font-family="Arial, sans-serif">{body}</g></svg>'
 (P/f'tcpip-{name}.svg').write_text(svg, encoding='utf-8')

# Five responsive illustrations for the plain TCP/IP lesson. The short labels
# show the visual structure; the surrounding lesson keeps the complete equivalents.
def core_middle(x, y, label, size=16, color='#eaf1ff', bold=False):
 return text(x,y,label,size,color,bold).replace('<text ', '<text text-anchor="middle" ', 1)

def core_line(x1,y1,x2,y2,c='#a5bbd3'):
 return f'<path d="M{x1} {y1}L{x2} {y2}" stroke="{paint(c)}" stroke-width="2" stroke-linecap="round" fill="none"/>'

def core_out(width,name,title,height,body):
 suffix='-wide' if width==640 else ''
 save_diagram(name+suffix,title,width,height,body)

def core_layers(width):
 wide=width==640; gap=10; x=10; cw=(width-2*x-gap)//2
 cards=[
  ('4','Прикладной',('HTTP · DNS','Сообщение'),'app'),
  ('3','Транспортный',('TCP: сегмент','UDP: датаграмма'),'pc'),
  ('2','Межсетевой',('IPv4 / IPv6','IP-пакет'),'router'),
  ('1','Сетевой доступ',('Ethernet / Wi-Fi','Кадр'),'switch'),
 ]
 ch=95 if wide else 109
 body=''
 for i,(n,title,lines,kind) in enumerate(cards):
  col,row=i%2,i//2; x0=x+col*(cw+gap); y0=10+row*(ch+gap)
  body+=rect(x0,y0,cw,ch)
  body+=rect(x0+9,y0+9,24,24,C[i],7)+core_middle(x0+21,y0+27,n,17,'#091728',True)
  body+=text(x0+(44 if wide else 9),y0+(27 if wide else 54),title,19 if wide else 17,C[i],True)
  for j,l in enumerate(lines):
   body+=text(x0+10,y0+(59 if wide else 79)+20*j,l,17 if wide else 16)
  if wide:body+=icon(kind,x0+cw-82,y0+20,C[i])
 bottom=10+ch*2+gap
 if wide:
  body+=text(12,bottom+31,'Отправка: 4 → 3 → 2 → 1',17,bold=True)
  body+=text(321,bottom+31,'Приём: 1 → 2 → 3 → 4',17,bold=True)
  height=bottom+49
 else:
  body+=text(12,bottom+26,'Отправка: 4 → 3 → 2 → 1',16,bold=True)
  body+=text(12,bottom+49,'Приём: 1 → 2 → 3 → 4',16,bold=True)
  height=bottom+67
 core_out(width,'layers','Уровни TCP/IP: при отправке 4 → 1, при приёме 1 → 4',height,body)

def core_osi(width):
 wide=width==640; lx=10; rx=340 if wide else 171; lw=288 if wide else 147; rw=width-rx-10
 names=[
  (('7 Прикладной','6 Представления','5 Сеансовый'),'4','Прикладной'),
  (('4 Транспортный',),'3','Транспортный'),
  (('3 Сетевой',),'2','Межсетевой'),
  (('2 Канальный','1 Физический'),'1','Сетевой доступ'),
 ]
 body=text(lx+7,30,'OSI · 7 уровней' if wide else 'OSI · 7',18,bold=True)
 body+=text(rx+7,30,'TCP/IP · 4 уровня' if wide else 'TCP/IP · 4',18,bold=True)
 y=44
 for i,(left,n,title) in enumerate(names):
  c=C[i]; rh=(54 if len(left)==3 else 38) if wide else max(46,len(left)*21+9)
  my=y+rh//2; size=17 if wide else 16
  body+=rect(lx,y,lw,rh)+rect(rx,y,rw,rh)
  body+=rect(lx,y,4,rh,c,2,accent_marker=True)+rect(rx,y,4,rh,c,2,accent_marker=True)
  for j,label in enumerate(left):
   if wide:
    tx=lx+9+(j%2)*132
    ty=my+6 if len(left)<3 else my-4+(j//2)*21
   else:
    tx=lx+9
    ty=my+6-(len(left)-1)*10+j*21
   body+=text(tx,ty,label,size)
  body+=core_line(lx+lw+2,my,rx-3,my,c)
  body+=core_line(rx-7,my-4,rx-3,my,c)+core_line(rx-7,my+4,rx-3,my,c)
  if wide:
   body+=rect(rx+12,my-12,24,24,c,7)+core_middle(rx+24,my+6,n,17,'#091728',True)
   body+=text(rx+45,my+6,title,18,c,True)
  else:
   body+=text(rx+9,my-4,n,16,c,True)+text(rx+9,my+15,title,16,c,True)
  y+=rh+6
 body+=text(lx+3,y+17,'Соответствие по функциям',16)
 core_out(width,'osi','Семь уровней OSI и четыре уровня TCP/IP: соответствие по функциям',y+35,body)

def core_bands(width,y,from_field=0,to_field=5):
 fields=('Ethernet','IPv4','TCP','HTTP','FCS'); hues=(3,2,1,0,3)
 stops=(10,136,230,326,557,630) if width==640 else (10,96,150,201,265,310)
 body=''
 for i in range(from_field,to_field):
  x=stops[i]; w=stops[i+1]-x-2
  body+=rect(x,y,w,30,C[hues[i]],4)
  body+=core_middle(x+w/2,y+21,fields[i],17 if width==640 else 16,'#091728',True)
 return body

def core_pack(width):
 wide=width==640
 body=text(10,28,'Отправка ↓',18,bold=True)
 for y,from_field,unit,j in [
  (42,3,'Данные',0),(82,2,'Сегмент',1),(122,1,'Пакет',2),(181,0,'Кадр',3),
 ]:
  body+=text(10,y+(21 if from_field else -9),unit,17,C[j],True)
  body+=core_bands(width,y,from_field,5 if from_field==0 else 4)
 if wide:
  body+=text(10,239,'Биты кадра → сигналы по кабелю Ethernet.',17)
  body+=text(444,239,'FCS в конце кадра.',16,C[3])
  height=257
 else:
  body+=text(10,239,'FCS в конце кадра.',16,C[3])
  body+=text(10,262,'Кадр → биты → сигналы по кабелю.',16)
  height=280
 core_out(width,'pack','Порядок полей Ethernet, IPv4, TCP и HTTP при инкапсуляции; FCS в конце кадра',height,body)

def core_unpack(width):
 wide=width==640
 body=text(10,28,'Приём ↓',18,bold=True)+core_bands(width,42)
 body+=text(10,96,'Сигналы → биты Ethernet-кадра',16)
 items=[
  ('Ethernet','Проверяет FCS','0x0800 → IPv4'),
  ('IPv4','Читает заголовок','Protocol 6 → TCP'),
  ('TCP','Собирает поток','Порт 80 → HTTP'),
  ('HTTP','Читает запрос','GET / HTTP/1.1'),
 ]
 if wide:
  for i,(title,l1,l2) in enumerate(items):
   x=10+i*156; y=108; c=C[3-i]
   body+=rect(x,y,151,84)
   body+=text(x+9,y+26,f'{i+1} · {title}',18,c,True)
   body+=text(x+9,y+49,l1,16)+text(x+9,y+71,l2,16)
  height=209
 else:
  for i,(title,l1,l2) in enumerate(items):
   x=10; y=108+i*57; c=C[3-i]
   body+=rect(x,y,300,52)
   body+=text(x+9,y+31,f'{i+1} · {title}',17,c,True)
   body+=text(x+130,y+22,l1,16)+text(x+130,y+43,l2,16)
  height=343
 core_out(width,'unpack','Разбор принятого кадра: Ethernet, IPv4, TCP и запрос HTTP',height,body)

def core_addresses(width):
 wide=width==640
 rows=[
  ('TCP · Порт','Служба','51514 → 80',None,1),
  ('IP · Узел','Компьютер → сервер','192.0.2.10','198.51.100.20',2),
  ('MAC · Сосед','Компьютер → шлюз','02:00:00:00:01:10','02:00:00:00:01:01',3),
 ]
 body=''
 for i,(title,role,a,b,c) in enumerate(rows):
  if wide:
   x=10+i*209; y=10
   body+=rect(x,y,202,117)+text(x+10,y+26,title,19,C[c],True)+text(x+10,y+51,role,16)
   body+=text(x+10,y+78,a,16)
   if b:body+=text(x+10,y+103,'→ '+b,16)
  else:
   x=10;y=[10,82,154][i]
   body+=rect(x,y,300,66)+text(x+10,y+24,title,18,C[c],True)+text(x+132,y+24,role,16)
   body+=text(x+10,y+49,a+(' → '+b if b else ''),16)
 core_out(width,'addresses','Сравнение порта TCP, IP удалённого сервера и MAC шлюза на первом канале',143 if wide else 236,body)

for core_width in (320,640):
 core_layers(core_width)
 core_osi(core_width)
 core_pack(core_width)
 core_unpack(core_width)
 core_addresses(core_width)

# A shared axis, not a repeated column of protocol cards.
for wide in (False, True):
 width=640 if wide else 320
 suffix='-wide' if wide else ''
 x2=width-80
 xmid=width/2
 s=icon('pc',22,21,C[0])+icon('server',x2,21,C[0])
 s+=text(37,102,'ПК',18,C[0],True)+text(x2-2,102,'Сервер',18,C[0],True)
 s+=f'<path d="M98 48H{width-96}m-8 -6 8 6 -8 6 M{width-96} 75H98m8 -6 -8 6 8 6" fill="none" stroke="{paint("#a5bbd3")}" stroke-width="2"/>'
 s+=text(xmid-40,40,'Запрос',17)+text(xmid-39,100,'Ответ',17)
 save_diagram('why'+suffix,'Запрос и ответ между компьютером и сервером',width,121,s)

# One path above two link-local frames. The continuous band is the unchanged IP pair.
for wide in (False, True):
 width=640 if wide else 320
 suffix='-wide' if wide else ''
 middle=width//2
 s=icon('pc',19,12,C[0])+icon('router',middle-32,12,C[2])+icon('server',width-80,12,C[0])
 s+=text(36,85,'ПК',17,C[0],True)+text(middle-26,85,'Шлюз',17,C[2],True)+text(width-77,85,'Сервер',17,C[0],True)
 s+=f'<path d="M90 39H{middle-39}m-6 -4 6 4 -6 4 M{middle+41} 39H{width-88}m-6 -4 6 4 -6 4" fill="none" stroke="{paint("#a5bbd3")}" stroke-width="2"/>'
 s+=rect(10,102,width-20,48,'#272d3b')+text(22,131,'IPv4: 192.0.2.10 → 198.51.100.20',17,C[2],True)
 cards=[('Кадр 1 · TTL 64','MAC: ПК → вход шлюза'),('Кадр 2 · TTL 63','MAC: выход шлюза → сервер')]
 for n,(label,detail) in enumerate(cards):
  x=10+n*315 if wide else 10
  y=160 if wide else 160+n*66
  s+=rect(x,y,305 if wide else 300,58)+text(x+12,y+23,label,17,C[3],True)
  s+=text(x+12,y+46,detail,17)
 save_diagram('route'+suffix,'Два Ethernet-кадра для одного пакета IPv4 без NAT',width,230 if wide else 288,s)

# Compare results of the same loss side by side on desktop; use two compact lanes on touch.
for wide in (False, True):
 width=640 if wide else 320
 suffix='-wide' if wide else ''
 s=text(16,27,'Блок 2 не дошёл',20,bold=True)
 for n,(title,action,result,c) in enumerate([
  ('TCP · поток','Повтор блока 2','Результат: 1 · 2 · 3',C[1]),
  ('UDP · датаграммы','UDP сам не повторяет','Результат: 1 · 3',C[2]),
 ]):
  x=10+n*315 if wide else 10
  y=44 if wide else 44+n*97
  s+=rect(x,y,305 if wide else 300,87)+text(x+13,y+24,title,18,c,True)
  s+=text(x+13,y+49,action,17)+text(x+13,y+73,result,17,c,True)
 save_diagram('transport'+suffix,'TCP и UDP после потери второго блока',width,143 if wide else 241,s)

# One compact, readable table per header. Exact full descriptions remain in the lesson.
field_sheets={
 'tcp':('TCP · заголовок 20–60 байт',C[1],[
  ('Порт источника','16 бит'),('Порт назначения','16 бит'),('Sequence Number','32 бита'),
  ('Acknowledgment','32 бита'),('Data Offset','4 бита'),('Резерв + флаги','3 + 9 бит'),
  ('Window','16 бит'),('Checksum','16 бит'),('Urgent Pointer','16 бит'),('Опции + padding','0–40 байт')]),
 'udp':('UDP · заголовок 8 байт',C[1],[
  ('Порт источника','16 бит'),('Порт назначения','16 бит'),('Length','16 бит'),('Checksum','16 бит')]),
 'ipv4':('IPv4 · заголовок 20–60 байт',C[2],[
  ('Version / IHL','4 + 4 бита'),('DSCP / ECN','6 + 2 бита'),('Total Length','16 бит'),('Identification','16 бит'),
  ('Flags / Offset','3 + 13 бит'),('TTL / Protocol','8 + 8 бит'),('Header Checksum','16 бит'),
  ('Адрес источника','32 бита'),('Адрес назначения','32 бита'),('Опции + padding','0–40 байт')]),
 'ethernet':('Ethernet II · без VLAN',C[3],[
  ('MAC назначения','6 байт'),('MAC источника','6 байт'),('EtherType','2 байта'),
  ('Данные + padding','46–1500 Б'),('FCS','4 байта'),('Кадр целиком','64–1518 Б')]),
}
for name,(title,c,fields) in field_sheets.items():
 for wide in (False,True):
  width=640 if wide else 320
  suffix='-wide' if wide else ''
  rows=(len(fields)+1)//2 if wide else len(fields)
  s=text(16,30,title,20,c,True)+rect(9,44,width-18,rows*35+8)
  for i,(key,value) in enumerate(fields):
   col=i//rows if wide else 0
   row=i%rows if wide else i
   x=col*315+20
   y=69+row*35
   s+=text(x,y,key,17)+text(x+181,y,value,17,c,True)
   if row<rows-1:
    s+=f'<path d="M{x} {y+10}h278" stroke="{paint("#314863")}" stroke-width="1"/>'
  save_diagram(name+suffix,title,width,61+rows*35,s)

# Summary is a recall prompt, not the four-layer diagram a second time.
for wide in (False,True):
 width=640 if wide else 320
 suffix='-wide' if wide else ''
 s=rect(10,10,width-20,96 if wide else 147)
 s+=text(22,36,'↓ Отправка',18,C[0],True)
 if wide:
  s+=text(22,63,'Сообщение → сегмент / датаграмма → IP-пакет → кадр → сигналы',17)
  s+=text(22,89,'↑ Приём: от сигналов к сообщению',17,C[3],True)
 else:
  s+=text(22,61,'Сообщение → сегмент /',17)
  s+=text(22,84,'датаграмма → IP-пакет → кадр',17)
  s+=text(22,108,'→ сигналы',17)
  s+=text(22,134,'↑ Приём: в обратном порядке',17,C[3],True)
 save_diagram('summary'+suffix,'Направление отправки и приёма',width,115 if wide else 165,s)
