import { useState, useEffect } from 'react';
import { Player } from '@barabel324/react-player';
import '@barabel324/react-player/css';

// ===== АВТОМАТИЧЕСКАЯ ЗАГРУЗКА ФОТО =====

// 1. Каталог — автоматически подгружает все фото из папки
const getCategoryImages = (categoryId: string, count: number = 12) => {
  const images: string[] = [];
  for (let i = 1; i <= count; i++) {
    images.push(`/images/catalog/${categoryId}/${i}.jpg`);
  }
  return images;
};

// 2. Наши работы — автоматически подгружает фото
const getWorksImages = (count: number = 20) => {
  const images: string[] = [];
  for (let i = 1; i <= count; i++) {
    images.push(`/images/works/work${i}.jpg`);
  }
  return images;
};

// ===== ДАННЫЕ =====

type CatalogItem = {
  id: string;
  title: string;
  titleShort: string;
  image: string;
  fallback: string;
  images: string[];
};

const catalog: CatalogItem[] = [
  {
    id: 'facade',
    title: 'ФАСАДНАЯ ПЛИТКА И КАМЕНЬ',
    titleShort: 'Фасадная плитка и камень',
    image: '/images/catalog/facade/1.jpg',
    fallback: 'https://images.pexels.com/photos/220152/pexels-photo-220152.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    images: getCategoryImages('facade', 12),
  },
  {
    id: 'cokol',
    title: 'ЦОКОЛЬНЫЕ ПАНЕЛИ',
    titleShort: 'Цокольные панели',
    image: '/images/catalog/cokol/1.jpg',
    fallback: 'https://images.pexels.com/photos/11255262/pexels-photo-11255262.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    images: getCategoryImages('cokol', 12),
  },
  {
    id: 'brus',
    title: 'БРУСЧАТКА И ТРОТУАРНАЯ ПЛИТКА',
    titleShort: 'Брусчатка и тротуарная плитка',
    image: '/images/catalog/brus/1.jpg',
    fallback: 'https://images.pexels.com/photos/11255189/pexels-photo-11255189.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    images: getCategoryImages('brus', 12),
  },
  {
    id: 'tactile',
    title: 'ТАКТИЛЬНАЯ ПЛИТКА',
    titleShort: 'Тактильная плитка',
    image: '/images/catalog/tactile/1.jpg',
    fallback: 'https://images.pexels.com/photos/11255186/pexels-photo-11255186.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    images: getCategoryImages('tactile', 12),
  },
  {
    id: 'bord',
    title: 'БОРДЮРЫ И ВОДОСТОКИ',
    titleShort: 'Бордюры и водостоки',
    image: '/images/catalog/bord/1.jpg',
    fallback: 'https://images.pexels.com/photos/7031595/pexels-photo-7031595.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
    images: getCategoryImages('bord', 12),
  },
  {
    id: 'vazon',
    title: 'ЦВЕТОЧНЫЕ ВАЗОНЫ',
    titleShort: 'Цветочные вазоны',
    image: '/images/catalog/vazon/1.jpg',
    fallback: 'https://images.pexels.com/photos/36802889/pexels-photo-36802889.jpeg?auto=compress&cs=tinysrgb&dpr=2&h=650&w=940',
    images: getCategoryImages('vazon', 12),
  },
];

type WorkItem = {
  id: string;
  title: string;
  category: string;
  categoryId: string;
  image: string;
  fallback: string;
  description: string;
  video?: string;
  year: string;
  location: string;
};

// Автоматическая загрузка работ
const worksImages = getWorksImages(20);
const worksData: WorkItem[] = worksImages.map((img, index) => ({
  id: `work${index + 1}`,
  title: `Проект #${index + 1}`,
  category: 'Наши работы',
  categoryId: 'all',
  image: img,
  fallback: 'https://images.pexels.com/photos/31737859/pexels-photo-31737859.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
  description: 'Описание проекта',
  year: '2025',
  location: 'СПб',
  video: index === 0 ? 'https://rutube.ru/play/embed/2bb783d89c63eac106018c32466b6159/' : undefined,
}));

export default function App() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [callbackOpen, setCallbackOpen] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<CatalogItem | null>(null);
  const [showAllWorks, setShowAllWorks] = useState(false);
  const [selectedWork, setSelectedWork] = useState<WorkItem | null>(null);
  const [workFilter, setWorkFilter] = useState<string>('all');

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(t);
    }
  }, [toast]);

  const scrollTo = (id: string) => {
    setMobileOpen(false);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const openCategory = (item: CatalogItem) => {
    setSelectedCategory(item);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const closeCategory = () => {
    setSelectedCategory(null);
  };

  return (
    <div className="min-h-screen bg-white text-[#1B222E] antialiased selection:bg-[#FF6B00] selection:text-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-[#212832] text-white">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8 h-[64px] flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden w-9 h-9 grid place-items-center rounded hover:bg-white/10">
              <div className="space-y-1.5">
                <div className={`h-0.5 w-5 bg-white transition ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
                <div className={`h-0.5 w-5 bg-white transition ${mobileOpen ? 'opacity-0' : ''}`} />
                <div className={`h-0.5 w-5 bg-white transition ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
              </div>
            </button>

            <a href="#" className="flex items-center gap-3">
              <div className="w-[48px] h-[42px] relative shrink-0">
                <img src="/images/logo-mark.png" alt="" className="w-full h-full object-contain mix-blend-normal brightness-[1.1]" onError={(e) => ((e.target as HTMLImageElement).style.display='none')} />
                <svg viewBox="0 0 88 72" className="absolute inset-0 w-full h-full">
                  <path d="M12 18 L44 2 L44 20 L12 36 Z" fill="#3C424D" />
                  <path d="M44 2 L80 18 L66 24 L66 40 L52 34 L52 18 L44 20 Z" fill="#EF6D12" />
                  <path d="M12 36 L44 20 L44 68 L12 52 Z" fill="none" />
                  <g clipPath="url(#clipStone)">
                    <rect x="12" y="20" width="32" height="48" fill="#7A7E85"/>
                    <rect x="12" y="35" width="8" height="10" fill="#6B6F76"/>
                    <rect x="21" y="32" width="23" height="12" fill="#A0A3A8"/>
                    <rect x="12" y="46" width="18" height="12" fill="#5A5E65"/>
                    <rect x="31" y="45" width="13" height="12" fill="#C2C4C7"/>
                  </g>
                  <path d="M44 34 L76 46 C84 49 86 60 84 69 C82 76 74 78 66 76 L44 68 L44 56 L66 62 C69 63 72 61 72 58 C72 55 69 53 66 52 L44 46 Z" fill="#2A313C" stroke="#2A313C" />
                  <defs>
                    <clipPath id="clipStone"><path d="M12 36 L44 20 L44 68 L12 52 Z"/></clipPath>
                  </defs>
                </svg>
              </div>
              <div className="leading-none">
                <div className="font-black tracking-[-0.02em] text-[22px] lg:text-[26px] flex">
                  <span className="text-white">БИО</span><span className="text-[#EF6D12]">ПЛИТ</span>
                </div>
                <div className="mt-[3px] hidden sm:flex items-center gap-2 text-[8px] lg:text-[9px] uppercase tracking-[0.18em] font-semibold text-white/80">
                  <span className="h-[1px] w-8 bg-[#EF6D12] block" />
                  ФАСАДЫ <span className="w-1 h-1 rounded-full bg-[#EF6D12] block" /> ПЛИТКА <span className="w-1 h-1 rounded-full bg-[#EF6D12] block" /> БРУСЧАТКА
                  <span className="h-[1px] w-8 bg-white/60 block" />
                </div>
              </div>
            </a>
          </div>

          <nav className="hidden lg:flex items-center gap-8 text-[15px] font-medium">
            <div className="relative group">
              <button onClick={() => setActiveCat(activeCat === 'catalog' ? null : 'catalog')} className="flex items-center gap-1.5 hover:text-[#EF6D12] transition">
                Каталог
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" className={`transition ${activeCat==='catalog'?'rotate-180':''}`}><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div className={`absolute left-0 top-[calc(100%+18px)] w-[320px] bg-white text-[#212832] rounded-[6px] shadow-[0_20px_60px_rgba(0,0,0,.25)] p-2 border border-gray-100 transition-all ${activeCat==='catalog'?'opacity-100 translate-y-0 visible':'opacity-0 -translate-y-2 invisible group-hover:opacity-100 group-hover:translate-y-0 group-hover:visible'}`}>
                {catalog.map(c=>(
                  <button key={c.id} onClick={()=>{ setActiveCat(null); openCategory(c); }} className="w-full text-left px-4 py-2.5 rounded hover:bg-[#F5F6F8] flex gap-3 items-center">
                    <span className="w-10 h-10 rounded bg-[#F0F2F5] overflow-hidden shrink-0"><img src={c.image} alt="" className="w-full h-full object-cover" /></span>
                    <span className="text-[14px] font-semibold leading-tight">{c.titleShort}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="relative group">
              <button className="flex items-center gap-1.5 hover:text-[#EF6D12] transition">Услуги
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M6 9l6 6 6-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </button>
              <div className="absolute left-0 top-[calc(100%+18px)] w-[240px] bg-white text-[#212832] rounded-[6px] shadow-[0_20px_60px_rgba(0,0,0,.25)] p-2 border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-0 transition-all">
                <div className="px-4 py-2 text-[13px] hover:bg-gray-50 rounded">Монтаж фасадов</div>
                <div className="px-4 py-2 text-[13px] hover:bg-gray-50 rounded">Укладка брусчатки</div>
                <div className="px-4 py-2 text-[13px] hover:bg-gray-50 rounded">Доставка и расчет</div>
              </div>
            </div>
            <button onClick={()=>scrollTo('works')} className="hover:text-[#EF6D12] transition">Наши работы</button>
            <button onClick={()=>scrollTo('about')} className="hover:text-[#EF6D12] transition">О компании</button>
            <button onClick={()=>scrollTo('contacts')} className="hover:text-[#EF6D12] transition">Контакты</button>
          </nav>

          <div className="flex items-center gap-4">
            <a href="tel:+79673448484" className="hidden md:flex text-[16px] font-semibold tracking-[-0.01em] hover:text-[#EF6D12] transition">+7 (967) 344-84-84</a>
            <button onClick={()=>setCallbackOpen(true)} className="hidden sm:inline-flex bg-[#EF6D12] hover:bg-[#E1620C] text-white text-[13px] font-semibold px-4 h-[36px] items-center rounded-[4px] transition">
              Заказать звонок
            </button>
            <a href="tel:+79673448484" className="lg:hidden w-9 h-9 grid place-items-center rounded-full bg-white/10">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6.6 4.6c-.4-.4-.9-.6-1.5-.5L3.7 4.3c-1 .2-1.6 1.3-1.2 2.3C4.2 11.2 7.8 14.8 12.4 16.5c1 .4 2.1-.2 2.3-1.2l.2-1.4c.1-.6-.1-1.1-.5-1.5l-1.8-1.8c-.4-.4-1-.5-1.5-.3l-.9.3c-.5.2-1.1.1-1.5-.3l-1.3-1.3c-.4-.4-.5-1-.3-1.5l.3-.9c.2-.5 0-1.1-.3-1.5L6.6 4.6Z" stroke="#EF6D12" strokeWidth="1.4" strokeLinejoin="round"/></svg>
            </a>
          </div>
        </div>

        <div className={`lg:hidden fixed inset-0 top-[64px] z-40 transition ${mobileOpen?'visible':'invisible'}`}>
          <div onClick={()=>setMobileOpen(false)} className={`absolute inset-0 bg-[#12171F]/70 backdrop-blur-sm transition ${mobileOpen?'opacity-100':'opacity-0'}`} />
          <div className={`relative w-[86%] max-w-[340px] h-[calc(100vh-64px)] bg-white text-[#1B222E] p-6 overflow-auto shadow-2xl transition-transform ${mobileOpen?'translate-x-0':'-translate-x-full'}`}>
            <div className="space-y-6">
              <div>
                <div className="text-[12px] uppercase tracking-widest font-bold text-gray-400 mb-3">Каталог</div>
                <div className="grid gap-2">
                  {catalog.map(c=>(
                    <button key={c.id} onClick={()=>{ setMobileOpen(false); openCategory(c); }} className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 text-left">
                      <span className="w-12 h-12 rounded bg-gray-100 overflow-hidden"><img src={c.image} alt="" className="w-full h-full object-cover" /></span>
                      <span className="text-[14px] font-medium leading-tight">{c.titleShort}</span>
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-3 pt-4 border-t">
                <button onClick={()=>scrollTo('works')} className="block text-[16px] font-medium">Наши работы</button>
                <button onClick={()=>scrollTo('about')} className="block text-[16px] font-medium">О компании</button>
                <button onClick={()=>scrollTo('contacts')} className="block text-[16px] font-medium">Контакты</button>
                <div className="pt-4">
                  <div className="text-[13px] text-gray-500">Позвоните нам</div>
                  <a href="tel:+79673448484" className="text-[18px] font-bold">+7 (967) 344-84-84</a>
                </div>
                <button onClick={()=>{ setMobileOpen(false); setCallbackOpen(true);}} className="w-full mt-2 bg-[#EF6D12] text-white h-[44px] rounded font-semibold">Заказать звонок</button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Страница категории с автоматической загрузкой фото */}
      {selectedCategory && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100">
            <div className="mx-auto max-w-[1440px] px-4 lg:px-8 h-[64px] flex items-center justify-between">
              <button onClick={closeCategory} className="flex items-center gap-2 text-[#1B222E] hover:text-[#EF6D12] transition font-medium">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Назад в каталог
              </button>
              <div className="text-[16px] font-bold text-[#EF6D12]">{selectedCategory.titleShort}</div>
              <a href="tel:+79673448484" className="text-[14px] font-semibold hover:text-[#EF6D12] transition">+7 (967) 344-84-84</a>
            </div>
          </div>

          <div className="mx-auto max-w-[1440px] px-4 lg:px-8 py-8 lg:py-12">
            <h1 className="text-[28px] lg:text-[40px] font-black tracking-[-0.02em] leading-[1.1]">
              {selectedCategory.title}
            </h1>
            <p className="text-[16px] text-[#5A667A] mt-2 max-w-[600px]">
              Выберите подходящий вариант из нашего каталога. Все материалы в наличии на складе в СПб.
            </p>

            {/* Автоматическая сетка фото из папки */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-8">
              {selectedCategory.images.map((img, i) => (
                <div key={i} className="group bg-[#F6F8FA] rounded-[8px] overflow-hidden border border-gray-100 hover:border-[#EF6D12]/30 hover:shadow-[0_12px_30px_rgba(16,24,40,.08)] transition-all cursor-pointer">
                  <div className="aspect-[4/3] overflow-hidden bg-[#E8ECF0]">
                    <img
                      src={img}
                      alt={`${selectedCategory.titleShort} ${i + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = selectedCategory.fallback;
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-[13px] font-semibold">Модель #{i + 1}</div>
                    <div className="text-[12px] text-[#5A667A]">Артикул: {selectedCategory.id.toUpperCase()}-{String(i + 1).padStart(3, '0')}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-10 text-center">
              <button
                onClick={() => {
                  closeCategory();
                  setCallbackOpen(true);
                }}
                className="h-[52px] px-8 bg-[#EF6D12] hover:bg-[#E0610A] text-white font-semibold rounded-[6px] transition shadow-[0_8px_20px_rgba(239,109,18,.25)]"
              >
                Заказать {selectedCategory.titleShort.toLowerCase()}
              </button>
              <p className="text-[13px] text-gray-400 mt-3">Перезвоним за 5 минут, поможем с выбором</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero */}
      <section className="relative bg-[#E8EEF4] overflow-hidden">
        <div className="absolute inset-0 lg:left-[38%] lg:w-[62%]">
          <img
            src="/images/hero-house.jpg"
            alt="Дом с каменным фасадом"
            className="w-full h-full object-cover"
            onError={(e)=>{ (e.target as HTMLImageElement).src='https://images.pexels.com/photos/31737859/pexels-photo-31737859.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200'; }}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#E8EEF4] via-[#E8EEF4]/85 to-transparent lg:via-[#E8EEF4]/10 lg:from-[#E8EEF4]/80" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#E8EEF4]/40 to-transparent lg:hidden" />
          <div className="hidden lg:block absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/3 w-[55%] h-[70%] opacity-[0.22] grayscale blur-[0.5px] pointer-events-none">
             <img src="https://images.pexels.com/photos/8134821/pexels-photo-8134821.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200" alt="" className="w-full h-full object-cover" />
          </div>
        </div>

        <div className="relative mx-auto max-w-[1440px] px-4 lg:px-8">
          <div className="py-[44px] sm:py-[56px] lg:py-[92px] max-w-[560px]">
            <h1 className="font-black uppercase leading-[0.95] tracking-[-0.03em] text-[32px] sm:text-[42px] lg:text-[48px] text-[#19202D]">
              Фасады, плитка<br />и брусчатка<br />
              <span className="text-[#EF6D12]">от производителя</span>
            </h1>
            <p className="mt-6 text-[15px] sm:text-[16px] leading-[1.55] text-[#3C4656] max-w-[380px]">
              Производим и поставляем качественные строительные материалы в Санкт-Петербурге и Ленинградской области
            </p>
            <div className="mt-8 flex gap-3 flex-wrap">
              <button onClick={()=>scrollTo('catalog')} className="h-[46px] px-[22px] bg-[#EF6D12] hover:bg-[#E0610A] text-white font-semibold text-[14px] rounded-[4px] shadow-[0_8px_20px_rgba(239,109,18,.25)] transition">
                Каталог продукции
              </button>
              <button onClick={()=>scrollTo('works')} className="h-[46px] px-[22px] bg-white/90 backdrop-blur border border-[#2B3443] text-[#212832] font-semibold text-[14px] rounded-[4px] hover:bg-white transition">
                Наши работы
              </button>
            </div>
          </div>
        </div>

        <div className="lg:hidden relative pb-4 flex justify-center gap-2 mt-[-10px] z-10">
          <span className="w-[18px] h-[6px] rounded-full bg-[#EF6D12]" />
          <span className="w-[6px] h-[6px] rounded-full bg-white/70 border border-gray-300" />
          <span className="w-[6px] h-[6px] rounded-full bg-white/70 border border-gray-300" />
        </div>
      </section>

      {/* USP bar */}
      <section className="bg-white border-y border-gray-100">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8 py-5 lg:py-7">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-8">
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 shrink-0 text-[#EF6D12]">
                <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><path d="M4 34V14l8-8h4v6h6V4l8 8v22H4Z M8 34h4V22H8v12Z M16 34h4V22h-4v12Z M24 34h4V22h-4v12Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="4" y="28" width="28" height="2" rx="1" fill="currentColor" opacity=".15"/></svg>
              </div>
              <div className="text-[14px] leading-[1.25] font-medium text-[#1D242F]"><span className="block">Собственное</span><span className="block">производство</span></div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 shrink-0 text-[#EF6D12]">
                <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><circle cx="20" cy="14" r="9" stroke="currentColor" strokeWidth="1.4"/><path d="M15 14l3 3 6-6" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 26l-2 8 6-2 4 2 6-2 2-8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="text-[14px] leading-[1.25] font-medium text-[#1D242F]"><span className="block">Высокое</span><span className="block">качество</span></div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 shrink-0 text-[#EF6D12]">
                <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><path d="M20 4L8 9v10c0 6.5 3.8 12.6 12 17 8.2-4.4 12-10.5 12-17V9L20 4Z" stroke="currentColor" strokeWidth="1.4"/><path d="M14 20l4 4 8-8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
              </div>
              <div className="text-[14px] leading-[1.25] font-medium text-[#1D242F]"><span className="block">Прочность</span><span className="block">и долговечность</span></div>
            </div>
            <div className="flex gap-3 items-start">
              <div className="w-10 h-10 shrink-0 text-[#EF6D12]">
                <svg viewBox="0 0 40 40" fill="none" className="w-full h-full"><path d="M3 12h18v12H3z M21 16h6l5 5v7h-5 M7 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M27 32a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M3 20h6" stroke="currentColor" strokeWidth="1.4"/></svg>
              </div>
              <div className="text-[14px] leading-[1.25] font-medium text-[#1D242F]"><span className="block">Доставка по СПб</span><span className="block">и области</span></div>
            </div>
          </div>
        </div>
      </section>

      {/* Catalog */}
      <section id="catalog" className="bg-[#FBFCFD] py-8 lg:py-10">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
          <div className="flex items-center justify-between mb-5 lg:hidden">
            <h2 className="text-[18px] font-bold">Каталог продукции</h2>
            <button onClick={() => setToast('Каталог скоро загрузится полностью')} className="text-[13px] font-medium text-[#3A4452] flex items-center gap-1">
              Смотреть все <span className="text-[#EF6D12]">→</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 lg:gap-4">
            {catalog.map((item) => (
              <div
                key={item.id}
                onClick={() => openCategory(item)}
                className="group bg-[#F6F8FA] rounded-[6px] overflow-hidden border border-gray-100 hover:border-[#EF6D12]/30 hover:shadow-[0_12px_30px_rgba(16,24,40,.08)] transition-all cursor-pointer flex flex-col"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-[#E8ECF0]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover group-hover:scale-[1.06] transition duration-700"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = item.fallback;
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/15 to-transparent opacity-0 group-hover:opacity-100 transition" />
                </div>
                <div className="p-3 flex-1 flex items-center justify-between gap-2">
                  <div className="text-[11px] lg:text-[12px] font-extrabold leading-[1.15] uppercase tracking-[-0.01em] text-[#1B232F]">
                    {item.title.split(' ').slice(0, 3).join(' ')}<br />
                    {item.title.split(' ').slice(3).join(' ')}
                  </div>
                  <div className="w-6 h-6 rounded-full bg-white group-hover:bg-[#EF6D12] text-[#EF6D12] group-hover:text-white grid place-items-center shrink-0 border border-[#F0DDCF] group-hover:border-[#EF6D12] transition">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <path d="M5 12h14M13 5l7 7-7 7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* === Our works === */}
      <section id="works" className="bg-white py-10 lg:py-14">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[20px] lg:text-[24px] font-extrabold tracking-[-0.02em]">Наши работы</h2>
            <button 
              onClick={() => setShowAllWorks(true)}
              className="text-[13px] font-medium text-[#3E4A5C] flex items-center gap-1 hover:gap-2 transition-all"
            >
              Смотреть все <span className="text-[#EF6D12]">→</span>
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 lg:gap-4">
            {worksData.slice(0, 5).map((w) => (
              <div 
                key={w.id} 
                onClick={() => setSelectedWork(w)} 
                className="group relative rounded-[6px] overflow-hidden aspect-[4/3] bg-[#EEF2F6] cursor-pointer"
              >
                <img 
                  src={w.image} 
                  alt={w.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-700" 
                  onError={(e)=>{ (e.target as HTMLImageElement).src=w.fallback || w.image; }} 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#16202F]/80 via-[#16202F]/10 to-transparent opacity-0 group-hover:opacity-100 transition" />
                <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition">
                  <div className="text-[11px] leading-tight font-semibold text-white">{w.title}</div>
                  <div className="text-[10px] text-white/70">{w.category} • {w.year}</div>
                </div>
                {w.video && (
                  <div className="absolute top-2 right-2 bg-[#FF0000] text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                    ВИДЕО
                  </div>
                )}
              </div>
            ))}
          </div>
          <button 
            onClick={() => setShowAllWorks(true)} 
            className="lg:hidden mt-5 w-full h-[44px] rounded-[4px] border border-[#212832] font-semibold text-[14px] hover:bg-[#212832] hover:text-white transition"
          >
            Показать все работы
          </button>
        </div>
      </section>

      {/* === Страница "Все работы" === */}
      {showAllWorks && (
        <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
          <div className="sticky top-0 z-10 bg-white/95 backdrop-blur-md border-b border-gray-100">
            <div className="mx-auto max-w-[1440px] px-4 lg:px-8 h-[64px] flex items-center justify-between">
              <button onClick={() => setShowAllWorks(false)} className="flex items-center gap-2 text-[#1B222E] hover:text-[#EF6D12] transition font-medium">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Назад
              </button>
              <div className="text-[16px] font-bold text-[#EF6D12]">Все работы</div>
              <a href="tel:+79673448484" className="text-[14px] font-semibold hover:text-[#EF6D12] transition">+7 (967) 344-84-84</a>
            </div>
          </div>

          <div className="mx-auto max-w-[1440px] px-4 lg:px-8 py-8 lg:py-12">
            <h1 className="text-[28px] lg:text-[40px] font-black tracking-[-0.02em] leading-[1.1]">
              Наши работы
            </h1>
            <p className="text-[16px] text-[#5A667A] mt-2 max-w-[600px]">
              Более 800 реализованных проектов. Фото, видео и отзывы наших клиентов.
            </p>

            {/* Видео-презентация с твоим видео */}
            <div className="mt-8 relative rounded-[12px] overflow-hidden bg-[#1B222E] aspect-video max-w-[900px]">
              <Player
                src="https://rutube.ru/play/embed/2bb783d89c63eac106018c32466b6159/"
                className="w-full h-full"
              />
            </div>
            <p className="text-[13px] text-gray-400 mt-2">Видео-презентация наших проектов</p>

            {/* Фильтр */}
            <div className="mt-8 flex flex-wrap gap-2">
              <button 
                onClick={() => setWorkFilter('all')}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition ${
                  workFilter === 'all' 
                    ? 'bg-[#EF6D12] text-white' 
                    : 'bg-[#F0F2F5] text-[#5A667A] hover:bg-[#E8ECF0]'
                }`}
              >
                Все
              </button>
              {catalog.map((cat) => (
                <button 
                  key={cat.id}
                  onClick={() => setWorkFilter(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition ${
                    workFilter === cat.id 
                      ? 'bg-[#EF6D12] text-white' 
                      : 'bg-[#F0F2F5] text-[#5A667A] hover:bg-[#E8ECF0]'
                  }`}
                >
                  {cat.titleShort}
                </button>
              ))}
            </div>

            {/* Сетка работ */}
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-6">
              {worksData
                .filter(w => workFilter === 'all' || w.categoryId === workFilter)
                .map((w) => (
                  <div 
                    key={w.id} 
                    onClick={() => setSelectedWork(w)} 
                    className="group bg-[#F6F8FA] rounded-[8px] overflow-hidden border border-gray-100 hover:border-[#EF6D12]/30 hover:shadow-[0_12px_30px_rgba(16,24,40,.08)] transition-all cursor-pointer"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-[#E8ECF0] relative">
                      <img 
                        src={w.image} 
                        alt={w.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500" 
                        onError={(e) => { (e.target as HTMLImageElement).src = w.fallback; }} 
                      />
                      {w.video && (
                        <div className="absolute top-2 right-2 bg-[#FF0000] text-white text-[8px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                          <svg width="10" height="10" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                          ВИДЕО
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      <div className="text-[14px] font-bold leading-tight">{w.title}</div>
                      <div className="text-[12px] text-[#5A667A] mt-1">{w.category} • {w.year}</div>
                      <div className="text-[12px] text-[#8A96A8]">{w.location}</div>
                      <button className="mt-2 text-[12px] font-semibold text-[#EF6D12] hover:text-[#E0610A] transition">
                        Подробнее →
                      </button>
                    </div>
                  </div>
                ))}
            </div>

            {worksData.filter(w => workFilter === 'all' || w.categoryId === workFilter).length === 0 && (
              <div className="text-center py-12">
                <div className="text-[48px]">🔍</div>
                <div className="text-[18px] font-semibold mt-2">Нет работ в этой категории</div>
                <div className="text-[14px] text-[#5A667A]">Выберите другую категорию</div>
              </div>
            )}

            <div className="mt-10 text-center">
              <button
                onClick={() => {
                  setShowAllWorks(false);
                  setCallbackOpen(true);
                }}
                className="h-[52px] px-8 bg-[#EF6D12] hover:bg-[#E0610A] text-white font-semibold rounded-[6px] transition shadow-[0_8px_20px_rgba(239,109,18,.25)]"
              >
                Хотите так же? Закажите консультацию
              </button>
              <p className="text-[13px] text-gray-400 mt-3">Перезвоним за 5 минут, расскажем про все этапы</p>
            </div>
          </div>
        </div>
      )}

      {/* === Модалка просмотра работы === */}
      {selectedWork && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          <div onClick={() => setSelectedWork(null)} className="absolute inset-0 bg-[#12171F]/80 backdrop-blur-[6px]" />
          <div className="relative w-full max-w-[700px] max-h-[90vh] bg-white rounded-[16px] overflow-y-auto animate-[slideUp_.3s_ease]">
            <button 
              onClick={() => setSelectedWork(null)} 
              className="absolute right-4 top-4 z-10 w-8 h-8 rounded-full bg-black/50 hover:bg-black/70 text-white grid place-items-center transition"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round"/>
              </svg>
            </button>

            <div className="aspect-[16/9] bg-[#1B222E]">
              {selectedWork.video ? (
                <Player
                  src={selectedWork.video}
                  className="w-full h-full"
                />
              ) : (
                <img 
                  src={selectedWork.image} 
                  alt={selectedWork.title} 
                  className="w-full h-full object-cover" 
                  onError={(e) => { (e.target as HTMLImageElement).src = selectedWork.fallback; }} 
                />
              )}
            </div>

            <div className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-[20px] font-bold">{selectedWork.title}</h3>
                  <div className="flex items-center gap-3 mt-1 text-[13px] text-[#5A667A]">
                    <span>{selectedWork.category}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{selectedWork.year}</span>
                    <span className="w-1 h-1 rounded-full bg-gray-300" />
                    <span>{selectedWork.location}</span>
                  </div>
                </div>
                {selectedWork.video && (
                  <span className="bg-[#FF0000] text-white text-[10px] font-bold px-3 py-1 rounded-full flex items-center gap-1 shrink-0">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="white"><polygon points="5,3 19,12 5,21"/></svg>
                    ВИДЕО
                  </span>
                )}
              </div>

              <p className="mt-3 text-[15px] text-[#3C4656] leading-[1.6]">
                {selectedWork.description}
              </p>

              <div className="mt-6 flex gap-3 flex-wrap">
                <button 
                  onClick={() => {
                    setSelectedWork(null);
                    setCallbackOpen(true);
                  }}
                  className="h-[40px] px-5 bg-[#EF6D12] hover:bg-[#E0610A] text-white font-semibold rounded-[6px] text-[13px] transition"
                >
                  Заказать такой же проект
                </button>
                <button 
                  onClick={() => setSelectedWork(null)} 
                  className="h-[40px] px-5 border border-gray-300 hover:bg-gray-50 font-medium rounded-[6px] text-[13px] transition"
                >
                  Закрыть
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* About / Banner */}
<section id="about" className="bg-[#212832] relative overflow-hidden">
  <div className="mx-auto max-w-[1440px] px-4 lg:px-8 py-12 lg:py-20 grid lg:grid-cols-[1.1fr_.9fr] gap-10 items-center">
    <div className="relative z-10">
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white/80 text-[11px] uppercase tracking-widest font-semibold mb-5">О компании БИОПЛИТ</div>
      <h2 className="text-white text-[28px] lg:text-[36px] font-black leading-[1.05] tracking-[-0.03em]">Производим с 2014 года.<br />Более 800 объектов<br /><span className="text-[#EF6D12]">в СПб и ЛО.</span></h2>
      <p className="mt-5 text-[15px] leading-[1.6] text-white/70 max-w-[480px]">Собственный цех 1200 м², вибропрессовое оборудование Hess, контроль каждой партии. Даем паспорт качества и гарантию на морозостойкость F300.</p>
      <div className="mt-8 grid grid-cols-3 gap-6 max-w-[460px] border-t border-white/10 pt-6">
        <div><div className="text-[28px] font-black text-white leading-none">12</div><div className="text-[12px] text-white/60 mt-1 leading-tight">лет на рынке</div></div>
        <div><div className="text-[28px] font-black text-white leading-none">47</div><div className="text-[12px] text-white/60 mt-1 leading-tight">видов плитки и камня</div></div>
        <div><div className="text-[28px] font-black text-white leading-none">24ч</div><div className="text-[12px] text-white/60 mt-1 leading-tight">расчет сметы</div></div>
      </div>
    </div>
    <div className="relative">
      <div className="rounded-[12px] overflow-hidden bg-[#2A333F] border border-white/10 p-2">
        <div className="rounded-[8px] overflow-hidden aspect-[4/3] relative">
          {/* ЛОКАЛЬНОЕ ФОТО — положи в /public/images/about/factory.jpg */}
          <img 
            src="/images/about/factory.jpg" 
            alt="Производство БИОПЛИТ" 
            className="w-full h-full object-cover" 
            onError={(e) => {
              // Если фото не найдено — показываем красивую заглушку
              const img = e.target as HTMLImageElement;
              img.style.display = 'none';
              // Показываем SVG-заглушку
              const parent = img.parentElement;
              if (parent) {
                const fallback = document.createElement('div');
                fallback.className = 'w-full h-full bg-[#2A333F] flex items-center justify-center text-white/40';
                fallback.innerHTML = `
                  <div class="text-center p-4">
                    <svg class="w-16 h-16 mx-auto mb-3 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16z"/>
                    </svg>
                    <div class="text-sm font-medium">Фото завода</div>
                    <div class="text-xs text-white/30 mt-1">Положите фото в /public/images/about/factory.jpg</div>
                  </div>
                `;
                parent.appendChild(fallback);
              }
            }}
          />
          <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur rounded-[8px] p-4 flex gap-3 items-center">
            <div className="w-12 h-12 rounded-[8px] bg-[#212832] grid place-items-center text-white font-black text-[18px]">Б</div>
            <div>
              <div className="text-[13px] font-bold leading-tight">Завод старообрядческая улица 24 санкт петербург</div>
              <div className="text-[12px] text-gray-500">Отгрузка 6 дней в неделю, 8:00-19:00</div>
            </div>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -right-6 w-[140px] h-[140px] rounded-full bg-[#EF6D12] blur-[40px] opacity-40" />
    </div>
  </div>
</section>

      {/* Services compact */}
      <section className="bg-[#F5F7FA] py-10 lg:py-14">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-4">
            {[
              { n: '01', t: 'Монтаж фасада под ключ', d: 'Подсистема, утеплитель, плитка, затирка. Бригада 4 чел, от 80 м² за 5 дней.' },
              { n: '02', t: 'Укладка брусчатки', d: 'Подготовка основания, геотекстиль, вибротрамбовка. Гарантия на просадку 2 года.' },
              { n: '03', t: 'Бесплатный замер и 3D-визуализация', d: 'Выезд инженера по СПб бесплатно, покажем как будет выглядеть ваш дом.' },
            ].map(s=>(
              <div key={s.n} className="bg-white rounded-[8px] p-6 border border-gray-100 hover:shadow-[0_8px_24px_rgba(0,0,0,.06)] transition group">
                <div className="flex justify-between items-start">
                  <div className="text-[44px] font-black leading-none text-[#EEF1F5] group-hover:text-[#FFF0E6] transition">{s.n}</div>
                  <div className="w-8 h-8 rounded-full bg-[#F5F7FA] group-hover:bg-[#EF6D12] text-[#9AA4B2] group-hover:text-white grid place-items-center transition">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M7 17L17 7M17 7H9M17 7V15" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                </div>
                <div className="mt-3 text-[16px] font-bold leading-tight">{s.t}</div>
                <div className="mt-2 text-[13px] leading-[1.5] text-[#5A667A]">{s.d}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contacts */}
<section id="contacts" className="bg-white py-10 lg:py-16 border-t">
  <div className="mx-auto max-w-[1440px] px-4 lg:px-8 grid lg:grid-cols-[1fr_440px] gap-10">
    <div>
      <h2 className="text-[24px] lg:text-[32px] font-black tracking-[-0.02em] leading-[1.1]">Приезжайте в наш офис<br />в Санкт-Петербурге</h2>
      <div className="mt-8 grid sm:grid-cols-2 gap-8 max-w-[620px]">
        <div>
          <div className="text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Адрес офиса</div>
          <div className="text-[15px] font-medium leading-[1.4]">Санкт-Петербург,<br />Старообрядческая ул., 24<br/><span className="text-gray-500 text-[13px]">м. Московские ворота</span></div>
        </div>
        <div>
          <div className="text-[11px] uppercase tracking-widest font-bold text-gray-400 mb-2">Телефон и почта</div>
          <a href="tel:+79673448484" className="block text-[18px] font-bold">+7 (967) 344-84-84</a>
          <a href="mailto:info@bioplit.ru" className="text-[14px] text-[#EF6D12] font-medium">info@bioplit.ru</a>
          <div className="text-[13px] text-gray-500 mt-1">Пн-Сб 9:00-19:00, Вс - по записи</div>
        </div>
      </div>

      {/* КАРТА — ваша */}
      <div className="mt-8 rounded-[12px] overflow-hidden bg-[#F1F4F8] aspect-[16/9] lg:aspect-[2/1] relative border border-gray-100">
        <iframe
          src="https://yandex.ru/map-widget/v1/?ll=30.299339%2C59.888013&z=16.25&pt=30.299339%2C59.888013%2Cflag&whatshere%5Bpoint%5D=30.299339%2C59.888013&whatshere%5Bzoom%5D=17"
          className="w-full h-full"
          frameBorder="0"
          allowFullScreen
          title="Карта проезда — Старообрядческая ул., 24, Санкт-Петербург"
        />
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-[#212832] text-white px-4 py-2 rounded-full text-[13px] font-semibold flex items-center gap-2 shadow-xl whitespace-nowrap">
          <span className="w-2 h-2 bg-[#EF6D12] rounded-full animate-pulse block" />
          Мы здесь — Старообрядческая ул., 24
        </div>
      </div>
    </div>

    {/* Форма */}
    <div className="bg-[#F7F9FB] rounded-[12px] p-6 lg:p-7 border border-gray-100 h-fit">
      <div className="text-[18px] font-bold leading-tight">Рассчитаем смету за 1 час</div>
      <div className="text-[13px] text-[#5A667A] mt-1">Бесплатно, без спама. Инженер перезвонит.</div>
      <form onSubmit={(e)=>{ e.preventDefault(); setToast('Заявка отправлена! Перезвоним в течение 15 минут.'); (e.target as HTMLFormElement).reset(); }} className="mt-6 space-y-3">
        <input required placeholder="Ваше имя" className="w-full h-[44px] px-4 rounded-[4px] border border-gray-200 bg-white text-[14px] outline-none focus:border-[#EF6D12] focus:ring-2 focus:ring-[#EF6D12]/20" />
        <input required placeholder="+7 (___) ___-__-__" type="tel" className="w-full h-[44px] px-4 rounded-[4px] border border-gray-200 bg-white text-[14px] outline-none focus:border-[#EF6D12] focus:ring-2 focus:ring-[#EF6D12]/20" />
        <select className="w-full h-[44px] px-4 rounded-[4px] border border-gray-200 bg-white text-[14px] outline-none focus:border-[#EF6D12]">
          <option>Что интересует?</option>
          <option>Фасадная плитка</option>
          <option>Брусчатка</option>
          <option>Монтаж под ключ</option>
        </select>
        <button type="submit" className="w-full h-[46px] bg-[#EF6D12] hover:bg-[#E0610A] text-white font-semibold rounded-[4px] text-[14px] transition">Получить расчет</button>
        <div className="text-[11px] text-gray-400 leading-[1.3] text-center">Нажимая кнопку, вы соглашаетесь с политикой конфиденциальности</div>
      </form>
    </div>
  </div>
</section>

      {/* Footer */}
      <footer className="bg-[#212832] text-white/80 pt-10 pb-8">
        <div className="mx-auto max-w-[1440px] px-4 lg:px-8">
          <div className="flex flex-col lg:flex-row justify-between gap-8 pb-8 border-b border-white/10">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-[6px] grid place-items-center text-[#212832] font-black text-[18px]">Б</div>
                <div className="leading-none">
                  <div className="font-black text-white text-[20px]">БИО<span className="text-[#EF6D12]">ПЛИТ</span></div>
                  <div className="text-[10px] uppercase tracking-widest opacity-60">Фасады • Плитка • Брусчатка</div>
                </div>
              </div>
              <div className="mt-4 text-[13px] leading-[1.5] max-w-[320px] opacity-60">Производитель фасадной плитки и тротуарной брусчатки. Собственное производство в Ленобласти.</div>
            </div>
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-8 text-[13px]">
              <div>
                <div className="font-bold text-white mb-3">Каталог</div>
                <div className="space-y-2 opacity-70">
                  {catalog.map(c=> <div key={c.id} onClick={() => openCategory(c)} className="hover:text-white cursor-pointer hover:opacity-100 transition">{c.titleShort}</div>)}
                </div>
              </div>
              <div>
                <div className="font-bold text-white mb-3">Компания</div>
                <div className="space-y-2 opacity-70">
                  <div className="hover:text-white cursor-pointer" onClick={() => scrollTo('about')}>О производстве</div>
                  <div className="hover:text-white cursor-pointer">Сертификаты</div>
                  <div className="hover:text-white cursor-pointer">Доставка и оплата</div>
                  <div className="hover:text-white cursor-pointer" onClick={() => scrollTo('contacts')}>Контакты</div>
                </div>
              </div>
              <div className="col-span-2 lg:col-span-1">
                <div className="font-bold text-white mb-3">Связаться</div>
                <a href="tel:+79673448484" className="text-[18px] font-bold text-white block">+7 (967) 344-84-84</a>
                <button onClick={()=>setCallbackOpen(true)} className="mt-3 h-[38px] px-5 bg-[#EF6D12] text-white rounded-[4px] font-semibold text-[13px]">Заказать звонок</button>
                <div className="mt-4 text-[12px] opacity-50">п. Щеглово, Заводская 12<br/>ИНН 7806543210 • ОГРН 1147847273821</div>
              </div>
            </div>
          </div>
          <div className="pt-6 flex flex-col md:flex-row justify-between gap-3 text-[11px] opacity-40">
            <div>© 2014 — 2026 БИОПЛИТ. Все права защищены. Цена на сайте не является публичной офертой.</div>
            <div className="flex gap-4"><span>Политика конфиденциальности</span><span>Карта сайта</span></div>
          </div>
        </div>
      </footer>

      {/* Callback modal */}
      {callbackOpen && (
        <div className="fixed inset-0 z-[80] flex items-end lg:items-center justify-center">
          <div onClick={()=>setCallbackOpen(false)} className="absolute inset-0 bg-[#12171F]/70 backdrop-blur-[6px]" />
          <div className="relative w-full lg:max-w-[440px] bg-white rounded-t-[16px] lg:rounded-[12px] p-7 shadow-[0_20px_60px_rgba(0,0,0,.35)] animate-[slideUp_.3s_ease]">
            <button onClick={()=>setCallbackOpen(false)} className="absolute right-4 top-4 w-8 h-8 rounded-full bg-[#F2F4F6] grid place-items-center">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"><path d="M6 6l12 12M18 6L6 18" stroke="#1B222E" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </button>
            <div className="text-[22px] font-black tracking-[-0.02em] leading-[1.1]">Заказать звонок</div>
            <div className="text-[13px] text-[#5A667A] mt-1">Перезвоним за 5 минут, подскажем по плитке и рассчитаем доставку.</div>
            <form onSubmit={(e)=>{ e.preventDefault(); setCallbackOpen(false); setToast('Спасибо! Перезвоним в течение 5 минут.'); (e.target as HTMLFormElement).reset(); }} className="mt-6 space-y-3">
              <input required placeholder="Как к вам обращаться" className="w-full h-[46px] px-4 rounded-[6px] border border-gray-200 text-[14px] focus:border-[#EF6D12] focus:ring-4 focus:ring-[#EF6D12]/15 outline-none" />
              <input required placeholder="+7 (___) ___-__-__" type="tel" className="w-full h-[46px] px-4 rounded-[6px] border border-gray-200 text-[14px] focus:border-[#EF6D12] focus:ring-4 focus:ring-[#EF6D12]/15 outline-none" />
              <button className="w-full h-[48px] bg-[#EF6D12] hover:bg-[#D85E0A] text-white font-semibold rounded-[6px] transition">Жду звонка</button>
              <div className="text-[11px] text-center text-gray-400">Нажимая кнопку, вы соглашаетесь на обработку данных</div>
            </form>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[90] bg-[#1E252F] text-white px-5 py-3 rounded-full shadow-[0_10px_30px_rgba(0,0,0,.3)] text-[13px] font-medium flex items-center gap-2 max-w-[90vw] text-center animate-[slideUp_.25s_ease]">
          <span className="w-2 h-2 bg-[#EF6D12] rounded-full animate-pulse block shrink-0" /> {toast}
        </div>
      )}

      <style>{`
        @keyframes slideUp { from { transform: translateY(20px); opacity:0 } to { transform: translateY(0); opacity:1 } }
      `}</style>
    </div>
  );
}