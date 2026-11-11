import React, { useEffect, useMemo, useState } from 'react'
import { Shirt, Sparkles, RotateCcw, Save, Heart, Palette, Check, Copy, ChevronLeft, Layers3, Footprints, CircleHelp, X, Rotate3D, Share2 } from 'lucide-react'
import Mannequin from './Mannequin.jsx'

const initialColors={outer:'#202a38',inner:'#f4f1ea',pants:'#303b4b',shoes:'#e9e7e2'}
const layers=[
  {id:'outer',name:'القطعة الخارجية',sub:'جاكيت / هودي',ratio:'30%',icon:Layers3},
  {id:'inner',name:'القطعة الداخلية',sub:'تيشيرت / قميص',ratio:'20%',icon:Shirt},
  {id:'pants',name:'البنطال',sub:'جينز / قماش',ratio:'40%',icon:Layers3},
  {id:'shoes',name:'الحذاء',sub:'سنيكرز / كاجوال',ratio:'10%',icon:Footprints}
]
const swatches=[
  {name:'أسود',hex:'#17191d'},{name:'فحمي',hex:'#30343b'},{name:'كحلي',hex:'#17263e'},
  {name:'رمادي',hex:'#9299a3'},{name:'أبيض',hex:'#f7f6f2'},{name:'سكري',hex:'#e9dfce'},
  {name:'بيج',hex:'#c8ad8c'},{name:'جملي',hex:'#a96f43'},{name:'بني موكا',hex:'#604632'},
  {name:'زيتي',hex:'#46513a'},{name:'أخضر داكن',hex:'#243b32'},{name:'أزرق جينز',hex:'#355d85'},
  {name:'خمري',hex:'#642d3a'},{name:'طوبي',hex:'#a6533c'},{name:'أزرق فاتح',hex:'#9eb9cc'}
]
const presets=[
 {id:'campus',name:'جامعي يومي',tag:'CASUAL',desc:'مرتب ومريح للدوام',colors:{outer:'#202a38',inner:'#f4f1ea',pants:'#303b4b',shoes:'#e9e7e2'},garment:'jacket'},
 {id:'earth',name:'ترابي هادئ',tag:'EARTH TONES',desc:'درجات دافئة ومتناسقة',colors:{outer:'#604632',inner:'#e9dfce',pants:'#9a8877',shoes:'#f1eee7'},garment:'overshirt'},
 {id:'street',name:'ستريت وير',tag:'STREET',desc:'زيتي مع دنيم ولمسة دافئة',colors:{outer:'#46513a',inner:'#f3ead8',pants:'#243044',shoes:'#bd8957'},garment:'hoodie'},
 {id:'minimal',name:'مونوكروم',tag:'MINIMAL',desc:'أسود ورمادي بتباين نظيف',colors:{outer:'#24262b',inner:'#dededb',pants:'#17191d',shoes:'#f0eee8'},garment:'jacket'},
 {id:'old',name:'كلاسيك راقٍ',tag:'OLD MONEY',desc:'كحلي وسكري ولمسة جلدية',colors:{outer:'#17263e',inner:'#f2eee5',pants:'#c9c2b5',shoes:'#704a32'},garment:'overshirt'},
 {id:'summer',name:'صيفي فاتح',tag:'SUMMER',desc:'ألوان خفيفة ومنعشة',colors:{outer:'#c8ad8c',inner:'#f7f6f2',pants:'#9eb9cc',shoes:'#f7f6f2'},garment:'none'}
]
const garmentNames={jacket:'جاكيت مفتوح',hoodie:'هودي',overshirt:'قميص أوفرشيرت',none:'بدون قطعة خارجية'}
function App(){
 const [colors,setColors]=useState(()=>{try{return {...initialColors,...JSON.parse(localStorage.getItem('wardrobe-colors')||'{}')}}catch{return initialColors}})
 const [active,setActive]=useState('outer')
 const [garment,setGarment]=useState('jacket')
 const [preset,setPreset]=useState('campus')
 const [favorites,setFavorites]=useState(()=>JSON.parse(localStorage.getItem('wardrobe-favorites')||'[]'))
 const [saved,setSaved]=useState(false)
 const [toast,setToast]=useState('')
 const [tab,setTab]=useState('studio')
 const [viewer,setViewer]=useState(null)
 const [showAdvice,setShowAdvice]=useState(false)

 useEffect(()=>{localStorage.setItem('wardrobe-colors',JSON.stringify(colors))},[colors])
 useEffect(()=>{localStorage.setItem('wardrobe-favorites',JSON.stringify(favorites))},[favorites])
 useEffect(()=>{
  const tg=window.Telegram?.WebApp
  if(tg){tg.ready();tg.expand();tg.setHeaderColor?.('#0b0d12');tg.setBackgroundColor?.('#0b0d12')}
 },[])
 const notify=(s)=>{setToast(s);setTimeout(()=>setToast(''),2300);window.Telegram?.WebApp?.HapticFeedback?.notificationOccurred?.('success')}
 const updateColor=(hex)=>{setColors(c=>({...c,[active]:hex}));setSaved(false);window.Telegram?.WebApp?.HapticFeedback?.selectionChanged?.()}
 const applyPreset=(p)=>{setColors(p.colors);setGarment(p.garment);setPreset(p.id);setActive('outer');setSaved(false);notify(`تم تطبيق ${p.name}`)}
 const current=layers.find(l=>l.id===active)
 const save=()=>{
  const item={id:Date.now(),date:new Date().toLocaleDateString('ar-IQ'),colors,garment,preset:presets.find(p=>p.id===preset)?.name||'تنسيق مخصص'}
  const next=[item,...favorites.filter(x=>JSON.stringify(x.colors)!==JSON.stringify(colors))].slice(0,30)
  setFavorites(next);setSaved(true);notify('تم حفظ إطلالتك في المفضلة')
  const tg=window.Telegram?.WebApp
  if(tg?.initData){try{tg.sendData(JSON.stringify({event:'outfit_saved',...item}))}catch{}}
 }
 const randomize=()=>{const p=presets[Math.floor(Math.random()*presets.length)];applyPreset(p)}
 const copy=async()=>{const txt=`تنسيق Wardrobe Studio\nالقطعة الخارجية: ${colors.outer}\nالداخلية: ${colors.inner}\nالبنطال: ${colors.pants}\nالحذاء: ${colors.shoes}\n${garmentNames[garment]}`;try{await navigator.clipboard.writeText(txt);notify('تم نسخ تفاصيل التنسيق')}catch{notify('تعذر النسخ من هذا المتصفح')}}
 const toggleFavorite=()=>{const exists=favorites.some(x=>JSON.stringify(x.colors)===JSON.stringify(colors));if(exists){setFavorites(f=>f.filter(x=>JSON.stringify(x.colors)!==JSON.stringify(colors)));notify('تمت إزالة الإطلالة')}else save()}
 const share=async()=>{const text=`إطلالتي من Wardrobe Studio\n${Object.entries(colors).map(([k,v])=>`${layers.find(l=>l.id===k).name}: ${v}`).join('\n')}`;if(navigator.share){try{await navigator.share({title:'إطلالتي',text})}catch{}}else copy()}
 const selectSaved=(item)=>{setColors(item.colors);setGarment(item.garment);setTab('studio');notify('تم تحميل الإطلالة')}
 return <div className="app-shell">
  <header className="topbar">
   <div className="brand-lockup"><div className="brand-mark"><Shirt size={19}/></div><div><div className="brand-name">WARDROBE<span>STUDIO</span></div><div className="brand-sub">مساحتك الخاصة لتنسيق الأزياء</div></div></div>
   <button className="icon-btn" onClick={()=>setShowAdvice(true)} aria-label="مساعدة"><CircleHelp size={19}/></button>
  </header>
  <main className="main-content">
   <section className="intro-row"><div><div className="eyebrow"><span className="eyebrow-line"/> PERSONAL STYLING LAB</div><h1>اصنع إطلالتك<br/><em>بأسلوبك الخاص.</em></h1><p>جرّب الألوان والطبقات على مانيكان ثلاثي الأبعاد.</p></div><button className="shuffle-btn" onClick={randomize}><Sparkles size={16}/> اقتراح ذكي</button></section>
   <nav className="tabs">
    <button className={tab==='studio'?'active':''} onClick={()=>setTab('studio')}><Palette size={16}/> الاستوديو</button>
    <button className={tab==='looks'?'active':''} onClick={()=>setTab('looks')}><Heart size={16}/> إطلالاتي <span className="count">{favorites.length}</span></button>
   </nav>
   {tab==='studio'?<>
    <section className="studio-grid">
     <div className="viewer-card">
      <div className="viewer-top"><div><span className="live-dot"/> LIVE PREVIEW</div><span className="viewer-sub">3D MANNEQUIN</span></div>
      <Mannequin colors={colors} garment={garment} onReady={setViewer}/>
      <div className="viewer-controls">
       <button onClick={()=>viewer?.front()}><Rotate3D size={15}/> أمام</button><button onClick={()=>viewer?.back()}>خلف</button><button onClick={()=>viewer?.reset()}><RotateCcw size={14}/> إعادة</button>
      </div>
      <div className="garment-select"><span>نوع القطعة الخارجية</span><div className="garment-options">{Object.entries(garmentNames).map(([key,label])=><button key={key} className={garment===key?'selected':''} onClick={()=>{setGarment(key);setSaved(false)}}>{label}</button>)}</div></div>
     </div>
     <aside className="layers-panel">
      <div className="section-heading"><div><span className="eyebrow">OUTFIT BUILDER</span><h2>طبقات الإطلالة</h2></div><span className="step-count">01 — 04</span></div>
      <div className="layer-list">{layers.map((layer,i)=>{const Icon=layer.icon;return <button key={layer.id} onClick={()=>setActive(layer.id)} className={`layer-item ${active===layer.id?'selected':''}`}><span className="layer-index">0{i+1}</span><span className="layer-icon"><Icon size={17}/></span><span className="layer-info"><b>{layer.name}</b><small>{layer.sub}</small></span><span className="layer-color" style={{background:colors[layer.id]}}/><span className="layer-arrow"><ChevronLeft size={16}/></span></button>})}</div>
      <div className="ratio-card"><div className="ratio-title"><span>توزيع الألوان</span><span>60 / 30 / 10</span></div><div className="ratio-bar"><i style={{width:'60%',background:colors.pants}}/><i style={{width:'30%',background:colors.outer}}/><i style={{width:'10%',background:colors.shoes}}/></div><div className="ratio-legend"><span><i style={{background:colors.pants}}/> أساسي</span><span><i style={{background:colors.outer}}/> ثانوي</span><span><i style={{background:colors.shoes}}/> لمسة</span></div></div>
     </aside>
    </section>
    <section className="color-section">
     <div className="section-heading color-heading"><div><span className="eyebrow">COLOR LAB</span><h2>اختَر لون {current.name}</h2></div><label className="custom-color"><input type="color" value={colors[active]} onChange={e=>updateColor(e.target.value)}/><span className="color-wheel"><Palette size={16}/></span> لون مخصص</label></div>
     <div className="active-color-row"><div className="active-color-preview" style={{background:colors[active]}}/><div><b>{swatches.find(s=>s.hex.toLowerCase()===colors[active].toLowerCase())?.name||'لون مخصص'}</b><small>{colors[active].toUpperCase()}</small></div><span className="selected-label"><Check size={13}/> محدد الآن</span></div>
     <div className="swatch-grid">{swatches.map(s=><button key={s.hex} className={`swatch ${colors[active].toLowerCase()===s.hex?'chosen':''}`} onClick={()=>updateColor(s.hex)} aria-label={s.name} title={s.name}><span style={{background:s.hex}}/>{colors[active].toLowerCase()===s.hex&&<Check size={14}/>}</button>)}</div>
     <div className="swatch-caption">ألوان مختارة بعناية لتناسب الأزياء اليومية والستايل العصري.</div>
    </section>
    <section className="preset-section"><div className="section-heading"><div><span className="eyebrow">CURATED OUTFITS</span><h2>ابدأ من تنسيق جاهز</h2></div><span className="muted">6 إطلالات</span></div><div className="preset-grid">{presets.map(p=><button key={p.id} onClick={()=>applyPreset(p)} className={`preset-card ${preset===p.id?'preset-active':''}`}><div className="preset-colors">{Object.values(p.colors).map((c,i)=><i key={i} style={{background:c}}/>)}</div><div className="preset-tag">{p.tag}</div><b>{p.name}</b><small>{p.desc}</small>{preset===p.id&&<span className="preset-check"><Check size={12}/></span>}</button>)}</div></section>
    <section className="tip-card"><div className="tip-icon"><Sparkles size={18}/></div><div><span className="eyebrow">STYLIST NOTE</span><b>لمسة منسّق الأزياء</b><p>{active==='shoes'?'اجعل الحذاء نقطة ربط بين لون القطعة الداخلية وأحد الألوان الثانوية، حتى تبدو الإطلالة متماسكة.':active==='pants'?'البنطال المحايد يمنحك مساحة أكبر للتجربة في الطبقات العلوية. جرّب الكحلي أو الفحمي كبداية.':active==='inner'?'القطعة الداخلية الفاتحة تخلق تبايناً أنيقاً تحت الجاكيت الداكن، بينما الألوان الترابية تمنحك طابعاً هادئاً.':'اختر قطعة خارجية بلون محايد، ثم أضف لوناً أفتح في الداخل ولمسة مختلفة في الحذاء.'}</p></div></section>
    <div className="action-row"><button className="save-btn" onClick={save}><Save size={17}/>{saved?'تم حفظ الإطلالة':'حفظ الإطلالة'}</button><button className="round-action" onClick={toggleFavorite} aria-label="إضافة للمفضلة"><Heart size={18} fill={favorites.some(x=>JSON.stringify(x.colors)===JSON.stringify(colors))?'currentColor':'none'}/></button><button className="round-action" onClick={copy} aria-label="نسخ الألوان"><Copy size={17}/></button><button className="round-action" onClick={share} aria-label="مشاركة"><Share2 size={17}/></button></div>
   </>:<section className="saved-section"><div className="section-heading"><div><span className="eyebrow">YOUR COLLECTION</span><h2>إطلالاتك المحفوظة</h2></div><span className="muted">{favorites.length} إطلالة</span></div>{favorites.length===0?<div className="empty-state"><div className="empty-icon"><Heart size={25}/></div><b>لا توجد إطلالات محفوظة بعد</b><p>صمّم إطلالتك الأولى ثم احفظها لتعود إليها لاحقاً.</p><button onClick={()=>setTab('studio')}>ابدأ التنسيق <ChevronLeft size={15}/></button></div>:<div className="saved-grid">{favorites.map(item=><article className="saved-card" key={item.id}><div className="saved-swatches">{Object.entries(item.colors).map(([k,v])=><i key={k} style={{background:v}}/>)}</div><div className="saved-meta"><b>{item.preset||'تنسيق مخصص'}</b><small>{item.date}</small></div><div className="saved-buttons"><button onClick={()=>selectSaved(item)}>استخدم التنسيق</button><button onClick={()=>setFavorites(f=>f.filter(x=>x.id!==item.id))}><X size={15}/></button></div></article>)}</div>}</section>}
   <footer><span>WARDROBE STUDIO</span><span>DESIGNED FOR YOUR EVERYDAY STYLE</span></footer>
  </main>
  {showAdvice&&<div className="overlay" onClick={()=>setShowAdvice(false)}><div className="dialog" onClick={e=>e.stopPropagation()}><button className="dialog-close" onClick={()=>setShowAdvice(false)}><X size={18}/></button><div className="tip-icon"><CircleHelp size={19}/></div><h3>كيف تستخدم الاستوديو؟</h3><p>اختر طبقة من القائمة، ثم جرّب لوناً من لوحة الألوان. اسحب المانيكان لتدويره، واستخدم أزرار الأمام والخلف لمعاينة الإطلالة. يمكنك أيضاً تطبيق تنسيق جاهز وحفظ النتيجة في إطلالاتك.</p><small>ملاحظة: المانيكان الحالي مجسم ثلاثي الأبعاد قابل للتدوير، وليس صورة ثابتة.</small><button className="save-btn dialog-ok" onClick={()=>setShowAdvice(false)}>فهمت</button></div></div>}
  {toast&&<div className="toast"><span/> {toast}</div>}
 </div>
}
export default App