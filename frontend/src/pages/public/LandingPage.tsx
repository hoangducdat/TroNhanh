// ============================================================
// pages/public/LandingPage.tsx
// Premium Landing Page — Split hero + CSS animated map background.
// Zero external dependencies — all animations via CSS keyframes.
// ============================================================

import { Link } from 'react-router-dom';

// ── Data cho các pin giả lập trên map ──────────────────────
const MAP_PINS = [
  { id: 1, top: '22%', left: '28%', price: '3.5tr', delay: '0s',   size: 'lg' },
  { id: 2, top: '45%', left: '55%', price: '2.8tr', delay: '0.4s', size: 'md' },
  { id: 3, top: '62%', left: '30%', price: '4.2tr', delay: '0.8s', size: 'lg' },
  { id: 4, top: '30%', left: '70%', price: '1.9tr', delay: '0.2s', size: 'sm' },
  { id: 5, top: '72%', left: '65%', price: '3.1tr', delay: '1.1s', size: 'md' },
  { id: 6, top: '15%', left: '50%', price: '5.0tr', delay: '0.6s', size: 'sm' },
  { id: 7, top: '55%', left: '18%', price: '2.2tr', delay: '0.9s', size: 'md' },
]

const STATS = [
  { value: '2,400+', label: 'Phòng trọ' },
  { value: '15,000+', label: 'Người dùng' },
  { value: '98%',     label: 'Hài lòng' },
  { value: '3s',      label: 'Tốc độ tìm' },
]

export default function LandingPage() {
  return (
    <div className="flex flex-col overflow-hidden bg-white dark:bg-[#09090b]">

      {/* ══════════════════════════════════════════════════════
          HERO SECTION — Split Layout
      ══════════════════════════════════════════════════════ */}
      <section className="relative min-h-[calc(100vh-64px)] flex flex-col lg:flex-row items-center overflow-hidden bg-white dark:bg-[#09090b]">

        {/* ── Left: Text content ────────────────────────── */}
        <div className="relative z-10 w-full lg:w-1/2 px-6 sm:px-8 md:px-16 lg:px-20 pt-16 lg:py-20 flex flex-col justify-center order-1 lg:order-none">

          {/* Eyebrow badge */}
          <div className="inline-flex items-center gap-2 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest px-4 py-2 rounded-full mb-8 w-fit animate-[badge-in_0.6s_ease-out_both]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Nền tảng #1 Việt Nam
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl xl:text-7xl font-black text-zinc-900 dark:text-white leading-[1.05] tracking-tighter mb-6 animate-[slide-in-left_0.7s_ease-out_0.1s_both]">
            Tìm nơi<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-zinc-800 to-zinc-500 dark:from-zinc-100 dark:to-zinc-500">
              trú chân
            </span>
            <br />
            <span className="text-emerald-600 dark:text-emerald-500">lý tưởng.</span>
          </h1>

          <p className="text-zinc-600 dark:text-zinc-400 text-lg font-light leading-relaxed mb-10 max-w-md animate-[slide-in-left_0.7s_ease-out_0.25s_both]">
            Bản đồ tương tác thời gian thực. Kết nối trực tiếp chủ trọ — người thuê.
            Không qua trung gian, không phí ẩn.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4 animate-[slide-in-left_0.7s_ease-out_0.4s_both]">
            <Link
              to="/search"
              className="group flex justify-center items-center gap-3 px-8 py-4 bg-emerald-600 text-white font-bold rounded-2xl hover:bg-emerald-500 transition-all duration-200 active:scale-[0.97] shadow-xl shadow-emerald-600/30"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              Mở bản đồ ngay
            </Link>
            <Link
              to="/register"
              className="flex justify-center items-center gap-2 px-8 py-4 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-bold rounded-2xl hover:bg-zinc-800 dark:hover:bg-zinc-100 transition-all duration-200 active:scale-[0.97] shadow-xl shadow-zinc-900/20 dark:shadow-white/20"
            >
              Đăng phòng miễn phí
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M17 8l4 4m0 0l-4 4m4-4H3"/>
              </svg>
            </Link>
          </div>

          {/* Micro trust badges */}
          <div className="flex items-center gap-6 mt-12 animate-[slide-in-left_0.7s_ease-out_0.55s_both]">
            <div className="flex -space-x-2">
              {['#374151','#065f46','#7c3aed','#b45309'].map((c, i) => (
                <div key={i} className="w-9 h-9 rounded-full border-2 border-white dark:border-[#09090b] flex items-center justify-center text-white text-xs font-black" style={{backgroundColor: c}}>
                  {['A','B','C','D'][i]}
                </div>
              ))}
            </div>
            <div>
              <div className="flex items-center gap-1 mb-0.5">
                {[1,2,3,4,5].map(i => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>
                ))}
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 font-medium">15,000+ người dùng tin tưởng</p>
            </div>
          </div>
        </div>

        {/* ── Right: Animated Map ───────────────────────── */}
        <div className="relative lg:absolute right-0 top-0 w-full lg:w-1/2 h-[50vh] lg:h-full flex items-center justify-center overflow-hidden pointer-events-none bg-slate-50 dark:bg-[#0c0c0f] mt-8 lg:mt-0 order-2 lg:order-none opacity-80 lg:opacity-100 mask-image-bottom lg:mask-image-none">

          {/* Map container */}
          <div className="relative w-full h-full animate-[map-reveal_1s_ease-out_0.3s_both]">

            {/* Map grid background — SVG tiles */}
            <div className="absolute inset-0 overflow-hidden">
              <svg className="w-full h-full opacity-40 dark:opacity-20" xmlns="http://www.w3.org/2000/svg">
                <defs>
                  <pattern id="mapgrid" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                    <path d="M 80 0 L 0 0 0 80" fill="none" stroke="currentColor" strokeWidth="1.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#mapgrid)" className="text-emerald-200/50 dark:text-zinc-700/50"/>
              </svg>
            </div>

            {/* Glowing dots at intersections */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50 dark:opacity-30 text-emerald-500 dark:text-zinc-400" style={{ backgroundImage: 'radial-gradient(circle at 100px 100px, currentColor 1.5px, transparent 1.5px)', backgroundSize: '80px 80px' }} />

            {/* Road-like lines */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-70 dark:opacity-50">
              <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
                <line x1="20%" y1="0%" x2="35%" y2="100%" className="stroke-white dark:stroke-zinc-800/80" strokeWidth="24" strokeLinecap="round" />
                <line x1="20%" y1="0%" x2="35%" y2="100%" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="16" strokeLinecap="round" />
                
                <line x1="0%" y1="40%" x2="100%" y2="52%" className="stroke-white dark:stroke-zinc-800/80" strokeWidth="16" strokeLinecap="round" />
                <line x1="0%" y1="40%" x2="100%" y2="52%" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="10" strokeLinecap="round" />
                
                <line x1="55%" y1="0%" x2="48%" y2="100%" className="stroke-white dark:stroke-zinc-800/80" strokeWidth="12" />
                <line x1="55%" y1="0%" x2="48%" y2="100%" className="stroke-slate-100 dark:stroke-zinc-800" strokeWidth="8" />
                
                <path d="M 0 200 Q 250 280 500 200 T 1000 180" fill="none" className="stroke-emerald-100 dark:stroke-emerald-900/30" strokeWidth="20" />
              </svg>
            </div>

            {/* "Block" shapes — buildings (Glassmorphism) */}
            {[
              {t:'12%',l:'38%',w:'80px',h:'55px',r:'12px', c:'bg-white/80 border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]', d:'dark:bg-zinc-800/60 dark:border-zinc-700/50'},
              {t:'38%',l:'60%',w:'110px',h:'70px',r:'16px', c:'bg-emerald-50/80 border-emerald-100/50 shadow-[0_8px_30px_rgb(16,185,129,0.05)]', d:'dark:bg-emerald-900/20 dark:border-emerald-500/20'},
              {t:'65%',l:'25%',w:'90px',h:'50px',r:'12px', c:'bg-white/80 border-slate-200/50 shadow-[0_8px_30px_rgb(0,0,0,0.04)]', d:'dark:bg-zinc-800/60 dark:border-zinc-700/50'},
              {t:'25%',l:'12%',w:'60px',h:'90px',r:'16px', c:'bg-white border-slate-100 shadow-[0_12px_40px_rgb(0,0,0,0.06)]', d:'dark:bg-zinc-800/80 dark:border-zinc-700/60'},
              {t:'55%',l:'70%',w:'70px',h:'65px',r:'12px', c:'bg-emerald-50/80 border-emerald-100/50 shadow-[0_8px_30px_rgb(16,185,129,0.05)]', d:'dark:bg-emerald-900/20 dark:border-emerald-500/20'},
              {t:'78%',l:'50%',w:'100px',h:'45px',r:'12px', c:'bg-white/60 border-slate-200/40 shadow-sm', d:'dark:bg-zinc-800/40 dark:border-zinc-700/30'},
            ].map((b, i) => (
              <div
                key={i}
                className={`absolute border backdrop-blur-xl ${b.c} ${b.d}`}
                style={{
                  top: b.t, left: b.l, width: b.w, height: b.h,
                  borderRadius: b.r,
                  animation: `block-float ${3 + i * 0.4}s ease-in-out ${i * 0.2}s infinite alternate`,
                }}
              />
            ))}

            {/* Location Pins */}
            {MAP_PINS.map(pin => (
              <div
                key={pin.id}
                className="absolute flex flex-col items-center"
                style={{
                  top: pin.top, left: pin.left,
                  animation: `pin-enter 0.6s cubic-bezier(0.34,1.56,0.64,1) ${pin.delay} both`,
                  zIndex: 20,
                }}
              >
                {/* Price bubble */}
                <div className={`
                  flex items-center gap-1 font-black text-white rounded-full shadow-lg whitespace-nowrap
                  ${pin.size === 'lg' ? 'px-4 py-2 text-sm bg-zinc-900 dark:bg-white dark:text-zinc-900 shadow-zinc-900/20 dark:shadow-white/10' :
                    pin.size === 'md' ? 'px-3 py-1.5 text-xs bg-emerald-600 dark:bg-emerald-500 shadow-emerald-600/20 dark:shadow-emerald-900/40' :
                    'px-2.5 py-1 text-[10px] bg-slate-700 dark:bg-zinc-700 shadow-slate-700/20'}
                `}
                  style={{animation: `pin-float 3s ease-in-out ${pin.delay} infinite alternate`}}
                >
                  <svg className="w-3 h-3 fill-current opacity-80" viewBox="0 0 20 20"><path d="M10 0C6.134 0 3 3.134 3 7c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7zm0 9.5A2.5 2.5 0 1 1 10 4.5a2.5 2.5 0 0 1 0 5z"/></svg>
                  {pin.price}
                </div>
                {/* Tail */}
                <div className={`w-0.5 ${pin.size === 'lg' ? 'h-3' : 'h-2'} bg-zinc-900/30 dark:bg-white/30`}/>
                {/* Pulse ring */}
                <div className="relative">
                  <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-white"/>
                  <div className="absolute -inset-1.5 rounded-full border border-zinc-900/20 dark:border-white/30 animate-ping"/>
                </div>
              </div>
            ))}

            {/* Pure Tailwind Gradients for smooth blending */}
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-r from-white via-transparent to-transparent dark:from-[#09090b] dark:via-transparent"/>
            <div className="absolute inset-0 pointer-events-none bg-gradient-to-t from-white via-transparent to-transparent dark:from-[#09090b] dark:via-transparent"/>

            {/* Info card floating */}
            <div
              className="absolute bottom-6 lg:bottom-20 right-4 lg:right-8 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-2xl rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.1)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] border border-white/60 dark:border-zinc-700/50 p-4 lg:p-5 w-56 lg:w-64 scale-90 lg:scale-100 origin-bottom-right"
              style={{animation: 'card-float 4s ease-in-out 0.8s infinite alternate'}}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 dark:from-emerald-500 dark:to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/30">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                </div>
                <div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-wider mb-0.5">Phòng mới đăng</p>
                  <p className="font-black text-zinc-900 dark:text-white text-base">Quận Bình Thạnh</p>
                </div>
              </div>
              <div className="flex items-center justify-between bg-slate-50/50 dark:bg-zinc-800/50 p-3 rounded-xl">
                <span className="font-black text-xl text-zinc-900 dark:text-white">3.5<span className="text-sm font-bold text-zinc-500 dark:text-zinc-400">tr/th</span></span>
                <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-500/20 px-2.5 py-1.5 rounded-lg">CÒN PHÒNG</span>
              </div>
            </div>

            {/* Search widget floating top right */}
            <div
              className="hidden sm:flex absolute top-16 right-6 bg-white/80 dark:bg-[#18181b]/80 backdrop-blur-2xl rounded-2xl shadow-[0_10px_40px_-10px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_-10px_rgba(0,0,0,0.4)] border border-white/60 dark:border-zinc-700/50 px-5 py-4 items-center gap-4"
              style={{animation: 'card-float 3.5s ease-in-out 0.4s infinite alternate'}}
            >
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                <svg className="w-4 h-4 text-zinc-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
                </svg>
              </div>
              <div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 font-bold uppercase tracking-widest mb-0.5">Tìm kiếm gần đây</p>
                <p className="text-sm font-black text-zinc-900 dark:text-white">Quận 3, TP.HCM</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          STATS BAR
      ══════════════════════════════════════════════════════ */}
      <section className="bg-zinc-900 dark:bg-[#111114] py-10 px-4 relative z-10 border-y border-zinc-800">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {STATS.map((s, i) => (
            <div key={i} className="space-y-1">
              <p className="text-3xl md:text-4xl font-black text-white tracking-tight">{s.value}</p>
              <p className="text-zinc-400 text-sm font-medium uppercase tracking-widest">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          FEATURES SECTION
      ══════════════════════════════════════════════════════ */}
      <section className="py-28 px-4 bg-white dark:bg-[#09090b]">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-4">Tại sao chọn TroNhanh?</p>
            <h2 className="text-4xl md:text-5xl font-black text-zinc-900 dark:text-white tracking-tight leading-tight">
              Trải nghiệm tìm nhà<br />
              <span className="text-zinc-400 dark:text-zinc-500 font-medium">theo cách bạn muốn.</span>
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: (
                  <svg className="w-7 h-7 text-zinc-900 dark:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
                  </svg>
                ),
                title: 'Bản đồ tương tác',
                desc: 'Tìm phòng theo vị trí chính xác — chọn khu vực, kéo thả pin, lọc theo bán kính. Không còn mò mẫm địa chỉ.',
                bg: 'bg-zinc-50 dark:bg-[#18181b] border-zinc-200 dark:border-zinc-800',
                accent: 'bg-zinc-200/50 dark:bg-zinc-800',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-emerald-600 dark:text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/>
                  </svg>
                ),
                title: 'Nhắn tin trực tiếp',
                desc: 'Liên hệ chủ trọ ngay trên nền tảng. Thương lượng, hẹn xem phòng — tất cả gói gọn trong một cuộc trò chuyện.',
                bg: 'bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200/50 dark:border-emerald-500/10',
                accent: 'bg-emerald-100 dark:bg-emerald-500/20',
              },
              {
                icon: (
                  <svg className="w-7 h-7 text-amber-600 dark:text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                  </svg>
                ),
                title: 'Kiểm duyệt nghiêm ngặt',
                desc: '100% tin đăng qua xét duyệt thủ công bởi đội ngũ Admin. Nói không với tin giả, hình ảnh giả mạo, giá ảo.',
                bg: 'bg-amber-50 dark:bg-amber-500/5 border-amber-200/50 dark:border-amber-500/10',
                accent: 'bg-amber-100 dark:bg-amber-500/20',
              },
            ].map((f, i) => (
              <div key={i} className={`group p-8 rounded-3xl border ${f.bg} hover:shadow-xl hover:shadow-zinc-200/40 dark:hover:shadow-black/40 hover:-translate-y-2 transition-all duration-300`}>
                <div className={`w-14 h-14 ${f.accent} rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  {f.icon}
                </div>
                <h3 className="text-xl font-black text-zinc-900 dark:text-white mb-3 tracking-tight">{f.title}</h3>
                <p className="text-zinc-600 dark:text-zinc-400 leading-relaxed font-light text-[15px]">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CTA BANNER
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-4 bg-zinc-900 dark:bg-[#111114] relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 pointer-events-none"/>
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-zinc-600/30 rounded-full blur-3xl translate-y-1/3 -translate-x-1/4 pointer-events-none"/>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight mb-6">
            Sẵn sàng tìm ngôi nhà<br />
            <span className="text-emerald-400">của riêng bạn?</span>
          </h2>
          <p className="text-zinc-400 text-lg font-light mb-10 leading-relaxed">
            Hàng nghìn phòng trọ đang chờ bạn khám phá ngay hôm nay. Miễn phí, không đăng ký vẫn xem được.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/search"
              className="px-10 py-4 bg-white text-zinc-900 font-black rounded-2xl hover:bg-zinc-100 transition-all duration-200 active:scale-[0.97] shadow-xl shadow-black/20 text-lg"
            >
              Khám phá bản đồ →
            </Link>
            <Link
              to="/register"
              className="px-10 py-4 bg-zinc-800 text-white font-bold rounded-2xl border border-zinc-700 hover:bg-zinc-700 hover:border-zinc-600 transition-all duration-200 active:scale-[0.97] text-lg"
            >
              Đăng phòng miễn phí
            </Link>
          </div>
        </div>
      </section>

      {/* ── All Keyframes ─────────────────────────────────── */}
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes slide-in-left {
          from { opacity: 0; transform: translateX(-32px); }
          to   { opacity: 1; transform: translateX(0); }
        }
        @keyframes badge-in {
          from { opacity: 0; transform: translateY(-12px) scale(0.9); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes map-reveal {
          from { opacity: 0; transform: scale(1.04); }
          to   { opacity: 1; transform: scale(1); }
        }
        @keyframes pin-enter {
          from { opacity: 0; transform: translateY(-20px) scale(0.5); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes pin-float {
          from { transform: translateY(0px); }
          to   { transform: translateY(-8px); }
        }
        @keyframes card-float {
          from { transform: translateY(0px); }
          to   { transform: translateY(-10px); }
        }
        @keyframes block-float {
          from { transform: translateY(0px); opacity: 0.5; }
          to   { transform: translateY(-4px); opacity: 1; }
        }
        .mask-image-bottom {
          -webkit-mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
          mask-image: linear-gradient(to bottom, black 50%, transparent 100%);
        }
      `}</style>
    </div>
  );
}
